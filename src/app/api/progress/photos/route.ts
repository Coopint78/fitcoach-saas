import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fit-coach.vip";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  try {
    // Verify trainer owns this client
    const { rows: clientRows } = await pool.query(
      `SELECT id FROM clients WHERE id = $1 AND trainer_id = (SELECT id FROM trainers WHERE user_id = $2 LIMIT 1) LIMIT 1`,
      [clientId, user.id]
    );
    if (clientRows.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { rows } = await pool.query(
      `SELECT * FROM client_photos WHERE client_id = $1 ORDER BY taken_at DESC`,
      [clientId]
    );
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("client_id") as string | null;
    const takenAt = formData.get("taken_at") as string | null;
    const note = formData.get("note") as string | null;

    if (!file || !clientId) return NextResponse.json({ error: "file and client_id required" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10 MB" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const relativePath = `${user.id}/${clientId}/${Date.now()}.${ext}`;
    const fullPath = path.join(UPLOADS_DIR, relativePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `${APP_URL}/uploads/${relativePath}`;

    const { rows } = await pool.query(
      `INSERT INTO client_photos (client_id, trainer_id, url, taken_at, note, shared_with_client)
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [clientId, trainer.id, publicUrl, takenAt || new Date().toISOString().split("T")[0], note || null]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, shared_with_client, note } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    // Verify user owns this photo
    const { rows: photoRows } = await pool.query(
      `SELECT id FROM client_photos WHERE id = $1 AND trainer_id = (SELECT id FROM trainers WHERE user_id = $2 LIMIT 1) LIMIT 1`,
      [id, user.id]
    );
    if (photoRows.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: Record<string, unknown> = {};
    if (shared_with_client !== undefined) updates.shared_with_client = shared_with_client;
    if (note !== undefined) updates.note = note;

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`);
    const values = [id, ...Object.values(updates)];
    await pool.query(`UPDATE client_photos SET ${setClauses.join(", ")} WHERE id = $1`, values);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    // Verify user owns this photo
    const { rows } = await pool.query(
      `SELECT url FROM client_photos WHERE id = $1 AND trainer_id = (SELECT id FROM trainers WHERE user_id = $2 LIMIT 1) LIMIT 1`,
      [id, user.id]
    );
    const photo = rows[0] ?? null;
    if (!photo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await pool.query(`DELETE FROM client_photos WHERE id = $1`, [id]);

    if (photo?.url) {
      const urlPath = new URL(photo.url).pathname.replace("/uploads/", "");
      const fullPath = path.join(UPLOADS_DIR, urlPath);
      await fs.unlink(fullPath).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
