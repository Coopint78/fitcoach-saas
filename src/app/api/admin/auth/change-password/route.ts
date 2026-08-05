import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSafeErrorMessage, isValidEmail } from "@/lib/error-safe";
import { validateStringLength } from "@/lib/validation";

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

  let email, newPassword;
  try {
    const body = await request.json();
    if (!body.email || !body.newPassword) throw new Error("Missing fields");
    if (!isValidEmail(body.email)) throw new Error("Invalid email");
    email = body.email;
    newPassword = validateStringLength(body.newPassword, "password", 12, 255);
  } catch (err) {
    return NextResponse.json({ error: getSafeErrorMessage(err) }, { status: 400 });
  }

  // Validate password strength: 12+ chars, uppercase, number, special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(newPassword)) {
    return NextResponse.json({
      error: "Contraseña debe tener 12+ caracteres con mayúscula, número y carácter especial"
    }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const supabase = adminSupabase();
  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
