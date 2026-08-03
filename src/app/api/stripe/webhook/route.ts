import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import pool from "@/lib/db";
import { transporter, FROM_EMAIL } from "@/lib/mailer";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Connect: trainer completed onboarding
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    if (account.charges_enabled && account.payouts_enabled) {
      await pool.query(
        `UPDATE trainers SET connect_enabled = true WHERE connect_account_id = $1`,
        [account.id]
      );
    }
    return NextResponse.json({ received: true });
  }

  // Subscription events
  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    const sub = event.data.object as Stripe.Subscription;
    const clientId = sub.metadata?.client_id;

    if (event.type === "customer.subscription.deleted") {
      if (clientId) {
        await pool.query(`UPDATE clients SET coaching_subscription_status = 'canceled' WHERE id = $1`, [clientId]);
      } else {
        await pool.query(
          `UPDATE trainers SET subscription_status = 'canceled' WHERE stripe_customer_id = $1`,
          [sub.customer as string]
        );
      }
    } else {
      if (clientId) {
        await pool.query(
          `UPDATE clients SET coaching_subscription_id = $1, coaching_subscription_status = $2 WHERE id = $3`,
          [sub.id, sub.status, clientId]
        );
      } else {
        const priceId = sub.items.data[0]?.price?.id;
        const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
        let status: string = sub.status;
        if (sub.status === "active" && starterPriceId && priceId === starterPriceId) {
          status = "starter";
        } else if (sub.status === "active") {
          status = "active"; // Pro
        }
        await pool.query(
          `UPDATE trainers SET stripe_subscription_id = $1, subscription_status = $2 WHERE stripe_customer_id = $3`,
          [sub.id, status, sub.customer as string]
        );
      }
    }
  }

  // Trial ending in 3 days — send reminder email
  if (event.type === "customer.subscription.trial_will_end") {
    const sub = event.data.object as Stripe.Subscription;
    if (!sub.metadata?.client_id) {
      const { rows } = await pool.query(
        `SELECT name, email FROM trainers WHERE stripe_customer_id = $1 LIMIT 1`,
        [sub.customer as string]
      );
      const trainer = rows[0];
      if (trainer) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fit-coach.vip";
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: trainer.email,
          subject: "Tu prueba gratuita de FitCoach vence en 3 días",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
              <h2 style="color:#111827;margin-top:0">Hola ${trainer.name.split(" ")[0]},</h2>
              <p style="color:#374151">Tu prueba gratuita de FitCoach vence en <strong>3 días</strong>. Para continuar usando la plataforma sin interrupciones, activá tu suscripción.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${appUrl}/dashboard/suscripcion" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
                  Ver planes y precios
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p style="color:#9ca3af;font-size:12px;margin:0">FitCoach · fit-coach.vip</p>
            </div>
          `,
        }).catch((e) => console.error("Trial reminder email failed:", e));
      }
    }
  }

  // Failed payment — notify trainer
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (customerId) {
      const { rows } = await pool.query(
        `SELECT name, email FROM trainers WHERE stripe_customer_id = $1 LIMIT 1`,
        [customerId]
      );
      const trainer = rows[0];
      if (trainer) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fit-coach.vip";
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: trainer.email,
          subject: "Problema con el pago de tu suscripción FitCoach",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
              <h2 style="color:#111827;margin-top:0">Hola ${trainer.name.split(" ")[0]},</h2>
              <p style="color:#374151">No pudimos procesar el pago de tu suscripción. Por favor actualizá tu método de pago para evitar la interrupción del servicio.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${appUrl}/dashboard/suscripcion" style="background:#dc2626;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
                  Actualizar método de pago
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p style="color:#9ca3af;font-size:12px;margin:0">FitCoach · fit-coach.vip</p>
            </div>
          `,
        }).catch((e) => console.error("Payment failed email failed:", e));
      }
    }
  }

  return NextResponse.json({ received: true });
}
