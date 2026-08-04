import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transporter, FROM_EMAIL } from "@/lib/mailer";
import crypto from "crypto";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getLanguageFromRequestSync } from "@/lib/i18n/server";
import { getPasswordResetTemplate } from "@/lib/email-templates";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Rate limit: 3 forgot-password requests per minute per IP (brute force protection)
  if (!checkRateLimit(request, 3, 60 * 1000)) {
    return rateLimitResponse();
  }

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

  const acceptLang = request.headers.get("accept-language");
  const lang = getLanguageFromRequestSync(acceptLang);
  const { subject, html } = getPasswordResetTemplate(lang, { resetUrl });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
  });

  return NextResponse.json({ ok: true });
}
