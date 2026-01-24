/**
 * Cábala Aplicada SWM API Client
 * 
 * Typed client for the Tree of Life workspace backend.
 */

import { API_BASE_URL, getAuthToken } from '../api';

const SWM_CABALA_BASE = `${API_BASE_URL}/swm/cabala`;

// ============================================================================
// TYPES
// ============================================================================

export type SefirahName = 
  | 'keter' | 'chokhmah' | 'binah' 
  | 'chesed' | 'gevurah' | 'tiferet' 
  | 'netzach' | 'hod' | 'yesod' | 'malkhut' | 'daat';

export type EmotionType = 
  | 'joy' | 'sadness' | 'anger' | 'fear' | 'love' 
  | 'guilt' | 'shame' | 'peace' | 'anxiety' | 'grief' 
  | 'hope' | 'despair' | 'other';

export type FlowDirection = 'ascending' | 'descending' | 'balanced';

export type CabalaMethod = 
  | 'numerologia' | 'tarot' | 'astrologia' 
  | 'gematria' | 'meditacion' | 'bioemotional' | 'libre';

export type SessionStatus = 'created' | 'in_progress' | 'paused' | 'closed' | 'archived';

export interface SefirahObservation {
  id: string;
  session: string;
  sefirah_name: SefirahName;
  sefirah_display: string;
  observation: string;
  intensity: number;
  emotion_type: EmotionType;
  emotion_display: string;
  is_blocked: boolean;
  is_activated: boolean;
  created_at: string;
  updated_at: string;
}

export interface PathObservation {
  id: string;
  session: string;
  path_index: number;
  path_display: string;
  flow_direction: FlowDirection;
  flow_display: string;
  observation: string;
  is_blocked: boolean;
  is_active: boolean;
  tarot_card: string;
  created_at: string;
  updated_at: string;
}

export interface CabalaSessionSnapshot {
  id: string;
  session: string;
  tree_state: Record<string, unknown>;
  notes: string;
  created_at: string;
}

export interface CabalaSessionListItem {
  id: string;
  patient: number;
  patient_username: string;
  therapist: number;
  therapist_username: string;
  title: string;
  method_id: CabalaMethod;
  method_display: string;
  status: SessionStatus;
  status_display: string;
  is_closed: boolean;
  duration_minutes: number;
  observation_count: number;
  created_at: string;
  updated_at: string;
}

export interface CabalaSessionDetail extends CabalaSessionListItem {
  tree_state: Record<string, unknown>;
  session_notes: string;
  clinical_context: Record<string, unknown>;
  sefirah_observations: SefirahObservation[];
  path_observations: PathObservation[];
  started_at: string | null;
  closed_at: string | null;
}

export interface TreeState {
  session_id: string;
  tree_state: Record<string, unknown>;
  updated_at: string;
}

export interface ChoiceItem {
  value: string | number;
  label: string;
}

export interface CabalaChoices {
  sefirot: ChoiceItem[];
  paths: ChoiceItem[];
  methods: ChoiceItem[];
  emotions: ChoiceItem[];
  flow_directions: ChoiceItem[];
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateSessionRequest {
  patient: number;
  title?: string;
  method_id?: CabalaMethod;
  tree_state?: Record<string, unknown>;
  session_notes?: string;
  clinical_context?: Record<string, unknown>;
}

export interface UpdateSessionRequest {
  title?: string;
  tree_state?: Record<string, unknown>;
  session_notes?: string;
  clinical_context?: Record<string, unknown>;
}

export interface UpdateTreeStateRequest {
  tree_state: Record<string, unknown>;
  create_snapshot?: boolean;
  snapshot_notes?: string;
}

export interface CreateSefirahObservationRequest {
  session_id: string;
  sefirah_name: SefirahName;
  observation: string;
  intensity?: number;
  emotion_type?: EmotionType;
  is_blocked?: boolean;
  is_activated?: boolean;
}

export interface CreatePathObservationRequest {
  session_id: string;
  path_index: number;
  flow_direction?: FlowDirection;
  observation?: string;
  is_blocked?: boolean;
  is_active?: boolean;
  tarot_card?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

function buildHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// SESSION API
// ============================================================================

export async function listCabalaSessions(patientId?: number): Promise<CabalaSessionListItem[]> {
  const params = new URLSearchParams();
  if (patientId) params.set('patient_id', String(patientId));
  
  const url = `${SWM_CABALA_BASE}/sessions/${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaSessionListItem[]>(response);
}

export async function createCabalaSession(data: CreateSessionRequest): Promise<CabalaSessionDetail> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/create/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return handleResponse<CabalaSessionDetail>(response);
}

export async function getCabalaSession(sessionId: string): Promise<CabalaSessionDetail> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaSessionDetail>(response);
}

export async function updateCabalaSession(
  sessionId: string,
  data: UpdateSessionRequest
): Promise<CabalaSessionDetail> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/update/`, {
    method: 'PATCH',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return handleResponse<CabalaSessionDetail>(response);
}

export async function startCabalaSession(sessionId: string): Promise<CabalaSessionDetail> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/start/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaSessionDetail>(response);
}

export async function closeCabalaSession(sessionId: string): Promise<CabalaSessionDetail> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/close/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaSessionDetail>(response);
}

// ============================================================================
// TREE STATE API
// ============================================================================

export async function getTreeState(sessionId: string): Promise<TreeState> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/tree-state/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<TreeState>(response);
}

export async function updateTreeState(
  sessionId: string,
  data: UpdateTreeStateRequest
): Promise<TreeState> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/tree-state/`, {
    method: 'PATCH',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return handleResponse<TreeState>(response);
}

// ============================================================================
// SEFIRAH OBSERVATION API
// ============================================================================

export async function listSefirahObservations(sessionId: string): Promise<SefirahObservation[]> {
  const response = await fetch(`${SWM_CABALA_BASE}/sefirot/${sessionId}/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<SefirahObservation[]>(response);
}

export async function createSefirahObservation(
  data: CreateSefirahObservationRequest
): Promise<SefirahObservation> {
  const response = await fetch(`${SWM_CABALA_BASE}/sefirot/observe/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return handleResponse<SefirahObservation>(response);
}

export async function deleteSefirahObservation(observationId: string): Promise<void> {
  const response = await fetch(`${SWM_CABALA_BASE}/sefirot/${observationId}/delete/`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
  }
}

// ============================================================================
// PATH OBSERVATION API
// ============================================================================

export async function listPathObservations(sessionId: string): Promise<PathObservation[]> {
  const response = await fetch(`${SWM_CABALA_BASE}/paths/${sessionId}/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<PathObservation[]>(response);
}

export async function createPathObservation(
  data: CreatePathObservationRequest
): Promise<PathObservation> {
  const response = await fetch(`${SWM_CABALA_BASE}/paths/observe/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  return handleResponse<PathObservation>(response);
}

// ============================================================================
// SNAPSHOT API
// ============================================================================

export async function listSessionSnapshots(sessionId: string): Promise<CabalaSessionSnapshot[]> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/snapshots/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaSessionSnapshot[]>(response);
}

export async function createSessionSnapshot(
  sessionId: string,
  notes?: string
): Promise<CabalaSessionSnapshot> {
  const response = await fetch(`${SWM_CABALA_BASE}/sessions/${sessionId}/snapshots/create/`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({ notes: notes || '' }),
  });
  
  return handleResponse<CabalaSessionSnapshot>(response);
}

// ============================================================================
// CHOICES API
// ============================================================================

export async function getCabalaChoices(): Promise<CabalaChoices> {
  const response = await fetch(`${SWM_CABALA_BASE}/choices/`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });
  
  return handleResponse<CabalaChoices>(response);
}

// ============================================================================
// AGGREGATED API OBJECT
// ============================================================================

export const swmCabalaApi = {
  // Sessions
  listSessions: listCabalaSessions,
  createSession: createCabalaSession,
  getSession: getCabalaSession,
  updateSession: updateCabalaSession,
  startSession: startCabalaSession,
  closeSession: closeCabalaSession,
  
  // Tree State
  getTreeState,
  updateTreeState,
  
  // Sefirah Observations
  listSefirot: listSefirahObservations,
  observeSefirah: createSefirahObservation,
  deleteSefirahObservation,
  
  // Path Observations
  listPaths: listPathObservations,
  observePath: createPathObservation,
  
  // Snapshots
  listSnapshots: listSessionSnapshots,
  createSnapshot: createSessionSnapshot,
  
  // Metadata
  getChoices: getCabalaChoices,
};

export default swmCabalaApi;
