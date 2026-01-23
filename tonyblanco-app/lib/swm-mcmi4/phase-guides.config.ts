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
    title: 'Fase 1: Observación — Assiyah',
    description: 'El mundo de la Acción. Observa la señal como fenómeno tangible: ¿qué emerge ante tus sentidos antes de cualquier análisis?',
    questions: [
      {
        id: 'discovery_q1',
        text: '¿Qué percibes de forma inmediata en la señal? (intensidad, variabilidad, textura)',
        placeholder: 'Describe las dimensiones que observas sin conclusiones...',
      },
      {
        id: 'discovery_q2',
        text: '¿Qué contrastes o tensiones aparecen en el plano concreto?',
        placeholder: 'Ejemplos: estabilidad vs. fluctuación, apertura vs. contención...',
      },
      {
        id: 'discovery_q3',
        text: '¿Qué elemento se manifiesta con más fuerza en el nivel material?',
        placeholder: 'Anota patrones que se repiten o destacan...',
      },
    ],
  },
  mapping: {
    phase: 'mapping',
    title: 'Fase 2: Formación — Yetzirah',
    description: 'El mundo de la Formación. Conecta la señal con las corrientes emocionales y los patrones arquetípicos que dan forma a la experiencia.',
    questions: [
      {
        id: 'mapping_q1',
        text: '¿Qué resonancia emocional evoca esta señal en ti como terapeuta?',
        placeholder: 'Ejemplos: Chesed (expansión), Gevurah (contención), Tiferet (equilibrio)...',
      },
      {
        id: 'mapping_q2',
        text: '¿Qué arquetipos o patrones formativos reconoces? (héroe, guardián, sombra...)',
        placeholder: 'Ejemplos: el héroe, el guardián, el buscador, la sombra...',
      },
      {
        id: 'mapping_q3',
        text: '¿Qué corriente emocional subyace a este patrón?',
        placeholder: 'Describe el "viaje" que percibes en la señal...',
      },
      {
        id: 'mapping_q4',
        text: '¿Cómo se relaciona con el momento vital y contexto del consultante?',
        placeholder: 'Historia personal, momento vital, entorno cultural...',
      },
    ],
  },
  interpretation: {
    phase: 'interpretation',
    title: 'Fase 3: Comprensión — Beriah',
    description: 'El mundo de la Creación intelectual. Integra lo observado y lo sentido: ¿qué significado emerge de este patrón?',
    questions: [
      {
        id: 'interpretation_q1',
        text: '¿Cuál es la tensión central que tu mente identifica?',
        placeholder: 'Ejemplo: tensión entre control y flujo, identidad y transformación...',
      },
      {
        id: 'interpretation_q2',
        text: '¿Cómo se relaciona este patrón con las esferas del Árbol de la Vida?',
        placeholder: 'Conecta la señal con el contexto actual...',
      },
      {
        id: 'interpretation_q3',
        text: '¿Qué fortalezas o recursos internos percibes?',
        placeholder: 'Capacidades de regulación, sensibilidad, integración...',
      },
      {
        id: 'interpretation_q4',
        text: '¿Qué áreas requieren trabajo o acompañamiento?',
        placeholder: 'Zonas de vulnerabilidad o trabajo pendiente...',
      },
    ],
  },
  synthesis: {
    phase: 'synthesis',
    title: 'Fase 4: Unificación — Atzilut',
    description: 'El mundo de la Emanación. Unifica todas las capas en una visión integrada: ¿cuál es la esencia de esta señal?',
    questions: [
      {
        id: 'synthesis_q1',
        text: '¿Cuál es la narrativa esencial que emana de todo el proceso?',
        placeholder: 'Sintetiza en 2–3 oraciones la "historia" de esta señal...',
      },
      {
        id: 'synthesis_q2',
        text: '¿Hacia qué dirección apunta el alma del consultante?',
        placeholder: 'Ejemplos: integración, expansión, contención, transformación...',
      },
      {
        id: 'synthesis_q3',
        text: '¿Qué misterio permanece abierto para futuras exploraciones?',
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
