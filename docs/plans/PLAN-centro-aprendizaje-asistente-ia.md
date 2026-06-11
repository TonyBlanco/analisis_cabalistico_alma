# Plan — Centro de Aprendizaje + Asistente IA de ayuda (app del terapeuta)

> **Objetivo:** dotar a la app del terapeuta (Studios33) de dos piezas de soporte al usuario, **separadas del interprete simbolico**:
> 1. **Centro de Aprendizaje** — un menu/seccion que ensena *como funciona la app* (onboarding, guias por modulo, FAQ, glosario, novedades).
> 2. **Asistente IA de ayuda** — un chatbot anclado en la documentacion de la app que responde dudas de uso ("como hago X?"), distinto del motor de interpretacion clinica/formativa.
>
> **Base:** `main` (hacer `git pull --ff-only origin main` antes de tocar) - prod Hetzner viva (`studios33.app` + `api.studios33.app`) - stack Next.js (BFF) + Django REST + `packages/symbolic` (TS) + LLM via `llm_bridge`/Groq. Lo ejecuta **un agente orquestador con subagentes**.

## Estado Fase 1 (2026-06-11) — ENTREGADO EN PROD

| Entrega | Commits | Prod |
|---------|---------|------|
| Centro de Aprendizaje (`/learn`) | `40bd449b` | ✅ `studios33.app/learn` 200 |
| Asistente IA `POST /api/help/ask` | `40bd449b` | ✅ auth 401 sin token; widget cableado |
| Fix Docker `docs/` en imágenes | `b659616d` | ✅ build web+api OK |
| Consolidación `help_assistant` + seguridad | `3c90cfbf` | ✅ en `main` |

**Tests:** `api.tests.test_help_assistant_api` (4) + `learning-center.test.tsx` (4) verdes.  
**Contrato congelado:** `docs/01_PROJECT_STATE/HELP_ASSISTANT_CONTRACT.md`  
**Pendiente Fase 2:** rate-limit por usuario (AI5), analytics (AN1), capturas/GIF en guías (L4), embeddings si escala el corpus.

## Reglas NO negociables

1. El **Asistente IA de ayuda** responde SOLO sobre *como funciona la app* (anclado en `/docs` + contenido del Centro de Aprendizaje). **No** da diagnostico, consejo personal, etiquetas psicologicas ni interpretacion simbolica del consultante. Si la pregunta es clinica/personal, redirige al modulo correspondiente y declina.
2. **Terminos prohibidos** (`validateSafetyContent`): el asistente de ayuda aplica el filtro completo. El **lexico clinico** (diagnostico, trastorno, patologia...) permanece **gated server-side solo para terapeutas medicos/psiquiatras verificados** (`can_use_clinical_lexicon`, fail-safe `observational`); el asistente de ayuda **NO** levanta ese bloqueo ni lo auto-otorga el cliente.
3. **Sin PHI** en prompts, contexto ni logs del asistente. Grounding solo sobre documentacion de producto, nunca sobre datos de pacientes.
4. **Metering** del asistente reutiliza `AIUsageEvent` (provider real groq) — sin crear ruta de coste paralela.
5. **Gobernanza:** contenido de aprendizaje bajo `/docs` canonico; cada decision/endpoint en `.ai-memory/` con su etiqueta (`[DECISION]`/`[ENDPOINT]`/`[SECURITY]`).

## 0. Alcance y partida

**Que existe hoy (reutilizable):**
- Borde API Django REST + BFF Next.js; auth canonico `Authorization: Token <token>`.
- `llm_bridge`/Groq + `AIUsageEvent` (metering por proveedor) + `validateSafetyContent` (terminos prohibidos).
- Documentacion de producto bajo `/docs` (p. ej. `02_CORE_WORKSPACES`, `05_UX_PRINCIPLES`) — fuente para el grounding del asistente.
- Modulos a documentar ya en prod: Arbol de la Vida, Cabala aplicada, Correspondencias (Hermetico<->Judio), Tarot / Tirada del Arbol (`tree_of_life`), Modo Hibrido (Lectura asistida IA + consentimiento SWM v3), Dashboard de metricas del terapeuta.

**Entregado Fase 1 (2026-06-11):**
- **Centro de Aprendizaje** — `/learn`, menú **Aprender**, guías/FAQ/glosario/novedades bajo `docs/learning-center/`, tour reanudable (localStorage).
- **Asistente IA de ayuda** — `POST /api/help/ask`, índice keyword local sobre `/docs`, widget flotante en workspace terapeuta, metering `help.ask`.

**Pendiente Fase 2:**
- Rate-limit por usuario; analytics de aprendizaje (AN1); capturas/GIF en guías; variante consultante.

## 1. Arquitectura objetivo

```mermaid
flowchart LR
    subgraph FE["Frontend (studios33.app)"]
        MENU["Menu Centro de Aprendizaje"]
        TOUR["Onboarding / tour guiado"]
        GUIAS["Guias por modulo + FAQ + glosario"]
        WIDGET["Widget Asistente IA de ayuda"]
    end
    subgraph API["Borde API (api.studios33.app)"]
        HELP["POST /api/help/ask (RAG)"]
        IDX["Indice de documentacion (embeddings)"]
        SAFE["validateSafetyContent + scope guard"]
        METER["AIUsageEvent (metering)"]
    end
    DOCS["/docs canonico + contenido del Centro"]
    LLM["llm_bridge / Groq"]
    MENU --> TOUR
    MENU --> GUIAS
    WIDGET --> HELP --> IDX --> DOCS
    HELP --> SAFE --> LLM
    HELP --> METER
```

**Principio clave:** el asistente de ayuda es **RAG anclado** (responde citando guias/docs); si no hay grounding suficiente, dice que no lo sabe y enlaza la guia mas cercana — nunca improvisa contenido clinico.

## 2. Workstream L — CENTRO DE APRENDIZAJE

**Meta:** una seccion navegable que ensene a usar la app, con contenido versionado bajo `/docs`.

- [x] **L1 — Inventario y mapa de contenido.** Taxonomía en `learning-center-catalog.ts` + `docs/learning-center/` (primeros pasos, workspaces, modo híbrido, métricas, FAQ, glosario).
- [x] **L2 — Entrada y navegacion.** Item **Aprender** en sidebar terapeuta; rewrite `/learn` → `/dashboard/therapist/learn`; índice + buscador local.
- [x] **L3 — Onboarding / tour guiado.** Tour por anclas del Centro; estado en `localStorage` (`learning-center-tour-state`); sin PHI.
- [x] **L4 — Biblioteca de guias.** Markdown desde `/docs/learning-center/guides/`; enlaces a pantallas reales. _Pendiente:_ capturas/GIF.
- [x] **L5 — FAQ + Glosario + Novedades.** `faq.md`, `glossary.md`, `news.md` renderizados en el Centro.
- [x] **L6 — UX y accesibilidad.** Layout responsive, estados vacíos en widget; principios en `docs/05_UX_PRINCIPLES/README.md`.

## 3. Workstream AI — ASISTENTE IA DE AYUDA

**Meta:** chatbot de soporte de producto, anclado en la documentacion, con seguridad de alcance.

- [x] **AI1 — Indice de documentacion (grounding).** Índice keyword/BM25 en `backend/api/help_assistant/index.py` sobre `/docs` + `learning-center/`; catálogo curado en `catalog.py`. Sin PHI.
- [x] **AI2 — Endpoint RAG `POST /api/help/ask`.** `help_assistant_views.py`; citas + `fallback_guide`; `IsAuthenticated`; metering `help.ask` en `AIUsageEvent`.
- [x] **AI3 — Guard de alcance + seguridad.** `classify_help_scope` (acentos normalizados) + `validateSafetyContent`; declina clínico/formativo antes del LLM.
- [x] **AI4 — Widget de UI.** `LearningAssistantShell` (burbuja fija); sugerencias del catálogo; envía `route` + `locale`; citas y fallback en UI.
- [x] **AI5 — Fallback y limites.** Fallback desde primera cita o guía cercana; mensajes claros en FE/BE. _Pendiente:_ rate-limit por usuario.

## 4. Workstream AN — ANALITICA (opcional, no bloqueante)

- [ ] **AN1 — Senales de aprendizaje.** Conteos agregados (sin PII): guias mas vistas, tasa de finalizacion del tour, top de preguntas al asistente, % respondidas con grounding. Reutiliza el patron de `TherapistMetricsView` (solo agregados).

## 5. Asignacion a agentes (anti-colision)

| Agente | Workstreams | Zona del repo | Rama sugerida |
|---|---|---|---|
| Agente L — Frontend/Contenido | L1–L6 | `tonyblanco-app` (rutas `/learn`, componentes) + `/docs` (contenido) | `feat/learning-center` |
| Agente AI — Backend RAG + Widget | AI1–AI5 | borde API (`/api/help/*`), pipeline de indice, widget | `feat/help-assistant` |
| Agente AN — Metricas (opcional) | AN1 | backend agregados + panel | `feat/learning-analytics` |

**Coordinacion:** ramas separadas, PRs pequenos con tests; el contrato del endpoint `POST /api/help/ask` (request/response + formato de citas) se **congela** antes de que el widget lo consuma; cada decision/endpoint en `.ai-memory/`.

## 6. Definition of Done

- [x] **L** — Centro accesible desde el menu, onboarding funcional, guias por modulo en ES, FAQ + glosario + novedades; contenido bajo `/docs`.
- [x] **AI** — `POST /api/help/ask` en vivo con grounding + citas; widget integrado; guard de alcance (declina clinico) y `validateSafetyContent` activos; metering en `AIUsageEvent`; sin PHI en logs.
- [x] **Seguridad** — el asistente nunca emite diagnostico/consejo; lexico clinico sigue gated solo a verificados server-side; tests de "fuera de alcance" y "sin terminos prohibidos" verdes.
- [x] **Global** — suites BE/FE verdes, `.ai-memory` actualizada, docs bajo `/docs`, smoke prod `/learn` 200 (2026-06-11).

## 7. Decisiones fijadas (handoff autonomo)

1. **Alcance del asistente:** SOLO ayuda de uso de la app (no interpretacion formativa/clinica) — *decision del usuario, 11 jun*. Para cualquier consulta interpretativa, redirige al interprete simbolico.
2. **Audiencia:** Fase 1 = terapeutas. Variante para consultante/paciente queda como fase 2 opcional (mismo motor, distinto corpus y tono).
3. **Contenido inicial:** partir del contenido existente en `/docs` y completar las guias que falten; no redactar desde cero lo que ya tiene fuente canonica.
4. **RAG:** indice ligero local sobre `/docs` como base (sin dependencia de vector store externo); usar embeddings si ya hay infra, si no, recuperacion keyword/BM25 + re-ranking.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| El asistente se desvia a consejo clinico | Guard de alcance + `validateSafetyContent` + grounding obligatorio; declina y redirige |
| Respuestas inventadas (sin base en docs) | RAG con citas; si no hay grounding suficiente -> "no lo se" + guia cercana |
| Fuga de PHI al LLM | Solo se indexa documentacion de producto; nunca datos de pacientes en prompt/log |
| Solapamiento con el interprete simbolico | Separacion de alcance explicita; el asistente redirige al modulo para lo interpretativo |
| Contenido del Centro desactualizado | Contenido versionado en `/docs`; re-indexado del RAG al actualizar guias |

## 9. Handoff — Orquestacion con subagentes

Plan **global y autocontenido**: se entrega a **un solo agente orquestador** que reparte en subagentes (Contenido/Frontend / IA/Backend / QA).

```
PROMPT ORQUESTADOR — Centro de Aprendizaje + Asistente IA de ayuda

Repo: TonyBlanco/analisis_cabalistico_alma (default main). git pull --ff-only origin main antes de tocar.
Ramas: feat/learning-center (Centro) y feat/help-assistant (Asistente). PRs pequenos.

Alcance FIJADO: el asistente responde SOLO sobre como funciona la app (NO interpretacion clinica/formativa). RAG anclado en /docs con citas; sin grounding suficiente -> responde "no lo se con certeza" + enlaza la guia mas cercana. Sin PHI en prompt/indice/logs. Metering via AIUsageEvent. El lexico clinico NO se levanta (sigue gated a medicos/psiquiatras verificados server-side).

Reparte en subagentes:
- SUB-CONTENIDO/FRONT: L1-L6 (menu /learn, onboarding/tour, guias desde /docs, FAQ, glosario, novedades) + AI4-AI5 (widget de ayuda + fallback).
- SUB-IA/BACKEND: AI1 (indice ligero sobre /docs) + AI2 (POST /api/help/ask con citas, IsAuthenticated, metering en AIUsageEvent) + AI3 (guard de alcance + validateSafetyContent).
- SUB-QA: tests de fuera-de-alcance (declina clinico) y sin-terminos-prohibidos; tsc --noEmit; vitest; smoke.

Congela el contrato de /api/help/ask (request/response + formato de citas) antes de que el widget lo consuma. Cada decision/endpoint en .ai-memory/. Reporta de vuelta para verificacion antes de mergear.
```
