/**
 * Symbolic Interpreter API Client
 * Frontend connector for AI-assisted symbolic reading
 */

import type {
  SymbolicInterpretation,
  SymbolicInterpretationRequest,
} from '@holistica/symbolic/tree/symbolic-interpreter.types';
import { createFallbackInterpretation } from '@holistica/symbolic/tree/symbolic-interpreter';
import type { TreeStructuralState } from '@holistica/symbolic/tree';
import { getApiBaseUrl } from '../api-base';
import { getAuthHeaders } from '../api';
import { interpretViaApi } from './symbolic-api-client';

const API_BASE_URL = getApiBaseUrl();

/**
 * Check if Symbolic Interpreter AI service is available
 */
export async function checkSymbolicInterpreterStatus(): Promise<{
  enabled: boolean;
  errorMessage?: string;
  version: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/symbolic-interpreter/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    if (!response.ok) {
      return { enabled: false, version: '1.0.0', errorMessage: 'Service unavailable' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking symbolic interpreter status:', error);
    return { enabled: false, version: '1.0.0', errorMessage: 'Network error' };
  }
}

/**
 * Generate AI-assisted symbolic interpretation
 * 
 * @param request - Interpretation request with TreeStructuralState
 * @returns SymbolicInterpretation or fallback interpretation
 */
export type SwmV3ConsentState = {
  mode: 'no_store' | 'store_anonymized' | 'store_with_consent';
  acceptedAt: string;
  version: string;
};

export async function generateAISymbolicInterpretation(
  request: SymbolicInterpretationRequest & { swmV3Consent?: SwmV3ConsentState | boolean },
): Promise<SymbolicInterpretation> {
  const { treeState } = request;

  if (!request.swmV3Consent) {
    throw new Error('Se requiere consentimiento SWM v3 para la interpretación simbólica con IA.');
  }

  const status = await checkSymbolicInterpreterStatus();
  if (!status.enabled) {
    return createFallbackInterpretation(treeState);
  }

  const consentPayload = typeof request.swmV3Consent === 'object'
    ? {
        swmV3Consent: true,
        swmV3ConsentMode: request.swmV3Consent.mode,
        swmV3ConsentVersion: request.swmV3Consent.version,
        swmV3ConsentAcceptedAt: request.swmV3Consent.acceptedAt,
      }
    : { swmV3Consent: true };

  try {
    const result = await interpretViaApi({ ...request, ...consentPayload });
    return result.interpretation;
  } catch {
    return createFallbackInterpretation(treeState);
  }
}


