# MATRIZ DE WORKSPACES EXISTENTES (AUDITORÍA SCE)

## PASO 1 — IDENTIFICACIÓN

- **Workspace del Terapista**: Dominio funcional: Dashboard clínico, notas integrativas, visualización Body/Soul. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Astrología Profesional**: Dominio funcional: Cálculo y visualización de cartas astrales. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Tarot / B.O.T.A. (SWM v3)**: Dominio funcional: Lecturas simbólicas, interpretación gobernada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Resonancia Ancestral**: Dominio funcional: Exploración de patrones ancestrales. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
- **MSHE**: Dominio funcional: Síntesis holística evaluativa. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **SCID5**: Dominio funcional: Exploración clínica holística. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
- **Body/Soul Visualization**: Dominio funcional: Visualización simbólica integrada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.

## PASO 2 — MATRIZ

| Workspace | Tipo | Data interna (intocable) | Complejidad | ¿Comparte data hoy? | ¿Debe dejar de compartir data automáticamente? | Tipo de salida permitida | Exportable al Workspace del Terapista | Notas SCE (riesgos, advertencias) |
|-----------|------|--------------------------|-------------|---------------------|------------------------------------------------|---------------------------|---------------------------------------|-------------------------------------|
| Workspace del Terapista | LEGACY COMPLEJO | Notas integrativas, registros clínicos | alta | no | sí | Resumen, Observaciones | N/A | Riesgo de contaminación cruzada si se integra con simbólicos; encapsular estrictamente. |
| Astrología Profesional | LEGACY COMPLEJO | Cartas astrales, efemérides, análisis | alta | no | sí | Snapshot, Resumen | Sí (manual) | Riesgo alto de modificación accidental; aislamiento obligatorio para evitar cambios en cálculos. |
| Tarot / B.O.T.A. (SWM v3) | LEGACY COMPLEJO | Lecturas simbólicas, contratos SWM | alta | no | sí | Snapshot, Observaciones | Sí (manual) | Riesgo arquitectónico si se sincroniza; no permitir vínculos vivos. |
| Resonancia Ancestral | LEGACY SIMPLE | Patrones ancestrales, UI | media | no | sí | Observaciones | Sí (manual) | Riesgo medio de acoplamiento; encapsular para evitar exportaciones automáticas. |
| MSHE | LEGACY COMPLEJO | Síntesis evaluativa, pesos, IA | alta | no | sí | Resumen | Sí (manual) | Riesgo de fuga de síntesis clínica; aislamiento estricto. |
| SCID5 | LEGACY SIMPLE | Exploraciones holísticas, booleanos | media | no | sí | Observaciones | Sí (manual) | Riesgo de malinterpretación clínica; encapsular sin integración automática. |
| Body/Soul Visualization | LEGACY COMPLEJO | Estados estructurales, flujos simbólicos | alta | no | sí | Snapshot | Sí (manual) | Riesgo de auto-inyección en notas; encapsulación previa implementada. |

## PASO 3 — REGLAS DE TRANSICIÓN

Para cada Workspace legacy:

- **Workspace del Terapista**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de resúmenes a notas. Sin vínculo vivo. Sin sincronización.
- **Astrología Profesional**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de snapshot astral. Sin vínculo vivo. Sin sincronización.
- **Tarot / B.O.T.A. (SWM v3)**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones simbólicas. Sin vínculo vivo. Sin sincronización.
- **Resonancia Ancestral**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones. Sin vínculo vivo. Sin sincronización.
- **MSHE**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de resumen sintético. Sin vínculo vivo. Sin sincronización.
- **SCID5**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones. Sin vínculo vivo. Sin sincronización.
- **Body/Soul Visualization**: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de snapshot visual. Sin vínculo vivo. Sin sincronización.

## PASO 4 — CONCLUSIÓN SCE

Lista de Workspaces NO TOCAR: Workspace del Terapista, Astrología Profesional, Tarot / B.O.T.A. (SWM v3), MSHE, Body/Soul Visualization.

Lista de Workspaces listos para aislamiento inmediato: Resonancia Ancestral, SCID5.

Riesgos residuales: Contaminación cruzada si exportaciones manuales no se controlan; riesgo de modificación accidental en data legacy compleja.

Recomendaciones solo de encapsulación: Implementar UI de export manual en cada Workspace; remover cualquier listener automático de integración; validar aislamiento en auditorías futuras.