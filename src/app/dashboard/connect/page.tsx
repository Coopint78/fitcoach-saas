import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import ConnectView from "@/components/ConnectView";

export default async function ConnectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT id, connect_account_id, connect_enabled, coaching_price_cents FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/login");

  const { rows: clients } = await pool.query(
    `SELECT id, name, email, coaching_subscription_status FROM clients WHERE trainer_id = $1`,
    [trainer.id]
  );

  return <ConnectView trainer={trainer} clients={clients} />;
}
