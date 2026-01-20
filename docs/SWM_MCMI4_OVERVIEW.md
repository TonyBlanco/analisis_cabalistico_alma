# SWM MCMI-4 MÍSTICO — OVERVIEW

**Versión:** 1.0  
**Fecha:** 2026-01-17  
**Estado:** Arquitectura Definitiva  
**Categoría:** Specialized Workspace Module (SWM)

---

## 1. QUÉ ES MCMI-4 MÍSTICO

MCMI-4 Místico es un **workspace experiencial con estado** diseñado para facilitar un proceso terapéutico/hermenéutico profundo basado en la interpretación simbólica del inventario clínico MCMI-4.

**NO ES:**
- Un test clásico ejecutable múltiples veces
- Un cuestionario de auto-reporte
- Una herramienta de scoring automático
- Una evaluación re-ejecutable libremente

**ES:**
- Un espacio de trabajo delimitado temporalmente
- Un proceso interpretativo guiado con múltiples etapas
- Una sesión con inicio, progreso y cierre explícitos
- Un artefacto con valor permanente post-cierre

---

## 2. DIFERENCIA FUNDAMENTAL: SUJETO vs EJECUTOR vs OBSERVADOR

### 2.1 Sujeto del Análisis
- Persona cuyos datos MCMI-4 clínicos se utilizan como materia prima
- NO necesita estar presente durante el proceso
- NO interactúa con el sistema durante la sesión
- Sus datos son **entrada**, no actor

### 2.2 Ejecutor
- Usuario autorizado que **realiza el proceso interpretativo**
- Interactúa con el workspace: responde prompts, navega mapas simbólicos, genera hipótesis
- Puede ser terapeuta o profesional autorizado
- Requiere permiso explícito para iniciar y completar la sesión

### 2.3 Observador (Terapeuta)
- Usuario con permiso de lectura sobre el workspace
- Puede revisar resultados finales
- NO puede modificar el proceso durante ejecución activa
- Accede post-cierre o con permiso explícito durante la sesión

**Implicación crítica:**  
El sistema NO asume que el sujeto del análisis es quien ejecuta. El ejecutor es un agente terapéutico autorizado.

---

## 3. POR QUÉ REQUIERE ESTADO

### 3.1 Naturaleza del Proceso
El MCMI-4 Místico NO es idempotente. Cada sesión:
- Genera interpretaciones contextuales únicas
- Construye mapas simbólicos progresivos
- Desarrolla hipótesis evolutivas basadas en interacciones previas dentro de la sesión
- Captura decisiones hermenéuticas del ejecutor

### 3.2 Imposibilidad de Re-ejecución Libre
- **No hay "volver a hacer"**: Una vez cerrada, la sesión es un artefacto histórico
- **No hay "borrar y empezar"**: Los resultados son documentos clínicos permanentes
- **No hay "ejecutar N veces"**: Cada workspace es único, vinculado a un momento terapéutico específico

### 3.3 Estados Esenciales
El workspace transita obligatoriamente por estados discretos:
1. **created**: Workspace reservado, aún no iniciado
2. **in_progress**: Sesión activa, ejecutor trabajando
3. **sealed**: Proceso completado, resultados generados
4. **reviewed**: Observadores han validado/revisado resultados

Cada transición es irreversible y auditada.

---

## 4. POR QUÉ NO ES RE-EJECUTABLE

### 4.1 Diferencia con Tests Clásicos
| Aspecto | Test Clásico | MCMI-4 Místico |
|---------|--------------|----------------|
| **Ejecución** | Múltiple, ilimitada | Una vez por workspace |
| **Resultado** | Scoring numérico fijo | Interpretación contextual evolutiva |
| **Permanencia** | Histórico versionalizable | Artefacto sellado único |
| **Propósito** | Medir constructo | Generar significado terapéutico |
| **Re-test** | Posible (test-retest) | NO aplica (nueva instancia = nuevo contexto) |

### 4.2 Razones Técnicas
- **Estado interno complejo**: El workspace acumula decisiones, ramificaciones, y contexto imposible de replicar
- **Dependencia temporal**: Las interpretaciones simbólicas reflejan el momento terapéutico específico
- **Integridad clínica**: Re-ejecutar invalidaría la autenticidad del proceso hermenéutico

### 4.3 Razones Éticas/Clínicas
- Los resultados son **documentos clínicos** con valor legal/terapéutico
- No se puede "deshacer" un proceso interpretativo completado
- La trazabilidad requiere inmutabilidad post-cierre

---

## 5. QUÉ LO DIFERENCIA DE CUALQUIER TEST CLÁSICO

### 5.1 Arquitectura de Datos
- **Tests clásicos**: `TestModule` → `UserTestAccess` → `ExecutionSession` → `Responses` → `Score`
- **MCMI-4 Místico**: `WorkspaceDefinition` → `WorkspaceInstance` → `WorkspaceSession` → `WorkspaceArtifact` → `InterpretativeResults`

### 5.2 Flujo de Autorización
- **Tests clásicos**: Asignación a sujeto → sujeto ejecuta → terapeuta revisa score
- **MCMI-4 Místico**: Terapeuta crea workspace → ejecutor autorizado realiza proceso → resultados sellados → revisión post-hoc

### 5.3 Naturaleza del Output
- **Tests clásicos**: Puntuaciones, percentiles, categorías diagnósticas
- **MCMI-4 Místico**: Mapas simbólicos, narrativas hermenéuticas, hipótesis relacionales, arquetipos activados

### 5.4 Modelo de Uso
- **Tests clásicos**: Herramienta de evaluación repetible
- **MCMI-4 Místico**: Evento terapéutico único, delimitado, irrepetible

---

## 6. IMPLICACIONES ARQUITECTÓNICAS

### 6.1 Separación Total de Tests
- **Tablas DB**: Independientes, sin FK a `TestModule` ni `UserTestAccess`
- **Endpoints**: Propios, bajo `/api/swm/mcmi4/`
- **Guards**: Basados en roles SWM, NO en asignaciones de tests
- **Frontend**: Rutas dedicadas, NO reutilizar `ExecuteTestView`

### 6.2 Gestión de Estado
- Requiere máquina de estados explícita
- Transiciones auditadas con timestamps y actor
- Bloqueos optimistas para concurrencia
- Rollback NO permitido post-seal

### 6.3 Seguridad y Compliance
- Registro de acceso por sesión
- Cifrado de interpretaciones sensibles
- Retención de artefactos según normativa clínica
- Trazabilidad completa de quién-hizo-qué-cuándo

---

## 7. CASOS DE USO PRINCIPALES

### 7.1 UC-01: Creación de Workspace
**Actor**: Terapeuta  
**Trigger**: Decisión clínica de realizar proceso MCMI-4 Místico  
**Outcome**: Workspace reservado en estado `created`, vinculado a sujeto de análisis

### 7.2 UC-02: Inicio de Sesión Interpretativa
**Actor**: Ejecutor autorizado  
**Trigger**: Workspace en estado `created`, ejecutor con permiso  
**Outcome**: Sesión activa (`in_progress`), navegación simbólica habilitada

### 7.3 UC-03: Progreso de Interpretación
**Actor**: Ejecutor  
**Trigger**: Sesión activa, prompts hermenéuticos en curso  
**Outcome**: Estado interno actualizado, decisiones registradas, mapas construidos

### 7.4 UC-04: Sellado de Resultados
**Actor**: Ejecutor  
**Trigger**: Proceso completado, validación final  
**Outcome**: Workspace en estado `sealed`, resultados inmutables, artefactos generados

### 7.5 UC-05: Revisión Post-Cierre
**Actor**: Observador (terapeuta)  
**Trigger**: Workspace en estado `sealed` o `reviewed`  
**Outcome**: Acceso a resultados finales, sin capacidad de modificación

---

## 8. PRINCIPIOS DE DISEÑO

1. **Inmutabilidad Post-Seal**: Los resultados sellados son permanentes
2. **Auditoría Total**: Cada acción queda registrada con actor, timestamp, y contexto
3. **Autorización Explícita**: No hay permisos implícitos ni herencia de roles de tests
4. **Estado como Primera Clase**: El workspace ES su estado, no un contenedor de ejecuciones
5. **Separación de Concerns**: Datos del sujeto ≠ ejecución del proceso ≠ resultados terapéuticos

---

## 9. ALCANCE FUERA DE ESTE DOCUMENTO

Este overview NO cubre:
- Modelo de datos específico (ver `SWM_MCMI4_DOMAIN_MODEL.md`)
- Especificación de API (ver `SWM_MCMI4_API_SPEC.md`)
- Lógica de permisos (ver `SWM_MCMI4_PERMISSIONS.md`)
- Contrato frontend (ver `SWM_MCMI4_FRONTEND_CONTRACT.md`)
- Checklist de implementación (ver `SWM_MCMI4_IMPLEMENTATION_CHECKLIST.md`)

---

**FIN DEL OVERVIEW**  
Este documento establece los fundamentos conceptuales del SWM MCMI-4 Místico como workspace autónomo, sin dependencias de la infraestructura de tests.
