/**
 * Extensión AI para Cabala Qliphoth Cycles API 
 * 
 * Nuevas funciones para integración de AI y persistencia.
 */

import { getApiBaseUrl } from '@/lib/api-base';

// =============================================================================
// INTERFACES PARA AI Y PERSISTENCIA
// =============================================================================

export interface AIAnalysisRequest {
  analysis_type: 'cycle_analysis' | 'pattern_synthesis' | 'integration_guidance';
  target_qliphoth?: string;
  therapeutic_context?: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  interpretation?: string;
  synthesis?: string;
  guidance?: string;
  analysis_type: string;
  consultante_uuid: string;
  consultante_name: string;
  current_qliphoth: string;
  current_age: number;
  disclaimer: string;
  timestamp: string;
  error?: string;
  fallback_message?: string;
}

export interface SaveAnalysisRequest {
  qliphoth_data: any;
  ai_interpretation?: any;
  therapist_notes: string;
  session_type: 'cycle_analysis' | 'pattern_synthesis' | 'integration_work';
  integration_plan?: {
    goals: string[];
    techniques: string[];
    timeline: string;
  };
}

export interface SaveAnalysisResponse {
  success: boolean;
  record: any;
  message: string;
  consultante_uuid: string;
  error?: string;
  warning?: string;
}

export interface AnalysisHistoryResponse {
  success: boolean;
  consultante_uuid: string;
  consultante_name: string;
  history: AnalysisRecord[];
  stats: {
    total_sessions: number;
    session_types: string[];
    latest_session: string | null;
  };
  error?: string;
}

export interface AnalysisRecord {
  id: number;
  kind: string;
  module_code: string;
  execution_mode: string;
  created_at: string;
  computed_result: any;
  therapist: {
    username: string;
    email: string;
  };
}

export interface ReportRequest {
  include_history: boolean;
  focus_areas: ('patterns' | 'integration' | 'prevention')[];
  therapeutic_goals: ('integration' | 'prevention' | 'growth')[];
  export_format: 'structured' | 'narrative';
}

export interface ReportResponse {
  success: boolean;
  report: {
    report_type: string;
    consultante_info: any;
    current_cycle: any;
    historical_analysis: any;
    ai_interpretation: any;
    session_history: any[];
    therapeutic_recommendations: any;
    export_metadata: any;
    disclaimer: string;
  };
  consultante_uuid: string;
  error?: string;
}

// =============================================================================
// FUNCIONES API PARA AI E INTERPRETACIÓN
// =============================================================================

/**
 * Genera interpretación AI de los ciclos Qliphoth.
 * 
 * @param consultanteUuid UUID del consultante
 * @param request Parámetros de la solicitud AI
 * @param token Token de autenticación
 * @returns Promesa con la interpretación AI
 */
export async function generateAIInterpretation(
  consultanteUuid: string,
  request: AIAnalysisRequest,
  token: string
): Promise<AIAnalysisResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/consultantes/${consultanteUuid}/qliphoth-ai-analysis/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Guarda un análisis completo de ciclos Qliphoth.
 * 
 * @param consultanteUuid UUID del consultante
 * @param request Datos del análisis a guardar
 * @param token Token de autenticación
 * @returns Promesa con confirmación del guardado
 */
export async function saveQliphothAnalysis(
  consultanteUuid: string,
  request: SaveAnalysisRequest,
  token: string
): Promise<SaveAnalysisResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/consultantes/${consultanteUuid}/qliphoth-analysis/save/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene historial de análisis Qliphoth de un consultante.
 * 
 * @param consultanteUuid UUID del consultante
 * @param token Token de autenticación
 * @param limit Límite de registros (opcional)
 * @param sessionType Tipo de sesión a filtrar (opcional)
 * @returns Promesa con historial de análisis
 */
export async function fetchAnalysisHistory(
  consultanteUuid: string,
  token: string,
  limit?: number,
  sessionType?: string
): Promise<AnalysisHistoryResponse> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (sessionType) params.append('session_type', sessionType);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(
    `${getApiBaseUrl()}/api/consultantes/${consultanteUuid}/qliphoth-analysis/history/${queryString}`,
    {
      headers: {
        'Authorization': `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Genera reporte completo de análisis Qliphoth con AI.
 * 
 * @param consultanteUuid UUID del consultante
 * @param request Parámetros del reporte
 * @param token Token de autenticación
 * @returns Promesa con reporte completo
 */
export async function generateQliphothReport(
  consultanteUuid: string,
  request: ReportRequest,
  token: string
): Promise<ReportResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/consultantes/${consultanteUuid}/qliphoth-report/generate/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// =============================================================================
// UTILIDADES PARA MANEJO DE ANÁLISIS
// =============================================================================

/**
 * Convierte análisis AI a formato para guardado.
 * 
 * @param qliphothData Datos del ciclo Qliphoth
 * @param aiInterpretation Interpretación AI
 * @param therapistNotes Notas del terapeuta
 * @param sessionType Tipo de sesión
 * @returns Request formateado para guardado
 */
export function formatAnalysisForSaving(
  qliphothData: any,
  aiInterpretation: AIAnalysisResponse | null,
  therapistNotes: string,
  sessionType: 'cycle_analysis' | 'pattern_synthesis' | 'integration_work',
  integrationPlan?: any
): SaveAnalysisRequest {
  return {
    qliphoth_data: qliphothData,
    ai_interpretation: aiInterpretation || {},
    therapist_notes: therapistNotes,
    session_type: sessionType,
    integration_plan: integrationPlan || {
      goals: [],
      techniques: [],
      timeline: ''
    }
  };
}

/**
 * Extrae resumen de un análisis guardado.
 * 
 * @param record Registro de análisis
 * @returns Resumen del análisis
 */
export function extractAnalysisSummary(record: AnalysisRecord) {
  const trabajoSombras = record.computed_result?.trabajo_sombras;
  if (!trabajoSombras) return null;

  return {
    id: record.id,
    date: record.created_at,
    sessionType: record.execution_mode,
    qliphothFocus: trabajoSombras.current_qliphoth_info?.name || 'No especificada',
    age: trabajoSombras.current_qliphoth_info?.age || 'No especificada',
    therapistNotes: trabajoSombras.therapist_synthesis || '',
    patternsDetected: Object.keys(trabajoSombras.timeline_summary?.patterns_detected || {}).length,
    hasAIInterpretation: Boolean(trabajoSombras.ai_interpretation?.success),
    therapist: record.therapist?.username || 'Desconocido'
  };
}

/**
 * Valida request de AI antes del envío.
 * 
 * @param request Request a validar
 * @returns true si es válido, string con error si no
 */
export function validateAIRequest(request: AIAnalysisRequest): true | string {
  if (!['cycle_analysis', 'pattern_synthesis', 'integration_guidance'].includes(request.analysis_type)) {
    return 'Tipo de análisis no válido';
  }
  
  if (request.analysis_type === 'integration_guidance' && !request.target_qliphoth) {
    return 'integration_guidance requiere especificar target_qliphoth';
  }
  
  return true;
}

/**
 * Genera configuración para reporte basado en objetivos terapéuticos.
 * 
 * @param goals Objetivos terapéuticos
 * @returns Configuración de reporte
 */
export function generateReportConfig(
  goals: string[]
): Omit<ReportRequest, 'include_history' | 'export_format'> {
  const focusAreas: ('patterns' | 'integration' | 'prevention')[] = [];
  const therapeuticGoals: ('integration' | 'prevention' | 'growth')[] = [];

  // Mapear objetivos a configuración
  if (goals.includes('integration') || goals.includes('shadow_work')) {
    focusAreas.push('integration');
    therapeuticGoals.push('integration');
  }
  
  if (goals.includes('prevention') || goals.includes('awareness')) {
    focusAreas.push('prevention');
    therapeuticGoals.push('prevention');
  }
  
  if (goals.includes('growth') || goals.includes('self_development')) {
    focusAreas.push('patterns');
    therapeuticGoals.push('growth');
  }

  // Defaults si no se especifica nada
  if (focusAreas.length === 0) {
    focusAreas.push('patterns', 'integration');
  }
  
  if (therapeuticGoals.length === 0) {
    therapeuticGoals.push('integration');
  }

  return {
    focus_areas: focusAreas,
    therapeutic_goals: therapeuticGoals,
  };
}

// Export objeto con todas las funciones
export const QliphothAI = {
  generateAIInterpretation,
  saveQliphothAnalysis,
  fetchAnalysisHistory,
  generateQliphothReport,
  formatAnalysisForSaving,
  extractAnalysisSummary,
  validateAIRequest,
  generateReportConfig,
};