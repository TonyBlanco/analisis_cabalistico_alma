# Auditoría — Astrología Tarot (SWM)

**URL:** https://studios33.app/dashboard/therapist/astrologia-tarot  
**Ruta canónica:** `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/astrologia-tarot/`  
**Redirect legacy:** `/dashboard/therapist/tarot` → `astrologia-tarot`  
**Fecha:** 2026-06-08

---

## Resumen ejecutivo

El workspace **funciona** (SWM backend, sesiones, guardado, IA holística en Thoth). Lo que confunde al usuario son **etiquetas desincronizadas**: el sidebar marca 4 sistemas como «EN PREPARACIÓN» mientras el panel central tiene `isSystemImplemented = true` hardcodeado y los datos simbólicos de varios mazos **ya existen** en `packages/symbolic/tarot/decks/`.

| Capa | Estado |
|------|--------|
| SWM API (`/api/swm/tarot/`) | ✅ Operativo |
| Workspace UI (secciones sidebar) | ✅ Operativo |
| Sistemas simbólicos (sidebar derecho) | ⚠️ Labels obsoletos |
| Sección **Correspondencias** | 🔴 Stub (1 línea de texto) |
| Sección **Preparar Análisis IA** | 🟡 Thoth/BOTA completas; resto parcial |

---

## Secciones del sidebar (izquierda)

| Sección | UI | Backend | Notas |
|---------|----|---------|-------|
| Carta Natal | ✅ | ✅ `free` | 3 cartas del mazo genérico |
| Tirada del Árbol | ✅ | ✅ `tree_of_life` | `TarotDrawPanel` |
| Tirada Libre | ✅ | ✅ `free` | `TarotDrawPanel` |
| Correspondencias | 🔴 | — | Solo placeholder; no tabla de mapeos |
| Visualizar Mazo | ✅ | — | Grid `ARCANOS_MAYORES` + BOTA images si `bota` |
| Preparar Análisis IA | 🟡 | ✅ SWM v3 | Form + consent + Groq; depende del sistema |

---

## Sistemas simbólicos (sidebar — «Sistemas simbólicos»)

Estado **real** (código + backend), no solo UI:

| Sistema | FE `packages/symbolic` | SWM v3 `implemented` | Django `TarotSystem` | Sidebar (antes) | Tier propuesto |
|---------|------------------------|----------------------|----------------------|-----------------|----------------|
| **Thoth** | ✅ `thoth.ts` | ✅ true | ✅ `thoth` | Implementado | **full** |
| **B.O.T.A.** | ✅ `bota.ts` + JSON backend | ✅ true | ✅ `bota` | En preparación ❌ | **full** |
| **Golden Dawn** | ✅ `golden-dawn.ts` | ❌ false | ✅ `golden-dawn` | En preparación | **educational** |
| **Hermetic** | ✅ `hermetic.ts` | ❌ false | alias → `golden-dawn` | En preparación | **educational** |
| **Sephiroth** | ✅ `sephiroth.ts` | ❌ false | alias → `bota` | En preparación | **educational** |

### Contradicciones detectadas

1. **`AstrologyTarotSidebar.tsx`** — solo `thoth` = `implemented`; el resto `preparing`.
2. **`AstrologyTarotVisualCore.tsx` línea 193** — `const isSystemImplemented = true` (ignora sidebar).
3. **`index.tsx` `systemIdToBackend`** — hermetic→golden-dawn, sephiroth→bota (correcto pero no documentado en UI).
4. **`swm_v3/views.py`** — `generate_educational_reading` carga deck JSON solo para `thoth`, `bota`, `tarot-cabalistico`; otros usan fallback genérico.
5. **`deckCards`** — siempre `ARCANOS_MAYORES` genérico; no cambia imágenes por sistema (salvo BOTA SVG en tiradas).

---

## Codex / Grok / Claude — memoria multi-agente

| Agente | Auto-carga memoria |
|--------|-------------------|
| **Grok CLI** | ✅ `AGENTS.md` + `CLAUDE.md` al iniciar |
| **Cursor (Grok)** | ✅ `.cursor/rules/agent-memory.mdc` |
| **Claude Code** | ✅ `CLAUDE.md` + hooks Stop (`sync-session`) |
| **Codex** | Manual: leer `CODEX_CONTEXT.md` (generado al cerrar sesión Claude) |

Ritual común: `AGENTS.md` → `.ai-memory/active/session_context.md`

---

## Plan de implementación

### PR-1 — Alineación honesta (rápido) ✅ hecho

- `lib/tarotSystems.registry.ts` — fuente única de tiers.
- `AstrologyTarotSidebar.tsx` + `AstrologyTarotVisualCore.tsx` leen `tier` del registry.
- BOTA → **full**; Golden Dawn / Hermetic / Sephiroth → **educational** (mapeo local, sin SWM v3).
- Correspondencias muestra mapeo local cuando hay carta seleccionada.

### PR-2 — Correspondencias reales

- Panel que muestra mapeo de la carta seleccionada desde el deck del sistema activo (ya hay `useMemo` por sistema en VisualCore).
- Reutilizar bloque de «Sistema simbólico activo» para la sección `tarot-correspondences`.

### PR-3 — Backend SWM v3

- `get_system_metadata`: `golden-dawn` → `implemented: true` (educational).
- `generate_educational_reading`: cargar mapeos golden-dawn / hermetic / sephiroth desde symbolic package o JSON.

### PR-4 — Mazo visual por sistema

- Imágenes Thoth / Hermetic separadas de Rider-Waite genérico (assets o SVG BOTA ampliado).

### PR-5 — Tests E2E

- Smoke: seleccionar paciente → crear workspace → tirada → guardar → IA consent Thoth.

---

## Verificación en prod

```bash
# API (con token terapeuta)
curl -s https://api.studios33.app/api/swm/tarot/ -H "Authorization: Token …"
```

UI: paciente activo en header del workspace terapeuta; sin paciente, sesión SWM puede fallar al crear instancia.

---

## Referencias

- `AUDITORIA_TAROT_SWM.md` (2026-01, parcialmente desactualizado)
- `docs/AUDIT_SWM_MODULES.md`
- `components/AstrologyTarotWorkspace/README.md` (dice «placeholders» — desactualizado vs código)