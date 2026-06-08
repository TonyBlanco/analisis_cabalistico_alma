#!/usr/bin/env bash
# Certificado origen Studios33 (Cloudflare Full SSL :443).
# Tras este script, ejecutar VOXTVSERVER/scripts/setup-voxtv-origin-ssl.sh
# para que voxtv.win / api.voxtv.win no reciban el cert CN=studios33.app en :443.
set -euo pipefail

HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

scp -i "$SSH_KEY" -q \
  "${ROOT}/deploy/studios33/nginx/studios33.app.conf" \
  "${ROOT}/deploy/studios33/nginx/api.studios33.app.conf" \
  "root@${HETZNER_IP}:/opt/voxtvserver/nginx/conf.d/"

ssh -i "$SSH_KEY" "root@${HETZNER_IP}" bash -s <<'REMOTE'
set -euo pipefail
CERT_DIR=/opt/voxtvserver/nginx/certs
CRT="${CERT_DIR}/studios33-origin.crt"
KEY="${CERT_DIR}/studios33-origin.key"
COMPOSE=/opt/voxtvserver/docker-compose.yml

mkdir -p "$CERT_DIR"
if [[ ! -f "$CRT" ]]; then
  openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
    -keyout "$KEY" -out "$CRT" \
    -subj "/CN=studios33.app" \
    -addext "subjectAltName=DNS:studios33.app,DNS:www.studios33.app,DNS:api.studios33.app"
  chmod 600 "$KEY"
fi

if ! grep -q 'nginx/certs' "$COMPOSE"; then
  sed -i '/- \.\/nginx\/conf\.d:\/etc\/nginx\/conf\.d:ro/a\      - ./nginx/certs:/etc/nginx/certs:ro' "$COMPOSE"
  cd /opt/voxtvserver
  docker compose up -d nginx
fi

docker exec voxtv_nginx nginx -t
docker exec voxtv_nginx nginx -s reload
echo "OK: TLS origen studios33 en :443"
REMOTE

echo "Prueba: curl -sI https://studios33.app/ | head -5"