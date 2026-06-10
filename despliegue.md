# Guía de despliegue — Triunfoneta

**Stack:** NestJS (backend) · PostgreSQL (Render) · Vite (frontend en Vercel)

---

## Índice

1. [Base de datos en Render](#1-base-de-datos-en-render)
2. [Backend en Render](#2-backend-en-render)
3. [Variables de entorno en Render](#3-variables-de-entorno-en-render)
4. [Ejecutar la semilla](#4-ejecutar-la-semilla)
5. [Configurar Outlook como proveedor de email](#5-configurar-outlook-como-proveedor-de-email)
6. [Frontend en Vercel con Vite](#6-frontend-en-vercel-con-vite)

---

## 1. Base de datos en Render

### Crear la instancia

1. Ir a [render.com](https://render.com) → **New +** → **PostgreSQL**

2. Completar el formulario:

   | Campo | Valor |
   |---|---|
   | **Name** | `triunfoneta-db` |
   | **Database** | `triunfoneta` |
   | **User** | `triunfoneta_user` |
   | **Region** | `Oregon (US West)` — o el más cercano disponible |
   | **PostgreSQL Version** | `16` |
   | **Plan** | `Free` (para MVP) o `Starter $7/mes` (recomendado para producción) |

3. Click en **Create Database** y esperar ~2 minutos.

### Obtener la URL de conexión

Una vez creada, ir a la página de la DB → sección **Connections**:

- Copiar el campo **External Database URL** — tiene este formato:
  ```
  postgresql://triunfoneta_user:PASSWORD@dpg-XXXX.oregon-postgres.render.com/triunfoneta
  ```

> ⚠️ **Importante:** Render usa SSL en todas las conexiones. La URL ya incluye el certificado necesario. TypeORM lo acepta automáticamente.

> ℹ️ El plan **Free** de Render suspende la DB tras 90 días de inactividad y tiene 256 MB de RAM. Para 521 usuarios en producción recomendamos el plan **Starter ($7/mes)** que tiene 1 GB RAM y sin suspensión.

---

## 2. Backend en Render

### Preparar el repositorio

Asegurarse de que el repo tiene en la raíz del backend:

```
backend/
├── src/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

El archivo `package.json` debe tener estos scripts (ya están configurados):

```json
{
  "scripts": {
    "build":       "nest build",
    "start:prod":  "node dist/main",
    "seed":        "npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts"
  }
}
```

### Crear el Web Service en Render

1. **New +** → **Web Service**

2. Conectar el repositorio de GitHub (autorizar Render si es la primera vez)

3. Completar el formulario:

   | Campo | Valor |
   |---|---|
   | **Name** | `triunfoneta-api` |
   | **Region** | Mismo que la DB |
   | **Branch** | `main` |
   | **Root Directory** | `backend` *(si el repo tiene frontend y backend en subcarpetas)* |
   | **Runtime** | `Node` |
   | **Build Command** | `yarn install && yarn build` |
   | **Start Command** | `yarn start:prod` |
   | **Plan** | `Free` o `Starter $7/mes` |

4. Click en **Advanced** para agregar las variables de entorno (ver sección 3)

5. Click en **Create Web Service**

> ℹ️ El plan **Free** de Render suspende el servicio tras 15 minutos de inactividad. Para una app de empleados que se usa en horario laboral, el **Starter ($7/mes)** evita los arranques fríos de ~30 segundos.

---

## 3. Variables de entorno en Render

En la configuración del Web Service → **Environment** → agregar cada variable:

### Obligatorias

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La URL copiada en el paso 1 |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `FRONTEND_URL` | La URL de Vercel (ej: `https://triunfoneta.vercel.app`) — completar después del paso 6 |
| `JWT_SECRET` | Generar con: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

### Swagger

| Variable | Valor |
|---|---|
| `SWAGGER_ENABLED` | `true` |
| `SWAGGER_USER` | `admin` |
| `SWAGGER_PASS` | Una contraseña segura (no usar el default) |

### Email (completar en paso 5)

| Variable | Valor |
|---|---|
| `MAIL_HOST` | `smtp.office365.com` |
| `MAIL_PORT` | `587` |
| `MAIL_SECURE` | `false` |
| `MAIL_USER` | `tucuenta@triunfo.com.ar` |
| `MAIL_PASS` | La contraseña de la cuenta de Outlook |
| `MAIL_FROM_NAME` | `Triunfoneta` |
| `MAIL_FROM_ADDRESS` | `tucuenta@triunfo.com.ar` |
| `MAIL_TLS_REJECT_UNAUTHORIZED` | `true` |
| `MAIL_BATCH_SIZE` | `10` |
| `MAIL_BATCH_DELAY_MS` | `2000` |
| `MAIL_MAX_ATTEMPTS` | `5` |

### Gamificación

| Variable | Valor recomendado |
|---|---|
| `STICKER_CREATION_POINTS` | `50` |
| `LEGEND_PASSWORD` | Una contraseña segura para los gerentes |
| `PRODE_EXACT_POINTS` | `10` |
| `PRODE_WINNER_POINTS` | `5` |
| `PACK_COST_POINTS` | `150` |
| `PACK_STICKERS_PER_PACK` | `5` |
| `PACK_LEGEND_CHANCE` | `0.05` |
| `PACK_RARE_CHANCE` | `0.15` |
| `AREA_COMPLETION_POINTS` | `100` |
| `TRIVIA_MAX_LIVES` | `5` |
| `TRIVIA_LIFE_REGEN_MINUTES` | `360` |
| `RESET_LINK_EXPIRES_MINUTES` | `60` |

### Rate limiting

| Variable | Valor |
|---|---|
| `THROTTLE_DEFAULT_LIMIT` | `60` |
| `THROTTLE_DEFAULT_WINDOW_MS` | `60000` |

---

## 4. Ejecutar la semilla

La semilla crea las áreas, 1 admin y los datos iniciales. Render permite ejecutar comandos desde el panel o vía SSH.

### Opción A — Desde el panel de Render (recomendado)

1. Ir al Web Service `triunfoneta-api`
2. Click en **Shell** (pestaña en la parte superior)
3. Ejecutar:

```bash
yarn seed
```

Salida esperada:

```
🌱 Iniciando seed...
✅ Conexión a DB establecida
✅ Áreas: 10 registros
✅ Usuarios: 21 registros
✅ Figuritas creadas
✅ Partidos: 14 registros
✅ Intercambios de prueba creados
✅ Preguntas de trivia creadas
🎉 Seed completado exitosamente.
```

### Opción B — Como Deploy Hook (se ejecuta automáticamente en cada deploy)

En **Settings** → **Deploy Hooks** → crear uno con el script de seed. No recomendado para producción ya que el seed es idempotente pero agrega tiempo al deploy.

### Credenciales del admin creado por el seed

| Campo | Valor |
|---|---|
| Email | `admin@triunfo.com` |
| Contraseña | `Triunfo2025!` |

> ⚠️ Cambiar la contraseña del admin desde Swagger (`PATCH /api/users/me/change-password`) después del primer login.

### Verificar que el backend está funcionando

```bash
curl https://triunfoneta-api.onrender.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@triunfo.com","password":"Triunfo2025!"}'
```

Debe devolver un `accessToken`.

**Swagger:** `https://triunfoneta-api.onrender.com/api/docs`

---

## 5. Configurar Outlook como proveedor de email

Outlook/Microsoft 365 usa SMTP con autenticación moderna. Hay dos escenarios según el tipo de cuenta:

### Escenario A — Cuenta Microsoft 365 corporativa (recomendado)

Este es el caso si Triunfo Seguros tiene correos `@triunfo.com.ar` con Microsoft 365.

**Paso 1: Habilitar SMTP AUTH en el tenant**

El administrador de Microsoft 365 debe habilitar SMTP AUTH para la cuenta que va a enviar:

1. Ir a [admin.microsoft.com](https://admin.microsoft.com)
2. **Usuarios** → seleccionar la cuenta de envío (ej: `noreply@triunfo.com.ar`)
3. **Correo** → **Administrar configuración del correo de Exchange**
4. **Flujo de correo** → activar **Autenticación SMTP**

**Paso 2: Variables de entorno**

```env
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=noreply@triunfo.com.ar
MAIL_PASS=contraseña_de_la_cuenta
MAIL_FROM_NAME=Triunfoneta
MAIL_FROM_ADDRESS=noreply@triunfo.com.ar
MAIL_TLS_REJECT_UNAUTHORIZED=true
```

**Paso 3: Verificar en la Shell de Render**

```bash
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.office365.com', port: 587, secure: false,
  auth: { user: 'noreply@triunfo.com.ar', pass: 'TU_PASS' }
});
t.verify().then(() => console.log('✅ SMTP OK')).catch(e => console.error('❌', e.message));
"
```

---

### Escenario B — Cuenta Outlook personal o MFA activado

Si la cuenta tiene **autenticación multifactor (MFA)**, la contraseña normal no funciona con SMTP. Se necesita una **contraseña de aplicación**:

1. Ir a [account.microsoft.com/security](https://account.microsoft.com/security)
2. **Opciones de seguridad avanzadas** → **Contraseñas de aplicación**
3. Crear una nueva → copiar la contraseña generada (16 caracteres)
4. Usar esa contraseña en `MAIL_PASS`

---

### Escenario C — Política corporativa bloquea SMTP (caso frecuente en empresas)

Muchas empresas Microsoft 365 tienen SMTP AUTH desactivado por política de seguridad. En ese caso la alternativa es usar **SendGrid** (100 emails/día gratis):

1. Crear cuenta en [sendgrid.com](https://sendgrid.com)
2. **Settings** → **API Keys** → **Create API Key**
3. Verificar el dominio de envío en **Sender Authentication**

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM_NAME=Triunfoneta
MAIL_FROM_ADDRESS=noreply@triunfo.com.ar
MAIL_TLS_REJECT_UNAUTHORIZED=true
```

> El plan gratuito de SendGrid envía 100 emails/día, suficiente para el día de registro masivo si se hace en lotes durante varios días. Si se necesita cargar los 521 empleados en un solo día, el plan **Essentials ($19.95/mes)** sube el límite a 50.000/mes.

---

## 6. Frontend en Vercel con Vite

### Preparar el proyecto Vite

En la raíz del frontend, crear o verificar el archivo `vite.config.js` / `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  // Si el frontend está en una subcarpeta del repo, no hace falta nada más.
  // Vercel detecta Vite automáticamente.
  build: {
    outDir: 'dist',
  },
});
```

Crear el archivo de variables de entorno para producción: `frontend/.env.production`

```env
VITE_API_URL=https://triunfoneta-api.onrender.com/api
```

> En Vite, todas las variables que el frontend usa deben empezar con `VITE_`. Se acceden con `import.meta.env.VITE_API_URL`.

### Configurar el router para SPA (evitar 404 en rutas directas)

Si el frontend usa React Router, Vue Router o similar, crear `frontend/public/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Desplegar en Vercel

1. Ir a [vercel.com](https://vercel.com) → **New Project**

2. Importar el repositorio de GitHub

3. Configurar el proyecto:

   | Campo | Valor |
   |---|---|
   | **Framework Preset** | `Vite` (Vercel lo detecta automáticamente) |
   | **Root Directory** | `frontend` *(si hay subcarpetas)* |
   | **Build Command** | `vite build` *(o `yarn build`)* |
   | **Output Directory** | `dist` |
   | **Install Command** | `yarn install` |

4. En **Environment Variables** agregar:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://triunfoneta-api.onrender.com/api` |

5. Click en **Deploy**

### Obtener la URL de Vercel

Después del deploy, Vercel asigna una URL del tipo `https://triunfoneta.vercel.app`.

**Volver al paso 3** y actualizar `FRONTEND_URL` en Render con esta URL para que CORS funcione correctamente.

---

## Flujo completo de primer despliegue

```
1. Render: crear DB PostgreSQL
2. Render: copiar External Database URL
3. Render: crear Web Service (backend)
4. Render: configurar todas las variables de entorno
5. Render: aguardar el primer build (~3-5 min)
6. Render: Shell → yarn seed
7. Vercel: crear proyecto (frontend)
8. Vercel: configurar VITE_API_URL
9. Render: actualizar FRONTEND_URL con la URL de Vercel
10. Render: hacer Redeploy para que tome el nuevo FRONTEND_URL
11. Verificar: curl /api/auth/login con admin@triunfo.com
12. Verificar: abrir /api/docs con las credenciales de Swagger
```

---

## Troubleshooting frecuente

**El backend no inicia — error "password authentication failed"**
→ Verificar que `DATABASE_URL` está copiada correctamente desde Render. No debe tener saltos de línea ni espacios.

**CORS error desde el frontend**
→ Verificar que `FRONTEND_URL` en Render coincide exactamente con la URL de Vercel (con `https://`, sin barra final).

**Los emails no se envían**
→ Ir a `GET /api/admin/mail/failed` en Swagger para ver el error exacto. El mensaje en `lastError` indica si es un problema de credenciales SMTP o de red.

**El seed falla con "relation does not exist"**
→ La primera vez que se despliega, NestJS con `synchronize: true` crea las tablas al arrancar. Esperar 30 segundos después del primer deploy antes de correr el seed.

**El frontend muestra 404 al recargar una ruta**
→ Verificar que `vercel.json` está en `frontend/public/` con el rewrite configurado.

**Render suspende el servicio (plan Free)**
→ El primer request después de la suspensión tarda ~30 segundos. Para evitarlo, usar el plan Starter o configurar un cron externo que haga ping cada 10 minutos a `/api/auth/me`.