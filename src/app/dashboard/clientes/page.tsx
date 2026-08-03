import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import ClientsView from "@/components/ClientsView";
import ClientesPageHeader from "@/components/ClientesPageHeader";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT id, subscription_status FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/login");

  const { rows: clients } = await pool.query(
    `SELECT id, name, email, goal, user_id, phone, birthdate, gender
     FROM clients
     WHERE trainer_id = $1
     ORDER BY created_at DESC`,
    [trainer.id]
  );

  return (
    <div className="space-y-6">
      <ClientesPageHeader count={clients.length} subscriptionStatus={trainer.subscription_status ?? "trialing"} />
      <ClientsView clients={clients} />
    </div>
  );
}
