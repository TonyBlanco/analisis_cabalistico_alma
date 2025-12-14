/**
 * Sistema Base para Análisis Cabalísticos con IA
 * 
 * Este módulo proporciona una base reutilizable para crear análisis cabalísticos
 * usando Gemini AI. Extiende esta clase para crear análisis específicos.
 */

import { generateWithGemini, parseGeminiJSON, GEMINI_API_KEY } from './gemini-config';

export interface KabbalisticAIAnalysis {
  // Estructura base que todos los análisis deben seguir
  title: string;
  diagnosis: {
    title: string;
    problem: string;
    dynamics: string;
    summary: string;
  };
  practicalAdvice: {
    title: string;
    strategies: Array<{
      title: string;
      description: string;
      actionItems: string[];
    }>;
  };
  spiritualPrescription: {
    title: string;
    meditation: string;
    action: string;
    affirmation: string;
  };
  encouragement: string;
}

export interface KabbalisticAnalysisParams {
  clientName: string;
  birthDate: string;
  calculatedData: any; // Datos calculados específicos del análisis
  analysisType: string; // Tipo de análisis (ej: "financial", "soul", "purpose")
}

/**
 * Clase base para análisis cabalísticos con IA
 */
export abstract class KabbalisticAIAnalyzer {
  protected abstract getAnalysisPrompt(params: KabbalisticAnalysisParams): string;
  protected abstract getFallbackAnalysis(params: KabbalisticAnalysisParams): KabbalisticAIAnalysis;

  /**
   * Genera un análisis cabalístico usando Gemini AI
   */
  async generateAnalysis(
    params: KabbalisticAnalysisParams
  ): Promise<KabbalisticAIAnalysis | null> {
    // Verificar API Key
    if (!GEMINI_API_KEY) {
      console.warn("⚠️ API Key no disponible, usando análisis de respaldo");
      return this.getFallbackAnalysis(params);
    }

    try {
      const prompt = this.getAnalysisPrompt(params);
      const response = await generateWithGemini(prompt);
      
      if (!response) {
        throw new Error("No se recibió respuesta de Gemini");
      }

      const analysis = parseGeminiJSON<KabbalisticAIAnalysis>(response);
      
      if (!analysis) {
        throw new Error("No se pudo parsear la respuesta de Gemini");
      }

      return analysis;
    } catch (error) {
      console.error("❌ Error generando análisis con IA:", error);
      console.log("📋 Usando análisis de respaldo local...");
      return this.getFallbackAnalysis(params);
    }
  }

  /**
   * Template común para prompts de análisis cabalísticos
   */
  protected getCommonPromptTemplate(
    params: KabbalisticAnalysisParams,
    specificInstructions: string
  ): string {
    return `
      Actúa como un sabio maestro de la Cábala y terapeuta transpersonal.
      Objetivo: Generar un Diagnóstico del Alma profundo y formal.
      
      PERFIL DEL CLIENTE:
      - Nombre: ${params.clientName}
      - Fecha Nacimiento: ${params.birthDate}
      - Tipo de Análisis: ${params.analysisType}
      - Datos Calculados: ${JSON.stringify(params.calculatedData)}

      INSTRUCCIONES ESPECÍFICAS:
      ${specificInstructions}

      INSTRUCCIONES GENERALES:
      1. Tono: Solemne, místico, empático y muy formal.
      2. Usa metáforas de luz, vasijas, flujo divino y el Árbol de la Vida.
      3. Conecta los números con arquetipos cabalísticos profundos.
      4. Proporciona consejos prácticos y espirituales.

      FORMATO DE RESPUESTA (JSON ESTRICTO - SIN MARKDOWN):
      {
        "title": "Título principal del análisis",
        "diagnosis": {
          "title": "Título metafórico del diagnóstico",
          "problem": "Descripción del bloqueo principal",
          "dynamics": "Interacción de energías y sefirot",
          "summary": "Resumen profundo en una frase"
        },
        "practicalAdvice": {
          "title": "Estrategia de Rectificación",
          "strategies": [
            {
              "title": "Nombre de la estrategia",
              "description": "Qué hacer y por qué",
              "actionItems": ["Acción concreta 1", "Acción concreta 2"]
            }
          ]
        },
        "spiritualPrescription": {
          "title": "Tikún del Alma",
          "meditation": "Instrucción de visualización mística",
          "action": "Acto físico concreto ligado a los números",
          "affirmation": "Afirmación poderosa en presente"
        },
        "encouragement": "Bendición final elevada"
      }
    `;
  }
}











