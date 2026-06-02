#### 1. Clonar repositorio
```bash
$ git clone https://github.com/AbrilSabatini/triunfoneta-api.git
```

#### 2. Actualizar rama 
```bash
$ git pull
```

## Project setup

#### 3. Instalar yarn
```bash
$ npm install -g yarn
```
#### 4. Posicionarte en el proyecto

```bash
$ cd triunfoneta-api
```

#### 5. Configurar variables de entorno
Crear archivo .env a partir de .env.template en la raíz del proyecto

#### 6. Instalar dependencias
```bash
$ yarn install
```

## 6. Compile and run the project

```bash
# development
$ yarn run start

# watch mode -> desarrollo!!
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

La API queda disponible en: `http://localhost:3000/api`

---
## Swagger — Documentación interactiva

URL: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Una vez dentro, para probar endpoints protegidos:

1. Hacer `POST /api/auth/login` con las credenciales del administrador.
2. Copiar el `accessToken` de la respuesta.
3. Hacer clic en el botón **Authorize 🔒** (arriba a la derecha).
4. Pegar el token en el campo `Bearer` y confirmar.

A partir de ese momento todos los endpoints marcados con 🔒 enviarán el JWT automáticamente.

---

## Usuario administrador (seed de desarrollo)

| Campo | Valor |
|---|---|
| Email | `admin@triunfo.com` |
| Contraseña | `Triunfo2025!` |
| Rol | `admin` |

Todos los usuarios de prueba también usan la contraseña `Triunfo2025!`.

---

## Configuración de email

El servicio de correo usa Nodemailer y se configura en el `.env`.

### Desarrollo local

Agregar al `.env`:

```env
NODE_ENV=development
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tucuenta@gmail.com
MAIL_PASS=abcdefghijklmnop   # contraseña de aplicación de Google (sin espacios)
MAIL_FROM_NAME=Triunfoneta
MAIL_FROM_ADDRESS=tucuenta@gmail.com
```

URL: [Video explicativo](https://www.youtube.com/watch?v=x5soeCvnPjs)

Para obtener la contraseña de aplicación de Gmail:
1. Ir a **Cuenta Google → Seguridad → Verificación en dos pasos** (debe estar activa).
2. Ir a **Seguridad → Contraseñas de aplicación**.
3. Crear una nueva con nombre "Triunfoneta".
4. Copiar los 16 caracteres **sin espacios** como `MAIL_PASS`.