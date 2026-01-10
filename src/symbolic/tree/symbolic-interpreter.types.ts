/**
 * Symbolic Interpreter Types — AI-Assisted Symbolic Reading
 * 
 * CRITICAL SAFETY RULES:
 * 1. NO clinical diagnosis
 * 2. NO personal advice
 * 3. NO psychological labels
 * 4. NO deterministic statements
 * 5. ONLY structural-symbolic observations
 * 
 * This module ONLY reads TreeStructuralState.
 * It NEVER accesses personal data directly.
 */

import type { TreeStructuralState } from './tree-structural-state.types';

/**
 * Safety level for AI interpretation
 */
export type SymbolicSafetyLevel = 'educational' | 'formative' | 'observational';

/**
 * Type of symbolic observation
 */
export type SymbolicObservationType = 
  | 'pattern-recognition'
  | 'structural-analysis'
  | 'symbolic-comparison'
  | 'educational-context';

/**
 * Individual symbolic observation from AI
 */
export interface SymbolicObservation {
  type: SymbolicObservationType;
  title: string;
  content: string;
  /**
   * Safety flag: true if observation contains prohibited content
   */
  containsProhibitedContent?: boolean;
}

/**
 * AI-generated symbolic interpretation (read-only)
 */
export interface SymbolicInterpretation {
  /**
   * Source TreeStructuralState (immutable reference)
   */
  sourceState: TreeStructuralState;
  
  /**
   * Timestamp of interpretation generation
   */
  timestamp: string;
  
  /**
   * Safety level applied
   */
  safetyLevel: SymbolicSafetyLevel;
  
  /**
   * Array of symbolic observations
   */
  observations: SymbolicObservation[];
  
  /**
   * Educational context (optional)
   */
  educationalContext?: string;
  
  /**
   * Safety validation result
   */
  safetyValidation: {
    passed: boolean;
    warnings: string[];
  };
}

/**
 * Request for AI symbolic interpretation
 */
export interface SymbolicInterpretationRequest {
  treeState: TreeStructuralState;
  safetyLevel: SymbolicSafetyLevel;
  /**
   * Optional focus areas (e.g., 'flows', 'sefirot-roles')
   */
  focusAreas?: string[];
}

/**
 * Metadata about interpreter configuration
 */
export interface SymbolicInterpreterMeta {
  version: '1.0.0';
  safetyRules: readonly string[];
  prohibitedTerms: readonly string[];
  disclaimerText: string;
}

export const SYMBOLIC_INTERPRETER_META: SymbolicInterpreterMeta = {
  version: '1.0.0',
  safetyRules: [
    'NO clinical diagnosis',
    'NO personal advice',
    'NO psychological labels',
    'NO deterministic statements',
    'ONLY structural-symbolic observations',
    'NO access to personal data',
  ],
  prohibitedTerms: [
    'diagnóstico',
    'diagnosis',
    'trastorno',
    'disorder',
    'patología',
    'pathology',
    'enfermedad',
    'disease',
    'debes',
    'must',
    'tienes que',
    'have to',
    'definitivamente',
    'definitely',
    'siempre',
    'always',
    'nunca',
    'never',
  ],
  disclaimerText: 'Lectura simbólica asistida (IA) · No interpretación clínica · Solo propósitos formativos y pedagógicos',
};
