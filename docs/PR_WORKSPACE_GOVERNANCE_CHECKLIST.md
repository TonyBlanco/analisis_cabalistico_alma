# PR Workspace Governance Checklist

Instrucciones para revisores: responda Sí / No a cada ítem. Si alguna respuesta es "No", la PR debe ser bloqueada hasta corrección.

## Sección 1 — Lenguaje

- ☐ ¿La PR introduce textos nuevos en UI? (Sí/No)
- ☐ ¿Algún texto sugiere automatismo o sincronización? (Sí/No)
- ☐ ¿Usa verbos prohibidos (insertar, inyectar, enviar)? (Sí/No)

## Sección 2 — Workspaces

- ☐ ¿La PR mantiene el aislamiento entre workspaces? (Sí/No)
- ☐ ¿No introduce lectura cruzada implícita? (Sí/No)
- ☐ ¿No empuja información automáticamente al Workspace del terapista? (Sí/No)

## Sección 3 — Exportaciones

- ☐ ¿Toda exportación es manual? (Sí/No)
- ☐ ¿Se indica explícitamente “no se sincroniza” cuando aplica? (Sí/No)
- ☐ ¿El resultado de la exportación es estático (nota/snapshot) y no un enlace vivo? (Sí/No)

## Sección 4 — Lock & Gobernanza

- ☐ ¿Respeta `PROJECT_LOCK.md`? (Sí/No)
- ☐ ¿No reabre fases cerradas ni cambia el alcance aprobado? (Sí/No)
- ☐ ¿No introduce documentación paralela que contradiga la autoridad documental? (Sí/No)

## Revisión final

- ☐ ¿Se realizó una búsqueda en el repo por palabras prohibidas? (Sí/No)
- ☐ ¿Los cambios textuales cumplen `UI_COPY_FREEZE.md`? (Sí/No)
- ☐ ¿El revisor confirma bloqueo en caso de incumplimiento? (Sí/No)

Nota: Esta lista es obligatoria para PRs que tocan UI, exportaciones o workspaces clínicos. Mantenerla como artefacto en la PR para trazabilidad.
