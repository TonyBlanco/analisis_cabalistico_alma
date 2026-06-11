#!/usr/bin/env bash
# D5 — Smoke tests post-deploy (público + autenticado terapeuta).
# Uso:
#   SMOKE_THERAPIST_TOKEN='…' bash deploy/studios33/scripts/smoke-d5-auth.sh
#   SMOKE_THERAPIST_USER='…' SMOKE_THERAPIST_PASS='…' bash …  # puede fallar si Turnstile enforced
set -euo pipefail

WEB_BASE="${SMOKE_WEB_BASE:-https://studios33.app}"
API_BASE="${SMOKE_API_BASE:-https://api.studios33.app}"
AUTH_CRED="${SMOKE_THERAPIST_TOKEN:-}"
SMOKE_USER="${SMOKE_THERAPIST_USER:-}"
SMOKE_PASS="${SMOKE_THERAPIST_PASS:-}"

fail=0
ok() { echo "  ✅ $1"; }
bad() { echo "  ❌ $1"; fail=1; }

echo "▶ D5 smoke — ${WEB_BASE} / ${API_BASE}"

echo "▶ Symbolic correspondences (público BFF)"
for sys in hermetic-golden-dawn jewish-traditional; do
  body="$(curl -sf "${WEB_BASE}/api/symbolic/v1/correspondences?systemId=${sys}" || true)"
  if [[ -z "$body" ]]; then
    bad "correspondences ${sys}: sin respuesta"
    continue
  fi
  count="$(python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('data',{}).get('sefirot',[])))" <<<"$body" 2>/dev/null || echo 0)"
  if [[ "$count" == "10" ]]; then
    ok "correspondences ${sys}: 10 sefirot"
  else
    bad "correspondences ${sys}: esperado 10 sefirot, got ${count}"
  fi
done

jewish_body="$(curl -sf "${WEB_BASE}/api/symbolic/v1/correspondences?systemId=jewish-traditional" || true)"
if echo "$jewish_body" | grep -q 'Eheieh\|Eheie\|אהיה'; then
  ok "jewish-traditional incluye nombre divino Keter (Eheieh)"
else
  bad "jewish-traditional: no se detectó Eheieh en payload"
fi

echo "▶ Symbolic analyze (BFF)"
analyze_payload='{"treeState":{"source":{"method":"smoke","mode":"manual","timestamp":"2026-06-09T00:00:00.000Z"},"sefirot":[{"id":"keter","activation":0.5,"role":"balanced"},{"id":"chokmah","activation":0.5,"role":"balanced"},{"id":"binah","activation":0.5,"role":"balanced"},{"id":"chesed","activation":0.5,"role":"balanced"},{"id":"gevurah","activation":0.5,"role":"balanced"},{"id":"tiferet","activation":0.8,"role":"dominant"},{"id":"netzach","activation":0.5,"role":"balanced"},{"id":"hod","activation":0.5,"role":"balanced"},{"id":"yesod","activation":0.5,"role":"balanced"},{"id":"malkut","activation":0.5,"role":"balanced"}],"flows":[]}}'
analyze_code="$(curl -sS -o /tmp/smoke-analyze.json -w '%{http_code}' -X POST \
  -H 'Content-Type: application/json' \
  -d "$analyze_payload" \
  "${WEB_BASE}/api/symbolic/v1/analyze")"
if [[ "$analyze_code" == "200" ]] && grep -q '"version"' /tmp/smoke-analyze.json; then
  ok "analyze POST → 200"
else
  bad "analyze POST → ${analyze_code}"
fi

echo "▶ Front — rutas clave (sin sesión)"
for path in / /login /dashboard/therapist/cabala-aplicada; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${WEB_BASE}${path}")"
  if [[ "$code" =~ ^(200|307|308)$ ]]; then
    ok "GET ${path} → ${code}"
  else
    bad "GET ${path} → ${code}"
  fi
done

echo "▶ API — health"
api_code="$(curl -sS -o /tmp/smoke-api.json -w '%{http_code}' "${API_BASE}/api/ai/status/")"
if [[ "$api_code" == "200" ]]; then
  ok "GET /api/ai/status/ → 200"
else
  bad "GET /api/ai/status/ → ${api_code}"
fi

echo "▶ Astrología — AI status (URL canónica, sin doble /api)"
astro_ai_code="$(curl -sS -o /tmp/smoke-astro-ai.json -w '%{http_code}' "${API_BASE}/api/astrology/ai-status/")"
if [[ "$astro_ai_code" == "200" ]] && grep -q '"enabled"' /tmp/smoke-astro-ai.json; then
  ok "GET /api/astrology/ai-status/ → 200"
  if grep -q '"model"' /tmp/smoke-astro-ai.json; then
    bad "ai-status anónimo no debe exponer model (hardening Fase 3)"
  else
    ok "ai-status anónimo solo expone enabled"
  fi
else
  bad "GET /api/astrology/ai-status/ → ${astro_ai_code}"
fi
double_api_code="$(curl -sS -o /dev/null -w '%{http_code}' "${API_BASE}/api/api/astrology/ai-status/")"
if [[ "$double_api_code" == "404" ]]; then
  ok "GET /api/api/astrology/ai-status/ → 404 (doble prefijo rechazado)"
else
  bad "GET /api/api/astrology/ai-status/ → ${double_api_code} (esperado 404)"
fi

echo "▶ Front — ruta astrología terapeuta (sin sesión)"
astro_fe_code="$(curl -sS -o /dev/null -w '%{http_code}' "${WEB_BASE}/dashboard/therapist/astrologia")"
if [[ "$astro_fe_code" =~ ^(200|307|308)$ ]]; then
  ok "GET /dashboard/therapist/astrologia → ${astro_fe_code}"
else
  bad "GET /dashboard/therapist/astrologia → ${astro_fe_code}"
fi

if [[ -z "$AUTH_CRED" && -n "$SMOKE_USER" && -n "$SMOKE_PASS" ]]; then
  echo "▶ Login terapeuta (API)"
  login_resp="$(curl -sS -X POST "${API_BASE}/api/login/" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"${SMOKE_USER}\",\"password\":\"${SMOKE_PASS}\"}" || true)"
  AUTH_CRED="$(python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('token',''))" <<<"$login_resp" 2>/dev/null || true)"
  if [[ -z "$AUTH_CRED" ]]; then
    bad "login API sin credencial (¿Turnstile? usa SMOKE_THERAPIST_TOKEN)"
  fi
fi

if [[ -n "$AUTH_CRED" ]]; then
  echo "▶ Sesión terapeuta (autenticado)"
  auth_hdr="Authorization: Token ${AUTH_CRED}"
  me_code="$(curl -sS -o /tmp/smoke-me.json -w '%{http_code}' -H "$auth_hdr" "${API_BASE}/api/check-membership/")"
  if [[ "$me_code" == "200" ]]; then
    ok "check-membership → 200"
  else
    bad "check-membership → ${me_code}"
  fi
  patients_code="$(curl -sS -o /tmp/smoke-patients.json -w '%{http_code}' -H "$auth_hdr" "${API_BASE}/api/therapist/patients/")"
  if [[ "$patients_code" == "200" ]]; then
    ok "therapist/patients → 200"
  else
    bad "therapist/patients → ${patients_code}"
  fi

  patient_id="$(python3 -c "
import json,sys
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('results',d.get('patients',[]))
print(items[0]['id'] if items else '')
" < /tmp/smoke-patients.json 2>/dev/null || true)"
  if [[ -n "$patient_id" ]]; then
    kery_code="$(curl -sS -o /tmp/smoke-kerykeion.json -w '%{http_code}' -H "$auth_hdr" \
      "${API_BASE}/api/therapist/patients/${patient_id}/astrology-kerykeion/")"
    if [[ "$kery_code" == "200" ]]; then
      multitech="$(python3 -c "
import json,sys
d=json.load(sys.stdin)
ar=d.get('analysis_result') or {}
keys=[k for k in ('transits','progressions','solarReturn') if ar.get(k)]
print(','.join(keys) if keys else 'none')
" < /tmp/smoke-kerykeion.json 2>/dev/null || echo 'parse_error')"
      if [[ "$multitech" != "none" && "$multitech" != "parse_error" ]]; then
        ok "astrology-kerykeion paciente ${patient_id}: analysis_result (${multitech})"
      else
        bad "astrology-kerykeion paciente ${patient_id}: sin analysis_result multitech (¿ASTRO_MULTITECH_ENABLED?)"
      fi
    elif [[ "$kery_code" == "404" ]]; then
      ok "astrology-kerykeion paciente ${patient_id}: 404 (sin carta — estado esperado si no calculada)"
    else
      bad "astrology-kerykeion paciente ${patient_id} → ${kery_code}"
    fi
  else
    echo "  ⚠️  Sin pacientes en lista — omitiendo smoke kerykeion"
  fi
else
  echo "  ⚠️  Sin SMOKE_THERAPIST_TOKEN — omitiendo checks autenticados (D5 parcial)"
fi

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "D5 smoke: PASS"
  exit 0
fi
echo "D5 smoke: FAIL"
exit 1