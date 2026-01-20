# PR Workspace Governance Checklist

Instrucciones para revisores: responda S├¡ / No a cada ├¡tem. Si alguna respuesta es "No", la PR debe ser bloqueada hasta correcci├│n.

## Secci├│n 1 ΓÇö Lenguaje

- ΓÿÉ ┬┐La PR introduce textos nuevos en UI? (S├¡/No)
- ΓÿÉ ┬┐Alg├║n texto sugiere automatismo o sincronizaci├│n? (S├¡/No)
- ΓÿÉ ┬┐Usa verbos prohibidos (insertar, inyectar, enviar)? (S├¡/No)

## Sección 2 — Workspaces

- ☐ **¿La PR mantiene el aislamiento de escritura entre workspaces?** (Sí/No)
  - ✅ **Permitido:** Lectura federada desde Federation Hubs autorizados (SCDF, SCID-5, MSHE).
  - ❌ **Prohibido:** Escritura/inyección cross-workspace (sin excepciones).

- ☐ **¿La PR introduce lectura cross-workspace?** (Sí/No)
  - **Si SÍ**, verificar:
    - ☐ ¿El destino es un Federation Hub autorizado (SCDF/SCID-5/MSHE)? (Sí/No)
    - ☐ ¿La fuente son artefactos normalizados (`AnalysisRecordNormalized`/`HubFeedSnapshot`)? (Sí/No)
    - ☐ ¿No hay escritura en workspaces fuente? (Sí/No)
    - ☐ ¿Se genera auditoría automática de lectura? (Sí/No) **Nota:** `FederationAuditLog` es concepto Phase 1+.
    - ☐ ¿Se requiere consentimiento explícito del consultante? (Sí/No) **Nota:** Opt-in revocable ligado a `FederationReadScope`.
  - **Si algún check es NO:** ❌ BLOQUEAR PR — Lectura cross-workspace no autorizada.

- ☐ **¿No empuja información automáticamente al Workspace del terapista?** (Sí/No)
  - **Excepción:** Federation Hubs pueden generar síntesis (sin escribir en workspaces fuente).

## Sección 3 — Exportaciones

- ΓÿÉ ┬┐Toda exportaci├│n es manual? (S├¡/No)
- ΓÿÉ ┬┐Se indica expl├¡citamente ΓÇ£no se sincronizaΓÇ¥ cuando aplica? (S├¡/No)
- ☐ ¿El resultado de la exportación es estático (nota profesional/snapshot) y no un enlace vivo? (Sí/No)

## Sección 2.1 — Federation Hubs (si aplica)

**Solo aplicar si la PR modifica/crea funcionalidad en SCDF, SCID-5 o MSHE.**

- ☐ ¿El hub consume solo artefactos normalizados (no DB directo)? (Sí/No)
- ☐ ¿El hub NO escribe en workspaces fuente? (Sí/No)
- ☐ ¿Se genera `FederationAuditLog` automático? (Sí/No) **Nota:** Concepto Phase 1+.
- ☐ ¿Outputs tienen visibilidad dual (`summary_public`/`summary_pro`)? (Sí/No)
- ☐ ¿Outputs son mayéuticos (preguntas/hipótesis, no diagnósticos)? (Sí/No)
- ☐ ¿Se requiere consentimiento explícito del consultante? (Sí/No) **Nota:** Opt-in revocable con `FederationReadScope`.

**Si algún check es NO:** ❌ BLOQUEAR PR — Violación del contrato de Federation Hubs.

**Referencia:**
- `docs/HOLISTIC_FEDERATION_POLICY.md`
- `docs/FEDERATION_HUBS_CONTRACT.md`

## Sección 4 — Lock & Gobernanza

- ΓÿÉ ┬┐Respeta `PROJECT_LOCK.md`? (S├¡/No)
- ΓÿÉ ┬┐No reabre fases cerradas ni cambia el alcance aprobado? (S├¡/No)
- ΓÿÉ ┬┐No introduce documentaci├│n paralela que contradiga la autoridad documental? (S├¡/No)

## Revisi├│n final

- ΓÿÉ ┬┐Se realiz├│ una b├║squeda en el repo por palabras prohibidas? (S├¡/No)
- ΓÿÉ ┬┐Los cambios textuales cumplen `UI_COPY_FREEZE.md`? (S├¡/No)
- ΓÿÉ ┬┐El revisor confirma bloqueo en caso de incumplimiento? (S├¡/No)

Nota: Esta lista es obligatoria para PRs que tocan UI, exportaciones o workspaces cl├¡nicos. Mantenerla como artefacto en la PR para trazabilidad.
