import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

// GET /api/progress/comparisons?client_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT cpc.*,
        json_build_object('id', pb.id, 'url', pb.url, 'taken_at', pb.taken_at, 'note', pb.note) AS before,
        json_build_object('id', pa.id, 'url', pa.url, 'taken_at', pa.taken_at, 'note', pa.note) AS after
       FROM client_photo_comparisons cpc
       LEFT JOIN client_photos pb ON pb.id = cpc.photo_before_id
       LEFT JOIN client_photos pa ON pa.id = cpc.photo_after_id
       WHERE cpc.client_id = $1
       ORDER BY cpc.created_at DESC`,
      [clientId]
    );
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/progress/comparisons — create a comparison
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows: trainerRows } = await pool.query(
      `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 403 });

    const { client_id, photo_before_id, photo_after_id } = await req.json();
    if (!client_id || !photo_before_id || !photo_after_id)
      return NextResponse.json({ error: "client_id, photo_before_id and photo_after_id required" }, { status: 400 });

    const { rows: insertRows } = await pool.query(
      `INSERT INTO client_photo_comparisons (client_id, trainer_id, photo_before_id, photo_after_id, shared_with_client)
       VALUES ($1, $2, $3, $4, false) RETURNING id`,
      [client_id, trainer.id, photo_before_id, photo_after_id]
    );
    const newId = insertRows[0].id;

    const { rows } = await pool.query(
      `SELECT cpc.*,
        json_build_object('id', pb.id, 'url', pb.url, 'taken_at', pb.taken_at, 'note', pb.note) AS before,
        json_build_object('id', pa.id, 'url', pa.url, 'taken_at', pa.taken_at, 'note', pa.note) AS after
       FROM client_photo_comparisons cpc
       LEFT JOIN client_photos pb ON pb.id = cpc.photo_before_id
       LEFT JOIN client_photos pa ON pa.id = cpc.photo_after_id
       WHERE cpc.id = $1
       LIMIT 1`,
      [newId]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH /api/progress/comparisons — toggle shared_with_client
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, shared_with_client } = await req.json();
  if (!id || shared_with_client === undefined)
    return NextResponse.json({ error: "id and shared_with_client required" }, { status: 400 });

  try {
    await pool.query(
      `UPDATE client_photo_comparisons SET shared_with_client = $1 WHERE id = $2`,
      [shared_with_client, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE /api/progress/comparisons
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await pool.query(`DELETE FROM client_photo_comparisons WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
