#!/usr/bin/env bash
# Copia SMTP de VoxTV (/opt/voxtvserver/.env) → Django EMAIL_* en /opt/studio33/.env
# Mismo patrón que VoxTV: Gmail smtp.gmail.com + contraseña de aplicación (no token Proton).
set -euo pipefail

HETZNER_USER="${HETZNER_USER:-root}"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" bash -s <<'REMOTE'
set -euo pipefail
VOX="/opt/voxtvserver/.env"
STU="/opt/studio33/.env"
[[ -f "$VOX" ]] || { echo "No existe $VOX"; exit 1; }
[[ -f "$STU" ]] || { echo "No existe $STU"; exit 1; }

get() { grep -m1 "^$1=" "$VOX" | cut -d= -f2-; }

HOST=$(get SMTP_HOST)
PORT=$(get SMTP_PORT)
USER=$(get SMTP_USER)
PASS=$(get SMTP_PASS)
FROM=$(get EMAIL_FROM)

for v in HOST PORT USER PASS FROM; do
  if [[ -z "${!v}" ]]; then
    echo "Falta SMTP en VoxTV (.env): variable vacía ($v)"
    exit 1
  fi
done

upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$STU"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$STU"
  else
    echo "${key}=${val}" >> "$STU"
  fi
}

upsert EMAIL_HOST "$HOST"
upsert EMAIL_PORT "$PORT"
upsert EMAIL_USE_TLS "true"
upsert EMAIL_HOST_USER "$USER"
upsert EMAIL_HOST_PASSWORD "$PASS"
# Remitente de marca Studios33 (misma cuenta Gmail; añade alias en Google si hace falta)
upsert DEFAULT_FROM_EMAIL "Studios33 <noreply@studios33.app>"
upsert EMAIL_SUBJECT_PREFIX "[Studios33] "

cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api

echo "▶ SMTP sincronizado (host/user/pass desde VoxTV). From: Studios33 <noreply@studios33.app>"
REMOTE

echo "▶ Prueba invitación terapeuta o: docker logs studio33_api 2>&1 | tail -30"