import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardView from "@/components/DashboardView";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT * FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/login");
  if (!trainer.confirmed_at) redirect("/verificar-email");

  const [clientRes, routineRes, exerciseRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM clients WHERE trainer_id = $1`, [trainer.id]),
    pool.query(`SELECT COUNT(*) FROM routines WHERE trainer_id = $1`, [trainer.id]),
    pool.query(`SELECT COUNT(*) FROM exercises WHERE trainer_id = $1`, [trainer.id]),
  ]);

  const clientCount = parseInt(clientRes.rows[0].count, 10);
  const routineCount = parseInt(routineRes.rows[0].count, 10);
  const exerciseCount = parseInt(exerciseRes.rows[0].count, 10);

  const trialEnds = trainer.trial_ends_at ? new Date(trainer.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;
  const isTrialing = trainer.subscription_status === "trialing";
  const firstName = trainer.name.split(" ")[0];

  return (
    <DashboardView
      firstName={firstName}
      clientCount={clientCount}
      routineCount={routineCount}
      exerciseCount={exerciseCount}
      isTrialing={isTrialing}
      daysLeft={daysLeft}
    />
  );
}
