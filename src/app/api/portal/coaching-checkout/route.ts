import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const PLATFORM_FEE_PERCENT = 5;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("*, trainer:trainers(id, name, connect_account_id, connect_enabled, coaching_price_cents)")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const trainer = client.trainer as {
    id: string; name: string; connect_account_id: string;
    connect_enabled: boolean; coaching_price_cents: number;
  } | null;

  if (!trainer?.connect_enabled) return NextResponse.json({ error: "Trainer not accepting payments" }, { status: 400 });
  if (!trainer.coaching_price_cents || trainer.coaching_price_cents < 100) return NextResponse.json({ error: "No price set" }, { status: 400 });

  let customerId = client.coaching_stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create(
      { email: client.email, name: client.name, metadata: { client_id: client.id } },
      { stripeAccount: trainer.connect_account_id }
    );
    customerId = customer.id;
    await supabase.from("clients").update({ coaching_stripe_customer_id: customerId }).eq("id", client.id);
  }

  const price = await stripe.prices.create(
    { unit_amount: trainer.coaching_price_cents, currency: "usd", recurring: { interval: "month" }, product_data: { name: `Coaching mensual — ${trainer.name}` } },
    { stripeAccount: trainer.connect_account_id }
  );

  const session = await stripe.checkout.sessions.create(
    {
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: price.id, quantity: 1 }],
      subscription_data: {
        application_fee_percent: PLATFORM_FEE_PERCENT,
        metadata: { client_id: client.id, trainer_connect_id: trainer.connect_account_id },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal?coaching_success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal`,
    },
    { stripeAccount: trainer.connect_account_id }
  );

  return NextResponse.json({ url: session.url });
}
