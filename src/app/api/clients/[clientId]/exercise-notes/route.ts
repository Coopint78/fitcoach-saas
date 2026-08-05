import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { validateUUID, validateStringLength, getSafeErrorMessage } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

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
  try {
    validateUUID(clientId, "clientId");
  } catch {
    return NextResponse.json({ error: "Invalid clientId format" }, { status: 400 });
  }

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
  // Rate limit: 20 note updates per minute per IP
  if (!checkRateLimit(req, 20, 60 * 1000)) {
    return rateLimitResponse();
  }

  const { clientId } = await params;
  try {
    validateUUID(clientId, "clientId");
  } catch {
    return NextResponse.json({ error: "Invalid clientId format" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainer = await getTrainer(user.id);
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!await verifyClientOwnership(trainer.id, clientId))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let routine_item_id, notes;
  try {
    const body = await req.json();
    routine_item_id = validateUUID(body.routine_item_id, "routine_item_id");
    if (body.notes) notes = validateStringLength(body.notes, "notes", 1, 1000);
  } catch (err) {
    return NextResponse.json({ error: getSafeErrorMessage(err) }, { status: 400 });
  }

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
