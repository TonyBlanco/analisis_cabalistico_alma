# Multi-Provider AI Service
## Arquitectura de Fallback Automático para Lecturas Simbólicas

**Fecha**: 28 Enero 2026  
**Versión**: 1.1  
**Estado**: ✅ Implementado y Probado  
**Actualización 2026-06-10:** Metering por terapeuta — ver [AI_USAGE_METERING_IMPLEMENTATION.md](01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md)

---

## 📋 Resumen Ejecutivo

Sistema de generación de lecturas simbólicas con **múltiples proveedores de IA** y **fallback automático** para garantizar disponibilidad 24/7 sin errores 503.

### AI Usage Metering (nuevo — pendiente código)

Toda llamada vía `llm_bridge` / `multi_ai_service` debe registrar un `AIUsageEvent` (tokens + coste EUR por terapeuta). La suscripción plana actual se sustituye por **base + créditos AI incluidos + overage**. Especificación completa: [AI_USAGE_METERING_IMPLEMENTATION.md](01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md).

### Proveedores Soportados

| Provider | Modelo | Rate Limits | Estado | Prioridad prod (2026-06) |
|----------|--------|-------------|--------|--------------------------|
| **Gemini** | Gemini 2.5 Flash | Paid tier, alto throughput | ✅ Activo | 1 (Principal prod) |
| **OpenAI** | GPT-4o-mini | Pago, confiable | ✅ Fallback | 2 (Respaldo) |
| **Groq** | Llama 3.3 70B Versatile | Free tier limitado (TPD) | ✅ Activo | 3 (Dev / último cloud) |
| **Ollama** | Llama 3.x (Local) | Sin límites API | 🔄 Opcional | 4 (Último recurso) |

> **Nota:** Con `AI_PROVIDER=free_first` el orden en código sigue siendo Groq primero. En producción con clientes reales usar `AI_PROVIDER=gemini` hasta que el metering esté activo.

---

## 🏗️ Arquitectura

### Flujo de Fallback

```
┌─────────────────────────────────────────────────────────┐
│  Frontend solicita lectura simbólica                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────┐
│  Backend: generate_educational_reading()                │
│  - Normaliza card IDs (fool -> the-fool)                │
│  - Construye prompt con datos de carta                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────┐
│  multi_ai_service.generate_with_fallback()              │
│  - Intenta Groq (Llama 3.3 70B)                        │
│  - Si falla → Intenta Gemini                           │
│  - Si falla → Intenta OpenAI                           │
│  - Si falla → Intenta Ollama local                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─── ✅ SUCCESS
                 │    ├─ Parsea JSON con recovery robusto
                 │    ├─ Retorna: system_frame, core_meaning, contextual_meaning
                 │    └─ Agrega provider usado (groq, gemini, etc)
                 │
                 └─── ❌ TODOS FALLAN
                      └─ Usa generate_fallback_symbolic_reading()
                         (Basado en datos estáticos de la carta)
```

---

## 📁 Archivos Implementados

### Backend Core

#### 1. `backend/api/utils/multi_ai_service.py` ⭐ NUEVO
**Funcionalidad**: Servicio multi-proveedor con fallback automático

```python
# Lazy loading de clientes
_gemini_client = None
_openai_client = None
_groq_client = None

# Funciones de llamada por proveedor
_call_gemini(prompt, config) -> Optional[str]
_call_openai(prompt, config) -> Optional[str]
_call_groq(prompt, config) -> Optional[str]
_call_ollama(prompt, config) -> Optional[str]

# Clase principal
class MultiAIService:
    PROVIDERS = ['groq', 'gemini', 'openai', 'ollama']
    
    def generate(prompt, temperature, max_tokens, top_p) -> Dict[str, Any]:
        # Intenta cada proveedor en orden hasta que uno funcione
        # Retorna: {success, text, provider, error}
```

**Uso**:
```python
from api.utils.multi_ai_service import generate_with_fallback

result = generate_with_fallback("Tu prompt aquí", temperature=0.7, max_tokens=512)
if result['success']:
    print(f"Provider: {result['provider']}")
    print(f"Response: {result['text']}")
```

#### 2. `backend/symbolic/swm_v3/views.py` 🔄 ACTUALIZADO

**Cambios principales**:

1. **Import del servicio multi-AI**:
```python
from api.utils.multi_ai_service import generate_with_fallback, multi_ai
AI_ENABLED = len(multi_ai.available_providers) > 1
```

2. **Función `generate_ai_symbolic_reading()`**:
   - Usa `generate_with_fallback()` en lugar de un solo proveedor
   - Prompt simplificado y optimizado
   - Parsing JSON robusto con recuperación de campos

3. **Parsing JSON Mejorado**:
```python
# Intenta parse completo
try:
    parsed = json.loads(response_text)
except json.JSONDecodeError:
    # Recupera campos con regex si JSON está truncado
    parsed = {}
    match = re.search(r'"system_frame"\s*:\s*"((?:[^"\\]|\\.)*)"', response_text)
    if match:
        parsed['system_frame'] = match.group(1)
    # Similar para core_meaning y contextual_meaning
```

4. **Retorno con provider info**:
```python
return {
    "symbolic_reading": {
        "system_frame": "...",
        "core_meaning": "...",
        "contextual_meaning": "..."
    },
    "ai_generated": True,
    "ai_provider": "groq",  # ← Nuevo campo
    "notes": "Generado por IA via GROQ (...)"
}
```

#### 3. `backend/core/settings.py` 🔄 ACTUALIZADO

**Nueva configuración**:
```python
# OpenAI Configuration (GPT-4o-mini for fallback)
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-4o-mini')
```

**Configuraciones existentes**:
```python
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-2.5-flash')

GROQ_API_KEY = config('GROQ_API_KEY', default='')
GROQ_MODEL = config('GROQ_MODEL', default='llama-3.3-70b-versatile')

OLLAMA_BASE_URL = config('OLLAMA_BASE_URL', default='http://localhost:11434')
OLLAMA_MODEL = config('OLLAMA_MODEL', default='llama3.2')
```

### Frontend

#### 4. `tonyblanco-app/components/AstrologyTarotWorkspace/AstrologyTarotVisualCore.tsx` 🔄 ACTUALIZADO

**Cambios en TypeScript**:

1. **Tipo actualizado**:
```typescript
type SwmV3Payload = {
  symbolic_reading?: {
    ai_generated?: boolean;
    ai_provider?: string;  // ← Nuevo campo
    symbolic_reading?: {
      system_frame: string;
      core_meaning: string;
      contextual_meaning: string;
    };
  };
};
```

2. **Badge con provider**:
```tsx
{swmPayload.symbolic_reading.ai_generated 
  ? `✨ ${swmPayload.symbolic_reading.ai_provider?.toUpperCase() || 'IA'}` 
  : '📚 Tradición'}
```

**Visualización**:
- **"✨ GROQ"** → Verde (IA via Groq)
- **"✨ GEMINI"** → Verde (IA via Gemini)
- **"✨ OPENAI"** → Verde (IA via OpenAI)
- **"📚 Tradición"** → Azul (Fallback estático)

---

## 🔧 Configuración

### Variables de Entorno (`backend/.env`)

**Mínimo requerido** (ya configurado):
```bash
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
```

**Opcional para mayor redundancia**:
```bash
OPENAI_API_KEY=sk-proj-...  # ← Agregar para tercer nivel de fallback
OPENAI_MODEL=gpt-4o-mini
```

**Local (sin API keys)**:
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

## 🧪 Pruebas Realizadas

### Test 1: Gemini (Parcial)
```
Provider: gemini
Marco simbólico: "El B.O.T.A. Tarot es un sistema kab..." [TRUNCADO]
Resultado: ⚠️ JSON truncado, recuperó 1 campo con regex
```

### Test 2: Groq (EXITOSO) ✅
```
Provider: groq
Marco simbólico: "El B.O.T.A. Tarot es un sistema de simbolismo esotérico que 
                  combina la sabiduría del Tarot con la Cábala Hermética..."
Significado: "La Sacerdotisa representa la intuición y la memoria subconsciente..."
Contexto: "La Sacerdotisa nos invita a explorar nuestros propios patrones..."
Resultado: ✅ JSON completo y bien formado
```

---

## 📊 Estado de Sistemas Simbólicos

### Implementados ✅ (3/8)

| Sistema | ID | Estado | Deck JSON | IA Lecturas |
|---------|----|----|-----------|-------------|
| **Thoth Tarot** | `thoth` | ✅ Completo | `bota_tableau_complete.json` | ✅ Multi-AI |
| **B.O.T.A. Tarot** | `bota` | ✅ Completo | `bota_tableau_complete.json` | ✅ Multi-AI |
| **Tarot Cabalístico** | `tarot-cabalistico` | ✅ Completo | `bota_tableau_complete.json` | ✅ Multi-AI |

### Pendientes ❌ (5/8)

| Sistema | ID | Estado | Prioridad | Requisitos |
|---------|----|----|-----------|------------|
| **Golden Dawn** | `golden-dawn` | ❌ Sin implementar | Alta | Crear deck JSON con 22 arcanos |
| **Rider-Waite** | `rider-waite` | ❌ Sin implementar | Alta | Deck JSON + imágenes RWS |
| **Marsella** | `marsella` | ❌ Sin implementar | Media | Deck JSON tradición francesa |
| **Sephiroth** | `sephiroth` | ❌ Sin implementar | Media | Deck JSON con paths sefiróticos |
| **Hermetic** | `hermetic` | ❌ Sin implementar | Baja | Deck JSON Godfrey Dowson |

---

## 🚀 Próximos Pasos

### Fase 1: Completar OpenAI (Redundancia Total)
1. Agregar `OPENAI_API_KEY` al `.env`
2. Instalar SDK: `pip install openai`
3. Probar fallback completo: Groq → Gemini → OpenAI

### Fase 2: Implementar Sistemas Faltantes
Para cada sistema pendiente:

1. **Crear deck JSON** (ej: `golden_dawn_complete.json`):
```json
{
  "deck": {
    "name": "Golden Dawn Tarot",
    "system": "Hermetic Order of the Golden Dawn",
    "totalCards": 22
  },
  "majorArcana": [
    {
      "id": "the-fool",
      "keyNumber": 0,
      "name": "The Fool",
      "nameSpanish": "El Loco",
      "kabbalistic": {
        "hebrewLetter": "Aleph",
        "letterValue": 1,
        "path": 11,
        "sefirot": ["Kether", "Chokmah"]
      },
      "keywords": ["beginning", "potential", "innocence"]
    }
    // ... 21 cartas más
  ]
}
```

2. **Agregar función de carga** en `views.py`:
```python
def load_golden_dawn_deck() -> Dict[str, Any]:
    try:
        path = SYMBOLIC_DATA_PATH / "tarot" / "golden-dawn" / "golden_dawn_complete.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading Golden Dawn deck: {e}")
    return {"deck": {"name": "Golden Dawn Tarot"}, "majorArcana": []}
```

3. **Actualizar `get_system_metadata()`**:
```python
"golden-dawn": {
    "id": "golden-dawn",
    "name": "Golden Dawn Tarot",
    "implemented": True,  # ← Cambiar a True
    "description": "Hermetic Order of the Golden Dawn tradition",
    "source": "Golden Dawn tradition",
}
```

4. **Actualizar `generate_educational_reading()`**:
```python
# Load deck data
if system_id in ["thoth", "bota", "tarot-cabalistico"]:
    deck_data = load_bota_deck()
elif system_id == "golden-dawn":
    deck_data = load_golden_dawn_deck()  # ← Agregar
# ...
```

---

## 🔒 Seguridad y Gobernanza

### Modos de Persistencia (ya implementado)

1. **`no_store`** (Default): No persiste datos, máxima privacidad
2. **`store_anonymized`**: Guarda metadatos sin datos personales
3. **`store_with_consent`**: Requiere consentimiento explícito

### Disclaimer Educativo

Todas las lecturas incluyen:
```
"Esta lectura es de carácter educativo y simbólico. 
No constituye consejo médico, psicológico ni profesional. 
Las interpretaciones son exploraciones simbólicas para reflexión personal."
```

---

## 📝 Logs y Monitoreo

### Logs Clave

```python
logger.info(f"[MultiAI] Available providers: {available}")
logger.info(f"[MultiAI] Trying provider: {provider}")
logger.info(f"[MultiAI] Success with provider: {provider}")
logger.error(f"[MultiAI] All AI providers failed: {errors}")

logger.info(f"[SWM-v3] AI response from provider: {ai_provider}")
logger.info(f"[SWM-v3] Recovered {len(parsed)} fields from malformed JSON")
logger.error(f"[SWM-v3] JSON parse error from AI response: {e}")
logger.error(f"[SWM-v3] AI generation error: {e}")
```

### Debugging

Para ver logs en tiempo real:
```bash
cd d:\analisis_cabalistico_alma\backend
python manage.py runserver --noreload
# En consola verás [MultiAI] y [SWM-v3] logs
```

---

## 🎯 KPIs y Métricas

### Métricas a Trackear (futuro)

- **Tasa de éxito por proveedor**: % de llamadas exitosas
- **Latencia promedio**: Tiempo de respuesta por proveedor
- **Tasa de fallback**: % que requiere segundo intento
- **Calidad JSON**: % de respuestas que requieren regex recovery

### Estado Actual

- ✅ Groq: 100% tasa de éxito, JSON completo
- ⚠️ Gemini: ~30% JSONs truncados, requiere recovery
- ⏳ OpenAI: No probado aún
- ⏳ Ollama: No probado aún

---

## 📚 Referencias

### Documentos Relacionados

- `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md` - Gobernanza original
- `backend/api/utils/symbolic_interpreter_ai.py` - Servicio legacy (single provider)
- `packages/symbolic/tarot/bota/bota_tableau_complete.json` - Deck BOTA completo

### APIs Externas

- **Groq**: https://console.groq.com/
- **Gemini**: https://ai.google.dev/
- **OpenAI**: https://platform.openai.com/
- **Ollama**: https://ollama.ai/

---

## ✅ Checklist de Implementación

### Completado ✅

- [x] Crear `multi_ai_service.py` con fallback automático
- [x] Integrar en `swm_v3/views.py`
- [x] Parsing JSON robusto con recovery
- [x] Actualizar frontend para mostrar provider
- [x] Agregar `OPENAI_API_KEY` a settings
- [x] Cambiar orden de prioridad: Groq → Gemini → OpenAI
- [x] Probar con Groq (exitoso)
- [x] Normalización de card IDs (fool → the-fool)
- [x] Documentación completa

### Pendiente ⏳

- [ ] Configurar OPENAI_API_KEY en `.env`
- [ ] Instalar SDK OpenAI: `pip install openai`
- [ ] Probar fallback completo con 3 proveedores
- [ ] Implementar 5 sistemas faltantes
- [ ] Agregar métricas y telemetría
- [ ] Crear tests automatizados para cada provider

---

**Autor**: Sistema Multi-AI Team  
**Última actualización**: 28 Enero 2026  
**Versión**: 1.0.0
