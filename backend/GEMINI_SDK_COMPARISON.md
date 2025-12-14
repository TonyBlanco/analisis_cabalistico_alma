# Comparación: REST API vs Google GenAI SDK (google-genai)

## Resumen Ejecutivo

**Estado actual:** Usamos API REST con `requests`  
**Nuevo SDK disponible:** `google-genai` (SDK unificado oficial de Google)  
**SDK antiguo deprecado:** `google-generativeai` (se depreca el 30 de noviembre de 2025)

---

## Ventajas del Nuevo SDK `google-genai`

### 1. **Cliente Centralizado y Simplificado** ⭐⭐⭐⭐⭐

**REST API (actual):**
```python
# Necesitas construir el payload manualmente
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {...}
}
response = requests.post(url, json=payload, headers=headers)
# Extraer respuesta manualmente
data = response.json()
text = data['candidates'][0]['content']['parts'][0]['text']
```

**Nuevo SDK `google-genai`:**
```python
from google import genai

client = genai.Client()  # Auto-detecta GEMINI_API_KEY del entorno
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Tu prompt aquí'
)
print(response.text)  # Mucho más simple
```

**Ventaja:** Código 70% más corto y legible

---

### 2. **Acceso a Características Nuevas** ⭐⭐⭐⭐⭐

El nuevo SDK da acceso a características que NO están disponibles vía REST simple:

- ✅ **Live API** (conversaciones en tiempo real)
- ✅ **Veo** (generación de video)
- ✅ **Imagen** (generación de imágenes)
- ✅ **Lyria** (generación de música)
- ✅ **Gemini 3 Pro** (modelos más recientes)
- ✅ **Thinking Config** (control de razonamiento)
- ✅ **Thought Signatures** (firmas de pensamiento)
- ✅ **Function Calling automático** (con Python functions)
- ✅ **Structured Outputs** (con Pydantic models)
- ✅ **Context Caching** (optimización de costos)
- ✅ **Batch API** (procesamiento masivo)

**REST API actual:** Solo acceso básico a `generateContent`

---

### 3. **Type Safety con Pydantic** ⭐⭐⭐⭐

**REST API (actual):**
```python
# Sin type checking, errores en runtime
result = json.loads(response_text)  # Puede fallar
titulo = result.get('titulo')  # Sin autocompletado
```

**Nuevo SDK:**
```python
from google.genai import types
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    titulo: str
    analisis_ragil: dict
    # ... autocompletado y validación automática

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt,
    config=types.GenerateContentConfig(
        response_schema=AnalysisResult  # Validación automática
    )
)
result = response.parsed  # Ya es un objeto AnalysisResult tipado
```

**Ventaja:** Menos errores, mejor IDE support, validación automática

---

### 4. **Mejor Manejo de Errores** ⭐⭐⭐⭐

**REST API (actual):**
```python
try:
    response = requests.post(url, json=payload)
    response.raise_for_status()
    data = response.json()
    # Tienes que verificar manualmente cada nivel
    if 'candidates' in data and len(data['candidates']) > 0:
        # ... más verificaciones
except requests.exceptions.RequestException as e:
    # Manejo genérico
```

**Nuevo SDK:**
```python
try:
    response = client.models.generate_content(...)
    # El SDK maneja automáticamente:
    # - Rate limiting
    # - Retries
    # - Error parsing
    # - Response validation
except genai.exceptions.GenAIException as e:
    # Errores específicos y descriptivos
```

**Ventaja:** Manejo de errores más robusto y específico

---

### 5. **Soporte Async Nativo** ⭐⭐⭐⭐

**REST API (actual):**
```python
# Necesitas usar asyncio y aiohttp manualmente
import aiohttp
async with aiohttp.ClientSession() as session:
    async with session.post(url, json=payload) as response:
        data = await response.json()
```

**Nuevo SDK:**
```python
from google import genai

client = genai.Client()
# Async está integrado
response = await client.aio.models.generate_content(...)
```

**Ventaja:** Async más simple y eficiente

---

### 6. **Streaming Mejorado** ⭐⭐⭐⭐

**REST API (actual):**
```python
# Streaming manual con requests
response = requests.post(url, json=payload, stream=True)
for chunk in response.iter_content():
    # Procesar manualmente
```

**Nuevo SDK:**
```python
for chunk in client.models.generate_content_stream(...):
    print(chunk.text)  # Mucho más simple
```

---

### 7. **Function Calling Automático** ⭐⭐⭐⭐⭐

**REST API (actual):**
```python
# Tienes que:
# 1. Definir el schema JSON manualmente
# 2. Parsear la respuesta
# 3. Invocar la función
# 4. Formatear la respuesta
# 5. Enviar de vuelta al modelo
```

**Nuevo SDK:**
```python
def get_weather(location: str) -> str:
    """Returns the current weather."""
    return "sunny"

# El SDK hace TODO automáticamente
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='What is the weather in Boston?',
    config=types.GenerateContentConfig(
        tools=[get_weather]  # Solo pasa la función Python
    )
)
# La función se invoca automáticamente y se integra en la conversación
```

**Ventaja:** Function calling con 1 línea vs 50+ líneas manuales

---

### 8. **Soporte para Vertex AI** ⭐⭐⭐⭐

El nuevo SDK puede trabajar con:
- ✅ Gemini Developer API (actual)
- ✅ Vertex AI (para enterprise)
- ✅ Migración fácil entre ambos

**REST API actual:** Solo funciona con Developer API

---

### 9. **Mejor Documentación y Soporte** ⭐⭐⭐⭐

- ✅ Documentación oficial completa
- ✅ Ejemplos actualizados
- ✅ Soporte activo de Google
- ✅ Compatible con frameworks (LangChain, LlamaIndex, etc.)

---

### 10. **Optimizaciones de Rendimiento** ⭐⭐⭐

- ✅ Connection pooling automático
- ✅ Retry logic inteligente
- ✅ Context caching integrado
- ✅ Batch processing optimizado

---

## Desventajas del Nuevo SDK

### 1. **Dependencia Adicional**
- Requiere instalar `google-genai` (pero es oficial y mantenido)

### 2. **Curva de Aprendizaje**
- Nueva API (aunque más simple que REST)

### 3. **Tamaño del Paquete**
- Más grande que solo `requests` (pero incluye muchas features)

---

## Comparación de Código

### Ejemplo: Generar Interpretación

**REST API (actual - ~30 líneas):**
```python
def generate_interpretation(prompt):
    api_key = getattr(settings, 'GEMINI_API_KEY')
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.8,
            "topP": 0.9,
            "topK": 40,
            "maxOutputTokens": 2048
        }
    }
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    response.raise_for_status()
    data = response.json()
    if 'candidates' in data and len(data['candidates']) > 0:
        candidate = data['candidates'][0]
        if 'content' in candidate and 'parts' in candidate['content']:
            parts = candidate['content']['parts']
            if len(parts) > 0 and 'text' in parts[0]:
                return parts[0]['text'].strip()
    raise ValueError("Respuesta inesperada")
```

**Nuevo SDK (~5 líneas):**
```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt,
    config={'temperature': 0.8, 'top_p': 0.9}
)
return response.text
```

---

## Recomendación

### ✅ **MIGRAR al Nuevo SDK `google-genai`**

**Razones:**
1. **Oficial y mantenido** - Google lo recomienda activamente
2. **Acceso a nuevas features** - Live API, Veo, Gemini 3, etc.
3. **Código más simple** - 70% menos código
4. **Mejor DX** - Type safety, autocompletado, validación
5. **Futuro-proof** - El SDK antiguo se depreca en noviembre 2025
6. **Mejor rendimiento** - Optimizaciones integradas

**Cuándo migrar:**
- ✅ **Ahora** - Si quieres acceso a nuevas features
- ✅ **Pronto** - Antes de noviembre 2025 (deprecación del SDK antiguo)
- ⚠️ **Más tarde** - Si tu código REST actual funciona bien y no necesitas nuevas features

---

## Plan de Migración Sugerido

1. **Instalar nuevo SDK:**
   ```bash
   pip install google-genai
   ```

2. **Actualizar helper:**
   - Reemplazar `gemini_rest.py` con uso del nuevo SDK
   - Mantener la misma interfaz para compatibilidad

3. **Migrar servicios gradualmente:**
   - Empezar con un servicio (ej: `gematria_ai.py`)
   - Probar y verificar
   - Migrar el resto

4. **Beneficios inmediatos:**
   - Código más limpio
   - Mejor manejo de errores
   - Acceso a nuevas features

---

## Conclusión

El nuevo SDK `google-genai` ofrece **ventajas significativas** sobre la API REST manual:

- ✅ **Código más simple** (70% menos líneas)
- ✅ **Acceso a nuevas features** (Live API, Veo, Gemini 3)
- ✅ **Mejor developer experience** (type safety, autocompletado)
- ✅ **Oficial y mantenido** (recomendado por Google)
- ✅ **Futuro-proof** (el SDK antiguo se depreca)

**Recomendación:** Migrar al nuevo SDK para aprovechar todas las ventajas y estar preparado para el futuro.
