import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["bio", "specialty", "location", "instagram", "public_profile", "profile_photo"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  try {
    const setClauses = Object.keys(update).map((k, i) => `${k} = $${i + 2}`);
    const values = [user.id, ...Object.values(update)];
    await pool.query(`UPDATE trainers SET ${setClauses.join(", ")} WHERE user_id = $1`, values);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
