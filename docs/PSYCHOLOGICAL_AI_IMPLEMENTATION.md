# Implementación de Interpretación AI Psicológica (Junguiana)

**Fecha:** 26 de Enero 2026  
**Autor:** GitHub Copilot  
**Commit:** `2f1df243` + cambios posteriores

---

## Resumen

Se implementó un sistema completo de interpretación AI para el panel **Psicológico Avanzado** del workspace de astrología, utilizando un enfoque junguiano basado en la obra de Liz Greene.

---

## Arquitectura Multi-Proveedor AI

### Proveedores Configurados (en orden de prioridad)

| Proveedor | Modelo | Límites | Uso |
|-----------|--------|---------|-----|
| **Groq** | `llama-3.3-70b-versatile` | 30 req/min (gratis) | Principal |
| **Ollama** | `llama3.2` | ∞ Sin límites (local) | Respaldo local (solo desarrollo) |
| **Gemini** | `gemini-2.5-flash` | 20 req/día (free tier) | Fallback |

### Detección Automática de Entorno

El sistema detecta si está en **producción** o **desarrollo**:

```python
# Producción (Render, Railway, o DEBUG=False)
→ Groq (principal) → Gemini (fallback)
# Ollama se omite automáticamente

# Local (DEBUG=True)
→ Groq → Ollama → Gemini
# Ollama disponible para testing sin límites
```

### Configuración (.env)

**Desarrollo:**
```env
DEBUG=True  # Habilita Ollama en el fallback
GROQ_API_KEY=gsk_xxx...
GEMINI_API_KEY=AIzaSy...
# Ollama se detecta en localhost:11434
```

**Producción (Render variables de entorno):**
```env
RENDER=1  # Se detecta automáticamente
GROQ_API_KEY=gsk_xxx...
GEMINI_API_KEY=AIzaSy...
# Ollama se omite automáticamente
AI_PROVIDER=auto  # Opcional, ya es el default
```

---

## Componentes Implementados

### 1. Frontend: PsychologicalHoroscopeAdvanced.tsx

**Ubicación:** `tonyblanco-app/components/AstrologyWorkspace/psychological/PsychologicalHoroscopeAdvanced.tsx`

#### Características:
- 4 secciones colapsables con interpretación AI individual
- Botón "Interpretar Todo" para generar todas las secciones
- Copiar al portapapeles
- Indicadores de carga y error
- Accesibilidad con `role="button"` y `onKeyDown`

#### Secciones Psicológicas:

| Sección | Icono | Descripción |
|---------|-------|-------------|
| Arquetipos Dominantes | 🎭 | Planetas dominantes como fuerzas psíquicas |
| Conflictos Internos (Sombra) | 🌑 | Cuadraturas y oposiciones como tensiones |
| Individuación | 🌀 | Trígonos y sextiles como recursos de integración |
| Los Siete Pecados | ⚖️ | Arquetipos simbólicos de energías intensas |

#### Props:
```typescript
interface Props {
  advanced: AdvancedChartInput;
  patientId?: string;
}
```

### 2. Backend: AstrologyInterpretPsychologicalView

**Ubicación:** `backend/api/astrology_ai_views.py`

#### Endpoint:
```
POST /api/astrology/interpret/psychological/
```

#### Request Body:
```json
{
  "patient_id": 4,
  "section": "archetypes" | "shadow" | "individuation" | "sins",
  "data": [...],
  "profile_summary": {...}
}
```

#### Response:
```json
{
  "success": true,
  "interpretation": "...",
  "section": "archetypes",
  "patient_id": 4,
  "interpretation_id": 123
}
```

#### Prompts Junguianos:

Cada sección tiene un prompt especializado en el estilo de Liz Greene:

- **archetypes**: Análisis de planetas como arquetipos del inconsciente colectivo
- **shadow**: Interpretación de aspectos tensos como material de sombra
- **individuation**: Recursos para el proceso de individuación junguiano
- **sins**: Los 7 pecados como arquetipos simbólicos (no morales)

### 3. Servicio AI Multi-Proveedor

**Ubicación:** `backend/api/astrology_ai_service.py`

#### Métodos Principales:

```python
class AstrologyAIService:
    def _ensure_initialized(self)     # Inicialización lazy con fallback
    def _try_init_groq(self) -> bool  # Inicializa Groq
    def _try_init_gemini(self) -> bool # Inicializa Gemini
    def _try_init_ollama(self) -> bool # Inicializa Ollama local
    
    def _generate_content(self, system_prompt, user_prompt, max_tokens, temperature) -> str
    def _generate_groq(...)   # Genera con Groq
    def _generate_gemini(...) # Genera con Gemini
    def _generate_ollama(...) # Genera con Ollama
```

### 4. Modelo de Datos

**Ubicación:** `backend/api/models_astrology_ai.py`

#### Nuevos Tipos de Interpretación:
```python
INTERPRETATION_TYPES = [
    # ... existentes ...
    ('psychological_archetypes', 'Arquetipos Psicológicos'),
    ('psychological_shadow', 'Sombra Junguiana'),
    ('psychological_individuation', 'Individuación'),
    ('psychological_sins', 'Siete Pecados Arquetípicos'),
]
```

#### Migración:
```
backend/api/migrations/0086_extend_interpretation_type_length.py
```

---

## Archivos Modificados

### Backend
| Archivo | Cambio |
|---------|--------|
| `api/astrology_ai_views.py` | + `AstrologyInterpretPsychologicalView` (~100 líneas) |
| `api/astrology_ai_service.py` | + Soporte multi-proveedor (Groq, Ollama, Gemini) |
| `api/urls.py` | + Ruta `/astrology/interpret/psychological/` |
| `api/models_astrology_ai.py` | + 4 nuevos tipos de interpretación |
| `.env` | + `GROQ_API_KEY` |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `psychological/PsychologicalHoroscopeAdvanced.tsx` | Reescritura completa con AI |
| `AstrologyProfessionalView.tsx` | + `patientId` prop |
| `AIInterpretationPanel.tsx` | Fix tipo `patientId: string \| number` |
| `AISituationChat.tsx` | Fix tipo `patientId: string \| number` |

---

## Instalación de Dependencias

### Groq SDK
```bash
pip install groq
```

### Ollama (Local)
1. Descargar de https://ollama.com/download/windows
2. Instalar
3. Ejecutar: `ollama pull llama3.2`

---

## Uso

### Desde la UI

1. Navegar a **Astrología** > seleccionar paciente
2. Ir a pestaña **Psicológico**
3. Click en **"Interpretar Todo"** o en ✨ de cada sección individual
4. Las interpretaciones se guardan automáticamente en la base de datos

### Desde API (curl)

```bash
curl -X POST http://localhost:8000/api/astrology/interpret/psychological/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 4,
    "section": "archetypes",
    "data": [{"planet": "Mars", "weight": 5, "reason": "angular:false aspects:5"}],
    "profile_summary": {}
  }'
```

---

## Manejo de Errores

### Rate Limiting
- Error 429 se detecta y muestra mensaje amigable
- El sistema hace fallback automático al siguiente proveedor

### Errores de Red
- Timeout de 120s para Ollama (modelos locales pueden ser lentos)
- Mensajes de error descriptivos en español

---

## Testing

```bash
# Verificar proveedores disponibles
cd backend
python -c "
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'holistic_therapy.settings'
import django
django.setup()
from api.astrology_ai_service import astrology_ai_service
astrology_ai_service._ensure_initialized()
print(f'Provider: {astrology_ai_service.provider}')
print(f'Model: {astrology_ai_service.model_name}')
print(f'Enabled: {astrology_ai_service.enabled}')
"
```

---

## Notas de Diseño

### ¿Por qué Liz Greene?
Liz Greene es una astróloga y analista junguiana cuyo trabajo combina:
- Psicología analítica de Jung
- Astrología psicológica profunda
- Enfoque no predictivo, centrado en el desarrollo personal

### Enfoque Terapéutico
Las interpretaciones están diseñadas para:
1. Ser herramientas terapéuticas (no adivinatorias)
2. Sugerir áreas de trabajo psicológico
3. Usar lenguaje compasivo y no enjuiciador
4. Evitar predicciones de eventos externos

---

## Commits Relacionados

```
2f1df243 - feat(astrology): add AI interpretation to Psicológico Avanzado panel
```

---

## TODO Futuro

- [ ] Agregar caché de interpretaciones en Redis
- [ ] Implementar regeneración selectiva
- [ ] Exportar interpretaciones a PDF
- [ ] Historial de interpretaciones por paciente
- [ ] Comparar interpretaciones entre proveedores
