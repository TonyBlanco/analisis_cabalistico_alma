/**
 * API Client for SHA (Auditoría de Armonía Sefirótica) SWM
 * 
 * Workspace-based sephirotic harmony audit system
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SHA_BASE = `${API_BASE}/swm/sha`;

// Types

export type WorkspaceStatus = 'created' | 'in_progress' | 'sealed' | 'reviewed' | 'archived';
export type PermissionType = 'observer' | 'executor' | 'reviewer' | 'admin';
export type ArtifactType = 'balance_map' | 'therapist_notes' | 'patient_submission' | 'consultant_guide';

export interface WorkspaceInstance {
  id: string;
  subject_user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  creator_user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: WorkspaceStatus;
  status_display: string;
  config: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  started_at?: string;
  sealed_at?: string;
  reviewed_at?: string;
}

export interface WorkspaceArtifact {
  id: string;
  artifact_type: ArtifactType;
  artifact_type_display: string;
  content: Record<string, any>;
  is_sealed: boolean;
  share_with_consultant: boolean;
  is_patient_submission: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  sealed_at?: string;
  created_by: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Request/Response types

export interface CreateWorkspaceRequest {
  subject_user_id: number;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateWorkspaceResponse {
  workspace_id: string;
  status: WorkspaceStatus;
  subject_user_id: number;
  creator_user_id: number;
  created_at: string;
}

export interface SaveArtifactRequest {
  instance_id: string;
  artifact_type: ArtifactType;
  content: Record<string, any>;
  share_with_consultant?: boolean;
}

export interface SealWorkspaceRequest {
  instance_id: string;
}

// API Client

export const swmShaApi = {
  /**
   * POST /api/swm/sha/create
   */
  async createWorkspace(request: CreateWorkspaceRequest): Promise<CreateWorkspaceResponse> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create workspace');
    }

    return response.json();
  },

  /**
   * GET /api/swm/sha/list
   */
  async listWorkspaces(): Promise<WorkspaceInstance[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }

    const data = await response.json();
    return data.results || data;  // Handle {count, results} structure
  },

  /**
   * GET /api/swm/sha/status?instance_id=<uuid>
   */
  async getWorkspaceStatus(instanceId: string): Promise<WorkspaceInstance> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/status?instance_id=${instanceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspace status');
    }

    return response.json();
  },

  /**
   * POST /api/swm/sha/save-artifact
   */
  async saveArtifact(request: SaveArtifactRequest): Promise<WorkspaceArtifact> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/save-artifact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save artifact');
    }

    return response.json();
  },

  /**
   * GET /api/swm/sha/artifacts?instance_id=<uuid>
   */
  async listArtifacts(instanceId: string): Promise<WorkspaceArtifact[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/artifacts?instance_id=${instanceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artifacts');
    }

    const data = await response.json();
    return data.artifacts || [];  // Backend returns {artifacts: [...]}
  },

  /**
   * POST /api/swm/sha/seal
   */
  async sealWorkspace(request: SealWorkspaceRequest): Promise<{ message: string }> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/seal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to seal workspace');
    }

    return response.json();
  },

  /**
   * POST /api/swm/sha/review
   */
  async reviewWorkspace(instanceId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${SHA_BASE}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ instance_id: instanceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to review workspace');
    }

    return response.json();
  },
};

export default swmShaApi;
