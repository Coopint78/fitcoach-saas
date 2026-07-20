import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  let customerId = trainer.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: trainer.email, name: trainer.name, metadata: { trainer_id: trainer.id } });
    customerId = customer.id;
    await supabase.from("trainers").update({ stripe_customer_id: customerId }).eq("id", trainer.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?canceled=1`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { trainer_id: trainer.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
