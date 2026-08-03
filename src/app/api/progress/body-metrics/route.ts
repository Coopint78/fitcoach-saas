import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_id, weight_kg, waist_cm, hips_cm, chest_cm, notes, photo_url } = await req.json();

  try {
    // Verify the client belongs to this user (as client or trainer)
    const { rows: clientRows } = await pool.query(
      `SELECT id FROM clients
       WHERE id = $1
         AND (user_id = $2 OR trainer_id IN (SELECT id FROM trainers WHERE user_id = $2))
       LIMIT 1`,
      [client_id, user.id]
    );
    const clientRow = clientRows[0] ?? null;
    if (!clientRow) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { rows } = await pool.query(
      `INSERT INTO body_metrics (client_id, weight_kg, waist_cm, hips_cm, chest_cm, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        client_id,
        weight_kg ?? null,
        waist_cm ?? null,
        hips_cm ?? null,
        chest_cm ?? null,
        notes ?? null,
        photo_url ?? null,
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
