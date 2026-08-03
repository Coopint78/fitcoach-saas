import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transporter, FROM_EMAIL } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const supabase = await createClient();
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "trainer" },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Register error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message ?? error.code ?? JSON.stringify(error) }, { status: 400 });
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
