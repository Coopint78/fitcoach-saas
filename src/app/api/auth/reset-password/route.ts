import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

  // Find token
  const { data: resetToken, error } = await supabaseAdmin
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (error || !resetToken) return NextResponse.json({ error: "Link inválido o expirado" }, { status: 400 });

  if (new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "El link expiró. Solicitá uno nuevo." }, { status: 400 });
  }

  // Update password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(resetToken.user_id, { password });
  if (updateError) return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 });

  // Mark token as used
  await supabaseAdmin.from("password_reset_tokens").update({ used_at: new Date().toISOString() }).eq("id", resetToken.id);

  return NextResponse.json({ ok: true });
}
