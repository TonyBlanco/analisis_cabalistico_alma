/**
 * Hook: useTarotHolistic
 * 
 * React hook para interpretaciones holísticas de Tarot con IA Multi-Provider.
 * Maneja estado, loading, errores y tracking de provider utilizado.
 * 
 * IMPORTANTE: Este hook es 100% HOLÍSTICO, NO CLÍNICO.
 * - Terminología: "consultante" (NO "paciente")
 * - Multi-provider AI: Groq (prioritario) → Ollama → Gemini
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  tarotHolisticApi,
  type InterpretCardRequest,
  type InterpretCardResponse,
  type InterpretSpreadRequest,
  type InterpretSpreadResponse,
  type TarotHolisticSchema,
  type ProviderStatus,
  type ConsentCheckResponse,
} from '@/lib/api/tarot-holistic-client';


// =============================================================================
// TYPES
// =============================================================================

export interface UseTarotHolisticState {
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Provider tracking
  providerUsed: 'groq' | 'ollama' | 'gemini' | null;
  modelUsed: string | null;
  
  // Consentimiento
  hasConsent: boolean;
  consentDisclaimer: string | null;
  
  // Schema (cacheado)
  schema: TarotHolisticSchema | null;
  providerStatus: ProviderStatus | null;
  
  // Última interpretación
  lastCardInterpretation: InterpretCardResponse | null;
  lastSpreadInterpretation: InterpretSpreadResponse | null;
}

export interface UseTarotHolisticActions {
  // Schema y providers
  loadSchema: () => Promise<TarotHolisticSchema>;
  loadProviderStatus: () => Promise<ProviderStatus>;
  
  // Interpretaciones
  interpretCard: (request: InterpretCardRequest) => Promise<InterpretCardResponse>;
  interpretSpread: (request: InterpretSpreadRequest) => Promise<InterpretSpreadResponse>;
  
  // Consentimiento
  checkConsent: () => Promise<ConsentCheckResponse>;
  acceptConsent: () => void;
  
  // Utilidades
  clearError: () => void;
  reset: () => void;
}

export type UseTarotHolisticReturn = UseTarotHolisticState & UseTarotHolisticActions;


// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useTarotHolistic(): UseTarotHolisticReturn {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<'groq' | 'ollama' | 'gemini' | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  // LEGACY: Consent now granted at consultant registration - always true for educational readings
  const [hasConsent, setHasConsent] = useState(true);
  const [consentDisclaimer, setConsentDisclaimer] = useState<string | null>(null);
  const [schema, setSchema] = useState<TarotHolisticSchema | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [lastCardInterpretation, setLastCardInterpretation] = useState<InterpretCardResponse | null>(null);
  const [lastSpreadInterpretation, setLastSpreadInterpretation] = useState<InterpretSpreadResponse | null>(null);

  // Load schema on mount
  useEffect(() => {
    loadSchema().catch(console.error);
  }, []);

  // Actions
  const loadSchema = useCallback(async (): Promise<TarotHolisticSchema> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tarotHolisticApi.getSchema();
      setSchema(result);
      setConsentDisclaimer(result.disclaimer);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar esquema';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProviderStatus = useCallback(async (): Promise<ProviderStatus> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tarotHolisticApi.getProviderStatus();
      setProviderStatus(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar providers';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretCard = useCallback(async (request: InterpretCardRequest): Promise<InterpretCardResponse> => {
    // LEGACY: Consent check removed - consultant consent granted at registration
    setIsLoading(true);
    setError(null);
    try {
      const result = await tarotHolisticApi.interpretCard({
        ...request,
        options: {
          ...request.options,
          provider: request.options?.provider || 'auto',
        },
      });
      
      // Track provider usado
      setProviderUsed(result.provider_used as 'groq' | 'ollama' | 'gemini');
      setModelUsed(result.model_used);
      setLastCardInterpretation(result);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al interpretar carta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasConsent]);

  const interpretSpread = useCallback(async (request: InterpretSpreadRequest): Promise<InterpretSpreadResponse> => {
    // LEGACY: Consent check removed - consultant consent granted at registration
    setIsLoading(true);
    setError(null);
    try {
      const result = await tarotHolisticApi.interpretSpread({
        ...request,
        options: {
          ...request.options,
          provider: request.options?.provider || 'auto',
        },
      });
      
      // Track provider usado
      setProviderUsed(result.provider_used as 'groq' | 'ollama' | 'gemini');
      setModelUsed(result.model_used);
      setLastSpreadInterpretation(result);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al interpretar tirada';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasConsent]);

  const checkConsent = useCallback(async (): Promise<ConsentCheckResponse> => {
    try {
      const result = await tarotHolisticApi.checkConsent();
      setConsentDisclaimer(result.disclaimer);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar consentimiento';
      setError(message);
      throw err;
    }
  }, []);

  const acceptConsent = useCallback(() => {
    // LEGACY: This function is kept for backward compatibility
    // Consent is now automatically granted via consultant registration
    setHasConsent(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tarot_holistic_consent', 'true');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setProviderUsed(null);
    setModelUsed(null);
    setLastCardInterpretation(null);
    setLastSpreadInterpretation(null);
  }, []);

  // Restore consent from session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('tarot_holistic_consent');
      if (saved === 'true') {
        setHasConsent(true);
      }
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    providerUsed,
    modelUsed,
    hasConsent,
    consentDisclaimer,
    schema,
    providerStatus,
    lastCardInterpretation,
    lastSpreadInterpretation,
    
    // Actions
    loadSchema,
    loadProviderStatus,
    interpretCard,
    interpretSpread,
    checkConsent,
    acceptConsent,
    clearError,
    reset,
  };
}

export default useTarotHolistic;
