import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

async function getTrainerId(userId: string): Promise<string | null> {
  const { rows } = await pool.query(`SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`, [userId]);
  return rows[0]?.id ?? null;
}

// GET /api/sessions/blocked — list blocked slots for the authenticated trainer
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const trainerId = await getTrainerId(user.id);
    if (!trainerId) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const today = new Date().toISOString().split("T")[0];
    const { rows } = await pool.query(
      `SELECT * FROM trainer_blocked_slots
       WHERE trainer_id = $1 AND blocked_date >= $2
       ORDER BY blocked_date ASC, start_time ASC`,
      [trainerId, today]
    );
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/sessions/blocked — create a blocked slot
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const trainerId = await getTrainerId(user.id);
    if (!trainerId) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    const body = await req.json();
    const { blocked_date, start_time, end_time, note } = body;
    if (!blocked_date) return NextResponse.json({ error: "blocked_date required" }, { status: 400 });

    const { rows } = await pool.query(
      `INSERT INTO trainer_blocked_slots (trainer_id, blocked_date, start_time, end_time, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [trainerId, blocked_date, start_time || null, end_time || null, note || null]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE /api/sessions/blocked?id=xxx — delete a blocked slot
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await pool.query(`DELETE FROM trainer_blocked_slots WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
