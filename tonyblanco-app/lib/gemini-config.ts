/**
 * Configuración Centralizada de Gemini AI
 * 
 * Este archivo contiene todos los parámetros y configuración para la integración con Google Gemini API.
 * Úsalo como referencia única para evitar errores de configuración.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Detectar si el frontend debe usar el proxy / proveedor externo (GROQ)
export const USE_GROQ_PROXY = Boolean(process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_GROQ_API_URL);

// ==================== CONFIGURACIÓN DE API KEY ====================
// Si existe una URL de proxy/GROQ preferimos no inicializar Gemini en el cliente.
export const GEMINI_API_KEY = USE_GROQ_PROXY ? "" : (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// ==================== MODELOS DISPONIBLES (ORDEN DE PRIORIDAD) ====================
// IMPORTANTE: Estos modelos están verificados y funcionan con tu cuenta
export const GEMINI_MODELS = [
  "gemini-2.5-flash",      // ✅ Modelo principal (verificado y funcional)
  "gemini-2.5-flash-lite", 
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
] as const;

// ==================== CONFIGURACIÓN DE GENERACIÓN ====================
export const GEMINI_GENERATION_CONFIG = {
  temperature: 0.8,        // Creatividad (0-1, más alto = más creativo)
  topK: 40,                 // Diversidad de respuestas
  topP: 0.95,               // Nucleus sampling
  maxOutputTokens: 4096,    // Máximo de tokens en la respuesta
} as const;

// ==================== INICIALIZACIÓN DEL CLIENTE ====================
let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (USE_GROQ_PROXY) {
    console.info("ℹ️ GROQ/proxy detected in env; frontend will use proxy endpoint instead of initializing Gemini client.");
    return null;
  }

  if (!GEMINI_API_KEY) {
    console.warn("⚠️ NEXT_PUBLIC_GEMINI_API_KEY no está configurada");
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ Cliente Gemini inicializado");
  }

  return geminiClient;
}

// ==================== FUNCIÓN HELPER PARA GENERAR CONTENIDO ====================
export async function generateWithGemini(
  prompt: string,
  customModels?: string[]
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("Cliente Gemini no disponible. Verifica NEXT_PUBLIC_GEMINI_API_KEY");
  }

  const modelsToTry = customModels || GEMINI_MODELS;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔮 Intentando con modelo: ${modelName}...`);
      const model = client.getGenerativeModel({ 
        model: modelName,
        generationConfig: GEMINI_GENERATION_CONFIG
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ Éxito con ${modelName}`);
        return text;
      }
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        console.warn(`⚠️ Modelo ${modelName} no disponible (404), probando siguiente...`);
        continue;
      }
      
      if (errorMsg.includes("quota") || errorMsg.includes("429")) {
        console.warn(`⚠️ Cuota excedida con ${modelName}, probando siguiente...`);
        continue;
      }
      
      console.error(`❌ Error con ${modelName}:`, errorMsg);
      continue;
    }
  }

  throw new Error("Todos los modelos de Gemini fallaron. Verifica tu API key y cuota.");
}

// ==================== FUNCIÓN HELPER PARA PARSEAR JSON ====================
export function parseGeminiJSON<T>(text: string): T | null {
  try {
    // Limpiar markdown code blocks si existen
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    // Intentar extraer JSON si hay texto antes o después
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error("Error parseando JSON de Gemini:", error);
    console.error("Texto original:", text);
    return null;
  }
}















