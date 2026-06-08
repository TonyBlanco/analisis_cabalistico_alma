/**
 * API Client for Tarot Holístico AI Interpretations
 * 
 * IMPORTANTE: Este módulo es 100% HOLÍSTICO, NO CLÍNICO.
 * - Terminología: "consultante" (NO "paciente"), "lectura simbólica" (NO "diagnóstico")
 * - Multi-provider AI: Groq (prioritario) → Ollama → Gemini
 * 
 * Endpoints:
 * - GET  /api/ai/tarot/schema          - Esquema y providers disponibles
 * - GET  /api/ai/tarot/provider-status - Estado de providers AI
 * - POST /api/ai/tarot/interpretCard   - Interpretar carta individual
 * - POST /api/ai/tarot/interpretSpread - Interpretar tirada completa
 * - GET  /api/ai/tarot/consent-check   - Verificar consentimiento
 */

import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';


// =============================================================================
// TYPES
// =============================================================================

export interface TarotProvider {
  id: 'groq' | 'ollama' | 'gemini';
  name: string;
  model: string;
  available: boolean;
  priority: number;
  rate_limit: string;
}

export interface TarotDeck {
  id: string;
  name: string;
  major_arcana: number;
  minor_arcana: number;
}

export interface SpreadType {
  id: string;
  name: string;
  positions: number;
}

export interface TarotHolisticSchema {
  decks: TarotDeck[];
  spreadTypes: SpreadType[];
  providers: TarotProvider[];
  current_provider: string | null;
  current_model: string | null;
  version: string;
  mode: 'holistic';
  ai_enabled: boolean;
  disclaimer: string;
}

export interface ProviderStatus {
  enabled: boolean;
  provider: string | null;
  model: string | null;
  error: string | null;
  ai_tarot_enabled: boolean;
}

export interface CardContext {
  question?: string;
  consultantId?: number;
  consultantName?: string;
  birthDate?: string;
  instanceId?: string;
}

export interface InterpretCardRequest {
  arcanaId: string;
  arcanaName?: string;
  position?: string;
  reversed?: boolean;
  tarotSystem?: string;
  context?: CardContext;
  options?: {
    temperature?: number;
    provider?: 'auto' | 'groq' | 'ollama' | 'gemini';
  };
}

export interface InterpretCardResponse {
  text: string;
  themes: string[];
  confidence: number;
  provider_used: string;
  model_used: string;
  holistic_disclaimer: string;
  card: {
    arcanaId: string;
    arcanaName: string;
    position: string;
    reversed: boolean;
    tarotSystem: string;
  };
  timestamp: string;
}

export interface SpreadCard {
  arcanaId: string;
  arcanaName?: string;
  position: string;
  reversed?: boolean;
}

export interface InterpretSpreadRequest {
  spreadType: string;
  tarotSystem?: string;
  cards: SpreadCard[];
  context?: CardContext;
  options?: {
    temperature?: number;
    provider?: 'auto' | 'groq' | 'ollama' | 'gemini';
  };
}

export interface InterpretSpreadResponse {
  summary: string;
  cardInterpretations: Array<{
    arcanaId: string;
    text: string;
    themes: string[];
  }>;
  symbolic_insights: string[];
  confidence: number;
  provider_used: string;
  model_used: string;
  holistic_disclaimer: string;
  spread: {
    type: string;
    tarotSystem: string;
    cardCount: number;
  };
  timestamp: string;
}

export interface ConsentCheckResponse {
  consent_required: boolean;
  disclaimer: string;
  terms_url: string;
  ai_tarot_enabled: boolean;
}

export interface TarotHolisticError {
  error: string;
  code: string;
}


// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const API_BASE = getApiBaseUrl();
const TAROT_AI_BASE = `${API_BASE}/ai/tarot`;


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getAuthHeaders(token?: string): HeadersInit {
  const authToken = token || getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Token ${authToken}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
}


// =============================================================================
// API CLIENT
// =============================================================================

export const tarotHolisticApi = {
  /**
   * GET /api/ai/tarot/schema
   * Obtiene el esquema completo del sistema Tarot Holístico
   */
  async getSchema(token?: string): Promise<TarotHolisticSchema> {
    const response = await fetch(`${TAROT_AI_BASE}/schema/`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleResponse<TarotHolisticSchema>(response);
  },

  /**
   * GET /api/ai/tarot/provider-status
   * Obtiene el estado actual de los providers AI
   */
  async getProviderStatus(token?: string): Promise<ProviderStatus> {
    const response = await fetch(`${TAROT_AI_BASE}/provider-status/`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleResponse<ProviderStatus>(response);
  },

  /**
   * POST /api/ai/tarot/interpretCard
   * Interpreta una carta de Tarot de forma holística
   */
  async interpretCard(
    request: InterpretCardRequest,
    token?: string
  ): Promise<InterpretCardResponse> {
    const response = await fetch(`${TAROT_AI_BASE}/interpretCard/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    });
    return handleResponse<InterpretCardResponse>(response);
  },

  /**
   * POST /api/ai/tarot/interpretSpread
   * Interpreta una tirada completa de Tarot
   */
  async interpretSpread(
    request: InterpretSpreadRequest,
    token?: string
  ): Promise<InterpretSpreadResponse> {
    const response = await fetch(`${TAROT_AI_BASE}/interpretSpread/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    });
    return handleResponse<InterpretSpreadResponse>(response);
  },

  /**
   * GET /api/ai/tarot/consent-check
   * Verifica el estado de consentimiento holístico
   */
  async checkConsent(token?: string): Promise<ConsentCheckResponse> {
    const response = await fetch(`${TAROT_AI_BASE}/consent-check/`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleResponse<ConsentCheckResponse>(response);
  },
};


// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export default tarotHolisticApi;

// Named exports for destructuring
export const {
  getSchema,
  getProviderStatus,
  interpretCard,
  interpretSpread,
  checkConsent,
} = tarotHolisticApi;
