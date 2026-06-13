# Autenticación avanzada — Magic link, OTP y Passkeys

**Estado:** IMPLEMENTADO y desplegado en prod (`studios33.app`)  
**Commits:** `1e5345d5` (password reset OTP), `1b36b9d0` (magic link + OTP login + WebAuthn)  
**Migración:** `api.0102_auth_advanced`  
**Fecha:** 2026-06-13

---

## Resumen

El login en `/login` ofrece cuatro métodos:

| Método | UX | Verificación de identidad |
|--------|-----|---------------------------|
| Contraseña | Clásico + Turnstile | Usuario/email + password |
| Magic link | Email → un clic | Posesión del buzón (enlace 15 min) |
| Código OTP | Email → 6 dígitos | Posesión del buzón (10 min) |
| Passkey | Face ID / Touch ID / llave | WebAuthn (`rp_id: studios33.app`) |

**Regla de seguridad:** nunca se revela si un email está registrado. Todas las solicitudes responden con mensaje genérico.

**Rate limit:** máx. 3 códigos/enlaces por usuario cada 15 minutos.

---

## Endpoints API (`api.studios33.app`)

### Magic link (login sin contraseña)

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/auth/magic-link/request/` | `{ "email": "..." }` | `{ "message": "..." }` |
| POST | `/api/auth/magic-link/verify/` | `{ "token": "..." }` | `{ "token", "username", "email", "role" }` |

Frontend: enlace en email → `https://studios33.app/auth/magic?token=...` → verifica y redirige al dashboard.

### OTP (login y reset de contraseña)

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/auth/otp/request/` | `{ "email", "purpose": "login_otp" \| "password_reset" }` | `{ "message" }` |
| POST | `/api/auth/otp/verify-login/` | `{ "email", "code" }` | Token DRF + role |
| POST | `/api/auth/otp/verify-password-reset/` | `{ "email", "code", "password", "confirm_password?" }` | `{ "message" }` |

`POST /api/password-reset/request/` delega en OTP (`password_reset`); ya no envía enlace largo por defecto.

`POST /api/password-reset/confirm/` sigue disponible para enlaces legacy (`uid` + `token` Django).

### Passkeys (WebAuthn)

| Método | Ruta | Auth | Uso |
|--------|------|------|-----|
| POST | `/api/auth/passkeys/register/options/` | Token | Opciones de registro |
| POST | `/api/auth/passkeys/register/verify/` | Token | Guardar credencial |
| POST | `/api/auth/passkeys/login/options/` | Público | Opciones de login |
| POST | `/api/auth/passkeys/login/verify/` | Público | Login → token DRF |
| GET | `/api/auth/passkeys/` | Token | Listar passkeys del usuario |
| DELETE | `/api/auth/passkeys/<id>/` | Token | Eliminar passkey |

Registro de passkey: **Cuenta** → `/dashboard/account` → sección Passkeys.

---

## Archivos clave

### Backend
- `backend/api/models_auth_advanced.py` — `AuthOneTimeCode`, `PasskeyCredential`, `WebAuthnChallenge`
- `backend/api/services/auth_advanced.py` — lógica OTP/magic link
- `backend/api/auth_advanced_views.py` — vistas DRF + WebAuthn
- `backend/api/emails.py` — `send_magic_link_email`, `send_otp_email`, `send_password_changed_email`
- `backend/requirements.txt` — `webauthn>=2.2.0,<3`

### Frontend
- `tonyblanco-app/components/auth/LoginAdvancedMethods.tsx` — pestañas en login
- `tonyblanco-app/app/(public)/auth/magic/page.tsx` — canje magic link
- `tonyblanco-app/components/auth/PasskeyManager.tsx` — registro en cuenta
- `tonyblanco-app/lib/api/auth-advanced.ts` — cliente API

---

## Variables de entorno (prod)

```env
FRONTEND_URL=https://studios33.app
WEBAUTHN_RP_ID=studios33.app
WEBAUTHN_RP_NAME=Studios33
WEBAUTHN_ORIGIN=https://studios33.app
# SMTP para envío real de emails (OTP / magic link)
EMAIL_HOST=...
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
```

Sin SMTP configurado, los endpoints responden OK pero el email no sale (backend console en dev).

---

## Deploy

```bash
bash deploy/studios33/scripts/deploy.sh
```

Aplica migración `0102`, instala `webauthn` en `studio33_api`, rebuild `studio33_web`.

### Smoke post-deploy

```bash
curl -s -X POST https://api.studios33.app/api/auth/magic-link/request/ \
  -H "Content-Type: application/json" -d '{"email":"test@example.com"}'

curl -s -X POST https://api.studios33.app/api/auth/otp/request/ \
  -H "Content-Type: application/json" -d '{"email":"test@example.com","purpose":"login_otp"}'

curl -sI https://studios33.app/auth/magic | head -3
```

---

## Tests

```bash
docker exec studio33_api python manage.py test api.tests.test_auth_advanced_api api.tests.test_password_reset_api -v 1 --keepdb
```

---

## Decisiones de diseño

1. **No modal “email encontrado” + cambio inmediato** — evita enumeración de cuentas y suplantación.
2. **OTP como reset principal** — menos fricción que enlace largo; email de confirmación tras cambio.
3. **Passkeys opcionales** — registro solo autenticado; login discoverable sin email si ya hay passkey residente.