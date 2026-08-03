import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin/auth";
import pool from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminSession(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Get user_id before deleting trainer row
    const { rows } = await pool.query(`SELECT user_id FROM trainers WHERE id = $1 LIMIT 1`, [id]);
    const trainer = rows[0];
    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    // Delete trainer row (cascades to clients, routines, etc. via DB FK)
    await pool.query(`DELETE FROM trainers WHERE id = $1`, [id]);

    // Delete Supabase Auth user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await supabaseAdmin.auth.admin.deleteUser(trainer.user_id);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Delete trainer error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
