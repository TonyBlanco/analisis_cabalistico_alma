// Sistema de análisis IA para patrones de salud y recomendaciones personalizadas

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WellnessTestResult } from './wellness-persistence';

// Inicializar cliente Gemini
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (!geminiClient && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  }
  return geminiClient;
}

export interface AIAnalysisResult {
  summary: string;
  patterns: {
    pattern: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    affectedSystems: string[];
  }[];
  insights: {
    title: string;
    description: string;
    category: 'lifestyle' | 'diet' | 'exercise' | 'mental' | 'medical';
  }[];
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedBenefit: string;
  }[];
  riskFactors: {
    factor: string;
    description: string;
    preventionTips: string[];
  }[];
  encouragement: string;
}

/**
 * Analiza resultados del test usando IA para generar insights personalizados
 */
export async function analyzeWithAI(
  result: WellnessTestResult,
  userContext?: {
    age?: number;
    gender?: string;
    lifestyle?: string;
    previousConditions?: string[];
  }
): Promise<AIAnalysisResult | null> {
  const client = getGeminiClient();
  
  if (!client) {
    console.warn('Gemini client not initialized. Returning fallback analysis.');
    return getFallbackAnalysis(result);
  }

  try {
    const prompt = buildAnalysisPrompt(result, userContext);
    
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Eres un experto en salud holística y bienestar. Analiza los resultados de un test de bienestar integral y proporciona insights personalizados, identificando patrones, factores de riesgo y recomendaciones accionables. Sé empático, específico y práctico. IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido sin texto adicional, markdown o explicaciones.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const text = response.response.text();
    
    // Limpiar el texto para obtener solo el JSON
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const analysis = JSON.parse(jsonText) as AIAnalysisResult;
    return analysis;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return getFallbackAnalysis(result);
  }
}

/**
 * Construye el prompt para el análisis IA
 */
function buildAnalysisPrompt(
  result: WellnessTestResult,
  userContext?: {
    age?: number;
    gender?: string;
    lifestyle?: string;
    previousConditions?: string[];
  }
): string {
  const systemsData = result.systemScores
    .map(s => `- ${s.system}: ${s.percentage.toFixed(1)}% (${s.status}) - Puntaje ${s.score}/${s.maxScore}`)
    .join('\n');

  const criticalSystems = result.systemScores
    .filter(s => s.status === 'Crítico')
    .map(s => s.system);

  const regularSystems = result.systemScores
    .filter(s => s.status === 'Regular')
    .map(s => s.system);

  const contextInfo = userContext
    ? `\n\nContexto del usuario:\n- Edad: ${userContext.age || 'No especificada'}\n- Género: ${userContext.gender || 'No especificado'}\n- Estilo de vida: ${userContext.lifestyle || 'No especificado'}\n- Condiciones previas: ${userContext.previousConditions?.join(', ') || 'Ninguna reportada'}`
    : '';

  return `Analiza los siguientes resultados de un test de bienestar integral que evalúa 6 sistemas corporales a través de 38 preguntas:

RESULTADOS POR SISTEMA:
${systemsData}

SISTEMAS EN ESTADO CRÍTICO: ${criticalSystems.length > 0 ? criticalSystems.join(', ') : 'Ninguno'}
SISTEMAS EN ESTADO REGULAR: ${regularSystems.length > 0 ? regularSystems.join(', ') : 'Ninguno'}
${contextInfo}

Por favor, proporciona un análisis completo en formato JSON con la siguiente estructura exacta:

{
  "summary": "Un resumen ejecutivo de 2-3 frases sobre el estado general de salud",
  "patterns": [
    {
      "pattern": "Nombre del patrón identificado",
      "description": "Explicación detallada del patrón",
      "severity": "high|medium|low",
      "affectedSystems": ["Sistema1", "Sistema2"]
    }
  ],
  "insights": [
    {
      "title": "Título del insight",
      "description": "Explicación del insight con contexto",
      "category": "lifestyle|diet|exercise|mental|medical"
    }
  ],
  "recommendations": [
    {
      "title": "Título de la recomendación",
      "description": "Descripción detallada y accionable",
      "priority": "high|medium|low",
      "expectedBenefit": "Qué mejora se espera al seguir esta recomendación"
    }
  ],
  "riskFactors": [
    {
      "factor": "Nombre del factor de riesgo",
      "description": "Por qué es un factor de riesgo",
      "preventionTips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ],
  "encouragement": "Un mensaje de ánimo personalizado y motivacional"
}

Prioriza:
1. Identificar conexiones entre sistemas (ej: estrés afectando digestivo y nervioso)
2. Detectar causas raíces potenciales
3. Ofrecer recomendaciones específicas y accionables
4. Ser empático pero honesto sobre la urgencia de ciertos síntomas
5. Proporcionar esperanza y pasos concretos de mejora`;
}

/**
 * Análisis de respaldo cuando IA no está disponible
 */
function getFallbackAnalysis(result: WellnessTestResult): AIAnalysisResult {
  const criticalCount = result.systemScores.filter(s => s.status === 'Crítico').length;
  const regularCount = result.systemScores.filter(s => s.status === 'Regular').length;

  const summary = criticalCount > 0
    ? `Se detectaron ${criticalCount} sistema(s) en estado crítico que requieren atención prioritaria. Recomendamos consulta médica profesional.`
    : regularCount > 0
    ? `Se detectaron ${regularCount} sistema(s) en estado regular. Con ajustes en estilo de vida puedes mejorar significativamente tu bienestar.`
    : 'Tu estado general de bienestar es positivo. Continúa con tus hábitos saludables y mantén chequeos preventivos.';

  const patterns: AIAnalysisResult['patterns'] = [];
  
  // Patrón: Múltiples sistemas afectados
  if (criticalCount + regularCount >= 4) {
    patterns.push({
      pattern: 'Afectación Multi-sistémica',
      description: 'Varios sistemas corporales muestran síntomas simultáneos, lo que puede indicar factores de estrés generalizados o condiciones subyacentes que afectan múltiples áreas.',
      severity: criticalCount > 2 ? 'high' : 'medium',
      affectedSystems: result.systemScores
        .filter(s => s.status === 'Crítico' || s.status === 'Regular')
        .map(s => s.system),
    });
  }

  // Patrón: Estrés y digestión
  const nervioso = result.systemScores.find(s => s.system === 'Nervioso');
  const digestivo = result.systemScores.find(s => s.system === 'Digestivo');
  if (nervioso && digestivo && nervioso.percentage > 50 && digestivo.percentage > 50) {
    patterns.push({
      pattern: 'Conexión Estrés-Digestión',
      description: 'Existe una fuerte conexión entre el sistema nervioso y digestivo (eje cerebro-intestino). El estrés está probablemente afectando tu digestión.',
      severity: 'medium',
      affectedSystems: ['Nervioso', 'Digestivo'],
    });
  }

  const insights: AIAnalysisResult['insights'] = [
    {
      title: 'Prioriza la Prevención',
      description: 'Muchas condiciones de salud son prevenibles con cambios en estilo de vida implementados gradualmente.',
      category: 'lifestyle',
    },
    {
      title: 'El Poder del Sueño',
      description: 'Un sueño de calidad (7-8 horas) es fundamental para la regeneración de todos los sistemas corporales.',
      category: 'lifestyle',
    },
  ];

  const recommendations: AIAnalysisResult['recommendations'] = [
    {
      title: 'Consulta Médica Preventiva',
      description: 'Agenda un chequeo médico general para discutir estos resultados con un profesional de salud.',
      priority: criticalCount > 0 ? 'high' : 'medium',
      expectedBenefit: 'Diagnóstico profesional y plan de tratamiento personalizado',
    },
    {
      title: 'Rutina de Actividad Física',
      description: 'Implementa al menos 30 minutos de ejercicio moderado 5 días a la semana.',
      priority: 'high',
      expectedBenefit: 'Mejora en sistemas circulatorio, muscular, nervioso y general',
    },
    {
      title: 'Nutrición Balanceada',
      description: 'Enfócate en alimentos integrales, más vegetales, proteína adecuada y reducción de procesados.',
      priority: 'high',
      expectedBenefit: 'Mejora en digestión, energía y función inmune',
    },
  ];

  const riskFactors: AIAnalysisResult['riskFactors'] = [];
  
  if (criticalCount > 0) {
    riskFactors.push({
      factor: 'Síntomas Críticos No Atendidos',
      description: 'Los síntomas persistentes sin atención médica pueden evolucionar a condiciones más serias.',
      preventionTips: [
        'Consultar profesional de salud dentro de las próximas 2 semanas',
        'Llevar registro detallado de síntomas',
        'No automedicarse sin supervisión',
      ],
    });
  }

  const encouragement = criticalCount > 0
    ? 'Reconocer que necesitas atención es el primer paso. Con ayuda profesional y compromiso personal, puedes mejorar significativamente tu bienestar.'
    : 'Estás tomando control de tu salud. Cada pequeño cambio positivo suma. ¡Continúa por este camino!';

  return {
    summary,
    patterns,
    insights,
    recommendations,
    riskFactors,
    encouragement,
  };
}

/**
 * Análisis comparativo IA entre dos tests
 */
export async function compareTestsWithAI(
  oldTest: WellnessTestResult,
  newTest: WellnessTestResult
): Promise<{
  progressSummary: string;
  improvements: string[];
  concerns: string[];
  recommendations: string[];
} | null> {
  const client = getGeminiClient();
  
  if (!client) {
    return getSimpleComparison(oldTest, newTest);
  }

  try {
    const prompt = buildComparisonPrompt(oldTest, newTest);
    
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Eres un experto en salud. Compara dos tests de bienestar y proporciona análisis de progreso. Responde ÚNICAMENTE con JSON válido.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const text = response.response.text();
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error in comparison analysis:', error);
    return getSimpleComparison(oldTest, newTest);
  }
}

function buildComparisonPrompt(oldTest: WellnessTestResult, newTest: WellnessTestResult): string {
  const oldSystems = oldTest.systemScores.map(s => `${s.system}: ${s.percentage.toFixed(1)}%`).join(', ');
  const newSystems = newTest.systemScores.map(s => `${s.system}: ${s.percentage.toFixed(1)}%`).join(', ');

  return `Compara estos dos tests de bienestar:

TEST ANTERIOR (${new Date(oldTest.timestamp).toLocaleDateString()}):
${oldSystems}

TEST ACTUAL (${new Date(newTest.timestamp).toLocaleDateString()}):
${newSystems}

Proporciona análisis en formato JSON:
{
  "progressSummary": "Resumen del progreso general",
  "improvements": ["Mejora 1", "Mejora 2"],
  "concerns": ["Preocupación 1", "Preocupación 2"],
  "recommendations": ["Recomendación 1", "Recomendación 2"]
}`;
}

function getSimpleComparison(oldTest: WellnessTestResult, newTest: WellnessTestResult) {
  const improvements: string[] = [];
  const concerns: string[] = [];

  newTest.systemScores.forEach(newSys => {
    const oldSys = oldTest.systemScores.find(s => s.system === newSys.system);
    if (oldSys) {
      const change = newSys.percentage - oldSys.percentage;
      if (change < -5) {
        improvements.push(`${newSys.system} mejoró ${Math.abs(change).toFixed(1)}%`);
      } else if (change > 5) {
        concerns.push(`${newSys.system} empeoró ${change.toFixed(1)}%`);
      }
    }
  });

  return {
    progressSummary: improvements.length > concerns.length
      ? 'Se observan mejoras generales en tu bienestar'
      : 'Se detectan algunos retrocesos que requieren atención',
    improvements,
    concerns,
    recommendations: [
      'Mantén las estrategias que están funcionando',
      'Refuerza áreas que muestran retroceso',
      'Considera consulta profesional si hay preocupaciones',
    ],
  };
}

/**
 * Genera plan de acción personalizado con IA
 */
export async function generateActionPlan(
  result: WellnessTestResult,
  timeframe: '1-week' | '1-month' | '3-months'
): Promise<{
  week1: string[];
  week2?: string[];
  week3?: string[];
  week4?: string[];
  longTerm?: string[];
} | null> {
  const client = getGeminiClient();
  
  if (!client) {
    return getSimpleActionPlan(result, timeframe);
  }

  try {
    const systemsData = result.systemScores
      .map(s => `${s.system}: ${s.percentage.toFixed(1)}% (${s.status})`)
      .join('\n');

    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Eres un coach de salud. Crea planes de acción semanales específicos y alcanzables. Responde ÚNICAMENTE con JSON válido.\n\nCrea un plan de acción de ${timeframe} para estos resultados:\n\n${systemsData}\n\nFormato JSON con acciones semanales específicas y medibles.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const text = response.response.text();
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating action plan:', error);
    return getSimpleActionPlan(result, timeframe);
  }
}

function getSimpleActionPlan(result: WellnessTestResult, timeframe: string) {
  const criticalSystems = result.systemScores.filter(s => s.status === 'Crítico');
  
  const plan = {
    week1: [
      'Programar consulta médica para evaluación',
      'Comenzar registro diario de síntomas',
      'Implementar 10 minutos de caminata diaria',
      'Establecer horario fijo de sueño',
    ],
  };

  if (timeframe !== '1-week') {
    Object.assign(plan, {
      week2: [
        'Aumentar ejercicio a 20 minutos diarios',
        'Introducir 2 porciones adicionales de vegetales',
        'Practicar técnica de respiración 2 veces al día',
      ],
      week3: [
        'Evaluar progreso y ajustar estrategias',
        'Incorporar actividad social placentera',
        'Revisar resultados de consulta médica',
      ],
      week4: [
        'Consolidar hábitos adquiridos',
        'Planear próximo test de seguimiento',
        'Celebrar logros alcanzados',
      ],
    });
  }

  if (timeframe === '3-months') {
    Object.assign(plan, {
      longTerm: [
        'Mantener chequeos médicos regulares',
        'Optimizar rutina de ejercicio a 150 min/semana',
        'Establecer red de apoyo social',
        'Considerar terapia o coaching si es necesario',
      ],
    });
  }

  return plan;
}
