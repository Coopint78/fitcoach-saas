import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SubscriptionView from "@/components/SubscriptionView";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  return (
    <SubscriptionView
      trainerId={trainer.id}
      subscriptionStatus={trainer.subscription_status}
      trialEndsAt={trainer.trial_ends_at ?? null}
      stripeCustomerId={trainer.stripe_customer_id ?? null}
    />
  );
}
