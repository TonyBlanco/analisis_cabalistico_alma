// Sistema avanzado de recomendaciones personalizadas

import type { WellnessTestResult } from './wellness-persistence';

export interface Recommendation {
  id: string;
  category: 'diet' | 'exercise' | 'lifestyle' | 'medical' | 'mental';
  priority: 'high' | 'medium' | 'low';
  system: string;
  title: string;
  description: string;
  actions: string[];
  resources?: {
    type: 'article' | 'video' | 'exercise' | 'recipe';
    title: string;
    url?: string;
  }[];
  estimatedImpact: 'high' | 'medium' | 'low';
  timeframe: string;
}

/**
 * Genera recomendaciones personalizadas basadas en resultados del test
 */
export function generateRecommendations(result: WellnessTestResult): Recommendation[] {
  const recommendations: Recommendation[] = [];

  result.systemScores.forEach(system => {
    // Recomendaciones por estado
    if (system.status === 'Crítico') {
      recommendations.push(...getCriticalRecommendations(system.system));
    } else if (system.status === 'Regular') {
      recommendations.push(...getRegularRecommendations(system.system));
    } else if (system.status === 'Normal') {
      recommendations.push(...getMaintenanceRecommendations(system.system));
    }
  });

  // Recomendaciones basadas en patrones
  const patterns = analyzePatterns(result);
  patterns.forEach(pattern => {
    recommendations.push(...getPatternBasedRecommendations(pattern));
  });

  // Ordenar por prioridad
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Recomendaciones para estado crítico
 */
function getCriticalRecommendations(system: string): Recommendation[] {
  const recommendations: Record<string, Recommendation> = {
    'Digestivo': {
      id: `${system}-critical-medical`,
      category: 'medical',
      priority: 'high',
      system,
      title: 'Consulta Gastroenterológica Urgente',
      description: 'Los síntomas digestivos frecuentes requieren evaluación profesional inmediata para descartar condiciones serias.',
      actions: [
        'Programar cita con gastroenterólogo dentro de las próximas 2 semanas',
        'Llevar registro detallado de síntomas, alimentos consumidos y horarios',
        'Evitar alimentos que aumenten síntomas mientras espera la consulta',
        'No automedicarse sin supervisión médica',
      ],
      estimatedImpact: 'high',
      timeframe: 'Inmediato (1-2 semanas)',
      resources: [
        {
          type: 'article',
          title: 'Cuándo consultar un gastroenterólogo',
          url: '/resources/when-see-gastroenterologist',
        },
      ],
    },
    'Nervioso': {
      id: `${system}-critical-mental`,
      category: 'mental',
      priority: 'high',
      system,
      title: 'Atención en Salud Mental Prioritaria',
      description: 'Los síntomas neurológicos y de salud mental requieren intervención profesional urgente.',
      actions: [
        'Contactar un psicólogo o psiquiatra lo antes posible',
        'Considerar líneas de crisis si hay pensamientos de autolesión',
        'Informar a familiares cercanos sobre síntomas',
        'Implementar técnicas de respiración profunda para crisis agudas',
        'Evaluar medicación actual con profesional',
      ],
      estimatedImpact: 'high',
      timeframe: 'Inmediato (1-7 días)',
      resources: [
        {
          type: 'article',
          title: 'Recursos de salud mental de emergencia',
        },
        {
          type: 'exercise',
          title: 'Técnica de respiración 4-7-8 para ansiedad',
        },
      ],
    },
    'Circulatorio': {
      id: `${system}-critical-cardio`,
      category: 'medical',
      priority: 'high',
      system,
      title: 'Evaluación Cardiovascular Urgente',
      description: 'Los síntomas circulatorios críticos pueden indicar riesgo cardiovascular que requiere atención médica inmediata.',
      actions: [
        'Consultar cardiólogo dentro de 1-2 semanas',
        'Monitorear presión arterial diariamente',
        'Evitar esfuerzos físicos intensos hasta evaluación',
        'Reducir inmediatamente consumo de sal',
        'Si hay dolor de pecho, mareos severos o dificultad respiratoria: acudir a emergencias',
      ],
      estimatedImpact: 'high',
      timeframe: 'Inmediato (1-2 semanas)',
      resources: [
        {
          type: 'article',
          title: 'Señales de alerta cardiovascular',
        },
      ],
    },
    'Respiratorio': {
      id: `${system}-critical-respir`,
      category: 'medical',
      priority: 'high',
      system,
      title: 'Evaluación Pulmonar Necesaria',
      description: 'Los síntomas respiratorios persistentes requieren evaluación profesional para descartar condiciones pulmonares.',
      actions: [
        'Programar consulta con neumólogo',
        'Evitar ambientes con humo, polvo o contaminantes',
        'Medir saturación de oxígeno si es posible',
        'Registrar frecuencia y severidad de síntomas',
        'Si hay dificultad respiratoria severa: buscar atención de emergencia',
      ],
      estimatedImpact: 'high',
      timeframe: 'Inmediato (1-2 semanas)',
    },
    'Esquelético': {
      id: `${system}-critical-bone`,
      category: 'medical',
      priority: 'high',
      system,
      title: 'Evaluación Ortopédica o Reumatológica',
      description: 'El dolor articular o óseo severo requiere evaluación para prevenir daño permanente.',
      actions: [
        'Consultar traumatólogo u ortopedista',
        'Evitar actividades que aumenten el dolor',
        'Aplicar hielo en áreas inflamadas',
        'Considerar suplementos de calcio y vitamina D bajo supervisión',
        'Evaluar ergonomía en trabajo y actividades diarias',
      ],
      estimatedImpact: 'high',
      timeframe: '2-4 semanas',
    },
    'Muscular': {
      id: `${system}-critical-muscle`,
      category: 'medical',
      priority: 'high',
      system,
      title: 'Evaluación de Dolor Muscular Crónico',
      description: 'El dolor muscular persistente puede indicar condiciones que requieren tratamiento especializado.',
      actions: [
        'Consultar fisioterapeuta o médico del deporte',
        'Descansar músculos afectados adecuadamente',
        'Aplicar calor local para relajación muscular',
        'Evaluar deficiencias nutricionales (magnesio, potasio)',
        'Considerar terapia física o masajes terapéuticos',
      ],
      estimatedImpact: 'high',
      timeframe: '2-4 semanas',
    },
  };

  return [recommendations[system]];
}

/**
 * Recomendaciones para estado regular
 */
function getRegularRecommendations(system: string): Recommendation[] {
  const dietRecommendations: Record<string, Recommendation> = {
    'Digestivo': {
      id: `${system}-diet`,
      category: 'diet',
      priority: 'high',
      system,
      title: 'Optimizar Dieta para Salud Digestiva',
      description: 'Ajustes dietéticos para mejorar función digestiva y reducir molestias.',
      actions: [
        'Aumentar fibra gradualmente (25-35g diarios)',
        'Consumir probióticos (yogurt, kefir, alimentos fermentados)',
        'Reducir alimentos procesados y grasas saturadas',
        'Comer en horarios regulares, masticar bien',
        'Identificar y evitar alimentos disparadores',
      ],
      estimatedImpact: 'high',
      timeframe: '2-4 semanas',
      resources: [
        {
          type: 'recipe',
          title: 'Smoothie digestivo con papaya y jengibre',
        },
        {
          type: 'article',
          title: 'Alimentos amigables para el intestino',
        },
      ],
    },
    'Nervioso': {
      id: `${system}-lifestyle`,
      category: 'lifestyle',
      priority: 'high',
      system,
      title: 'Rutina de Manejo del Estrés',
      description: 'Implementar prácticas diarias para reducir estrés y ansiedad.',
      actions: [
        'Meditar 10-15 minutos diarios',
        'Establecer horario fijo de sueño (7-8 horas)',
        'Limitar tiempo de pantallas antes de dormir',
        'Practicar técnicas de respiración profunda',
        'Realizar actividades placenteras regularmente',
      ],
      estimatedImpact: 'medium',
      timeframe: '4-6 semanas',
      resources: [
        {
          type: 'video',
          title: 'Meditación guiada de 10 minutos',
        },
        {
          type: 'exercise',
          title: 'Ejercicios de relajación progresiva',
        },
      ],
    },
    'Circulatorio': {
      id: `${system}-exercise`,
      category: 'exercise',
      priority: 'high',
      system,
      title: 'Programa Cardiovascular Progresivo',
      description: 'Ejercicio gradual para fortalecer sistema circulatorio.',
      actions: [
        'Caminar 30 minutos diarios, 5 días a la semana',
        'Incrementar intensidad gradualmente',
        'Monitorear frecuencia cardíaca durante ejercicio',
        'Incluir ejercicios de estiramiento',
        'Mantener hidratación adecuada',
      ],
      estimatedImpact: 'high',
      timeframe: '6-8 semanas',
    },
  };

  return dietRecommendations[system] ? [dietRecommendations[system]] : [];
}

/**
 * Recomendaciones de mantenimiento para estado normal
 */
function getMaintenanceRecommendations(system: string): Recommendation[] {
  return [{
    id: `${system}-maintenance`,
    category: 'lifestyle',
    priority: 'low',
    system,
    title: `Mantener Salud del Sistema ${system}`,
    description: 'Continuar con hábitos saludables actuales y prevención.',
    actions: [
      'Mantener chequeos preventivos anuales',
      'Continuar con hábitos saludables actuales',
      'Estar atento a cambios en síntomas',
      'Considerar optimizaciones menores en estilo de vida',
    ],
    estimatedImpact: 'low',
    timeframe: 'Continuo',
  }];
}

/**
 * Analiza patrones entre sistemas
 */
function analyzePatterns(result: WellnessTestResult): string[] {
  const patterns: string[] = [];

  const digestivo = result.systemScores.find(s => s.system === 'Digestivo');
  const nervioso = result.systemScores.find(s => s.system === 'Nervioso');
  const circulatorio = result.systemScores.find(s => s.system === 'Circulatorio');
  const muscular = result.systemScores.find(s => s.system === 'Muscular');

  // Patrón: Estrés afectando múltiples sistemas
  if (nervioso && nervioso.percentage > 50 && digestivo && digestivo.percentage > 50) {
    patterns.push('stress-multi-system');
  }

  // Patrón: Sedentarismo
  if (circulatorio && circulatorio.percentage > 50 && muscular && muscular.percentage > 50) {
    patterns.push('sedentary-lifestyle');
  }

  // Patrón: Inflamación sistémica
  if (result.systemScores.filter(s => s.percentage > 60).length >= 4) {
    patterns.push('systemic-inflammation');
  }

  return patterns;
}

/**
 * Recomendaciones basadas en patrones detectados
 */
function getPatternBasedRecommendations(pattern: string): Recommendation[] {
  const patternRecommendations: Record<string, Recommendation> = {
    'stress-multi-system': {
      id: 'pattern-stress',
      category: 'mental',
      priority: 'high',
      system: 'Múltiples',
      title: 'Manejo Integral del Estrés',
      description: 'El estrés está afectando varios sistemas. Se recomienda enfoque holístico.',
      actions: [
        'Considerar terapia psicológica o coaching',
        'Implementar pausas activas durante el día',
        'Evaluar carga laboral y buscar balance vida-trabajo',
        'Practicar mindfulness o yoga regularmente',
        'Establecer límites saludables en relaciones',
      ],
      estimatedImpact: 'high',
      timeframe: '8-12 semanas',
      resources: [
        {
          type: 'article',
          title: 'Guía completa de manejo del estrés',
        },
        {
          type: 'video',
          title: 'Yoga para reducir estrés - 20 minutos',
        },
      ],
    },
    'sedentary-lifestyle': {
      id: 'pattern-sedentary',
      category: 'exercise',
      priority: 'high',
      system: 'Múltiples',
      title: 'Programa de Activación Física',
      description: 'Signos de sedentarismo afectando salud. Implementar actividad física gradual.',
      actions: [
        'Comenzar con caminatas cortas (10-15 min) 3 veces por semana',
        'Usar escaleras en lugar de elevador',
        'Levantarse y moverse cada hora en trabajo sedentario',
        'Incrementar actividad gradualmente hasta 150 min/semana',
        'Encontrar actividades físicas placenteras',
      ],
      estimatedImpact: 'high',
      timeframe: '6-12 semanas',
      resources: [
        {
          type: 'exercise',
          title: 'Rutina para principiantes en casa',
        },
      ],
    },
    'systemic-inflammation': {
      id: 'pattern-inflammation',
      category: 'diet',
      priority: 'high',
      system: 'Múltiples',
      title: 'Dieta Antiinflamatoria',
      description: 'Signos de inflamación sistémica. Ajustes dietéticos pueden ayudar significativamente.',
      actions: [
        'Aumentar consumo de omega-3 (pescado, nueces, semillas)',
        'Incluir alimentos antiinflamatorios (cúrcuma, jengibre, té verde)',
        'Reducir azúcares refinados y carbohidratos procesados',
        'Aumentar consumo de frutas y verduras coloridas',
        'Considerar suplementos bajo supervisión (omega-3, vitamina D)',
      ],
      estimatedImpact: 'high',
      timeframe: '4-8 semanas',
      resources: [
        {
          type: 'article',
          title: 'Guía de alimentación antiinflamatoria',
        },
        {
          type: 'recipe',
          title: 'Batido antiinflamatorio de cúrcuma y piña',
        },
      ],
    },
  };

  return [patternRecommendations[pattern]];
}

/**
 * Obtiene recomendaciones por categoría
 */
export function getRecommendationsByCategory(
  recommendations: Recommendation[],
  category: Recommendation['category']
): Recommendation[] {
  return recommendations.filter(r => r.category === category);
}

/**
 * Obtiene recomendaciones por prioridad
 */
export function getRecommendationsByPriority(
  recommendations: Recommendation[],
  priority: Recommendation['priority']
): Recommendation[] {
  return recommendations.filter(r => r.priority === priority);
}

/**
 * Calcula progreso potencial si se siguen recomendaciones
 */
export function estimateImprovement(
  result: WellnessTestResult,
  recommendations: Recommendation[]
): {
  system: string;
  currentPercentage: number;
  estimatedPercentage: number;
  improvement: number;
}[] {
  return result.systemScores.map(system => {
    const systemRecs = recommendations.filter(r => 
      r.system === system.system && r.estimatedImpact === 'high'
    );

    // Estimación simple: cada recomendación de alto impacto reduce 10-15%
    const potentialReduction = systemRecs.length * 12;
    const estimatedPercentage = Math.max(0, system.percentage - potentialReduction);

    return {
      system: system.system,
      currentPercentage: system.percentage,
      estimatedPercentage,
      improvement: system.percentage - estimatedPercentage,
    };
  });
}
