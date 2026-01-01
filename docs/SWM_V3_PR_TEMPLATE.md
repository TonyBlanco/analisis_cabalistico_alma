<!-- Plantilla PR obligatoria para cualquier implementación de SWM v3 -->
# PR Template — SWM v3 Implementation (DOCUMENTATION + CODE CHANGES)

Resumen breve
-- Descripción corta del cambio (1-2 líneas).

Relacionado con
- Issue/Ticket: 
- Docs: `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md`

Feature flag
- `AI_TAROT_ENABLED`: (yes/no) — por defecto `no` en entornos no consentidos.

Checklist obligatorio (marcar antes de solicitar revisión)
- [ ] He leído y referido `docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md`.
- [ ] Esta PR no crea endpoints ni modifica rutas (si crea, explicar y adjuntar aprobación de auditoría).
- [ ] Si hay cambios en persistencia: indicar modo soportado (`no_store`|`store_anonymized`|`store_with_consent`).
- [ ] Documentación añadida en `/docs` (especificar rutas).
- [ ] `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` actualizado con intención y registro del cambio.
- [ ] Security review completado (tokens, rate-limits, secrets) — adjuntar notas.
- [ ] Privacy review completado (consentimiento, revocabilidad) — adjuntar notas.
- [ ] Tests agregados o fixtures documentados en `/docs/fixtures` (si aplica).
- [ ] Human review plan adjunto (número de lecturas, revisores, criterios).

Acceptance criteria (qué debe cumplirse para aprobar PR)
- Documentación completa y aprobada en `/docs`.
- No cambios de UX/clínicas no aprobados por auditoría.
- Tests o fixtures documentados y reproducibles en staging.
- Runbook y rollback plan adjuntos.

Reviewer checklist (para quien revisa)
- [ ] Confirma que no se crean endpoints/rutas sin aprobación.
- [ ] Revisa lenguaje y asegura no-clínico en copy y prompts.
- [ ] Confirma existencia de feature flag y default `false`.
- [ ] Verifica que `01_PROJECT_STATE` contiene el registro de intención.
- [ ] Seguridad y privacidad revisadas.

Stop / Rollback conditions (si se detecta durante QA)
- Si se detecta uso de lenguaje diagnóstico → revertir.
- Si hay persistencia sin consentimiento o sin modo `store_with_consent` → revertir.
- Si endpoints nuevos sin aprobación → revertir y bloquear PR.

Notas
- Esta plantilla es obligatoria y complementaria a las plantillas estándar del repo.
- Cualquier excepción debe documentarse y estar aprobada por Auditoría (docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md).
