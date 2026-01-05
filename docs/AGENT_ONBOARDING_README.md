AGENT_ONBOARDING_README
======================

Rol obligatorio: Documentation & Governance Engineer (lectura previa a cualquier intervenci├│n).

1) Qu├⌐ es este proyecto

Este repositorio alberga una plataforma con Workspaces aislados que representan espacios de trabajo aut├│nomos (p. ej. notas cl├¡nicas, exportaciones, hist├│ricos). La integridad de los datos legacy es prioritaria y no puede ser modificada. Todas las exportaciones y transferencias de contenido deben ser manuales y expl├¡citas. La gobernanza es estricta: cambios en copy, exportaciones o comportamiento de aislamiento requieren revisiones documentales y cumplimiento del contrato de workspace.

2) Documentos que mandan (orden de lectura)

- `PROJECT_LOCK.md`
- `DOCUMENT_AUTHORITY_INDEX.md`
- `WORKSPACE_ISOLATION_POLICY.md`
- `WORKSPACE_MATRIX.md`
- `WORKSPACE_EXPORT_CONTRACT.md`
- `UI_COPY_FREEZE.md`
- `PR_WORKSPACE_GOVERNANCE_CHECKLIST.md`

Leerlos en ese orden antes de cualquier modificaci├│n de UI, copy o interacciones entre workspaces.

3) Reglas NO negociables

- Prohibido sincronizar workspaces autom├íticamente.
- Prohibido inyectar informaci├│n en otro workspace sin acci├│n manual expl├¡cita.
- No modificar ni eliminar data legacy ni sus formatos.
- No crear documentos paralelos que contradigan los documentos can├│nicos listados arriba.
- No ΓÇ£mejorarΓÇ¥ la UX si ello altera la sem├íntica de los datos o crea expectativas de automatismo.

4) Qu├⌐ S├ì est├í permitido

- Cambios expl├¡citos y documentados en UI y copy, tras lectura de los documentos can├│nicos.
- Redacci├│n clara y humana en los textos del UI; evitar ambig├╝edad sobre qui├⌐n realiza una acci├│n y sus efectos.
- Exportaci├│n solo por acci├│n del usuario (bot├│n claro, confirmaci├│n, registro de evento manual).
- Auditor├¡as previas a cualquier cambio que toque workspaces o exportaciones.

5) Errores comunes a evitar

- "Es solo un texto" ΓÇö el copy transmite expectativas y permisos.
- "Es m├ís c├│modo para el usuario" ΓÇö no justificar automatismos que rompan aislamiento.
- "Ya que est├í la dataΓÇª" ΓÇö no derivar en uso no autorizado de data legacy.
- "Lo integro r├ípido" ΓÇö atajos producen regresiones y violan gobernanza.

6) Qu├⌐ hacer si tienes dudas

- Parar inmediatamente cualquier cambio.
- Revisar los documentos can├│nicos listados en la secci├│n 2.
- Preguntar a los responsables de gobernanza o al equipo de documentaci├│n antes de tocar UI o exportaciones.

Formato y reglas de lectura

- Markdown simple.
- Lenguaje claro, directo y t├⌐cnico; sin emojis, sin marketing, sin roadmap.

Criterio de ├⌐xito

Un agente nuevo debe comprender el sistema en menos de 10 minutos, no introducir cambios que rompan aislamiento y evitar preguntas b├ísicas sobre reglas NO negociables.
