import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import SubscriptionView from "@/components/SubscriptionView";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { rows } = await pool.query(
    `SELECT * FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = rows[0] ?? null;
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
