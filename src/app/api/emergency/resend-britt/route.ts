import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { transporter, FROM_EMAIL } from "@/lib/mailer";

// EMERGENCY ENDPOINT: Remove after Britt confirms her email
export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || email !== "getfitbritt2517@icloud.com") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: trainer, error: findError } = await adminClient
    .from("trainers")
    .select("id, name, email, confirm_token")
    .eq("email", email.toLowerCase())
    .single();

  if (findError || !trainer) {
    return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
  }

  if (!trainer.confirm_token) {
    return NextResponse.json({ error: "No confirmation token" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fitcoach.vip";
  const confirmUrl = `${appUrl}/api/auth/confirm-email?token=${trainer.confirm_token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: trainer.email,
      subject: "Confirmá tu cuenta en FitCoach",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#111827;margin-top:0">Bienvenido/a a FitCoach, ${trainer.name.split(" ")[0]}!</h2>
          <p style="color:#374151">Para activar tu cuenta y comenzar tu prueba gratuita de 14 días, confirmá tu email haciendo clic en el botón de abajo.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${confirmUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
              Confirmar mi cuenta
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">Si el botón no funciona, copiá este enlace en tu navegador:<br/><a href="${confirmUrl}" style="color:#4f46e5">${confirmUrl}</a></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="color:#9ca3af;font-size:12px;margin:0">FitCoach · Este enlace expira en 48 horas.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, message: "Email sent to Britt" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
