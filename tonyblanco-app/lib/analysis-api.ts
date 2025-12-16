/**
 * AnalysisRecord API Client
 * 
 * Cliente para endpoints de AnalysisRecord (resultados de análisis).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

export interface AnalysisRecord {
  id: string;
  kind: 'clinical_test' | 'kabbalah' | 'astrology' | 'legacy';
  module_code: string;
  subject_user?: number;
  created_by_user: number;
  role_context: 'therapist' | 'personal' | 'patient';
  execution_mode?: 'patient_self' | 'therapist_clinical';
  patient?: number;
  therapist?: number;
  birth_data_snapshot: Record<string, any>;
  algorithm_snapshot: Record<string, any>;
  raw_input?: Record<string, any>;
  computed_result?: Record<string, any>;
  legacy_output?: Record<string, any>;
  visibility: 'therapist' | 'patient' | 'both';
  therapist_annotations?: {
    summary?: string;
    notes?: string;
    visible_to_patient?: boolean;
  } | null;
  created_at: string;
  test_result?: number;
  cabalistic_analysis?: number;
}

export interface TherapistAnnotations {
  summary?: string;
  notes?: string;
  visible_to_patient?: boolean;
}

/**
 * Obtener resultados del paciente activo (therapist)
 */
export async function getPatientResults(patientId: number): Promise<AnalysisRecord[]> {
  const response = await fetch(`${API_BASE_URL}/analysis-records/?patient_id=${patientId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al obtener resultados del paciente');
  }

  const data = await response.json();
  // El endpoint devuelve un array directamente (ListCreateAPIView)
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * Obtener resultados propios (patient)
 */
export async function getMyResults(): Promise<AnalysisRecord[]> {
  const response = await fetch(`${API_BASE_URL}/analysis-records/my-results/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Error al obtener mis resultados';
    try {
      const error = await response.json();
      errorMessage = error.error || error.detail || errorMessage;
      console.error('Error response:', error);
    } catch (e) {
      console.error('Error parsing response:', e);
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Obtener detalle de un resultado
 */
export async function getAnalysisRecordDetail(recordId: string): Promise<AnalysisRecord> {
  const response = await fetch(`${API_BASE_URL}/analysis-records/${recordId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al obtener detalle del resultado');
  }

  return response.json();
}

/**
 * Actualizar anotaciones del terapeuta (therapist only)
 */
export async function updateAnalysisAnnotations(
  recordId: string,
  annotations: TherapistAnnotations
): Promise<AnalysisRecord> {
  const response = await fetch(`${API_BASE_URL}/analysis-records/${recordId}/annotations/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      therapist_annotations: annotations,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al actualizar anotaciones');
  }

  return response.json();
}
