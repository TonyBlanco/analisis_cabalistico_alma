#!/usr/bin/env bash
# Activa snippets IA de astrología (Fase 3) en /opt/studio33/.env y recrea studio33_api.
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
cp "$REMOTE_ENV" "${REMOTE_ENV}.bak-astro-ai-$(date +%Y%m%d%H%M)"
if grep -q '^KERYKEION_AI_SNIPPETS_ENABLED=' "$REMOTE_ENV"; then
  sed -i 's|^KERYKEION_AI_SNIPPETS_ENABLED=.*|KERYKEION_AI_SNIPPETS_ENABLED=True|' "$REMOTE_ENV"
else
  echo 'KERYKEION_AI_SNIPPETS_ENABLED=True' >> "$REMOTE_ENV"
fi
if ! grep -q '^GROQ_API_KEY=.\+' "$REMOTE_ENV"; then
  VOX_GROQ=$(grep -m1 '^GROQ_API_KEY=' /opt/voxtvserver/.env 2>/dev/null | cut -d= -f2- || true)
  if [[ -n "$VOX_GROQ" ]]; then
    echo "GROQ_API_KEY=${VOX_GROQ}" >> "$REMOTE_ENV"
  else
    echo "⚠ GROQ_API_KEY vacía — snippets usan llm_bridge (free_first); configura en $REMOTE_ENV"
  fi
fi
cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api
REMOTE

echo "▶ Astrología AI snippets: KERYKEION_AI_SNIPPETS_ENABLED=True en Hetzner"