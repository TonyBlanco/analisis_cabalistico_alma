import { getAuthToken } from '../auth';
import { getApiBaseUrl } from '../../../lib/api-base';

export type FederationConsentState = {
  consent_federation: boolean;
  consent_federation_date: string | null;
  patient_id: number | null;
  changed?: boolean;
  detail?: string;
};

export interface FederationConsentApiError extends Error {
  status?: number;
}

const API_BASE_URL = getApiBaseUrl();

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function parseError(response: Response): Promise<FederationConsentApiError> {
  let message = 'No se pudo actualizar el consentimiento';
  try {
    const data = await response.json();
    if (data?.detail) message = String(data.detail);
  } catch {
    // keep default
  }
  const err: FederationConsentApiError = new Error(message);
  err.status = response.status;
  return err;
}

export async function getPatientFederationConsent(): Promise<FederationConsentState> {
  const response = await fetch(`${API_BASE_URL}/patient/federation-consent/`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function setPatientFederationConsent(consent: boolean): Promise<FederationConsentState> {
  const response = await fetch(`${API_BASE_URL}/patient/federation-consent/`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ consent }),
  });
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function setTherapistPatientFederationConsent(
  patientId: number,
  consent: boolean,
): Promise<FederationConsentState> {
  const response = await fetch(
    `${API_BASE_URL}/therapist/patients/${patientId}/federation-consent/`,
    {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ consent }),
    },
  );
  if (!response.ok) throw await parseError(response);
  return response.json();
}