SWM_INDEX_READ_ONLY — Índice Canónico de Specialized Workspace Modules (SWM) — READ-ONLY

Estado: CANÓNICO — V1
Fecha: 2026-01-11

1. Propósito

Este documento actúa como MAPA canónico y descriptivo de los Specialized Workspace Modules (SWM) existentes en el proyecto. Su función es ofrecer visibilidad y evitar descubrimientos accidentales o modificaciones no autorizadas; NO es un plan de cambio ni un documento operativo.

2. Tabla canónica de SWM (READ-ONLY)

| SWM_ID | Nombre visible | Dominio | Ubicación | Operado por | Persistencia | Estado | Riesgo | Regla principal |
|--------|----------------|---------|-----------|-------------|--------------|--------|--------|-----------------|
| astrologia_profesional | Astrología Profesional | Astrología | Mixto (Frontend/Backend) | Sistema / Terapeuta | AnalysisRecord | CONGELADO | ALTO | NO TOCAR / NO MIGRAR / NO CONVERTIR EN TEST |
| tarot_bota | Tarot / B.O.T.A. | Tarot | Mixto (Frontend/Backend) | Sistema / Terapeuta | AnalysisRecord | CONGELADO | ALTO | NO TOCAR / NO MIGRAR / NO CONVERTIR EN TEST |
| cabala_arbol_vida | Cábala / Árbol de la Vida | Cábala | Backend | Sistema / Terapeuta | AnalysisRecord / TreeStructuralState | CONGELADO | ALTO | NO TOCAR / NO MIGRAR / NO CONVERTIR EN TEST |
| bioemocional_experiencial | Bioemocional Experiencial | Bioemocional | Backend | Terapeuta / Sistema | AnalysisRecord | CONGELADO | MEDIO | NO TOCAR / NO MIGRAR / NO CONVERTIR EN TEST |
| arbol_treestates | Árbol / TreeStructuralState | Árbol / Contract | Backend | Sistema / Gobernanza | AnalysisRecord / TreeStructuralState | CONGELADO | ALTO | NO TOCAR / NO MIGRAR / NO CONVERTIR EN TEST |

> Nota: La tabla es descriptiva y refleja el estado actual. Cualquier discrepancia entre este índice y la estructura del repositorio DEBE ser reportada a gobernanza.

3. Relación con otros artefactos

- Los SWM NO son tests ni pertenecen al catálogo de tests. Están explícitamente separados de las exploraciones operativas.
- Referencias obligatorias: `WORKSPACE_MATRIX.md`, `final_system_classification.md`, `SWM_IMMUTABILITY_CONTRACT.md`.

4. Declaraciones y reglas clave

- ESTE ÍNDICE ES DESCRIPTIVO. CUALQUIER CAMBIO EN SWM REQUIERE GOBERNANZA EXPLÍCITA.
- PROHIBIDO: mover, renombrar, refactorizar o convertir componentes SWM en tests sin aprobación formal.

5. Contactos y reportes

- Reportar inconsistencias o solicitudes relacionadas con SWM al comité de gobernanza mediante el canal/documento oficial de gobernanza.

---

Este documento es de lectura obligatoria para cualquier agente, automatismo o persona que interactúe con la estructura simbólica del proyecto. Mantenerlo sincronizado con `SWM_IMMUTABILITY_CONTRACT.md`.