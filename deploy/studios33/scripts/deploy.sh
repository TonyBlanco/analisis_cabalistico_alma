#!/usr/bin/env bash
# Despliegue Studios33 en Hetzner — NO usar scripts/deploy.sh de VoxTV.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
REMOTE_DIR="/opt/studio33"
VOXTV_NGINX="/opt/voxtvserver/nginx/conf.d"
COMPOSE_FILE="docker-compose.studios33.yml"

echo "▶ Studios33 deploy → ${HETZNER_USER}@${HETZNER_IP}"

RSYNC_SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

rsync -avz -e "${RSYNC_SSH}" \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.git/' \
  --exclude='.venv/' \
  --exclude='backups/' \
  --exclude='__pycache__/' \
  --exclude='*.sqlite3' \
  --exclude='.env' \
  "${ROOT}/" "${HETZNER_USER}@${HETZNER_IP}:${REMOTE_DIR}/"

scp -i "$SSH_KEY" -q \
  "${ROOT}/deploy/studios33/nginx/studios33.app.conf" \
  "${ROOT}/deploy/studios33/nginx/api.studios33.app.conf" \
  "${HETZNER_USER}@${HETZNER_IP}:${VOXTV_NGINX}/"

ssh -i "$SSH_KEY" "${HETZNER_USER}@${HETZNER_IP}" "REMOTE_DIR='${REMOTE_DIR}' COMPOSE_FILE='${COMPOSE_FILE}' bash -s" <<'REMOTE'
set -euo pipefail

mkdir -p "$REMOTE_DIR"

if [[ ! -f "$REMOTE_DIR/.env" ]]; then
  DB_PASS=$(openssl rand -hex 24)
  SECRET=$(openssl rand -hex 32)
  ADMIN_PASS=$(openssl rand -hex 12)
  GROQ_LINE=$(grep -m1 '^GROQ_API_KEY=' /opt/voxtvserver/.env 2>/dev/null || echo 'GROQ_API_KEY=')
  GEMINI_LINE=$(grep -m1 '^GEMINI_API_KEY=' /opt/voxtvserver/.env 2>/dev/null || echo 'GEMINI_API_KEY=')

  if ! docker exec voxtv_postgres psql -U voxtv_user -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='studio33_user'" | grep -q 1; then
    docker exec voxtv_postgres psql -U voxtv_user -d postgres -c "CREATE USER studio33_user WITH PASSWORD '${DB_PASS}';"
  fi
  if ! docker exec voxtv_postgres psql -U voxtv_user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='studio33_db'" | grep -q 1; then
    docker exec voxtv_postgres psql -U voxtv_user -d postgres -c "CREATE DATABASE studio33_db OWNER studio33_user;"
  fi

  cat > "$REMOTE_DIR/.env" <<ENV
DEBUG=False
SECRET_KEY=${SECRET}
ALLOWED_HOSTS=api.studios33.app,studios33.app,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://studios33.app,https://www.studios33.app
CSRF_TRUSTED_ORIGINS=https://studios33.app,https://www.studios33.app
FRONTEND_URL=https://studios33.app
DATABASE_URL=postgresql://studio33_user:${DB_PASS}@postgres:5432/studio33_db?sslmode=disable
SWISSEPH_PATH=/app/astrology/ephemeris
${GROQ_LINE}
GROQ_MODEL=llama-3.3-70b-versatile
${GEMINI_LINE}
GEMINI_MODEL=gemini-1.5-flash
KERYKEION_AI_SNIPPETS_ENABLED=True
NEXT_PUBLIC_API_URL=https://api.studios33.app/api
ADMIN_DEFAULT_PASSWORD=${ADMIN_PASS}
ENV
  chmod 600 "$REMOTE_DIR/.env"
  echo "▶ Creado $REMOTE_DIR/.env — revisa ADMIN_DEFAULT_PASSWORD en el servidor"
fi

cd "$REMOTE_DIR"
export NEXT_PUBLIC_API_URL=https://api.studios33.app/api
docker compose -f "$COMPOSE_FILE" build studio33_api studio33_web
# --force-recreate evita conflictos de nombre tras deploys fallidos parciales
docker compose -f "$COMPOSE_FILE" up -d --force-recreate --remove-orphans studio33_api studio33_web

echo "▶ Esperando arranque web/api (evita 502 en Cloudflare)..."
for _ in $(seq 1 30); do
  if docker exec voxtv_nginx wget -qO- --timeout=3 http://studio33_web:3000/ >/dev/null 2>&1 \
     && docker exec studio33_api python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/', timeout=3)" >/dev/null 2>&1; then
    echo "▶ Servicios listos"
    break
  fi
  sleep 2
done

docker exec studio33_api python /app/deploy/studios33/scripts/ensure_admin_profiles.py 2>/dev/null || true

echo "▶ Migraciones API:"
docker exec studio33_api python manage.py migrate api --noinput

echo "▶ Tests vinculación terapeuta-consultante (beta):"
docker exec studio33_api python manage.py test api.tests.test_therapist_patient_invitation -v 1 --keepdb 2>&1 | tail -20

echo "▶ Tests process memory + tarot seal:"
docker exec studio33_api python manage.py test api.tests.test_process_memory api.tests.test_process_memory_embeddings swm.tarot.tests.test_api.ProcessMemoryTarotSealTest -v 1 --keepdb 2>&1 | tail -25

docker exec voxtv_nginx nginx -t
docker exec voxtv_nginx nginx -s reload

echo "▶ Smoke (red interna):"
docker exec voxtv_nginx wget -qO- --timeout=8 http://studio33_api:8000/api/ 2>/dev/null | head -c 200 || echo "(api aún arrancando)"
docker exec voxtv_nginx wget -qO- --timeout=8 http://studio33_web:3000/ 2>/dev/null | head -c 120 || echo "(web aún arrancando)"
REMOTE

bash "$(dirname "$0")/setup-origin-ssl.sh"

VOXTV_SSL="${VOXTVSERVER_ROOT:-/Volumes/T7/Development/VOXTVSERVER}/scripts/setup-voxtv-origin-ssl.sh"
if [[ -x "$VOXTV_SSL" ]]; then
  echo "▶ TLS origen VoxTV :443 (evita regresión cert tras Studios33)..."
  bash "$VOXTV_SSL"
else
  echo "⚠ No encontrado $VOXTV_SSL — ejecutar manualmente tras deploy"
fi

echo "▶ Deploy terminado. Prueba: curl -sI https://studios33.app | head -5"
