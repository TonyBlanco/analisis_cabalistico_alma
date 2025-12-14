# FASE 0 — DISCOVERY REPORT
## Therapist Dashboard Implementation

---

## 📋 CURRENT USER FETCHING

### Frontend Session Service
**File:** `tonyblanco-app/lib/session.ts`

**Function:** `fetchSession()`
- **Endpoint:** `GET /api/me/`
- **Method:** `GET`
- **Headers:** `Authorization: Token ${token}` (from localStorage `authToken`)
- **Response Shape:**
```typescript
{
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile?: {
      user_type?: 'admin' | 'therapist' | 'personal' | 'patient';
      full_name?: string;
      // ... other fields
    };
    user_type?: 'admin' | 'therapist' | 'personal' | 'patient';
  } | null;
}
```

### User Role Helper
**File:** `tonyblanco-app/lib/getUserRole.ts`

**Function:** `getUserRole()`
- Uses `fetchSession()` internally
- Extracts role with priority: `profile.user_type` → `profile.role` → `user.user_type` → `user.role`
- Returns: `'admin' | 'therapist' | 'personal' | 'patient' | null`

---

## 🔌 API CLIENTS

### Main API Client
**File:** `tonyblanco-app/lib/api.ts`
- Base URL: `process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api'`
- Token management: localStorage `authToken`
- Generic fetch utilities with auth headers

### Test API Client
**File:** `tonyblanco-app/lib/test-api.ts`
- Functions:
  - `getAvailableTests()` → `GET /api/tests/`
  - `getTestDetail(code)` → `GET /api/tests/{code}/`
  - `executeTest(data)` → `POST /api/tests/execute/`
  - `getTestResults(filters?)` → `GET /api/tests/results/`
  - `getPatientPreviousTests(params)` → `GET /api/tests/patient-previous/?patient_id=...`

---

## 🏥 ENDPOINTS: THERAPIST PATIENTS

### A) List Therapist Patients
**Endpoint:** `GET /api/therapist/patients/`  
**View:** `PatientListCreateView`  
**File:** `backend/api/views.py`  
**URL:** `backend/api/urls.py` line 112

**Request:**
- Method: `GET`
- Auth: Required (IsAuthenticated)
- Headers: `Authorization: Token ${token}`

**Response Shape (expected):**
```json
[
  {
    "id": 1,
    "email": "patient@example.com",
    "full_name": "Patient Name",
    "first_name": "Patient",
    "last_name": "Name",
    "birth_date": "1990-01-01",
    "therapist": 1,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

**Note:** Endpoint is therapist-only (backend filters by `therapist=request.user`)

---

### B) Patient Detail
**Endpoint:** `GET /api/therapist/patients/{pk}/`  
**View:** `PatientDetailView`  
**File:** `backend/api/views.py`  
**URL:** `backend/api/urls.py` line 113

**Response Shape:** Single patient object (same as list item)

---

## 📝 ENDPOINTS: TEST ASSIGNMENT

### Grant Test Access (Assignment)
**Endpoint:** `POST /api/tests/grant-access/`  
**View:** `GrantTestAccessView`  
**File:** `backend/api/test_views.py` lines 813-878  
**URL:** `backend/api/urls.py` line 178

**Request:**
```json
{
  "user_id": 123,          // Patient user ID (not patient record ID)
  "test_code": "scl-90",
  "special_uses": 10,      // Optional
  "expires_at": "2025-12-31T23:59:59"  // Optional ISO datetime
}
```

**Response:**
```json
{
  "success": true,
  "message": "Acceso especial otorgado a username para Test Name"
}
```

**IMPORTANT NOTES:**
- Currently ADMIN-ONLY (`is_staff` or `profile.is_admin`)
- Uses `user_id` (User model ID), not `patient_id` (Patient model ID)
- For `patient_self` tests: Should work if patient has User account
- For `therapist_clinical`: Blocked from being granted to non-therapists (Phase 5 hardening)

**⚠️ GAP IDENTIFIED:**
- No direct "assign test to patient" endpoint that uses `patient_id`
- Current `grant-access` uses `user_id` and is admin-only
- Need to verify if patient records have linked User accounts, or if we need different approach

---

### Patient Previous Tests
**Endpoint:** `GET /api/tests/patient-previous/?patient_id={id}`  
**View:** `PatientPreviousTestsView`  
**File:** `backend/api/test_views.py` lines 705-810  
**URL:** `backend/api/urls.py` line 179

**Request:**
- Query params:
  - `patient_id` (required for therapist, optional for admin)
  - `patient_name` (optional, admin only)
  - `patient_birth_date` (optional, admin only)

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "test_module": {
        "code": "scl-90",
        "name": "SCL-90-R"
      },
      "client_name": "Patient Name",
      "client_birth_date": "1990-01-01",
      "created_at": "2025-01-01T00:00:00Z",
      // ... other TestResult fields
    }
  ]
}
```

**Rules:**
- Therapist-only (validates ownership)
- `patient_id` required for therapists
- Returns tests matching name/birth_date OR tests already linked to patient

---

## 📚 ENDPOINTS: TEST CATALOG

### Available Tests
**Endpoint:** `GET /api/tests/`  
**View:** `AvailableTestsView`  
**File:** `backend/api/test_views.py` lines 28-75  
**URL:** `backend/api/urls.py` line 172

**Request:**
- Method: `GET`
- Auth: Required

**Response Shape:**
```json
{
  "tests": [
    {
      "code": "scl-90",
      "name": "SCL-90-R",
      "test_type": "diagnostic",
      "available_for_therapists": true,
      "available_for_personal": true,
      "required_access_level": "free",
      // ... other TestModule fields
    }
  ],
  "user_type": "therapist",
  "subscription_plan": "professional",
  "membership_active": true
}
```

**Filtering Logic (backend):**
- **Admin:** All tests (filtered by `is_active` and `is_available_for_user`)
- **Therapist:** Tests where `available_for_therapists=True` OR `available_for_personal=True`
- **Personal/Patient:** Only tests where `available_for_personal=True`

**Execution Mode Inference:**
- `available_for_therapists=True` AND `available_for_personal=False` → `therapist_clinical`
- `available_for_personal=True` AND `available_for_therapists=False` → `patient_self`
- Both `True` → Depends on context (has `patient_id` → `therapist_clinical`, else → `patient_self`)

---

### Test Detail
**Endpoint:** `GET /api/tests/{code}/`  
**View:** `TestModuleDetailView`  
**File:** `backend/api/test_views.py` lines 78-131  
**URL:** `backend/api/urls.py` line 180

**Response:** Single TestModule object

---

## 📊 ENDPOINTS: TEST RESULTS

### List Test Results
**Endpoint:** `GET /api/tests/results/`  
**View:** `TestResultsView`  
**File:** `backend/api/test_views.py` lines 457-502  
**URL:** `backend/api/urls.py` line 175

**Request:**
- Query params (optional):
  - `test_code`: Filter by test module code
  - `favorites`: `true` to show only favorites

**Response Shape:**
```json
[
  {
    "id": 1,
    "test_module": {
      "code": "scl-90",
      "name": "SCL-90-R"
    },
    "patient": {
      "id": 1,
      "full_name": "Patient Name"
    } | null,  // null for patient_self, object for therapist_clinical
    "client_name": "Patient Name",
    "client_birth_date": "1990-01-01",
    "result_data": { /* test results */ },
    "created_at": "2025-01-01T00:00:00Z",
    "is_favorite": false,
    "notes": "",
    // ... other fields
  }
]
```

**Filtering Logic (backend - Phase 4 hardened):**
- **Admin:** All results (`is_archived=False`)
- **Therapist:** Own results OR results of their patients (`patient__therapist=user`)
- **Personal/Patient:** Only own results (`user=user`)

**Note:** Results have `patient` field that links to Patient model when executed in `therapist_clinical` mode

---

### Test Result Detail
**Endpoint:** `GET /api/tests/results/{id}/`  
**View:** `TestResultDetailView`  
**File:** `backend/api/test_views.py` lines 515-655  
**URL:** `backend/api/urls.py` line 176

**Response:** Single TestResult object

**Access Control (Phase 4):**
- Admin: Can view all (read-only, cannot modify/delete)
- Therapist: Own results + patients' results
- Others: Only own results

---

## 🔍 ACTIVE PATIENT STORAGE

### Current State
**File:** `tonyblanco-app/lib/patient-storage.ts`

**Existing Functions:**
- `savePatient()`, `loadAllPatients()`, `getPatient()`, etc.
- **Storage:** localStorage (`therapist_patients` key)
- **Purpose:** Legacy local-only storage for patient data
- **Type:** Frontend-only, NOT synced with backend

**⚠️ IMPORTANT:**
- This is LOCALSTORAGE-BASED, not backend-synced
- Uses custom `PatientInfo` type with string IDs like `"PAT-1234567890-abc123"`
- NOT the same as backend Patient model (which has integer IDs)
- We should create NEW active patient context storage (separate from this legacy system)

### No Existing Active Patient Context Found
- No React Context for active patient
- No query param pattern (`?patient_id=`) found in current therapist dashboard
- No centralized active patient state management

---

## 📝 EXECUTION MODE SUMMARY

### Two Execution Modes (Immutable)
1. **`patient_self`**
   - Tests: `available_for_personal=True` (may also have `available_for_therapists=True`)
   - Execution: No `patient_id` in request
   - Allowed roles: `patient`, `personal`
   - Blocked roles: `therapist`, `admin`

2. **`therapist_clinical`**
   - Tests: `available_for_therapists=True` (and typically `available_for_personal=False`)
   - Execution: `patient_id` required in request
   - Allowed roles: `therapist` only
   - Blocked roles: `admin`, `personal`, `patient`

---

## 🎯 FINDINGS SUMMARY

### ✅ Available
1. ✅ User session fetching: `/api/me/` via `fetchSession()`
2. ✅ Therapist patients list: `/api/therapist/patients/`
3. ✅ Test catalog: `/api/tests/` (filtered by role)
4. ✅ Test results: `/api/tests/results/` (filtered by ownership)
5. ✅ Patient previous tests: `/api/tests/patient-previous/?patient_id=...`
6. ✅ API clients: `lib/api.ts`, `lib/test-api.ts`

### ⚠️ Gaps/Questions
1. **Test Assignment:**
   - `POST /api/tests/grant-access/` exists but is ADMIN-ONLY
   - Uses `user_id` (User model), not `patient_id` (Patient model)
   - Need to verify if patients have linked User accounts or need different approach

2. **Active Patient Context:**
   - No existing implementation found
   - Need to create from scratch (localStorage-based)

3. **Patient Model Structure:**
   - Need to verify Patient model fields and relationship to User model
   - Backend filters patients by `therapist=request.user`

---

## 📁 KEY FILES REFERENCED

**Frontend:**
- `tonyblanco-app/lib/session.ts` - Session fetching
- `tonyblanco-app/lib/getUserRole.ts` - Role extraction
- `tonyblanco-app/lib/api.ts` - Base API client
- `tonyblanco-app/lib/test-api.ts` - Test API client
- `tonyblanco-app/lib/patient-storage.ts` - Legacy localStorage (NOT for active patient)

**Backend:**
- `backend/api/urls.py` - All endpoint URLs
- `backend/api/views.py` - Patient endpoints (PatientListCreateView, PatientDetailView)
- `backend/api/test_views.py` - All test-related endpoints
- `backend/api/models.py` - Patient model definition (to verify structure)

---

## ✅ NEXT STEPS (PHASE 1)

1. Create `lib/active-patient.ts` with localStorage + in-memory storage
2. Create `components/ActivePatientIndicator.tsx`
3. Update `/dashboard/therapist/page.tsx` to show active patient indicator

---

**Discovery Complete** ✅  
**Ready for Phase 1** 🚀
