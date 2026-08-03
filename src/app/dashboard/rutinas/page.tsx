import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import RutinasPageView from "@/components/RutinasPageView";

export default async function RutinasPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/login");

  const { rows: routines } = await pool.query(
    `SELECT r.id, r.name, COUNT(ri.id)::int AS item_count
     FROM routines r
     LEFT JOIN routine_items ri ON ri.routine_id = r.id
     WHERE r.trainer_id = $1
     GROUP BY r.id
     ORDER BY r.created_at DESC`,
    [trainer.id]
  );

  return (
    <RutinasPageView
      routines={routines.map(r => ({
        id: r.id,
        name: r.name,
        routine_items: [{ count: r.item_count }],
      }))}
    />
  );
}
