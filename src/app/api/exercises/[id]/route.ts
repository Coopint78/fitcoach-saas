import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0];
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify ownership — must be trainer's own exercise (not system library)
  const { rows: ownerRows } = await pool.query(
    `SELECT id FROM exercises WHERE id = $1 AND trainer_id = $2 AND (is_system IS NULL OR is_system = FALSE) LIMIT 1`,
    [id, trainer.id]
  );
  if (!ownerRows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Block deletion if exercise is used in any routine item
  const { rows: usedRows } = await pool.query(
    `SELECT ri.id FROM routine_items ri
     JOIN routines r ON r.id = ri.routine_id
     WHERE ri.exercise_id = $1 AND r.trainer_id = $2 LIMIT 1`,
    [id, trainer.id]
  );
  if (usedRows.length > 0) {
    return NextResponse.json({ error: "in_use" }, { status: 409 });
  }

  await pool.query(`DELETE FROM exercises WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
