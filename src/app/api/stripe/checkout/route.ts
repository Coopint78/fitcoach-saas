import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT * FROM trainers WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const trainer = rows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const plan = body.plan === "starter" ? "starter" : "pro";

    const priceId = plan === "starter"
      ? process.env.STRIPE_STARTER_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!;

    let customerId = trainer.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: trainer.email, name: trainer.name, metadata: { trainer_id: trainer.id } });
      customerId = customer.id;
      await pool.query(`UPDATE trainers SET stripe_customer_id = $1 WHERE id = $2`, [customerId, trainer.id]);
    }

    const planLabel = plan === "starter" ? "Starter" : "Pro";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?canceled=1`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { trainer_id: trainer.id },
        description: `FitCoach ${planLabel} - Plataforma para entrenadores personales`,
      },
      payment_intent_data: {
        statement_descriptor_suffix: `FITCOACH ${planLabel.toUpperCase()}`,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
