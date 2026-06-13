import { API_BASE_URL, getAuthToken } from "../api";

export type PersonSide = 'paterno' | 'materno';

export interface GenealogyPerson {
  id: string;
  patient: number;
  generation: number;
  relation: string;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  notes: string;
  birth_order_number: number | null;
  is_deceased: boolean;
  is_abortion: boolean;
  side: PersonSide | null;
  created_at: string;
  updated_at: string;
}

export interface GenealogyEvent {
  id: string;
  patient: number;
  title: string;
  year: number | null;
  description: string;
  linked_people: string[];
  created_at: string;
  updated_at: string;
}

export interface GenealogyOverview {
  people: GenealogyPerson[];
  events: GenealogyEvent[];
}

export type GenealogyPersonPayload = Omit<GenealogyPerson, 'id' | 'patient' | 'created_at' | 'updated_at'>;
export type GenealogyEventPayload = Omit<GenealogyEvent, 'id' | 'patient' | 'created_at' | 'updated_at'>;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Error ${response.status}: No se pudo conectar con el servidor`,
    }));
    const errorMsg = (error as { message?: string; detail?: string }).message
      || (error as { message?: string; detail?: string }).detail
      || `Error: ${response.status}`;
    throw new Error(errorMsg);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function getGenealogyOverview(patientId: number): Promise<GenealogyOverview> {
  return request<GenealogyOverview>(`${API_BASE_URL}/bioemotional/genealogy/${patientId}/`);
}

export async function createPerson(
  patientId: number,
  payload: GenealogyPersonPayload,
): Promise<GenealogyPerson> {
  return request<GenealogyPerson>(
    `${API_BASE_URL}/bioemotional/genealogy/${patientId}/person`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function updatePerson(
  personId: string,
  payload: Partial<GenealogyPersonPayload>,
): Promise<GenealogyPerson> {
  return request<GenealogyPerson>(
    `${API_BASE_URL}/bioemotional/genealogy/persons/${personId}/`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
}

export async function deletePerson(personId: string): Promise<void> {
  return request<void>(
    `${API_BASE_URL}/bioemotional/genealogy/persons/${personId}/`,
    { method: 'DELETE' },
  );
}

export async function createEvent(
  patientId: number,
  payload: GenealogyEventPayload,
): Promise<GenealogyEvent> {
  return request<GenealogyEvent>(
    `${API_BASE_URL}/bioemotional/genealogy/${patientId}/event`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function updateEvent(
  eventId: string,
  payload: Partial<GenealogyEventPayload>,
): Promise<GenealogyEvent> {
  return request<GenealogyEvent>(
    `${API_BASE_URL}/bioemotional/genealogy/events/${eventId}/`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
}

export async function deleteEvent(eventId: string): Promise<void> {
  return request<void>(
    `${API_BASE_URL}/bioemotional/genealogy/events/${eventId}/`,
    { method: 'DELETE' },
  );
}
