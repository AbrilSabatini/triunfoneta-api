import { WelcomeEmailData } from '../mail.service';

export function welcomeTemplate(data: WelcomeEmailData): string {
  const { fullName, email, temporaryPassword } = data;
  const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  const firstName = fullName.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a Triunfoneta</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif; color: #333; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a2e5a; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .header p { color: #a8b8d8; font-size: 13px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .body h2 { font-size: 20px; color: #1a2e5a; margin-bottom: 12px; }
    .body p { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 16px; }
    .credentials { background: #f0f4ff; border-left: 4px solid #1a2e5a; border-radius: 6px; padding: 20px 24px; margin: 24px 0; }
    .credentials p { margin-bottom: 8px; font-size: 14px; color: #444; }
    .credentials p:last-child { margin-bottom: 0; }
    .credentials strong { color: #1a2e5a; }
    .credentials code { background: #dde6f7; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 15px; letter-spacing: 1px; }
    .warning { background: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 20px; margin: 20px 0; font-size: 13px; color: #7a5800; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: #1a2e5a; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block; }
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
      <span class="sticker-icon">⚽</span>
      <h2>¡Hola, ${firstName}!</h2>
      <p>
        Tu cuenta en <strong>Triunfoneta</strong> ya está lista. 
        A partir de ahora podés completar tu figurita, ganar puntos, 
        hacer el prode y coleccionar a todos tus compañeros.
      </p>

      <div class="credentials">
        <p>📧 <strong>Email:</strong> ${email}</p>
        <p>🔑 <strong>Contraseña temporal:</strong> <code>${temporaryPassword}</code></p>
      </div>

      <div class="warning">
        ⚠️ <strong>Importante:</strong> por seguridad, te pedimos que cambies esta contraseña 
        la primera vez que ingreses.
      </div>

      <p>
        Una vez adentro, lo primero que tenés que hacer es 
        <strong>crear tu figurita</strong> para empezar a ganar puntos.
        ¡No te quedes afuera del álbum!
      </p>

      <div class="cta">
        <a href="${appUrl}/login">Ingresar a Triunfoneta</a>
      </div>
    </div>
    <div class="footer">
      <p>Este email fue enviado automáticamente por Triunfoneta · Triunfo Seguros</p>
      <p style="margin-top:6px;">Si creés que recibiste este email por error, ignoralo.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
