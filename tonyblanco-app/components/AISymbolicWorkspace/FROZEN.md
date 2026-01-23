# ⛔ WORKSPACE CONGELADO

**Estado:** FROZEN - NO ACTIVAR  
**Fecha:** 2026-01-23  
**Razón:** Integración IA sin gobernanza definida

## Requisitos para descongelar:

- [ ] Contrato funcional con restricciones explícitas
- [ ] Auditoría de integración IA (ver modelo MCMI-4)
- [ ] Sistema de feature flags
- [ ] Filtros de lenguaje prohibido
- [ ] Validación de respuestas

## Modelo de referencia

Ver implementación completa en:
- `docs/00_SOURCE_OF_TRUTH/AUDITORIA_INTEGRACION_IA_MCMI4.md`
- `tonyblanco-app/lib/swm-mcmi4/symbolic-ai-assistant.ts`
- `tonyblanco-app/lib/swm-mcmi4/kabbalistic-system-prompts.ts`

## Restricciones requeridas

1. **Feature Flag**: `AI_SYMBOLIC_ENABLED` con default `false`
2. **Filtros de lenguaje**: Prohibir términos clínicos/diagnósticos
3. **Dual validation**: Patrón + contenido prohibido
4. **Métricas anónimas**: Sin logs de texto, solo uso
5. **Disclaimer visible**: Control del terapeuta explícito
6. **Post-cálculo**: IA solo después de datos simbólicos generados

## Referencia

Ver: [docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md](../../../docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md) sección AI Symbolic Workspace

---

**DO NOT ACTIVATE THIS WORKSPACE UNTIL ALL REQUIREMENTS ARE MET**
