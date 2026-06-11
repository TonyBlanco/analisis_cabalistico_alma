# Help Assistant Contract

**Estado:** IMPLEMENTADO · prod desde `40bd449b` (2026-06-11)  
**Implementación:** `backend/api/help_assistant_views.py` · índice `backend/api/help_assistant/`  
**Tests:** `backend/api/tests/test_help_assistant_api.py`  
**Metering:** `task_type=help.ask` en `AIUsageEvent`

`POST /api/help/ask`

## Request

```json
{
  "query": "Como veo las guias?",
  "route": "/dashboard/therapist",
  "screen": "workspace",
  "locale": "es"
}
```

- `query` is required.
- `route`, `screen`, and `locale` are optional context hints.
- No PHI is allowed in any field.

## Response

```json
{
  "success": true,
  "answer": "Texto util de ayuda.",
  "citations": [
    {
      "title": "Principios UX del workspace",
      "path": "docs/architecture/UX_WORKSPACE_PRINCIPIOS.md",
      "excerpt": "..."
    }
  ],
  "fallback_guide": {
    "title": "Inicio y arranque del proyecto",
    "path": "docs/01_PROJECT_STATE/README-STARTUP.md"
  },
  "grounding": "high",
  "provider": "groq",
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

## Notes

- The assistant only answers product-usage questions.
- Clinical or formative interpretation requests are declined and redirected.
- If grounding is insufficient, the assistant says it cannot know with certainty and points to the closest guide.
- Citations are always repo-relative `docs/...` paths.

