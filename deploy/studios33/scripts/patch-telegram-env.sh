#!/usr/bin/env bash
# Configura Telegram Bot en /opt/studio33/.env y registra webhook.
# Uso:
#   TELEGRAM_BOT_TOKEN='...' TELEGRAM_BOT_USERNAME='Studios33Bot' \
#     bash deploy/studios33/scripts/patch-telegram-env.sh
set -euo pipefail

HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_BOT_USERNAME="${TELEGRAM_BOT_USERNAME:-}"
TELEGRAM_WEBHOOK_URL="${TELEGRAM_WEBHOOK_URL:-https://api.studios33.app/api/telegram/webhook/}"
TELEGRAM_WEBHOOK_SECRET="${TELEGRAM_WEBHOOK_SECRET:-}"

[[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_BOT_USERNAME" ]] || {
  echo "Faltan TELEGRAM_BOT_TOKEN y/o TELEGRAM_BOT_USERNAME"
  exit 1
}

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "TG_TOKEN='$TELEGRAM_BOT_TOKEN' TG_USER='$TELEGRAM_BOT_USERNAME' TG_HOOK='$TELEGRAM_WEBHOOK_URL' TG_SECRET='$TELEGRAM_WEBHOOK_SECRET'" bash -s <<'REMOTE'
set -euo pipefail
ENV=/opt/studio33/.env
upsert() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV"
  else
    echo "${key}=${val}" >> "$ENV"
  fi
}
upsert TELEGRAM_ENABLED "true"
upsert TELEGRAM_BOT_TOKEN "$TG_TOKEN"
upsert TELEGRAM_BOT_USERNAME "$TG_USER"
upsert TELEGRAM_WEBHOOK_URL "$TG_HOOK"
upsert TELEGRAM_WEBHOOK_SECRET "$TG_SECRET"
upsert WHATSAPP_ENABLED "false"
cd /opt/studio33
docker compose -f docker-compose.studios33.yml up -d --force-recreate studio33_api >/dev/null
docker exec studio33_api python manage.py migrate --noinput
docker exec studio33_api python manage.py shell -c "
from api.notifications.telegram import register_telegram_webhook
ok, msg = register_telegram_webhook()
print('WEBHOOK_OK', ok)
print(msg)
"
echo "▶ Telegram configurado (@${TG_USER})"
REMOTE