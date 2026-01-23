# Resonancia Ancestral Workspace

**Estado:** 🟠 PROTOTIPO  
**Fecha de auditoría:** 2026-01-23

## Estado Actual

- **Frontend:** ⚠️ Estructura completa pero sin backend
- **Backend SWM:** ❌ No existe
- **API:** ❌ No existe
- **Gobernanza:** ❌ No definida

## Archivos Presentes

```
ResonanciaAncestralWorkspace.tsx (1590 lines)
```

### Componentes implementados:
- `ResonanciaAncestralWorkspace.tsx`: Workspace completo con UI
- Integración con API: `createResonanciaObservation`, `createResonanciaRelation`, `listResonanciaObservations`, `listResonanciaRelations`
- Tipos: `ResonanciaObservation`, `ResonanciaRelation`, `ResonanciaObservationContext`, etc.

## Análisis Técnico

**Frontend:** El workspace tiene implementación visual completa con:
- Formularios de observaciones
- Gestión de relaciones
- Tooltips informativos
- Estados de observación

**Backend:** Las llamadas a API sugieren que existe estructura backend en `/lib/api/resonancia.ts`, pero NO existe módulo SWM completo en `backend/swm/resonancia/`.

## Próximos Pasos

1. **Definir alcance funcional:**
   - ¿Qué es "Resonancia Ancestral"?
   - ¿Es exploratorio o requiere estructura clínica?
   - ¿Necesita vinculación con TestRequest?

2. **Decidir arquitectura:**
   - ¿Es SWM completo (WorkspaceInstance + Sesiones + Artefactos)?
   - ¿O es herramienta de exploración libre sin persistencia estructurada?

3. **Implementar backend SWM (si procede):**
   - Crear `backend/swm/resonancia/models.py`
   - Implementar endpoints: `/api/swm/resonancia/create`, `/start`, `/progress`, `/seal`, `/results`
   - Tests de integración

4. **Gobernanza:**
   - Crear `CONTRATO_FUNCIONAL_RESONANCIA.md`
   - Definir restricciones explícitas
   - Disclaimers si involucra temas sensibles

## ⚠️ ADVERTENCIA

**NO ACTIVAR hasta completar backend SWM.**

Sin backend completo:
- ❌ No hay persistencia confiable
- ❌ No hay ownership ni permisos
- ❌ No hay auditoría de acciones
- ❌ No hay integración con TestRequest

## Referencia

Ver: [docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md](../../../docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md) sección Resonancia Ancestral Workspace

---

**Patrón recomendado:** Seguir modelo exitoso de MCMI-4 Místico (backend SWM completo + API + tests + gobernanza).
