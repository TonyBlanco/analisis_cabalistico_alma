# SWM v3 — Artefactos de gobernanza: criterios de aceptación, validaciones y stop conditions

Objeto
- Definir criterios claros para validar implementaciones SWM v3 y condiciones que detengan o reviertan trabajo.

1) Criterios de aceptación generales
- A1: Documentación completa en `/docs` y registro en `01_PROJECT_STATE`.
- A2: Feature flag presente y por defecto `false` en entornos no consentidos.
- A3: Copy y lenguaje revisados: uso obligatorio de `consultante` (no `paciente`), `lectura simbólica`, ausencia de lenguaje diagnóstico. Ver `CONSULTANTE_TERMINOLOGY.md`.
- A4: Consentimiento auditable implementado (opt-in, timestamp, scope, revocabilidad).
- A5: Trazabilidad mínima: motor IA versión, parámetros (`temperature`, `seed`), deck id, timestamp.
- A6: Compatibilidad Consultante: SWM opera con modelo `Consultante` (UUID), no `Patient` legacy. Ver `UNIFIED_CONSULTANTE_ARCHITECTURE.md`.

2) Validaciones obligatorias (pre-deploy y en PR)
- V1: Auditoría compliance — confirmar que cambios están permitidos por `AUDITORIA CABALA APP 12182025.md`.
- V2: Security review — secrets, tokens, rate-limits, retries (documental).
- V3: Privacy review — confirmación de no almacenamiento de prompts crudos; storage mode controlado.
- V4: Human review plan — listas de lecturas de ejemplo y criterios de aceptación por revisor humano.
- V5: Accessibility & UX review — checks mínimos (labels, focus, aria where applicable).
- V6: Terminología review — confirmar uso de 'consultante' (no 'paciente') en UI, APIs y documentación.

3) Stop conditions (bloqueo inmediato)
- S1: PR introduce o modifica endpoints/rutas sin aprobación de Auditoría.
- S2: PR contiene lenguaje clínico, diagnostico o prescriptivo en copy o prompts.
- S3: Persistencia de lecturas sin consentimiento o sin modo `store_with_consent`.
- S4: Falta de runbook o rollback plan documentado para el feature.
- S5: Si las pruebas humanas (Phase 5 plan) muestran riesgo de malinterpretación no mitigable.
- S6: Uso de terminología 'paciente' o modelos `Patient` en código nuevo (debe usar `Consultante`).

4) Rollback policy
- R1: Documentar pasos de rollback en runbook; incluir cómo desactivar feature flag y borrar/anonimizar lecturas si necesario.
- R2: En caso de S1–S5, revertir PR y ejecutar checklist de seguridad y privacidad antes de reintentar.

5) Artefactos requeridos antes de implementación
- AR1: `docs/specs/tarot-ai-openapi-fragment.yaml` (contractual, draft ok)
- AR2: `docs/fixtures/*.json` (ejemplos de input/output para tests)
- AR3: Runbook mínimo en `docs/runbooks/tarot-ai-runbook.md`
- AR4: Human review report (documental) con aprobaciones

6) Medidas de monitoreo obligatorias (post-deploy)
- M1: Métricas: requests/sec, error-rate, median latency, tokens consumed per minute.
- M2: Alertas: error-rate > 2% (24h), high-risk flags count > threshold, token-usage anomaly.
- M3: Logs de auditoría: store (metadata) de explanationTrace (no prompts), consent events.

7) Roles y responsabilidades
- Owner: Product / Data Owner (define original business decision).
- Auditoría: valida cumplimiento normativo antes de merge.
- Security: valida secretos y límites del provider IA.
- QA/Human-review: revisa interpretaciones y tono en sample set.

Notas finales
- Todo artefacto debe almacenarse en `/docs` y registrarse en `01_PROJECT_STATE` antes de cualquier cambio de código.
- Esta guía es vinculante: seguirla evita bloqueos regulatorios y técnicos.
