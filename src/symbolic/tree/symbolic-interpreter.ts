/**
 * Symbolic Interpreter — AI-Assisted Symbolic Reading Module
 * 
 * SAFETY-FIRST ARCHITECTURE:
 * - Reads ONLY TreeStructuralState (immutable)
 * - NO access to personal data
 * - NO clinical conclusions
 * - Content filtering for prohibited terms
 * - Educational and formative language only
 */

import type {
  SymbolicInterpretation,
  SymbolicInterpretationRequest,
  SymbolicObservation,
  SymbolicObservationType,
  SymbolicSafetyLevel,
} from './symbolic-interpreter.types';
import { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
import type { TreeStructuralState, TreeFlow, TreeSefirah } from './tree-structural-state.types';

/**
 * Validates that content does not contain prohibited terms
 */
function validateSafetyContent(content: string): { passed: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const lowercaseContent = content.toLowerCase();
  
  for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
    if (lowercaseContent.includes(term.toLowerCase())) {
      warnings.push(`Prohibited term detected: "${term}"`);
    }
  }
  
  return {
    passed: warnings.length === 0,
    warnings,
  };
}

/**
 * Generates prompt for AI symbolic interpretation
 * CRITICAL: Prompt must enforce safety rules
 */
function generateSymbolicPrompt(treeState: TreeStructuralState, safetyLevel: SymbolicSafetyLevel): string {
  const { source, sefirot, flows, notes } = treeState;
  
  // Serialize structural data (NO personal info)
  const sefiraData = sefirot.map(s => ({
    id: s.id,
    role: s.role,
    activation: s.activation,
  }));
  
  const flowData = flows.map(f => ({
    from: f.from,
    to: f.to,
    polarity: f.polarity,
    intensity: f.intensity,
  }));
  
  const prompt = `INSTRUCCIONES CRÍTICAS DE SEGURIDAD:
- NO emitas diagnósticos clínicos
- NO des consejos personales
- NO uses etiquetas psicológicas
- NO hagas afirmaciones deterministas
- USA lenguaje simbólico neutral y educativo
- ENFÓCATE en patrones estructurales observables

CONTEXTO SIMBÓLICO:
Método: ${source.method}
Estado estructural del Árbol de la Vida

SEFIROT (${sefirot.length} elementos):
${sefiraData.map(s => `- ${s.id}: rol=${s.role}, activación=${s.activation.toFixed(2)}`).join('\n')}

FLUJOS (${flows.length} conexiones):
${flowData.map(f => `- ${f.from}→${f.to}: polaridad=${f.polarity}, intensidad=${f.intensity}`).join('\n')}

TAREA:
Genera 3-4 observaciones simbólicas educativas sobre este patrón estructural.
Cada observación debe tener:
1. Un título breve
2. Contenido descriptivo simbólico (2-3 frases)

FORMATO DE RESPUESTA (JSON):
{
  "observations": [
    {
      "type": "pattern-recognition",
      "title": "Título de la observación",
      "content": "Descripción simbólica neutral sin interpretación clínica"
    }
  ]
}

TIPOS PERMITIDOS: pattern-recognition, structural-analysis, symbolic-comparison, educational-context

Genera SOLO el JSON sin texto adicional.`;

  return prompt;
}

/**
 * Parses AI response and validates safety
 */
function parseAIResponse(rawResponse: string): SymbolicObservation[] {
  try {
    // Extract JSON from response (AI might add markdown)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.observations || !Array.isArray(parsed.observations)) {
      throw new Error('Invalid response structure: missing observations array');
    }
    
    // Validate each observation
    const validObservations: SymbolicObservation[] = [];
    
    for (const obs of parsed.observations) {
      const validation = validateSafetyContent(obs.content);
      
      validObservations.push({
        type: obs.type as SymbolicObservationType,
        title: obs.title || 'Observación simbólica',
        content: obs.content,
        containsProhibitedContent: !validation.passed,
      });
    }
    
    return validObservations;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

/**
 * Main function: Generate AI-assisted symbolic interpretation
 * 
 * @param request - Interpretation request with TreeStructuralState
 * @param aiCallback - Async function that calls AI API (injected)
 * @returns SymbolicInterpretation with observations
 */
export async function generateSymbolicInterpretation(
  request: SymbolicInterpretationRequest,
  aiCallback: (prompt: string) => Promise<string>
): Promise<SymbolicInterpretation> {
  const { treeState, safetyLevel } = request;
  
  // Generate safe prompt
  const prompt = generateSymbolicPrompt(treeState, safetyLevel);
  
  // Call AI (external dependency)
  let rawResponse: string;
  try {
    rawResponse = await aiCallback(prompt);
  } catch (error) {
    console.error('AI callback error:', error);
    rawResponse = '{"observations": []}';
  }
  
  // Parse and validate response
  const observations = parseAIResponse(rawResponse);
  
  // Overall safety validation
  const allWarnings: string[] = [];
  for (const obs of observations) {
    if (obs.containsProhibitedContent) {
      const validation = validateSafetyContent(obs.content);
      allWarnings.push(...validation.warnings);
    }
  }
  
  const interpretation: SymbolicInterpretation = {
    sourceState: treeState,
    timestamp: new Date().toISOString(),
    safetyLevel,
    observations: observations.filter(o => !o.containsProhibitedContent),
    safetyValidation: {
      passed: allWarnings.length === 0,
      warnings: allWarnings,
    },
  };
  
  return interpretation;
}

/**
 * Validates TreeStructuralState before interpretation
 * Ensures no personal data leakage
 */
export function validateTreeStateForInterpretation(treeState: TreeStructuralState): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check that source only contains method info (no patient data)
  if (!treeState.source || !treeState.source.method) {
    errors.push('TreeStructuralState missing source metadata');
  }
  
  // Check sefirot array
  if (!Array.isArray(treeState.sefirot) || treeState.sefirot.length !== 10) {
    errors.push('TreeStructuralState must have exactly 10 sefirot');
  }
  
  // Check flows array
  if (!Array.isArray(treeState.flows)) {
    errors.push('TreeStructuralState missing flows array');
  }
  
  // Verify NO personal data in notes
  if (treeState.notes?.disclaimer && typeof treeState.notes.disclaimer === 'string') {
    const notesLower = treeState.notes.disclaimer.toLowerCase();
    const personalDataIndicators = ['nombre', 'name', 'fecha de nacimiento', 'birth date', 'edad', 'age'];
    
    for (const indicator of personalDataIndicators) {
      if (notesLower.includes(indicator)) {
        errors.push(`Personal data indicator detected in notes: "${indicator}"`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a fallback interpretation when AI fails
 */
export function createFallbackInterpretation(treeState: TreeStructuralState): SymbolicInterpretation {
  const primarySefirot = treeState.sefirot.filter(s => s.role === 'dominant');
  const harmonicFlows = treeState.flows.filter(f => f.polarity === 'harmonic');
  
  const fallbackObservations: SymbolicObservation[] = [
    {
      type: 'structural-analysis',
      title: 'Estructura básica identificada',
      content: `Este patrón presenta ${primarySefirot.length} sefirot primarias y ${treeState.flows.length} conexiones estructurales.`,
    },
    {
      type: 'pattern-recognition',
      title: 'Flujos armónicos observados',
      content: `Se identifican ${harmonicFlows.length} flujos de polaridad armónica en la estructura.`,
    },
    {
      type: 'educational-context',
      title: 'Contexto metodológico',
      content: `Método aplicado: ${treeState.source.method}. Los patrones reflejan la aplicación determinística del método simbólico.`,
    },
  ];
  
  return {
    sourceState: treeState,
    timestamp: new Date().toISOString(),
    safetyLevel: 'educational',
    observations: fallbackObservations,
    educationalContext: 'Interpretación generada sin asistencia de IA (modo fallback)',
    safetyValidation: {
      passed: true,
      warnings: [],
    },
  };
}
