/**
 * API Client for MCMI-4 Místico SWM
 * 
 * Typed client following SWM_MCMI4_API_SPEC.md and SWM_MCMI4_FRONTEND_CONTRACT.md
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SWM_BASE = `${API_BASE}/swm/mcmi4`;

// Types

export type WorkspaceStatus = 'created' | 'in_progress' | 'sealed' | 'reviewed' | 'archived';
export type PermissionType = 'executor' | 'observer' | 'reviewer' | 'admin';
export type PhaseName = 'discovery' | 'mapping' | 'interpretation' | 'synthesis';
export type ArtifactType =
  | 'progress_snapshot'
  | 'interpretation_note'
  | 'decision_log'
  | 'final_synthesis'
  | 'notes'
  | 'symbolic_axes'
  | `phase:${PhaseName}`;

export interface WorkspaceInstance {
  id: string;
  workspace_definition: number;
  subject_user_id: string;
  creator_user_id: string;
  status: WorkspaceStatus;
  mcmi4_source_data_id: string;
  config: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  started_at?: string;
  sealed_at?: string;
  reviewed_at?: string;
  archived_at?: string;
}

export interface WorkspaceSession {
  id: string;
  workspace_instance: string;
  executor_user_id: string;
  started_at: string;
  ended_at?: string;
  session_state: Record<string, any>;
  interactions_count: number;
  current_phase: string;
  is_active: boolean;
}

export interface WorkspaceArtifact {
  id: string;
  workspace_instance: string;
  session?: string;
  artifact_type: ArtifactType;
  content: Record<string, any>;
  created_by_id: string;
  created_at: string;
  is_sealed: boolean;
  metadata: Record<string, any>;
}

export interface WorkspacePermission {
  id: string;
  workspace_instance: string;
  user_id: string;
  permission_type: PermissionType;
  granted_by_id: string;
  granted_at: string;
  revoked_at?: string;
  is_active: boolean;
}

// Request/Response types

export interface CreateWorkspaceRequest {
  subject_user_id: string;
  mcmi4_source_data_id: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateWorkspaceResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  subject_user_id: string;
  creator_user_id: string;
  created_at: string;
  mcmi4_source_data_id: string;
}

export interface StartSessionRequest {
  workspace_id: string;
}

export interface StartSessionResponse {
  session_id: string;
  workspace_id: string;
  executor_user_id: string;
  started_at: string;
  current_phase: string;
  session_state: Record<string, any>;
}

export interface ProgressRequest {
  workspace_id: string;
  session_id: string;
  action: 'advance_phase' | 'record_decision' | 'generate_artifact';
  payload: Record<string, any>;
}

export interface ProgressResponse {
  session_id: string;
  current_phase: string;
  session_state: Record<string, any>;
  interactions_count: number;
  artifact_created?: string;
}

export interface SealWorkspaceRequest {
  workspace_id: string;
  session_id: string;
  final_synthesis: Record<string, any>;
}

export interface SealWorkspaceResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  sealed_at: string;
  session_summary: Record<string, any>;
  synthesis_report_id: string;
}

export interface WorkspaceStatusResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  subject_user_id: string;
  creator_user_id: string;
  created_at: string;
  started_at?: string;
  sealed_at?: string;
  reviewed_at?: string;
  active_session?: {
    session_id: string;
    executor_user_id: string;
    started_at: string;
    current_phase: string;
    interactions_count: number;
  };
  permissions: Array<{ user_id: string; permission_type: PermissionType }>;
  artifacts_count: Record<ArtifactType, number>;
}

export interface ResultsResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  final_synthesis?: Record<string, any>;
  artifacts: WorkspaceArtifact[];
  sealed_at?: string;
}

// API Client

function getAuthHeader(token?: string): HeadersInit {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  return authToken ? { 'Authorization': `Token ${authToken}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const swmMcmi4Api = {
  /**
   * POST /api/swm/mcmi4/create
   * Create new workspace instance
   */
  async createWorkspace(data: CreateWorkspaceRequest, token?: string): Promise<CreateWorkspaceResponse> {
    const response = await fetch(`${SWM_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<CreateWorkspaceResponse>(response);
  },

  /**
   * GET /api/swm/mcmi4/list
   * List workspaces accessible to user
   */
  async listWorkspaces(filters?: {
    status?: WorkspaceStatus;
    subject_user_id?: string;
  }, token?: string): Promise<{ workspaces: WorkspaceInstance[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.subject_user_id) params.append('subject_user_id', filters.subject_user_id);

    const response = await fetch(`${SWM_BASE}/list?${params}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse<{ workspaces: WorkspaceInstance[] }>(response);
  },

  /**
   * GET /api/swm/mcmi4/status
   * Get comprehensive workspace status
   */
  async getWorkspaceStatus(workspaceId: string, token?: string): Promise<WorkspaceStatusResponse> {
    const response = await fetch(`${SWM_BASE}/status?workspace_id=${workspaceId}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse<WorkspaceStatusResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/start
   * Start new session
   */
  async startSession(data: StartSessionRequest, token?: string): Promise<StartSessionResponse> {
    const response = await fetch(`${SWM_BASE}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<StartSessionResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/progress
   * Record progress in session
   */
  async recordProgress(data: ProgressRequest, token?: string): Promise<ProgressResponse> {
    const response = await fetch(`${SWM_BASE}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ProgressResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/seal
   * Seal workspace (final state)
   */
  async sealWorkspace(data: SealWorkspaceRequest, token?: string): Promise<SealWorkspaceResponse> {
    const response = await fetch(`${SWM_BASE}/seal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<SealWorkspaceResponse>(response);
  },

  /**
   * GET /api/swm/mcmi4/results
   * Get final results and artifacts
   */
  async getResults(workspaceId: string, token?: string): Promise<ResultsResponse> {
    const response = await fetch(`${SWM_BASE}/results?workspace_id=${workspaceId}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse<ResultsResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/grant-permission
   * Grant permission to user
   */
  async grantPermission(data: {
    workspace_id: string;
    user_id: string;
    permission_type: PermissionType;
  }, token?: string): Promise<{ permission_id: string; created: boolean }> {
    const response = await fetch(`${SWM_BASE}/grant-permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ permission_id: string; created: boolean }>(response);
  },

  /**
   * POST /api/swm/mcmi4/revoke-permission
   * Revoke permission from user
   */
  async revokePermission(data: {
    workspace_id: string;
    user_id: string;
    permission_type: PermissionType;
  }, token?: string): Promise<{ revoked: boolean }> {
    const response = await fetch(`${SWM_BASE}/revoke-permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ revoked: boolean }>(response);
  },

  /**
   * GET /api/swm/mcmi4/audit
   * Get audit trail for workspace
   */
  async getAuditTrail(workspaceId: string, limit?: number, token?: string): Promise<{
    audit_trail: Array<{
      id: string;
      action: string;
      timestamp: string;
      user_id: string;
      session_id?: string;
      details: Record<string, any>;
    }>;
  }> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${SWM_BASE}/audit?${params}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse(response);
  },

  /**
   * GET /api/swm/mcmi4/artifacts
   * Get artifacts for workspace
   */
  async getArtifacts(workspaceId: string, artifactType?: ArtifactType, token?: string): Promise<{
    artifacts: WorkspaceArtifact[];
  }> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (artifactType) params.append('artifact_type', artifactType);

    const response = await fetch(`${SWM_BASE}/artifacts?${params}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse(response);
  },

  /**
   * POST /api/swm/mcmi4/review
   * Review sealed workspace
   */
  async reviewWorkspace(data: {
    workspace_id: string;
    review_notes?: string;
  }, token?: string): Promise<{
    workspace_id: string;
    status: WorkspaceStatus;
    reviewed_at: string;
  }> {
    const response = await fetch(`${SWM_BASE}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * POST /api/swm/mcmi4/compute-symbolic-axes
   * Compute symbolic axes from TestResult signal
   */
  async computeSymbolicAxes(data: ComputeSymbolicAxesRequest, token?: string): Promise<ComputeSymbolicAxesResponse> {
    const response = await fetch(`${SWM_BASE}/compute-symbolic-axes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * GET /api/swm/mcmi4/questionnaire
   * Get questionnaire with 195 questions and current progress
   */
  async getQuestionnaire(workspaceId: string, token?: string): Promise<QuestionnaireResponse> {
    const response = await fetch(`${SWM_BASE}/questionnaire?workspace_id=${workspaceId}`, {
      headers: getAuthHeader(token),
    });
    return handleResponse<QuestionnaireResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/progress
   * Save questionnaire response or change world
   */
  async saveQuestionnaireResponse(data: SaveResponseRequest, token?: string): Promise<SaveResponseResponse> {
    const response = await fetch(`${SWM_BASE}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify({
        workspace_id: data.workspace_id,
        session_id: data.session_id,
        action: 'save_response',
        payload: {
          question_id: data.question_id,
          value: data.value,
          world: data.world,
        },
      }),
    });
    return handleResponse<SaveResponseResponse>(response);
  },

  /**
   * POST /api/swm/mcmi4/questionnaire/seal
   * Seal completed questionnaire (transitions to 'sealed' state)
   */
  async sealQuestionnaire(data: { workspace_id: string; session_id: string }, token?: string): Promise<SealQuestionnaireResponse> {
    const response = await fetch(`${SWM_BASE}/questionnaire/seal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(token),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<SealQuestionnaireResponse>(response);
  },
};

// Questionnaire-specific types

export interface Question {
  id: string;
  text: string;
  world: 'atzilut' | 'briah' | 'yetzirah' | 'assiah';
  dimension: string;
  dimension_id: string;
  sefirah: string;
  reverse_scored: boolean;
  weight: number;
}

export interface WorldProgress {
  name: string;
  total_questions: number;
  questions: Question[];
}

export interface CurrentProgress {
  current_world: 'atzilut' | 'briah' | 'yetzirah' | 'assiah';
  current_question_index: number;
  answered_count: number;
  progress_percentage: number;
  completed_worlds: string[];
  worlds_progress: Record<string, { answered: number; total: number }>;
}

export interface QuestionnaireResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  config: {
    total_questions: number;
    worlds_order: string[];
    selected_question_ids: string[];
  };
  worlds: Record<string, WorldProgress>;
  current_progress: CurrentProgress;
  next_question: Question | null;
}

export interface SaveResponseRequest {
  workspace_id: string;
  session_id: string;
  question_id: string;
  value: number; // 1-5 Likert scale
  world: 'atzilut' | 'briah' | 'yetzirah' | 'assiah';
}

export interface SaveResponseResponse {
  success: true;
  action: 'save_response';
  current_progress: CurrentProgress;
  next_question: Question | null;
}

export interface SealQuestionnaireResponse {
  workspace_id: string;
  status: 'sealed';
  sealed_at: string;
  completion_artifact_id: string;
  total_responses: number;
  seal_summary: {
    worlds_completed: string[];
    total_answered: number;
    seal_timestamp: string;
  };
}

export interface SymbolicAxis {
  name: string;
  description: string;
  value: number; // 0.0 to 1.0
  level: 'bajo' | 'medio' | 'alto';
}

export interface ComputeSymbolicAxesRequest {
  workspace_id: string;
}

export interface ComputeSymbolicAxesResponse {
  workspace_id: string;
  artifact_id: string;
  artifact_type: 'symbolic_axes';
  axes: SymbolicAxis[];
  source_test_result_id: string;
  computed_at: string | null;
}

