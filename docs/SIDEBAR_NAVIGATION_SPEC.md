# Sidebar Navigation Specification

**Especificación completa del sistema de navegación lateral (sidebar) por rol.**

---

## 1️⃣ QUÉ ERA LA DECISIÓN ORIGINAL (RESUMEN CLARO)

La recomendación fue:
- **Sidebar izquierdo persistente**, con navegación por rol, no por páginas sueltas
- Optimizado para **tablet**, uso clínico continuado y crecimiento en módulos

### Motivos clave:
- En tablet, el sidebar lateral es superior a menús superiores
- En clínica, el usuario no "navega", **trabaja**
- Permite añadir recursos, LMS, históricos sin romper UX
- Es el patrón estándar en software clínico y educativo profesional

👉 **Fue una decisión correcta, y el estado actual del proyecto la necesita.**

---

## 2️⃣ ESPECIFICACIÓN RECONSTRUIDA DEL SIDEBAR (EXACTA)

Esto es lo que habíamos acordado implícitamente, ahora lo dejo explícito.

### 🟣 ESTRUCTURA GENERAL (COMÚN)

Sidebar izquierdo fijo, con:
- Ancho estable (tablet-friendly)
- Iconos + texto
- Sección activa resaltada
- Contenido filtrado por rol
- **NO mezcla de roles**

---

## 🧑‍⚕️ SIDEBAR — TERAPEUTA

```
📊 Workspace Clínico
   └─ /dashboard/therapist

👥 Pacientes
   ├─ Lista de pacientes
   ├─ Paciente activo (contextual)
   └─ Historial / correlaciones

🧪 Tests
   ├─ Catálogo de tests
   ├─ Asignar tests (patient_self)
   └─ Ejecutar clínicos (therapist_clinical)

📈 Resultados
   ├─ Resultados por paciente
   └─ Anotaciones clínicas

📚 Recursos
   ├─ Documentos clínicos
   ├─ Protocolos
   └─ Material educativo

⚙️ Cuenta
   └─ Perfil terapeuta
```

### 🎯 Pensado para:
- Uso continuo
- Paciente activo
- Clínica real

---

## 🧑 SIDEBAR — PACIENTE

```
🏠 Inicio
   └─ /dashboard/patient

🧪 Mis Tests
   ├─ Tests asignados
   └─ Ejecutar test

📊 Mis Resultados
   └─ Resultados personales

📚 Recursos
   ├─ Recursos asignados
   └─ Material educativo

⚙️ Mi Cuenta
   └─ Perfil personal
```

### 🎯 Clave:
- **NO** ve clínica
- **NO** ve asignación
- **NO** ve otros pacientes

---

## 👤 SIDEBAR — PERSONAL (usuario individual)

```
🏠 Inicio
   └─ /dashboard/personal

🧪 Tests
   ├─ Tests disponibles
   └─ Historial propio

📚 Recursos
   ├─ Contenido abierto
   └─ Cursos / materiales

⚙️ Cuenta
   └─ Perfil personal
```

### 🎯 Pensado para:
- Uso privado
- Monetización futura
- Sin rol clínico

---

## 🛡️ SIDEBAR — ADMIN (mínimo)

```
📊 Panel Admin
👥 Usuarios
🧑‍⚕️ Terapeutas
📚 LMS
⚙️ Sistema
```

---

## 📋 Reglas de Implementación

### Principios Fundamentales:
1. **Separación estricta por rol**: Cada rol ve SOLO su sidebar
2. **Persistencia**: El sidebar permanece visible durante la navegación
3. **Tablet-first**: Diseño optimizado para pantallas medianas
4. **Contexto clínico**: Para terapeutas, mantener contexto del paciente activo
5. **Escalabilidad**: Estructura que permite añadir módulos sin romper UX

### Restricciones:
- ❌ **NUNCA** mezclar elementos de diferentes roles en el mismo sidebar
- ❌ **NUNCA** ocultar el sidebar en páginas principales (solo en modales/fullscreen)
- ❌ **NUNCA** usar navegación por tabs superiores como alternativa principal
- ✅ **SIEMPRE** mostrar el rol actual y permitir cambio de contexto si aplica
- ✅ **SIEMPRE** mantener el estado activo visualmente claro

### Estados del Sidebar:
- **Activo**: Sección actual resaltada
- **Expandido**: Submenús visibles (si aplica)
- **Colapsado**: Solo iconos (opcional, para pantallas pequeñas)
- **Oculto**: Solo en modales o vistas fullscreen

---

## 🔗 Rutas Asociadas

### Terapeuta:
- `/dashboard/therapist` - Workspace principal
- `/dashboard/therapist/patients` - Lista de pacientes
- `/dashboard/therapist/patients/[id]` - Paciente específico
- `/dashboard/therapist/tests` - Catálogo y asignación
- `/dashboard/therapist/results` - Resultados clínicos
- `/dashboard/therapist/resources` - Recursos clínicos
- `/dashboard/account` - Perfil terapeuta

### Paciente:
- `/dashboard/patient` - Inicio paciente
- `/dashboard/patient/tests` - Tests asignados
- `/dashboard/patient/results` - Resultados personales
- `/dashboard/patient/resources` - Recursos asignados
- `/dashboard/account` - Perfil personal

### Personal:
- `/dashboard/personal` - Inicio personal
- `/dashboard/personal/tests` - Tests disponibles
- `/dashboard/personal/resources` - Contenido abierto
- `/dashboard/account` - Perfil personal

### Admin:
- `/dashboard/admin` - Panel principal
- `/dashboard/admin/users` - Gestión de usuarios
- `/dashboard/admin/therapists` - Gestión de terapeutas
- `/dashboard/admin/lms` - Sistema LMS
- `/dashboard/admin/system` - Configuración del sistema

---

## 📝 Notas de Implementación

### Componentes Clave:
- `components/Sidebar.tsx` - Componente principal del sidebar
- `components/SidebarNavItem.tsx` - Item individual de navegación
- `lib/role-guards.ts` - Guards para filtrar por rol
- `app/(dashboard)/layout.tsx` - Layout que incluye el sidebar

### Responsive Design:
- **Desktop (>1024px)**: Sidebar completo con iconos + texto
- **Tablet (768px-1024px)**: Sidebar completo (target principal)
- **Mobile (<768px)**: Sidebar colapsable o drawer lateral

### Accesibilidad:
- Navegación por teclado (Tab, Enter, Esc)
- ARIA labels en todos los elementos
- Indicadores visuales claros del estado activo
- Contraste adecuado para uso clínico prolongado

---

## ⚠️ Decisiones Arquitectónicas

### Por qué NO menú superior:
1. En tablet, el espacio vertical es más valioso que el horizontal
2. El sidebar permite más items sin saturar
3. Patrón estándar en software clínico profesional
4. Mejor para workflows continuos (no navegación esporádica)

### Por qué NO tabs:
1. Tabs limitan el número de secciones visibles
2. No escalan bien con múltiples módulos
3. Ocultar información importante en dropdowns rompe UX clínica

### Por qué sidebar persistente:
1. Contexto siempre visible (rol, paciente activo, etc.)
2. Acceso rápido a todas las secciones
3. Reduce clicks y navegación innecesaria
4. Mejor para sesiones de trabajo prolongadas

---

## 🔄 Evolución Futura

El sidebar está diseñado para crecer con:
- **Módulos adicionales**: Se añaden como nuevas secciones
- **Submenús**: Se expanden cuando hay muchos items
- **Contextos**: Terapeuta puede tener "vista rápida" del paciente activo
- **Notificaciones**: Badges en items relevantes
- **Búsqueda**: Búsqueda rápida dentro del sidebar (futuro)

---

**Última actualización**: 2025-12-15  
**Estado**: Especificación completa y lista para implementación
