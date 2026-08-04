import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { transporter, FROM_EMAIL } from "@/lib/mailer";
import crypto from "crypto";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getLanguageFromRequestSync } from "@/lib/i18n/server";
import { getConfirmEmailTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per minute per IP
  if (!checkRateLimit(req, 5, 60 * 1000)) {
    return rateLimitResponse();
  }

  const { name, email, password, referrerUsername } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Password must be 12+ chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json({
      error: "Password must be 12+ characters with uppercase letter, number, and special character (@$!%*?&)"
    }, { status: 400 });
  }

  // Use admin client to create user with email already confirmed (bypasses SMTP)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "trainer" },
  });

  if (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) return NextResponse.json({ error: "User creation failed" }, { status: 500 });

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const confirmToken = crypto.randomBytes(32).toString("hex");

  // Find referrer trainer if username provided
  let referredByTrainerId: string | null = null;
  if (referrerUsername) {
    const { data: referrer } = await adminClient
      .from("trainers")
      .select("id")
      .eq("username", referrerUsername.toLowerCase())
      .single();
    if (referrer) {
      referredByTrainerId = referrer.id;
    }
  }

  const { error: trainerError } = await adminClient
    .from("trainers")
    .upsert(
      {
        user_id: userId,
        name,
        email,
        trial_ends_at: trialEndsAt,
        subscription_status: "trialing",
        confirm_token: confirmToken,
        confirmed_at: null,
        referred_by_trainer_id: referredByTrainerId,
      },
      { onConflict: "user_id" }
    );

  if (trainerError) {
    await adminClient.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Registration failed, please try again" }, { status: 500 });
  }

  // Send confirmation email to trainer
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fitcoach.app";
  const confirmUrl = `${appUrl}/api/auth/confirm-email?token=${confirmToken}`;
  try {
    const acceptLang = req.headers.get("accept-language");
    const lang = getLanguageFromRequestSync(acceptLang);
    const { subject, html } = getConfirmEmailTemplate(lang, { name, confirmUrl });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });
  } catch (_mailErr) {
    // Don't block registration if email fails — user can request resend
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const now = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: "Nuevo entrenador registrado en FitCoach",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="color:#111827;margin-top:0">Nuevo entrenador registrado</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px">Nombre</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Fecha</td><td style="padding:8px 0">${now}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
            <p style="color:#6b7280;font-size:13px;margin:0">FitCoach · Panel de administración</p>
          </div>
        `,
      });
    } catch (_mailErr) {
      // Silently ignore admin email failure
    }
  }

  return NextResponse.json({ ok: true });
}
