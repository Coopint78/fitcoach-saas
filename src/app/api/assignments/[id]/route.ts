import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0];
  if (!trainer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify trainer owns this assignment (via client ownership)
  const { rows } = await pool.query(
    `SELECT a.id FROM assignments a
     JOIN clients c ON c.id = a.client_id
     WHERE a.id = $1 AND c.trainer_id = $2 LIMIT 1`,
    [id, trainer.id]
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await pool.query(`DELETE FROM assignments WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
