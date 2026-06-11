# Agent Action Log

> Auto-appended by memory_manager.py on every `store` call.
> Run `python3 memory_manager.py prune` to remove duplicates and archive old entries.

---

<!-- Entries are appended automatically below this line -->

## [2026-06-08 14:57 UTC] Claude
[DECISION] AI Memory Layer installed — multi-agent coordination via AGENTS.md and .ai-memory/

## [2026-06-08 14:59 UTC] Grok
[DECISION] sync-session auto-updates session_context.md on session end — Groq/Claude agents

## [2026-06-08 15:17 UTC] Claude
[DECISION] Tarot PR-1: tarotSystems.registry wired to Sidebar+VisualCore — tiers full/educational/preparing

## [2026-06-08 15:20 UTC] Claude
[DEPLOY] Tarot PR-1 f73e43b1 — Hetzner studios33.app; nginx reload manual tras test embeddings fallido

## [2026-06-10 17:22 UTC] Claude
[DEPLOY] PR1 informes astrología en prod studios33.app — main 91363fcb (feat 75ef02f9 + fix migración 91363fcb); migración 0094 aplicada

## [2026-06-10 17:40 UTC] Claude
[BUG] Pestaña Informe enterrada bajo scroll — movida a barra sticky bajo header; desplegado 8faee262

## [2026-06-10 18:34 UTC] Claude
[DECISION] AI Usage Metering spec — ledger AIUsageEvent por terapeuta, todos módulos IA, base+créditos+overage; doc canónico docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md; código Fase 1 pendiente

## [2026-06-10 18:37 UTC] Claude
[ENDPOINT] AI Usage Metering Fase 1 — AIUsageEvent + usage_meter + llm_bridge usage_context + astrología token_count + GET /api/therapist/ai-usage/

## [2026-06-10 18:47 UTC] Claude
[DEPLOY] Metering Fase 2 + cableado snippets/gematria/tarot — deploy Hetzner 2026-06-10, migración 0096 OK, patch-ai-metering-env

## [2026-06-11 17:50 UTC] Claude
[ENDPOINT] GET /api/therapist/dashboard/ workload block — consultantes, tests, avance; D1-D6 feat/therapist-dashboard-revamp

## [2026-06-11 17:56 UTC] Claude
[DEPLOY] dashboard terapeuta workload — prod smoke OK workload+web 200; merge main f079f7a8

## [2026-06-11 18:08 UTC] Claude
[ENDPOINT] POST /api/help/ask — RAG local sobre /docs + learning-center; guard alcance clínico; metering help.ask

## [2026-06-11 18:15 UTC] Claude
[DEPLOY] Centro Aprendizaje + Help Assistant — main b659616d; prod /learn 200, help/ask 401 sin auth; fix Dockerfile docs/

## [2026-06-11 18:34 UTC] Claude
[SECURITY] GEMINI_API_KEY AIzaSyBGP6… (REVOCADA, valor no versionado) ROTADA — expuesta en backend/.env.gemini (commit e182c040) y docs/technical/README_AI.md; key vaciada en working tree; nueva clave va SOLO en /opt/studio33/.env Hetzner; purga historial pendiente con git filter-repo (instrucciones en GEMINI_KEY_PURGE.md)

## [2026-06-11 18:34 UTC] Claude
[DECISION] help_assistant consolidado en paquete backend/api/help_assistant/ — 6 archivos planos eliminados, safety con normalización ASCII, TF-IDF RAG, serializer DRF, metering via UsageContext; contrato POST /api/help/ask sin cambios
