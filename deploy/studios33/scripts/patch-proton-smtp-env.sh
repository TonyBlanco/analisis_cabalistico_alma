#!/usr/bin/env bash
# Configura SMTP Proton en /opt/studio33/.env (no commitear contraseñas).
# Uso local:
#   PROTON_SMTP_USER=noreply@studios33.app PROTON_SMTP_TOKEN='...' \
#     bash deploy/studios33/scripts/patch-proton-smtp-env.sh
set -euo pipefail

PROTON_SMTP_USER="${PROTON_SMTP_USER:-noreply@studios33.app}"
PROTON_SMTP_TOKEN="${PROTON_SMTP_TOKEN:-}"
[[ -n "$PROTON_SMTP_TOKEN" ]] || { echo "Falta PROTON_SMTP_TOKEN"; exit 1; }

HETZNER_USER="${HETZNER_USER:-root}"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "PM_USER='$PROTON_SMTP_USER' PM_PASS='$PROTON_SMTP_TOKEN'" bash -s <<'REMOTE'
set -euo pipefail
STU=/opt/studio33/.env
[[ -f "$STU" ]] || { echo "No existe $STU"; exit 1; }

upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$STU"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$STU"
  else
    echo "${key}=${val}" >> "$STU"
  fi
}

upsert EMAIL_HOST "smtp.protonmail.ch"
upsert EMAIL_PORT "587"
upsert EMAIL_USE_TLS "true"
upsert EMAIL_HOST_USER "$PM_USER"
upsert EMAIL_HOST_PASSWORD "$PM_PASS"
upsert DEFAULT_FROM_EMAIL "Studios33 <${PM_USER}>"
upsert EMAIL_SUBJECT_PREFIX "[Studios33] "

cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api
echo "▶ Proton SMTP aplicado para ${PM_USER}"
REMOTE

echo "▶ Listo. Prueba una invitación de terapeuta en beta."