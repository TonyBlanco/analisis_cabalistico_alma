# AGENTE_ARQ > Plan de Implementación: Activación Tarot IA Holístico

**Skills applied**: `ai-agents-architect`, `systematic-debugging`, `django-drf-patterns`

## Context

El workspace de Tarot SWM tiene una sección "Preparar Análisis IA" actualmente en **modo preparación** (sin ejecución). 

**Estado actual**:
- ✅ Backend: Multi-provider AI ya implementado en `backend/api/astrology_ai_service.py`
  - **Groq AI** (prioritario): `llama-3.3-70b-versatile` con rate limits altos
  - **Ollama** (local/Vercel): `llama3.2` sin límites
  - **Gemini** (fallback): `gemini-2.5-flash`
- ✅ Frontend: UI de preparación en `AstrologyTarotWorkspace/AstrologyTarotVisualCore.tsx`
- ✅ Documentación: Plan completo en `docs/tarot-ai-plan.md`
- ⚠️ **Falta**: Endpoints API específicos de Tarot, integración frontend-backend, consentimiento

## Objective

Activar la funcionalidad de interpretación IA **holística** siguiendo las 6 fases del plan técnico (`tarot-ai-plan.md`), respetando:
- **Enfoque holístico** (no clínico, no terapéutico, solo simbólico-educativo)
- Gobernanza SWM v3
- Contrato AI simbólico
- Multi-provider AI (Groq → Ollama → Gemini)
- Feature flag `AI_TAROT_ENABLED`
- Consentimiento obligatorio con disclaimer holístico

## Restrictions

- ❌ DO NOT touch: Módulos clínicos en `backend/api/` (mantener separación holístico/clínico)
- ❌ DO NOT execute: Cambios sin feature flag
- ❌ DO NOT bypass: Sistema de consentimiento
- ❌ DO NOT use: Terminología clínica ("paciente" es legacy, usar "consultante", "diagnóstico", "terapéutico")
- ✅ Authorized scope: 
  - Nuevos endpoints bajo `/api/ai/tarot/` (holísticos)
  - Reutilizar `astrology_ai_service.py` (multi-provider ya implementado)
  - Componentes UI en `components/tarot/`
  - Extensión de tipos en `lib/api/swm/tarot/`
  - Despliegue en Vercel con Ollama configurado

## Architecture Decision

### Fase 0: Preparación (AHORA) ✅

**Ya completado**:
- [x] `TarotTherapeuticAI` class con Gemini
- [x] UI de preparación con checkboxes
- [x] Documentación y plan

**Pendiente**:
- [ ] Feature flag `AI_TAROT_ENABLED` en settings
- [ ] Variables de entorno validadas
- [ ] Branch `feature/tarot-ai-activation`

### Fase 1: Endpoints API (2-3 días)

**Reutilizar arquitectura multi-provider existente**:

Ya existe `backend/api/astrology_ai_service.py` con:
- ✅ Auto-selección de provider (Groq → Ollama → Gemini)
- ✅ Modo producción vs local
- ✅ Rate limiting y retry logic
- ✅ Error handling robusto

**Crear nuevos endpoints holísticos**:

```python
# backend/api/tarot_holistic_views.py (NUEVO)
# Importar servicio multi-provider existente
from api.astrology_ai_service import HolisticAI

holistic_ai = HolisticAI()  # Auto-configura Groq/Ollama/Gemini

POST /api/ai/tarot/interpretCard
  Request:
    {
      "arcanaId": "the_fool",
      "position": "center",
      "reversed": false,
      "context": {
        "question": "...",
        "consultantId": 123,  # Holístico: "consultante" no "paciente"
        "instanceId": "uuid"
      },
      "options": {
        "temperature": 0.7,
        "seed": null,
        "provider": "auto"  # auto, groq, ollama, gemini
      }
    }
  Response:
    {
      "text": "Interpretación simbólica...",
      "themes": ["renacimiento", "curiosidad"],
      "confidence": 0.72,
      "provider_used": "groq",
      "model_used": "llama-3.3-70b-versatile",
      "holistic_disclaimer": "Interpretación simbólica educativa, no clínica",
      "explanationTrace": [{...}]
    }

POST /api/ai/tarot/interpretSpread
  Request:
    {
      "spreadType": "three_card",
      "cards": [
        {"arcanaId": "the_fool", "reversed": false, "position": "past"},
        ...
      ],
      "context": {...},
      "options": {
        "provider": "auto",  # Groq → Ollama → Gemini
        "temperature": 0.8
      }
    }
  Response:
    {
      "cardInterpretations": [...],
      "summary": "Lectura simbólica holística...",
      "symbolic_insights": ["..."],  # No "recomendaciones terapéuticas"
      "confidence": 0.84,
      "provider_used": "groq",
      "holistic_disclaimer": "Para fines educativos y exploratorios únicamente"
    }

GET /api/ai/tarot/schema
  Response:
    {
      "decks": ["thoth", "golden-dawn", ...],
      "spreadTypes": [...],
      "providers": [
        {
          "id": "groq",
          "name": "Groq AI",
          "model": "llama-3.3-70b-versatile",
          "available": true,
          "priority": 1
        },
        {
          "id": "ollama",
          "name": "Ollama (Local)",
          "model": "llama3.2",
          "available": true,
          "priority": 2,
          "deployment": "vercel"
        },
        {
          "id": "gemini",
          "name": "Gemini (Fallback)",
          "model": "gemini-2.5-flash",
          "available": true,
          "priority": 3
        }
      ],
      "version": "1.0.0",
      "mode": "holistic"  # No "therapeutic"
    }
```

**Ubicación**:
- `backend/api/tarot_holistic_views.py` (nuevo archivo)
- Agregar rutas en `backend/api/urls.py`
- **Reutilizar** `astrology_ai_service.py` (multi-provider ya implementado)
- Adaptar prompts para lenguaje holístico (no clínico)

**Validaciones**:
- Feature flag `AI_TAROT_ENABLED` activo
- Usuario autenticado
- Workspace instance existe
- Session activa
- Consentimiento holístico aceptado
- Rate limiting (Groq: 30 req/min, Ollama: ilimitado, Gemini: 15 req/min)
- Provider disponible (fallback automático si uno falla)

### Fase 2: Frontend - Cliente API (1-2 días)

**Crear cliente TypeScript**:

```typescript
// tonyblanco-app/lib/api/tarot-holistic-client.ts (NUEVO)

export const tarotHolisticApi = {
  async interpretCard(request: InterpretCardRequest): Promise<InterpretCardResponse> {
    // Verificar consentimiento holístico
    // Enviar con provider: "auto" (Groq → Ollama → Gemini)
  },
  async interpretSpread(request: InterpretSpreadRequest): Promise<InterpretSpreadResponse> {...},
  async getSchema(): Promise<TarotHolisticSchema> {...},
  async getProviderStatus(): Promise<ProviderStatus[]> {  // NUEVO
    // Obtener estado de Groq, Ollama, Gemini
  }
};
```

**Crear hooks**:

```typescript
// tonyblanco-app/lib/api/swm/tarot/hooks/useTarotHolistic.ts (NUEVO)

export function useTarotHolistic() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<'groq' | 'ollama' | 'gemini' | null>(null);
  
  const interpretCard = useCallback(async (request) => {
    // Verificar consentimiento holístico
    if (!hasHolisticConsent()) {
      throw new Error('Holistic consent required');
    }
    
    const response = await tarotHolisticApi.interpretCard({
      ...request,
      options: {
        ...request.options,
        provider: 'auto'  // Groq → Ollama → Gemini
      }
    });
    
    setProviderUsed(response.provider_used);
    return response;
  }, []);
  
  return { interpretCard, isLoading, error, providerUsed };
}
```

### Fase 3: UI - Sistema de Consentimiento (2 días)

**Componente de consentimiento holístico**:

```typescript
// components/tarot/TarotHolisticConsentBanner.tsx (NUEVO)

export function TarotHolisticConsentBanner({ onAccept, onDecline }) {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus[]>([]);
  
  useEffect(() => {
    // Cargar estado de providers (Groq, Ollama, Gemini)
    tarotHolisticApi.getProviderStatus().then(setProviderStatus);
  }, []);
  
  return (
    <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
      <div className="flex items-start">
        <Sparkles className="h-5 w-5 text-indigo-600 mr-3" />
        <div className="flex-1">
          <h3 className="font-medium text-indigo-900">
            Interpretaciones Simbólicas Holísticas con IA
          </h3>
          <p className="text-sm text-indigo-700 mt-1">
            Las interpretaciones son <strong>educativas y exploratorias</strong>. 
            No sustituyen acompañamiento profesional en salud integral.
          </p>
          <div className="mt-2 text-xs text-indigo-600">
            <p>Providers disponibles:</p>
            <ul className="list-disc list-inside">
              {providerStatus.map(p => (
                <li key={p.id}>
                  {p.name} ({p.model}) - {p.available ? '✓' : '✗'}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 flex gap-3">
            <button onClick={onAccept} className="btn-primary">
              Acepto y comprendo (uso holístico-educativo)
            </button>
            <button onClick={onDecline} className="btn-secondary">
              No usar IA
            </button>
            <Link href="/policies/holistic-ai" className="text-xs text-indigo-600">
              Leer política holística completa →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Modal de interpretación**:

```typescript
// components/tarot/TarotInterpretationModal.tsx (NUEVO)

export function TarotInterpretationModal({ 
  card, 
  interpretation, 
  onClose,
  onSave 
}) {
  const [showTrace, setShowTrace] = useState(false);
  
  return (
    <Modal>
      <ModalHeader>
        Interpretación: {card.name}
      </ModalHeader>
      <ModalBody>
        <div className="prose">
          {interpretation.text}
        </div>
        
        <div className="mt-4">
          <h4>Temas detectados:</h4>
          <div className="flex gap-2">
            {interpretation.themes.map(theme => (
              <Badge key={theme}>{theme}</Badge>
            ))}
          </div>
        </div>
        
        {showTrace && (
          <div className="mt-4 bg-gray-50 p-3">
            <h4>Trazabilidad:</h4>
            <pre className="text-xs">
              {JSON.stringify(interpretation.explanationTrace, null, 2)}
            </pre>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button onClick={() => setShowTrace(!showTrace)}>
          {showTrace ? 'Ocultar' : 'Mostrar'} Trazabilidad
        </button>
        <button onClick={() => onSave('anonymized')}>
          Guardar (anonimizado)
        </button>
        <button onClick={() => onSave('with_consent')}>
          Guardar con datos
        </button>
        <button onClick={onClose}>
          No guardar
        </button>
      </ModalFooter>
    </Modal>
  );
}
```

### Fase 4: Integración en Workspace (1 día)

**Actualizar `AstrologyTarotVisualCore.tsx`**:

```typescript
// En la sección 'tarot-ai-draft'
const { interpretCard, isLoading } = useTarotAi();
const [hasConsent, setHasConsent] = useState(false);
const [interpretation, setInterpretation] = useState(null);

const handleRequestInterpretation = async () => {
  if (!hasConsent) {
    // Mostrar banner de consentimiento
    return;
  }
  
  if (!selectedCard) {
    alert('Selecciona una carta primero');
    return;
  }
  
  const result = await interpretCard({
    arcanaId: selectedCard.id,
    position: 'center',
    reversed: false,
    context: {
      question: intention,
      patientId,
      instanceId,
    },
    options: {
      temperature: 0.7,
    }
  });
  
  setInterpretation(result);
  // Abrir modal con resultado
};
```

### Fase 5: Testing y Validación (2-3 días)

**Tests backend**:
```python
# backend/api/tests/test_tarot_ai.py (NUEVO)

def test_interpret_card_requires_auth():
    response = client.post('/api/ai/tarot/interpretCard', {})
    assert response.status_code == 401

def test_interpret_card_requires_feature_flag():
    settings.AI_TAROT_ENABLED = False
    response = client.post('/api/ai/tarot/interpretCard', {...})
    assert response.status_code == 403

def test_interpret_card_valid():
    response = client.post('/api/ai/tarot/interpretCard', {
        'arcanaId': 'the_fool',
        'position': 'center',
        ...
    })
    assert response.status_code == 200
    assert 'text' in response.json()
    assert 'themes' in response.json()
```

**Tests frontend**:
```typescript
// __tests__/tarot-ai.test.ts (NUEVO)

describe('TarotAi', () => {
  it('should require consent before interpreting', async () => {
    const { interpretCard } = useTarotAi();
    await expect(interpretCard({...})).rejects.toThrow('Consent required');
  });
  
  it('should call API with correct parameters', async () => {
    // Mock API
    // Test call
  });
});
```

### Fase 6: Feature Flag y Despliegue (1 día)

**Settings** (YA IMPLEMENTADO en `backend/core/settings.py`):
```python
# Feature Flags
AI_TAROT_ENABLED = env.bool('AI_TAROT_ENABLED', default=False)

# Multi-Provider AI (YA EXISTE)
GROQ_API_KEY = config('GROQ_API_KEY', default='')  # Prioritario
GROQ_MODEL = config('GROQ_MODEL', default='llama-3.3-70b-versatile')

OLLAMA_BASE_URL = config('OLLAMA_BASE_URL', default='http://localhost:11434')
OLLAMA_MODEL = config('OLLAMA_MODEL', default='llama3.2')

GEMINI_API_KEY = config('GEMINI_API_KEY', default='')  # Fallback
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-2.5-flash')

AI_PROVIDER = config('AI_PROVIDER', default='auto')  # auto, groq, ollama, gemini

# Holistic AI Configuration
TAROT_AI_TEMPERATURE = env.float('TAROT_AI_TEMPERATURE', default=0.8)
TAROT_AI_MAX_TOKENS = env.int('TAROT_AI_MAX_TOKENS', default=2048)
```

**Environment variables**:
```bash
# .env (Vercel)
AI_TAROT_ENABLED=false  # Activar solo cuando esté listo

# Groq AI (Prioritario - rate limits altos)
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Ollama (Local/Vercel - sin límites)
OLLAMA_BASE_URL=https://your-vercel-ollama-instance.vercel.app
OLLAMA_MODEL=llama3.2

# Gemini (Fallback)
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash

# Provider selection
AI_PROVIDER=auto  # Groq → Ollama → Gemini
TAROT_AI_TEMPERATURE=0.8
```

**Runbook**:
```markdown
# Activación de Tarot AI

1. Verificar que todos los tests pasen
2. Desplegar a staging con AI_TAROT_ENABLED=true
3. Realizar 10 interpretaciones de prueba
4. Verificar logs de trazabilidad
5. Monitorear métricas (latencia, errores)
6. Si todo OK, activar en producción gradualmente
7. Monitorear 24h después de activación
```

## Deliverables

### Fase 1-2: Backend + API Client (3-5 días)
1. ✅ `backend/api/tarot_ai_views.py` con 3 endpoints
2. ✅ `backend/api/urls.py` actualizado
3. ✅ `lib/api/tarot-ai-client.ts` 
4. ✅ `lib/api/swm/tarot/hooks/useTarotAi.ts`
5. ✅ Tests unitarios backend
6. ✅ Feature flag configurado

### Fase 3-4: Frontend + UX (3 días)
1. ✅ `components/tarot/TarotAiConsentBanner.tsx`
2. ✅ `components/tarot/TarotInterpretationModal.tsx`
3. ✅ Integración en `AstrologyTarotVisualCore.tsx`
4. ✅ Almacenamiento de consentimiento (localStorage + DB)
5. ✅ Tests frontend

### Fase 5-6: QA + Deploy (3-4 días)
1. ✅ Tests E2E
2. ✅ Revisión de seguridad (no leak de datos)
3. ✅ Documentación de uso para terapeutas
4. ✅ Runbook de activación
5. ✅ Monitorización configurada
6. ✅ Deploy a staging → producción

## Test Steps

**Manual testing checklist**:
```
1. [ ] Usuario sin consentimiento NO puede interpretar
2. [ ] Banner de consentimiento se muestra correctamente
3. [ ] Aceptar consentimiento persiste en localStorage
4. [ ] Interpretación de carta individual funciona
5. [ ] Interpretación de spread completo funciona
6. [ ] Modal muestra trazabilidad correctamente
7. [ ] Guardar interpretación (anonimizado) funciona
8. [ ] Guardar interpretación (con datos) funciona
9. [ ] Rate limiting funciona (11va request falla)
10. [ ] Feature flag OFF bloquea acceso
```

## Identified Risks

### 🔴 ALTO: Lenguaje clínico en respuestas holísticas
**Mitigación**: 
- Prompt engineering estricto: **vocabulario holístico**, no diagnóstico
- Filtros post-generación: rechazar respuestas con términos clínicos
- Revisión de 50+ interpretaciones antes de producción
- Disclaimer holístico visible en cada interpretación
- Botón de "Reportar lenguaje inadecuado"
- Lista negra de términos: "diagnóstico", "terapia", "tratamiento", "paciente" (legacy), "síntoma"

### 🟡 MEDIO: Sobrecarga o falla de providers
**Mitigación**:
- **Multi-provider con fallback automático** (YA IMPLEMENTADO):
  1. Groq (30 req/min) - prioritario
  2. Ollama (ilimitado) - si Groq falla
  3. Gemini (15 req/min) - fallback final
- Caché de interpretaciones repetidas (mismo card + context)
- Timeout de 30s por provider
- Retry con backoff exponencial
- Health check de providers cada 5min

### 🟡 MEDIO: Falta de trazabilidad
**Mitigación**:
- Guardar `explanationTrace` en cada interpretación
- Audit log de todas las requests IA
- Usuario puede ver trace completo

### 🟢 BAJO: Feature flag accidentalmente activado
**Mitigación**:
- Default `AI_TAROT_ENABLED=false`
- Requiere cambio explícito en .env
- Validación en CI/CD

## Verification Command

```bash
# Backend
cd backend
python manage.py test api.tests.test_tarot_holistic --verbosity=2

# Feature flag check
python manage.py shell -c "from django.conf import settings; print(f'AI_TAROT_ENABLED: {settings.AI_TAROT_ENABLED}')"

# Provider status check
python manage.py shell -c "from api.astrology_ai_service import HolisticAI; ai = HolisticAI(); print(f'Provider: {ai.provider}, Model: {ai.model_name}')"

# Frontend
cd tonyblanco-app
npm test -- tarot-ai.test.ts

# E2E
npm run test:e2e -- tarot-ai-flow.spec.ts
```

## Timeline Estimate

| Fase | Duración | Dependencias |
|------|----------|--------------|
| 0. Preparación | ✅ DONE | - |
| 1. Backend API | 2-3 días | Feature flag |
| 2. Frontend Client | 1-2 días | Backend API |
| 3. UI Consentimiento | 2 días | Frontend Client |
| 4. Integración | 1 día | UI Consentimiento |
| 5. Testing | 2-3 días | Integración |
| 6. Deploy | 1 día | Testing ✅ |
| **TOTAL** | **9-12 días** | - |

## Next Steps

### Inmediato (Fase 1)
1. Crear branch `feature/tarot-ai-activation`
2. Agregar feature flag `AI_TAROT_ENABLED=false`
3. Crear `backend/api/tarot_ai_views.py`
4. Implementar `POST /api/ai/tarot/interpretCard`
5. Tests unitarios del endpoint
6. Commit y push

### Siguiente (Fase 2-3)
1. Crear `lib/api/tarot-ai-client.ts`
2. Crear hook `useTarotAi`
3. Componente `TarotAiConsentBanner`
4. Integrar banner en workspace
5. Tests frontend

---

**Aprobación requerida antes de CODE >**
- [ ] Stakeholder aprueba alcance
- [ ] Feature flag configurado
- [ ] Keys de Gemini disponibles en staging
- [ ] Revisión de seguridad OK

**Contacto**: GitHub Copilot - Sesión 2026-01-28
**Próximo agente**: CODE > para implementación de Fase 1
