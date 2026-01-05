# MATRIZ DE WORKSPACES EXISTENTES (AUDITOR├ìA SCE)

## PASO 1 ΓÇö IDENTIFICACI├ôN

- **Workspace del Terapista**: Dominio funcional: Dashboard cl├¡nico, notas integrativas, visualizaci├│n Body/Soul. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Astrolog├¡a Profesional**: Dominio funcional: C├ílculo y visualizaci├│n de cartas astrales. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Tarot / B.O.T.A. (SWM v3)**: Dominio funcional: Lecturas simb├│licas, interpretaci├│n gobernada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **Resonancia Ancestral**: Dominio funcional: Exploraci├│n de patrones ancestrales. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
- **MSHE**: Dominio funcional: S├¡ntesis hol├¡stica evaluativa. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
- **SCID5**: Dominio funcional: Exploraci├│n cl├¡nica hol├¡stica. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
- **Body/Soul Visualization**: Dominio funcional: Visualizaci├│n simb├│lica integrada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.

## PASO 2 ΓÇö MATRIZ

| Workspace | Tipo | Data interna (intocable) | Complejidad | ┬┐Comparte data hoy? | ┬┐Debe dejar de compartir data autom├íticamente? | Tipo de salida permitida | Exportable al Workspace del Terapista | Notas SCE (riesgos, advertencias) |
|-----------|------|--------------------------|-------------|---------------------|------------------------------------------------|---------------------------|---------------------------------------|-------------------------------------|
| Workspace del Terapista | LEGACY COMPLEJO | Notas integrativas, registros cl├¡nicos | alta | no | s├¡ | Resumen, Observaciones | N/A | Riesgo de contaminaci├│n cruzada si se integra con simb├│licos; encapsular estrictamente. |
| Astrolog├¡a Profesional | LEGACY COMPLEJO | Cartas astrales, efem├⌐rides, an├ílisis | alta | no | s├¡ | Snapshot, Resumen | S├¡ (manual) | Riesgo alto de modificaci├│n accidental; aislamiento obligatorio para evitar cambios en c├ílculos. |
| Tarot / B.O.T.A. (SWM v3) | LEGACY COMPLEJO | Lecturas simb├│licas, contratos SWM | alta | no | s├¡ | Snapshot, Observaciones | S├¡ (manual) | Riesgo arquitect├│nico si se sincroniza; no permitir v├¡nculos vivos. |
| Resonancia Ancestral | LEGACY SIMPLE | Patrones ancestrales, UI | media | no | s├¡ | Observaciones | S├¡ (manual) | Riesgo medio de acoplamiento; encapsular para evitar exportaciones autom├íticas. |
| MSHE | LEGACY COMPLEJO | S├¡ntesis evaluativa, pesos, IA | alta | no | s├¡ | Resumen | S├¡ (manual) | Riesgo de fuga de s├¡ntesis cl├¡nica; aislamiento estricto. |
| SCID5 | LEGACY SIMPLE | Exploraciones hol├¡sticas, booleanos | media | no | s├¡ | Observaciones | S├¡ (manual) | Riesgo de malinterpretaci├│n cl├¡nica; encapsular sin integraci├│n autom├ítica. |
| Body/Soul Visualization | LEGACY COMPLEJO | Estados estructurales, flujos simb├│licos | alta | no | s├¡ | Snapshot | S├¡ (manual) | Riesgo de auto-inyecci├│n en notas; encapsulaci├│n previa implementada. |

## PASO 3 ΓÇö REGLAS DE TRANSICI├ôN

Para cada Workspace legacy:

- **Workspace del Terapista**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de res├║menes a notas. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **Astrolog├¡a Profesional**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de snapshot astral. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **Tarot / B.O.T.A. (SWM v3)**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones simb├│licas. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **Resonancia Ancestral**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **MSHE**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de resumen sint├⌐tico. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **SCID5**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones. Sin v├¡nculo vivo. Sin sincronizaci├│n.
- **Body/Soul Visualization**: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de snapshot visual. Sin v├¡nculo vivo. Sin sincronizaci├│n.

## PASO 4 ΓÇö CONCLUSI├ôN SCE

Lista de Workspaces NO TOCAR: Workspace del Terapista, Astrolog├¡a Profesional, Tarot / B.O.T.A. (SWM v3), MSHE, Body/Soul Visualization.

Lista de Workspaces listos para aislamiento inmediato: Resonancia Ancestral, SCID5.

Riesgos residuales: Contaminaci├│n cruzada si exportaciones manuales no se controlan; riesgo de modificaci├│n accidental en data legacy compleja.

Recomendaciones solo de encapsulaci├│n: Implementar UI de export manual en cada Workspace; remover cualquier listener autom├ítico de integraci├│n; validar aislamiento en auditor├¡as futuras.

## Referencias y contrato de export
Todas las exportaciones manuales desde los Workspaces deben cumplir con el contrato documental:
- `docs/WORKSPACE_EXPORT_CONTRACT.md`

Referencias can├│nicas adicionales: ver `docs/DOCUMENT_AUTHORITY_INDEX.md` para el orden de lectura recomendado.
