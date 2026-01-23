# Transgenerational Deep Workspace

**Estado:** 🟠 PROTOTIPO  
**Fecha de auditoría:** 2026-01-23

## Estado Actual

- **Frontend:** ⚠️ Estructura mínima
- **Backend SWM:** ❌ No existe
- **API:** ❌ No existe
- **Gobernanza:** ❌ No definida

## Archivos Presentes

```
index.tsx (63 lines)
TransgenerationalSidebar.tsx
TransgenerationalVisualCore.tsx
types.ts
```

### Componentes implementados:
- `index.tsx`: Shell principal con header y navegación
- `TransgenerationalSidebar.tsx`: Barra lateral de navegación
- `TransgenerationalVisualCore.tsx`: Núcleo de visualización
- `types.ts`: Tipos TypeScript para el workspace

## Análisis Técnico

**Frontend:** Workspace observacional con estructura básica:
- Header con ícono y título "Transgeneracional Profundo"
- Sidebar para secciones (probablemente árbol genealógico, eventos, etc.)
- Visual core placeholder
- Nota: "Observacional. Sin inferencia ni generacion automatica."

**Backend:** NO existe módulo SWM en `backend/swm/transgenerational/`.

## Alcance Probable

Basado en el nombre "Transgeneracional Profundo", probablemente relacionado con:
- Psicogenealogia
- Árboles genealógicos familiares
- Patrones transgeneracionales
- Eventos familiares significativos
- Constelaciones familiares

## Próximos Pasos

1. **Definir alcance funcional:**
   - ¿Qué visualiza este workspace?
   - ¿Es árbol genealógico + eventos?
   - ¿Incluye análisis de patrones?
   - ¿Es solo observacional o requiere interpretación?

2. **Decidir arquitectura:**
   - ¿Es SWM completo con persistencia?
   - ¿O es herramienta visual sin backend?

3. **Implementar backend SWM (si procede):**
   - Crear `backend/swm/transgenerational/models.py`
   - Definir estructura de datos: personas, relaciones, eventos
   - Implementar endpoints estándar SWM
   - Tests de integración

4. **Gobernanza:**
   - Crear `CONTRATO_FUNCIONAL_TRANSGENERACIONAL.md`
   - Definir restricciones: NO diagnóstico, NO interpretación automática
   - Disclaimers sobre uso responsable de información familiar

## Temas Sensibles

⚠️ **ADVERTENCIA:** Este tipo de workspace toca temas altamente sensibles:
- Historia familiar privada
- Secretos familiares
- Traumas intergeneracionales
- Información de terceros (familiares)

**Gobernanza crítica requerida:**
- Consentimiento informado explícito
- Protección de datos de terceros
- Disclaimers sobre no-diagnóstico
- Claridad sobre alcance observacional vs. interpretativo

## Próximos Pasos

1. **Auditar archivos existentes** (Sidebar, VisualCore, types)
2. **Definir alcance funcional preciso**
3. **NO ACTIVAR sin gobernanza completa**

## Referencia

Ver: [docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md](../../../docs/00_SOURCE_OF_TRUTH/AUDITORIA_SWM_INCOMPLETOS.md) sección Transgenerational Deep Workspace

---

**Patrón recomendado:** Seguir modelo exitoso de MCMI-4 Místico (backend SWM completo + API + tests + gobernanza + disclaimers sensibles).
