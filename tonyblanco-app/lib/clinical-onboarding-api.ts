import { getApiBaseUrl } from './api-base';

const API_BASE_URL = getApiBaseUrl();

function getStoredAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function readJsonSafely(response: Response): Promise<Record<string, unknown>> {
  return response.json().catch(() => ({}));
}

function pickMessage(payload: Record<string, unknown>, fallback: string): string {
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;
  return fallback;
}

export class ClinicalOnboardingApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ClinicalOnboardingApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Body for `POST /api/profile/clinical-mode-request/`.
 *
 * Confirmed backend contract:
 * - `license_number`: required string.
 * - `specialty`: required string.
 * - `professional_body`: optional string.
 * - `responsible_use_accepted`: required boolean.
 * - `anti_fraud_rail_accepted`: required boolean.
 * - `notes`: optional string.
 */
export interface ClinicalModeRequestPayload {
  license_number: string;
  specialty: string;
  professional_body?: string;
  responsible_use_accepted: boolean;
  anti_fraud_rail_accepted: boolean;
  notes?: string;
}

/**
 * Success response for `POST /api/profile/clinical-mode-request/`.
 *
 * Confirmed statuses:
 * - `requested` (`201`)
 * - `already_requested` (`200`)
 * - `already_enabled` (`200`)
 */
export interface ClinicalModeRequestSuccessResponse {
  status: 'requested' | 'already_requested' | 'already_enabled';
  message: string;
  clinical_mode_requested: boolean;
  clinical_mode_enabled: boolean;
  can_use_clinical_lexicon: boolean;
  request_id?: number | string | null;
}

export interface ClinicalBackendPendingResponse {
  status: 'backend_pending';
  message: string;
  httpStatus: 404;
}

export type ClinicalModeRequestResponse =
  | ClinicalModeRequestSuccessResponse
  | ClinicalBackendPendingResponse;

/**
 * Submit a therapist request for clinical mode activation.
 *
 * Method: `POST`
 * Path: `/api/profile/clinical-mode-request/`
 * Body: `ClinicalModeRequestPayload`
 * Response:
 * - `200`/`201`: `ClinicalModeRequestSuccessResponse`
 * - `400`: throws `ClinicalOnboardingApiError` with codes such as
 *   `credential_required` or `acceptance_required`
 * - `404`: returns a synthetic `backend_pending` fallback for older envs
 */
export async function requestClinicalMode(
  payload: ClinicalModeRequestPayload,
): Promise<ClinicalModeRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/clinical-mode-request/`, {
    method: 'POST',
    headers: getStoredAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 404) {
    return {
      status: 'backend_pending',
      message:
        'El endpoint clínico no está disponible en este entorno todavía. La UI queda lista para conectarlo.',
      httpStatus: 404,
    };
  }

  const data = await readJsonSafely(response);

  if (!response.ok) {
    const code = typeof data.code === 'string' ? data.code : undefined;
    throw new ClinicalOnboardingApiError(
      pickMessage(data, 'No se pudo solicitar el modo clínico.'),
      response.status,
      code,
    );
  }

  return {
    status:
      (typeof data.status === 'string' ? data.status : 'requested') as ClinicalModeRequestSuccessResponse['status'],
    message:
      typeof data.message === 'string'
        ? data.message
        : 'Solicitud clínica enviada correctamente.',
    clinical_mode_requested: Boolean(data.clinical_mode_requested),
    clinical_mode_enabled: Boolean(data.clinical_mode_enabled),
    can_use_clinical_lexicon: Boolean(data.can_use_clinical_lexicon),
    request_id:
      typeof data.request_id === 'number' || typeof data.request_id === 'string'
        ? data.request_id
        : null,
  };
}

export type BetaFeedbackCategory =
  | 'ux'
  | 'bug'
  | 'clinical-copy'
  | 'false-positive'
  | 'missing-feature'
  | 'other';

export type BetaFeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Body for `POST /api/beta-feedback/`.
 *
 * Confirmed backend contract:
 * - `category`: enum string.
 * - `severity`: enum string.
 * - `message`: required free text.
 * - `page_context`: required context string.
 */
export interface BetaFeedbackPayload {
  category: BetaFeedbackCategory;
  severity: BetaFeedbackSeverity;
  message: string;
  page_context: string;
}

/**
 * Success response for `POST /api/beta-feedback/`.
 *
 * Confirmed status:
 * - `received` (`201`)
 */
export interface BetaFeedbackSuccessResponse {
  status: 'received';
  message: string;
  feedback_id?: number | string | null;
}

export type SubmitBetaFeedbackResponse =
  | BetaFeedbackSuccessResponse
  | ClinicalBackendPendingResponse;

/**
 * Submit beta feedback for the clinical rollout.
 *
 * Method: `POST`
 * Path: `/api/beta-feedback/`
 * Body: `BetaFeedbackPayload`
 * Response:
 * - `201`: `BetaFeedbackSuccessResponse`
 * - `400`: throws `ClinicalOnboardingApiError` with codes such as
 *   `message_required`
 * - `404`: returns a synthetic `backend_pending` fallback for older envs
 */
export async function submitBetaFeedback(
  payload: BetaFeedbackPayload,
): Promise<SubmitBetaFeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/beta-feedback/`, {
    method: 'POST',
    headers: getStoredAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 404) {
    return {
      status: 'backend_pending',
      message:
        'El endpoint de feedback beta no está disponible en este entorno todavía. La UI queda lista para conectarlo.',
      httpStatus: 404,
    };
  }

  const data = await readJsonSafely(response);

  if (!response.ok) {
    const code = typeof data.code === 'string' ? data.code : undefined;
    throw new ClinicalOnboardingApiError(
      pickMessage(data, 'No se pudo enviar el feedback beta.'),
      response.status,
      code,
    );
  }

  return {
    status: 'received',
    message:
      typeof data.message === 'string' ? data.message : 'Feedback beta enviado correctamente.',
    feedback_id:
      typeof data.feedback_id === 'number' || typeof data.feedback_id === 'string'
        ? data.feedback_id
        : null,
  };
}
