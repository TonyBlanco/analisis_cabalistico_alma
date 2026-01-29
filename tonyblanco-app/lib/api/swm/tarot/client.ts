/**
 * API Client for SWM Tarot Evolutivo
 * 
 * Follows the pattern established in swm-mcmi4-api.ts
 * All routes under /api/swm/tarot/
 */

import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

import type {
  WorkspaceDefinition,
  WorkspaceInstance,
  WorkspaceSession,
  WorkspaceArtifact,
  WorkspaceAuditLog,
  WorkspacePermission,
  WorkspaceInstanceList,
  CreateInstanceRequest,
  SaveSpreadRequest,
  InstanceActionRequest,
  GrantPermissionRequest,
  RevokePermissionRequest,
  ListWorkspacesFilters,
  CreateInstanceResponse,
  StartSessionResponse,
  SaveSpreadResponse,
  SealWorkspaceResponse,
  ReviewWorkspaceResponse,
  ListWorkspacesResponse,
  ArtifactsResponse,
  AuditTrailResponse,
  PermissionResponse,
} from './types';


// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const API_BASE = getApiBaseUrl();
const SWM_TAROT_BASE = `${API_BASE}/swm/tarot`;


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getAuthHeaders(token?: string): HeadersInit {
  const authToken = token || getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Token ${authToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[SWM Tarot API] Response error:', error);
    throw new Error(error.error || error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}


// =============================================================================
// API CLIENT
// =============================================================================

export const swmTarotApi = {
  /**
   * GET /api/swm/tarot/definition
   * Get the TAROT_EVOLUTIVO workspace definition
   */
  async getDefinition(token?: string): Promise<WorkspaceDefinition> {
    const response = await fetch(`${SWM_TAROT_BASE}/definition`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<WorkspaceDefinition>(response);
  },

  /**
   * POST /api/swm/tarot/create
   * Create a new workspace instance for a patient
   */
  async createInstance(
    data: CreateInstanceRequest,
    token?: string
  ): Promise<WorkspaceInstance> {
    console.log('[SWM Tarot API] Creating instance with data:', data);
    const response = await fetch(`${SWM_TAROT_BASE}/create`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<CreateInstanceResponse>(response);
    return result.instance;
  },

  /**
   * GET /api/swm/tarot/list
   * List workspaces accessible to current user
   * Optional filters: subject_user_id, status
   */
  async listWorkspaces(
    filters?: ListWorkspacesFilters,
    token?: string
  ): Promise<WorkspaceInstanceList[]> {
    const params = new URLSearchParams();
    if (filters?.subject_user_id) {
      params.append('subject_user_id', String(filters.subject_user_id));
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const queryString = params.toString();
    const url = queryString
      ? `${SWM_TAROT_BASE}/list?${queryString}`
      : `${SWM_TAROT_BASE}/list`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    const result = await handleResponse<ListWorkspacesResponse>(response);
    return result.workspaces;
  },

  /**
   * GET /api/swm/tarot/status?instance_id=<uuid>
   * Get current workspace status
   */
  async getStatus(instanceId: string, token?: string): Promise<WorkspaceInstance> {
    const response = await fetch(
      `${SWM_TAROT_BASE}/status?instance_id=${instanceId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return handleResponse<WorkspaceInstance>(response);
  },

  /**
   * POST /api/swm/tarot/start
   * Start a new session in a workspace
   */
  async startSession(
    data: InstanceActionRequest,
    token?: string
  ): Promise<WorkspaceSession> {
    const response = await fetch(`${SWM_TAROT_BASE}/start`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<StartSessionResponse>(response);
    return result.session;
  },

  /**
   * POST /api/swm/tarot/save-spread
   * Save a Tarot spread as artifact
   */
  async saveSpread(
    data: SaveSpreadRequest,
    token?: string
  ): Promise<WorkspaceArtifact> {
    const response = await fetch(`${SWM_TAROT_BASE}/save-spread`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SaveSpreadResponse>(response);
    return result.artifact;
  },

  /**
   * POST /api/swm/tarot/seal
   * Seal a workspace (immutable)
   */
  async sealWorkspace(
    data: InstanceActionRequest,
    token?: string
  ): Promise<WorkspaceInstance> {
    const response = await fetch(`${SWM_TAROT_BASE}/seal`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SealWorkspaceResponse>(response);
    return result.instance;
  },

  /**
   * POST /api/swm/tarot/review
   * Mark workspace as reviewed
   */
  async reviewWorkspace(
    data: InstanceActionRequest,
    token?: string
  ): Promise<WorkspaceInstance> {
    const response = await fetch(`${SWM_TAROT_BASE}/review`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<ReviewWorkspaceResponse>(response);
    return result.instance;
  },

  /**
   * GET /api/swm/tarot/artifacts?instance_id=<uuid>
   * Get all artifacts for a workspace
   */
  async getArtifacts(instanceId: string, token?: string): Promise<WorkspaceArtifact[]> {
    const response = await fetch(
      `${SWM_TAROT_BASE}/artifacts?instance_id=${instanceId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const result = await handleResponse<ArtifactsResponse>(response);
    return result.artifacts;
  },

  /**
   * GET /api/swm/tarot/audit?instance_id=<uuid>
   * Get audit trail for a workspace
   */
  async getAuditTrail(instanceId: string, token?: string): Promise<WorkspaceAuditLog[]> {
    const response = await fetch(
      `${SWM_TAROT_BASE}/audit?instance_id=${instanceId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const result = await handleResponse<AuditTrailResponse>(response);
    return result.logs;
  },

  /**
   * POST /api/swm/tarot/grant-permission
   * Grant permission to a user
   */
  async grantPermission(
    data: GrantPermissionRequest,
    token?: string
  ): Promise<WorkspacePermission> {
    const response = await fetch(`${SWM_TAROT_BASE}/grant-permission`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<PermissionResponse>(response);
    return result.permission;
  },

  /**
   * POST /api/swm/tarot/revoke-permission
   * Revoke permission from a user
   */
  async revokePermission(
    data: RevokePermissionRequest,
    token?: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${SWM_TAROT_BASE}/revoke-permission`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean }>(response);
  },
};


// =============================================================================
// NAMED EXPORTS FOR CONVENIENCE
// =============================================================================

export const {
  getDefinition,
  createInstance,
  listWorkspaces,
  getStatus,
  startSession,
  saveSpread,
  sealWorkspace,
  reviewWorkspace,
  getArtifacts,
  getAuditTrail,
  grantPermission,
  revokePermission,
} = swmTarotApi;
