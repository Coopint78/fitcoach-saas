import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  let accountId = trainer.connect_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: trainer.email,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { product_description: "Entrenamiento personal online" },
      metadata: { trainer_id: trainer.id },
    });
    accountId = account.id;
    await supabase.from("trainers").update({ connect_account_id: accountId }).eq("id", trainer.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/connect/onboard`,
    return_url: `${appUrl}/dashboard/connect/return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
