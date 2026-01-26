# Proyecto: AI Interactivo para Astrología Profesional

**Estado**: ✅ COMPLETADO (Fase 1) + Mejoras Multi-Proveedor  
**Fecha de aprobación**: 2026-01-25  
**Última actualización**: 2026-01-26 (Soporte Groq/Ollama/Gemini)
**Responsable**: AGENTE_ARQ → CODE  

---

## 🎯 Objetivo

Activar interpretaciones AI en el módulo de Astrología para proporcionar análisis interactivos y personalizados al consultante, permitiendo analizar múltiples situaciones astrológicas.

**✅ COMPLETADO:**
- Panel Psicológico Avanzado con interpretación AI junguiana
- Sistema multi-proveedor (Groq, Ollama, Gemini)
- Persistencia de interpretaciones en BD
- 30 req/min sin límites locales (vs 20 req/día)

---

## 📊 Infraestructura Existente

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| **Multi-Proveedor AI** | ✅ Implementado | `backend/api/astrology_ai_service.py` |
| **Groq API** | ✅ Principal (30 req/min) | `GROQ_API_KEY` en .env |
| **Ollama Local** | ✅ Respaldo (∞) | `localhost:11434` |
| **Gemini API** | ✅ Fallback (20 req/día) | `backend/api/utils/holistic_ai.py` |
| **Psychological AI** | ✅ Funcional | `backend/api/astrology_ai_views.py` |
| **AI Snippets Astrología** | ✅ Existente | `backend/api/astrology_kerykeion/ai_snippets.py` |
| **Symbolic Interpreter** | ✅ Existente | `backend/api/utils/symbolic_interpreter_ai.py` |
| **Carta Natal calculada** | ✅ Funcional | `analysis_result` con tránsitos, progresiones, retorno solar |

---

## 🤖 Proveedores AI Configurados

| Proveedor | Modelo | Límites | Costo | Uso |
|-----------|--------|---------|-------|-----|
| **Groq** | llama-3.3-70b-versatile | 30 req/min | Gratis | Principal |
| **Ollama** | llama3.2 | ∞ Sin límites | Gratis (local) | Respaldo |
| **Gemini** | gemini-2.5-flash | 20 req/día | Gratis | Fallback |

### Recomendación para Producción

Para producción con alto volumen, considerar:

| Modelo | Razón |
|--------|-------|
| **gpt-5.1** | Balance óptimo calidad/costo, 200K contexto, $3.44/1M tokens |
| **gemini-1.5-flash** (actual) | Válido para MVP, menor costo |
| **claude-sonnet-4-5** | Alternativa premium para interpretaciones complejas |

### Para Desarrollo/Pruebas
- GitHub Models gratuitos: `openai/gpt-4o-mini` o `microsoft/phi-4`

---

## 📋 Fases de Implementación

### **FASE 1: Interpretación AI de Capas (MVP)**

**Objetivo**: Botón "Interpretar con AI" para cada capa calculada

| Capa | Análisis AI |
|------|-------------|
| **Natal** | Síntesis de personalidad (Sol/Luna/Ascendente + aspectos mayores) |
| **Tránsitos** | Clima energético actual + desafíos/oportunidades |
| **Progresiones** | Ciclo evolutivo personal + temas de desarrollo |
| **Retorno Solar** | Temas del año solar + focos de atención |

### **FASE 2: Análisis de Situaciones Específicas**

**Objetivo**: El terapeuta puede preguntar sobre situaciones concretas

| Tipo de Consulta | Ejemplo |
|------------------|---------|
| **Compatibilidad** | "Analiza la sinastría con esta pareja" |
| **Momentos óptimos** | "Mejores fechas para iniciar proyecto" |
| **Áreas de vida** | "Analiza el sector laboral/vocacional" |
| **Desafíos** | "¿Qué dice la carta sobre patrones de relación?" |

### **FASE 3: Reportes Integrales AI**

**Objetivo**: Generar reportes profesionales descargables (PDF)

---

## 🔧 Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│  AstrologyProfessionalView.tsx                              │
│    ├── AIInterpretationPanel.tsx (NUEVO)                    │
│    │     ├── LayerInterpretButton (natal/transit/prog/SR)   │
│    │     └── AIResponseDisplay                              │
│    ├── AISituationChat.tsx (FASE 2)                         │
│    └── AIReportGenerator.tsx (FASE 3)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django)                          │
├─────────────────────────────────────────────────────────────┤
│  api/astrology_ai_views.py (NUEVO)                          │
│    ├── AstrologyInterpretView                               │
│    └── AstrologySituationQueryView (FASE 2)                 │
├─────────────────────────────────────────────────────────────┤
│  api/astrology_ai_service.py (NUEVO)                        │
│    ├── AstrologyAIService                                   │
│    │     ├── interpret_natal(chart_data)                    │
│    │     ├── interpret_transits(natal, current)             │
│    │     ├── interpret_progressions(natal, progressed)      │
│    │     └── interpret_solar_return(natal, return)          │
│    └── PromptTemplates                                      │
├─────────────────────────────────────────────────────────────┤
│  api/astrology_ai_prompts.py (NUEVO)                        │
│    └── Catálogo de prompts especializados por capa          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Gemini API (google.genai)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos a Crear

### Backend
| Archivo | Descripción |
|---------|-------------|
| `backend/api/astrology_ai_service.py` | Servicio AI con lógica de interpretación |
| `backend/api/astrology_ai_prompts.py` | Catálogo de prompts por capa |
| `backend/api/astrology_ai_views.py` | Endpoints REST |

### Frontend
| Archivo | Descripción |
|---------|-------------|
| `tonyblanco-app/components/AstrologyWorkspace/AIInterpretationPanel.tsx` | Panel de interpretaciones AI |

### Modificar
| Archivo | Cambio |
|---------|--------|
| `backend/api/urls.py` | Registrar nuevos endpoints |
| `AstrologyProfessionalView.tsx` | Integrar panel AI |

---

## ⏱️ Plan de Ejecución (Sprints)

| Sprint | Descripción | Commit |
|--------|-------------|--------|
| **1** | Backend: `astrology_ai_service.py` + prompts | `feat(astro-ai): add AI service and prompts` |
| **2** | Backend: `astrology_ai_views.py` + endpoints | `feat(astro-ai): add interpretation endpoints` |
| **3** | Frontend: `AIInterpretationPanel.tsx` | `feat(astro-ai): add AI interpretation panel` |
| **4** | Integración en vista principal | `feat(astro-ai): integrate AI panel in workspace` |

---

## 🔒 Restricciones (Gobernanza)

- ❌ NO crear nuevos módulos fuera de Astrología
- ❌ NO modificar db.sqlite3 directamente
- ❌ NO exponer datos personales en prompts
- ✅ Solo lectura simbólica (NO diagnóstico clínico)
- ✅ Disclaimers obligatorios en respuestas AI

---

## 📝 Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-01-25 | Plan creado y aprobado |
| 2026-01-25 | Sprint 1: Backend AI Service + Prompts implementado |
| 2026-01-25 | Sprint 2: REST Endpoints implementados |
| 2026-01-25 | Sprint 3: Frontend AIInterpretationPanel implementado |
| 2026-01-25 | Sprint 4: Integración en AstrologyProfessionalView completada |
| 2026-01-25 | **FASE 2** Sprint 5: AISituationChat componente creado |
| 2026-01-25 | **FASE 2** Sprint 6: Integración de chat en vista principal |

---

## ✅ Estado: FASE 1 COMPLETADA | FASE 2 COMPLETADA

### Commits Fase 1:
- `docs(astro-ai): add approved AI project plan`
- `feat(astro-ai): add AI service and prompts`
- `feat(astro-ai): add REST endpoints`
- `feat(astro-ai): add AIInterpretationPanel`
- `feat(astro-ai): integrate in AstrologyProfessionalView`

### Commits Fase 2:
- `feat(astrology): add AISituationChat component for situational queries`
- `feat(astrology): integrate AISituationChat into professional view`

---

## 🎉 Resumen de Implementación

### Fase 1 - Interpretación de Capas (MVP)
| Capa | Endpoint | Componente |
|------|----------|------------|
| Natal | `/api/astrology/interpret/natal/` | AIInterpretationPanel |
| Tránsitos | `/api/astrology/interpret/transits/` | AIInterpretationPanel |
| Progresiones | `/api/astrology/interpret/progressions/` | AIInterpretationPanel |
| Retorno Solar | `/api/astrology/interpret/solar-return/` | AIInterpretationPanel |

### Fase 2 - Consultas Situacionales (Chat)
| Funcionalidad | Endpoint | Componente |
|---------------|----------|------------|
| Chat interactivo | `/api/astrology/interpret/situation/` | AISituationChat |

#### Características del Chat:
- 💬 Interfaz de chat expandible/colapsable
- 🎯 6 preguntas sugeridas (relaciones, carrera, salud, finanzas, crecimiento, desafíos)
- 📜 Historial de conversación con scroll automático
- 📋 Copiar respuestas al portapapeles
- 🗑️ Limpiar conversación
- ⌨️ Enter para enviar, Shift+Enter para nueva línea
- ⚠️ Validación de preguntas (mínimo 10 caracteres)
- 🔄 Estados de carga y manejo de errores

### Fase 3 - Reportes AI (Pendiente)
- PDF generation con `AIReportGenerator.tsx`
- Integración con sistema de reportes existente

