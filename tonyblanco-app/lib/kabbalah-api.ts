import { getApiBaseUrl } from './api-base';

const API_BASE_URL = getApiBaseUrl();

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

export async function getKabbalahInterpretation(patientId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/therapist/patients/${patientId}/interpretation/kabbalah/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 404) {
    // Endpoint not available in this backend; treat as soft-miss.
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error fetching kabbalah interpretation');
  }

  return response.json();
}
