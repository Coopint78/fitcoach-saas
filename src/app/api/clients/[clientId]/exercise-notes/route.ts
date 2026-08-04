import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

async function getTrainer(userId: string) {
  const { rows } = await pool.query(`SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`, [userId]);
  return rows[0] ?? null;
}

async function verifyClientOwnership(trainerId: string, clientId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT id FROM clients WHERE id = $1 AND trainer_id = $2 LIMIT 1`,
    [clientId, trainerId]
  );
  return rows.length > 0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainer = await getTrainer(user.id);
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!await verifyClientOwnership(trainer.id, clientId))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { rows } = await pool.query(
    `SELECT routine_item_id, notes, updated_at FROM routine_item_notes WHERE client_id = $1`,
    [clientId]
  );
  return NextResponse.json({ notes: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainer = await getTrainer(user.id);
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!await verifyClientOwnership(trainer.id, clientId))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { routine_item_id, notes } = body as { routine_item_id: string; notes: string };
  if (!routine_item_id) return NextResponse.json({ error: "Missing routine_item_id" }, { status: 400 });

  if (!notes || notes.trim() === "") {
    // Delete note if empty
    await pool.query(
      `DELETE FROM routine_item_notes WHERE routine_item_id = $1 AND client_id = $2`,
      [routine_item_id, clientId]
    );
  } else {
    await pool.query(
      `INSERT INTO routine_item_notes (routine_item_id, client_id, notes, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (routine_item_id, client_id) DO UPDATE SET notes = $3, updated_at = now()`,
      [routine_item_id, clientId, notes.trim()]
    );
  }

  return NextResponse.json({ ok: true });
}
