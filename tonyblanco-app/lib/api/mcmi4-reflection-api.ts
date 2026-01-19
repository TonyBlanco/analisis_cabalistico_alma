/**
 * API Client for MCMI-4 Reflection SWM
 * 
 * Experiential reflection module for consultants (no scoring, pure human text)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const REFLECTION_BASE = `${API_BASE}/swm/mcmi4-reflection`;

// Types

export type ReflectionStatus = 'draft' | 'sealed';

export interface ReflectionArtifactPayload {
  schema_version: 'mcmi4-reflection:v1';
  linked_test_result_id: string;
  answers: Record<string, string>;
  status: ReflectionStatus;
  completed_at?: string | null;
}

export interface ReflectionArtifact {
  id: string;
  content: ReflectionArtifactPayload;
  is_sealed: boolean;
  updated_at: string;
}

export interface ReflectionWorkspace {
  workspace_id: string;
  status: ReflectionStatus;
  consultant_user_id: number;
  linked_test_result_id: string;
  created_at: string;
  sealed_at?: string | null;
  can_edit: boolean;
  artifact: ReflectionArtifact | null;
}

export interface CreateReflectionRequest {
  linked_test_result_id: string;
  initial_answers?: Record<string, string>;
}

export interface CreateReflectionResponse {
  workspace_id: string;
  artifact_id: string;
  status: ReflectionStatus;
  message: string;
}

export interface UpdateReflectionRequest {
  answers: Record<string, string>;
}

export interface UpdateReflectionResponse {
  artifact_id: string;
  updated_at: string;
  message: string;
}

export interface SealReflectionResponse {
  workspace_id: string;
  status: ReflectionStatus;
  sealed_at: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
}

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Try both 'authToken' (primary) and 'token' (fallback)
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Helper to build headers
function buildHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

/**
 * Create new reflection workspace
 */
export async function createReflection(
  request: CreateReflectionRequest
): Promise<CreateReflectionResponse> {
  const response = await fetch(`${REFLECTION_BASE}/create`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get reflection workspace status and content
 */
export async function getReflection(
  workspaceId: string
): Promise<ReflectionWorkspace> {
  const response = await fetch(`${REFLECTION_BASE}/${workspaceId}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Update reflection answers (draft only)
 */
export async function updateReflection(
  workspaceId: string,
  request: UpdateReflectionRequest
): Promise<UpdateReflectionResponse> {
  const response = await fetch(`${REFLECTION_BASE}/${workspaceId}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Seal reflection workspace (make immutable)
 */
export async function sealReflection(
  workspaceId: string
): Promise<SealReflectionResponse> {
  const response = await fetch(`${REFLECTION_BASE}/${workspaceId}/seal`, {
    method: 'POST',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get reflection workspace by signal TestResult ID
 * Fetches workspace linked to specific signal
 */
export async function getReflectionBySignalId(signalId: string): Promise<ReflectionWorkspace | null> {
  try {
    const response = await fetch(`${REFLECTION_BASE}/by-signal/${signalId}`, {
      method: 'GET',
      headers: buildHeaders(),
    });

    if (response.status === 404) {
      return null; // No reflection exists for this signal
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching reflection by signal:', error);
    return null;
  }
}

/**
 * Fixed reflection questions (6-8 questions, neutral language)
 */
export const REFLECTION_QUESTIONS = [
  {
    id: 'q1',
    text: '¿Cómo te sientes al revisar los resultados de tu evaluación?',
  },
  {
    id: 'q2',
    text: '¿Qué aspectos de los resultados resuenan más contigo?',
  },
  {
    id: 'q3',
    text: '¿Hay algún patrón que reconozcas en tu vida diaria?',
  },
  {
    id: 'q4',
    text: '¿Qué te gustaría explorar más profundamente con tu terapeuta?',
  },
  {
    id: 'q5',
    text: '¿Qué recursos o fortalezas internas reconoces en ti?',
  },
  {
    id: 'q6',
    text: '¿Qué cambios o pasos te gustaría considerar?',
  },
  {
    id: 'q7',
    text: '¿Qué apoyo necesitas para avanzar en tu proceso?',
  },
  {
    id: 'q8',
    text: '¿Hay algo más que quieras compartir sobre tu experiencia?',
  },
] as const;
