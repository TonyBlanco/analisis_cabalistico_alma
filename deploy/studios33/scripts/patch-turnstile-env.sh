#!/usr/bin/env bash
# Actualiza Turnstile en /opt/studio33/.env desde deploy/studios33/.env.studios33 y recrea studio33_api.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ENV_LOCAL="${ROOT}/deploy/studios33/.env.studios33"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
REMOTE_ENV="/opt/studio33/.env"

if [[ ! -f "$ENV_LOCAL" ]]; then
  echo "Falta $ENV_LOCAL"
  exit 1
fi

SITE=$(grep -m1 '^TURNSTILE_SITE_KEY=' "$ENV_LOCAL" | cut -d= -f2-)
SECRET=$(grep -m1 '^TURNSTILE_SECRET_KEY=' "$ENV_LOCAL" | cut -d= -f2-)
if [[ -z "$SITE" || -z "$SECRET" ]]; then
  echo "TURNSTILE_SITE_KEY y TURNSTILE_SECRET_KEY requeridos en $ENV_LOCAL"
  exit 1
fi

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "SITE='$SITE' SECRET='$SECRET' REMOTE_ENV='$REMOTE_ENV' bash -s" <<'REMOTE'
set -euo pipefail
cp "$REMOTE_ENV" "${REMOTE_ENV}.bak-turnstile-$(date +%Y%m%d%H%M)"
for key in TURNSTILE_SITE_KEY TURNSTILE_SECRET_KEY TURNSTILE_SECRET; do
  val="${SITE}"
  [[ "$key" != TURNSTILE_SITE_KEY ]] && val="${SECRET}"
  if grep -q "^${key}=" "$REMOTE_ENV"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$REMOTE_ENV"
  else
    echo "${key}=${val}" >> "$REMOTE_ENV"
  fi
done
grep -q '^TURNSTILE_ENFORCED=' "$REMOTE_ENV" || echo 'TURNSTILE_ENFORCED=true' >> "$REMOTE_ENV"
cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api
REMOTE

echo "▶ API Turnstile actualizado. Comprueba hostnames en Cloudflare (error 110200)."
echo "   curl -s https://api.studios33.app/api/turnstile/config/"