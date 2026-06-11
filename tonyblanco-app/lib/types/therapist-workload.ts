/** Payload de GET /api/therapist/dashboard/ — bloque workload (contrato D1). */

export type TherapyStatus = 'active' | 'paused' | 'inactive' | 'archived';

export type TherapyLevel = 'assiyah' | 'yetzirah' | 'beriah' | null;

export type TestWorkloadStatus = 'assigned' | 'pending' | 'completed';

export type PatientActionItemType = 'test_pending' | 'profile_incomplete';

export type GlobalActionItemType = 'completed_unreviewed';

export interface TherapistWorkloadSummary {
  patients_active: number;
  tests_assigned_total: number;
  tests_pending_total: number;
  tests_completed_total: number;
  action_items_total: number;
}

export interface TherapistWorkloadTestCounts {
  assigned: number;
  pending: number;
  completed: number;
}

export interface TherapistWorkloadTestRecent {
  assignment_id: number | null;
  test_module_id: number | null;
  test_code: string;
  test_name: string;
  status: 'pending' | 'completed';
  result_id: number | null;
  assigned_at: string | null;
  completed_at: string | null;
}

export interface TherapistWorkloadProgress {
  stage: TherapyLevel;
  sessions_count: number;
  last_activity_at: string | null;
}

export interface TherapistWorkloadPatientActionItem {
  type: PatientActionItemType;
  label: string;
  href: string;
}

export interface TherapistWorkloadPatient {
  id: number;
  display_name: string;
  therapy_status: TherapyStatus;
  therapy_level: TherapyLevel;
  has_login: boolean;
  profile_complete: boolean;
  last_session_at: string | null;
  sessions_count: number;
  tests: TherapistWorkloadTestCounts;
  tests_recent: TherapistWorkloadTestRecent[];
  progress: TherapistWorkloadProgress;
  action_items: TherapistWorkloadPatientActionItem[];
}

export interface TherapistWorkloadGlobalActionItem {
  type: GlobalActionItemType;
  patient_id: number;
  patient_display_name: string;
  test_code: string;
  test_name: string;
  result_id: number;
  label: string;
  href: string;
}

export interface TherapistWorkload {
  summary: TherapistWorkloadSummary;
  patients: TherapistWorkloadPatient[];
  action_items: TherapistWorkloadGlobalActionItem[];
}

/** Respuesta completa de GET /api/therapist/dashboard/ (legacy + workload). */
export interface TherapistDashboardResponse {
  total_patients: number;
  sessions_this_month: number;
  fichas_this_month: number;
  recent_sessions: unknown[];
  subscription_status: string;
  subscription_end_date: string | null;
  workload: TherapistWorkload;
}