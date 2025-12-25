/**
 * Patient API Client
 * 
 * Functions to interact with patient-related endpoints.
 */

import { getApiBaseUrl } from './api-base';

const API_BASE_URL = getApiBaseUrl();

// Obtiene el token de autenticación
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Headers con autenticación
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

export interface Patient {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  therapist: number;
  created_at: string;
  updated_at: string;
  // Therapy status (ownership management)
  therapy_status: 'active' | 'paused' | 'inactive' | 'archived';
  pause_reason?: string;
  status_changed_at?: string | null;
  status_changed_by?: number | null;
  is_active: boolean;
  // Additional fields that may be present
  phone?: string;
  birth_city?: string;
  birth_country?: string;
  [key: string]: any;
}

export interface PatientProfileSummary {
  patient_id: number;
  full_name?: string | null;
  legal_full_name: string | null;
  birth_date: string | null;
  birth_time?: string | null;
  birth_city: string | null;
  birth_country: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone: string | null;
  consent_accepted_at: string | null;
  biologicalSex?: 'male' | 'female' | 'intersex' | 'unknown' | 'not_recorded';
  genderIdentity?: 'woman' | 'man' | 'non_binary' | 'other' | 'prefer_not_to_say' | 'not_recorded';
  coordinates_valid?: boolean;
}

/**
 * Fetch list of patients assigned to the current therapist
 * 
 * @returns Array of Patient objects
 * @throws Error if request fails
 */
export async function getTherapistPatients(): Promise<Patient[]> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('No tienes permisos para ver pacientes. Solo los terapeutas pueden acceder a esta funcionalidad.');
    }
    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al obtener lista de pacientes');
  }

  return response.json();
}

/**
 * Obtiene el perfil básico de un paciente (vista terapeuta).
 */
export async function getPatientProfileSummary(
  patientId: number,
): Promise<PatientProfileSummary> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/${patientId}/profile/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || 'Error al obtener el perfil del paciente',
    );
  }

  return response.json();
}

// ========================================
// PATIENT STATUS MANAGEMENT (Therapist Ownership)
// ========================================

export interface PatientStatusUpdatePayload {
  therapy_status: 'active' | 'paused' | 'inactive' | 'archived';
  pause_reason?: string;
}

export interface PatientStatusUpdateResponse {
  message: string;
  patient_id: number;
  patient_name: string;
  therapy_status: string;
  pause_reason: string;
  status_changed_at: string;
  status_changed_by: string;
  is_active: boolean;
}

/**
 * Updates patient therapy status.
 * 
 * Endpoint: PATCH /api/therapist/patients/<id>/status/
 * 
 * Ownership: Therapist can only update their own patients.
 */
export async function updatePatientStatus(
  patientId: number,
  payload: PatientStatusUpdatePayload
): Promise<PatientStatusUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/${patientId}/status/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al actualizar estado del paciente');
  }

  return response.json();
}

/**
 * Archives patient (soft delete).
 * 
 * Endpoint: DELETE /api/therapist/patients/<id>/archive/
 * 
 * Ownership: Therapist can only archive their own patients.
 */
export async function archivePatient(
  patientId: number
): Promise<{ message: string; patient_id: number; therapy_status: string; can_restore: boolean }> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/${patientId}/archive/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al archivar paciente');
  }

  return response.json();
}
