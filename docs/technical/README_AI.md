# 🤖 Documentación de Integración con IA - Análisis Cabalístico

> **2026-06-10:** Documentación operativa actualizada en [AI_INTEGRATION_GUIDE.md](../AI_INTEGRATION_GUIDE.md) y [AI_USAGE_METERING_IMPLEMENTATION.md](../01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md). Este archivo es referencia legacy (Gemini-centric frontend). Nuevos módulos: usar `llm_bridge` + metering.

## 📋 Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Configuración de Gemini AI](#configuración-de-gemini-ai)
3. [Sistema de Análisis con IA](#sistema-de-análisis-con-ia)
4. [Análisis Implementados](#análisis-implementados)
5. [Parámetros y Configuración](#parámetros-y-configuración)
6. [Troubleshooting](#troubleshooting)
7. [Cómo Agregar Nuevos Análisis](#cómo-agregar-nuevos-análisis)

---

## 🎯 Resumen del Proyecto

Este proyecto integra **Google Gemini AI** para generar análisis cabalísticos profundos y personalizados. El sistema está diseñado para:

- ✅ Generar diagnósticos místicos y terapéuticos basados en cálculos cabalísticos
- ✅ Proporcionar consejos prácticos y espirituales personalizados
- ✅ Incluir recetas espirituales (Tikún) específicas para cada cliente
- ✅ Tener sistema de respaldo local si la IA falla

---

## ⚙️ Configuración de Gemini AI

### Archivo de Configuración Centralizada

**Ubicación:** `lib/gemini-config.ts`

Este archivo contiene TODOS los parámetros necesarios para evitar errores de configuración:

```typescript
// API Key (debe estar en .env.local)
export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Modelos verificados y funcionales (en orden de prioridad)
export const GEMINI_MODELS = [
  "gemini-2.5-flash",      // ✅ Modelo principal (VERIFICADO)
  "gemini-2.5-flash-lite", 
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

// Configuración de generación
export const GEMINI_GENERATION_CONFIG = {
  temperature: 0.8,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
};
```

### Variables de Entorno

**Archivo:** `.env.local`

```env
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

⚠️ **IMPORTANTE:** 
- La API key debe empezar con `NEXT_PUBLIC_` para estar disponible en el cliente
- Después de cambiar `.env.local`, **SIEMPRE reinicia el servidor** (`npm run dev`)

### Dependencias de Astronomía

**Librería:** `astronomy-engine` (v2.1.19)

Esta librería calcula localmente las posiciones planetarias sin necesidad de APIs externas:

```bash
npm install astronomy-engine
```

**Uso:**
- Cálculo preciso de posición solar (longitud eclíptica)
- No requiere conexión a internet para cálculos
- Gratuita y open-source
- Precisión suficiente para análisis cabalísticos

### Verificación de Conexión

**Script de prueba:** `test-gemini.js`

Para verificar que la conexión funciona:

```bash
node test-gemini.js
```

Este script prueba todos los modelos y confirma cuál funciona con tu cuenta.

---

## 🧠 Sistema de Análisis con IA

### Arquitectura

```
lib/
├── gemini-config.ts          # Configuración centralizada
├── kabbalistic-ai-base.ts    # Clase base reutilizable
└── financial-ai-analysis.ts  # Análisis financiero específico
```

### Clase Base: `KabbalisticAIAnalyzer`

**Ubicación:** `lib/kabbalistic-ai-base.ts`

Proporciona una estructura reutilizable para crear nuevos análisis:

```typescript
export abstract class KabbalisticAIAnalyzer {
  protected abstract getAnalysisPrompt(params: KabbalisticAnalysisParams): string;
  protected abstract getFallbackAnalysis(params: KabbalisticAnalysisParams): KabbalisticAIAnalysis;
  
  async generateAnalysis(params: KabbalisticAnalysisParams): Promise<KabbalisticAIAnalysis | null>
}
```

**Ventajas:**
- ✅ Manejo automático de errores
- ✅ Sistema de respaldo local
- ✅ Reintentos con múltiples modelos
- ✅ Parsing automático de JSON

---

## 📊 Análisis Implementados

### 1. Análisis Financiero (Parnassah)

**Archivo:** `lib/financial-ai-analysis.ts`  
**Componente:** `components/FinancialHealthReport.tsx`  
**Ruta:** `/tests/financial-abundance`

**Datos que analiza:**
- Arquetipo Financiero
- Vibración de Manifestación (Malchut)
- Vibración de Flujo (Yesod)
- Balance Energético (Jésed, Gevurá, Hod)

**Estructura del análisis:**
```typescript
interface FinancialAIAnalysis {
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
```

**Características:**
- ✅ Diagnóstico del "Cubo Agujereado" si Gevurá < 30%
- ✅ Diagnóstico de "Bloqueo por Miedo" si Gevurá > 60%
- ✅ Meditación con Nombre de los 72 Nombres (Samech-Aleph-Lamed)
- ✅ Tzedaká personalizada según número de Malchut
- ✅ Generación de PDF de la meditación

### 2. Análisis Astrológico Cabalístico

**Archivo:** `lib/astrology-ai-analysis.ts`  
**Componente:** `components/CabalisticAstrologyReport.tsx`  
**Librería:** `astronomy-engine` (cálculo local de posiciones planetarias)

**Datos que analiza:**
- Posición exacta del Sol (usando `astronomy-engine`)
- Los 72 Ángeles de Dios:
  - Ángel Físico (Quinario Solar - cada 5 grados)
  - Ángel Emocional (Rotación diaria)
  - Ángel Mental (Hora de nacimiento - cada 20 minutos)
- Correspondencias planetas-sefirot
- Técnicas de reprogramación de aspectos

**Estructura del análisis:**
```typescript
interface AstrologyAnalysis {
  soulBlueprint: {
    title: string;
    essence: string;
    mission: string;
  };
  reprogramming: {
    title: string;
    technique: string;
    meditation: string;
  };
  treeOfLifeMap: {
    activeSefirot: string;
    advice: string;
  };
}
```

**Características:**
- ✅ Cálculo matemático preciso de posición solar
- ✅ Cálculo de los 3 Ángeles Tutelares
- ✅ Interpretación mística con Gemini AI
- ✅ Técnicas de reprogramación con vocalización
- ✅ Mapeo del Árbol de la Vida
- ✅ Sistema de respaldo local

---

## 🔧 Parámetros y Configuración

### Modelos de Gemini

**Modelo Principal:** `gemini-2.5-flash`
- ✅ Verificado y funcional
- ✅ Rápido y eficiente
- ✅ Buen seguimiento de instrucciones JSON

**Modelos de Respaldo:**
1. `gemini-2.5-flash-lite`
2. `gemini-2.0-flash`
3. `gemini-1.5-flash`
4. `gemini-1.5-pro`
5. `gemini-pro`

### Configuración de Generación

```typescript
{
  temperature: 0.8,        // Balance entre creatividad y precisión
  topK: 40,                // Diversidad de respuestas
  topP: 0.95,              // Nucleus sampling
  maxOutputTokens: 4096,   // Límite de tokens
}
```

### Prompt Template

Todos los análisis usan un template común que incluye:

1. **Perfil del Cliente:**
   - Nombre
   - Fecha de nacimiento
   - Datos calculados (JSON)

2. **Instrucciones Específicas:**
   - Análisis de sefirot relevantes
   - Diagnósticos según porcentajes
   - Conexiones cabalísticas

3. **Instrucciones Generales:**
   - Tono: Solemne, místico, empático
   - Metáforas: Luz, vasijas, flujo divino
   - Formato: JSON estricto sin markdown

---

## 🐛 Troubleshooting

### Error: "404 - Modelo no encontrado"

**Causa:** El modelo no está disponible en tu región o cuenta.

**Solución:**
1. Verifica en Google AI Studio qué modelos tienes disponibles
2. Actualiza `GEMINI_MODELS` en `gemini-config.ts`
3. Ejecuta `node test-gemini.js` para verificar

### Error: "API Key no encontrada"

**Causa:** La variable de entorno no está configurada.

**Solución:**
1. Verifica que `.env.local` existe
2. Verifica que la variable es `NEXT_PUBLIC_GEMINI_API_KEY`
3. Reinicia el servidor después de cambiar `.env.local`

### Error: "Cuota excedida (429)"

**Causa:** Has excedido el límite de requests.

**Solución:**
1. Espera unos minutos
2. Verifica tu cuota en: https://ai.google.dev/pricing
3. El sistema automáticamente usa análisis de respaldo local

### El análisis no se genera

**Causa:** Error en el parsing de JSON o respuesta inválida.

**Solución:**
1. Revisa la consola del navegador (F12)
2. Verifica que el prompt genera JSON válido
3. El sistema automáticamente usa análisis de respaldo

---

## ➕ Cómo Agregar Nuevos Análisis

### Paso 1: Crear el archivo de análisis

**Ejemplo:** `lib/soul-ai-analysis.ts`

```typescript
import { generateWithGemini, parseGeminiJSON, GEMINI_API_KEY } from './gemini-config';

export interface SoulAIAnalysis {
  // Define tu estructura aquí
}

export async function generateSoulAnalysis(
  clientName: string,
  birthDate: string,
  soulData: any
): Promise<SoulAIAnalysis | null> {
  // Tu lógica aquí
}
```

### Paso 2: Crear el prompt específico

```typescript
const prompt = `
  Actúa como un sabio maestro de la Cábala...
  
  PERFIL DEL CLIENTE:
  - Nombre: ${clientName}
  - Fecha Nacimiento: ${birthDate}
  - Datos: ${JSON.stringify(soulData)}
  
  INSTRUCCIONES ESPECÍFICAS:
  // Tu análisis específico aquí
  
  FORMATO JSON:
  // Tu estructura JSON aquí
`;
```

### Paso 3: Usar la configuración centralizada

```typescript
import { generateWithGemini, parseGeminiJSON } from './gemini-config';

const response = await generateWithGemini(prompt);
const analysis = parseGeminiJSON<SoulAIAnalysis>(response);
```

### Paso 4: Implementar fallback local

```typescript
function getFallbackAnalysis(data: any): SoulAIAnalysis {
  return {
    // Análisis básico sin IA
  };
}
```

### Paso 5: Crear el componente visual

**Ejemplo:** `components/SoulHealthReport.tsx`

Sigue el patrón de `FinancialHealthReport.tsx`:
- Estados para loading y error
- Llamada a la función de análisis
- Renderizado del resultado
- Botón para generar PDF (opcional)

---

## 📝 Notas Importantes

### ✅ Siempre Preguntar Antes de Agregar

Antes de implementar un nuevo análisis con IA, **SIEMPRE pregunta al usuario**:
- ¿Qué tipo de análisis quiere?
- ¿Qué datos necesita analizar?
- ¿Qué estructura de respuesta prefiere?

### ✅ Guardar Parámetros

**NUNCA hardcodees parámetros.** Siempre usa:
- `gemini-config.ts` para configuración de Gemini
- Variables de entorno para API keys
- Constantes exportadas para modelos

### ✅ Sistema de Respaldo

**SIEMPRE** implementa un análisis de respaldo local:
- Funciona sin conexión a internet
- Funciona si la API falla
- Garantiza que el usuario siempre reciba un resultado

### ✅ Manejo de Errores

**SIEMPRE** maneja errores:
- Logs en consola para debugging
- Mensajes amigables al usuario
- Fallback automático a análisis local

---

## 🎉 Estado Actual

### ✅ Implementado y Funcional

1. **Análisis Financiero (Parnassah)**
   - ✅ Integración con Gemini 2.5-flash
   - ✅ Análisis de Jésed/Gevurá/Hod
   - ✅ Generación de PDF
   - ✅ Sistema de respaldo local

2. **Análisis Astrológico Cabalístico**
   - ✅ Cálculo real de posiciones solares con `astronomy-engine`
   - ✅ Cálculo de los 72 Ángeles (Físico, Emocional, Mental)
   - ✅ Integración con Gemini AI para interpretación
   - ✅ Mapeo planetas-sefirot
   - ✅ Técnicas de reprogramación de aspectos
   - ✅ Sistema de respaldo local

2. **Configuración Centralizada**
   - ✅ `gemini-config.ts` con todos los parámetros
   - ✅ Sistema de reintentos con múltiples modelos
   - ✅ Parsing automático de JSON

3. **Sistema Base Reutilizable**
   - ✅ `kabbalistic-ai-base.ts` para nuevos análisis
   - ✅ Template común de prompts
   - ✅ Manejo automático de errores

### 🔄 Pendiente (Preguntar al Usuario)

- Análisis del Alma (Número del Alma)
- Análisis de Propósito (Tikún)
- Análisis de Relaciones (Yesod/Tiferet)
- Análisis de Salud (Netzach/Hod)
- Visualización de Carta Astral
- Lista completa de los 72 Nombres de Dios

---

## 📚 Referencias

- **Google Gemini API:** https://ai.google.dev/
- **Google AI Studio:** https://aistudio.google.com/
- **Documentación de Gemini:** https://ai.google.dev/gemini-api/docs
- **Astronomy Engine:** https://github.com/cosinekitty/astronomy

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- NUNCA commitees `.env.local` al repositorio
- NUNCA compartas tu API key públicamente
- Usa variables de entorno para todas las keys
- Considera agregar restricciones de IP en Google Cloud Console

---

---

## 📦 Archivos del Sistema

### Configuración y Base
- `lib/gemini-config.ts` - Configuración centralizada de Gemini
- `lib/kabbalistic-ai-base.ts` - Clase base reutilizable para análisis

### Análisis Implementados
- `lib/financial-ai-analysis.ts` - Análisis Financiero (Parnassah)
- `lib/astrologia_cabalistica.ts` - Motor de cálculos astrológicos
- `lib/astrology-ai-analysis.ts` - Análisis Astrológico con IA

### Componentes Visuales
- `components/FinancialHealthReport.tsx` - Reporte de Salud Financiera
- `components/CabalisticAstrologyReport.tsx` - Reporte de Astrología Cabalística

### Scripts de Prueba
- `test-gemini.js` - Verificación de conexión con Gemini

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.1.0  
**Estado:** ✅ Funcional y listo para producción

### 🎉 Nuevas Funcionalidades (v1.1.0)
- ✅ Análisis Astrológico Cabalístico completo
- ✅ Cálculo local de posiciones planetarias (sin APIs externas)
- ✅ Sistema de los 72 Ángeles de Dios
- ✅ Integración con `astronomy-engine`

