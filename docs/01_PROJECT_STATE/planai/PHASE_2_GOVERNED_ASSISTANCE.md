# Fase 2 — Asistencia IA gobernada (sin entrenamiento)

**Plan maestro:** [planai.md](../../../planai.md)  
**Estado:** Implementado (2026-06-05)  
**Depende de:** Fase 0 (router unificado)  
**No depende de:** Fase 1 RAG (opcional; v2 añade contexto de procesos)  
**ADR:** No fine-tuning, LoRA, PEFT, custom training loops, ni model checkpoints.

---

## Objetivo

Exponer asistencia IA **educativa / exploratoria** para Cábala y bioemoción, con guardrails post-LLM y feedback almacenado para mejora futura vía prompts/RAG (no vía entrenamiento de pesos).

## Alcance

| Endpoint | Lane | Comportamiento |
|----------|------|----------------|
| `POST /api/ai/kabbalah/interpret/` | `symbolic` | Input `tree_structural_state` JSON → texto educativo |
| `POST /api/bioemotional/synthesis/<uuid>/assist-draft/` | `clinical_support` | Borrador IA; **no** cierra ni publica síntesis |
| `POST /api/ai/feedback/` | — | Rating 1–5 + corrección opcional |
| `GET /api/ai/status/` | — | (Fase 0) providers |

## Flags (`settings.py`)

```env
AI_KABBALAH_ENABLED=true
AI_BIOEMOTION_DRAFT_ENABLED=true
```

## Módulos nuevos

| Módulo | Rol |
|--------|-----|
| `api/ai/guardrails.py` | Términos prohibidos, validación salida |
| `backend/ai/prompts/planai_agent_core_v1.yaml` | System prompt PlanAI (lanes symbolic \| clinical_support) |
| `backend/ai/prompts/kabbalah_interpret_v1.yaml` | Prompt dominio cábala (lane symbolic, TreeStructuralState) |
| `api/ai/prompt_registry.py` | Carga YAML + placeholders `{RAG_CONTEXT}`, `{USER_TASK}`, … |
| `backend/ai/prompts/bioemotional_draft_v1.yaml` | Prompt dominio bioemoción (lane clinical_support) |
| `api/ai/prompts.py` | Builders kabbalah / bioemotion → `render_prompt()` |
| `api/ai/governed_views.py` | Vistas Fase 2 |
| `api/models.py` + migración | `AIInteractionFeedback` |

## Guardrails (mínimo v1)

- Rechazar salida con términos de diagnóstico DSM/categórico fuerte
- Rechazar imperativos absolutos («debes», «siempre», «nunca»)
- Respuesta `guardrail_violation` + código, sin persistir texto violado como verdad

## Bioemoción — humano en el loop

1. Terapeuta tiene síntesis abierta (`is_closed=false`).
2. `assist-draft` genera texto sugerido en campo separado o respuesta JSON `draft_text`.
3. Terapeuta edita manualmente y guarda con `POST synthesis` existente.
4. Solo al **cerrar** síntesis el contenido es “oficial” (sin auto-publish desde IA).

## Cábala — determinismo preservado

- El árbol y números siguen en motores `swm/cabala/services/*`.
- La IA solo redacta capa interpretativa a partir de `TreeStructuralState` ya calculado.

## Feedback (aprendizaje sin training)

`AIInteractionFeedback` guarda:

- `feature` (`kabbalah_interpret`, `bioemotion_draft`, …)
- `provider`, `prompt_version`
- `rating`, `correction_text` (opcional)
- `patient_id`, `therapist_id` (ownership)

Uso futuro (Fase 1): pesos RAG y revisión de prompts — **no** gradientes.

## Criterios de salida

1. Endpoints detrás de flags y `IsAuthenticated`.
2. Terapeuta solo accede pacientes propios (bioemotional permissions).
3. Tests `test_ai_governed` con LLM mockeado pasan.
4. Cero referencias a fine-tune en código Fase 2.

## Verificación

```bash
cd backend && python manage.py test \
  api.tests.test_ai_governed \
  api.tests.test_ai_router_integration \
  api.tests.test_planai_eval_harness -v2
```

Eval harness: 50 salidas simuladas en `api/tests/planai_eval_cases.py` (sin red).

## Commits y producción

- Ver PHASE_0 doc (hashes git).
- **Prod:** `https://api.studios33.app/api/ai/kabbalah/interpret/`, `…/bioemotional/synthesis/<uuid>/assist-draft/`, `…/api/ai/feedback/`
- **Tests servidor:** 35 OK (incl. harness 50 en `planai_eval_cases.py`)