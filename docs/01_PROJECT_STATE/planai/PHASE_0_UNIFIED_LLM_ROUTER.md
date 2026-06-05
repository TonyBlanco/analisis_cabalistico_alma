# Fase 0 — Router LLM unificado (sin entrenamiento)

**Plan maestro:** [planai.md](../../../planai.md)  
**Estado:** Implementado (2026-06-05)  
**ADR:** No fine-tuning, LoRA, PEFT, custom training loops, ni model checkpoints.

---

## Objetivo

Un solo camino de inferencia en el backend: `generate_with_fallback()` (`api/utils/multi_ai_service.py`), con orden **free-first** (Groq → Gemini → OpenAI → Ollama).

## Alcance

| Incluido | Excluido |
|----------|----------|
| Refactor `holistic_ai`, `tarot_service`, `symbolic_interpreter_ai`, MSHE, `ai_views` | RAG / Process Memory (Fase 1) |
| `GET /api/ai/status/` | Endpoints kabbalah/bioemotion (Fase 2) |
| Tests unitarios de prompts (mock, sin red) | Fine-tune / LoRA / checkpoints |
| Redacción de API key en `docs/technical/README_AI.md` | Cambios frontend |

## Archivos a tocar

| Archivo | Cambio |
|---------|--------|
| `api/ai/llm_bridge.py` | **Nuevo** — `is_llm_available`, `generate_text`, `get_provider_status` |
| `api/utils/multi_ai_service.py` | `AI_PROVIDER=free_first`, métrica última llamada |
| `api/utils/holistic_ai.py` | Inferencia vía bridge |
| `api/utils/tarot_service.py` | Inferencia vía bridge |
| `api/utils/symbolic_interpreter_ai.py` | Inferencia vía bridge |
| `api/holistic_synthesis_engine.py` | `generate_ai_analysis` vía bridge |
| `api/ai_views.py` | Query holística vía bridge |
| `api/ai/status_views.py` | **Nuevo** — status endpoint |
| `api/urls.py` | Ruta `ai/status/` |
| `core/settings.py` | Documentar `free_first` |
| `api/tests/test_ai_llm_bridge.py` | **Nuevo** |
| `docs/technical/README_AI.md` | Quitar secretos de ejemplo |

## Criterios de salida

1. Con solo `GROQ_API_KEY` en `.env`, `GET /api/ai/status/` devuelve `groq` disponible.
2. `POST /api/ai/holistic-query/` responde sin exigir Gemini.
3. Tests `test_ai_llm_bridge` pasan sin llamadas HTTP reales.
4. Ningún archivo nuevo menciona training/fine-tune.

## Verificación

```bash
cd backend && python manage.py test \
  api.tests.test_ai_llm_bridge \
  api.tests.test_ai_router_integration \
  api.tests.test_planai_eval_harness -v2
curl -s http://localhost:8000/api/ai/status/
```

CI: `.github/workflows/pip-ai-tests.yml`

## Commit asociado

- **Pre-código:** `docs(planai): phase 0 and 2 specs — no training`
- **Implementación:** `feat(ai): phase 0 unified LLM router (free-first, no training)`