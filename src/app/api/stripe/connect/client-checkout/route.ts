import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PLATFORM_FEE_PERCENT = 5;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { client_id } = await req.json();

    const { rows } = await pool.query(
      `SELECT c.*,
        json_build_object(
          'connect_account_id', t.connect_account_id,
          'connect_enabled', t.connect_enabled,
          'coaching_price_cents', t.coaching_price_cents,
          'name', t.name,
          'email', t.email
        ) AS trainers
       FROM clients c
       JOIN trainers t ON t.id = c.trainer_id
       WHERE c.id = $1
       LIMIT 1`,
      [client_id]
    );
    const client = rows[0] ?? null;
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const trainer = client.trainers as {
      connect_account_id: string;
      connect_enabled: boolean;
      coaching_price_cents: number;
      name: string;
      email: string;
    };

    if (!trainer.connect_enabled || !trainer.connect_account_id)
      return NextResponse.json({ error: "Trainer Stripe account not connected" }, { status: 400 });

    if (!trainer.coaching_price_cents || trainer.coaching_price_cents < 100)
      return NextResponse.json({ error: "Trainer has not set a coaching price" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    let customerId = client.coaching_stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create(
        { email: client.email, name: client.name, metadata: { client_id: client.id } },
        { stripeAccount: trainer.connect_account_id }
      );
      customerId = customer.id;
      await pool.query(`UPDATE clients SET coaching_stripe_customer_id = $1 WHERE id = $2`, [customerId, client.id]);
    }

    const price = await stripe.prices.create(
      {
        unit_amount: trainer.coaching_price_cents,
        currency: "usd",
        recurring: { interval: "month" },
        product_data: { name: `Coaching — ${trainer.name}` },
      },
      { stripeAccount: trainer.connect_account_id }
    );

    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        subscription_data: { application_fee_percent: PLATFORM_FEE_PERCENT, metadata: { client_id: client.id, trainer_connect_id: trainer.connect_account_id } },
        success_url: `${appUrl}/portal?coaching_success=1`,
        cancel_url: `${appUrl}/portal?coaching_canceled=1`,
      },
      { stripeAccount: trainer.connect_account_id }
    );

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
