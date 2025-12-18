/**
 * Test Assignment API Client
 * 
 * Functions to assign tests to patients.
 * 
 * NOTE: Currently uses grant-access endpoint which is admin-only.
 * This may need backend changes to allow therapists to assign tests.
 * For now, we'll implement the UI and handle errors appropriately.
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

export interface AssignTestRequest {
  patient_id: number;
  test_code: string;
  execution_mode?: string;
}

export interface AssignTestResponse {
  success: boolean;
  message: string;
}

/**
 * Assign a patient_self test to a patient
 * 
 * Uses the therapist-specific endpoint POST /api/tests/assign-to-patient/
 * which allows therapists to assign tests to their own patients.
 * 
 * @param patientId - Patient ID (Patient model)
 * @param testCode - Test module code
 * @returns AssignTestResponse
 * @throws Error if request fails
 */
export async function assignTestToPatient(
  patientId: number,
  testCode: string,
  executionMode?: string
): Promise<AssignTestResponse> {
  const payload = {
    patient_id: patientId,
    test_code: testCode,
    ...(executionMode ? { execution_mode: executionMode } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/tests/assign-to-patient/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || 'No tienes permisos para asignar tests.';
      
      // Check for specific error messages
      if (errorMessage.includes('administradores no pueden')) {
        throw new Error('Los administradores no pueden asignar tests a pacientes. Solo los terapeutas pueden gestionar sus propios pacientes.');
      }
      if (errorMessage.includes('tests clínicos') || errorMessage.includes('therapist_clinical')) {
        throw new Error('No se pueden asignar tests clínicos a pacientes. Solo tests patient_self pueden ser asignados.');
      }
      if (errorMessage.includes('no disponible')) {
        throw new Error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
    }
    if (response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Paciente o test no encontrado.');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al asignar test');
  }

  return response.json();
}

/**
 * Fetch patient detail to get linked User account ID
 * 
 * @param patientId - Patient ID
 * @returns Patient object with user field
 */
export async function getPatientDetail(patientId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/${patientId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('No tienes permisos para ver este paciente.');
    }
    if (response.status === 404) {
      throw new Error('Paciente no encontrado.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al obtener información del paciente');
  }

  return response.json();
}
