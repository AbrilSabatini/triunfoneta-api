import { ResetPasswordEmailData } from '../mail.service';

export function resetPasswordTemplate(data: ResetPasswordEmailData): string {
  const { fullName, email, temporaryPassword } = data;
  const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  const firstName = fullName.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nueva contraseña - Triunfoneta</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #e6e6f7; font-family: Arial, Helvetica, sans-serif; color: #333; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #139a60; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .header p { color: #ffffff; font-size: 13px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .body h2 { font-size: 20px; color: #139a60; margin-bottom: 12px; }
    .body p { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 16px; }
    .credentials { background: #f0f4ff; border-left: 4px solid #139a60; border-radius: 6px; padding: 20px 24px; margin: 24px 0; }
    .credentials p { margin-bottom: 8px; font-size: 14px; color: #444; }
    .credentials p:last-child { margin-bottom: 0; }
    .credentials strong { color: #139a60; }
    .credentials code { background: #dde6f7; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 15px; letter-spacing: 1px; }
    .warning { background: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 20px; margin: 20px 0; font-size: 13px; color: #7a5800; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: #139a60; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block; }
    .footer { background: #f4f4f7; padding: 20px 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    .sticker-icon { font-size: 48px; display: block; text-align: center; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎴 Triunfoneta</h1>
      <p>El álbum del Mundial de Triunfo Seguros</p>
    </div>
    <div class="body">
      <span class="sticker-icon">🔑</span>
      <h2>Hola, ${firstName}!</h2>
      <p>
        Recibimos una solicitud para restablecer tu contraseña en <strong>Triunfoneta</strong>.
      </p>

      <p>
        A continuación te enviamos tu nueva contraseña temporal:
      </p>

      <div class="credentials">
        <p>📧 <strong>Email:</strong> ${email}</p>
        <p>🔑 <strong>Nueva contraseña:</strong> <code>${temporaryPassword}</code></p>
      </div>

      <div class="warning">
        ⚠️ <strong>Importante:</strong> por seguridad, te recomendamos cambiar esta contraseña 
        después de iniciar sesión.
      </div>

      <div class="cta">
        <a href="${appUrl}">Ingresar a Triunfoneta</a>
      </div>
    </div>
    <div class="footer">
      <p>Este email fue enviado automáticamente por Triunfoneta · Triunfo Seguros</p>
      <p style="margin-top:6px;">Si no solicitaste este cambio, ignorá este mensaje.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
