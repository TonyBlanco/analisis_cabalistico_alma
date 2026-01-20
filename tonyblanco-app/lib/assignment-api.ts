/**
 * Test Assignment API Client
 * 
 * Functions to assign tests to patients.
 * 
 * NOTE: Currently uses grant-access endpoint which is admin-only.
 * This may need backend changes to allow therapists to assign tests.
 * For now, we'll implement the UI and handle errors appropriately.
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

export interface AssignTestRequest {
  patient_id: number;
  test_code: string;
  execution_mode?: string;
}

export interface AssignTestResponse {
  success: boolean;
  message: string;
}

export interface UnassignTestResponse {
  success: boolean;
  message: string;
}

export interface AssignmentPayload {
  id: number;
  patient_id: number;
  test_type: string;
  assigned_by_user_id: number;
  assigned_to_user_id: number;
  questions_count: number;
  times_assigned: number;
  max_reassign: number;
  status: string;
  locked: boolean;
  created_at: string | null;
  completed_at: string | null;
  questions?: string[];
  audit_log?: any[];
  results?: any;
}

export async function createAssignment(params: {
  patient_id: number;
  assigned_to_user_id: number;
  test_type?: string;
  n_questions?: number;
}): Promise<AssignmentPayload> {
  const payload = {
    patient_id: params.patient_id,
    assigned_to_user_id: params.assigned_to_user_id,
    test_type: params.test_type || 'mcmi4-mystic',
    n_questions: params.n_questions || 195,
  };

  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Try to get JSON error first, otherwise include raw text for better debugging
    let detail = '';
    try {
      const errorData = await response.json();
      detail = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch (e) {
      // non-JSON response (e.g., HTML traceback) - include text
      try {
        detail = await response.text();
      } catch (e2) {
        detail = `HTTP ${response.status}`;
      }
    }
    throw new Error(`Error al crear asignacion: ${detail} (status ${response.status})`);
  }

  return response.json();
}

export async function listAssignments(params: {
  patient_id: number;
  test_type?: string;
}): Promise<AssignmentPayload[]> {
  const searchParams = new URLSearchParams({ patient_id: String(params.patient_id) });
  if (params.test_type) {
    searchParams.set('test_type', params.test_type);
  }

  const response = await fetch(`${API_BASE_URL}/assignments?${searchParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || 'Error al obtener asignaciones';
    throw new Error(`${message} (status ${response.status})`);
  }

  return response.json();
}

export async function getAssignment(assignmentId: number): Promise<AssignmentPayload> {
  const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || 'Error al obtener asignacion';
    throw new Error(`${message} (status ${response.status})`);
  }

  return response.json();
}

export async function deleteAssignment(assignmentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || 'Error al eliminar asignacion';
    throw new Error(`${message} (status ${response.status})`);
  }
}

export async function getAssignmentResults(assignmentId: number): Promise<AssignmentPayload> {
  const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/results`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || 'Error al obtener resultados';
    throw new Error(`${message} (status ${response.status})`);
  }

  return response.json();
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
    // Try to parse JSON error body, fallback to text
    let errorData: any = {};
    let rawText = '';
    try {
      errorData = await response.json().catch(() => ({}));
    } catch (e) {
      // ignore
    }
    try {
      rawText = await response.text();
    } catch (e) {
      rawText = '';
    }

    const baseMsg = errorData.message || errorData.error || (rawText && rawText.length ? rawText : null) || 'Error al asignar test';

    if (response.status === 403) {
      // Check for specific error messages
      if (String(baseMsg).includes('administradores no pueden')) {
        throw new Error('Los administradores no pueden asignar tests a pacientes. Solo los terapeutas pueden gestionar sus propios pacientes.');
      }
      if (String(baseMsg).includes('tests clínicos') || String(baseMsg).includes('therapist_clinical')) {
        throw new Error('No se pueden asignar tests clínicos a pacientes. Solo tests patient_self pueden ser asignados.');
      }
      throw new Error(baseMsg + ` (status ${response.status})`);
    }

    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
    }
    if (response.status === 404) {
      throw new Error((errorData.message || errorData.error || 'Paciente o test no encontrado.') + ` (status ${response.status})`);
    }

    throw new Error(baseMsg + ` (status ${response.status})`);
  }

  return response.json();
}

/**
 * Unassign a patient_self test from a patient (therapist only).
 */
export async function unassignTestFromPatient(
  patientId: number,
  testCode: string,
  deleteCompleted: boolean = false
): Promise<UnassignTestResponse> {
  const payload = {
    patient_id: patientId,
    test_code: testCode,
    delete_completed: deleteCompleted,
  };

  const response = await fetch(`${API_BASE_URL}/tests/unassign-from-patient/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorData: any = {};
    let rawText = '';
    try {
      errorData = await response.json().catch(() => ({}));
    } catch (e) {
      // ignore
    }
    try {
      rawText = await response.text();
    } catch (e) {
      rawText = '';
    }

    const baseMsg = errorData.message || errorData.error || (rawText && rawText.length ? rawText : null) || 'Error al quitar test';

    if (response.status === 403) {
      throw new Error(baseMsg + ` (status ${response.status})`);
    }
    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesi\u00f3n nuevamente.');
    }
    if (response.status === 404) {
      throw new Error((errorData.message || errorData.error || 'Paciente o test no encontrado.') + ` (status ${response.status})`);
    }

    throw new Error(baseMsg + ` (status ${response.status})`);
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
