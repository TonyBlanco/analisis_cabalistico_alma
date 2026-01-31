/**
 * Generative Questions Engine
 * 
 * Genera preguntas terapéuticas cruzando información de múltiples sistemas
 * Con alta gobernanza - solo preguntas, nunca diagnósticos
 */

import type { 
  GenerativeQuestion, 
  AnySystemReading,
  CrossSystemPattern,
  SymbolicSystem,
} from './types';

// ============================================================================
// QUESTION TEMPLATES
// ============================================================================

interface QuestionTemplate {
  id: string;
  template: string;
  depth: 'surface' | 'medium' | 'deep';
  requiredSystems: SymbolicSystem[];
  themes: string[];
  placeholders: string[];
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // SURFACE LEVEL - Observational
  {
    id: 'obs_1',
    template: '¿Qué notas cuando observas que {system1_element} y {system2_element} aparecen juntos en tu mapa?',
    depth: 'surface',
    requiredSystems: [],
    themes: ['observación', 'conexión'],
    placeholders: ['system1_element', 'system2_element'],
  },
  {
    id: 'obs_2',
    template: '¿Cómo resuena en ti la presencia de {tarot_card} junto con la energía de {sefira}?',
    depth: 'surface',
    requiredSystems: ['tarot', 'cabala'],
    themes: ['resonancia', 'conexión'],
    placeholders: ['tarot_card', 'sefira'],
  },
  {
    id: 'obs_3',
    template: '¿Qué sensación física surge cuando piensas en {body_part} y {emotion}?',
    depth: 'surface',
    requiredSystems: ['bioemotions'],
    themes: ['cuerpo', 'emoción'],
    placeholders: ['body_part', 'emotion'],
  },
  
  // MEDIUM LEVEL - Exploratory
  {
    id: 'exp_1',
    template: '¿De qué manera {transgenerational_pattern} podría estar relacionado con tu experiencia de {current_symptom}?',
    depth: 'medium',
    requiredSystems: ['transgenerational', 'bioemotions'],
    themes: ['herencia', 'cuerpo'],
    placeholders: ['transgenerational_pattern', 'current_symptom'],
  },
  {
    id: 'exp_2',
    template: 'Si {ancestor_role} pudiera hablarte sobre {theme}, ¿qué crees que te diría?',
    depth: 'medium',
    requiredSystems: ['transgenerational'],
    themes: ['ancestros', 'mensaje'],
    placeholders: ['ancestor_role', 'theme'],
  },
  {
    id: 'exp_3',
    template: '¿Qué estructura heredada podría estar representada por {tarot_card}?',
    depth: 'medium',
    requiredSystems: ['tarot', 'transgenerational'],
    themes: ['estructura', 'herencia'],
    placeholders: ['tarot_card'],
  },
  {
    id: 'exp_4',
    template: '¿Cómo se expresa la energía de {planet} en tu forma de {life_area}?',
    depth: 'medium',
    requiredSystems: ['astrology'],
    themes: ['planeta', 'vida'],
    placeholders: ['planet', 'life_area'],
  },
  {
    id: 'exp_5',
    template: 'En este ciclo de {sefira}, ¿qué está pidiendo tu atención que antes ignorabas?',
    depth: 'medium',
    requiredSystems: ['cabala'],
    themes: ['ciclo', 'atención'],
    placeholders: ['sefira'],
  },
  
  // DEEP LEVEL - Transformational
  {
    id: 'deep_1',
    template: '¿Qué estás sosteniendo que no es tuyo y que quizás {ancestor_role} no pudo {action}?',
    depth: 'deep',
    requiredSystems: ['transgenerational'],
    themes: ['carga', 'herencia'],
    placeholders: ['ancestor_role', 'action'],
  },
  {
    id: 'deep_2',
    template: 'Si pudieras devolverle a {ancestor_role} lo que le pertenece, ¿qué sería?',
    depth: 'deep',
    requiredSystems: ['transgenerational'],
    themes: ['liberación', 'herencia'],
    placeholders: ['ancestor_role'],
  },
  {
    id: 'deep_3',
    template: '¿Dónde en tu cuerpo vive el {pattern} y qué necesita para transformarse?',
    depth: 'deep',
    requiredSystems: ['bioemotions'],
    themes: ['cuerpo', 'transformación'],
    placeholders: ['pattern'],
  },
  {
    id: 'deep_4',
    template: 'Si {tarot_card} es el mensaje y {sefira} es el camino, ¿qué nueva estructura quiere nacer?',
    depth: 'deep',
    requiredSystems: ['tarot', 'cabala'],
    themes: ['mensaje', 'nacimiento'],
    placeholders: ['tarot_card', 'sefira'],
  },
  {
    id: 'deep_5',
    template: '¿Qué ciclo transgeneracional estás llamado/a a cerrar en esta vida?',
    depth: 'deep',
    requiredSystems: ['transgenerational', 'cabala'],
    themes: ['ciclo', 'misión'],
    placeholders: [],
  },
  {
    id: 'deep_6',
    template: 'El derrumbe de {structure} podría estar abriendo espacio para ¿qué?',
    depth: 'deep',
    requiredSystems: ['tarot'],
    themes: ['destrucción', 'renacimiento'],
    placeholders: ['structure'],
  },
];

// ============================================================================
// PATTERN-SPECIFIC QUESTIONS
// ============================================================================

const PATTERN_QUESTIONS: Record<string, string[]> = {
  'Control Excesivo': [
    '¿Qué estructura heredada necesita derrumbarse para que puedas fluir?',
    '¿Qué estás conteniendo que tu padre/madre no pudo contener?',
    '¿Dónde te duele sostener algo que no es tuyo?',
    '¿Qué nueva estructura quiere nacer de este control?',
    'Si soltaras el control por un momento, ¿qué temes que pasaría?',
  ],
  'Miedo al Abandono': [
    '¿A quién en tu linaje abandonaron primero?',
    '¿Qué parte de ti teme ser dejada atrás?',
    '¿Cómo te abandonas a ti mismo/a para que otros no te abandonen?',
    '¿Qué necesitaría esa parte temerosa para sentirse segura?',
  ],
  'Femenino Suprimido': [
    '¿Qué voces femeninas de tu linaje fueron silenciadas?',
    '¿Cómo honras lo receptivo en tu vida cotidiana?',
    '¿Qué sabiduría femenina ancestral está esperando ser escuchada?',
    '¿Dónde has rechazado tu propia naturaleza receptiva?',
  ],
  'Expresión Bloqueada': [
    '¿Qué secreto familiar está pidiendo ser nombrado?',
    '¿Cuál es la palabra que tu garganta se niega a pronunciar?',
    '¿Qué pasaría si dijeras lo que nunca se dijo en tu familia?',
    '¿Qué verdad lleva generaciones esperando ser expresada?',
  ],
  'Sacrificio Excesivo': [
    '¿A quién en tu linaje estás tratando de salvar a través de tu sacrificio?',
    '¿Qué carga familiar estás llevando que no te corresponde?',
    '¿Cómo sería cuidar de ti con la misma dedicación que cuidas a otros?',
    '¿Qué permiso necesitas para dejar de sacrificarte?',
  ],
  'Desconexión Material': [
    '¿Qué historia de pérdida material llevas en tu linaje?',
    '¿Mereces prosperar aunque tus ancestros no pudieron?',
    '¿Qué significa para ti estar plenamente encarnado/a?',
    '¿Dónde habita tu miedo a tener demasiado?',
  ],
  'Resistencia a la Transformación': [
    '¿Qué duelo de tu linaje está incompleto?',
    '¿Qué parte de ti teme morir si sueltas lo viejo?',
    '¿Qué está pudriéndose que necesita ser enterrado con honra?',
    '¿Qué nacimiento está siendo bloqueado por un duelo no procesado?',
  ],
  'Corazón Protegido/Cerrado': [
    '¿Quién en tu linaje tuvo el corazón roto primero?',
    '¿Qué armadura heredaste para proteger tu corazón?',
    '¿Qué sería posible si tu corazón se sintiera seguro para abrirse?',
    '¿Qué historia de amor necesita ser sanada en tu árbol?',
  ],
};

// ============================================================================
// QUESTION GENERATION FUNCTIONS
// ============================================================================

interface QuestionContext {
  tarot?: { cards: string[]; themes: string[] };
  cabala?: { sefirot: string[]; cycles: string[] };
  astrology?: { planets: string[]; elements: string[] };
  bioemotions?: { organs: string[]; emotions: string[] };
  transgenerational?: { ancestors: string[]; patterns: string[] };
}

function extractContext(readings: AnySystemReading[]): QuestionContext {
  const context: QuestionContext = {};
  
  readings.forEach(reading => {
    switch (reading.system) {
      case 'tarot': {
        const data = reading.data as any;
        context.tarot = {
          cards: data.cards?.map((c: any) => c.name) || [],
          themes: data.themes || [],
        };
        break;
      }
      case 'cabala': {
        const data = reading.data as any;
        context.cabala = {
          sefirot: [...(data.dominantSefirot || []), data.currentSefira].filter(Boolean),
          cycles: data.currentCycle ? [`ciclo ${data.currentCycle.number} de ${data.currentCycle.sefira}`] : [],
        };
        break;
      }
      case 'astrology': {
        const data = reading.data as any;
        context.astrology = {
          planets: [data.dominantPlanet, data.sunSign, data.moonSign].filter(Boolean),
          elements: data.dominantElement ? [data.dominantElement] : [],
        };
        break;
      }
      case 'bioemotions': {
        const data = reading.data as any;
        context.bioemotions = {
          organs: data.symptoms?.map((s: any) => s.organ) || [],
          emotions: [...(data.symptoms?.map((s: any) => s.emotion) || []), data.dominantEmotion].filter(Boolean),
        };
        break;
      }
      case 'transgenerational': {
        const data = reading.data as any;
        const ancestors: string[] = [];
        const patterns: string[] = [];
        
        data.paternalLine?.forEach((a: any) => {
          ancestors.push(a.relation);
          patterns.push(...(a.patterns || []));
        });
        data.maternalLine?.forEach((a: any) => {
          ancestors.push(a.relation);
          patterns.push(...(a.patterns || []));
        });
        
        context.transgenerational = {
          ancestors: [...new Set(ancestors)],
          patterns: [...new Set([...patterns, ...(data.inheritedPatterns || [])])],
        };
        break;
      }
    }
  });
  
  return context;
}

function fillTemplate(template: string, context: QuestionContext): string | null {
  let result = template;
  
  // Replace placeholders
  const replacements: Record<string, string | null> = {
    tarot_card: context.tarot?.cards[0] || null,
    sefira: context.cabala?.sefirot[0] || null,
    planet: context.astrology?.planets[0] || null,
    body_part: context.bioemotions?.organs[0] || null,
    emotion: context.bioemotions?.emotions[0] || null,
    ancestor_role: context.transgenerational?.ancestors[0] || null,
    transgenerational_pattern: context.transgenerational?.patterns[0] || null,
    pattern: context.transgenerational?.patterns[0] || context.bioemotions?.emotions[0] || null,
    current_symptom: context.bioemotions?.organs[0] ? `tensión en ${context.bioemotions.organs[0]}` : null,
    theme: context.tarot?.themes[0] || context.transgenerational?.patterns[0] || null,
    structure: context.tarot?.cards.find(c => c.toLowerCase().includes('torre') || c.toLowerCase().includes('emperor')) || 'lo establecido',
    life_area: 'relacionarte con otros',
    action: 'soltar',
    system1_element: context.tarot?.cards[0] || context.cabala?.sefirot[0] || null,
    system2_element: context.bioemotions?.organs[0] || context.transgenerational?.patterns[0] || null,
  };
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    if (result.includes(`{${placeholder}}`)) {
      if (!value) return null; // Can't fill this template
      result = result.replace(`{${placeholder}}`, value);
    }
  }
  
  return result;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function generateQuestions(
  readings: AnySystemReading[],
  patterns: CrossSystemPattern[],
  maxQuestions: number = 8
): GenerativeQuestion[] {
  const questions: GenerativeQuestion[] = [];
  const context = extractContext(readings);
  const availableSystems = new Set(readings.map(r => r.system));
  
  // 1. Add pattern-specific questions first (highest priority)
  patterns.forEach(pattern => {
    const patternQuestions = PATTERN_QUESTIONS[pattern.theme];
    if (patternQuestions) {
      // Add 1-2 questions per detected pattern
      patternQuestions.slice(0, 2).forEach((q, i) => {
        questions.push({
          id: `pattern_q_${pattern.id}_${i}`,
          question: q,
          sources: pattern.systems.map(s => ({ system: s, element: pattern.theme })),
          depth: 'deep',
          theme: pattern.theme,
        });
      });
    }
  });
  
  // 2. Generate questions from templates
  QUESTION_TEMPLATES.forEach(template => {
    // Check if we have the required systems
    const hasRequiredSystems = template.requiredSystems.length === 0 ||
      template.requiredSystems.every(s => availableSystems.has(s));
    
    if (hasRequiredSystems && questions.length < maxQuestions) {
      const filledQuestion = fillTemplate(template.template, context);
      
      if (filledQuestion) {
        questions.push({
          id: `template_q_${template.id}`,
          question: filledQuestion,
          sources: template.requiredSystems.map(s => ({ system: s, element: template.themes[0] })),
          depth: template.depth,
          theme: template.themes[0],
        });
      }
    }
  });
  
  // 3. Sort by depth (deep first) and limit
  const depthOrder = { deep: 0, medium: 1, surface: 2 };
  return questions
    .sort((a, b) => depthOrder[a.depth] - depthOrder[b.depth])
    .slice(0, maxQuestions);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { QUESTION_TEMPLATES, PATTERN_QUESTIONS };
