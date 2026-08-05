import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { validateUUID } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    validateUUID(id, "id");
  } catch {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

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

    const body = await request.json();
    const allowed = ["status", "title", "notes", "scheduled_at", "duration_minutes", "completed_at", "client_rating", "client_note"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    if (body.status === "completed") updates.completed_at = new Date().toISOString();

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`);
    const values = [id, trainer.id, ...Object.values(updates)];
    const { rows } = await pool.query(
      `UPDATE sessions SET ${setClauses.join(", ")} WHERE id = $1 AND trainer_id = $2 RETURNING *`,
      values
    );
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

    await pool.query(`DELETE FROM sessions WHERE id = $1 AND trainer_id = $2`, [id, trainer.id]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
