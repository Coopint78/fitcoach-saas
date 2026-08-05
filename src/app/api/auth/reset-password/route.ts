import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple in-memory rate limiter
const resetAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 attempts per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = resetAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    resetAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (attempt.count >= RATE_LIMIT_MAX) {
    return false;
  }

  attempt.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  // Rate limiting by IP
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  // Password must be 12+ chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json({
      error: "La contraseña debe tener 12+ caracteres con mayúscula, número y carácter especial (@$!%*?&)"
    }, { status: 400 });
  }

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
