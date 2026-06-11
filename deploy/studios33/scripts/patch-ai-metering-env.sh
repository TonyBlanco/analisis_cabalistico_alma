#!/usr/bin/env bash
# Activa AI usage metering en /opt/studio33/.env y recrea studio33_api.
set -euo pipefail

HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
REMOTE_ENV="/opt/studio33/.env"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "REMOTE_ENV='$REMOTE_ENV' bash -s" <<'REMOTE'
set -euo pipefail
if [[ ! -f "$REMOTE_ENV" ]]; then
  echo "Falta $REMOTE_ENV — ejecutar deploy.sh primero"
  exit 1
fi
cp "$REMOTE_ENV" "${REMOTE_ENV}.bak-metering-$(date +%Y%m%d%H%M)"

upsert() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$REMOTE_ENV"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$REMOTE_ENV"
  else
    echo "${key}=${val}" >> "$REMOTE_ENV"
  fi
}

upsert AI_METERING_ENABLED true
upsert AI_METERING_ENFORCED false
upsert AI_DEFAULT_INCLUDED_CREDIT_EUR 8.00
upsert AI_EUR_USD_RATE 0.92
upsert AI_OVERAGE_ALLOWED true
upsert AI_PROVIDER gemini

cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api
REMOTE

echo "▶ AI metering: AI_METERING_ENABLED=true, AI_PROVIDER=gemini en Hetzner"