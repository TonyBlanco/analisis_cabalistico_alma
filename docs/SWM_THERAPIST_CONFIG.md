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
