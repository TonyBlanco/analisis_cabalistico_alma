# Proyecto: AI Interactivo para Astrología Profesional

**Estado**: ✅ APROBADO  
**Fecha de aprobación**: 2026-01-25  
**Responsable**: AGENTE_ARQ → CODE  

---

## 🎯 Objetivo

Activar interpretaciones AI en el módulo de Astrología para proporcionar análisis interactivos y personalizados al consultante, permitiendo analizar múltiples situaciones astrológicas.

---

## 📊 Infraestructura Existente

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| **Gemini API** | ✅ Configurado | `backend/api/utils/holistic_ai.py` |
| **AI Snippets Astrología** | ✅ Existente | `backend/api/astrology_kerykeion/ai_snippets.py` |
| **Symbolic Interpreter** | ✅ Existente | `backend/api/utils/symbolic_interpreter_ai.py` |
| **Carta Natal calculada** | ✅ Funcional | `analysis_result` con tránsitos, progresiones, retorno solar |

---

## 🤖 Recomendación de Modelo (AI Toolkit Skill)

Basado en el skill `agent-workflow-builder_ai_toolkit`:

### Modelo Recomendado para Producción

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

