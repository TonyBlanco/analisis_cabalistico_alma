import { getApiBaseUrl } from './api-base';

const API_URL = getApiBaseUrl();

export type TherapistNote = {
  id: number | string;
  patient?: number | null;
  ficha?: number | null;
  title: string;
  content: string;
  tags?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export async function listTherapistNotes(patientId?: number | string | null): Promise<TherapistNote[]> {
  const token = getAuthToken();
  if (!token) throw new Error('No auth token found');

  const qs = patientId ? `?patient=${encodeURIComponent(String(patientId))}` : '';
  const res = await fetch(`${API_URL}/patient-notes/${qs}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || body.message || `Failed to load notes (${res.status})`);
  }

  const data = await res.json();
  // The backend may return either a plain array or a paginated object { results: [...] }
  if (Array.isArray(data)) return data as TherapistNote[];
  if (data && Array.isArray((data as any).results)) return (data as any).results as TherapistNote[];
  return [];
}

export async function createTherapistNote(input: {
  patientId: number;
  title: string;
  content: string;
  tags?: string;
}): Promise<TherapistNote> {
  const token = getAuthToken();
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_URL}/patient-notes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    // Canonical backend contract: send patient PK and content only.
    body: JSON.stringify({
      patient: input.patientId,
      content: input.content,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || body.message || `Failed to create note (${res.status})`);
  }

  return (await res.json()) as TherapistNote;
}
