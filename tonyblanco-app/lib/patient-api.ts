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
