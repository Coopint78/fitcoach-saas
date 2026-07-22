import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transporter, FROM_EMAIL } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // 1. Session reminders: sessions in the next 24 hours
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select("*, client:clients(name, email), trainer:trainers(business_name, user_id)")
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in24h.toISOString());

  let sessionRemindersSent = 0;
  for (const s of upcomingSessions ?? []) {
    const sessionDate = new Date(s.scheduled_at);
    const dateStr = sessionDate.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
    const timeStr = sessionDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const trainerName = s.trainer?.business_name ?? "Tu entrenador";
    const clientEmail = s.client?.email;
    if (!clientEmail) continue;

    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: clientEmail,
        subject: `Recordatorio: sesión mañana a las ${timeStr}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#4f46e5">Recordatorio de sesión</h2>
            <p>Hola <strong>${s.client?.name ?? "cliente"}</strong>,</p>
            <p>Te recordamos que tenés una sesión de coaching agendada:</p>
            <div style="background:#f5f3ff;border-radius:12px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0"><strong>📅 ${dateStr}</strong></p>
              <p style="margin:4px 0"><strong>🕐 ${timeStr}</strong></p>
              <p style="margin:4px 0"><strong>⏱ ${s.duration_minutes} minutos</strong></p>
              ${s.title ? `<p style="margin:4px 0"><strong>📝 ${s.title}</strong></p>` : ""}
              <p style="margin:4px 0">Con: <strong>${trainerName}</strong></p>
            </div>
            <p style="color:#6b7280;font-size:13px">Este es un mensaje automático de FitCoach.</p>
          </div>
        `,
      });
      sessionRemindersSent++;
    } catch (e) {
      console.error("Error sending session reminder:", e);
    }
  }

  // 2. Inactivity reminders: clients with no progress logged in 7+ days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: inactiveClients } = await supabase
    .from("clients")
    .select("id, name, email, trainer:trainers(business_name)")
    .lt("updated_at", sevenDaysAgo);

  let inactivityRemindersSent = 0;
  for (const c of inactiveClients ?? []) {
    if (!c.email) continue;
    const trainerName = (c.trainer as { business_name?: string } | null)?.business_name ?? "Tu entrenador";
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: c.email,
        subject: "¿Todo bien? Tu entrenador te espera en FitCoach",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#4f46e5">¡Seguí con tu entrenamiento!</h2>
            <p>Hola <strong>${c.name}</strong>,</p>
            <p>Notamos que hace unos días no registrás actividad en FitCoach. ${trainerName} tiene tus rutinas listas para vos.</p>
            <div style="margin:24px 0;text-align:center;">
              <a href="https://fit-coach.vip/portal" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                Ir a mis rutinas
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px">Este es un mensaje automático de FitCoach. Para desuscribirte respondé este email.</p>
          </div>
        `,
      });
      inactivityRemindersSent++;
    } catch (e) {
      console.error("Error sending inactivity reminder:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    sessionRemindersSent,
    inactivityRemindersSent,
  });
}
