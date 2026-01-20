# FEDERATION_MVP_AUTHORIZATION_PLAN.md

**Estado:** AUTORIZADO  
**Autoridad:** AGENTE_ARQ (Gobernanza)  
**Versión:** 1.0  
**Fecha:** 2026-01-20  
**Phase:** Phase-1 (Read-Only Federation MVP)  
**Related:** `HOLISTIC_FEDERATION_POLICY.md`, `FEDERATION_HUBS_CONTRACT.md`, `DEBUG_PHASE1_ANALYSISRECORD_INVENTORY.md`

---

## RESUMEN EJECUTIVO

**Autorización:** Plan MVP mínimo viable para **Federación de Lectura** hacia Federation Hubs (MSHE/SCDF/SCID-5) sin inyección cross-workspace.

**Alcance Phase-1:** Read-only federation infrastructure + consent + audit (sin reescritura UI, sin refactor naming legacy).

**Restricciones cumplidas:**
- ✅ HOLISTIC_FEDERATION_POLICY.md (v2.0) — integridad de dominio + lectura federada autorizada
- ✅ FEDERATION_HUBS_CONTRACT.md (v1.0) — contratos técnicos y objetos normalizados
- ✅ Prohibición absoluta de cross-workspace write/injection
- ✅ No rediseño UI (solo wiring/feeds backend)

---

## 1. DECISIONES ARQUITECTÓNICAS

### 1.1 ¿Nuevo endpoint o projection sobre /analysis-records?

**Decisión autorizada:** **Projection read-only sobre `/analysis-records/` + nuevo endpoint de federación wrapper**.

**Razón:**
- `AnalysisRecord` ya existe como ledger canónico (evidencia: Fase-1 inventory sección B).
- Crear `AnalysisRecordNormalized` como **projection virtual** (no modelo DB nuevo) mapeando desde `AnalysisRecord`.
- Exponer endpoints de federación wrapper que:
  - Invocan queryset filtrado sobre `AnalysisRecord`.
  - Mapean a formato `AnalysisRecordNormalized` (schema FEDERATION_HUBS_CONTRACT §2.1).
  - Aplican validación de consentimiento + auditoría en punto de lectura.

**Implementación:**
- **NO** crear tabla `AnalysisRecordNormalized` en DB (deuda para Phase-2 si se requiere snapshot cache).
- **SÍ** crear serializer `AnalysisRecordNormalizedSerializer` que proyecta desde `AnalysisRecord`.
- **SÍ** crear nuevo endpoint federado: `GET /api/federation/hub-feed/`.

**Archivos permitidos tocar:**
- `backend/api/serializers.py` — añadir `AnalysisRecordNormalizedSerializer`.
- `backend/api/urls.py` — añadir ruta `/api/federation/hub-feed/`.
- `backend/api/federation_views.py` (NUEVO archivo) — view `HubFeedView`.
- `backend/api/services/federation_service.py` (NUEVO archivo) — lógica de generación de `HubFeedSnapshot`.

**Prohibido:**
- ❌ Modificar modelo `AnalysisRecord` (ya canónico, no tocar schema).
- ❌ Añadir endpoints de escritura federada (solo lectura).
- ❌ Exponer `raw_input` completo en feed (solo campos curados según schema normalizado).

---

### 1.2 Consentimiento (opt-in revocable) + Auditoría en punto de lectura

**Decisión autorizada:** **Consentimiento Phase-1 = flag booleano en User/Patient + scope temporal; auditoría = log inmutable generado en cada invocación de HubFeedView**.

**Implementación Phase-1 (minimal viable):**

1. **Consentimiento:**
   - Añadir campo `consent_federation` (boolean, default False) a modelo `Patient`.
   - Añadir campo `consent_federation_date` (datetime, nullable) a modelo `Patient`.
   - View `HubFeedView` valida `patient.consent_federation == True` antes de generar feed.
   - **Prohibido** generar feed si no hay consentimiento explícito.

2. **Auditoría:**
   - Crear modelo `FederationAuditLog` (schema FEDERATION_HUBS_CONTRACT §2.4).
   - Cada invocación de `HubFeedView` crea registro inmutable con:
     - `requested_by_user` (FK terapeuta).
     - `subject_user` (FK patient/consultante).
     - `timestamp`.
     - `scope` (JSON: date_range, included_domains).
     - `records_accessed_count`.
     - `federation_hub` (str: "mshe" | "scdf" | "scid5").
   - **Prohibido** borrar o modificar logs (compliance).

**Archivos permitidos tocar:**
- `backend/api/models.py` — añadir campos `consent_federation*` a `Patient` y modelo `FederationAuditLog`.
- `backend/api/migrations/` — nueva migración para `Patient.consent_federation` + `FederationAuditLog`.
- `backend/api/federation_views.py` — lógica de validación consentimiento + generación audit log.
- `backend/api/serializers.py` — serializer para `FederationAuditLog` (read-only para compliance reports).

**Prohibido:**
- ❌ Implementar UI de consentimiento en Phase-1 (deuda para Phase-2; asume flag manual por admin).
- ❌ Lógica de revocación granular por workspace (Phase-1 = opt-in global; Phase-2 = granular).

**Deuda aceptada Phase-1:**
- Consentimiento = flag booleano global (no granular por workspace).
- UI de consentimiento diferida a Phase-2.
- Revocación = actualizar flag manualmente (no workflow automatizado).

---

### 1.3 Naming legacy "clinical" y `execution_mode` en payloads

**Decisión autorizada:** **Deuda aceptada Phase-1 — NO refactor naming legacy**.

**Razón:**
- Refactor de `execution_mode`, `role_context`, naming "clinical" es **deuda técnica** documentada.
- Impacto transversal alto (serializers, views, frontend payloads, jobs).
- Phase-1 se enfoca en **wiring de federación** sin romper contratos existentes.

**Estrategia Phase-1:**
- Mantener `execution_mode` actual (ej: "therapist_clinical", "patient_self") sin cambios.
- Mantener `role_context` actual (ej: "therapist", "patient") sin cambios.
- **Mapeo interno** en `AnalysisRecordNormalizedSerializer`:
  - `role_context` → `actor_role` (interno, no expuesto en API legacy).
  - `execution_mode` → derivado logic sin cambiar campo DB.

**Deuda documentada para Phase-2:**
- Refactor `execution_mode` → enum estricto (`therapist_clinical` → `therapist_workspace_interaction`).
- Refactor naming "clinical" → "holistic" en campos/docs donde aplique.
- Migración de payloads frontend para nuevos contratos.

**Prohibido Phase-1:**
- ❌ Cambiar nombres de campos en `AnalysisRecord` model.
- ❌ Modificar payloads POST de frontend (SCDF/SCID-5/MSHE siguen usando campos actuales).
- ❌ Refactor masivo de naming "clinical" en codebase.

**Archivos permitidos tocar:**
- `docs/technical/FEDERATION_NAMING_DEBT.md` (NUEVO) — documentar deuda para Phase-2.

---

### 1.4 Bypass de validaciones (service/job) y seguridad del feed

**Decisión autorizada:** **Centralizar validaciones en `FederationService` + prohibir bypass de serializer**.

**Problema identificado (Fase-1 inventory §E):**
- Múltiples write-points llaman `AnalysisRecord.objects.create(...)` directamente (jobs, services, views).
- Service/job code puede bypass serializer-level ownership checks.
- Riesgo: cross-workspace write si FK `patient`/`therapist` no validado.

**Solución Phase-1 (mitigación):**

1. **Crear `FederationService` centralizado:**
   - Única entrada para generación de `HubFeedSnapshot`.
   - Valida:
     - Terapeuta tiene asignación activa con patient.
     - Patient tiene `consent_federation == True`.
     - Scope temporal válido (start < end).
     - Dominios incluidos existen y son autorizados.
   - Filtra queryset `AnalysisRecord` por:
     - `patient_id == subject_user_id` (NO cross-workspace).
     - `created_at` dentro de `date_range`.
     - `visibility` permite acceso según actor (therapist/patient/both).

2. **Prohibir acceso directo a `AnalysisRecord` desde federation hubs:**
   - Federation hubs (MSHE/SCDF/SCID-5) **solo** llaman `FederationService.generate_hub_feed()`.
   - **Prohibido** consultar `AnalysisRecord.objects` directamente desde hub views.

3. **Reforzar serializer validation (NO bypass):**
   - Revisar `AnalysisRecordSerializer.validate()` — asegurar deriva `execution_mode` y valida actor.
   - Documentar que service/job code **debe** usar serializer (no bypass con `objects.create()` raw).
   - **Deuda** para Phase-2: refactor job/service calls para forzar serializer validation.

**Archivos permitidos tocar:**
- `backend/api/services/federation_service.py` (NUEVO) — clase `FederationService` con validación centralizada.
- `backend/api/serializers.py` — revisar y reforzar `AnalysisRecordSerializer.validate()`.
- `backend/api/federation_views.py` — `HubFeedView` llama `FederationService`.

**Prohibido Phase-1:**
- ❌ Refactor masivo de jobs/services para forzar serializer (deuda Phase-2).
- ❌ Cambiar write-points existentes (riesgo de regresión; solo documentar deuda).

**Deuda documentada Phase-2:**
- Auditoría completa de write-points y forzar uso de `AnalysisRecordSerializer`.
- Migración de `objects.create()` directo → service helper con serializer validation.

---

## 2. ALCANCE EXACTO (Archivos permitidos/prohibidos)

### 2.1 Backend — Archivos PERMITIDOS crear/modificar

| **Archivo** | **Acción** | **Razón** |
|------------|----------|----------|
| `backend/api/models.py` | **MODIFICAR** | Añadir `Patient.consent_federation*` + modelo `FederationAuditLog`. |
| `backend/api/migrations/00XX_federation_phase1.py` | **CREAR** | Migración para nuevos campos y modelo. |
| `backend/api/serializers.py` | **MODIFICAR** | Añadir `AnalysisRecordNormalizedSerializer` + `FederationAuditLogSerializer`. Revisar `AnalysisRecordSerializer.validate()`. |
| `backend/api/urls.py` | **MODIFICAR** | Añadir ruta `/api/federation/hub-feed/`. |
| `backend/api/federation_views.py` | **CREAR** | View `HubFeedView` (GET read-only) con validación consent + audit. |
| `backend/api/services/federation_service.py` | **CREAR** | Lógica `FederationService.generate_hub_feed()` con validación centralizada. |
| `backend/api/permissions.py` | **MODIFICAR** (opcional) | Añadir `IsFederationAuthorized` permission class si aplica. |
| `docs/technical/FEDERATION_NAMING_DEBT.md` | **CREAR** | Documentar deuda naming legacy para Phase-2. |
| `docs/releases/phase-1/FEDERATION_PHASE1_IMPLEMENTATION_REPORT.md` | **CREAR** | Reporte de implementación (post-ejecución). |

### 2.2 Backend — Archivos PROHIBIDOS modificar

| **Archivo** | **Restricción** | **Razón** |
|------------|---------------|----------|
| `backend/api/models.py` → `AnalysisRecord` class | ❌ **NO tocar schema** | Modelo canónico estable; cambios rompen contratos existentes. |
| `backend/api/analysis_views.py` | ❌ **NO modificar endpoints existentes** | Hubs legacy (MSHE/SCDF/SCID-5) siguen usando rutas actuales; no romper. |
| `backend/jobs/*` | ❌ **NO refactor jobs** | Riesgo regresión; deuda Phase-2. |
| `backend/api/services/analysis_service.py` | ❌ **NO modificar helpers existentes** | Usado por múltiples callers; refactor diferido Phase-2. |

### 2.3 Frontend — Archivos PROHIBIDOS modificar Phase-1

| **Archivo** | **Restricción** | **Razón** |
|------------|---------------|----------|
| `tonyblanco-app/**/*.tsx` | ❌ **NO modificar UI** | Restricción user: "No rediseñar UI; solo wiring/feeds backend". |
| Frontend payloads (SCDF/SCID-5/MSHE) | ❌ **NO cambiar contratos POST** | Mantener compatibilidad; naming legacy aceptado Phase-1. |

**Excepción permitida (solo si user autoriza explícito):**
- Añadir nueva ruta `/dashboard/therapist/federation-consent` para UI de consentimiento (diferido Phase-2 salvo petición explícita).

### 2.4 Documentación — Archivos PERMITIDOS crear

| **Archivo** | **Propósito** |
|------------|-------------|
| `docs/technical/FEDERATION_MVP_AUTHORIZATION_PLAN.md` | Este documento (plan autorizado). |
| `docs/technical/FEDERATION_NAMING_DEBT.md` | Deuda naming legacy + roadmap Phase-2. |
| `docs/releases/phase-1/FEDERATION_PHASE1_IMPLEMENTATION_REPORT.md` | Reporte post-implementación (checklist DoD cumplido). |

---

## 3. CHECKLIST DEFINITION OF DONE (DoD)

### 3.1 Backend Implementation

- [ ] **Modelo `Patient`:** Campos `consent_federation` (bool, default False) + `consent_federation_date` (datetime, nullable) añadidos.
- [ ] **Modelo `FederationAuditLog`:** Creado con campos: `id` (UUID), `timestamp`, `requested_by_user` (FK), `subject_user` (FK), `scope` (JSON), `records_accessed_count`, `federation_hub`, `output_id` (nullable).
- [ ] **Migración:** Aplicada sin errores en entorno dev/test.
- [ ] **Serializer `AnalysisRecordNormalizedSerializer`:** Implementado mapeando desde `AnalysisRecord` a schema FEDERATION_HUBS_CONTRACT §2.1 (campos: `subject_user_id`, `workspace_code`, `created_at`, `tags`, `summary_public`, `summary_pro`, `evidence_refs`, `workspace_status`, `confidence_level`).
- [ ] **Serializer `FederationAuditLogSerializer`:** Implementado (read-only para compliance).
- [ ] **Service `FederationService`:** Método `generate_hub_feed(scope: FederationReadScope) -> HubFeedSnapshot` implementado con validaciones:
  - Terapeuta tiene asignación activa con patient.
  - Patient tiene `consent_federation == True`.
  - Scope temporal válido.
  - Queryset filtrado por `patient_id` + `created_at` + `visibility`.
  - Genera `FederationAuditLog` inmutable.
- [ ] **View `HubFeedView`:** Endpoint `GET /api/federation/hub-feed/` implementado con:
  - Query params: `subject_user_id`, `date_range_start`, `date_range_end`, `included_domains` (comma-separated), `federation_hub`.
  - Auth: `IsAuthenticated` + terapeuta verificado.
  - Response: JSON `HubFeedSnapshot` (schema FEDERATION_HUBS_CONTRACT §2.3).
- [ ] **URL routing:** Ruta `/api/federation/hub-feed/` añadida a `backend/api/urls.py`.
- [ ] **Permission class (opcional):** `IsFederationAuthorized` implementado si se requiere lógica granular.

### 3.2 Validaciones y Seguridad

- [ ] **Consentimiento:** View valida `patient.consent_federation == True` antes de generar feed; retorna 403 si False.
- [ ] **Auditoría:** Cada invocación crea registro `FederationAuditLog` inmutable (no delete, no update).
- [ ] **Ownership:** Queryset filtrado por `patient_id == subject_user_id` (no cross-workspace).
- [ ] **Visibility:** Feed respeta campo `visibility` de `AnalysisRecord` (therapist/patient/both).
- [ ] **No bypass:** `FederationService` es única entrada; hubs no consultan `AnalysisRecord.objects` directamente.

### 3.3 Testing

- [ ] **Unit tests:** `test_federation_service.py` — validaciones de scope, consentimiento, ownership.
- [ ] **Integration test:** `test_hub_feed_view.py` — endpoint retorna feed válido con audit log.
- [ ] **Edge case:** Feed vacío si no hay records en scope (no error 404, retorna `{"records": [], "count": 0}`).
- [ ] **Forbidden:** 403 si terapeuta sin asignación o patient sin consentimiento.
- [ ] **Audit immutability:** Test verifica logs no pueden delete/update.

### 3.4 Documentación

- [ ] **Deuda naming:** `docs/technical/FEDERATION_NAMING_DEBT.md` creado con roadmap Phase-2.
- [ ] **Implementation report:** `docs/releases/phase-1/FEDERATION_PHASE1_IMPLEMENTATION_REPORT.md` generado post-implementación con:       
  - Archivos tocados (paths + líneas modificadas).
  - Tests ejecutados (pass/fail).
  - Queries ejemplo (curl/Postman).
  - Rollback steps.
- [ ] **API docs:** Endpoint `/api/federation/hub-feed/` documentado en `backend/API_DOCUMENTATION.md`.

### 3.5 No-Regression

- [ ] **Endpoints legacy:** `/api/analysis-records/` (list/create/detail) funcionan sin cambios.
- [ ] **Frontend payloads:** SCDF/SCID-5/MSHE POST payloads aceptados sin modificar contratos.
- [ ] **Jobs/services:** Write-points existentes funcionan sin errores (no refactor en Phase-1).

---

## 4. PLAN DE ROLLBACK

### 4.1 Rollback Migration (si falla migración)

**Trigger:** Error al aplicar migración `00XX_federation_phase1.py`.

**Pasos:**
1. `python manage.py migrate api <previous_migration_number>` (rollback a migración anterior).
2. Borrar archivo `backend/api/migrations/00XX_federation_phase1.py`.
3. Revertir cambios en `backend/api/models.py` (git revert commit).
4. Re-run `python manage.py makemigrations` y revisar conflictos.

### 4.2 Rollback Endpoint (si endpoint causa errores)

**Trigger:** Endpoint `/api/federation/hub-feed/` retorna 500 o rompe otros endpoints.

**Pasos:**
1. Comentar ruta en `backend/api/urls.py`:
   ```python
   # path('federation/hub-feed/', HubFeedView.as_view(), name='hub-feed'),
   ```
2. Reiniciar backend: `pm2 restart backend` o `systemctl restart gunicorn` (según deploy).
3. Verificar endpoints legacy funcionan: `curl /api/analysis-records/`.
4. Investigar logs de error: `tail -f backend/logs/django.log`.
5. Fix bug en `federation_views.py` o `federation_service.py`.
6. Re-deploy con fix.

### 4.3 Rollback DB Schema (si campos Patient rompen queries)

**Trigger:** Queries sobre `Patient` fallan por campos `consent_federation*`.

**Pasos:**
1. Rollback migration (§4.1).
2. Si datos ya persistidos, backup DB antes de rollback:
   ```bash
   python manage.py dumpdata api.Patient > backup_patient_pre_rollback.json
   ```
3. Aplicar rollback migration.
4. Verificar queries `Patient.objects.all()` funcionan.

### 4.4 Rollback Completo (Nuclear Option)

**Trigger:** Phase-1 deployment causa errores críticos irrecuperables.

**Pasos:**
1. Revertir todos commits de Phase-1:
   ```bash
   git revert <commit_hash_phase1_start>..<commit_hash_phase1_end>
   ```
2. Rollback migrations a estado pre-Phase-1.
3. Re-deploy branch `main` o `production` (estado anterior).
4. Notificar equipo y documentar causa raíz en `docs/technical/FEDERATION_PHASE1_ROLLBACK_REPORT.md`.

---

## 5. RIESGOS Y MITIGACIONES

| **Riesgo** | **Probabilidad** | **Impacto** | **Mitigación** |
|-----------|----------------|-----------|---------------|
| Migración falla por conflictos DB | Media | Alto | Test en entorno dev/staging antes de producción. Backup DB pre-migración. |
| Endpoint `/hub-feed/` causa 500 | Media | Medio | Unit/integration tests completos. Monitoring de errores post-deploy. |
| Bypass de validaciones en `FederationService` | Baja | Alto | Code review obligatorio. Tests edge cases (terapeuta sin asignación, patient sin consentimiento). |
| Queryset cross-workspace por bug filtrado | Baja | **CRÍTICO** | Test específico: verificar feed solo retorna records del `subject_user_id` solicitado (no leak). |
| Audit log no inmutable (delete permitido) | Baja | Alto | Test verifica `delete()` en `FederationAuditLog` lanza excepción o es no-op. Configurar DB constraint `ON DELETE RESTRICT` si aplica. |
| Frontend rompe por cambios no autorizados | Muy Baja | Medio | **Prohibido** tocar frontend en Phase-1 salvo autorización explícita user. |
| Deuda naming legacy causa confusión | Media | Bajo | Documentar deuda en `FEDERATION_NAMING_DEBT.md`. Comunicar a equipo. |

---

## 6. PRÓXIMOS PASOS POST-PHASE-1

**Phase-2 (Federación Granular + UI Consentimiento):**
- UI de consentimiento revocable por workspace.
- Refactor naming legacy (`execution_mode`, "clinical" → "holistic").
- Auditoría completa de write-points + forzar serializer validation.
- Cache de `HubFeedSnapshot` (modelo DB opcional para performance).

**Phase-3 (Federation Hubs Activos):**
- Implementar lógica de síntesis MSHE/SCDF/SCID-5 consumiendo `/hub-feed/`.
- IA Mayéutica para generación de outputs (preguntas socráticas, hipótesis simbólicas).
- UI dual (public/pro) en frontend.

---

## 7. APROBACIÓN Y FIRMA

**Autorizado por:** AGENTE_ARQ (Gobernanza)  
**Fecha:** 2026-01-20  
**Versión:** 1.0  
**Estado:** AUTORIZADO para ejecución por agente CODE

**Siguiente paso:**
- User debe invocar agente CODE con prefijo `CODE >` referenciando este plan para implementación.
- User puede solicitar clarificaciones a AGENTE_ARQ antes de proceder.

**Restricciones para agente CODE:**
- ✅ Implementar **exactamente** lo especificado en §2 (archivos permitidos/prohibidos).
- ✅ Cumplir **todos** los ítems de DoD (§3) antes de marcar completo.
- ✅ Generar diff unificado + pasos de prueba + comandos de verificación (según instrucciones Copilot).
- ❌ **Prohibido** improvisar cambios fuera de scope autorizado.
- ❌ **Prohibido** tocar frontend sin autorización explícita user.

---

**FIN DEL PLAN**
