import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transporter, FROM_EMAIL } from "@/lib/mailer";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  // Find user
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: "Error interno" }, { status: 500 });

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this user
  await supabaseAdmin.from("password_reset_tokens").delete().eq("user_id", user.id);

  // Save token
  await supabaseAdmin.from("password_reset_tokens").insert({
    user_id: user.id,
    token,
    expires_at: expiresAt.toISOString(),
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Restablecer contraseña — FitCoach",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#4f46e5">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en FitCoach.</p>
        <p>Hacé clic en el botón para crear una nueva contraseña:</p>
        <div style="margin:24px 0;text-align:center;">
          <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px">Este link expira en 1 hora. Si no solicitaste este cambio, ignorá este email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
