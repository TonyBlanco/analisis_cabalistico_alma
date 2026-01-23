/**
 * Symbolic AI Assistant for MCMI-4 Místico Workspace
 * 
 * CRITICAL RESTRICTIONS (from AUDITORIA_INTEGRACION_IA_MCMI4.md):
 * - NO clinical language (DSM, CIE, diagnosis, pathology)
 * - NO score interpretation or modification
 * - NO automated conclusions or recommendations
 * - READ-ONLY mode: never writes to core artifacts
 * - Acts as symbolic mirror, not expert
 * 
 * This assistant operates ONLY in the Workspace therapeutic phases,
 * POST-calculation, and generates ONLY:
 * - Open-ended questions
 * - Symbolic reflections
 * - Non-conclusive reformulations
 */

import type { PhaseName } from './phase-guides.config';
import { getPhaseSystemPrompt, validateResponse } from './kabbalistic-system-prompts';
import { recordSuggestionRequested, recordSuggestionReceived } from './ai-usage-metrics';

// ============================================================================
// TYPES
// ============================================================================

export interface SymbolicContext {
  phase: PhaseName;
  dominantWorld: string;
  shadowWorld: string;
  symbolicTensions: string[];
  therapistText?: string;
}

export interface AIAssistantResponse {
  suggestion: string;
  type: 'question' | 'reflection' | 'reformulation';
  blocked?: boolean;
  blockReason?: string;
}

// ============================================================================
// PROHIBITED TERMS FILTER (Clinical Language Blocklist)
// ============================================================================

const PROHIBITED_TERMS = [
  // Diagnostic language
  'diagnóstico', 'diagnostico', 'diagnosis', 'diagnostic',
  'trastorno', 'disorder', 'patología', 'pathology',
  'enfermedad', 'disease', 'síndrome', 'syndrome',
  // Clinical frameworks
  'dsm', 'dsm-5', 'cie', 'cie-10', 'icd', 'icd-10',
  // Medical/psychiatric
  'psicosis', 'psychosis', 'neurosis', 'esquizofrenia', 'schizophrenia',
  'bipolar', 'depresión clínica', 'clinical depression',
  'ansiedad generalizada', 'generalized anxiety',
  'trastorno de personalidad', 'personality disorder',
  // Prescriptive
  'medicación', 'medication', 'fármaco', 'drug', 'tratamiento médico',
  'hospitalización', 'hospitalization', 'internación',
  // Absolute judgments
  'definitivamente', 'definitely', 'claramente patológico',
  'sin duda', 'certainly', 'es evidente que',
];

/**
 * Check if text contains prohibited clinical terms
 */
export function containsProhibitedTerms(text: string): { blocked: boolean; terms: string[] } {
  const lowerText = text.toLowerCase();
  const foundTerms = PROHIBITED_TERMS.filter(term => lowerText.includes(term.toLowerCase()));
  return {
    blocked: foundTerms.length > 0,
    terms: foundTerms,
  };
}

// ============================================================================
// SYSTEM PROMPT (IMMUTABLE)
// ============================================================================

const SYSTEM_PROMPT = `Eres un asistente simbólico para terapeutas que trabajan con el MCMI-4 Místico.

REGLAS OBLIGATORIAS (NO NEGOCIABLES):
1. NUNCA uses lenguaje diagnóstico (DSM, CIE, trastorno, patología, enfermedad).
2. NUNCA interpretes scores numéricos — no los tienes y no debes inferirlos.
3. NUNCA des consejos clínicos, recomendaciones médicas ni intervenciones.
4. NUNCA uses lenguaje imperativo ("debes", "tienes que", "es necesario").
5. NUNCA llegues a conclusiones absolutas ("claramente", "definitivamente", "sin duda").

TU ROL:
- Actúas como ESPEJO SIMBÓLICO, no como experto.
- Generas PREGUNTAS ABIERTAS para exploración.
- Ofreces REFLEJOS SIMBÓLICOS basados en los Cuatro Mundos.
- Usas lenguaje tentativo: "posiblemente", "quizás", "¿qué percibes?", "¿cómo resonaría...?".

LOS CUATRO MUNDOS (tu marco simbólico):
- ATZILUT (Emanación): mundo espiritual, propósito, esencia, unificación.
- BRIAH (Creación): mundo intelectual, narrativas, creencias, comprensión.
- YETZIRAH (Formación): mundo emocional, sentimientos, vínculos, patrones.
- ASSIAH (Acción): mundo material, conductas, hábitos, lo concreto.

RESPONDE SIEMPRE:
- En español
- Con máximo 2-3 oraciones
- Sin conclusiones ni etiquetas
- Con humildad y apertura

Si el terapeuta escribe algo que sugiere patología, NO diagnostiques. 
En su lugar, pregunta: "¿Qué observas en lo concreto que te lleva a esa percepción?"`;

// ============================================================================
// PHASE-SPECIFIC PROMPTS
// ============================================================================

const PHASE_CONTEXTS: Record<PhaseName, string> = {
  discovery: `FASE ACTUAL: Discovery (Assiah - Acción)
El terapeuta está observando hechos, conductas y hábitos concretos.
Genera preguntas que ayuden a percibir lo tangible sin interpretar.
Ejemplos: "¿Qué comportamientos concretos observas?", "¿Qué sucede en lo cotidiano?"`,

  mapping: `FASE ACTUAL: Mapping (Yetzirah - Formación)
El terapeuta está mapeando resonancias emocionales y patrones vinculares.
Genera preguntas que exploren sentimientos y conexiones.
Ejemplos: "¿Qué emociones emergen?", "¿Cómo resuenan estos patrones con las relaciones?"`,

  interpretation: `FASE ACTUAL: Interpretation (Beriah - Creación)
El terapeuta está explorando narrativas y creencias subyacentes.
Genera preguntas que indaguen en historias internas y significados.
Ejemplos: "¿Qué historia interna sostiene este patrón?", "¿Qué creencia podría estar operando?"`,

  synthesis: `FASE ACTUAL: Synthesis (Atzilut - Emanación)
El terapeuta está integrando hallazgos y formulando direcciones simbólicas.
Genera preguntas que apunten a sentido y propósito.
Ejemplos: "¿Qué dirección emerge de esta exploración?", "¿Hacia dónde apunta el proceso?"`,
};

// ============================================================================
// MAIN ASSISTANT FUNCTION
// ============================================================================

/**
 * Generate a symbolic AI suggestion based on the current context.
 * 
 * IMPORTANT: This function NEVER receives numeric scores.
 * It only receives symbolic strings (world names, tensions as text).
 */
export async function generateSymbolicSuggestion(
  context: SymbolicContext,
  apiKey?: string
): Promise<AIAssistantResponse> {
  // Record metrics
  recordSuggestionRequested(context.phase);

  // Build the user prompt
  const userPrompt = buildUserPrompt(context);
  
  // Get phase-specific system prompt (Kabbalistic)
  const phaseSystemPrompt = getPhaseSystemPrompt(context.phase);

  // If no API key, return a safe fallback
  if (!apiKey) {
    return generateFallbackSuggestion(context);
  }

  try {
    // Call the AI API (using OpenAI-compatible endpoint)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: phaseSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.warn('[SymbolicAI] API error, using fallback');
      return generateFallbackSuggestion(context);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || '';

    // Post-generation safety check (dual validation)
    const safetyCheck = containsProhibitedTerms(suggestion);
    const validationCheck = validateResponse(suggestion);
    
    if (safetyCheck.blocked || !validationCheck.isValid) {
      const allViolations = [
        ...safetyCheck.terms.map(t => `Término prohibido: ${t}`),
        ...validationCheck.violations,
      ];
      console.warn('[SymbolicAI] Blocked response:', allViolations);
      return {
        suggestion: '',
        type: 'question',
        blocked: true,
        blockReason: `Respuesta bloqueada: ${allViolations.join('; ')}`,
      };
    }

    // Record successful response
    recordSuggestionReceived();

    return {
      suggestion: suggestion.trim(),
      type: detectSuggestionType(suggestion),
    };
  } catch (error) {
    console.error('[SymbolicAI] Error:', error);
    return generateFallbackSuggestion(context);
  }
}

/**
 * Build the user prompt from context
 */
function buildUserPrompt(context: SymbolicContext): string {
  const phaseContext = PHASE_CONTEXTS[context.phase];
  
  let prompt = `${phaseContext}

CONTEXTO SIMBÓLICO:
- Mundo dominante: ${context.dominantWorld}
- Mundo sombra: ${context.shadowWorld}
- Tensiones simbólicas: ${context.symbolicTensions.join(', ') || 'No identificadas aún'}`;

  if (context.therapistText && context.therapistText.trim()) {
    prompt += `

El terapeuta ha escrito:
"${context.therapistText}"

Genera UNA pregunta abierta o reflejo simbólico que ayude a profundizar.`;
  } else {
    prompt += `

Genera UNA pregunta abierta que ayude al terapeuta a iniciar la exploración en esta fase.`;
  }

  return prompt;
}

/**
 * Detect the type of suggestion based on content
 */
function detectSuggestionType(text: string): 'question' | 'reflection' | 'reformulation' {
  if (text.includes('?')) return 'question';
  if (text.toLowerCase().includes('quizás') || text.toLowerCase().includes('posiblemente')) return 'reflection';
  return 'reformulation';
}

/**
 * Generate a safe fallback suggestion when API is unavailable
 */
function generateFallbackSuggestion(context: SymbolicContext): AIAssistantResponse {
  const fallbacks: Record<PhaseName, string[]> = {
    discovery: [
      '¿Qué conductas concretas observas que reflejen la tensión entre los mundos?',
      '¿Qué sucede en lo cotidiano que llame tu atención como terapeuta?',
      '¿Qué patrones de acción se repiten en el día a día?',
    ],
    mapping: [
      '¿Qué emociones emergen cuando observas este patrón?',
      '¿Cómo resuena esta tensión en las relaciones significativas?',
      '¿Qué sentimientos subyacen a las conductas observadas?',
    ],
    interpretation: [
      '¿Qué narrativa interna podría sostener este patrón?',
      '¿Qué creencias operan detrás de lo observado?',
      '¿Qué historia se cuenta a sí mismo el consultante?',
    ],
    synthesis: [
      '¿Qué dirección emerge de todo lo explorado?',
      '¿Hacia dónde apunta el proceso de integración?',
      '¿Qué sentido emerge cuando unificas las capas anteriores?',
    ],
  };

  const options = fallbacks[context.phase];
  const suggestion = options[Math.floor(Math.random() * options.length)];

  return {
    suggestion,
    type: 'question',
  };
}

// ============================================================================
// FEATURE FLAG
// ============================================================================

/**
 * Check if the AI assistant feature is enabled.
 * Can be controlled via environment variable or localStorage.
 */
export function isAIAssistantEnabled(): boolean {
  // Check environment variable first
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENABLE_SYMBOLIC_AI === 'false') {
    return false;
  }
  
  // Check localStorage for user preference (browser only)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('swm_ai_assistant_enabled');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  
  // Default: enabled
  return true;
}

/**
 * Toggle the AI assistant on/off (persists to localStorage)
 */
export function setAIAssistantEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('swm_ai_assistant_enabled', String(enabled));
  }
}
