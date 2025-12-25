const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

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
  const res = await fetch(`${API_URL}/therapist/notes/${qs}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || body.message || `Failed to load notes (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? (data as TherapistNote[]) : [];
}

export async function createTherapistNote(input: {
  patientId: number;
  title: string;
  content: string;
  tags?: string;
}): Promise<TherapistNote> {
  const token = getAuthToken();
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_URL}/therapist/notes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      patient: input.patientId,
      title: input.title,
      content: input.content,
      tags: input.tags || '',
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || body.message || `Failed to create note (${res.status})`);
  }

  return (await res.json()) as TherapistNote;
}
