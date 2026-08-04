import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || (() => { throw new Error("ADMIN_JWT_SECRET not configured"); })()
);

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 login attempts per minute per IP (brute force protection)
  if (!checkRateLimit(request, 5, 60 * 1000)) {
    return rateLimitResponse();
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = adminSupabase();
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id, email, password_hash")
    .eq("email", email)
    .single();

  if (error || !adminUser) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const passwordOk = await bcrypt.compare(password, adminUser.password_hash);
  if (!passwordOk) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await new SignJWT({ email: adminUser.email, adminId: adminUser.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(ADMIN_JWT_SECRET);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return response;
}
