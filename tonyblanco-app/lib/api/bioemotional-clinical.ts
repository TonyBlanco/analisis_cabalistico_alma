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

const OBSERVATIONS_URL = `${API_BASE_URL}/bioemotional/observations/`;
const HYPOTHESES_URL = `${API_BASE_URL}/bioemotional/hypotheses/`;

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
