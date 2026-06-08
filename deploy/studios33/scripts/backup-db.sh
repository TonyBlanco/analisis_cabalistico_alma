#!/usr/bin/env bash
# Backup studio33_db desde voxtv_postgres (Hetzner) → backups/ local.
# Fase D — independiente de db_backup.sh de VoxTV (voxtv_db).
set -euo pipefail

HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT_DIR="${ROOT}/backups/studio33"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${OUT_DIR}/studio33_db-${STAMP}.sql.gz"

mkdir -p "$OUT_DIR"

echo "▶ pg_dump studio33_db → ${OUT_FILE}"
ssh -i "$SSH_KEY" "root@${HETZNER_IP}" \
  "docker exec voxtv_postgres pg_dump -U studio33_user studio33_db | gzip -c" \
  > "$OUT_FILE"

ls -lh "$OUT_FILE"
echo "OK: backup Studios33 guardado"