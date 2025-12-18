# PROJECT STATE – LOCKED

## Arquitectura
- Frontend: Next.js App Router
- Backend: Django + DRF
- Auth: Token-based
- Roles: admin / therapist / personal / patient (SEALED)
- Execution modes: patient_self / therapist_clinical (SEALED)

## Núcleo de datos
- AnalysisRecord: IMPLEMENTADO
- Snapshots: birth_data_snapshot + algorithm_snapshot (inmutables)
- Adapters: clinical / kabbalah / astrology / legacy
- Service: create_and_execute_analysis
- Legacy: NO TOCADO

## Dashboards
- Admin: mínimo funcional
- Therapist: workspace clínico completo
- Personal: mínimo clínico
- Patient: pendiente de integración final

## Reglas clave
- Admin no es actor clínico
- execution_mode nunca viene del request
- No autoevaluación
- Ownership terapeuta–paciente obligatorio

## Estado actual
- Build estable
- Zero regression
- Fase siguiente: consumidores de AnalysisRecord

---

## Sección Vinculante — UX Clínico

### Catálogo Clínico vs Workspace (Estado Cerrado)

**Estado: CERRADO / NO INTERPRETABLE**

Esta sección define de forma definitiva y no negociable la relación entre:
- Workspace Clínico del Terapeuta
- Catálogo Clínico de Tests

Cualquier cambio futuro en UX/UI debe respetar estrictamente este modelo conceptual.

### Principio Arquitectónico Central

🚨 **El Catálogo Clínico es una ENTIDAD GLOBAL**

El Catálogo Clínico:
- Existe a nivel de plataforma
- Es compartido entre:
  - Terapeutas
  - Pacientes
  - Flujos futuros (marketplace, monetización, licencias)
- Centraliza:
  - Descubrimiento de tests
  - Información educativa de tests
  - Modales explicativos ("¿Qué es este test?")
  - Asignación de tests
  - Evolución futura del sistema

❌ **El Catálogo NO pertenece a ningún Workspace**  
❌ **El Catálogo NO vive dentro del contexto de un paciente**  
❌ **El Catálogo NO es un componente embebido**

### Definición Formal de Capas

#### 🧠 Workspace Clínico del Terapeuta

**Rol: Contexto + Acción**

El Workspace es estrictamente paciente-céntrico.

**Contiene:**
- Paciente activo
- Estado clínico actual
- Tests asignados
- Resultados
- Progreso
- Acciones clínicas inmediatas

**No contiene:**
- Catálogos globales
- Sistemas de exploración
- Descubrimiento de tests
- Lógicas de marketplace

👉 **El Workspace solo enlaza al Catálogo.**

#### 📚 Catálogo Clínico

**Rol: Sistema global de descubrimiento y asignación**

El Catálogo:
- Vive fuera de cualquier Workspace
- Es agnóstico al paciente por defecto
- Puede contextualizarse mediante `patient_id` (solo vía URL)

**Ubicación canónica:**
```
/dashboard/therapist/tests
/dashboard/therapist/tests?patient_id={id}
```

### Flujo Funcional Canónico (CERRADO)

Este flujo YA EXISTE y NO puede romperse:

1. Terapeuta selecciona paciente activo en Workspace
2. Terapeuta pulsa "Asignar tests"
3. Navegación explícita a:
   ```
   /dashboard/therapist/tests?patient_id={id}
   ```
4. Se muestra el Catálogo completo
5. Terapeuta asigna tests desde el Catálogo
6. Los tests asignados aparecen automáticamente en el Workspace

⚠️ **Este flujo no se reimplementa, no se replica y no se simplifica.**

### Reglas Absolutas (Bloqueantes)

❌ NO mover el Catálogo dentro del Workspace  
❌ NO duplicar el Catálogo  
❌ NO embeber el Catálogo en paneles colapsables  
❌ NO anidar el Catálogo bajo contexto de paciente  
❌ NO eliminar modales informativos de tests  
❌ NO modificar rutas, lógica de asignación ni backend  
❌ NO alterar execution_mode ni flujos clínicos

**Cualquier cambio que viole estas reglas se considera inválido.**

### Permisos UX (ÚNICOS permitidos)

✔ Mejorar jerarquía visual del Workspace  
✔ Reducir ruido y scroll innecesario  
✔ Clarificar visualmente "dónde vive" cada cosa  
✔ Añadir CTAs claros hacia el Catálogo  
✔ Uso de cards, espaciado, tipografía e iconografía  
✔ Mejorar affordances de navegación

⚠️ **Siempre sin alterar lógica ni arquitectura.**

### Modelo Mental Obligatorio (Referencia)

```
Workspace = acción clínica contextual
Catálogo = sistema global de descubrimiento
```

La UI debe hacer sentir:
- El Workspace como **foco**
- El Catálogo como **espacio amplio y global**

La transición entre ambos debe ser **intencional y explícita**, nunca implícita.

### Checklist de Validación (Obligatorio antes de merge)

- [ ] El Catálogo NO se renderiza en JSX del Workspace
- [ ] El Workspace solo contiene links/CTAs al Catálogo
- [ ] La ruta `/dashboard/therapist/tests` permanece intacta
- [ ] La asignación de tests funciona como antes
- [ ] Los modales informativos siguen activos
- [ ] No se tocó backend ni contratos
- [ ] No hay duplicación visual del Catálogo

**Si cualquier punto falla → NO SE MERGEA**

### Nota Final de Gobernanza

Este proyecto es una **plataforma clínica**, no una app experimental.

El objetivo del UX es:
- Clarificar
- Respetar capas
- Reforzar el modelo mental

**No** reinterpretar arquitectura.  
**No** colapsar conceptos.  
**No** "mejorar" rompiendo límites.

🔒 **Estado: BLOQUEADO**

Cualquier modificación futura requiere actualización explícita de este documento.
