import type { Lang } from "./i18n/translations";

interface ConfirmEmailParams {
  name: string;
  confirmUrl: string;
}

interface PasswordResetParams {
  resetUrl: string;
}

export function getConfirmEmailTemplate(lang: Lang, params: ConfirmEmailParams): { subject: string; html: string } {
  if (lang === "en") {
    return {
      subject: "Confirm your FitCoach account",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#111827;margin-top:0">Welcome to FitCoach, ${params.name.split(" ")[0]}!</h2>
          <p style="color:#374151">To activate your account and start your 14-day free trial, confirm your email by clicking the button below.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${params.confirmUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
              Confirm my account
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">If the button doesn't work, copy this link in your browser:<br/><a href="${params.confirmUrl}" style="color:#4f46e5">${params.confirmUrl}</a></p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="color:#9ca3af;font-size:12px;margin:0">FitCoach · This link expires in 48 hours.</p>
        </div>
      `,
    };
  }

  return {
    subject: "Confirmá tu cuenta en FitCoach",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#111827;margin-top:0">Bienvenido/a a FitCoach, ${params.name.split(" ")[0]}!</h2>
        <p style="color:#374151">Para activar tu cuenta y comenzar tu prueba gratuita de 14 días, confirmá tu email haciendo clic en el botón de abajo.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${params.confirmUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
            Confirmar mi cuenta
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px">Si el botón no funciona, copiá este enlace en tu navegador:<br/><a href="${params.confirmUrl}" style="color:#4f46e5">${params.confirmUrl}</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">FitCoach · Este enlace expira en 48 horas.</p>
      </div>
    `,
  };
}

export function getPasswordResetTemplate(lang: Lang, params: PasswordResetParams): { subject: string; html: string } {
  if (lang === "en") {
    return {
      subject: "Reset your FitCoach password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#4f46e5">Reset your password</h2>
          <p>We received a request to reset your FitCoach account password.</p>
          <p>Click the button to create a new password:</p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${params.resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              Reset password
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    };
  }

  return {
    subject: "Restablecer contraseña — FitCoach",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#4f46e5">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en FitCoach.</p>
        <p>Hacé clic en el botón para crear una nueva contraseña:</p>
        <div style="margin:24px 0;text-align:center;">
          <a href="${params.resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px">Este link expira en 1 hora. Si no solicitaste este cambio, ignorá este email.</p>
      </div>
    `,
  };
}
