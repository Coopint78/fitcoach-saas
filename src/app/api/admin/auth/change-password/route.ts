import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { verifyAdminSession } from "@/lib/admin/auth";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { email, newPassword } = await request.json();
  if (!email || !newPassword) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const supabase = adminSupabase();
  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
