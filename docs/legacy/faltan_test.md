---
ESTADO: HISTÓRICO / NO VIGENTE
FECHA_MOVIMIENTO: 2026-01-10
MOTIVO: Contradicción con Fuente de Verdad actual
REFERENCIA: symbolic_contradictions_matrix.csv
---

# Tests pendientes del marketplace

Fuente del catálogo: [backend/initialize_tests.py](backend/initialize_tests.py) (25 módulos definidos). Revisión de UI: [tonyblanco-app/app/tests](tonyblanco-app/app/tests).

## Tests que requieren página/flujo dedicado
- basic-analysis — sin página específica; hoy solo podría usarse vía la genérica [tests/[code]](tonyblanco-app/app/tests/%5Bcode%5D/page.tsx).
- couple-compatibility — sin UI propia; depende de la genérica, faltan vista y presentación de resultados ricos.
- career-guidance — no existe en app/tests.
- spiritual-path — no existe en app/tests.
- health-wellness — no existe en app/tests.
- family-relations — no existe en app/tests.
- life-purpose — no existe en app/tests.
- past-lives — no existe en app/tests.
- ptsd-check — el code en backend no coincide con la ruta presente [app/tests/ptsd](tonyblanco-app/app/tests/ptsd); confirmar alias o renombrar.

## Tests ya cubiertos con páginas dedicadas
- complete-numerology → [app/tests/complete-numerology](tonyblanco-app/app/tests/complete-numerology)
- professional-pai → [app/tests/professional-pai](tonyblanco-app/app/tests/professional-pai)
- financial-abundance → [app/tests/financial-abundance](tonyblanco-app/app/tests/financial-abundance)
- bdi-ii → [app/tests/bdi-ii](tonyblanco-app/app/tests/bdi-ii)
- bai → [app/tests/bai](tonyblanco-app/app/tests/bai)
- phq-9 → [app/tests/phq-9](tonyblanco-app/app/tests/phq-9)
- gad-7 → [app/tests/gad-7](tonyblanco-app/app/tests/gad-7)
- ocd-screen → [app/tests/ocd](tonyblanco-app/app/tests/ocd)
- insomnia-index → [app/tests/insomnia](tonyblanco-app/app/tests/insomnia)
- adhd-adult → [app/tests/adhd](tonyblanco-app/app/tests/adhd)
- substance-use → [app/tests/substance](tonyblanco-app/app/tests/substance)
- eating-disorder → [app/tests/eating](tonyblanco-app/app/tests/eating)
- scl-90 → [app/tests/scl-90](tonyblanco-app/app/tests/scl-90) (y variante [scl-90-r](tonyblanco-app/app/tests/scl-90-r))
- stai → [app/tests/stai](tonyblanco-app/app/tests/stai)
- mcmi-iv → [app/tests/mcmi-iv](tonyblanco-app/app/tests/mcmi-iv)
- scid5 → [app/tests/scid5](tonyblanco-app/app/tests/scid5) y [app/tests/scid-5-rv](tonyblanco-app/app/tests/scid-5-rv)
- cabalistic-astrology → [app/tests/cabalistic-astrology](tonyblanco-app/app/tests/cabalistic-astrology)
