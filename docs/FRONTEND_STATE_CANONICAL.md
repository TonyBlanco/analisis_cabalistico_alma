# Plataforma Clínica – Estado Canónico del Frontend

**Fecha**: 2025-12-16  
**Estado**: Estable tras reconstrucción y hardening  
**Este documento es la fuente de verdad del frontend activo**

---

## 1. PROPÓSITO DE ESTE DOCUMENTO

Este documento define el estado canónico del frontend de la Plataforma Clínica.

Su objetivo es:

- Evitar reconstrucciones duplicadas
- Evitar pérdida de decisiones arquitectónicas
- Servir de referencia obligatoria para:
  - nuevos agentes (Cursor, auditorías)
  - futuros desarrollos
  - mantenimiento y refactor

⚠️ **Cualquier cambio estructural que no esté reflejado aquí NO se considera cerrado.**

---

## 2. ESTRUCTURA DE CARPETAS VÁLIDA (CANÓNICA)

La única estructura frontend válida es:

```
tonyblanco-app/
└── app/
    ├── (public)/
    │   ├── page.tsx                # Landing pública
    │   ├── login/page.tsx          # Login profesional
    │   └── register/               # Registros controlados
    │
    ├── (dashboard)/
    │   ├── layout.tsx              # Layout común con sidebar
    │   └── dashboard/
    │       ├── page.tsx            # Redirect por rol
    │       │
    │       ├── admin/              # Admin (mínimo)
    │       ├── therapist/          # Dashboard terapeuta
    │       ├── patient/            # Dashboard paciente
    │       └── personal/           # Usuario individual
    │
    └── layout.tsx                  # Layout raíz
```

**Todo código fuera de esta estructura:**
- `_legacy_app_backup`
- `_legacy_components_backup`

❌ **NO es activo**  
❌ **NO debe usarse como referencia**

---

## 3. DASHBOARDS ACTIVOS POR ROL

### 3.1 Admin

- Acceso total no clínico
- Gestión de usuarios, terapeutas, sistema
- **Estado**: mínimo funcional
- No participa en flujos clínicos

### 3.2 Terapeuta

**Estado**: FUNCIONAL Y CERRADO

Incluye:
- Contexto de paciente activo
- Gestión de pacientes
- Asignación de tests (patient_self)
- Ejecución clínica (therapist_clinical)
- Visualización de resultados
- Anotaciones clínicas
- Aislamiento estricto por ownership

### 3.3 Paciente

**Estado**: FUNCIONAL Y ESTABLE

Incluye:
- Acceso solo si existe (creado por terapeuta)
- Tests asignados
- Ejecución de tests patient_self
- Visualización de resultados propios
- Anotaciones visibles solo si `visible_to_patient = true`

Restricciones:
- ❌ No asigna tests
- ❌ No ejecuta clínica
- ❌ No ve otros pacientes

### 3.4 Personal (usuario individual)

**Estado**: BASE CREADA / FUNCIONALIDAD LIMITADA

Incluye:
- Acceso individual
- Uso no clínico
- Base preparada para tests personales y monetización

---

## 4. ESTADO DE CIERRE POR CAPA

| Capa | Estado | Notas |
|------|--------|-------|
| **Arquitectura** | ✅ Cerrada | Roles y flujos inmutables |
| **Seguridad** | ✅ Cerrada | Backend no confía en frontend |
| **Frontend** | ✅ Estable | Sin loops, sin renders inestables |
| **Clínica end-to-end** | ✅ Operativa | Terapeuta → Paciente → Resultados |
| **Recursos / LMS** | 🟡 Pendiente | Estructura prevista, no activa |

---

## 5. REGLAS OBLIGATORIAS DE IMPLEMENTACIÓN FRONTEND

**Estas reglas NO son sugerencias.**

### 5.1 Fetch y useEffect

- Todo fetch se ejecuta **una sola vez por montaje**
- `useEffect` con fetch → `[]` o `useRef`
- ❌ **Nunca** depender de estados que el propio effect modifica

### 5.2 Guards

- Los guards **no deben romper el render**
- Fallos de red → estado controlado, no excepción
- El dashboard raíz no bloquea por falta de datos

### 5.3 Manejo de errores

- **Nunca** lanzar errores de red sin capturar
- La UI **siempre** debe renderizar algo
- **No hay** pantallas en blanco

### 5.4 Backend assumptions

- **Ningún** endpoint se asume
- Todo endpoint usado debe existir o manejar error
- El frontend es **tolerante** a backend parcial

---

## 6. ESTADO ACTUAL CONSIDERADO "BUENO CONOCIDO"

**Commit de referencia:**
```
57c3ce31
fix: stabilize patient dashboard render and stop infinite fetch loops
```

Cualquier cambio futuro debe:
- partir de este estado
- respetar este documento
- actualizar este documento si altera estructura o reglas

---

## 7. NOTA FINAL

Este frontend **ya no es un prototipo**.

Es una base clínica real, endurecida, estable y extensible.

A partir de aquí:
- se construye
- no se reinventa
- no se reescribe

---

**FIN DEL DOCUMENTO**
