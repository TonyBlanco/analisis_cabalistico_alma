## Auditoría de cambios – Nueva estructura vs Legacy (Dec 14)

### 1. Alcance de los cambios

- **Qué se ha hecho**
  - Se ha **reconstruido el frontend** sobre una base nueva (`app/(public)` y `app/(dashboard)`).
  - La app antigua se ha movido a `_legacy_app_backup` para **aislarla** pero seguir consultándola.
  - Se ha alineado el frontend con la **arquitectura de roles** y los **flujos clínicos cerrados** definidos en el backend.

- **Objetivo**
  - Pasar de un frontend muy grande, inconsistente y frágil a una **estructura mínima, estable y gobernada por roles**, fácil de auditar y extender.

---

### 2. Comparación estructural

#### 2.1 Zona pública

- **Legacy**
  - Rutas múltiples y dispersas:
    - `landing/personal`, `landing/therapist`, `demo`, `marketplace`, `services`, etc.
    - Mezcla de rutas clínicas, de marketing y experimentales en el mismo árbol.
  - `layout.tsx` y `globals.css` compartidos para casi todo, lo que hacía difícil aislar contextos.

- **Nueva estructura**
  - `app/(public)/`:
    - `page.tsx` → landing clínica principal.
    - `login/page.tsx` → login profesional.
    - `register/personal/page.tsx` y `register/therapist/page.tsx` → registros específicos.
  - `app/layout.tsx` y `(public)/layout.tsx` definen una zona **pública limpia**, separada del dashboard.

- **Conclusión estructural**
  - Se pasa de un **árbol gigantesco y mezclado** a un **núcleo público mínimo y claro**, alineado con los flujos reales (login + registro + landing clínica).

#### 2.2 Zona privada (dashboards)

- **Legacy**
  - `_legacy_app_backup/(dashboard)/dashboard/...` con:
    - `patient/page.tsx`, `personal/page.tsx`, `therapist/page.tsx`, `account`, `tools/*`, etc.
    - Además, muchas rutas paralelas: `patients/*`, `tests/*`, `therapist/patients/*`, `wellness/*`, etc.
  - Problemas:
    - **Solapamiento de rutas** (dashboard vs `patients/`, `tests/`, etc.).
    - Duplicación de conceptos de paciente y tests en varios sitios.
    - Difícil garantizar que todo respete los **nuevos roles** y flujos de backend.

- **Nueva estructura**
  - `app/(dashboard)/layout.tsx` → layout único y privado.
  - `app/(dashboard)/dashboard/page.tsx` → redirige según rol activo.
  - Subrutas:
    - `dashboard/admin/*` → administración (visión sistema, gobernanza).
    - `dashboard/therapist/*` → trabajo clínico (pacientes, cábala, resultados, etc.).
    - `dashboard/patient/*` → tests asignados y resultados (en curso).
    - `dashboard/personal/*` → uso individual (en curso).
    - `dashboard/profile`, `dashboard/account`, `dashboard/resources` → secciones transversales.

- **Conclusión estructural**
  - El legacy tenía una **malla de rutas muy densa y acoplada**.
  - La nueva estructura impone un **único punto de entrada al área privada** y **segmenta por rol**, lo que reduce mucho el riesgo de fugas de permisos.

---

### 3. Comparación funcional por rol

#### 3.1 Admin

- **Legacy**
  - Panel admin existente, pero:
    - Mezcla de responsabilidades.
    - Menos alineado con el hardening actual (tests, roles, LMS).
  - Rutas de administración más dispersas.

- **Nueva estructura**
  - `dashboard/admin/page.tsx` y componentes de `AdminSystemOverview`.
  - Enfoque en:
    - Visión del sistema.
    - Preparación para gobierno de tests, usuarios, LMS.
  - **Mejor alineado con el rol “no clínico”** que no debe hacer práctica con pacientes.

- **Riesgo / Gap**
  - Ciertas pantallas detalladas de administración legacy (si existían muy específicas) pueden no estar aún replicadas, pero la base para ampliarlas es más limpia.

#### 3.2 Therapist

- **Legacy**
  - Muchas rutas:
    - `therapist/patients/*`, `patients/*`, `tests/*`, `wellness/*`, `tools/*`…
  - Potencial para:
    - Confusión entre “tests clínicos” y “tests personales”.
    - Accesos no totalmente validados por backend en algunos flujos antiguos.

- **Nueva estructura**
  - Dashboard terapeuta descrito como **COMPLETO** en la documentación:
    - Paciente activo, selector de pacientes, catálogo de tests filtrado.
    - Asignación de `patient_self` y ejecución de `therapist_clinical`.
    - Panel de resultados y UX clínico pulido.
  - APIs nuevas (`patient-api`, `assignment-api`, `test-api`, `resources-api`) + componentes (`CreatePatientModal`, `PatientPicker`, `ClinicalEvaluationsSection`, etc.).
  - Alineado al hardening:
    - El frontend ya no "inventa" flujos: se apoya en API que respetan rol, `execution_mode` y ownership.

- **Conclusión funcional**
  - **Mejora clara** frente al legacy:
    - Menos dispersión.
    - Más cercano a procesos clínicos reales.
    - Mapeo directo al modelo de seguridad del backend.

#### 3.3 Patient

- **Legacy**
  - Paciente tenía múltiples formas de acceder a tests (a través de `tests/*`, `results/*`, etc.), con menos separación entre clínico y personal.
  - Riesgo de que un paciente llegara a flujos que ahora están restringidos.

- **Nueva estructura**
  - `dashboard/patient/*` → en **implementación**, con objetivo muy claro:
    - Ver tests asignados (`patient_self`).
    - Ejecutarlos.
    - Ver solo sus resultados.
    - Sin capacidad de asignar tests ni acceder a modo clínico.

- **Gap actual**
  - La **paridad funcional total con el legacy aún no está cerrada**:
    - El flujo paciente nuevo está definido, pero pendiente de ejecución completa.
    - Mientras tanto, se debe tener cuidado de no reactivar rutas legacy que permitan accesos viejos.

#### 3.4 Personal (usuario individual)

- **Legacy**
  - Múltiples pantallas y tests que podían servir tanto para uso personal como clínico, sin separación muy clara.

- **Nueva estructura**
  - `dashboard/personal/*`:
    - Concepto claro: uso individual, **no clínico**, sin pacientes.
  - Todavía en fase de diseño / implementación a partir del dashboard paciente.

- **Riesgo / Oportunidad**
  - Falta cerrar la implementación, pero la separación conceptual ahora es mucho más sana:
    - Backend ya endurecido.
    - Será más fácil asegurar que "personal" nunca toca datos clínicos.

---

### 4. Seguridad, arquitectura y gobernanza

- **Legacy**
  - Frontend muy grande, con años de capas.
  - Difícil garantizar que todas las rutas respetaran:
    - Nuevos roles cerrados.
    - Nuevos modos de ejecución (`patient_self` / `therapist_clinical`).
  - Mezcla de vistas clínicas, místicas, marketing y experimentales.

- **Nueva implementación**
  - Backend:
    - Hardening completado (validación de rol, `execution_mode`, ownership, filtros de acceso, tests de seguridad).
  - Frontend:
    - Se minimiza la superficie: nuevo árbol más pequeño y alineado al backend.
    - Se retira el legacy de la ruta principal para evitar que "se cuele" por error.
    - El dashboard se convierte en **única puerta de entrada privada**, guiada por rol.
  - Documentación:
    - `README_CHANGELOG.md` fija reglas explícitas (pacientes no se registran solos, no hay modos mixtos, etc.).
    - Esto da un marco de gobernanza mucho más claro que el legacy.

- **Conclusión de auditoría de seguridad**
  - La nueva estructura **reduce riesgos** de:
    - Rutas olvidadas o no auditadas.
    - Flujos que no respeten el modelo de seguridad.
  - El legacy queda como **backup consultivo**, no como código "vivo".

---

### 5. Riesgos, regresiones y puntos a vigilar

- **Riesgo 1 – Paridad funcional con legacy**
  - Algunas rutas legacy (p.ej. tests específicos, vistas muy detalladas de pacientes, herramientas como `tools/*`) pueden no estar aún reproducidas 1:1.
  - Mitigación:
    - Aceptar que el nuevo sistema prioriza **seguridad + claridad clínica** por encima de "todas las features históricas".
    - Reintroducir solo lo que tenga sentido clínico / de negocio, dentro de la nueva arquitectura.

- **Riesgo 2 – Dependencias ocultas del legacy**
  - Si algún consumidor externo o proceso interno dependía de rutas legacy (URL antiguas, deep-links, etc.), pueden romperse.
  - Mitigación:
    - Mapear qué flujos externos existían y decidir:
      - Redirecciones desde legacy a nuevas rutas.
      - O deprecación controlada.

- **Riesgo 3 – Estado intermedio del dashboard paciente/personal**
  - Mientras esos dashboards no estén 100% terminados:
    - Hay riesgo de "huecos UX" (usuario que no ve aún todos sus flujos).
  - Mitigación:
    - Priorizar: cerrar dashboard paciente (A) y luego personal, como indica la documentación.

---

### 6. Conclusión de auditoría

- **Mejoras claras frente al legacy**
  - Arquitectura mucho más limpia, **centrada en roles y flujos clínicos inmutables**.
  - Alineación directa con el backend endurecido.
  - Reducción de superficie de ataque y de rutas huérfanas.
  - Documentación honesta del estado y de los próximos pasos.

- **Coste consciente**
  - Se sacrifica parte de la **amplitud histórica** de la app legacy para ganar:
    - Estabilidad.
    - Seguridad.
    - Claridad clínica y de negocio.

- **Recomendación**
  - Mantener `_legacy_app_backup` solo como **referencia funcional**, nunca como base de nuevas features.
  - Cualquier funcionalidad que se quiera rescatar debe:
    1. Pasar por el filtro de la nueva **arquitectura de roles y hardening**.
    2. Ser reimplementada dentro de `app/(public)` o `app/(dashboard)` con APIs nuevas.


## Cambios – Nueva implementación (últimas 24 horas)

### 1. Commits realizados

#### 1.1 Commit `be7cd22b` – Backend: hardening de ejecución de tests

- **Seguridad de ejecución de tests**:
  - Implementado hardening completo de seguridad en la ejecución de tests (`backend/api/tests/test_execution_security.py`, `backend/api/validators/test_execution.py`).
  - Validaciones de:
    - **Rol del usuario** que ejecuta el test.
    - **execution_mode** (`patient_self` vs `therapist_clinical`).
    - **Prevención de autoevaluación** y abuso de flujos clínicos.
    - **Ownership terapeuta–paciente** y aislamiento de resultados.
- **Migraciones de usuarios admin**:
  - Ajustes menores en migraciones de admins (`0013_create_all_admin_users.py`, `0014_force_reset_admin_passwords.py`, `0016_configure_admin_profiles.py`) para asegurar configuración correcta de perfiles admin.
- **Suite de tests backend**:
  - Ampliación significativa de tests en `backend/api/test_views.py` y creación de `test_execution_security.py`.
  - Resultado: backend en estado **apto para producción técnica**, con validaciones fuertes y sin vulnerabilidades conocidas en esta capa.

#### 1.2 Commit `8dc06eb7` – Frontend + Flujos clínicos + Perfil

- **Arquitectura de roles y dashboards**:
  - Refactor y reconstrucción de la estructura de `tonyblanco-app/app`:
    - `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/(public)/login/page.tsx`, `app/(public)/register/personal/page.tsx`, `app/(public)/register/therapist/page.tsx`.
    - `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`.
  - Implementación de dashboards específicos:
    - **Admin**: `app/(dashboard)/dashboard/admin/page.tsx` (overview del sistema, gobernanza de tests/usuarios, base para LMS y controles).
    - **Therapist**: nuevas páginas como `dashboard/therapist/page.tsx`, `dashboard/therapist/cabala/page.tsx`, `dashboard/therapist/cabala/results/[id]/page.tsx`, `dashboard/therapist/patients/page.tsx`.
    - **Patient / Personal**: primeras versiones y rutas para `dashboard/patient/page.tsx`, `dashboard/patient/cabala/results/[id]/page.tsx`, `dashboard/personal/page.tsx`, `dashboard/personal/basic-analysis/page.tsx` y variantes.
  - Migración de la app legacy a `_legacy_app_backup` para aislar el código viejo sin romper la nueva arquitectura.

- **Persistencia de perfil, límites de cambio de nombre y geolocalización**:
  - Nuevas libs y APIs:
    - `tonyblanco-app/lib/profile-api.ts`, `profile-validation.ts`, `session.ts`, `role-state.ts`, `auth-state.ts`, `getUserRole.ts`, `getActiveDashboardRole.ts`.
    - `geocoding-api.ts` y `useGeoResolver.ts` para resolución de localidad/país.
    - `normalizeLocation.ts` para normalizar localizaciones.
  - Componentes de UI asociados:
    - `ProfileMenu.tsx`, `ProfileCompletionModal.tsx`, `NameVerificationModal.tsx`, `GeoLocationField.tsx`.
    - Implementación de **persistencia de perfil** y **controles para limitar cambios de nombre** y bloquear coordenadas/ubicación.

- **Gestión de pacientes, tests y recursos**:
  - Nuevos componentes clínicos:
    - `CreatePatientModal.tsx`, `PatientPicker.tsx`, `PatientAssignedTestsSection.tsx`, `PatientResultsSection.tsx`, `AssignedTestsSection.tsx`, `ClinicalEvaluationsSection.tsx`, `PersonalTestsSection.tsx`.
    - `ActivePatientIndicator.tsx`, `RoleBadge.tsx`, `RoleIndicator.tsx`, `Sidebar.tsx`.
  - APIs de negocio:
    - `patient-api.ts`, `assignment-api.ts`, `test-api.ts`, `resources-api.ts`, `active-patient.ts`, `role-guards.ts`.
  - Recursos y materiales:
    - `components/Resources/*` (AdminResourcesPage, TherapistResourcesPage, PatientResourcesPage, PersonalResourcesPage, ResourceCard, SessionLinkModal, AssignResourceModal).

- **Dashboards funcionales y estructura clínica**:
  - Reorganización fuerte de las páginas de dashboard:
    - `dashboard/account/page.tsx` (reimplementado), `dashboard/profile/page.tsx`, `dashboard/resources/page.tsx`.
    - Limpieza y simplificación de `dashboard/patient/page.tsx`, `dashboard/personal/page.tsx`, `dashboard/therapist/page.tsx` con nuevas estructuras basadas en rol y estado de sesión.
  - Separación clara entre:
    - **Zona pública** (landing, login, registro).
    - **Zona privada** (dashboards por rol, sin headers/footers públicos).

- **Documentación y guías**:
  - `FRONTEND-RESET-2025-12-14.md`: documento explicando el reset del frontend y la nueva estructura limpia.
  - `docs/PATIENT_DASHBOARD_PHASE_0_DISCOVERY.md`: análisis inicial del dashboard de paciente.
  - `docs/THERAPIST_DASHBOARD_PHASE_0_DISCOVERY.md` y `docs/THERAPIST_DASHBOARD_WORKSPACE.md`: definición funcional y técnica del dashboard de terapeuta y su workspace.
  - `TONYBLANCO-APP/_legacy_components_backup/*`: backup de componentes relevantes anteriores (p.ej. `RoleBadge.tsx`, `SCDFHelpModal.tsx`).

- **Backend asociado al commit**:
  - `backend/api/birth_data_model.py`: ampliaciones para soportar datos de nacimiento y persistencia usada por las nuevas vistas.
  - Nuevas migraciones: `0025_add_name_change_tracking.py` (tracking de cambios de nombre).
  - Extensión de tests en `backend/api/test_views.py`.
  - Rutas actualizadas en `backend/api/urls.py` y lógica en `backend/api/views.py`.

### 2. Cambios sin commitear actualmente

En el `git status` actual hay modificaciones **no commiteadas**, casi todas cosméticas, más un archivo nuevo importante:

- **Cambios menores (trailing newline / formato)**:
  - `backend/LOCAL_LOGIN_GUIDE.md`
  - `backend/api/astrology_kerykeion/__init__.py`
  - `backend/api/astrology_kerykeion/mapper_cabala.py`
  - `backend/api/geocoding_utils.py`
  - `backend/create_local_user.py`
  - `backend/list_users.py`
  - `backend/setup_local_login.py`
  - `tonyblanco-app/lib/admin-api.ts`
  - `tonyblanco-app/lib/angels_db.ts`
  - `tonyblanco-app/lib/gemini-config.ts`
  - `tonyblanco-app/lib/kabbalistic-ai-base.ts`
  - `tonyblanco-app/test-gemini-rest.js`
  - Todos estos cambios son solo **líneas en blanco al final de archivo** (añadido de newline final, sin impacto funcional).

- **Nuevo documento clave**:
  - `docs/README_CHANGELOG.md` (archivo nuevo, muy extenso).
    - Resume el **estado real del proyecto**:
      - Plataforma clínica + cábala aplicada.
      - Arquitectura final de roles (`admin`, `therapist`, `patient`, `personal`) y regla crítica: pacientes solo existen si un terapeuta los crea.
      - Estado del backend: hardening completado, tests, ausencia de vulnerabilidades conocidas.
      - Estado del frontend: reset, nueva estructura `app/(public)` y `app/(dashboard)`, dashboards reales.
      - Estado de cada dashboard:
        - **Therapist**: completo y listo para uso clínico real.
        - **Patient**: en implementación (último bloque crítico para cerrar el loop clínico).
        - **Personal** y **LMS/monetización**: siguientes pasos.
      - Lista priorizada de próximos pasos y visión honesta del proyecto:
        - Arquitectura cerrada.
        - Seguridad cerrada.
        - Clínica operativa.
        - Paciente en curso.
        - Monetización pendiente.

### 3. Resumen ejecutivo

- **Backend**: se completó un hardening fuerte de la ejecución de tests, con validaciones de rol, modo de ejecución y ownership, más una batería grande de tests nuevos. El sistema es ahora **mucho más seguro** en cuanto a ejecución de evaluaciones clínicas.
- **Frontend / Dashboards**: se ha hecho una **reimplementación estructural** del frontend, aislando el legacy, creando nuevas rutas `(public)` y `(dashboard)` y levantando dashboards funcionales para admin, terapeuta, paciente y personal (estos dos últimos en diferentes grados de madurez).
- **Perfil y flujo clínico**: se añadió **persistencia de perfil**, validación de nombre y geolocalización, gestión de pacientes, asignación de tests, recursos y resultados, todo gobernado por roles y estado de sesión.
- **Cambios no commiteados**: solo hay un archivo funcional nuevo (`docs/README_CHANGELOG.md` con el estado global del proyecto) y pequeños ajustes de formato (newline final) en varios archivos de backend y frontend, sin cambios de lógica.
