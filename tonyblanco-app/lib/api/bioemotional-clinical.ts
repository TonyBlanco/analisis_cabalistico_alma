import { API_BASE_URL, getAuthToken } from "../api";

export type HypothesisStatus = "open" | "in_review" | "discarded";

export interface BioEmotionalObservationPayload {
  patient_id: number;
  note_text: string;
  region_id?: string | null;
  dictionary_term_slug?: string | null;
}

export interface BioEmotionalObservation {
  id: string;
  therapist_id: number;
  patient_id: number;
  region_id: string | null;
  dictionary_term_slug: string | null;
  note_text: string;
  created_at: string;
}

export interface BioEmotionalHypothesisPayload {
  patient_id: number;
  title: string;
  description: string;
  related_region_id?: string | null;
  related_dictionary_term?: string | null;
  status: HypothesisStatus;
}

export interface BioEmotionalHypothesis {
  id: string;
  therapist_id: number;
  patient_id: number;
  title: string;
  description: string;
  related_region_id: string | null;
  related_dictionary_term: string | null;
  status: HypothesisStatus;
  created_at: string;
  updated_at: string;
}

export interface BioEmotionalSynthesisPayload {
  patient_id: number;
  text: string;
}

export interface BioEmotionalSynthesis {
  id: string;
  therapist_id: number;
  patient_id: number;
  text: string;
  created_at: string;
  is_closed: boolean;
}

export interface AssistedDiagnosisBasedOn {
  type: "observation" | "hypothesis" | "synthesis" | "dictionary_quote";
  id: string;
}

export interface AssistedDiagnosisPayload {
  patient_id: number;
  content: string;
  based_on: AssistedDiagnosisBasedOn[];
  prompt_version: string;
}


export interface BioEmotionalPatientBriefPayload {
  patient_id: number;
  title: string;
  content: string;
  sources: Array<{ type: string; id: string }>;
}

export interface BioEmotionalPatientBrief {
  id: string;
  therapist_id: number;
  patient_id: number;
  title: string;
  content: string;
  sources: Array<{ type: string; id: string }>;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
}

export interface BioEmotionalPatientBriefRead {
  id: string;
  title: string;
  content: string;
  published_at: string | null;
  updated_at: string;
}
export interface AssistedDiagnosisRecord {
  id: string;
  therapist_id: number;
  patient_id: number;
  content: string;
  based_on: AssistedDiagnosisBasedOn[];
  prompt_version: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

const OBSERVATIONS_URL = `${API_BASE_URL}/bioemotional/observations/`;
const HYPOTHESES_URL = `${API_BASE_URL}/bioemotional/hypotheses/`;
const SYNTHESIS_URL = `${API_BASE_URL}/bioemotional/synthesis/`;
const ASSISTED_DIAGNOSIS_URL = `${API_BASE_URL}/bioemotional/assisted-diagnosis/`;
const PATIENT_BRIEF_URL = `${API_BASE_URL}/bioemotional/patient-brief/`;
const MY_BRIEFS_URL = `${API_BASE_URL}/bioemotional/my-briefs/`;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(url, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Error ${response.status}: No se pudo conectar con el servidor`,
    }));
    const errorMsg = error.message || error.detail || `Error: ${response.status}`;
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function listObservations(patientId: number): Promise<BioEmotionalObservation[]> {
  const url = `${OBSERVATIONS_URL}?patient_id=${patientId}`;
  return request<BioEmotionalObservation[]>(url);
}

export async function createObservation(
  payload: BioEmotionalObservationPayload
): Promise<BioEmotionalObservation> {
  return request<BioEmotionalObservation>(OBSERVATIONS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listHypotheses(patientId: number): Promise<BioEmotionalHypothesis[]> {
  const url = `${HYPOTHESES_URL}?patient_id=${patientId}`;
  return request<BioEmotionalHypothesis[]>(url);
}

export async function createHypothesis(
  payload: BioEmotionalHypothesisPayload
): Promise<BioEmotionalHypothesis> {
  return request<BioEmotionalHypothesis>(HYPOTHESES_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHypothesis(
  id: string,
  payload: Partial<BioEmotionalHypothesisPayload>
): Promise<BioEmotionalHypothesis> {
  return request<BioEmotionalHypothesis>(`${HYPOTHESES_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createSynthesis(
  payload: BioEmotionalSynthesisPayload
): Promise<BioEmotionalSynthesis> {
  return request<BioEmotionalSynthesis>(SYNTHESIS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeSynthesis(id: string): Promise<BioEmotionalSynthesis> {
  return request<BioEmotionalSynthesis>(`${SYNTHESIS_URL}${id}/close/`, {
    method: "PATCH",
  });
}

export async function listAssistedDiagnosis(
  patientId: number
): Promise<AssistedDiagnosisRecord[]> {
  const url = `${ASSISTED_DIAGNOSIS_URL}?patient_id=${patientId}`;
  return request<AssistedDiagnosisRecord[]>(url);
}

export async function createAssistedDiagnosis(
  payload: AssistedDiagnosisPayload
): Promise<AssistedDiagnosisRecord> {
  return request<AssistedDiagnosisRecord>(ASSISTED_DIAGNOSIS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function validateAssistedDiagnosis(
  id: string
): Promise<AssistedDiagnosisRecord> {
  return request<AssistedDiagnosisRecord>(`${ASSISTED_DIAGNOSIS_URL}${id}/validate/`, {
    method: "PATCH",
  });
}


export async function listPatientBriefs(patientId: number): Promise<BioEmotionalPatientBrief[]> {
  const url = `${PATIENT_BRIEF_URL}?patient_id=${patientId}`;
  return request<BioEmotionalPatientBrief[]>(url);
}

export async function createPatientBrief(
  payload: BioEmotionalPatientBriefPayload
): Promise<BioEmotionalPatientBrief> {
  return request<BioEmotionalPatientBrief>(PATIENT_BRIEF_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishPatientBrief(id: string): Promise<BioEmotionalPatientBrief> {
  return request<BioEmotionalPatientBrief>(`${PATIENT_BRIEF_URL}${id}/publish/`, {
    method: "PATCH",
  });
}

export async function listMyBriefs(): Promise<BioEmotionalPatientBriefRead[]> {
  return request<BioEmotionalPatientBriefRead[]>(MY_BRIEFS_URL);
}

// =============================================================================
// BioEmotional Sessions - Simbiosis Consultante ↔ Terapeuta
// =============================================================================

export type EmotionalState = "better" | "same" | "worse" | "unknown";

export interface BioEmotionalSession {
  id: string;
  therapist_id: number | null;
  patient_id: number;
  patient_name: string;
  date: string;
  emotional_state: EmotionalState;
  observations_count: number;
  hypotheses_count: number;
  synthesis_completed: boolean;
  regions_observed: string[];
  heatmap_data: Record<string, number>;
  patient_notes: string;
  patient_feeling_score: number | null;
  patient_discomfort_regions: string[];
  is_closed: boolean;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BioEmotionalSessionListItem {
  id: string;
  patient_id: number;
  patient_name: string;
  date: string;
  emotional_state: EmotionalState;
  observations_count: number;
  hypotheses_count: number;
  synthesis_completed: boolean;
  regions_observed: string[];
  is_closed: boolean;
}

export interface BioEmotionalSessionCreatePayload {
  patient_id: number;
  emotional_state?: EmotionalState;
  patient_notes?: string;
  patient_feeling_score?: number;
  patient_discomfort_regions?: string[];
}

export interface BioEmotionalSessionUpdatePayload {
  emotional_state?: EmotionalState;
  synthesis_completed?: boolean;
  regions_observed?: string[];
  heatmap_data?: Record<string, number>;
}

export interface BioEmotionalSessionPatientInputPayload {
  patient_notes?: string;
  patient_feeling_score?: number | null;
  patient_discomfort_regions?: string[];
}

const SESSIONS_URL = `${API_BASE_URL}/bioemotional/sessions/`;
const MY_SESSIONS_URL = `${API_BASE_URL}/bioemotional/sessions/my/`;
const MY_CURRENT_SESSION_URL = `${API_BASE_URL}/bioemotional/sessions/my/current/`;

// --- Funciones para Terapeuta ---

/**
 * Lista sesiones de un paciente (solo terapeuta).
 */
export async function listSessions(patientId?: number): Promise<BioEmotionalSessionListItem[]> {
  const url = patientId ? `${SESSIONS_URL}?patient_id=${patientId}` : SESSIONS_URL;
  return request<BioEmotionalSessionListItem[]>(url);
}

/**
 * Crea una nueva sesión para un paciente (solo terapeuta).
 */
export async function createSession(
  payload: BioEmotionalSessionCreatePayload
): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(SESSIONS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Obtiene el detalle de una sesión por ID (solo terapeuta).
 */
export async function getSession(sessionId: string): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(`${SESSIONS_URL}${sessionId}/`);
}

/**
 * Obtiene la sesión activa de un paciente específico (solo terapeuta).
 */
export async function getActiveSessionForPatient(patientId: number): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(`${SESSIONS_URL}active/${patientId}/`);
}

/**
 * Actualiza una sesión existente (solo terapeuta).
 */
export async function updateSession(
  sessionId: string,
  payload: BioEmotionalSessionUpdatePayload
): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(`${SESSIONS_URL}${sessionId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Cierra una sesión (solo terapeuta).
 */
export async function closeSession(sessionId: string): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(`${SESSIONS_URL}${sessionId}/close/`, {
    method: "PATCH",
  });
}

/**
 * Elimina una sesión (solo terapeuta).
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await request<void>(`${SESSIONS_URL}${sessionId}/`, {
    method: "DELETE",
  });
}

// --- Funciones para Consultante (Paciente) ---

/**
 * Lista el historial de sesiones del consultante autenticado.
 */
export async function listMySessions(): Promise<BioEmotionalSessionListItem[]> {
  return request<BioEmotionalSessionListItem[]>(MY_SESSIONS_URL);
}

/**
 * Obtiene la sesión actual abierta del consultante.
 */
export async function getMyCurrentSession(): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(MY_CURRENT_SESSION_URL);
}

/**
 * Actualiza las notas y síntomas del consultante para la sesión actual.
 */
export async function updateMySessionInput(
  payload: BioEmotionalSessionPatientInputPayload
): Promise<BioEmotionalSession> {
  return request<BioEmotionalSession>(MY_CURRENT_SESSION_URL, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
// =============================================================================
// SWM Analytics Integration - Export & Correlation
// =============================================================================

const EXPORT_URL = `${API_BASE_URL}/bioemotional/export/`;
const MSHE_IMPORT_URL = `${API_BASE_URL}/bioemotional/mshe-import/`;
const SCID5_CORRELATE_URL = `${API_BASE_URL}/bioemotional/scid5-correlate/`;

// --- Tipos para integración SWM ---

export interface RegionRanking {
  region_id: string;
  observation_count: number;
  avg_intensity: number;
  dominant_emotion: string | null;
}

export interface EmotionalTrend {
  date: string;
  state: EmotionalState;
  feeling_score: number | null;
}

export interface SessionSummaryExport {
  id: string;
  date: string;
  emotional_state: EmotionalState;
  observations_count: number;
  hypotheses_count: number;
  synthesis_completed: boolean;
  regions_observed: string[];
}

export interface BioEmotionalExportData {
  patient_id: number;
  patient_name: string;
  sessions_summary: SessionSummaryExport[];
  top_regions: RegionRanking[];
  emotional_trends: EmotionalTrend[];
  heatmap_aggregate: Record<string, number>;
  total_sessions: number;
  total_observations: number;
  total_hypotheses: number;
  export_timestamp: string;
}

export interface MSHEImportResult {
  integrated: boolean;
  new_weight_contribution: number;
  bioemotional_snapshot_id: string;
  message: string;
}

export type CorrelationStrength = "low" | "medium" | "high";

export type SCID5SectionKey =
  | "emotional_vitality"
  | "anxiety_calm"
  | "meaning_reality"
  | "impact_memory"
  | "self_regulation"
  | "identity_relationships";

export interface SCID5CorrelationResult {
  section_key: SCID5SectionKey;
  correlation_strength: number;  // 0-1 float, not string
  regions_matched: string[];
  matched_regions: Array<{ region: string; count: number }>;  // For UI display
  suggested_notes: string;
  clinical_notes?: string;  // Optional notes from correlation
  confidence_score: number;
}

export interface SCID5CorrelationPayload {
  patient_id: number;
  section_key: SCID5SectionKey;
  bioemotional_regions?: string[];
}

// --- Funciones de integración SWM ---

/**
 * Exporta datos BioEmotional agregados para integración con SWM Analytics.
 * Incluye resumen de sesiones, ranking de regiones, tendencias emocionales.
 */
export async function exportForSWM(patientId: number): Promise<BioEmotionalExportData> {
  return request<BioEmotionalExportData>(`${EXPORT_URL}${patientId}/`);
}

/**
 * Importa snapshot BioEmotional para integración con MSHE.
 * Crea una referencia del estado BioEmotional actual para síntesis holística.
 */
export async function importToMSHE(patientId: number): Promise<MSHEImportResult> {
  return request<MSHEImportResult>(MSHE_IMPORT_URL, {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId }),
  });
}

/**
 * Correlaciona datos BioEmotional con una sección SCID-5.
 * Retorna fuerza de correlación y notas sugeridas.
 */
export async function correlateSCID5(
  payload: SCID5CorrelationPayload
): Promise<SCID5CorrelationResult> {
  return request<SCID5CorrelationResult>(SCID5_CORRELATE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Obtiene correlación para todas las secciones SCID-5 de un paciente.
 */
export async function correlateSCID5AllSections(
  patientId: number,
  regions?: string[]
): Promise<Record<SCID5SectionKey, SCID5CorrelationResult>> {
  const sections: SCID5SectionKey[] = [
    "emotional_vitality",
    "anxiety_calm",
    "meaning_reality",
    "impact_memory",
    "self_regulation",
    "identity_relationships",
  ];

  const results: Record<string, SCID5CorrelationResult> = {};

  for (const section of sections) {
    const result = await correlateSCID5({
      patient_id: patientId,
      section_key: section,
      bioemotional_regions: regions,
    });
    results[section] = result;
  }

  return results as Record<SCID5SectionKey, SCID5CorrelationResult>;
}