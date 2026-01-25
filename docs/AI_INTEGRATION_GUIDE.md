# Guía de Integración de AI (Gemini)

**Documento:** Guía técnica para configuración de servicios AI
**Fecha:** 25 de enero de 2026
**Propósito:** Evitar problemas comunes de configuración al integrar AI en nuevos módulos

---

## 📋 Resumen Ejecutivo

Este documento documenta los aprendizajes críticos de la implementación del servicio de Astrología AI, específicamente relacionados con la configuración correcta de **token limits** y **prompts** para el modelo `gemini-2.5-flash`.

---

## ⚠️ PROBLEMA COMÚN: Respuestas AI Truncadas

### Síntomas
- AI genera respuestas muy cortas (~400-500 caracteres)
- Respuestas incompletas que terminan abruptamente
- `finish_reason: MAX_TOKENS` en logs, pero respuesta corta

### Causa Raíz

El modelo **`gemini-2.5-flash`** es un modelo "thinking" (con cadena de pensamiento interna):

1. **Tokens internos**: El modelo usa tokens internamente para "pensar" antes de responder
2. **Token real disponible**: Si configuramos `max_tokens=2048`, el modelo puede usar ~1500 tokens en pensamiento interno, dejando solo ~548 tokens para la respuesta
3. **Prompts restrictivos**: Si el system prompt dice "máximo 500 palabras", el modelo se autolimita adicionalmenteE

### Solución Aplicada ✅

#### 1. Aumentar `max_tokens` significativamente

```python
# ❌ INCORRECTO - Tokens insuficientes
NATAL_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="...",
    max_tokens=2048,  # ⚠️ Muy bajo para gemini-2.5-flash
    temperature=0.7,
)

# ✅ CORRECTO - Tokens suficientes
NATAL_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="...",
    max_tokens=8192,  # ✅ Suficiente espacio para respuestas completas
    temperature=0.7,
)
```

#### 2. Eliminar restricciones de longitud en prompts

```python
# ❌ INCORRECTO - Autolimita al modelo
SYSTEM_BASE = """Eres un astrólogo profesional.

REGLAS:
1. Usa "consultante" en lugar de "paciente"
2. Responde en español profesional
3. Máximo 500 palabras por respuesta  # ⚠️ LIMITA LA RESPUESTA
"""

# ✅ CORRECTO - Solicita respuestas detalladas
SYSTEM_BASE = """Eres un astrólogo profesional.

REGLAS:
1. Usa "consultante" en lugar de "paciente"
2. Responde en español profesional
3. IMPORTANTE: Proporciona interpretaciones DETALLADAS de 800-1200 palabras
4. Desarrolla CADA sección con profundidad
"""
```

#### 3. Pedir explícitamente respuestas largas en el user prompt

```python
user_template = """Analiza la siguiente carta natal de forma DETALLADA Y PROFUNDA:

[...datos...]

**Estructura de tu respuesta (desarrolla CADA sección con profundidad):**
1. **Síntesis de Personalidad**: 
   - Describe la dinámica central (2-3 párrafos)
   - Explica tensiones o armonías
   - Ofrece ejemplos concretos

2. **Patrones Energéticos**: [...]

IMPORTANTE: Proporciona una interpretación COMPLETA y PROFESIONAL de al menos 800 palabras.
"""
```

---

## 📊 Resultados Medidos

| Configuración | max_tokens | System Prompt | Resultado |
|---------------|-----------|---------------|-----------|
| ❌ Original | 1024 | "Máximo 500 palabras" | ~400 chars (incompleto) |
| ⚠️ Intento 1 | 2048 | "Máximo 500 palabras" | ~500 chars (incompleto) |
| ⚠️ Intento 2 | 2048 | "800-1200 palabras" | ~800 chars (mejor, pero corto) |
| ⚠️ Intento 3 | 4096 | "800-1200 palabras" | ~1500-3000 chars (inconsistente) |
| ✅ **FINAL** | **8192** | **"800-1200 palabras"** | **~17,000 chars (~3,500 palabras)** |

---

## 🎯 Guía Rápida para Nuevos Módulos AI

### Paso 1: Configuración del Prompt

```python
from dataclasses import dataclass

@dataclass
class PromptConfig:
    system_prompt: str
    user_template: str
    max_tokens: int = 8192  # ✅ USAR 8192 para respuestas completas
    temperature: float = 0.7

SYSTEM_BASE = """Eres un experto en [DOMINIO].

REGLAS ESTRICTAS:
1. [Regla de terminología]
2. [Regla de tono]
3. IMPORTANTE: Proporciona respuestas DETALLADAS de [X-Y] palabras
4. Desarrolla CADA sección con profundidad, no solo menciones superficiales
5. Incluye ejemplos concretos

Tu enfoque integra:
- [Enfoque 1]
- [Enfoque 2]
"""

INTERPRETACION_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="""Analiza [TEMA] de forma DETALLADA Y PROFUNDA:

[DATOS]

**Estructura de tu respuesta (desarrolla CADA sección con profundidad):**
1. **[Sección 1]**: 
   - [Subsección A]
   - [Subsección B]
   
2. **[Sección 2]**: [...]

IMPORTANTE: Proporciona una interpretación COMPLETA y PROFESIONAL de al menos [N] palabras.
""",
    max_tokens=8192,  # ✅ Crítico
    temperature=0.7,
)
```

### Paso 2: Servicio AI

```python
from google import genai
from google.genai import types

def _generate_content(
    self,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 8192,  # ✅ Default alto
    temperature: float = 0.7,
) -> str:
    """Genera contenido usando Gemini API."""
    
    config = types.GenerateContentConfig(
        temperature=temperature,
        maxOutputTokens=max_tokens,
        systemInstruction=system_prompt,
    )
    
    response = self.client.models.generate_content(
        model=self.model_name,  # gemini-2.5-flash
        contents=user_prompt,
        config=config,
    )
    
    return response.text
```

### Paso 3: Debugging

Agrega logging para detectar problemas:

```python
# Log response metadata
if hasattr(response, 'candidates') and response.candidates:
    candidate = response.candidates[0]
    finish_reason = getattr(candidate, 'finish_reason', 'unknown')
    logger.info(f"Response finish_reason: {finish_reason}")
    logger.info(f"Generated text length: {len(response.text)} characters")
```

---

## 🔍 Tabla de Referencia: max_tokens por Tipo de Respuesta

| Tipo de Respuesta | Longitud Objetivo | max_tokens Recomendado |
|-------------------|-------------------|------------------------|
| Respuesta corta (FAQ) | 100-200 palabras | 2048 |
| Respuesta media (explicación) | 300-500 palabras | 4096 |
| Respuesta detallada (análisis) | 800-1200 palabras | **8192** ✅ |
| Respuesta muy detallada (informe) | 1500-2500 palabras | 16384 |

> **Nota**: Para `gemini-2.5-flash`, siempre multiplicar por ~1.5x la longitud objetivo debido al "thinking overhead".

---

## 🚨 Checklist Pre-Integración

Antes de integrar AI en un nuevo módulo, verificar:

- [ ] **max_tokens >= 8192** para respuestas detalladas
- [ ] System prompt NO contiene "máximo X palabras"
- [ ] System prompt PIDE explícitamente respuestas detalladas
- [ ] User prompt especifica longitud esperada ("al menos X palabras")
- [ ] User prompt pide desarrollo profundo de cada sección
- [ ] Logging de `finish_reason` habilitado para debug
- [ ] Logging de longitud de respuesta para monitoreo
- [ ] Testeo con 3-5 casos reales antes de deploy

---

## 📁 Archivos de Referencia

**Implementación Exitosa:**
- [backend/api/astrology_ai_prompts.py](../backend/api/astrology_ai_prompts.py) - Configuración de prompts
- [backend/api/astrology_ai_service.py](../backend/api/astrology_ai_service.py) - Servicio AI
- [backend/api/astrology_ai_views.py](../backend/api/astrology_ai_views.py) - Vistas API

**Ejemplo de Uso:**
```python
# En tu nuevo módulo
from api.astrology_ai_service import AstrologyAIService

service = AstrologyAIService()
result = service.interpret_natal(chart_data)

if result.success:
    print(f"Generado: {len(result.interpretation)} caracteres")
else:
    print(f"Error: {result.error}")
```

---

## 🎓 Lecciones Aprendidas

1. **No asumir que max_tokens es suficiente**: `gemini-2.5-flash` usa tokens internamente
2. **El modelo obedece instrucciones literales**: Si dices "máximo 500", genera ~500
3. **Testing es crítico**: Probar con datos reales, no con ejemplos simples
4. **Monitorear finish_reason**: Si es `MAX_TOKENS`, probablemente necesitas más tokens
5. **Prompts claros y específicos**: Pedir explícitamente lo que quieres

---

## 🔗 Referencias

- Google Gemini API Docs: https://ai.google.dev/gemini-api/docs
- Gemini Model Cards: https://ai.google.dev/gemini-api/docs/models/gemini
- Token Counting: https://ai.google.dev/gemini-api/docs/tokens

---

**Última actualización:** 25 de enero de 2026  
**Mantenedor:** Equipo Backend  
**Revisar:** Cada vez que se actualice el SDK de Gemini o se agregue un nuevo módulo AI
