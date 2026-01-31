// lib/api/inquiry.ts
import { getAuthToken } from '../auth';
import { getApiBaseUrl } from '../../../lib/api-base';
import type {
  GapsApiResponse,
  SaveResponseRequest,
  CreateBatchRequest,
  CreateBatchResponse,
  ModuleCode,
} from '../../components/inquiry/InquiryWidget.types';

const API_BASE_URL = getApiBaseUrl().replace(/\/api$/, '');

/**
 * Obtener gaps de conocimiento para un paciente y módulo
 */
export async function fetchInquiryGaps(
  patientId: number,
  moduleCode: ModuleCode
): Promise<GapsApiResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario no autenticado');
  }

  const url = `${API_BASE_URL}/inquiry/gaps/?patient_id=${patientId}&module=${moduleCode}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.detail || 'Error al obtener gaps');
  }

  return response.json();
}

/**
 * Guardar respuesta de un inquiry en sesión
 */
export async function saveInquiryResponse(
  data: SaveResponseRequest
): Promise<{ success: boolean; response_id: number }> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(`${API_BASE_URL}/inquiry/responses/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.detail || 'Error al guardar respuesta');
  }

  return response.json();
}

/**
 * Crear batch de inquiries (cuestionario para enviar)
 */
export async function createInquiryBatch(
  data: CreateBatchRequest
): Promise<CreateBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(`${API_BASE_URL}/inquiry/batches/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.detail || 'Error al crear cuestionario');
  }

  return response.json();
}

/**
 * Obtener historial de respuestas de un paciente
 */
export async function fetchPatientResponses(
  patientId: number,
  moduleCode?: ModuleCode
): Promise<any[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario no autenticado');
  }

  let url = `${API_BASE_URL}/inquiry/responses/${patientId}/`;
  if (moduleCode) {
    url += `?module=${moduleCode}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.detail || 'Error al obtener historial');
  }

  return response.json();
}
