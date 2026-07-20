import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, token } = await req.json();
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${token}`;

  // En producción, usar Resend/Sendgrid. Por ahora logueamos el link.
  console.log(`[INVITACIÓN] Para: ${name} <${email}> → ${inviteUrl}`);

  // Si tienes RESEND_API_KEY configurada, descomentar:
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     from: "FitCoach <noreply@tudominio.com>",
  //     to: email,
  //     subject: "Tu entrenador te invita a FitCoach",
  //     html: `<p>Hola ${name},</p><p>Tu entrenador te invita a ver tus rutinas en FitCoach.</p><p><a href="${inviteUrl}">Aceptar invitación</a></p>`,
  //   }),
  // });

  return NextResponse.json({ ok: true, inviteUrl });
}
