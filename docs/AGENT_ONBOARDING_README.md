AGENT_ONBOARDING_README
======================

Rol obligatorio: Documentation & Governance Engineer (lectura previa a cualquier intervención).

1) Qué es este proyecto

Este repositorio alberga una plataforma con Workspaces aislados que representan espacios de trabajo autónomos (p. ej. notas clínicas, exportaciones, históricos). La integridad de los datos legacy es prioritaria y no puede ser modificada. Todas las exportaciones y transferencias de contenido deben ser manuales y explícitas. La gobernanza es estricta: cambios en copy, exportaciones o comportamiento de aislamiento requieren revisiones documentales y cumplimiento del contrato de workspace.

2) Documentos que mandan (orden de lectura)

- `PROJECT_LOCK.md`
- `DOCUMENT_AUTHORITY_INDEX.md`
- `WORKSPACE_ISOLATION_POLICY.md`
- `WORKSPACE_MATRIX.md`
- `WORKSPACE_EXPORT_CONTRACT.md`
- `UI_COPY_FREEZE.md`
- `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`

Leerlos en ese orden antes de cualquier modificación de UI, copy o interacciones entre workspaces.

3) Reglas NO negociables

- Prohibido sincronizar workspaces automáticamente.
- Prohibido inyectar información en otro workspace sin acción manual explícita.
- No modificar ni eliminar data legacy ni sus formatos.
- No crear documentos paralelos que contradigan los documentos canónicos listados arriba.
- No “mejorar” la UX si ello altera la semántica de los datos o crea expectativas de automatismo.

4) Qué SÍ está permitido

- Cambios explícitos y documentados en UI y copy, tras lectura de los documentos canónicos.
- Redacción clara y humana en los textos del UI; evitar ambigüedad sobre quién realiza una acción y sus efectos.
- Exportación solo por acción del usuario (botón claro, confirmación, registro de evento manual).
- Auditorías previas a cualquier cambio que toque workspaces o exportaciones.

5) Errores comunes a evitar

- "Es solo un texto" — el copy transmite expectativas y permisos.
- "Es más cómodo para el usuario" — no justificar automatismos que rompan aislamiento.
- "Ya que está la data…" — no derivar en uso no autorizado de data legacy.
- "Lo integro rápido" — atajos producen regresiones y violan gobernanza.

6) Qué hacer si tienes dudas

- Parar inmediatamente cualquier cambio.
- Revisar los documentos canónicos listados en la sección 2.
- Preguntar a los responsables de gobernanza o al equipo de documentación antes de tocar UI o exportaciones.

Formato y reglas de lectura

- Markdown simple.
- Lenguaje claro, directo y técnico; sin emojis, sin marketing, sin roadmap.

Criterio de éxito

Un agente nuevo debe comprender el sistema en menos de 10 minutos, no introducir cambios que rompan aislamiento y evitar preguntas básicas sobre reglas NO negociables.
