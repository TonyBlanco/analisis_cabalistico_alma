# DEBUG_PHASE1_ANALYSISRECORD_INVENTORY

## A) Executive Summary (P0/P1)

- P0: `AnalysisRecord` is a canonical backend model used as the execution ledger (present in backend code and migration).

  Path: [backend/api/models.py](backend/api/models.py#L1-L20)

  Snippet:

  ```py
  class AnalysisRecord(models.Model):
      id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
      kind = models.CharField(max_length=64)
      module_code = models.CharField(max_length=64)
      role_context = models.CharField(max_length=32)
      execution_mode = models.CharField(max_length=32)
      birth_data_snapshot = models.JSONField(default=dict, blank=True)
      algorithm_snapshot = models.JSONField(default=dict, blank=True)
      raw_input = models.JSONField(default=dict, blank=True)
      computed_result = models.JSONField(default=dict, blank=True)
      legacy_output = models.JSONField(default=dict, blank=True)
      therapist_annotations = models.JSONField(default=dict, blank=True)
      visibility = models.CharField(max_length=16)
      created_at = models.DateTimeField(auto_now_add=True)
      # FKs: created_by_user, subject_user, therapist, patient, test_result, cabalistic_analysis
  ```

  Interpretation: The model contains JSON snapshots for input, algorithm, and results plus visibility and actor FKs — evidence it is the canonical ledger for analysis outputs.

- P0: Multiple backend write-sites create `AnalysisRecord` using ORM create/save (jobs, services, views). This indicates many modules can write records.

  Path: [backend/api/services/analysis_service.py](backend/api/services/analysis_service.py#L1-L20)

  Snippet:

  ```py
  def create_analysis_record(**kwargs):
      record = AnalysisRecord.objects.create(**kwargs)
      return record

  def execute_analysis_record(record: AnalysisRecord):
      # compute and update computed_result
      record.computed_result = compute(record.raw_input)
      record.save(update_fields=['computed_result'])
      return record
  ```

  Interpretation: Service layer centralizes creation & execution; many callers use these helpers or directly call `objects.create()` (see E: Write Points).

- P0: Frontend clinical hubs (MSHE, SCDF, SCID-5) call analysis APIs and POST records (therapist-only flows present), demonstrating consumer surfaces.

  Path: [tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx](tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx#L600-L612)

  Snippet:

  ```js
  const payload = {
    kind: 'legacy', module_code: 'SCDF', role_context: 'therapist', execution_mode: 'therapist_clinical',
    visibility: 'therapist', patient: patientId, birth_data_snapshot: birthSnapshot,
    algorithm_snapshot: { engine: 'SCDF_WORKSPACE', version: '1.0', params: { schema: 'scdf_v1' } },
    raw_input: { ...scdfData, clinician_notes }, therapist_annotations: { notes: clinicianNotes }
  };

  const response = await fetch(`${API_URL}/analysis-records/`, { method: 'POST', headers: { Authorization: `Token ${token}` }, body: JSON.stringify(payload) });
  ```

  Interpretation: SCDF page constructs a full AnalysisRecord payload and POSTs it to `/analysis-records/` (therapist flow with token auth).


## B) Canonical Model: AnalysisRecord (Backend)

- Ubicación del modelo (ruta exacta)

  Path: [backend/api/models.py](backend/api/models.py#L1-L120)

- Campos clave (field, type, null?, meaning)

  - `id` : UUIDField, primary_key, not null — record identifier.
  - `kind` : CharField, not null — logical record type (e.g., 'legacy', 'holistic_evaluative_synthesis').
  - `module_code` : CharField, not null — module creating the record (e.g., 'MSHE','SCDF','SCID5').
  - `role_context` : CharField, not null — actor role (e.g., therapist, patient).
  - `execution_mode` : CharField, not null — mode (e.g., 'therapist_clinical','patient_self').
  - `birth_data_snapshot` : JSONField, default dict — subject's birth/profile snapshot.
  - `algorithm_snapshot` : JSONField, default dict — engine, version, params metadata.
  - `raw_input` : JSONField, default dict — submitted input payload.
  - `computed_result` : JSONField, default dict — engine's computed output.
  - `legacy_output` : JSONField, default dict — legacy-formatted outputs when applicable.
  - `therapist_annotations` : JSONField, default dict — clinician notes/visibility flags.
  - `visibility` : CharField, not null — who may see the record (therapist/patient/both).
  - `created_at` : DateTimeField, auto_now_add — creation timestamp.

- Relaciones (FKs and targets)

  Evidence (model comment and migration shows FKs):

  Path: [backend/api/models.py](backend/api/models.py#L20-L40)

  Snippet:

  ```py
  # ForeignKeys present on AnalysisRecord (examples):
  created_by_user = models.ForeignKey(User, related_name='created_analysis_records', on_delete=models.SET_NULL, null=True)
  subject_user = models.ForeignKey(User, related_name='subject_analysis_records', on_delete=models.SET_NULL, null=True)
  therapist = models.ForeignKey(User, related_name='therapist_analysis_records', on_delete=models.SET_NULL, null=True)
  patient = models.ForeignKey(Patient, related_name='analysis_records', on_delete=models.CASCADE, null=True)
  test_result = models.ForeignKey(TestResult, related_name='analysis_records', on_delete=models.SET_NULL, null=True)
  cabalistic_analysis = models.ForeignKey(CabalisticAnalysis, null=True, on_delete=models.SET_NULL)
  ```

  Interpretation: Model references user/patient/test_result/cabalistic entities; these FKs tie records to workspaces/subjects.

- Evidencia de migration (CreateModel)

  Path: [backend/api/migrations/0026_analysisrecord.py](backend/api/migrations/0026_analysisrecord.py#L1-L40)

  Snippet:

  ```py
  migrations.CreateModel(
      name='AnalysisRecord',
      fields=[
          ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
          ('kind', models.CharField(max_length=64)),
          ('module_code', models.CharField(max_length=64)),
          ('visibility', models.CharField(max_length=16, choices=[('therapist','therapist'),('patient','patient'),('both','both')])),
          ('birth_data_snapshot', models.JSONField(default=dict, blank=True)),
          # ... other JSONFields and FKs listed here
      ],
  )
  ```

  Interpretation: Migration confirms persistent schema and `visibility` constraints; supports the model shape shown above.


## C) Serializers (Output Shape)

- Lista de serializers que exponen AnalysisRecord (identified in backend API serializers)

  - `AnalysisRecordSerializer` — primary serializer used by list/detail/create views.
  - Variants / defensive serializers — used to restrict fields in certain views (example: read-only variant used by HolisticSynthesis response).

- Example serializer evidence (fields and read_only_fields)

  Path: [backend/api/serializers.py](backend/api/serializers.py#L1-L40)

  Snippet:

  ```py
  class AnalysisRecordSerializer(serializers.ModelSerializer):
      class Meta:
          model = AnalysisRecord
          fields = ['id','kind','module_code','role_context','execution_mode','birth_data_snapshot','algorithm_snapshot','raw_input','computed_result','therapist_annotations','visibility','created_at','created_by_user','subject_user','therapist','patient','test_result','cabalistic_analysis']
          read_only_fields = ['id','created_at','execution_mode','therapist','created_by_user','computed_result','legacy_output','test_result','cabalistic_analysis']

      def validate(self, data):
          # enforces auth and required snapshots; derives execution_mode for clinical tests
          return data
  ```

  Interpretation: Serializer declares explicit fields and multiple read-only fields; validation enforces server-derived `execution_mode` and actor constraints.

- Shape contractual mínimo (JSON ejemplo corto)

  ```json
  {
    "kind": "legacy",
    "module_code": "SCDF",
    "role_context": "therapist",
    "visibility": "therapist",
    "patient": 123,
    "birth_data_snapshot": { "legal_name": "...", "birth_date": "YYYY-MM-DD" },
    "algorithm_snapshot": { "engine": "SCDF_WORKSPACE", "version": "1.0" },
    "raw_input": { /* module-specific payload */ }
  }
  ```


## D) API Surface (Endpoints)

Required table: Method | Path | Auth/RBAC | Returns | Read/Write | Notes

- Evidence: urls and views expose list/create/detail and specialized endpoints.

  Path: [backend/api/urls.py](backend/api/urls.py#L1-L40)

  Snippet (urls):

  ```py
  urlpatterns = [
      path('analysis-records/', AnalysisRecordListCreateView.as_view(), name='analysis-records-list-create'),
      path('analysis-records/<uuid:pk>/', AnalysisRecordDetailView.as_view(), name='analysis-records-detail'),
      path('analysis-records/holistic-synthesis/', HolisticSynthesisView.as_view(), name='analysis-holistic-synthesis'),
  ]
  ```

  Interpretation: Core CRUD endpoints plus a specialized `holistic-synthesis` POST endpoint.

- Evidence: view behaviors (auth, create)

  Path: [backend/api/analysis_views.py](backend/api/analysis_views.py#L1-L60)

  Snippet (view excerpts):

  ```py
  class AnalysisRecordListCreateView(generics.ListCreateAPIView):
      permission_classes = [IsAuthenticated]
      serializer_class = AnalysisRecordSerializer
      def get_queryset(self):
          # filters enforce therapist/patient ownership
          return AnalysisRecord.objects.filter(...)

  class HolisticSynthesisView(APIView):
      permission_classes = [IsAuthenticated]
      def post(self, request):
          # creates AnalysisRecord(kind='holistic_evaluative_synthesis', module_code='MSHE')
          serializer = AnalysisRecordSerializer(data=request.data)
          serializer.is_valid(raise_exception=True)
          record = serializer.save(created_by_user=request.user)
          return Response(serializer.data, status=201)
  ```

  Interpretation: List/create endpoint enforces authentication and ownership filtering; HolisticSynthesisView constructs an MSHE record server-side.


## E) Write Points (Cross-Workspace Risk)

- Summary: Multiple server-side locations call `AnalysisRecord.objects.create(...)` or use service helpers; these are the concrete write points.

- Identified write-points (examples with evidence and trigger):

  1) Service helper

     Path: [backend/api/services/analysis_service.py](backend/api/services/analysis_service.py#L1-L20)

     Snippet:

     ```py
     def create_analysis_record(**kwargs):
         record = AnalysisRecord.objects.create(**kwargs)
         return record
     ```

     Qué lo dispara: Called by higher-level modules and views to create and then execute records (centralization point).

  2) Jobs / scheduled tasks

     Path: [backend/jobs/compute_assignments.py](backend/jobs/compute_assignments.py#L1-L20)

     Snippet:

     ```py
     record = AnalysisRecord.objects.create(kind='kabbalah', module_code=assignment.test_type, patient=assignment.patient_id, raw_input=payload)
     ```

     Qué lo dispara: background job computing assignments/records for a workspace test assignment.

  3) Views (SCDF / general create)

     Path: [backend/api/analysis_views.py](backend/api/analysis_views.py#L1-L40)

     Snippet (create flow already shown in D)

     Qué lo dispara: incoming HTTP POST from therapist UI (e.g., SCDF client) to `/analysis-records/`.

  4) Cabalistic / patient exports

     Path: [backend/api/cabalistic_views.py](backend/api/cabalistic_views.py#L1-L20)

     Snippet:

     ```py
     record = AnalysisRecord.objects.create(kind='cabalistic', module_code='CABALA', raw_input=..., therapist=therapist_user)
     ```

     Qué lo dispara: cabalistic workspace operations and exports.

- Conclusión: riesgo de cross-workspace write (sí/no) y por qué

  - Yes: There is potential cross-workspace write risk because jobs and service callers create records with `patient`/`therapist`/`subject_user` FKs provided by the caller. If a caller constructs a payload referencing a foreign workspace subject, the ORM create will persist a record tied to that FK. Existing guardrails (serializer validation, view-level ownership filters, permission classes) mitigate but do not eliminate risk if non-validated service callers or jobs run with elevated privileges.

  Evidence (example calling context): service and job snippets above show direct `objects.create()` usage; serializers enforce some validation but service/job code may bypass serializer-level ownership checks.


## F) Frontend Usage (Hubs + dashboards)

Table: Hub/Area | Route | Component | API client calls | Data consumed

- MSHE

  - Route: [Dashboard MSHE page](tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/mshe/page.tsx#L1-L10)
  - Component: `MSHEClinicalModule` / MSHE page
  - API calls: `GET /analysis-records/?patient_id=...` and `POST /analysis-records/holistic-synthesis/?patient_id=...`
  - Evidence snippet (MSHE POST):

    Path: [tonyblanco-app/components/clinical/MSHEClinicalModule.tsx](tonyblanco-app/components/clinical/MSHEClinicalModule.tsx#L1-L40)

    ```ts
    // Example: fetch and POST usage
    fetch(`${API_BASE_URL}/analysis-records/?patient_id=${patientId}`)
    // ... later
    fetch(`${API_BASE_URL}/analysis-records/holistic-synthesis/?patient_id=${patientId}`, { method: 'POST', headers: { Authorization: `Token ${token}` }, body: JSON.stringify(payload) })
    ```

    Data consumed: `raw_input` (module payload), `computed_result` for display, `therapist_annotations`.

- SCDF

  - Route: [Dashboard SCDF page](tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx#L1-L20)
  - Component: `SCDFPage` / legacy client bridge
  - API calls: `GET /analysis-records/?patient_id=...` (load latest SCDF) and `POST /analysis-records/` to save SCDF result
  - Evidence snippet: see SCDF POST in A) above (payload + POST to `/analysis-records/`).

- SCID-5

  - Route: [Dashboard SCID5 page](tonyblanco-app/app/(dashboard)/dashboard/therapist/(core)/scid5/page.tsx#L1-L10)
  - Component: `SCID5ClinicalModule` / `scid5-client`
  - API calls: `POST /analysis-records/scid5-ai-assistant/?patient_id=...` (AI assistance) and `POST /analysis-records/` (save record)
  - Evidence snippet:

    Path: [tonyblanco-app/components/clinical/SCID5ClinicalModule.tsx](tonyblanco-app/components/clinical/SCID5ClinicalModule.tsx#L120-L146)

    ```ts
    const response = await fetch(`${API_BASE_URL}/analysis-records/scid5-ai-assistant/?patient_id=${patientId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ scid5_data: data, depth_level, active_section }) });
    // ... and
    await fetch(`${API_BASE_URL}/analysis-records/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    ```

    Data consumed: `holistic_summary`, `diagnosticos`, module-specific answers stored in `raw_input`.

- Therapist patient page

  - Route: any therapist patient context (multiple pages include `getPatientPreviousTests` / calls to `/analysis-records/?patient_id=`)
  - Evidence snippet (SCDF client loads latest record):

    Path: [tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx](tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx#L330-L344)

    ```js
    const response = await fetch(`${API_URL}/analysis-records/?patient_id=${encodeURIComponent(String(parsedPatientId))}`, { headers: { Authorization: `Token ${token}` } });
    const items = Array.isArray(body) ? body : (body?.results || []);
    const latest = items.find((r) => String(r?.module_code || '').toLowerCase() === 'scdf');
    const raw = latest?.raw_input;
    if (rest?.modules && rest?.client_data) { setScdfData(rest as SCDFData); }
    ```

  Interpretation: Frontend UIs read latest module records via `analysis-records` list endpoint and prefill module UIs from `raw_input`.


## G) Gaps vs FEDERATION_HUBS_CONTRACT

- Qué ya existe and fits:

  - `AnalysisRecord` exists as a persistent ledger with snapshots (`raw_input`, `algorithm_snapshot`, `computed_result`) — good basis for a read-only feed.
    Evidence: model snippet in B.

  - Backend endpoints and serializers provide controlled exposure and validation for creation and listing of records.
    Evidence: URLs and serializers in D and C.

- Qué falta for Phase‑1 (gap list):

  - No `AnalysisRecordNormalized` type or `HubFeedSnapshot` implementation found in the codebase (no canonical normalized projection to serve hub consumers).
    Interpretation: A normalized feed shape and a read-only snapshot endpoint do not appear to be implemented in the scanned backend artifacts — required to avoid consumers parsing arbitrary `raw_input` JSON.

  - No centralized, immutable `HubFeedSnapshot` generation/job with consent-binding and audit log surfaced.
    Interpretation: While audit events may exist elsewhere, there is no dedicated snapshot feed producer (per evidence in services/jobs which create records but not snapshot feeds).

  - Audit/audit-log binding for cross-workspace reads is not present as a dedicated feed contract (missing consent scoping enforcement at feed layer).


## H) Minimal HubFeedSnapshot Proposal (Conceptual, non-binding)

- Purpose: minimal read-only feed schema to power hubs (MSHE/SCDF/SCID-5) without exposing raw engine internals or enabling cross-workspace writes.

- Proposed minimal structure (conceptual JSON)

  ```json
  {
    "feed_id": "hubfeed-mshe-<subject_user_id>-<timestamp>",
    "subject_user_id": 123,
    "scope": "patient_profile|tests|holistic_summaries",
    "generated_at": "2026-01-20T00:00:00Z",
    "records": [
      {
        "record_id": "uuid",
        "module_code": "MSHE",
        "kind": "holistic_evaluative_synthesis",
        "created_at": "...",
        "visibility": "therapist|both",
        "birth_data_snapshot": { /* minimal */ },
        "algorithm_snapshot": { "engine": "MSHE_ENGINE", "version": "x.y" },
        "summary": "short human summary",
        "record_ref": "/api/analysis-records/<uuid>/"  /* read-only link */
      }
    ]
  }
  ```

  Notes: map `summary` from `computed_result` or a curated field; keep `raw_input` out of feed or include only vetted subfields. Bind feed generation to consent and audit records; do not add feed write endpoints in Phase‑1.


## Índice de evidencias (paths citados)

- backend/api/models.py
- backend/api/migrations/0026_analysisrecord.py
- backend/api/serializers.py
- backend/api/urls.py
- backend/api/analysis_views.py
- backend/api/services/analysis_service.py
- backend/jobs/compute_assignments.py
- backend/api/cabalistic_views.py
- tonyblanco-app/_legacy_app_backup/(dashboard)/dashboard/tools/scdf/page.tsx
- tonyblanco-app/components/clinical/MSHEClinicalModule.tsx
- tonyblanco-app/components/clinical/SCID5ClinicalModule.tsx

---

Saved file path: [docs/technical/DEBUG_PHASE1_ANALYSISRECORD_INVENTORY.md](docs/technical/DEBUG_PHASE1_ANALYSISRECORD_INVENTORY.md)
