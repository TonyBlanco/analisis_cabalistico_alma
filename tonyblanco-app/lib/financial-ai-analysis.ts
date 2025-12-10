/**
 * Análisis Financiero Cabalístico con IA
 * 
 * Usa la configuración centralizada de Gemini para generar análisis de Parnassah (Sustento)
 */

import { generateWithGemini, parseGeminiJSON, GEMINI_API_KEY } from './gemini-config';

// --- Interfaces ---
export interface FinancialAIAnalysis {
  deepDiagnosis: {
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

export async function generateFinancialAnalysis(
  clientName: string,
  birthDate: string,
  financialData: any
): Promise<FinancialAIAnalysis | null> {
  
  // Verificación de API Key
  if (!GEMINI_API_KEY) {
    console.error("❌ No se encontró NEXT_PUBLIC_GEMINI_API_KEY");
    return getFallbackAnalysis(financialData);
  }

  const prompt = `
    Actúa como un sabio maestro de la Cábala y psicólogo financiero transpersonal.
    Objetivo: Generar un Diagnóstico del Alma Financiera (Parnassah) profundo y formal.
    
    PERFIL DEL CLIENTE:
    - Nombre: ${clientName}
    - Fecha Nacimiento: ${birthDate}
    - Datos Calculados: ${JSON.stringify(financialData)}

    INSTRUCCIONES DE ANÁLISIS:
    1. Analiza el balance Jésed/Gevurá. 
       - Gevurá bajo (<30%): Diagnostica "Vasija Rota" o "Canal Desbordado" (falta de contención).
       - Gevurá alto (>60%): Diagnostica "Bloqueo por Juicio Severo" o "Miedo a la carencia".
    2. Tono: Solemne, místico, empático y muy formal. Usa metáforas de luz, vasijas y flujo divino.

    FORMATO DE RESPUESTA (JSON ESTRICTO - SIN MARKDOWN):
    {
      "deepDiagnosis": {
        "title": "Título metafórico corto y poético",
        "problem": "Descripción del bloqueo principal",
        "dynamics": "Interacción de energías Jésed vs Gevurá",
        "summary": "Resumen profundo"
      },
      "practicalAdvice": {
        "title": "Estrategia de Rectificación",
        "strategies": [{ "title": "Nombre Estrategia", "description": "Qué hacer y por qué", "actionItems": ["Acción 1", "Acción 2"] }]
      },
      "spiritualPrescription": {
        "title": "Tikún del Alma",
        "meditation": "Instrucción de visualización mística",
        "action": "Acto físico concreto (Tzedaká) ligado al número de Malchut",
        "affirmation": "Afirmación poderosa en presente"
      },
      "encouragement": "Bendición final elevada"
    }
  `;

  try {
    // Usar la función centralizada de Gemini
    const response = await generateWithGemini(prompt);
    
    if (!response) {
      throw new Error("No se recibió respuesta de Gemini");
    }

    const analysis = parseGeminiJSON<FinancialAIAnalysis>(response);
    
    if (!analysis) {
      throw new Error("No se pudo parsear la respuesta de Gemini");
    }

    console.log("✅ Reporte financiero generado exitosamente con IA");
    return analysis;
  } catch (error) {
    console.error("❌ Error generando análisis financiero con IA:", error);
    console.log("📋 Usando análisis de respaldo local...");
    return getFallbackAnalysis(financialData);
  }
}

// --- GENERADOR DE RESPALDO (LOCAL) ---
function getFallbackAnalysis(data: any): FinancialAIAnalysis {
  const isGevuraLow = data.energyBalance.restriction < 30;
  return {
    deepDiagnosis: {
      title: isGevuraLow ? "El Manantial Desbordado" : "La Fortaleza Cerrada",
      problem: isGevuraLow 
        ? "Tu capacidad de generar luz supera tu capacidad de contenerla." 
        : "El exceso de severidad impide que la abundancia fluya hacia ti.",
      dynamics: "Desequilibrio fundamental en el Árbol de la Vida financiero.",
      summary: "El equilibrio de Parnassah requiere tanto dar como saber recibir."
    },
    practicalAdvice: {
      title: "Arquitectura Sagrada",
      strategies: [
        {
          title: "Rectificación Básica",
          description: "Equilibrar las energías mediante acción física consciente.",
          actionItems: ["Revisar fugas de dinero", "Automatizar el ahorro"]
        }
      ]
    },
    spiritualPrescription: {
      title: "Tikún de Parnassah",
      meditation: "Visualiza el Nombre 'Samech-Aleph-Lamed' en oro sobre tu corazón.",
      action: `Separa el ${data.manifestationNumber}% de tus ingresos para caridad.`,
      affirmation: "Soy un canal digno y resistente para la Luz Infinita."
    },
    encouragement: "Tu alma tiene las herramientas para la maestría material."
  };
}
