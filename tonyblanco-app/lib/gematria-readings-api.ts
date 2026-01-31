/**
 * Gematria Readings API Client
 * 
 * Handles saving, listing, and synthesizing gematria readings.
 */

import { API_BASE_URL, getAuthToken } from './api';

// Types
export interface GematriaReading {
  id: string;
  patient: number;
  patient_name: string;
  therapist: number;
  therapist_name: string;
  method: string;
  method_display: string;
  status: string;
  status_display: string;
  input_name: string;
  input_birth_date: string | null;
  hebrew_transliteration: string;
  calculated_numbers: {
    esencia?: { original: number; reducido: number; esMaestro?: boolean };
    expresion?: { original: number; reducido: number; esMaestro?: boolean };
    herencia?: { original: number; reducido: number; esMaestro?: boolean };
    caminoVida?: { original: number; reducido: number; esMaestro?: boolean };
  };
  calculation_details: Record<string, any>;
  sefirotic_correspondence: Record<string, any>;
  number_interpretations: Record<string, any>;
  method_interpretation: string;
  therapist_notes: string;
  therapist_interpretation: string;
  highlights: string[];
  ai_interpretation: string;
  ai_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GematriaReadingListItem {
  id: string;
  method: string;
  method_display: string;
  input_name: string;
  calculated_numbers: GematriaReading['calculated_numbers'];
  status: string;
  summary: string;
  created_at: string;
}

export interface GematriaSynthesis {
  id: string;
  patient: number;
  patient_name: string;
  therapist: number;
  status: string;
  status_display: string;
  title: string;
  readings: GematriaReadingListItem[];
  readings_count: number;
  methods_covered: string[];
  ai_synthesis: {
    narrative_summary?: string;
    dominant_themes?: string[];
    light_aspects?: string[];
    shadow_aspects?: string[];
    archetypal_journey?: string;
    sefirotic_focus?: string;
    tikun_suggestions?: string[];
    cross_swm_insights?: string;
    therapeutic_direction?: string;
    ai_generated?: boolean;
    generated_at?: string;
  };
  ai_narrative: string;
  cross_swm_sources: Array<{ swm: string; source_id: string; key_findings: any; date: string }>;
  cross_swm_synthesis: Record<string, any>;
  dominant_numbers: Array<{ number: number; count: number; meaning?: any }>;
  recurring_sefirot: Array<{ sefira: string; count: number }>;
  archetypal_patterns: Array<{ archetype: string; count: number }>;
  shadow_themes: string[];
  light_themes: string[];
  tikun_suggestions: string[];
  therapist_validation: boolean;
  therapist_notes: string;
  therapist_edits: Record<string, any>;
  exported_to_holistic: boolean;
  exported_at: string | null;
  holistic_record_id: string;
  created_at: string;
  updated_at: string;
}

export interface PatternAnalysis {
  has_data: boolean;
  pattern_analysis?: {
    dominant_numbers: Array<{ number: number; count: number; meaning?: any }>;
    recurring_sefirot: Array<{ sefira: string; count: number }>;
    archetypal_patterns: Array<{ archetype: string; count: number }>;
    methods_analyzed: string[];
    total_readings: number;
    method_breakdown: Record<string, any[]>;
  };
  cross_swm_available?: number;
  cross_swm_sources?: Array<{ swm: string; date: string }>;
  message?: string;
}

// API Functions

const getHeaders = () => ({
  'Authorization': `Token ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

/**
 * List all gematria readings for a patient
 */
export async function listGematriaReadings(
  patientId: number,
  method?: string
): Promise<{ count: number; readings: GematriaReadingListItem[] }> {
  const params = new URLSearchParams({ patient_id: patientId.toString() });
  if (method) params.append('method', method);
  
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-readings/?${params}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to list readings: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Save a new gematria reading
 */
export async function saveGematriaReading(data: {
  patient_id: number;
  method: string;
  input_name: string;
  input_birth_date?: string | null;
  hebrew_transliteration?: string;
  calculated_numbers: Record<string, any>;
  calculation_details?: Record<string, any>;
  sefirotic_correspondence?: Record<string, any>;
  number_interpretations?: Record<string, any>;
  method_interpretation?: string;
  therapist_notes?: string;
}): Promise<GematriaReading> {
  // Clean up data before sending - remove undefined values, handle nulls
  const cleanData = {
    ...data,
    // DRF DateField expects YYYY-MM-DD string or null
    input_birth_date: data.input_birth_date || null,
    hebrew_transliteration: data.hebrew_transliteration || '',
    calculated_numbers: data.calculated_numbers || {},
    calculation_details: data.calculation_details || {},
    sefirotic_correspondence: data.sefirotic_correspondence || {},
    number_interpretations: data.number_interpretations || {},
    method_interpretation: data.method_interpretation || '',
    therapist_notes: data.therapist_notes || '',
  };
  
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-readings/save/`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cleanData),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[GematriaAPI] Save reading error:', error);
    // DRF serializer errors can be objects with field-level errors
    if (typeof error === 'object' && !error.error) {
      const fieldErrors = Object.entries(error)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('; ');
      throw new Error(fieldErrors || `Failed to save reading: ${response.status}`);
    }
    throw new Error(error.error || error.detail || `Failed to save reading: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get a specific reading
 */
export async function getGematriaReading(readingId: string): Promise<GematriaReading> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-readings/${readingId}/`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get reading: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update a reading (notes, status, etc.)
 */
export async function updateGematriaReading(
  readingId: string,
  data: Partial<Pick<GematriaReading, 'therapist_notes' | 'therapist_interpretation' | 'highlights' | 'status'>>
): Promise<GematriaReading> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-readings/${readingId}/`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update reading: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete a reading
 */
export async function deleteGematriaReading(readingId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-readings/${readingId}/`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to delete reading: ${response.status}`);
  }
}

/**
 * List all syntheses for a patient
 */
export async function listGematriaSyntheses(
  patientId: number
): Promise<{ count: number; syntheses: GematriaSynthesis[] }> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/?patient_id=${patientId}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to list syntheses: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Generate a new synthesis
 */
export async function generateGematriaSynthesis(data: {
  patient_id: number;
  reading_ids?: string[];
  include_cross_swm?: boolean;
  title?: string;
}): Promise<GematriaSynthesis> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/generate/`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to generate synthesis: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get a specific synthesis
 */
export async function getGematriaSynthesis(synthesisId: string): Promise<GematriaSynthesis> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/${synthesisId}/`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get synthesis: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Update a synthesis (validation, notes)
 */
export async function updateGematriaSynthesis(
  synthesisId: string,
  data: Partial<Pick<GematriaSynthesis, 'therapist_validation' | 'therapist_notes' | 'therapist_edits' | 'status' | 'title'>>
): Promise<GematriaSynthesis> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/${synthesisId}/`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update synthesis: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Export synthesis to holistic summary
 */
export async function exportSynthesisToHolistic(
  synthesisId: string
): Promise<{ success: boolean; message: string; holistic_record_id?: string; destination?: string }> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/export/`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ synthesis_id: synthesisId }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[GematriaAPI] Export error:', error);
    throw new Error(error.error || `Failed to export synthesis: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete a synthesis
 */
export async function deleteGematriaSynthesis(
  synthesisId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-synthesis/${synthesisId}/`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to delete synthesis: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get pattern analysis without creating a synthesis
 */
export async function getPatternAnalysis(patientId: number): Promise<PatternAnalysis> {
  const response = await fetch(
    `${API_BASE_URL}/swm/cabala/gematria-analysis/?patient_id=${patientId}`,
    { headers: getHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get pattern analysis: ${response.status}`);
  }
  
  return response.json();
}
