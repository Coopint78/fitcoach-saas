import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === "account.updated") {
    // Connect: trainer completed onboarding
    const account = event.data.object as Stripe.Account;
    if (account.charges_enabled && account.payouts_enabled) {
      await supabase
        .from("trainers")
        .update({ connect_enabled: true })
        .eq("connect_account_id", account.id);
    }
    return NextResponse.json({ received: true });
  }

  const sub = event.data.object as Stripe.Subscription;
  const clientId = sub.metadata?.client_id;

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    if (clientId) {
      // Connect: client paying trainer
      await supabase
        .from("clients")
        .update({ coaching_subscription_id: sub.id, coaching_subscription_status: sub.status })
        .eq("id", clientId);
    } else {
      // Platform: trainer paying FitCoach
      const priceId = sub.items.data[0]?.price?.id;
      const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
      let status: string = sub.status;
      if (sub.status === "active" && starterPriceId && priceId === starterPriceId) {
        status = "starter";
      }
      await supabase
        .from("trainers")
        .update({ stripe_subscription_id: sub.id, subscription_status: status })
        .eq("stripe_customer_id", sub.customer as string);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    if (clientId) {
      await supabase
        .from("clients")
        .update({ coaching_subscription_status: "canceled" })
        .eq("id", clientId);
    } else {
      await supabase
        .from("trainers")
        .update({ subscription_status: "canceled" })
        .eq("stripe_customer_id", sub.customer as string);
    }
  }

  return NextResponse.json({ received: true });
}
