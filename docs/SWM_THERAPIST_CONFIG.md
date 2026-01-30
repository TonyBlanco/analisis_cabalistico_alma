# SWM Therapist Config - Workspace de Configuración del Terapeuta

## Resumen

Workspace especializado (SWM) para herramientas de administración y mantenimiento del terapeuta.

## Ubicación

```
tonyblanco-app/
├── app/(dashboard)/dashboard/therapist/(swm)/therapist-config/
│   ├── layout.tsx          # Layout cerrado (sin inyección de paneles)
│   └── page.tsx             # Entry point → TherapistConfigWorkspace
│
└── components/TherapistConfigWorkspace/
    └── index.tsx            # Componente principal del workspace
```

## Ruta de Acceso

- **URL**: `/dashboard/therapist/therapist-config`
- **Sidebar**: Navegación principal → "Configuración"
- **Launcher**: Lista de workspaces SWM

## Patrón SWM

Sigue el mismo patrón que SHA y otros workspaces:

1. **Requiere paciente preseleccionado** - Lee el contexto de `getActivePatientId()`
2. **Escucha cambios de paciente** - Evento `activePatientChanged`
3. **Layout cerrado** - No inyecta paneles externos
4. **Workspace soberano** - Aislado de otros módulos

## Herramientas Incluidas

### 1. Limpieza de Datos de Test
- Muestra resumen de datos del paciente activo
- Vista previa (dry-run) antes de eliminar
- Confirmación obligatoria para eliminación
- Elimina `TestResult` y `Assignment` del paciente

### 2. Más Herramientas (Placeholder)
- Sección expandible para futuras utilidades
- Próximamente: exportación, notificaciones, preferencias

## Backend API

```
GET  /api/therapist/cleanup/     → Lista pacientes con conteo de datos
POST /api/therapist/cleanup/     → Ejecuta limpieza (dry_run=true|false)
```

## Dependencias

- `@/lib/active-patient` - Context del paciente activo
- `@/lib/api` - Token auth y API_BASE_URL
- Backend: `cleanup_views.py` (ya implementado y testeado)

## Notas de Diseño

- UI consistente con el resto del ecosistema SWM
- Secciones colapsables con estado persistente en sesión
- Mensajes de error/éxito claros
- Botones deshabilitados durante operaciones
- Confirmación con `window.confirm()` para operaciones destructivas

#### Cambios recientes (enero 2026)

- Ahora también se eliminan y cuentan los registros de `UserTestAccess` (registra tests "asignados" a un usuario).
- Backend: `GET /api/therapist/cleanup/` devuelve por cada paciente un objeto con `counts` con los campos:
    - `test_results_linked`
    - `test_results_orphan`
    - `assignments`
    - `test_accesses`  (nuevo)
    - `total` (suma de los anteriores)
- Backend: `POST /api/therapist/cleanup/` acepta `patient_id` y `dry_run` y en ejecución elimina también `UserTestAccess`.
- Frontend: `TherapistConfigWorkspace` (component) actualizado para mapear el nuevo formato `counts` y mostrar una columna "Tests Asignados".
- UI: Mensajes y confirmaciones ahora muestran resultados totales + accesos eliminados.

#### Notas de diseño y seguridad

- El endpoint está protegido con `IsAuthenticated` y permite acceso sólo a usuarios con `profile.user_type == 'therapist'` y sólo sobre pacientes cuyo `therapist == request.user`.
- `dry_run=true` es la opción por defecto para evitar borrados accidentales.

#### Cómo usar (ejemplo)

1) Dry-run (solo vista previa):

```powershell
# Reemplaza <TOKEN> por tu token de terapeuta válido
curl -X POST "http://localhost:8000/api/therapist/cleanup/" \
    -H "Authorization: Token <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"patient_id": 4, "dry_run": true}'
```

Respuesta (ejemplo):

```json
{
    "dry_run": true,
    "patient": {"id": 4, "full_name": "Luis Antonio Blanco Fontela"},
    "counts": {
        "test_results_linked": 0,
        "test_results_orphan": 0,
        "assignments": 0,
        "test_accesses": 4,
        "total": 4
    },
    "message": "Dry-run mode: no records deleted. Set dry_run=false to execute."
}
```

2) Ejecutar limpieza (destructivo):

```powershell
curl -X POST "http://localhost:8000/api/therapist/cleanup/" \
    -H "Authorization: Token <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"patient_id": 4, "dry_run": false}'
```

Respuesta (ejemplo):

```json
{
    "dry_run": false,
    "patient": {"id": 4, "full_name": "Luis Antonio Blanco Fontela"},
    "deleted": {
        "test_results_orphan": 0,
        "test_results_linked": 0,
        "assignments": 0,
        "test_accesses": 4
    },
    "message": "Cleanup completed successfully"
}
```

## Commits relevantes

- `c9a72bc8` — Inicial: API de cleanup + componente (integración temporal)
- `245f2d8f` — Estructura UI del SWM `therapist-config`
- `850f49ea` — Corrección: mapeo de datos y eliminación de duplicados en el sidebar
- `75a081d4` — Adición de `UserTestAccess` al cleanup (enero 2026)

## Próximos pasos sugeridos

- Verificar la UI en `http://localhost:3000/dashboard/therapist/therapist-config` con un paciente seleccionado.
- Ejecutar `dry_run` para revisar conteos y luego ejecutar `dry_run=false` para confirmar la limpieza (hacer backup si es necesario).
- Añadir tests frontend para cubrir el mapeo `counts` → componente.
