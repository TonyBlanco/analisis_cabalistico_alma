/**
 * Types for SWM Tarot Evolutivo API
 * 
 * Matches backend serializers in backend/swm/tarot/serializers.py
 */

// =============================================================================
// ENUMS (matching Django model choices)
// =============================================================================

export type SpreadType = 
  | 'free'
  | 'tree_of_life'
  | 'natal_chart'
  | 'correspondences'
  | 'custom';

export type TarotSystem =
  | 'rider_waite'
  | 'thoth'
  | 'golden_dawn'
  | 'bota'
  | 'hermetic'
  | 'sephiroth';

export type WorkspaceStatus =
  | 'draft'
  | 'active'
  | 'sealed'
  | 'reviewed'
  | 'archived';

export type ArtifactType =
  | 'spread'
  | 'therapist_notes'
  | 'symbolic_map'
  | 'session_summary';

export type PermissionLevel =
  | 'executor'
  | 'observer'
  | 'reviewer'
  | 'admin';

export type SessionPhase =
  | 'setup'
  | 'selection'
  | 'exploration'
  | 'synthesis'
  | 'closing';


// =============================================================================
// USER
// =============================================================================

export interface UserMinimal {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}


// =============================================================================
// WORKSPACE DEFINITION
// =============================================================================

export interface WorkspaceDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  version: string;
  config_schema: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


// =============================================================================
// WORKSPACE INSTANCE
// =============================================================================

export interface WorkspaceInstance {
  id: string;
  definition: WorkspaceDefinition;
  subject_user: UserMinimal;
  creator_user: UserMinimal;
  spread_type: SpreadType;
  spread_type_display: string;
  tarot_system: TarotSystem;
  tarot_system_display: string;
  total_cards: number;
  has_reversed: boolean;
  status: WorkspaceStatus;
  status_display: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  sealed_at: string | null;
  reviewed_at: string | null;
}

export interface WorkspaceInstanceList {
  id: string;
  subject_user: UserMinimal;
  spread_type: SpreadType;
  spread_type_display: string;
  tarot_system: TarotSystem;
  total_cards: number;
  status: WorkspaceStatus;
  status_display: string;
  created_at: string;
  sealed_at: string | null;
}


// =============================================================================
// WORKSPACE SESSION
// =============================================================================

export interface WorkspaceSession {
  id: string;
  user: UserMinimal;
  phase: SessionPhase;
  phase_display: string;
  is_active: boolean;
  progress_data: Record<string, unknown>;
  started_at: string;
  ended_at: string | null;
  last_activity_at: string;
}


// =============================================================================
// WORKSPACE ARTIFACT
// =============================================================================

export interface TarotCard {
  position: string | number;
  card_id: string;
  reversed: boolean;
  name?: string;
  arcana?: string;
  system?: string;
  keywords?: string[];
  symbolism?: Record<string, unknown>;
}

export interface SpreadContent {
  spread_type: SpreadType;
  tarot_system: TarotSystem;
  cards: TarotCard[];
  therapist_notes?: string;
  session_context?: string;
  recorded_at: string;
}

export interface WorkspaceArtifact {
  id: string;
  artifact_type: ArtifactType;
  artifact_type_display: string;
  content: SpreadContent | Record<string, unknown>;
  is_sealed: boolean;
  version: number;
  created_by: UserMinimal;
  created_at: string;
  updated_at: string;
  sealed_at: string | null;
}


// =============================================================================
// WORKSPACE PERMISSION
// =============================================================================

export interface WorkspacePermission {
  id: string;
  user: UserMinimal;
  level: PermissionLevel;
  level_display: string;
  granted_by: UserMinimal;
  granted_at: string;
  is_active: boolean;
  revoked_at: string | null;
  revoked_by: UserMinimal | null;
}


// =============================================================================
// WORKSPACE AUDIT LOG
// =============================================================================

export interface WorkspaceAuditLog {
  id: string;
  action: string;
  user: UserMinimal;
  details: Record<string, unknown>;
  ip_address: string | null;
  timestamp: string;
}


// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface CreateInstanceRequest {
  subject_user_id: number;
  spread_type?: SpreadType;
  tarot_system?: TarotSystem;
  has_reversed?: boolean;
  config?: Record<string, unknown>;
}

export interface SaveSpreadRequest {
  instance_id: string;
  spread_type?: SpreadType;
  tarot_system?: TarotSystem;
  cards: TarotCard[];
  therapist_notes?: string;
  session_context?: string;
}

export interface InstanceActionRequest {
  instance_id: string;
}

export interface GrantPermissionRequest {
  instance_id: string;
  user_id: number;
  level: PermissionLevel;
}

export interface RevokePermissionRequest {
  instance_id: string;
  user_id: number;
  level: PermissionLevel;
}

export interface ListWorkspacesFilters {
  subject_user_id?: number;
  status?: WorkspaceStatus;
}


// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface CreateInstanceResponse {
  instance: WorkspaceInstance;
}

export interface StartSessionResponse {
  session: WorkspaceSession;
}

export interface SaveSpreadResponse {
  artifact: WorkspaceArtifact;
}

export interface SealWorkspaceResponse {
  instance: WorkspaceInstance;
}

export interface ReviewWorkspaceResponse {
  instance: WorkspaceInstance;
}

export interface ListWorkspacesResponse {
  workspaces: WorkspaceInstanceList[];
}

export interface ArtifactsResponse {
  artifacts: WorkspaceArtifact[];
}

export interface AuditTrailResponse {
  logs: WorkspaceAuditLog[];
}

export interface PermissionResponse {
  permission: WorkspacePermission;
}
