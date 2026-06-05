# Fase 1 — Process Memory + RAG mínimo

**Plan maestro:** [planai.md](../../../planai.md)  
**Estado:** Implementado base (2026-06-05)  
**Depende de:** Fase 0 router LLM, Fase 2 feedback gobernado  
**ADR:** Sin fine-tuning, sin embeddings externos obligatorios, sin llamadas de red en tests.

## Objetivo

Crear una capa inicial de memoria de proceso para que PIP capture eventos y snapshots reutilizables por RAG, manteniendo ownership terapeuta-paciente y minimización de PHI.

## Alcance implementado

| Pieza | Estado |
|---|---|
| `ProcessEvent` | Evento normalizado con `event_type`, `lane`, `source_type`, `source_id`, `payload` |
| `ProcessSnapshot` | Snapshot por dominio/lane con `structured`, `text_summary`, `consent_scope`, `base_weight` |
| `EmbeddingChunk` | Chunk asociado a snapshot con `embedding` JSON local/mockeable |
| Ownership | Servicios rechazan paciente que no pertenece al terapeuta |
| PHI mínima | Sanitización básica de email, teléfono y nombres del paciente en `text_summary` |
| Ingesta bioemocional | `BioEmotionalSynthesis.is_closed=True` crea/actualiza snapshot |
| Ingesta AnalysisRecord | `AnalysisRecord` con terapeuta+paciente crea/actualiza snapshot |
| Ingesta tarot | Servicio `ingest_tarot_seal()` listo para wiring desde SWM Tarot |
| RAGService | `retrieve()` filtra por terapeuta, paciente, lane, consentimiento y `top_k` |
| Feedback → peso | Feedback con `rating >= 4` y `correction_text` apuntando al snapshot sube ranking |

## Contratos de código

- Modelos: `api.models.ProcessEvent`, `api.models.ProcessSnapshot`, `api.models.EmbeddingChunk`
- Servicios: `api.process_memory.services`
- Ingesta: `api.process_memory.ingestion`
- Señales: `api.process_memory.signals`, registradas desde `ApiConfig.ready()`
- Migración: `api/migrations/0089_process_memory_phase1.py`

## Límites actuales

- `RAGService.retrieve()` usa ranking lexical simple; no calcula similitud vectorial real todavía.
- `EmbeddingChunk.embedding` acepta vectores JSON, pero no llama a Ollama ni descarga modelos.
- La ingesta directa de seal Tarot está expuesta como servicio; falta conectarla al endpoint SWM Tarot real.
- La sanitización PHI es defensiva básica; antes de usar contexto cross-patient/global se requiere anonimización más fuerte.

## Verificación

```bash
cd backend
DEBUG=True python manage.py test api.tests.test_process_memory -v2
DEBUG=True python manage.py test api.tests.test_ai_* api.tests.test_planai_* -v2
```

En shells `zsh`, resolver los comodines a módulos reales o escapar/expandirlos desde script, porque `manage.py test` no acepta patrones literales `test_ai_*`.

## Siguiente paso

1. Conectar `ingest_tarot_seal()` al seal real de SWM Tarot.
2. Añadir backend de embeddings local con Ollama `nomic-embed-text`.
3. Sustituir ranking lexical por similitud vectorial cuando exista pgvector o Qdrant.
4. Añadir política de anonimización ampliada antes de RAG global o cross-session no estrictamente propio.
