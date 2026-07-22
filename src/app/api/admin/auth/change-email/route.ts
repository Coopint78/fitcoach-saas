import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

  const { id, newEmail, first_name, last_name } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (newEmail) updates.email = newEmail;
  if (first_name !== undefined) updates.first_name = first_name || null;
  if (last_name !== undefined) updates.last_name = last_name || null;

  const supabase = adminSupabase();
  const { error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
