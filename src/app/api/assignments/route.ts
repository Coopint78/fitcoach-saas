import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0];
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { routine_id, client_id } = await req.json();
  if (!routine_id || !client_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify trainer owns the routine and the client
  const { rows: routineRows } = await pool.query(
    `SELECT id FROM routines WHERE id = $1 AND trainer_id = $2 LIMIT 1`,
    [routine_id, trainer.id]
  );
  if (!routineRows.length) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const { rows: clientRows } = await pool.query(
    `SELECT id FROM clients WHERE id = $1 AND trainer_id = $2 LIMIT 1`,
    [client_id, trainer.id]
  );
  if (!clientRows.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Check if already assigned
  const { rows: existing } = await pool.query(
    `SELECT id FROM assignments WHERE routine_id = $1 AND client_id = $2 LIMIT 1`,
    [routine_id, client_id]
  );
  if (existing.length) return NextResponse.json({ error: "Already assigned" }, { status: 409 });

  const { rows } = await pool.query(
    `INSERT INTO assignments (routine_id, client_id) VALUES ($1, $2) RETURNING id`,
    [routine_id, client_id]
  );

  return NextResponse.json({ id: rows[0].id });
}
