# RELEASES — Source of Truth

Este documento registra releases, safe-tags y estados de bloqueo para módulos críticos del repositorio.

## Safe Tags

- `safe/mcmi4-mistico-ai-v1` (2026-01-23)
  - Estado: SAFE / BLOQUEANTE / POST-NÚCLEO
  - Módulo: MCMI-4 Místico — Asistente Simbólico IA
  - Descripción: Congela la integración aprobada de IA simbólica en el Workspace, garantizando reversibilidad y no-regresión.
  - Incluye:
    - Servicio IA: `tonyblanco-app/lib/swm-mcmi4/symbolic-ai-assistant.ts` (filtros, prompts, feature flag).
    - Panel colapsable: `tonyblanco-app/components/SwmMcmi4/SymbolicAIPanel.tsx` (toggle ON/OFF, disclaimer).
    - Integración: `tonyblanco-app/components/SwmMcmi4/PhaseGuidedPanel.tsx` (props opcionales de IA).
  - Restricciones implementadas:
    - NO scores numéricos enviados a IA (solo strings simbólicos).
    - Filtro `PROHIBITED_TERMS` para lenguaje clínico.
    - Toggle ON/OFF con persistencia de sesión.
    - Disclaimer siempre visible: "Asistente simbólico. No diagnóstico. No conclusivo."
    - Feature flag: `NEXT_PUBLIC_DISABLE_SYMBOLIC_AI`.
  - Núcleo INTACTO: scoring, JSONs, `questionnaire_service.py` no modificados.
  - Referencia: `docs/00_SOURCE_OF_TRUTH/AUDITORIA_INTEGRACION_IA_MCMI4.md`.

- `safe/mcmi4-mistico-core-v1` (2026-01-23)
  - Estado: SAFE / BLOQUEANTE
  - Módulo: MCMI-4 Místico (SWM)
  - Descripción: Marca la versión inicial del núcleo MCMI-4 Místico como cerrada y estable. Representa el estado en el cual
    el flujo SIGNAL → MCMI-4 (195) → Workspace (4 fases) está consolidado y no debe sufrir cambios sin aprobación.
  - Incluye:
    - Lógica de selección y orden: `backend/swm/mcmi4/services/questionnaire_service.py` (`WORLDS_ORDER`, `QUESTIONS_PER_WORLD`, `TOTAL_QUESTIONS`, selección determinista anti-repetición).
    - Bancos de preguntas oficiales: `backend/data/mcmi4_mystic_questions_atzilut.json`, `..._briah.json`, `..._yetzirah.json`, `..._assiah.json`.
    - Endpoints SWM y vistas que sirven el cuestionario y progress: `backend/swm/mcmi4/views.py`.
    - Frontend consumer y Workspace: `tonyblanco-app/components/swm/*`, `tonyblanco-app/components/SwmMcmi4/*`.
  - Prohibiciones (resumen): No modificar scoring, no crear tests nuevos, no duplicar bancos, no automatizar ejecuciones, no introducir diagnóstico.
  - Referencia al contrato funcional canónico: `docs/00_SOURCE_OF_TRUTH/CONTRATO_FUNCIONAL_MCMI4_MISTICO.md`.

### MCMI-4 Místico — Núcleo Congelado

El SAFE TAG `safe/mcmi4-mistico-core-v1` identifica el estado formal de "Núcleo Congelado". Bajo este estado:

- Qué incluye exactamente:
  - Todo lo necesario para ejecutar y revisar el MCMI-4 Místico en su forma consolidada: selección, rotación, endpoints, UI y artifacts.

- Qué NO se debe modificar sin ruptura de contrato:
  - `backend/swm/mcmi4/services/questionnaire_service.py` (algoritmo, constantes de orden y conteos).
  - Los archivos `backend/data/mcmi4_mystic_questions_*.json`.
  - El scoring y reglas de pesos/reverse scoring.
  - Wiring SIGNAL → CTA → asignación 195 ni endpoints que soportan ese flujo.

- Consecuencia de modificación no autorizada: cualquier cambio que afecte lo anterior se considera una ruptura de contrato y deberá ser revertido o justificado mediante el proceso de gobernanza descrito en el contrato funcional.

### Protección de rama (recomendación)

Si el repositorio está hospedado en un servicio remoto (GitHub/GitLab/Bitbucket), recomendamos marcar la rama principal (por ejemplo `main` o `master`) como protegida y exigir:

- Revisiones obligatorias (code review) antes de merge.
- Protecciones para tags que comiencen con `safe/` o políticas de escritura restringida a administradores.

Nota: Este agente no cambia la configuración remota. Si deseas que aplique configuraciones en el hosting remoto, proporciona credenciales y los permisos necesarios (no recomendado sin supervisión humana). A continuación se incluye un ejemplo de pasos manuales para GitHub:

1. En GitHub → Settings → Branches → Add rule.
2. Patrones: `main` (o la rama principal usada).
3. Marcar: "Require pull request reviews before merging", "Restrict who can push to matching branches".
4. Añadir restricciones para cambios en tags `safe/*` mediante políticas de CI o revisión organizacional.

-----

Registro de creación del SAFE TAG:

- SAFE TAG: `safe/mcmi4-mistico-core-v1`
- Fecha: 2026-01-23
- Autor: Agente ARQ (documento generado y añadido al repositorio)
