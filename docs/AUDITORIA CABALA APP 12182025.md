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
- Solo frontend; sin cambios de backend ni `lib/api.ts`.

## Commits T1
- `9b3d392e` `feat(frontend): T1.1 therapist patient clinical view`
- `296de8b0` `feat(frontend): T1.2 therapist clinical actions in workspace`
- `ebf363ce` `feat(frontend): T1.3 therapist synthesis annotations`

## Archivos tocados en T1
- T1.1: `tonyblanco-app/app/(dashboard)/dashboard/therapist/patients/[id]/page.tsx`
- T1.2: `tonyblanco-app/app/(dashboard)/dashboard/therapist/page.tsx`, `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`, `tonyblanco-app/components/PatientResultsSection.tsx`
- T1.3: `tonyblanco-app/components/ClinicalEvaluationsSection.tsx`

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
