/**
 * Symbolic Interpreter API Client
 * Frontend connector for AI-assisted symbolic reading
 */

import type {
  SymbolicInterpretation,
  SymbolicInterpretationRequest,
} from '@holistica/symbolic/tree/symbolic-interpreter.types';
import { generateSymbolicInterpretation, createFallbackInterpretation } from '@holistica/symbolic/tree/symbolic-interpreter';
import type { TreeStructuralState } from '@holistica/symbolic/tree';
import { getApiBaseUrl } from '../api-base';

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
        'Authorization': `Token ${getAuthToken()}`,
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
export async function generateAISymbolicInterpretation(
  request: SymbolicInterpretationRequest
): Promise<SymbolicInterpretation> {
  const { treeState, safetyLevel, focusAreas } = request;
  
  // First, check service availability
  const status = await checkSymbolicInterpreterStatus();
  if (!status.enabled) {
    console.warn('AI service not available, using fallback interpretation');
    return createFallbackInterpretation(treeState);
  }
  
  try {
    // Use frontend symbolic-interpreter module to generate prompt
    const aiCallback = async (prompt: string): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/symbolic-interpreter/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${getAuthToken()}`,
        },
        body: JSON.stringify({
          treeState,
          safetyLevel,
          focusAreas,
          prompt,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'AI response unsuccessful');
      }
      
      return data.aiResponse;
    };
    
    // Call frontend interpretation module with backend AI callback
    const interpretation = await generateSymbolicInterpretation(request, aiCallback);
    
    return interpretation;
    
  } catch (error) {
    console.error('Error generating AI symbolic interpretation:', error);
    
    // Fallback to non-AI interpretation
    return createFallbackInterpretation(treeState);
  }
}

/**
 * Get auth token from localStorage or session
 * TODO: Replace with your actual auth token retrieval logic
 */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  
  // Try localStorage first
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (!token) {
    console.warn('No auth token found, API request may fail');
    return '';
  }
  
  return token;
}
