# PR Workspace Governance Checklist

Instrucciones para revisores: responda S├¡ / No a cada ├¡tem. Si alguna respuesta es "No", la PR debe ser bloqueada hasta correcci├│n.

## Secci├│n 1 ΓÇö Lenguaje

- ΓÿÉ ┬┐La PR introduce textos nuevos en UI? (S├¡/No)
- ΓÿÉ ┬┐Alg├║n texto sugiere automatismo o sincronizaci├│n? (S├¡/No)
- ΓÿÉ ┬┐Usa verbos prohibidos (insertar, inyectar, enviar)? (S├¡/No)

## Secci├│n 2 ΓÇö Workspaces

- ΓÿÉ ┬┐La PR mantiene el aislamiento entre workspaces? (S├¡/No)
- ΓÿÉ ┬┐No introduce lectura cruzada impl├¡cita? (S├¡/No)
- ΓÿÉ ┬┐No empuja informaci├│n autom├íticamente al Workspace del terapista? (S├¡/No)

## Secci├│n 3 ΓÇö Exportaciones

- ΓÿÉ ┬┐Toda exportaci├│n es manual? (S├¡/No)
- ΓÿÉ ┬┐Se indica expl├¡citamente ΓÇ£no se sincronizaΓÇ¥ cuando aplica? (S├¡/No)
- ΓÿÉ ┬┐El resultado de la exportaci├│n es est├ítico (nota/snapshot) y no un enlace vivo? (S├¡/No)

## Secci├│n 4 ΓÇö Lock & Gobernanza

- ΓÿÉ ┬┐Respeta `PROJECT_LOCK.md`? (S├¡/No)
- ΓÿÉ ┬┐No reabre fases cerradas ni cambia el alcance aprobado? (S├¡/No)
- ΓÿÉ ┬┐No introduce documentaci├│n paralela que contradiga la autoridad documental? (S├¡/No)

## Revisi├│n final

- ΓÿÉ ┬┐Se realiz├│ una b├║squeda en el repo por palabras prohibidas? (S├¡/No)
- ΓÿÉ ┬┐Los cambios textuales cumplen `UI_COPY_FREEZE.md`? (S├¡/No)
- ΓÿÉ ┬┐El revisor confirma bloqueo en caso de incumplimiento? (S├¡/No)

Nota: Esta lista es obligatoria para PRs que tocan UI, exportaciones o workspaces cl├¡nicos. Mantenerla como artefacto en la PR para trazabilidad.
