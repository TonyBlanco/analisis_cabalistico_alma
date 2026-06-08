# Auditoría Fase 3 — Módulo Astrología
**Fecha:** 2026-06-08  
**Estado previo:** ~80% operativo — 3 bloques Phase 3 explícitamente desactivados  
**Objetivo:** Activar los 3 bloques y llevar el módulo a 100%

---

## Resumen ejecutivo

El módulo de astrología tiene backend completo (14 endpoints activos) y frontend completo (2 908 líneas). Los 3 bloques Phase 3 son desactivaciones conscientes que dejaron stubs o `{false ? (`. Ningún bloque requiere nueva arquitectura — solo wiring de lo que ya existe.

---

## Mapa de estado antes de esta sesión

### ✅ Funciona en producción

| Función | Backend endpoint | FE |
|---|---|---|
| Carta natal (cálculo + rueda SVG) | `natal-chart` GET/POST | ✅ |
| Tránsitos | `transits` | ✅ |
| Progresiones secundarias | `progressions` | ✅ |
| Arco solar | `solar-arc` | ✅ |
| Retorno solar (año parametrizable) | `solar-return` | ✅ |
| Sinastría / doble rueda | `synastry` | ✅ |
| Carta compuesta / Davison | `composite-chart`, `davison-chart` | ✅ |
| Armónicos | `harmonics` | ✅ |
| Estrellas fijas | `fixed-stars` | ✅ |
| Partes arábigas | `arabic-parts` | ✅ |
| Relocalización | `relocation` | ✅ |
| `AIInterpretationPanel` (renderiza, fetch) | `interpretations/` | ✅ |
| `AISituationChat` (renderiza) | — | ✅ |

---

## Bloque 1: AI Snippets desactivados por feature flag

### Diagnóstico

| Fichero | Línea | Detalle |
|---|---|---|
| `backend/core/settings.py` | 288 | `KERYKEION_AI_SNIPPETS_ENABLED = config('KERYKEION_AI_SNIPPETS_ENABLED', default=False, cast=bool)` — default hardcoded a `False` |
| `backend/api/astrology_kerykeion/ai_snippets.py` | 201-202 | Constructor de `AstrologyKabbalahSnippetAI` retorna early si el flag es falso |
| `backend/api/astrology_kerykeion/normalizer.py` | 291 | `enable_ai_snippets = bool(getattr(settings, 'KERYKEION_AI_SNIPPETS_ENABLED', False))` |
| `backend/.env.gemini` | — | `GEMINI_API_KEY` y `GEMINI_MODEL=gemini-1.5-flash` ya configurados (**archivo versionado** — rotar key si se expuso; preferir solo local + `.env` en servidor) |

**python-decouple** lee `.env` en `BASE_DIR` o variables de entorno OS. El archivo `.env.gemini` NO es cargado automáticamente — es para uso manual (`source backend/.env.gemini`) o para copiar a `.env`.

### Fix

Añadir `KERYKEION_AI_SNIPPETS_ENABLED=True` a `backend/.env.gemini`. El desarrollador ya sourcea este archivo manualmente para tener la `GEMINI_API_KEY` activa.

En **producción (Render/Hetzner)**: añadir las dos vars `GEMINI_API_KEY` y `KERYKEION_AI_SNIPPETS_ENABLED=True` al panel de env vars del hosting.

### Riesgo: BAJO
El constructor de `AstrologyKabbalahSnippetAI` maneja todos los casos de error (sin key, sin SDK, etc.) con `self.error_message` sin romper nada.

---

## Bloque 2: PDF export — función stub vacía

### Diagnóstico

| Fichero | Línea | Detalle |
|---|---|---|
| `AstrologyProfessionalView.tsx` | 683-684 | `// PDF export intentionally disabled in this phase.` seguido de función vacía `async (_elementId, ...) => { }` |
| `AstrologyProfessionalView.tsx` | 2096 | Botón "Exportar PDF" llama a `exportComparativeAsPDF('compare-solar-return', ...)` |
| `AstrologyProfessionalView.tsx` | 2133 | Botón "Exportar PDF" llama a `exportComparativeAsPDF('compare-progressions', ...)` |
| `tonyblanco-app/package.json` | 32, 34, 41 | `html2canvas@^1.4.1`, `jspdf@^3.0.4`, `svg2pdf.js@^2.2.4` — todas instaladas |

**Targets DOM:**
- `id="compare-solar-return"` — div con `AstroDoubleWheelAdvanced` (SVG inline)
- `id="compare-progressions"` — div con `AstroWheelAdvanced` (SVG inline)

### Fix

Implementar `exportComparativeAsPDF` con `html2canvas` → `jspdf`:
1. `html2canvas(document.getElementById(elementId), { useCORS: true, scale: 2 })` — scale 2 para calidad
2. `new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })`
3. `pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)`
4. `pdf.save(filename)`

**Nota SVGs:** `html2canvas` con SVGs inline funciona sin SVG2PDF cuando el SVG está embebido en el DOM. Si aparece en blanco, fallback: serializar el SVG y convertirlo directamente.

### Riesgo: MEDIO
html2canvas puede rendir SVGs complejos de forma imperfecta. El fallback es mostrar un toast de error en lugar de silenciar el fallo.

---

## Bloque 3: Timeline UI bloqueada con `{false ? (`

### Diagnóstico

| Fichero | Línea | Detalle |
|---|---|---|
| `AstrologyProfessionalView.tsx` | 1580-1581 | Comentario: *"Phase 3: timeline UI remains disabled until backend supports targeting specific years/months for returns"* + `{false ? (` |
| `AstrologyProfessionalView.tsx` | 237-238 | Estados `symbolicSolarReturnYear` (null init) y `symbolicLunarReturnDate` (null init) ya declarados |
| `AstrologyProfessionalView.tsx` | 1073-1075 | Los setters se pasan al sidebar — el sidebar YA puede setear estos valores |
| `AstrologyProfessionalView.tsx` | 1629-1656 | Bloque de comparación A/B con **texto HARDCODEADO**: "Año A — énfasis simbólico: consolidación y centrado identitario." |
| `AstrologyProfessionalView.tsx` | 1957 | `const body: any = { method: 'solar_return', year: solarReturnYear }` — el backend YA acepta `year` |

**El comentario "backend doesn't support it" está DESACTUALIZADO.** `SolarReturnView` acepta `year` desde el inicio. El bloqueo real es el texto hardcodeado en la sección de comparación A/B.

**Estado real de los estados:**
- `symbolicSolarReturnYear` — slider simbólico de año (NO dispara llamada backend, es display-only)
- `symbolicLunarReturnDate` — slider de mes lunar (display-only)
- `solarReturnYearComparison` (useMemo línea 943) — calcula cross-aspects REALES basados en los dos años

### Fix

1. Cambiar `{false ? (` → `{(symbolicSolarReturnYear !== null || symbolicLunarReturnDate !== null) ? (`
2. Sustituir el bloque de texto hardcodeado `<ul>` (líneas 1648-1652) por mensaje *"Disponible cuando se activen los aspectos cruzados."* — los datos reales ya están en el panel de cross-aspects más abajo.

### Riesgo: BAJO
Los estados ya están declarados e inicializados. La condición `!== null` hace que el bloque solo aparezca cuando hay datos reales del sidebar.

---

## Secuencia de implementación

```
1. backend/.env.gemini  → añadir KERYKEION_AI_SNIPPETS_ENABLED=True
2. AstrologyProfessionalView.tsx:684  → implementar exportComparativeAsPDF
3. AstrologyProfessionalView.tsx:1581 → habilitar timeline + limpiar texto hardcodeado
```

## Commit plan

```
fix(astrology): activate phase 3 — ai snippets flag, pdf export, timeline ui
```

---

## Post-fix verificado (commit `22b26a5e`, 2026-06-08)

| Bloque | Fix aplicado | Verificación en código |
|--------|--------------|------------------------|
| **AI Snippets** | `KERYKEION_AI_SNIPPETS_ENABLED=True` en `backend/.env.gemini` | ✅ Línea añadida en commit. `settings.py` sigue con `default=False` — en prod la var debe estar en el `.env` del contenedor |
| **PDF export** | `exportComparativeAsPDF` con lazy `html2canvas` + `jspdf`, `scale: 2` | ✅ `AstrologyProfessionalView.tsx` ~683–697; botones en `compare-solar-return` y `compare-progressions` |
| **Timeline UI** | `{false ? (` → condición real; texto fake → `solarReturnYearComparison` | ✅ Condición `(symbolicSolarReturnYear !== null \|\| symbolicLunarReturnDate !== null)` ~1593; hits A/B ~1662–1672 |

### Producción (Render / Hetzner) — pendiente operativo

El commit **no** activa snippets en servidor por sí solo. Añadir en `/opt/studio33/.env` (o panel Render):

```bash
GEMINI_API_KEY=<clave>
KERYKEION_AI_SNIPPETS_ENABLED=True
```

Plantilla actualizada: `deploy/studios33/env.example`.

El `deploy.sh` copia `GEMINI_API_KEY` desde `/opt/voxtvserver/.env` al crear `.env` inicial, pero **no** inyecta `KERYKEION_AI_SNIPPETS_ENABLED` — hay que patch manual o script hasta automatizarlo.

### Gaps menores post-fix

- PDF: fallo capturado con `console.error`, no toast UI (audit sugería toast).
- Timeline: sliders son display-only; no disparan nuevo `solar-return` por año — coherente con “lectura simbólica”.
- `backend/.env.gemini` está en git con key real → **rotar `GEMINI_API_KEY` en Google AI Studio** y mover secretos a env servidor / gitignore.

---

## Post-fix: qué queda fuera de alcance

- **SCL-90 FE questionnaire**: backend engine listo (`scl90_bank.py`), FE form no construido — ver `TEST_CATALOG_WIRING.md`
- `asrs_essence` y `stress` — ver migración `0090` y registry FE
- **Process Memory planai Phase 1** (P0 del audit doc)
- **Cábala RAG** (P2)
- Build Tarot: resuelto en `62a76898` (posteriores a la nota del commit `22b26a5e`)
