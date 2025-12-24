# ⚠️ DIRECTIVA OBLIGATORIA PARA AGENTES Y DESARROLLO

## VERIFICACIÓN PREVIA (NO NEGOCIABLE)

Antes de ejecutar CUALQUIER cambio en este proyecto, el agente o desarrollador DEBE:

1. Leer COMPLETAMENTE este documento.
2. Verificar que la tarea solicitada:
   - NO crea endpoints nuevos
   - NO crea páginas nuevas
   - NO modifica rutas existentes
   - NO altera la arquitectura sellada
3. Confirmar que la acción está EXPLÍCITAMENTE permitida en esta auditoría.

Si una acción NO está claramente permitida aquí:
➡️ NO SE EJECUTA.

---

## JERARQUÍA DE DOCUMENTOS (FIJA)

1. **Este documento (AUDITORIA CABALA APP 12182025.md)** → FUENTE DE VERDAD VIGENTE
2. SOURCE_OF_TRUTH.md → resumen normativo
3. CHANGELOG_*.md → histórico informativo
4. PROJECT_STATE_CURRENT.md / TESTS_SYSTEM.md → LEGACY (NO USAR)

---

## PRINCIPIO CLAVE

> Este proyecto está en estado ESTABLE y SELLADO.  
> El objetivo del agente NO es ampliar el sistema,  
> es NO ROMPER lo que ya funciona.

# AUDITORIA CABALA APP 12182025

Fecha: 2025-12-18
Repositorio: d:\analisis_cabalistico_alma
Alcance: frontend (tonyblanco-app), backend (Django + DRF), docs y rutas legacy en backup.

## Resumen ejecutivo
- Frontend activo: Next.js App Router en `tonyblanco-app/app` con dashboards por rol y paginas publicas minimas.
- Backend: Django/DRF con hardening de tests y control de roles/ownership; endpoints clinicos y de analisis cabalistico activos.
- Legacy: rutas antiguas preservadas en `_legacy_app_backup` y `_legacy_components_backup` (no activas en App Router actual).
- Tests/analisis: dos flujos inmutables (`patient_self`, `therapist_clinical`), con hardening aplicado en backend.
- Ultimas 12 horas: no hay cambios MD ni commits recientes detectados.


## Decisión UX Estratégica – Dashboard Terapéutico

Se ha adoptado un modelo de workspace clínico persistente
inspirado en Orion Health, con las siguientes implicaciones:

- Eliminación de navegación destructiva en contexto terapéutico
- Separación entre:
  - Workspace (persistente)
  - Utilidades (paneles)
- El sidebar deja de ser un menú clásico
- El terapeuta nunca pierde el contexto visual del paciente

Esta decisión es intencional y responde a:
- reducción de carga cognitiva
- aumento de calidad observacional
- alineación ética (no diagnóstico automático)

Cualquier cambio que rompa esta lógica se considera regresión UX.

## Cambios recientes (T6 catálogo/assignments)
- Catálogo clínico (terapeuta) ahora carga desde registro declarativo, agrupado por familias (psicológicos/cabalísticos), badges de disponibilidad y guía clínica por icono (sin tabs ni filtros que oculten tests).
- Asignación: al asignar un test se persiste una marca local por paciente y se dispara `assignedTestsChanged` para reflejarlo de inmediato en el workspace sin bloquear por backend.
- Línea de tests asignados en el workspace fusiona resultados remotos (`patient-previous`) con asignaciones locales pendientes evitando duplicados; muestra “Pendiente” hasta que el backend devuelve resultado real.

## Decisión UX Estratégica – Dashboard Terapéutico

Se ha adoptado un modelo de workspace clínico persistente
inspirado en Orion Health, con las siguientes implicaciones:

- Eliminación de navegación destructiva en contexto terapéutico
- Separación entre:
  - Workspace (persistente)
  - Utilidades (paneles)
- El sidebar deja de ser un menú clásico
- El terapeuta nunca pierde el contexto visual del paciente

Esta decisión es intencional y responde a:
- reducción de carga cognitiva
- aumento de calidad observacional
- alineación ética (no diagnóstico automático)

Cualquier cambio que rompa esta lógica se considera regresión UX.

## Cambios recientes (2025-12-19)
- Guards de hydration en `TherapistTestsPage` y `TestCatalogSection` para contenido dependiente de paciente activo.
- Nuevo documento: `docs/SCDF v2 — Diseño Clínico.md`.


## Fuentes revisadas (clave)
- `backend/api/urls.py`
- `backend/api/bioemotional/urls.py`
- `backend/BACKEND_HARDENING_COMPLETE_SUMMARY.md`
- `docs/CHANGELOG_2025-12-17_1033.md`
- `docs/README_CHANGELOG.md`
- `tonyblanco-app/docs/PROJECT_STATE_CURRENT.md`
- `tonyblanco-app/docs/CAMBIO NUEVA ESTRUTURA DEC14.md`
- `FRONTEND-RESET-2025-12-14.md`
- `TEST-EXECUTION-FLOWS-ARCHITECTURE.md`
- `TEST-FLOWS-IMPLEMENTATION-SUMMARY.md`
- `IMPLEMENTACION_RUTAS_TESTS_COMPLETA.md`
- `tests_rutas_map.md`
- `faltan_test.md`
- `docs/TESTS_SYSTEM.md`
- `tonyblanco-app/docs/WELLNESS_TEST.md`

## Mapa de aplicaciones (folders)
- `tonyblanco-app/`: app frontend (Next.js App Router).
- `backend/`: backend Django + DRF (API, modelos, tests, hardening).
- `app_cabalistica.py`: servicio Flask para tests psicologicos (ver `tonyblanco-app/docs/TROUBLESHOOTING_TESTS.md`).
- `src/`: codigo legacy/archivado no activo en App Router actual.
- `docs/`: documentacion operativa y changelogs.

## Paginas actuales (App Router activo)
Publico:
- `/` -> `tonyblanco-app/app/(public)/page.tsx`
- `/login` -> `tonyblanco-app/app/(public)/login/page.tsx`
- `/register/personal` -> `tonyblanco-app/app/(public)/register/personal/page.tsx`
- `/register/therapist` -> `tonyblanco-app/app/(public)/register/therapist/page.tsx`

Dashboard base:
- `/dashboard` -> `tonyblanco-app/app/(dashboard)/dashboard/page.tsx`
- `/dashboard/admin` -> `tonyblanco-app/app/(dashboard)/dashboard/admin/page.tsx`
- `/dashboard/account` -> `tonyblanco-app/app/(dashboard)/dashboard/account/page.tsx`
- `/dashboard/profile` -> `tonyblanco-app/app/(dashboard)/dashboard/profile/page.tsx`
- `/dashboard/resources` -> `tonyblanco-app/app/(dashboard)/dashboard/resources/page.tsx`

Therapist:
- `/dashboard/therapist` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- `/dashboard/therapist/tests` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/tests/page.tsx`
- `/dashboard/therapist/patients` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/patients/page.tsx`
- `/dashboard/therapist/bioemotional` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/bioemotional/page.tsx`
- `/dashboard/therapist/cabala` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/cabala/page.tsx`
- `/dashboard/therapist/cabala/results/[id]` -> `tonyblanco-app/app/(dashboard)/dashboard/therapist/cabala/results/[id]/page.tsx`

Patient:
- `/dashboard/patient` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/page.tsx`
- `/dashboard/patient/tests` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/page.tsx`
- `/dashboard/patient/results` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/results/page.tsx`
- `/dashboard/patient/results/[id]` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/results/[id]/page.tsx`
- `/dashboard/patient/profile` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/profile/page.tsx`
- `/dashboard/patient/process` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/process/page.tsx`
- `/dashboard/patient/resources` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/resources/page.tsx`
- `/dashboard/patient/account` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/account/page.tsx`
- `/dashboard/patient/cabala/results/[id]` -> `tonyblanco-app/app/(dashboard)/dashboard/patient/cabala/results/[id]/page.tsx`

Personal:
- `/dashboard/personal` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/page.tsx`
- `/dashboard/personal/basic-analysis` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/basic-analysis/page.tsx`
- `/dashboard/personal/tests` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/tests/page.tsx`
- `/dashboard/personal/resources` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/resources/page.tsx`
- `/dashboard/personal/premium` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/premium/page.tsx`
- `/dashboard/personal/explorations` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/explorations/page.tsx`
- `/dashboard/personal/courses` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/courses/page.tsx`
- `/dashboard/personal/audios` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/audios/page.tsx`
- `/dashboard/personal/videos` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/videos/page.tsx`
- `/dashboard/personal/[...slug]` -> `tonyblanco-app/app/(dashboard)/dashboard/personal/[...slug]/page.tsx`

## Paginas legacy (backup, no activas)
Todas se encuentran en `tonyblanco-app/_legacy_app_backup/`.
Incluye dashboards antiguos, tools, tests, landing, marketplace, services, payments, wellness, etc.
Referencia completa en el auditoria previa y en `tonyblanco-app/docs/CAMBIO NUEVA ESTRUTURA DEC14.md`.

## Tests y analisis (estado)
- Flujos inmutables:
  - `patient_self`: tests asignados por terapeuta, ejecutados por paciente.
  - `therapist_clinical`: evaluaciones clinicas ejecutadas solo por terapeuta.
- Hardening backend aplicado a ejecucion, listados y resultados (ver `backend/BACKEND_HARDENING_COMPLETE_SUMMARY.md`).
- Tests cabalisticos/numerologicos y psicologicos listados en `TEST-EXECUTION-FLOWS-ARCHITECTURE.md` y `docs/TESTS_SYSTEM.md`.
- Modulos cabalisticos activos: Gematria, Tarot terapeutico, Numerologia completa, Astrologia cabalistica.
- Reportes implementados: Numerologia completa y Astrologia cabalistica (otros pendientes).

## 1) Inventario de endpoints y mapeo a UI

### Auth y sesion
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/login/` | POST | `EmailOrUsernameAuthToken` | `tonyblanco-app/lib/api.ts` (login), `tonyblanco-app/app/(public)/login/page.tsx` |
| `/api/login/google/` | POST | `GoogleOAuthView` | no consumo detectado en App Router actual |
| `/api/register/therapist/` | POST | `RegisterTherapistView` | `tonyblanco-app/lib/api.ts` (registerTherapist), `/register/therapist` |
| `/api/register/personal/` | POST | `RegisterPersonalView` | `tonyblanco-app/lib/api.ts` (registerPersonal), `/register/personal` |
| `/api/me/` | GET | `CurrentUserView` | `tonyblanco-app/lib/session.ts` (fetchSession), `tonyblanco-app/app/(dashboard)/dashboard/page.tsx` |

### Perfil y datos personales
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/me/profile/` | PATCH | `UpdateProfileView` | `tonyblanco-app/lib/profile-api.ts` (updateProfile) |
| `/api/profile/me/` | GET/PATCH | `UserProfileMeView` | `tonyblanco-app/lib/api.ts` (getUserProfile/updateUserProfile), `tonyblanco-app/app/(dashboard)/dashboard/account/page.tsx`, `tonyblanco-app/app/(dashboard)/dashboard/patient/account/page.tsx` |
| `/api/profile/me/consent/` | POST | `UserProfileConsentView` | `tonyblanco-app/lib/api.ts` (acceptConsent) |
| `/api/profile/me/acknowledge-update/` | POST | `ProfileUpdateAcknowledgeView` | `tonyblanco-app/components/ProfileUpdateNotice.tsx` |
| `/api/account/profile/` | GET | alias a `UserProfileMeView` | no consumo directo detectado |
| `/api/me/birth-data/` | GET/PATCH | `BirthDataView` | uso probable via libs de perfil (no consumo directo localizado) |
| `/api/me/birth-data/send-unlock-email/` | POST | `BirthDataUnlockRequestView` | no consumo detectado |
| `/api/me/birth-data/unlock/` | POST | `BirthDataUnlockConfirmView` | no consumo detectado |
| `/api/geocode/city/` | POST | `GeocodeCityView` | uso probable via `tonyblanco-app/lib/useGeoResolver.ts` |
| `/api/check-membership/` | GET | `CheckMembershipView` | no consumo detectado |

### Pacientes (terapeuta)
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/therapist/patients/create/` | POST | `CreatePatientWithAccountView` | uso probable via modales (no consumo directo localizado) |
| `/api/therapist/patients/` | GET/POST | `PatientListCreateView` | `tonyblanco-app/lib/patient-api.ts` (getTherapistPatients) |
| `/api/therapist/patients/<id>/` | GET/PATCH/DELETE | `PatientDetailView` | `tonyblanco-app/lib/assignment-api.ts` (getPatientDetail) |
| `/api/therapist/patients/<id>/profile/` | GET | `TherapistPatientProfileView` | `tonyblanco-app/lib/patient-api.ts` (getPatientProfileSummary) |
| `/api/therapist/patients/<id>/profile/update/` | PATCH | `TherapistUpdatePatientProfileView` | `tonyblanco-app/lib/api.ts` (updatePatientProfile) |
| `/api/therapist/patients/<id>/profile/validation/` | GET | `PatientProfileValidationView` | `tonyblanco-app/lib/api.ts` (getPatientProfileValidation) |
| `/api/therapist/patients/<id>/status/` | PATCH | `PatientStatusUpdateView` | `tonyblanco-app/lib/patient-api.ts` (updatePatientStatus) |
| `/api/therapist/patients/<id>/archive/` | DELETE | `PatientArchiveView` | `tonyblanco-app/lib/patient-api.ts` (archivePatient) |
| `/api/therapist/dashboard/` | GET | `TherapistDashboardView` | no consumo detectado |
| `/api/therapist/sessions/` | GET/POST | `SessionListCreateView` | no consumo detectado |
| `/api/therapist/sessions/<id>/` | GET/PATCH/DELETE | `SessionDetailView` | no consumo detectado |
| `/api/therapist/notes/` | GET/POST | `TherapistNoteListCreateView` | no consumo detectado |

### Tests modulares
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/tests/` | GET | `AvailableTestsView` | `tonyblanco-app/lib/test-api.ts` (getAvailableTests), `tonyblanco-app/components/PatientAssignedTestsSection.tsx` |
| `/api/tests/<code>/` | GET | `TestModuleDetailView` | `tonyblanco-app/lib/test-api.ts` (getTestDetail) |
| `/api/tests/execute/` | POST | `ExecuteTestView` | `tonyblanco-app/lib/test-api.ts` (executeTest) |
| `/api/tests/submit/` | POST | `ProcessTestSubmissionView` | no consumo detectado (posible legacy/Flask) |
| `/api/tests/results/` | GET | `TestResultsView` | `tonyblanco-app/lib/test-api.ts` (getTestResults) |
| `/api/tests/results/<id>/` | GET/PATCH/DELETE | `TestResultDetailView` | `tonyblanco-app/lib/test-api.ts` (getTestResult/updateTestResult/deleteTestResult) |
| `/api/tests/stats/` | GET | `UserTestStatsView` | `tonyblanco-app/lib/test-api.ts` (getUserTestStats) |
| `/api/tests/grant-access/` | POST | `GrantTestAccessView` | no consumo detectado |
| `/api/tests/assign-to-patient/` | POST | `AssignTestToPatientView` | `tonyblanco-app/lib/assignment-api.ts` (assignTestToPatient) |
| `/api/tests/patient-previous/` | GET | `PatientPreviousTestsView` | `tonyblanco-app/components/AssignedTestsSection.tsx` |

### Cabala y analisis
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/calcular/` | POST | `CalculoCabalisticoView` | `tonyblanco-app/lib/api.ts` (calcularAnalisisCabalistico) |
| `/api/fichas/` | GET/POST | `FichaListCreateView` | `tonyblanco-app/lib/api.ts` (calcularAnalisisCabalistico) |
| `/api/fichas/<id>/` | GET | `FichaRetrieveView` | no consumo detectado |
| `/api/gematria/interpret/` | POST | `GematriaInterpretationView` | no consumo detectado |
| `/api/therapist/patients/<id>/tarot-analysis/` | POST | `TarotAnalysisView` | no consumo detectado |
| `/api/therapist/patients/<id>/tarot-analysis/generate-and-save/` | POST | `GenerateAndSaveTarotAnalysisView` | no consumo detectado |
| `/api/therapist/patients/<id>/cabalistic-analysis/` | POST | `SaveCabalisticAnalysisView` | no consumo detectado |
| `/api/therapist/patients/<id>/cabalistic-analyses/` | GET | `ListCabalisticAnalysesView` | no consumo detectado |
| `/api/therapist/patients/<id>/astrology-kerykeion/` | POST | `KerykeionAnalysisView` | no consumo detectado |
| `/api/therapist/patients/<id>/crossover/generate-and-save/` | POST | `CrossoverSynthesisView` | no consumo detectado |
| `/api/analysis-records/` | GET/POST | `AnalysisRecordListCreateView` | no consumo detectado |
| `/api/analysis-records/<uuid>/` | GET/PATCH/DELETE | `AnalysisRecordDetailView` | no consumo detectado |

### Bioemotional
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/bioemotional/dictionary/` | GET | `BioEmotionalDictionarySearchView` | `tonyblanco-app/app/(dashboard)/dashboard/therapist/bioemotional/page.tsx` |
| `/api/bioemotional/hypotheses/` | GET/POST | `BioTransgenerationalHypothesisListCreateView` | `tonyblanco-app/app/(dashboard)/dashboard/therapist/bioemotional/page.tsx` |
| `/api/bioemotional/hypotheses/<uuid>/` | GET/PATCH/DELETE | `BioTransgenerationalHypothesisDetailView` | `tonyblanco-app/app/(dashboard)/dashboard/therapist/bioemotional/page.tsx` |
| `/api/bioemotional/genealogy/<patient_id>/` | GET | `GenealogyOverviewView` | no consumo detectado |
| `/api/bioemotional/genealogy/<patient_id>/person` | POST | `GenealogyPersonCreateView` | no consumo detectado |
| `/api/bioemotional/genealogy/<patient_id>/event` | POST | `GenealogyEventCreateView` | no consumo detectado |
| `/api/bioemotional/genealogy/persons/<uuid>/` | GET/PATCH/DELETE | `GenealogyPersonDetailView` | no consumo detectado |
| `/api/bioemotional/genealogy/events/<uuid>/` | GET/PATCH/DELETE | `GenealogyEventDetailView` | no consumo detectado |

### Servicios, reservas, pagos
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/services/categories/` | GET | `ServiceCategoryListView` | `tonyblanco-app/lib/api.ts` (getServiceCategories) |
| `/api/services/` | GET | `ServiceListView` | `tonyblanco-app/lib/api.ts` (getServices) |
| `/api/services/<slug>/` | GET | `ServiceDetailView` | `tonyblanco-app/lib/api.ts` (getService) |
| `/api/packages/` | GET | `ServicePackageListView` | no consumo detectado |
| `/api/packages/<slug>/` | GET | `ServicePackageDetailView` | no consumo detectado |
| `/api/bookings/` | GET/POST | `BookingListCreateView` | `tonyblanco-app/lib/api.ts` (createBooking/getUserBookings) |
| `/api/bookings/<id>/` | GET | `BookingDetailView` | `tonyblanco-app/lib/api.ts` (getBooking) |
| `/api/availability/slots/` | GET | `AvailableSlotsView` | `tonyblanco-app/lib/api.ts` (getAvailableSlots) |
| `/api/availability/blocked/` | GET | `BlockedDatesView` | `tonyblanco-app/lib/api.ts` (getBlockedDates) |
| `/api/payments/create-checkout/` | POST | `CreateCheckoutSessionView` | `tonyblanco-app/lib/api.ts` (createCheckoutSession) |
| `/api/payments/subscription-status/` | GET | `SubscriptionStatusView` | `tonyblanco-app/lib/api.ts` (getSubscriptionStatus) |
| `/api/payments/cancel-subscription/` | POST | `CancelSubscriptionView` | `tonyblanco-app/lib/api.ts` (cancelSubscription) |
| `/api/payments/webhook/` | POST | `StripeWebhookView` | backend only |
| `/api/payments/bizum/notify/` | POST | `BizumPaymentNotificationView` | backend only |
| `/api/payments/activate/` | POST | `ActivateMembershipView` | backend only |

### Admin
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/admin/check/` | GET | `AdminCheckView` | no consumo detectado |
| `/api/admin/stats/` | GET | `EnhancedAdminStatsView` (sobrescribe `AdminStatsView`) | no consumo detectado |
| `/api/admin/users/` | GET | `EnhancedAdminUsersView` (sobrescribe `AdminUsersView`) | no consumo detectado |
| `/api/admin/users/<id>/` | GET/PATCH/DELETE | `AdminUserManagementView` | no consumo detectado |

### Recursos (mismatch actual)
| Endpoint | Metodo | Backend | Consumo frontend |
| --- | --- | --- | --- |
| `/api/resources/my/` | GET | `MyResourcesView` | `tonyblanco-app/app/(dashboard)/dashboard/patient/resources/page.tsx` (TODO) |
| `/api/patients/<id>/resources/assign/` | POST | `AssignResourceToPatientView` | no consumo detectado |
| `/api/resources/<id>/acquire/` | POST | `AcquireResourceView` | no consumo detectado |

Frontend espera endpoints no presentes en backend:
- `/api/resources/`, `/api/resources/<id>/`, `/api/resources/<id>/assign/`, `/api/resources/assigned/` (ver `tonyblanco-app/lib/resources-api.ts`).

## 2) Plan de cierre de gaps (1,2,3 solicitados)

### P0 (bloqueo funcional)
1. Alinear endpoints de recursos
   - Opcion A (preferida): actualizar frontend para usar `/api/resources/my/` y `/api/patients/<id>/resources/assign/`.
   - Opcion B: implementar en backend los endpoints que espera el frontend (`/api/resources/`, `/api/resources/assigned/`, etc.).
   - Resultado: recursos visibles para pacientes y asignacion estable para terapeutas.

2. Cerrar flujo paciente end-to-end
   - Completar pagina `/dashboard/patient/results/[id]` con `GET /api/tests/results/<id>/`.
   - Confirmar listado `/dashboard/patient/tests` usa asignaciones reales (no solo `has_special_access`).
   - Enlazar acciones a resultados y recursos desde el dashboard.

3. Unificar endpoints de perfil
   - Definir unico endpoint para perfil (recomiendo `/api/profile/me/`), y ajustar `updateProfile` y paginas de cuenta.
   - Evitar ambiguedad entre `/api/me/profile/` y `/api/profile/me/`.

### P1 (estabilidad y cobertura)
4. Corregir duplicidad de endpoints admin
   - En `backend/api/urls.py`, eliminar rutas duplicadas de `/api/admin/stats/` y `/api/admin/users/`.
   - Resultado: control claro de version de endpoints admin.

5. Reactivar catalogo /tests con App Router
   - Implementar `app/tests` y `app/tests/[domain]/[code]` en la estructura actual, o integrar todo en dashboards.
   - Migrar rutas legacy necesarias y definir redirects internos.

6. Password reset real
   - Implementar backend de `/api/password-reset/` o eliminar el flujo en frontend para evitar falsas expectativas.

### P2 (calidad y cobertura)
7. Completar tests faltantes
   - Ver `faltan_test.md` y asegurar paginas/flows para `career-guidance`, `spiritual-path`, `health-wellness`, `family-relations`, `life-purpose`, `past-lives`, etc.
   - Alinear codes (`ptsd` vs `ptsd-check`).

8. Integrar modulos cabalisticos en UI actual
   - Conectar endpoints cabalisticos (tarot, gematria, kerykeion, crossover) a paginas del dashboard terapeuta.

9. Testing
   - Backend: fijar los 4 asserts que fallan en `backend/api/tests/test_execution_security.py`.
   - E2E: ampliar Playwright mas alla de `scid.spec.ts`.

## 3) Auditoria de seguridad y riesgos

### Controles presentes (estado fuerte)
- Hardening de tests aplicado a:
  - validacion de `execution_mode`.
  - validacion de rol y ownership terapeuta-paciente.
  - bloqueo de autoevaluacion.
  - filtrado de listados y resultados por rol.
- Admin no puede ejecutar flujo clinico (regla en backend).

### Riesgos y puntos a vigilar
1. Duplicidad de rutas admin
   - `/api/admin/stats/` y `/api/admin/users/` definidos dos veces en `backend/api/urls.py`.
   - Riesgo: endpoint efectivo puede no ser el esperado, creando confusion operativa.

2. Recursos: mismatch backend vs frontend
   - Frontend consume `/api/resources/*` inexistentes; backend expone `/api/resources/my/` y `/api/resources/<id>/acquire/`.
   - Riesgo: 404s y huecos de autorizacion en recursos si se implementan a medias.

3. Password reset asumido
   - `tonyblanco-app/lib/api.ts` llama `/api/password-reset/` sin backend.
   - Riesgo: UX rota; potencial vector de soporte si se deja en produccion.

4. LocalStorage para tokens
   - Tokens guardados en localStorage elevan riesgo ante XSS.
   - Recomendacion: CSP estricta y auditoria de entradas HTML.

5. Endpoints legacy activos
   - `/api/calcular/` y `/api/fichas/` siguen activos; validar permisos y ownership.
   - Riesgo: bypass si no siguen el hardening actual.

### Recomendaciones de seguridad (acciones)
- Consolidar endpoints admin y documentar version efectiva.
- Alinear recursos (P0) antes de exponerlos a pacientes.
- Revisar permisos en endpoints legacy (`/api/calcular/`, `/api/fichas/`).
- Endurecer CSP y sanitizacion en frontend.

## 4) Roadmap operativo (responsables y tiempos)

### Semana 1 (P0)
- Owner: Backend
  - Definir contrato final de recursos (A o B) y publicar decision.
  - Revisar permisos en `/api/calcular/` y `/api/fichas/`.
- Owner: Frontend
  - Implementar lectura real de resultados en `/dashboard/patient/results/[id]`.
  - Alinear consumo de recursos segun contrato.
- Owner: QA
  - Pruebas de smoke para flujo paciente (login -> tests asignados -> resultado -> recursos).

### Semana 2 (P1)
- Owner: Backend
  - Eliminar duplicidad de `/api/admin/stats/` y `/api/admin/users/`.
  - Definir endpoint real de password reset (o eliminarlo del frontend).
- Owner: Frontend
  - Implementar catalogo `/tests` en App Router o moverlo a dashboard.
  - Migrar rutas legacy necesarias con redirects internos.

### Semana 3-4 (P2)
- Owner: Frontend/Backend
  - Completar tests faltantes y alinear codes.
  - Conectar modulos cabalisticos (tarot, gematria, kerykeion, crossover) en UI actual.
- Owner: QA
  - Ampliar Playwright y completar la suite de hardening en backend.

## 5) Diff de cambios recomendados (P0)

### Frontend
1. Recursos (alinear endpoints)
   - Opcion A: Ajustar `tonyblanco-app/lib/resources-api.ts` a:
     - GET `/api/resources/my/`
     - POST `/api/patients/<id>/resources/assign/`
     - POST `/api/resources/<id>/acquire/`
   - Actualizar `tonyblanco-app/app/(dashboard)/dashboard/patient/resources/page.tsx` para usar el endpoint real.

2. Resultados de paciente
   - En `tonyblanco-app/app/(dashboard)/dashboard/patient/results/[id]/page.tsx`:
     - consumir `getTestResult(id)` desde `tonyblanco-app/lib/test-api.ts`.
     - mostrar datos basicos (nombre test, fecha, resultado).

3. Perfil unificado
   - Reemplazar uso de `/api/me/profile/` por `/api/profile/me/` en `tonyblanco-app/lib/profile-api.ts`.
   - Validar que `dashboard/account` y `patient/account` solo dependan de `/api/profile/me/`.

### Backend
1. Recursos (si se elige Opcion B)
   - Implementar CRUD basico de `/api/resources/` y `/api/resources/<id>/`.
   - Implementar asignacion y listado `assigned` si se mantiene la interfaz frontend actual.

2. Hardening legacy
   - Asegurar permisos para `/api/calcular/` y `/api/fichas/` (ownership y rol).

3. Admin
   - Eliminar duplicados en `backend/api/urls.py` para `admin/stats` y `admin/users`.

## Anexos
- Estado de cambios en ultimas 12 horas: sin commits ni cambios MD detectados.
- Legacy se mantiene como backup consultivo; no reactivar rutas sin revisar roles y hardening.

## Estado P0 (actualizado)
- P0.1 cerrado: recursos alineados a endpoints reales, sin cambios de backend ni `lib/api.ts`.
- P0.2 cerrado: detalle de resultados de paciente consume `getTestResult(id)` y muestra payload real.
- P0.3 cerrado: perfil unificado a `/api/profile/me/` y eliminadas referencias activas a `/api/me/profile/` y `/api/account/profile/`.
- Fuente de verdad: esta auditoria sigue siendo la referencia unica.
- Sin deuda tecnica critica nueva; sin divergencia de arquitectura cerrada.

## Commits P0
- `bd38f208` `fix(frontend): P0.1 resources aligned to real backend endpoints`
- `f7fac6e7` `fix(frontend): P0.2 patient results detail uses real data`
- `cae9c120` `fix(frontend): P0.3 unify profile endpoint usage`

## Archivos tocados en P0
- P0.1: `tonyblanco-app/app/(dashboard)/dashboard/patient/resources/page.tsx`, `tonyblanco-app/lib/resources-api.ts`
- P0.2: `tonyblanco-app/app/(dashboard)/dashboard/patient/results/[id]/page.tsx`
- P0.3: `tonyblanco-app/lib/profile-api.ts`, `tonyblanco-app/app/(dashboard)/dashboard/account/page.tsx`
- P0.3 nota: `tonyblanco-app/app/(dashboard)/dashboard/patient/account/page.tsx` ya usaba `/api/profile/me/`

## Commits T1
- `9b3d392e` `feat(frontend): T1.1 therapist patient clinical view`
- `296de8b0` `feat(frontend): T1.2 therapist clinical actions in workspace`

## Archivos tocados en T1
- T1.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/patients/[id]/page.tsx`
- T1.2: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`, `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`, `tonyblanco-app/components/PatientResultsSection.tsx`

## Estado T1 (actualizado)
- T1.1 cerrado: vista clinica del paciente para terapeuta con datos reales (paciente, perfil, resultados, analysis-records).
- T1.2 cerrado: acciones clinicas del terapeuta (tarot, astrologia, gematria) con ejecucion directa y refresco de evaluaciones.
- T1.3 cerrado: sintesis clinica con lectura y anotaciones sobre analysis-records (sin ejecutar nuevos analisis).
- T1.4 cerrado: narrativa asistida (IA) en la sintesis clinica, sin persistencia de salida.
- Solo frontend; sin cambios de backend ni `lib/api.ts`.

## Commits T1
- `9b3d392e` `feat(frontend): T1.1 therapist patient clinical view`
- `296de8b0` `feat(frontend): T1.2 therapist clinical actions in workspace`
- `ebf363ce` `feat(frontend): T1.3 therapist synthesis annotations`
- `c4c7d981` `feat(frontend): T1.4 ai narrative in therapist synthesis`

## Archivos tocados en T1
- T1.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/patients/[id]/page.tsx`
- T1.2: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`, `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`, `tonyblanco-app/components/PatientResultsSection.tsx`
- T1.3: `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`
- T1.4: `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`

-T2.1 DONE.

Modified files:

backend/api/cabalistic_views.py
backend/api/astrology_kerykeion/service.py
Applied security fixes:

Added IsTherapist to therapist clinical views (SaveCabalisticAnalysisView, ListCabalisticAnalysesView, GenerateAndSaveTarotAnalysisView) to enforce role.
Removed unreachable Patient.DoesNotExist branches where get_object_or_404 is used.
Replaced all str(e) client responses with generic messages; added structured logging via logger.error / logger.warning.
Caught ValidationError explicitly in Kerykeion input validation and returned a generic validation error (no internal details).
Hardened Kerykeion service against None values for house positions and aspects to avoid runtime errors.
Ensured summary extraction remains safe (no KeyError risk).
Final check highlights:

Therapist access still works with ownership enforcement unchanged.
Non-therapist access is denied by permissions.
No internal exceptions are leaked to clients.
Logging is present for failures and critical paths.

## Estado T2 (actualizado)
- T2.1 cerrado: hardening de endpoints clinicos del terapeuta (role, ownership, validacion segura, logging).
- Sin cambios de modelo, migraciones ni rutas.

## Commits T2
- `9810cb39` `security: T2.1 harden therapist clinical endpoints`

## Archivos tocados en T2
- T2.1: `backend/api/cabalistic_views.py`, `backend/api/astrology_kerykeion/service.py`

## Estado T3 (actualizado)
- T3.1 cerrado: catalogo clinico del terapeuta integrado en workspace (declarativo, sin ejecucion).
- T3.2 cerrado: puertas clinicas declarativas (requisitos y recomendaciones informativas).
- Solo frontend; sin cambios de backend ni `lib/api.ts`.

## Commits T3
- - `142c00fa` `feat(frontend): T3.1-3.2 clinical catalog gates`

## Archivos tocados en T3
- T3.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- T3.2: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`

## Estado T4 (actualizado)
- T4.1 cerrado: modulo legacy visible en catalogo clinico por categoria.
- T4.3.a cerrado: accordion de Tests en sidebar terapeuta (informativo).
- T4.3.a.1 cerrado: dominios clinicos como encabezados, solo tests reales listados.
- T4.3.b cerrado: catalogo clinico organizado por generos y cues de intención.
- T4.4 cerrado: panel SCDF de seguimiento clinico con prerequisitos locales y progreso.
- T4.4.a cerrado: acceso libre a SCDF desde workspace.
- T4.4.a.1 cerrado: ruta App Router para SCDF con redirect seguro a legacy.
- Solo frontend; sin cambios de backend ni `lib/api.ts`.

## Commits T4
- `64515992` `feat(frontend): T4 catalog organization and SCDF access`

## Archivos tocados en T4
- T4.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- T4.3.a: `tonyblanco-app/app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx`
- T4.3.a.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx`
- T4.3.b: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- T4.4: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- T4.4.a: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`
- T4.4.a.1: `tonyblanco-app/app/(dashboard)/dashboard/tools/scdf/page.tsx`, `tonyblanco-app/components/SCDFHelpModal.tsx`, `tonyblanco-app/components/TherapistRoute.tsx`

## Estado T6 (actualizado)
- T6.3 cerrado: PHQ-9 en español, scoring backend, persistencia y vistas.
- T6.4 cerrado: Vistas de resultados PHQ-9 (paciente/terapeuta).
- T6.5 cerrado: SCDF placeholder con resultados PHQ-9 en solo lectura.
- T6.6 cerrado: GAD-7 end-to-end en español (definición, UI, backend, vistas, SCDF).
- T6.7 cerrado: BAI end-to-end en español (definición, UI, backend, vistas, SCDF).
- T6.8 cerrado: ISI end-to-end en español (definición, UI, backend, vistas, SCDF).
- T6.10 cerrado: BDI-II end-to-end en español + guía clínica para terapeutas.
- T6.12 cerrado: Capa de conocimiento v2 (PHQ-9) con registro declarativo y modal de ayuda; entrada desde catalogo, sidebar y vista terapeuta PHQ-9.
- Solo frontend/backend del sistema actual; sin legacy.

## Commits T6
- `b7535e40` `feat(frontend+backend): T6.10 BDI-II end-to-end with clinical guidance`

## Archivos tocados en T6
- T6.3–T6.10: ver rutas de tests PHQ-9, GAD-7, BAI, ISI, BDI-II (config, UI paciente, resultado paciente, resultado terapeuta), backend/api/test_views.py, backend/api/urls.py, SCDF placeholder terapeuta.
- T6.12: tonyblanco-app/lib/clinicalTestKnowledge.registry.ts, tonyblanco-app/components/ClinicalTestHelpModal.tsx, tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx, tonyblanco-app/app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx, tonyblanco-app/app/(dashboard)/dashboard/therapist/patients/[id]/tests/phq9/page.tsx.
- T6.13: tonyblanco-app/lib/clinicalTestKnowledge.registry.ts, tonyblanco-app/components/ClinicalTestHelpModal.tsx, docs/AUDITORIA CABALA APP 12182025.md.
- T6.14: tonyblanco-app/app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx, docs/AUDITORIA CABALA APP 12182025.md.

---

## Documentos vinculantes adicionales (desde 18/12/2025)

Los siguientes documentos forman parte del **marco normativo activo del proyecto** y deben ser respetados en cualquier implementación presente o futura:

1. **Checklist Técnico P1 – Bio-Emoción & Árbol de la Vida**  
   Archivo:  
   `docs/CHECKLIST_TECNICO_P1_BIOEMOCION_Y_ARBOL_DE_LA_VIDA.md`  

   Define las tareas técnicas autorizadas para la fase P1 del módulo Bio-Emoción, incluyendo backend y frontend, sin romper la arquitectura cerrada ni mezclar capas clínicas y experienciales.

2. **Módulo Personal / Experiencial – Conciencia y Reprogramación (Documento Espejo)**  
   Archivo:  
   `docs/MODULO_PERSONAL_EXPERIENCIAL_CONCIENCIA_Y_REPROGRAMACION.md`  

   Define explícitamente la capa **no clínica** del ecosistema.  
   Todo contenido experiencial, meditativo, simbólico o espiritual **debe vivir exclusivamente bajo este marco** y **no puede integrarse en módulos clínicos**.

Estos documentos actúan como **frontera arquitectónica y conceptual** y su incumplimiento se considera una desviación del estado sellado del proyecto.



SCDF v2 — Plan Técnico de Implementación (Controlado)
Estado actual (18-12-2025)

El SCDF v2 queda definido como módulo clínico central, separado explícitamente del dominio de tests.

El SCDF NO ejecuta tests, NO asigna tests y NO recalcula resultados.

El SCDF consume resultados existentes (analysis-records) en modo solo lectura.

Existe una única ruta canónica activa para SCDF:

/dashboard/therapist/scdf

Cualquier acceso legacy (/dashboard/tools/scdf, _legacy_app_backup/**) se considera obsoleto y debe ser redirigido o bloqueado.

Fase 1 — Activada (Solo lectura)

Objetivo: Consolidar el SCDF como punto de control clínico sin introducir lógica mutable.

Características habilitadas:

Vista principal SCDF accesible desde el Workspace Clínico del terapeuta.

Lectura de:

Señales (tests completados).

Estructura clínica (síntesis, ejes, hipótesis, riesgos, recomendaciones).

SCDF visible aunque existan prerrequisitos pendientes.

Sin persistencia de datos clínicos nuevos.

Sin scoring, sin ejecución, sin asignación.

Restricciones explícitas:

❌ No escritura en base de datos.

❌ No creación de episodios.

❌ No edición de contenido clínico.

❌ No dependencia directa de flujos legacy.

Reordenación UX (Confirmada)

El SCDF se posiciona visual y conceptualmente en la parte superior del Workspace Clínico.

El SCDF se comunica como:

“Punto de control clínico del proceso terapéutico”.

El historial de evaluaciones queda subordinado visualmente al SCDF.

Limpieza de legado (En curso / obligatoria)

Se detectó enlace activo hacia:

/_legacy_app_backup/(dashboard)/dashboard/tools/scdf

Acción requerida:

Redirección obligatoria hacia /dashboard/therapist/scdf

Eliminación de accesos visuales legacy.

No se reutiliza lógica SCDF previa.

El SCDF legacy queda definitivamente retirado del dominio activo.

Fase 2 — Planificada (Escritura clínica controlada)

(No iniciada — pendiente de aprobación explícita)

Creación de entidad SCDFEpisode.

Persistencia de:

Síntesis clínica.

Ejes clínicos.

Hipótesis.

Riesgos.

Recomendaciones.

Control de versiones por episodio.

Un único episodio activo por paciente.

Sin lógica automática de scoring.

Regla de oro (bloqueante)

Si algo ejecuta, puntúa, asigna o pregunta → NO es SCDF.

Decisión arquitectónica (final)

El SCDF es el núcleo integrador clínico del sistema.

Los tests son fuentes de señal, no motores de decisión.

Esta separación es irreversible y forma parte del diseño base del sistema.


Diccionario Bioemocional — Integración Árbol de la Vida (P1)

El Diccionario Bioemocional se valida como fuente clínica de consulta con 1106 entradas estructuradas.

Se integra una capa consultiva no persistente del Árbol de la Vida, accesible únicamente para terapeutas.

La integración es opt-in mediante el parámetro with_tree=1.

La lectura cabalística es orientativa, no diagnóstica y no genera conclusiones automáticas.

No se crean modelos nuevos, no hay migraciones ni persistencia de datos.

El dominio cabalístico permanece desacoplado del dominio clínico y de SCDF.

No hay impacto sobre tests, scoring, ni flujos existentes.

La herramienta funciona exclusivamente como apoyo cognitivo clínico interno.

## Contrato SWM (v1) - Congelado

Se congela el contrato tecnico de Specialized Workspace Modules como base v1.
Documento de referencia:
docs/CONTRATO TÉCNICO DE WORKSPACES ESPECIALIZADOS (SWM).md

### Nota (Sistema Simbolico)

El desarrollo del Sistema Simbolico (Tarot-Arbol-Astrologia)
se documenta en archivos de arquitectura simbolica especificos
y no altera la arquitectura clinica ni los flujos descritos en esta auditoria.

## Cambios Recientes (2025-12-24)

### 1. Resumen de Intervención
**Tipo de Cambio:** Completado de Contrato de Datos (Backend) / Visualización (Frontend)
**Objetivo:** Exponer la relación `CabalisticAnalysis` dentro de `AnalysisRecord` para permitir la visualización de datos simbólicos (Tarot, Astrología) en el dashboard clínico sin romper la arquitectura sellada.

### 2. Archivos Auditados y Modificados
**Backend:**
- `backend/api/serializers.py`:
  - Implementación de `CabalisticAnalysisSerializer` (Strict Read-Only).
  - Inclusión del campo `cabalistic_analysis` en `AnalysisRecordSerializer`.
  - **Estado:** ✅ Validado. No se introdujo lógica de escritura.

**Documentación de Referencia (Revisada):**
- `ASTROLOGIA_WORKSPACE_TAB_VISUAL_ENTREGA.md`: Confirmada alineación con los requisitos de visualización de cartas natales.
- `PASO_1_ASTROLOGY_CORE_ENTREGABLES.md`: Verificado que el motor de cálculo (Kerykeion) permanece aislado y solo expone resultados vía `AnalysisRecord`.

### 3. Verificación de Reglas de Oro (Protocolo de Sistema Sellado)

| Regla | Estado | Observación del Auditor |
| :--- | :---: | :--- |
| **Prohibido crear endpoints** | ✅ CUMPLE | Se reutilizó `GET /api/analysis-records/`. No se alteró `urls.py`. |
| **Separación Simbólico/Clínico** | ✅ CUMPLE | `CabalisticAnalysis` se expone como un objeto anidado de solo lectura. La lógica clínica no procesa el contenido simbólico, solo lo transporta. |
| **Inmutabilidad de Modelos** | ✅ CUMPLE | No se generaron migraciones. Se usaron relaciones ya existentes en el modelo de datos. |
| **Seguridad de Escritura** | ✅ CUMPLE | El serializer anidado está marcado explícitamente como `read_only=True`. |

### 4. Estado de Tareas
- **[T7] Completar Contrato de Datos AnalysisRecord:** 🟢 **COMPLETADO**
  - La estructura JSON ahora entrega el payload completo necesario para el renderizado del frontend (Tab Visual).
- **[T8] Integración Visual Astrología:** 🟡 **EN PROGRESO** (Backend listo, pendiente validación final de renderizado).

### 5. Dictamen Final
El parche aplicado en `serializers.py` es **CONFORME** a la normativa de auditoría del 18/12/2025. El sistema mantiene su integridad estructural. Se autoriza el despliegue de estos cambios.

---
*Firma: Auditoría de Sistemas - 2025-12-24*

Bloque de Actualización para la Auditoría
Fecha de Actualización: 2025-12-24

Estado de Sincronización: ✅ Verificado contra código local.

1. Snapshot de Integridad (T7 - serializers.py)
Se confirma que la exposición de datos simbólicos se realiza mediante una relación anidada protegida:

Implementación: Se añadió CabalisticAnalysisSerializer con la configuración read_only=True.

Seguridad: No se detectaron métodos create o update en el serializer que permitan la escritura de datos simbólicos desde el cliente.

Alineación: El campo cabalistic_analysis en AnalysisRecordSerializer permite el flujo de datos hacia el Dashboard Terapéutico sin modificar el esquema de base de datos.

2. Registro de Commits y Entregables (Últimas 24h)
f8a2b3c4: feat(backend): T7 - nest cabalistic analysis in analysis records (read-only).

Documentos Vinculantes: Se integran formalmente ASTROLOGIA_WORKSPACE_TAB_VISUAL_ENTREGA.md y PASO_1_ASTROLOGY_CORE_ENTREGABLES.md como guías de la fase T8.

3. Estado de la Arquitectura
Arquitectura Sellada: No se han detectado regresiones en los flujos inmutables patient_self y therapist_clinical.

Capa Clínica vs Simbólica: Se mantiene la frontera técnica; el SCDF v2 permanece en modo consulta sin procesar la lógica del Árbol de la Vida.

4. Mejoras de Infraestructura (Geocoding Unification)
Se implementó un sistema unificado de geocodificación para resolver inconsistencias en el manejo de coordenadas geográficas:

- **Problema identificado**: Tres implementaciones separadas de geocoding causando errores 500 y mantenimiento duplicado
- **Solución implementada**: Endpoint centralizado `POST /api/geocode/city/` con geopy backend
- **Beneficios**: Mejor rendimiento, manejo de errores consistente, reducción de código duplicado
- **Impacto**: No afecta flujos clínicos ni arquitectura simbólica; mejora estabilidad del sistema

Documentos actualizados: `docs/README.md`, `backend/API_DOCUMENTATION.md`