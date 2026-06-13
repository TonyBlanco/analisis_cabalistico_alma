# Novedades

## 2026-06-13 — Sprint intensivo: Resonancias, Reportes, SHA-Harmony, Tests holísticos

### Mapa de Resonancias Ancestrales — F1 + F2

- **Backbone API (F1):** se extendieron los modelos de genealogía con 4 campos Armoni (`birth_order_number`, `is_deceased`, `is_abortion`, `side`). Se añadieron 8 campos de resonancia tipada a `ResonanciaRelation` (tipo, relevancia, dirección, personas A/B, fuente, rectificación). Nuevo modelo `ResonanceClientCapture` para habilitar captura por el consultante. Nuevos endpoints: detalle de relación (`PATCH /api/resonancia/relations/<id>/`) y captura cliente (`GET/PATCH /api/resonancia/client-capture/?subject=`).
- **Vista Árbol cableada (F2):** el workspace **Transgeneracional Profundo** (`/dashboard/therapist/transgeneracional-profundo`) ahora carga datos reales del backend. Dos paneles nuevos: **Personas del árbol** (CRUD con los 4 campos Armoni) y **Eventos observados** (CRUD con vinculación de personas y orden cronológico). Cambia automáticamente al seleccionar un consultante distinto. `GuidedBlock` aparece cuando no hay consultante activo.
- Todos los cambios son **observacionales y no diagnósticos**. El terapeuta es el único autor que confirma resonancias.

### Panel de Reportes del Terapeuta

- Nuevo workspace de reportes en `/dashboard/therapist/reports`.
- Muestra cartera de consultantes con etapa, alertas de tests completados sin revisar y métricas por consultante.
- Export CSV de la actividad del período.
- Datos vía `GET /api/therapist/reports/summary/`.
- Acceso desde el menú lateral del terapeuta.

### SHA-Harmony activado en catálogo

- El test **Auditoría de Armonía Sefirótica (SHA)** ahora aparece como asignable en el catálogo del terapeuta.
- Se incorporó la guía del terapeuta: "Screening orientativo, no diagnóstico. Útil para abrir conversación sobre hábitos, consumo y regulación del deseo."
- Migración `0108_activate_sha_harmony` idempotente y reversible.

### Tests holísticos activos: ASRS-Essence y AQ-Kabbalah

- `asrs_essence` y `aq_kabbalah` activados end-to-end: banco de ítems, scorer, frontend (página + resultado), integración en catálogo y tests de backend.
- Se suman a los anteriores `dudit_spirit`, `ybocs_soul`, `sha_harmony` y `eat26_spirit` como tests holísticos completamente operativos.

### Cuestionario Vidas Pasadas expandido

- El cuestionario de Vidas Pasadas ahora tiene 11 secciones simbólicas completas.
- Las secciones nuevas incluyen: patrones de vida, talentos ancestrales, misión kármica, sanación y contratos del alma.

### Timeline del proceso terapéutico (portal del consultante)

- El dashboard del consultante (`/dashboard/patient/process`) muestra ahora una línea de tiempo de su proceso terapéutico con hitos, etapa actual y sesiones registradas.

### Flujo de consentimiento desbloquea el hub del terapeuta

- Cuando el consultante otorga consentimiento federado, el feed del hub del terapeuta se actualiza inmediatamente sin requerir recarga manual.

### Autenticación avanzada

- Magic link, OTP por email y passkeys WebAuthn operativos en producción (`studios33.app`).
- El flujo de recuperación de contraseña queda completamente cableado.

---

## 2026-06-11

- Se agregó el Centro de Aprendizaje con acceso desde el menú del terapeuta.
- Se incorporó una ayuda rápida visible en el frontend.
- Las guías de uso ahora se sirven desde documentación canónica en `docs/`.
