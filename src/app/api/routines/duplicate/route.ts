import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { routine_id, new_name } = await req.json();

    const { rows: trainerRows } = await pool.query(
      `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    // Fetch source routine (must belong to this trainer)
    const { rows: sourceRows } = await pool.query(
      `SELECT id, name, description FROM routines WHERE id = $1 AND trainer_id = $2 LIMIT 1`,
      [routine_id, trainer.id]
    );
    const source = sourceRows[0] ?? null;
    if (!source) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

    const { rows: itemRows } = await pool.query(
      `SELECT exercise_id, sets, reps, "order" FROM routine_items WHERE routine_id = $1`,
      [routine_id]
    );
    const items = itemRows as { exercise_id: string; sets: number; reps: string; order: number }[];

    // Create new routine
    const { rows: newRoutineRows } = await pool.query(
      `INSERT INTO routines (trainer_id, name, description) VALUES ($1, $2, $3) RETURNING id, name`,
      [trainer.id, new_name ?? `${source.name} (copia)`, source.description ?? null]
    );
    const newRoutine = newRoutineRows[0];

    // Copy items
    if (items.length > 0) {
      const valuePlaceholders = items
        .map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`)
        .join(", ");
      const params: unknown[] = [newRoutine.id];
      for (const item of items) {
        params.push(item.exercise_id, item.sets, item.reps, item.order);
      }
      await pool.query(
        `INSERT INTO routine_items (routine_id, exercise_id, sets, reps, "order") VALUES ${valuePlaceholders}`,
        params
      );
    }

    return NextResponse.json({ id: newRoutine.id, name: newRoutine.name });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
