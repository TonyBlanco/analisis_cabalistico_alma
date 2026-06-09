#!/usr/bin/env bash
# D6 — Observabilidad básica post-corte (HTTP + contenedores + errores recientes).
# Uso local:
#   bash deploy/studios33/scripts/observability-d6.sh
# Con SSH al host:
#   HETZNER_SSH=1 bash deploy/studios33/scripts/observability-d6.sh
set -euo pipefail

WEB_BASE="${SMOKE_WEB_BASE:-https://studios33.app}"
API_BASE="${SMOKE_API_BASE:-https://api.studios33.app}"
HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
REMOTE_DIR="${REMOTE_DIR:-/opt/studio33}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.studios33.yml}"

warn=0
echo "▶ D6 observabilidad — $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "▶ Latencia HTTP"
for url in "${WEB_BASE}/" "${API_BASE}/api/ai/status/"; do
  t="$(curl -sS -o /dev/null -w '%{time_total}' "$url" || echo 'err')"
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || echo '000')"
  echo "  ${url} → ${code} (${t}s)"
  if [[ "$code" != "200" ]]; then warn=1; fi
done

echo "▶ Endpoints simbólicos"
for url in \
  "${WEB_BASE}/api/symbolic/v1/correspondences?systemId=jewish-traditional" \
  "${WEB_BASE}/api/symbolic/v1/correspondences?systemId=hermetic-golden-dawn"; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || echo '000')"
  echo "  ${url} → ${code}"
  [[ "$code" == "200" ]] || warn=1
done

if [[ "${HETZNER_SSH:-0}" == "1" && -f "$SSH_KEY" ]]; then
  echo "▶ Contenedores (SSH ${HETZNER_USER}@${HETZNER_IP})"
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new \
    "${HETZNER_USER}@${HETZNER_IP}" \
    "cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'"

  echo "▶ Errores recientes (últimas 40 líneas, api + web)"
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new \
    "${HETZNER_USER}@${HETZNER_IP}" \
    "docker logs studio33_api --tail 40 2>&1 | rg -i 'error|exception|traceback|critical' || true; \
     docker logs studio33_web --tail 40 2>&1 | rg -i 'error|exception|traceback|critical' || true"
else
  echo "  ℹ️  HETZNER_SSH=1 + SSH_KEY para estado de contenedores y logs"
fi

echo ""
if [[ "$warn" -eq 0 ]]; then
  echo "D6 observabilidad: OK"
  exit 0
fi
echo "D6 observabilidad: revisar advertencias arriba"
exit 1