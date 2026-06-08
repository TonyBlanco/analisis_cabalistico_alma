#!/usr/bin/env bash
# Sincroniza GOOGLE_* desde deploy/studios33/.env.studios33 → /opt/studio33/.env y recrea API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ENV_LOCAL="${ROOT}/deploy/studios33/.env.studios33"
HETZNER_USER="${HETZNER_USER:-root}"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
REMOTE_ENV="/opt/studio33/.env"

CID=$(grep -m1 '^GOOGLE_CLIENT_ID=' "$ENV_LOCAL" | cut -d= -f2-)
SEC=$(grep -m1 '^GOOGLE_CLIENT_SECRET=' "$ENV_LOCAL" | cut -d= -f2-)
[[ -n "$CID" ]] || { echo "Falta GOOGLE_CLIENT_ID en $ENV_LOCAL"; exit 1; }

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "CID='$CID' SEC='$SEC' REMOTE_ENV='$REMOTE_ENV' bash -s" <<'REMOTE'
set -euo pipefail
for key in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET; do
  val="${CID}"
  [[ "$key" != GOOGLE_CLIENT_ID ]] && val="${SEC}"
  if grep -q "^${key}=" "$REMOTE_ENV"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$REMOTE_ENV"
  else
    echo "${key}=${val}" >> "$REMOTE_ENV"
  fi
done
cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api
REMOTE

echo "▶ Google OAuth en API. Prueba: curl -s https://api.studios33.app/api/google/config/"
