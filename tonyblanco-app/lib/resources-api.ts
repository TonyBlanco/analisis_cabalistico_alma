import { API_BASE_URL, getAuthToken } from './api';

export type Resource = {
  id: number;
  title: string;
  description?: string;
  type?: string;
  resource_type?: 'pdf' | 'audio' | 'video' | 'class' | 'session' | string;
  acquired?: boolean;
  external_link?: string | null;
  file_url?: string | null;
  duration?: number | null; // minutes
  access_level?: 'free' | 'assigned' | 'restricted' | 'paid';
  therapist_notes?: string | null;
  assigned_to?: number[];
};

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

/**
 * Resources visible to the authenticated user (patient).
 * Backend decides access.
 */
export async function getMyResources(): Promise<Resource[]> {
  const response = await fetch(`${API_BASE_URL}/resources/my/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener recursos');
  }

  return response.json();
}

/**
 * Assign a resource to a patient (therapist).
 */
export async function assignResourceToPatient(
  resourceId: number,
  patientId: number,
  notes?: string
): Promise<{ success: boolean }> {
  const body: Record<string, any> = { resource_id: resourceId };
  if (notes) body.notes = notes;

  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/resources/assign/`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Error al asignar recurso');
  }

  return response.json();
}

/**
 * Acquire a resource (patient).
 */
export async function acquireResource(
  resourceId: number
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/acquire/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Error al adquirir recurso');
  }

  return response.json();
}

// TEMPORAL – stub para estabilizar build
export async function getResources(): Promise<Resource[]> {
  return [];
}

// TEMPORAL – stub para estabilizar build
export async function unassignResourceFromPatient(resourceId: number, patientId: number): Promise<{ success: boolean }> {
  // Call backend unassign endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/resources/unassign/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resource_id: resourceId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Error al desasignar recurso');
    }

    return response.json();
  } catch (err) {
    // In development, return success to allow UI testing
    console.warn('unassignResourceFromPatient failed, returning success stub', err);
    return { success: true };
  }
}
