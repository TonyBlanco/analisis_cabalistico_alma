/**
 * SWM Transgeneracional Profundo API Client
 *
 * TypeScript API client for the psychogenealogy workspace.
 * Supports genograms, family patterns, syndrome marks, and therapeutic observations.
 */

import { apiClient } from './api-client'

// ============================================================================
// TYPES
// ============================================================================

export interface TransgenerationalSession {
  id: string
  patient: number
  patient_username: string
  therapist: number
  therapist_username: string
  title: string
  status: 'created' | 'in_progress' | 'paused' | 'closed' | 'archived'
  status_display: string
  genogram_data: GenogramData
  session_notes: string
  focus_areas: string[]
  is_closed: boolean
  member_count: number
  pattern_count: number
  family_members?: FamilyMember[]
  family_relationships?: FamilyRelationship[]
  patterns?: TransgenerationalPattern[]
  syndrome_marks?: SyndromeMark[]
  created_at: string
  updated_at: string
  started_at: string | null
  closed_at: string | null
}

export interface GenogramData {
  nodes?: GenogramNode[]
  edges?: GenogramEdge[]
  viewport?: { x: number; y: number; zoom: number }
  [key: string]: unknown
}

export interface GenogramNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface GenogramEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: Record<string, unknown>
}

export interface FamilyMember {
  id: string
  session: string
  alias: string
  gender: 'male' | 'female' | 'other' | 'unknown'
  gender_display: string
  relationship: string
  relationship_display: string
  generation: number
  birth_order: number
  status: 'alive' | 'deceased' | 'unknown'
  status_display: string
  birth_year: number | null
  death_year: number | null
  significant_events: SignificantEvent[]
  characteristics: string[]
  notes: string
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export interface SignificantEvent {
  type: string
  year?: number
  description: string
}

export interface FamilyRelationship {
  id: string
  session: string
  member_from: string
  member_from_alias: string
  member_to: string
  member_to_alias: string
  relationship_type: string
  relationship_type_display: string
  quality: 'positive' | 'negative' | 'ambivalent' | 'neutral' | 'unknown'
  quality_display: string
  notes: string
  created_at: string
  updated_at: string
}

export interface TransgenerationalPattern {
  id: string
  session: string
  pattern_name: string
  pattern_type: string
  pattern_type_display: string
  members_involved: string[]
  members_involved_aliases: string[]
  generations_affected: number[]
  description: string
  therapist_notes: string
  is_acknowledged: boolean
  is_worked: boolean
  intensity: number
  created_at: string
  updated_at: string
}

export interface SyndromeMark {
  id: string
  session: string
  event_type: string
  event_type_display: string
  original_member: string | null
  original_member_alias: string | null
  original_date: string | null
  original_year: number | null
  recurring_pattern: string
  recurring_dates: RecurringDate[]
  significance: string
  therapist_notes: string
  created_at: string
  updated_at: string
}

export interface RecurringDate {
  year: number
  member_alias?: string
  event?: string
}

export interface TransgenerationalSnapshot {
  id: string
  session: string
  genogram_data: GenogramData
  notes: string
  created_at: string
}

export interface ChoiceOption {
  value: string
  label: string
}

export interface TransgenerationalChoices {
  relationships: ChoiceOption[]
  pattern_types: ChoiceOption[]
  event_types: ChoiceOption[]
  genders: ChoiceOption[]
  member_statuses: ChoiceOption[]
  relationship_types: ChoiceOption[]
  relationship_qualities: ChoiceOption[]
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateSessionRequest {
  patient: number
  title?: string
  genogram_data?: GenogramData
  session_notes?: string
  focus_areas?: string[]
}

export interface UpdateSessionRequest {
  title?: string
  genogram_data?: GenogramData
  session_notes?: string
  focus_areas?: string[]
}

export interface CreateFamilyMemberRequest {
  session_id: string
  alias: string
  relationship: string
  gender?: string
  generation?: number
  birth_order?: number
  status?: string
  birth_year?: number | null
  death_year?: number | null
  significant_events?: SignificantEvent[]
  characteristics?: string[]
  notes?: string
  position_x?: number
  position_y?: number
}

export interface UpdateFamilyMemberRequest {
  alias?: string
  relationship?: string
  gender?: string
  generation?: number
  birth_order?: number
  status?: string
  birth_year?: number | null
  death_year?: number | null
  significant_events?: SignificantEvent[]
  characteristics?: string[]
  notes?: string
  position_x?: number
  position_y?: number
}

export interface CreateRelationshipRequest {
  session_id: string
  member_from: string
  member_to: string
  relationship_type: string
  quality?: string
  notes?: string
}

export interface CreatePatternRequest {
  session_id: string
  pattern_name: string
  pattern_type: string
  members_involved?: string[]
  generations_affected?: number[]
  description?: string
  therapist_notes?: string
  intensity?: number
}

export interface UpdatePatternRequest {
  pattern_name?: string
  pattern_type?: string
  members_involved?: string[]
  generations_affected?: number[]
  description?: string
  therapist_notes?: string
  is_acknowledged?: boolean
  is_worked?: boolean
  intensity?: number
}

export interface CreateSyndromeMarkRequest {
  session_id: string
  event_type: string
  original_member?: string | null
  original_date?: string | null
  original_year?: number | null
  recurring_pattern?: string
  recurring_dates?: RecurringDate[]
  significance?: string
  therapist_notes?: string
}

export interface UpdateGenogramRequest {
  genogram_data: GenogramData
  create_snapshot?: boolean
  snapshot_notes?: string
}

// ============================================================================
// API CLIENT
// ============================================================================

const BASE_URL = '/api/swm/transgenerational'

export const swmTransgenerationalApi = {
  // =========================================================================
  // SESSIONS
  // =========================================================================

  /**
   * List all transgenerational sessions
   */
  async listSessions(patientId?: number): Promise<TransgenerationalSession[]> {
    const params = patientId ? `?patient_id=${patientId}` : ''
    const response = await apiClient.get<TransgenerationalSession[]>(
      `${BASE_URL}/sessions/${params}`
    )
    return response.data
  },

  /**
   * Create a new transgenerational session
   */
  async createSession(
    data: CreateSessionRequest
  ): Promise<TransgenerationalSession> {
    const response = await apiClient.post<TransgenerationalSession>(
      `${BASE_URL}/sessions/create/`,
      data
    )
    return response.data
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<TransgenerationalSession> {
    const response = await apiClient.get<TransgenerationalSession>(
      `${BASE_URL}/sessions/${sessionId}/`
    )
    return response.data
  },

  /**
   * Update a session
   */
  async updateSession(
    sessionId: string,
    data: UpdateSessionRequest
  ): Promise<TransgenerationalSession> {
    const response = await apiClient.patch<TransgenerationalSession>(
      `${BASE_URL}/sessions/${sessionId}/update/`,
      data
    )
    return response.data
  },

  /**
   * Start a session
   */
  async startSession(sessionId: string): Promise<TransgenerationalSession> {
    const response = await apiClient.post<TransgenerationalSession>(
      `${BASE_URL}/sessions/${sessionId}/start/`
    )
    return response.data
  },

  /**
   * Close a session
   */
  async closeSession(sessionId: string): Promise<TransgenerationalSession> {
    const response = await apiClient.post<TransgenerationalSession>(
      `${BASE_URL}/sessions/${sessionId}/close/`
    )
    return response.data
  },

  // =========================================================================
  // GENOGRAM
  // =========================================================================

  /**
   * Get genogram data
   */
  async getGenogram(
    sessionId: string
  ): Promise<{ session_id: string; genogram_data: GenogramData; member_count: number; updated_at: string }> {
    const response = await apiClient.get<{ session_id: string; genogram_data: GenogramData; member_count: number; updated_at: string }>(
      `${BASE_URL}/genogram/${sessionId}/`
    )
    return response.data
  },

  /**
   * Update genogram data
   */
  async updateGenogram(
    sessionId: string,
    data: UpdateGenogramRequest
  ): Promise<{ session_id: string; genogram_data: GenogramData; updated_at: string }> {
    const response = await apiClient.patch<{ session_id: string; genogram_data: GenogramData; updated_at: string }>(
      `${BASE_URL}/genogram/${sessionId}/`,
      data
    )
    return response.data
  },

  // =========================================================================
  // FAMILY MEMBERS
  // =========================================================================

  /**
   * List family members for a session
   */
  async listMembers(sessionId: string): Promise<FamilyMember[]> {
    const response = await apiClient.get<FamilyMember[]>(
      `${BASE_URL}/members/${sessionId}/`
    )
    return response.data
  },

  /**
   * Create a family member
   */
  async createMember(data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    const response = await apiClient.post<FamilyMember>(
      `${BASE_URL}/members/`,
      data
    )
    return response.data
  },

  /**
   * Update a family member
   */
  async updateMember(
    memberId: string,
    data: UpdateFamilyMemberRequest
  ): Promise<FamilyMember> {
    const response = await apiClient.patch<FamilyMember>(
      `${BASE_URL}/members/${memberId}/update/`,
      data
    )
    return response.data
  },

  /**
   * Delete a family member
   */
  async deleteMember(memberId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/members/${memberId}/delete/`)
  },

  // =========================================================================
  // FAMILY RELATIONSHIPS
  // =========================================================================

  /**
   * List relationships for a session
   */
  async listRelationships(sessionId: string): Promise<FamilyRelationship[]> {
    const response = await apiClient.get<FamilyRelationship[]>(
      `${BASE_URL}/relationships/${sessionId}/`
    )
    return response.data
  },

  /**
   * Create a relationship between members
   */
  async createRelationship(
    data: CreateRelationshipRequest
  ): Promise<FamilyRelationship> {
    const response = await apiClient.post<FamilyRelationship>(
      `${BASE_URL}/relationships/`,
      data
    )
    return response.data
  },

  // =========================================================================
  // PATTERNS
  // =========================================================================

  /**
   * List patterns for a session
   */
  async listPatterns(sessionId: string): Promise<TransgenerationalPattern[]> {
    const response = await apiClient.get<TransgenerationalPattern[]>(
      `${BASE_URL}/patterns/${sessionId}/`
    )
    return response.data
  },

  /**
   * Create a transgenerational pattern
   */
  async createPattern(
    data: CreatePatternRequest
  ): Promise<TransgenerationalPattern> {
    const response = await apiClient.post<TransgenerationalPattern>(
      `${BASE_URL}/patterns/`,
      data
    )
    return response.data
  },

  /**
   * Update a pattern
   */
  async updatePattern(
    patternId: string,
    data: UpdatePatternRequest
  ): Promise<TransgenerationalPattern> {
    const response = await apiClient.patch<TransgenerationalPattern>(
      `${BASE_URL}/patterns/${patternId}/update/`,
      data
    )
    return response.data
  },

  // =========================================================================
  // SYNDROME MARKS
  // =========================================================================

  /**
   * List syndrome marks for a session
   */
  async listSyndromeMarks(sessionId: string): Promise<SyndromeMark[]> {
    const response = await apiClient.get<SyndromeMark[]>(
      `${BASE_URL}/syndromes/${sessionId}/`
    )
    return response.data
  },

  /**
   * Create a syndrome mark
   */
  async createSyndromeMark(
    data: CreateSyndromeMarkRequest
  ): Promise<SyndromeMark> {
    const response = await apiClient.post<SyndromeMark>(
      `${BASE_URL}/syndromes/`,
      data
    )
    return response.data
  },

  // =========================================================================
  // SNAPSHOTS
  // =========================================================================

  /**
   * List snapshots for a session
   */
  async listSnapshots(sessionId: string): Promise<TransgenerationalSnapshot[]> {
    const response = await apiClient.get<TransgenerationalSnapshot[]>(
      `${BASE_URL}/sessions/${sessionId}/snapshots/`
    )
    return response.data
  },

  /**
   * Create a snapshot
   */
  async createSnapshot(
    sessionId: string,
    notes?: string
  ): Promise<TransgenerationalSnapshot> {
    const response = await apiClient.post<TransgenerationalSnapshot>(
      `${BASE_URL}/sessions/${sessionId}/snapshots/create/`,
      { notes }
    )
    return response.data
  },

  // =========================================================================
  // METADATA
  // =========================================================================

  /**
   * Get all available choices for dropdowns
   */
  async getChoices(): Promise<TransgenerationalChoices> {
    const response = await apiClient.get<TransgenerationalChoices>(
      `${BASE_URL}/choices/`
    )
    return response.data
  },
}

export default swmTransgenerationalApi
