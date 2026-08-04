import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows: trainerRows } = await pool.query(
      `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [session.user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? new Date().toISOString();
    const to = searchParams.get("to") ?? new Date(Date.now() + 30 * 86400000).toISOString();

    const { rows } = await pool.query(
      `SELECT s.*,
        json_build_object('id', c.id, 'name', c.name, 'email', c.email) AS client
       FROM sessions s
       LEFT JOIN clients c ON c.id = s.client_id
       WHERE s.trainer_id = $1 AND s.scheduled_at >= $2 AND s.scheduled_at <= $3
       ORDER BY s.scheduled_at ASC`,
      [trainer.id, from, to]
    );
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows: trainerRows } = await pool.query(
      `SELECT id, session_duration_minutes FROM trainers WHERE user_id = $1 LIMIT 1`,
      [session.user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

    const body = await request.json();
    const { client_id, scheduled_at, duration_minutes, title, notes } = body;

    if (!client_id || !scheduled_at) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Verify client belongs to this trainer
    const { rows: clientRows } = await pool.query(
      `SELECT id FROM clients WHERE id = $1 AND trainer_id = $2 LIMIT 1`,
      [client_id, trainer.id]
    );
    if (!clientRows.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { rows } = await pool.query(
      `INSERT INTO sessions (trainer_id, client_id, scheduled_at, duration_minutes, title, notes, status, requested_by, confirmed_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', 'trainer', $7)
       RETURNING *`,
      [
        trainer.id,
        client_id,
        scheduled_at,
        duration_minutes ?? trainer.session_duration_minutes ?? 60,
        title ?? null,
        notes ?? null,
        new Date().toISOString(),
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
