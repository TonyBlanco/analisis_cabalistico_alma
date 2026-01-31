import { TestModule, TestResult, ExecuteTestRequest, ExecuteTestResponse, UserTestStats } from './test-types';
import { getApiBaseUrl } from './api-base';
import { resolveConsultanteByLegacyId } from './consultante-api';

export type { ExecuteTestRequest, ExecuteTestResponse };

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

/**
 * Obtiene todos los tests disponibles para el usuario actual
 */
export async function getAvailableTests(patientId?: number): Promise<{
  tests: TestModule[];
  user_type: string;
  subscription_plan: string;
  membership_active: boolean;
}> {
  let pid = patientId;
  if (patientId) {
    try {
      const resolved = await resolveConsultanteByLegacyId(patientId);
      if (resolved && resolved.user_id) pid = resolved.user_id;
    } catch (e) {
      // ignore and keep original patientId
    }
  }

  const query = pid ? `?patient_id=${encodeURIComponent(pid)}` : '';
  const response = await fetch(`${API_BASE_URL}/tests/${query}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al obtener tests disponibles');
  }

  return response.json();
}

/**
 * Obtiene el detalle de un test específico
 */
export async function getTestDetail(code: string): Promise<TestModule> {
  const response = await fetch(`${API_BASE_URL}/tests/${code}/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener detalle del test');
  }

  return response.json();
}

/**
 * Ejecuta un test
 * 
 * IMPORTANT: This function should check profile completion before executing
 * if the test requires birth data (astrology, cabalistic analysis).
 * Use checkProfileBeforeAnalysis() from profile-validation.ts
 */
export async function executeTest(data: ExecuteTestRequest): Promise<ExecuteTestResponse> {
  const url = `${API_BASE_URL}/tests/execute/`;
  console.log('🔍 Ejecutando test en:', url);

  // Prepare payload - include patient_id if provided
  const payload: any = {
    test_module_code: data.test_module_code,
    input_data: data.input_data,
    save_result: data.save_result !== false, // Default to true
  };

  if (data.patient_id) {
    // resolve legacy patient id to integer user_id when possible
    try {
      const resolved = await resolveConsultanteByLegacyId(data.patient_id as number);
      payload.patient_id = resolved && resolved.user_id ? resolved.user_id : data.patient_id;
    } catch (e) {
      payload.patient_id = data.patient_id;
    }
  }
  if (data.client_name) {
    payload.client_name = data.client_name;
  }
  if (data.client_birth_date) {
    payload.client_birth_date = data.client_birth_date;
  }

  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  console.log('📡 Respuesta del servidor:', response.status, response.statusText);

  if (!response.ok) {
    let errorMessage = 'Error al ejecutar el test';
    let errorData: any = {};

    try {
      const text = await response.text();
      console.log('📄 Respuesta del servidor (texto):', text);

      if (text) {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        if (isJson) {
          errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage;

          // Si hay más detalles, agregarlos
          if (errorData.note) {
            errorMessage += `: ${errorData.note}`;
          }
        } else {
          errorMessage = text;
        }
      }
    } catch (e) {
      console.error('❌ Error parseando respuesta:', e);
      // Si no se puede parsear el error, usar el status text
      if (response.status === 404) {
        errorMessage = `Endpoint no encontrado (404). Verifica que el servidor Django esté corriendo en ${API_BASE_URL}`;
      } else if (response.status === 401) {
        errorMessage = 'No autenticado. Por favor, inicia sesión nuevamente.';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permiso para ejecutar este test.';
      } else {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
    }

    const error = new Error(errorMessage);
    (error as any).response = response;
    (error as any).status = response.status;
    throw error;
  }

  let result: ExecuteTestResponse;
  try {
    const text = await response.text();
    result = text ? JSON.parse(text) : ({} as ExecuteTestResponse);
  } catch (e) {
    const error = new Error(
      `Respuesta no JSON del servidor. Verifica API_BASE_URL (${API_BASE_URL}) y autenticaci¢n.`
    );
    (error as any).response = response;
    (error as any).status = response.status;
    throw error;
  }
  console.log('✅ Test ejecutado exitosamente');
  return result;
}

/**
 * Obtiene todos los resultados guardados del usuario
 */
export async function getTestResults(filters?: {
  test_code?: string;
  favorites?: boolean;
}): Promise<TestResult[]> {
  const params = new URLSearchParams();
  if (filters?.test_code) params.append('test_code', filters.test_code);
  if (filters?.favorites) params.append('favorites', 'true');

  const url = `${API_BASE_URL}/tests/results/${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al obtener resultados');
  }

  return response.json();
}

/**
 * Obtiene resultados guardados para un paciente específico (vista terapeuta).
 * Soporta respuestas paginadas ({ results }) o arrays.
 */
export async function getTestResultsForPatient(params: {
  patient_id: number;
  test_code?: string;
}): Promise<TestResult[]> {
  const queryParams = new URLSearchParams();
  // resolve legacy id
  let pid = params.patient_id;
  try {
    const resolved = await resolveConsultanteByLegacyId(params.patient_id);
    if (resolved && resolved.user_id) pid = resolved.user_id;
  } catch (e) {}

  queryParams.append('patient_id', pid.toString());
  if (params.test_code) queryParams.append('test_code', params.test_code);

  const url = `${API_BASE_URL}/tests/results/?${queryParams.toString()}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener resultados del paciente');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data?.results || []);
}

/**
 * Obtiene un resultado específico
 */
export async function getTestResult(id: string | number): Promise<TestResult> {
  const response = await fetch(`${API_BASE_URL}/tests/results/${id}/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al obtener resultado');
  }

  return response.json();
}

/**
 * Alias para getTestResult (para compatibilidad)
 */
export async function getTestResultDetail(id: string | number): Promise<TestResult> {
  return getTestResult(id);
}

/**
 * Actualiza un resultado (notas, favorito, etc.)
 */
export async function updateTestResult(
  id: string | number,
  data: Partial<TestResult>
): Promise<TestResult> {
  const response = await fetch(`${API_BASE_URL}/tests/results/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar resultado');
  }

  return response.json();
}

/**
 * Elimina (archiva) un resultado
 */
export async function deleteTestResult(id: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tests/results/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar resultado');
  }
}

/**
 * Obtiene estadísticas de uso de tests del usuario
 */
export async function getUserTestStats(): Promise<UserTestStats> {
  const response = await fetch(`${API_BASE_URL}/tests/stats/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }

  return response.json();
}

/**
 * Marca/desmarca un resultado como favorito
 */
export async function toggleFavorite(id: string | number, isFavorite: boolean): Promise<TestResult> {
  return updateTestResult(id, { is_favorite: isFavorite });
}

/**
 * Actualiza las notas de un resultado
 */
export async function updateResultNotes(id: string | number, notes: string): Promise<TestResult> {
  return updateTestResult(id, { notes });
}

/**
 * Busca tests previos de un paciente basándose en nombre y fecha de nacimiento
 */
export async function getPatientPreviousTests(params: {
  patient_id?: number;
  patient_name?: string;
  patient_birth_date?: string;
}): Promise<{ count: number; results: TestResult[] }> {
  const queryParams = new URLSearchParams();
  if (params.patient_id) {
    try {
      const resolved = await resolveConsultanteByLegacyId(params.patient_id);
      const pid = resolved && resolved.user_id ? resolved.user_id : params.patient_id;
      queryParams.append('patient_id', pid.toString());
    } catch (e) {
      queryParams.append('patient_id', params.patient_id.toString());
    }
  }
  if (params.patient_name) queryParams.append('patient_name', params.patient_name);
  if (params.patient_birth_date) queryParams.append('patient_birth_date', params.patient_birth_date);

  const response = await fetch(`${API_BASE_URL}/tests/patient-previous/?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al buscar tests previos del paciente');
  }

  return response.json();
}
