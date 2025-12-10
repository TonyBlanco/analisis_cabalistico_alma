import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseGeminiJSON } from './gemini-config'; // Reutilizamos el parser JSON

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Lista de modelos robusta - actualizada con modelos disponibles
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite", 
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro"
];

export interface AstrologyAnalysis {
  soulBlueprint: {
    title: string;
    essence: string; // Interpretación de su Ángel Físico
    mission: string;
  };
  reprogramming: {
    title: string;
    conflict: string; // Explicación del conflicto detectado
    technique: string; // La técnica de vocalización
    meditation: string;
    mantra: string; // Nuevo: Mantra de activación
  };
  treeOfLifeMap: {
    activeSefirot: string; // Qué sefirot están más activas
    advice: string;
  };
}

export async function generateAstrologyAnalysis(
  name: string,
  birthDate: string,
  angels: any
): Promise<AstrologyAnalysis | null> {
  
  if (!apiKey) {
    console.warn("⚠️ API Key no disponible, usando análisis de respaldo");
    return getFallbackAnalysis(angels);
  }

  // Construir prompt con información del conflicto si está disponible
  const conflictInfo = angels.conflict ? `
    DATOS DEL ADN CÓSMICO:
    - Ángel Físico: #${angels.angelFisico} (Destino).
    - Aspecto a Reprogramar: ${angels.conflict.planet1} (${angels.conflict.sefira1}) en ${angels.conflict.aspect} con ${angels.conflict.planet2} (${angels.conflict.sefira2}).
    - Ángulo: ${angels.conflict.angle}°.
    - Ángel Mental (Hora): #${angels.angelMental} (Rige intelecto).
    - Sol en grado: ${angels.sunDegree}°.
  ` : `
    DATOS TÉCNICOS:
    - Ángel Físico (Quinario): #${angels.angelFisico} (Rige destino/cuerpo).
    - Ángel Mental (Hora): #${angels.angelMental} (Rige intelecto).
    - Sol en grado: ${angels.sunDegree}°.
  `;

  const taskInstructions = angels.conflict ? `
    1. Explica brevemente por qué este aspecto genera un bloqueo (Tikún) en su vida.
    2. Explica cómo la meditación del Nombre Entrelazado (YHVH con vocales de ${angels.conflict.sefira1} y ${angels.conflict.sefira2}) sana esto.
    3. Interpreta su Ángel Físico no como horóscopo, sino como "Tikún" (Corrección).
    4. Conecta su energía con una Sefirá del Árbol de la Vida.
    5. Proporciona un mantra corto y poderoso para activar la reprogramación.
  ` : `
    1. Interpreta su Ángel Físico no como horóscopo, sino como "Tikún" (Corrección).
    2. Da una técnica de reprogramación basada en la vocalización de nombres divinos.
    3. Conecta su energía con una Sefirá del Árbol de la Vida.
  `;

  const prompt = `
    Actúa como un Maestro Cabalista experto en Astrología (escuela de Isaac Luria).
    Consultante: ${name}, Nacido: ${birthDate}.
    
    ${conflictInfo}

    TAREA:
    ${taskInstructions}

    FORMATO JSON ESTRICTO (Sin markdown):
    {
      "soulBlueprint": {
        "title": "Título místico (ej: El Guerrero de la Misericordia)",
        "essence": "Descripción profunda de su energía base",
        "mission": "Su Tikún o lección principal"
      },
      "reprogramming": {
        "title": "${angels.conflict ? `Reprogramación Estelar: ${angels.conflict.sefira1} y ${angels.conflict.sefira2}` : 'Protocolo de Escaneo'}",
        "conflict": "${angels.conflict ? 'Explicación profunda del conflicto planetario y cómo afecta su vida' : 'Descripción del aspecto a trabajar'}",
        "technique": "Visualiza el Tetragrama brillando con las vocales indicadas. Instrucción detallada sobre cómo vocalizar...",
        "meditation": "Guía breve de respiración y visualización...",
        "mantra": "Mantra poderoso y corto para activar la reprogramación"
      },
      "treeOfLifeMap": {
        "activeSefirot": "Nombre de la Sefirá principal activa",
        "advice": "Consejo para equilibrar esa esfera"
      }
    }
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`🔮 Intentando generar análisis astrológico con modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const analysis = parseGeminiJSON<AstrologyAnalysis>(text);

      if (analysis) {
        console.log(`✅ Éxito con ${modelName}`);
        return analysis;
      } else {
        console.warn(`⚠️ No se pudo parsear la respuesta de ${modelName}, intentando con el siguiente...`);
      }
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      console.error(`❌ Error con ${modelName}:`, errorMsg);
      
      // Si es 404 (modelo no encontrado) o 503 (sobrecarga), continuar con el siguiente
      if (errorMsg.includes("404") || errorMsg.includes("not found") || 
          errorMsg.includes("503") || errorMsg.includes("overloaded")) {
        console.warn(`⚠️ Modelo ${modelName} no disponible o sobrecargado, saltando al siguiente...`);
        continue;
      }
      
      // Para otros errores, también continuar con el siguiente modelo
      continue;
    }
  }

  console.error("❌ Todos los modelos de IA fallaron para el análisis astrológico.");
  console.log("📋 Usando análisis de respaldo local...");
  return getFallbackAnalysis(angels);
}

// --- GENERADOR DE RESPALDO (LOCAL) ---
function getFallbackAnalysis(angels: any): AstrologyAnalysis {
  const conflictInfo = angels.conflict ? 
    `El aspecto ${angels.conflict.aspect} entre ${angels.conflict.planet1} (${angels.conflict.sefira1}) y ${angels.conflict.planet2} (${angels.conflict.sefira2}) crea un bloqueo en tu vida que requiere reprogramación.` :
    "Tu carta astral muestra patrones que requieren reprogramación para alinear tu voluntad con la Voluntad Suprema.";
  
  return {
    soulBlueprint: {
      title: `El Guardián del Ángel #${angels.angelFisico}`,
      essence: `Tu Ángel Físico #${angels.angelFisico} rige tu destino y manifestación en el mundo material. Este ángel de los 72 Nombres de Dios te guía en tu Tikún específico.`,
      mission: "Tu misión es alinear tu voluntad personal con la Voluntad Suprema, manifestando tu esencia divina en el plano físico."
    },
    reprogramming: {
      title: angels.conflict ? 
        `Reprogramación Estelar: ${angels.conflict.sefira1} y ${angels.conflict.sefira2}` :
        "Protocolo de Escaneo y Reprogramación",
      conflict: conflictInfo,
      technique: angels.conflict ? 
        `Visualiza el Tetragrammaton (YHVH) brillando con las vocales de ${angels.conflict.sefira1} y ${angels.conflict.sefira2}. Entrelaza estas energías para disolver el bloqueo planetario. Lee el Nombre de derecha a izquierda, sintiendo cómo las dos Sefirot se unen en armonía.` :
        `Medita con el Ángel #${angels.angelFisico} visualizando su nombre hebreo. Usa la vocalización correspondiente a la Sefirá activa en tu carta.`,
      meditation: "Visualiza el Árbol de la Vida. Tu Ángel Físico desciende desde Kéter hasta Maljút, iluminando tu camino de rectificación. Siente cómo el Nombre Divino reprograma tu ADN cósmico.",
      mantra: angels.conflict ? 
        `Yah-Havah (Unión de ${angels.conflict.sefira1} y ${angels.conflict.sefira2})` :
        "Yah-Havah (Unión Divina)"
    },
    treeOfLifeMap: {
      activeSefirot: "Tiféret (Sol - Centro del Árbol)",
      advice: "Equilibra las energías del Árbol trabajando con las Sefirot que están más activas en tu carta. El Sol en Tiféret te conecta con tu identidad central."
    }
  };
}
