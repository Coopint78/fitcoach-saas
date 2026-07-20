import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer?.stripe_customer_id) return NextResponse.json({ error: "No customer" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: trainer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`,
  });

  return NextResponse.json({ url: session.url });
}
