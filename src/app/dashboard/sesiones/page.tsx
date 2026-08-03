import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import SessionsView from "@/components/SessionsView";
import AvailabilityEditor from "@/components/AvailabilityEditor";

export default async function SesionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/dashboard");

  const { rows: clients } = await pool.query(
    `SELECT id, name, email FROM clients WHERE trainer_id = $1 ORDER BY name`,
    [trainer.id]
  );

  return (
    <div className="space-y-12">
      <SessionsView clients={clients} />
      <hr className="border-border" />
      <AvailabilityEditor />
    </div>
  );
}
