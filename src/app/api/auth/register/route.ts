import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { transporter, FROM_EMAIL } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
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
    console.error("Register error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) return NextResponse.json({ error: "User creation failed" }, { status: 500 });

  // Ensure trainer row exists (a DB trigger may already create it; upsert to also set trial fields)
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const { error: trainerError } = await adminClient
    .from("trainers")
    .upsert(
      { user_id: userId, name, email, trial_ends_at: trialEndsAt, subscription_status: "trialing" },
      { onConflict: "user_id" }
    );

  if (trainerError) {
    console.error("Trainer row error:", JSON.stringify(trainerError, Object.getOwnPropertyNames(trainerError)));
    await adminClient.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Registration failed, please try again" }, { status: 500 });
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
    } catch (mailErr) {
      console.error("Admin notification email failed:", mailErr);
    }
  }

  return NextResponse.json({ ok: true });
}
