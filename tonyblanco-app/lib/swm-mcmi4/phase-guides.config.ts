/**
 * Phase Guidance Configuration for MCMI-4 Místico Workspace
 * 
 * Defines interpretative questions for each phase (discovery, mapping, interpretation, synthesis).
 * Questions guide the therapist's thinking without prescribing conclusions.
 * 
 * NO clinical language, NO diagnostic inference, NO automated AI generation.
 */

export type PhaseName = 'discovery' | 'mapping' | 'interpretation' | 'synthesis';

export interface GuideQuestion {
  id: string;
  text: string;
  placeholder: string;
}

export interface PhaseGuide {
  phase: PhaseName;
  title: string;
  description: string;
  questions: GuideQuestion[];
}

export const phaseGuides: Record<PhaseName, PhaseGuide> = {
  discovery: {
    phase: 'discovery',
    title: 'Fase 1: Exploración',
    description: 'Observa la señal sin interpretarla aún. ¿Qué patrones emergen de forma inmediata?',
    questions: [
      {
        id: 'discovery_q1',
        text: '¿Qué dimensiones simbólicas destacan en la señal? (intensidad, variabilidad, etc.)',
        placeholder: 'Describe las dimensiones que observas sin conclusiones...',
      },
      {
        id: 'discovery_q2',
        text: '¿Qué contrastes o polaridades notas en las respuestas?',
        placeholder: 'Ejemplos: estabilidad vs. fluctuación, apertura vs. contención...',
      },
      {
        id: 'discovery_q3',
        text: '¿Hay algún elemento que "llama la atención" de forma recurrente?',
        placeholder: 'Anota patrones que se repiten o destacan...',
      },
    ],
  },
  mapping: {
    phase: 'mapping',
    title: 'Fase 2: Mapeo',
    description: 'Conecta la señal con marcos simbólicos. ¿Cómo se relaciona con arquetipos, esferas cabalísticas, o narrativas conocidas?',
    questions: [
      {
        id: 'mapping_q1',
        text: '¿A qué esfera(s) del Árbol de la Vida resuena esta señal?',
        placeholder: 'Ejemplos: Chesed (expansión), Gevurah (contención), Tiferet (equilibrio)...',
      },
      {
        id: 'mapping_q2',
        text: '¿Qué arquetipos o patrones simbólicos reconoces en la señal?',
        placeholder: 'Ejemplos: el héroe, el guardián, el buscador, la sombra...',
      },
      {
        id: 'mapping_q3',
        text: '¿Hay elementos que sugieren una narrativa o recorrido interno?',
        placeholder: 'Describe el "viaje" que percibes en la señal...',
      },
      {
        id: 'mapping_q4',
        text: '¿Qué elementos contextuales (externos al test) informan esta lectura?',
        placeholder: 'Historia personal, momento vital, entorno cultural...',
      },
    ],
  },
  interpretation: {
    phase: 'interpretation',
    title: 'Fase 3: Interpretación',
    description: 'Integra observación y mapeo. ¿Qué significa este patrón para el consultante?',
    questions: [
      {
        id: 'interpretation_q1',
        text: '¿Qué tensión central o nudo interpretativo identificas?',
        placeholder: 'Ejemplo: tensión entre control y flujo, identidad y transformación...',
      },
      {
        id: 'interpretation_q2',
        text: '¿Cómo interpretas los ejes simbólicos en relación al momento vital del consultante?',
        placeholder: 'Conecta la señal con el contexto actual...',
      },
      {
        id: 'interpretation_q3',
        text: '¿Qué recursos internos (fortalezas) observas en la señal?',
        placeholder: 'Capacidades de regulación, sensibilidad, integración...',
      },
      {
        id: 'interpretation_q4',
        text: '¿Qué áreas requieren atención o acompañamiento?',
        placeholder: 'Zonas de vulnerabilidad o trabajo pendiente...',
      },
    ],
  },
  synthesis: {
    phase: 'synthesis',
    title: 'Fase 4: Síntesis',
    description: 'Cierra el proceso interpretativo. ¿Cuál es la lectura integrada de esta señal?',
    questions: [
      {
        id: 'synthesis_q1',
        text: '¿Cuál es la narrativa simbólica central que emerge de este proceso?',
        placeholder: 'Sintetiza en 2–3 oraciones la "historia" de esta señal...',
      },
      {
        id: 'synthesis_q2',
        text: '¿Qué movimiento o dirección sugiere la interpretación?',
        placeholder: 'Ejemplos: integración, expansión, contención, transformación...',
      },
      {
        id: 'synthesis_q3',
        text: '¿Qué preguntas quedan abiertas para sesiones futuras?',
        placeholder: 'Aspectos que requieren seguimiento o profundización...',
      },
    ],
  },
};

/**
 * Get guide for a specific phase
 */
export function getPhaseGuide(phase: PhaseName): PhaseGuide {
  return phaseGuides[phase];
}

/**
 * Get all question IDs for a phase (useful for persistence keys)
 */
export function getPhaseQuestionIds(phase: PhaseName): string[] {
  return phaseGuides[phase].questions.map(q => q.id);
}

/**
 * Validate that a response object has all required question IDs
 */
export function validatePhaseResponses(phase: PhaseName, responses: Record<string, string>): boolean {
  const requiredIds = getPhaseQuestionIds(phase);
  return requiredIds.every(id => id in responses);
}

/**
 * Get completion status for a phase based on responses
 */
export function getPhaseCompletionStatus(
  phase: PhaseName,
  responses: Record<string, string>
): 'pending' | 'in-progress' | 'completed' {
  const requiredIds = getPhaseQuestionIds(phase);
  const answeredIds = requiredIds.filter(id => {
    const answer = responses[id];
    return answer && answer.trim().length > 0;
  });
  
  if (answeredIds.length === 0) return 'pending';
  if (answeredIds.length < requiredIds.length) return 'in-progress';
  return 'completed';
}
