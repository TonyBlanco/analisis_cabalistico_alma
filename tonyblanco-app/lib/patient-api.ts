/**
 * Patient API Client
 * 
 * Functions to interact with patient-related endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

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
  // Additional fields that may be present
  phone?: string;
  birth_city?: string;
  birth_country?: string;
  [key: string]: any;
}

export interface PatientProfileSummary {
  patient_id: number;
  legal_full_name: string | null;
  birth_date: string | null;
  birth_city: string | null;
  birth_country: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone: string | null;
  consent_accepted_at: string | null;
  profile_version?: number | null;
  name_change_count?: number | null;
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

export interface PatientProfileUpdatePayload {
  legal_full_name?: string | null;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_city?: string | null;
  birth_country?: string | null;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
}

/**
 * Actualiza el perfil de UserProfile del paciente (contexto terapeuta).
 */
export async function updatePatientProfile(
  patientId: number,
  payload: PatientProfileUpdatePayload,
): Promise<PatientProfileSummary> {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/profile/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || 'Error al actualizar el perfil del paciente',
    );
  }

  return response.json();
}
