#!/usr/bin/env bash
# Obtiene credencial DRF de un terapeuta activo en prod (solo stdout; no persiste).
# Uso: eval "$(bash deploy/studios33/scripts/fetch-smoke-therapist-token.sh)"
set -euo pipefail

HETZNER_IP="${HETZNER_IP:-94.130.222.205}"
HETZNER_USER="${HETZNER_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_hetzner}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "echo 'SSH_KEY no encontrada: $SSH_KEY' >&2; exit 1" >&2
  exit 1
fi

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${HETZNER_USER}@${HETZNER_IP}" \
  "docker exec studio33_api python manage.py shell -c \"
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
u = User.objects.filter(profile__user_type='therapist', is_active=True).exclude(is_superuser=True).first()
if not u:
    u = User.objects.filter(profile__user_type='therapist', is_active=True).first()
if not u:
    raise SystemExit('NO_THERAPIST')
t, _ = Token.objects.get_or_create(user=u)
print('export SMOKE_THERAPIST_USER=' + repr(u.username))
print('export SMOKE_THERAPIST_TOKEN=' + repr(t.key))
\"" 2>/dev/null | rg '^export SMOKE_THERAPIST_'