const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = 'https://djzydkpspbgwlpjhbswj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqenlka3BzcGJnd2xwamhic3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDU3NDg2NCwiZXhwIjoyMTAwMTUwODY0fQ.S8RFaZM4NUq8LRTE0joJVMBzrv4ulfePpqL2w-37UmI';

// Obtener credenciales del .env.production del VPS
// Si lo tienes, puedes setearlas aquí manualmente:
const GMAIL_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  user: process.env.SMTP_USER,
};

async function sendConfirmationEmail() {
  try {
    // Conectar a Supabase
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Buscar a Britt
    const { data: trainer, error } = await adminClient
      .from('trainers')
      .select('id, name, email, confirm_token')
      .eq('email', 'getfitbritt2517@icloud.com')
      .single();

    if (error || !trainer) {
      console.error('❌ Trainer not found:', error?.message);
      return false;
    }

    console.log('✅ Found:', trainer.name, trainer.email);

    if (!trainer.confirm_token) {
      console.error('❌ No confirmation token');
      return false;
    }

    // Crear transporter
    const { google } = require('googleapis');
    const OAuth2 = google.auth.OAuth2;

    const oauth2Client = new OAuth2(
      GMAIL_CONFIG.clientId,
      GMAIL_CONFIG.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: GMAIL_CONFIG.refreshToken,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL_CONFIG.user,
        clientId: GMAIL_CONFIG.clientId,
        clientSecret: GMAIL_CONFIG.clientSecret,
        refreshToken: GMAIL_CONFIG.refreshToken,
      },
    });

    // Enviar email
    const confirmUrl = `https://fitcoach.vip/api/auth/confirm-email?token=${trainer.confirm_token}`;
    const firstName = trainer.name.split(' ')[0];

    const result = await transporter.sendMail({
      from: `FitCoach <${GMAIL_CONFIG.user}>`,
      to: trainer.email,
      subject: 'Confirmá tu cuenta en FitCoach',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#111827;margin-top:0">¡Bienvenido/a a FitCoach, ${firstName}!</h2>
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

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

sendConfirmationEmail();
