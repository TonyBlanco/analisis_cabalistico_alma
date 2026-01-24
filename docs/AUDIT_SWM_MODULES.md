# AUDIT: MÓDULOS SWM & CORE - Estado de Completitud

**Fecha de Auditoría:** 2026-01-24  
**Tipo:** Investigación de solo lectura (sin modificaciones)  
**Alcance:** Todos los módulos bajo `(swm)/` y `(core)/` en la ruta de therapist

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Total | ✅ Completo | ⚠️ Parcial | ❌ Prototipo | 🚧 Redirect/Stub |
|-----------|-------|-------------|------------|--------------|------------------|
| SWM Modules | 8 | 1 | 2 | 4 | 1 |
| Core Modules | 9 | 3 | 4 | 2 | 0 |
| **TOTAL** | **17** | **4** | **6** | **6** | **1** |

---

## 🗂️ ESTRUCTURA DE RUTAS

```
app/(dashboard)/dashboard/therapist/
├── (swm)/                           # Specialized Workspace Modules
│   ├── astrologia/                  ✅ Completo
│   ├── astrologia-tarot/            ⚠️ Parcial (UI ok, backend tarot ok)
│   ├── bioemotional-experiencial-profunda/ ⚠️ Parcial (UI avanzado, backend parcial)
│   ├── cabala-aplicada/             ❌ Prototipo (UI shell, sin backend SWM)
│   ├── mcmi4-mystic/                🚧 Redirect → /swm/mcmi4
│   ├── resonancia-ancestral/        ❌ Prototipo (UI completo, sin backend)
│   ├── swm/                         ✅ Hub SWM funcional
│   └── transgeneracional-profundo/  ❌ Prototipo (UI mínimo, sin backend)
│
├── (core)/                          # Módulos Core Clínicos
│   ├── astrologia-catalogo/         ⚠️ Parcial (catálogo visual)
│   ├── astrologia-study/            ⚠️ Parcial (modo estudio/training)
│   ├── bioemotional/                ✅ Completo (backend robusto)
│   ├── cabala/                      ⚠️ Parcial (análisis básico)
│   ├── mshe/                        ✅ Completo (motor síntesis)
│   ├── patients/                    ✅ Completo
│   ├── scdf/                        ⚠️ Parcial (workspace profesional)
│   ├── scid5/                       ❌ Prototipo (exploración holística)
│   └── tests/                       ✅ Completo
│
├── swm/                             # Hub principal SWM
├── tarot/                           ✅ Completo
└── components/                      # Componentes compartidos
```

---

## 📋 DETALLE POR MÓDULO

### 🔷 SWM MODULES (Specialized Workspace Modules)

---

#### 1. ASTROLOGÍA (SWM) ✅ COMPLETO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/astrologia` | |
| **Frontend** | ✅ Completo | `AstrologyProfessionalView` |
| **Componente** | ✅ Robusto | 26 archivos en `AstrologyWorkspace/` |
| **Backend** | ✅ Funcional | Kerykeion integration en `backend/api/astrology_kerykeion/` |
| **API** | ✅ Completa | Cálculo de cartas natales, aspectos, casas |

**Archivos Clave:**
- `AstrologyWorkspace/index.tsx`
- `AstrologyProfessionalView.tsx`
- `AstrologyVisualPro.tsx`
- `NatalChartProfessional.tsx`

**Funcionalidades:**
- Carta natal profesional
- Sistemas de casas (Placidus, Koch, Equal, Whole Sign, Regiomontanus)
- Visualización de aspectos
- Panel de correspondencias simbólicas
- Modo observacional (sin interpretación automática)

---

#### 2. ASTROLOGÍA-TAROT (SWM) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/astrologia-tarot` | |
| **Frontend** | ✅ Completo | `AstrologyTarotWorkspace` |
| **Componente** | ✅ Ok | 7 archivos |
| **Backend Tarot** | ✅ Existe | `backend/swm/tarot/` con models, views, urls |
| **Backend Astrología** | ✅ Existe | Compartido con astrología |

**Archivos Clave:**
- `AstrologyTarotWorkspace/index.tsx`
- `AstrologyTarotSidebar.tsx`
- `TarotPluginAdapter.tsx`

**Funcionalidades Implementadas:**
- Visualización de Tarot integrada con Astrología
- Historial de tiradas
- Sistemas cabalísticos como referencia

**Pendiente:**
- IA simbólica (Fase 0 preparación)
- Integración cross-workspace

---

#### 3. BIOEMOTIONAL-EXPERIENCIAL-PROFUNDA (SWM) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/bioemotional-experiencial-profunda` | |
| **Frontend** | ✅ Avanzado | `BioEmotionalExperientialWorkspace/` |
| **Componente** | ✅ Extenso | 27+ archivos incluyendo 3D |
| **Backend** | ⚠️ Parcial | Comparte backend con bioemotional core |
| **Visualización 3D** | ✅ Implementado | Three.js integration |

**Archivos Clave:**
- `BioEmotionalExperientialWorkspace/index.tsx`
- `BodyVisualization2D.tsx`
- `BodyVisualization3D.tsx` (421 líneas)
- `BodyVisualizationToggle.tsx`
- `ExperientialVisualCore.tsx`

**Funcionalidades Implementadas:**
- Visualización corporal 2D/3D toggle
- Panel de observaciones
- Panel de hipótesis
- Timeline de sesiones
- Heatmap de regiones
- Evolución charts

**Pendiente:**
- Backend SWM dedicado (actualmente usa API bioemotional core)
- Persistencia estructurada de sesiones experienciales

---

#### 4. CÁBALA-APLICADA (SWM) ❌ PROTOTIPO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/cabala-aplicada` | |
| **Frontend** | ⚠️ Shell | `CabalAppliedWorkspace` |
| **Componente** | ⚠️ Básico | 8 archivos |
| **Backend SWM** | ❌ No existe | No hay `backend/swm/cabala/` |
| **API** | ⚠️ Limitada | Solo gematria básica en `cabalistic_views.py` |

**Archivos Presentes:**
- `CabalAppliedWorkspace/index.tsx`
- `CabalAppliedSidebar.tsx`
- `CabalAppliedVisualCore.tsx`
- `CabalAppliedToolsPanel.tsx`
- `TreeVisualPlaceholder.tsx`

**Estado Actual:**
- UI shell implementado
- Sidebar con navegación
- Placeholder para visualización del Árbol de la Vida
- Sin persistencia SWM
- Sin sesiones estructuradas

**Próximos Pasos Requeridos:**
1. Definir alcance funcional del workspace
2. Crear backend SWM si requiere persistencia
3. Implementar visualización del Árbol de la Vida
4. Integrar con sistema de correspondencias

---

#### 5. MCMI4-MYSTIC (SWM) 🚧 REDIRECT

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/mcmi4-mystic` | |
| **Frontend** | 🚧 Redirect | Redirige a `/swm/mcmi4` |
| **Backend SWM** | ✅ Completo | `backend/swm/mcmi4/` y `backend/swm/mcmi4_reflection/` |

**Comportamiento Actual:**
```tsx
// page.tsx simplemente redirige
router.replace('/dashboard/therapist/swm/mcmi4');
```

**El módulo real está en:**
- Frontend: `/dashboard/therapist/swm/` → `SwmMcmi4/` component
- Backend: `backend/swm/mcmi4/` con FSM completo
- API: Especificación completa en `docs/SWM_MCMI4_API_SPEC.md`

**Estado del Backend SWM MCMI4:**
- ✅ Models completos (WorkspaceInstance, Session, Artifacts)
- ✅ FSM (Finite State Machine) implementada
- ✅ Endpoints: create, start, progress, seal, results
- ✅ Permisos y auditoría
- ✅ Reflection module funcional

---

#### 6. RESONANCIA-ANCESTRAL (SWM) ❌ PROTOTIPO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/resonancia-ancestral` | |
| **Frontend** | ⚠️ UI Completo | `ResonanciaAncestralWorkspace` (1590 líneas) |
| **Componente** | ✅ Extenso | UI funcional |
| **Backend SWM** | ❌ No existe | No hay `backend/swm/resonancia/` |
| **API** | ⚠️ Frontend-only | `lib/api/resonancia.ts` (190 líneas) |

**Documentación del README:**
> **Estado:** 🟠 PROTOTIPO  
> - **Frontend:** ⚠️ Estructura completa pero sin backend
> - **Backend SWM:** ❌ No existe
> - **API:** ❌ No existe
> - **Gobernanza:** ❌ No definida

**API Frontend Definida (pero sin backend):**
- `listResonanciaObservations()`
- `createResonanciaObservation()`
- `listResonanciaRelations()`
- `createResonanciaRelation()`

**Tipos Definidos:**
- `ResonanciaObservationType`: 'resonancia' | 'eje' | 'repeticion' | 'nota'
- `ResonanciaObservationSource`: 'observacion_directa' | 'registro_manual'
- `ResonanciaObservationContext`: 'familiar' | 'relacional' | 'sistemico'

**Próximos Pasos Requeridos:**
1. Definir qué es "Resonancia Ancestral" funcionalmente
2. Decidir si requiere SWM completo o es herramienta libre
3. Implementar `backend/swm/resonancia/` si procede
4. Crear endpoints: create, start, progress, seal, results

---

#### 7. SWM HUB ✅ FUNCIONAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/swm` y `/swm` | |
| **Propósito** | Hub central SWM | |
| **Estado** | ✅ Funcional | Orchestración de workspaces |

---

#### 8. TRANSGENERACIONAL-PROFUNDO (SWM) ❌ PROTOTIPO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(swm)/transgeneracional-profundo` | |
| **Frontend** | ⚠️ Mínimo | `TransgenerationalDeepWorkspace` |
| **Componente** | ⚠️ Shell | 5 archivos básicos |
| **Backend SWM** | ❌ No existe | No hay `backend/swm/transgenerational/` |

**Documentación del README:**
> **Estado:** 🟠 PROTOTIPO  
> - **Frontend:** ⚠️ Estructura mínima
> - **Backend SWM:** ❌ No existe
> - **API:** ❌ No existe

**Archivos Presentes:**
- `index.tsx` (63 líneas - shell principal)
- `TransgenerationalSidebar.tsx`
- `TransgenerationalVisualCore.tsx`
- `types.ts`
- `README.md`

**Alcance Probable:**
- Psicogenealogia
- Árboles genealógicos familiares
- Patrones transgeneracionales
- Eventos familiares significativos
- Constelaciones familiares

---

### 🔶 CORE MODULES

---

#### 1. ASTROLOGÍA-CATÁLOGO (Core) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/astrologia-catalogo` | |
| **Frontend** | ⚠️ Básico | Catálogo de cartas |
| **Componente** | `ExtendedChartSelection.tsx` | |

**Propósito:** Selección extendida de cartas astrológicas.

---

#### 2. ASTROLOGÍA-STUDY (Core) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/astrologia-study` | |
| **Frontend** | ⚠️ Parcial | Modo estudio/training |
| **Componente** | `AstrologyStudy/` (11 archivos) | |

**Archivos:**
- `Comparator.tsx`
- `ResearchLab.tsx`
- `SandboxPanel.tsx`
- `TrainingModePanel.tsx`
- `StudyContextProvider.tsx`

**Funcionalidades:**
- Comparación de cartas
- Sandbox de exploración
- Modo formativo

---

#### 3. BIOEMOTIONAL (Core) ✅ COMPLETO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/bioemotional` | |
| **Frontend** | ✅ Extenso | 924 líneas en page.tsx |
| **Backend** | ✅ Robusto | `backend/api/bioemotional/` completo |
| **API** | ✅ Completa | `lib/api/bioemotional.ts` + `bioemotional-clinical.ts` |

**Backend Models:**
- `BioEmotionalDictionaryEntry`
- `GenealogyPerson`
- `GenealogyEvent`
- `BioTransgenerationalHypothesis`
- `BioEmotionalObservation`
- `BioEmotionalHypothesis`
- `BioEmotionalSynthesis`
- `BioEmotionalAssistedDiagnosis`
- `BioEmotionalPatientBrief`
- `BioEmotionalSession`

**Funcionalidades:**
- Diccionario bioemocional
- Árbol genealógico
- Hipótesis transgeneracionales
- Sesiones simbiosis consultante-terapeuta
- Síntesis y diagnóstico asistido

---

#### 4. CÁBALA (Core) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/cabala` | |
| **Frontend** | ⚠️ Listado | Lista módulos cabalísticos |
| **Backend** | ⚠️ Parcial | `cabalistic_views.py` (gematria básica) |

**Propósito:** Lista análisis cabalísticos disponibles para el terapeuta.

---

#### 5. MSHE (Core) ✅ COMPLETO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/mshe` | |
| **Frontend** | ✅ Completo | `MSHEClinicalModule.tsx` |
| **Backend** | ✅ Motor | `holistic_synthesis_engine.py` |
| **API** | ✅ Completa | Endpoints en `analysis_views.py` |

**Funcionalidades:**
- Motor de Síntesis Holística Evaluativa
- Pesos configurables por dimensión
- Integración con BioEmotional
- IA asistida (no clínica)
- Federación cross-workspace

---

#### 6. PATIENTS (Core) ✅ COMPLETO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/patients` | |
| **Estado** | ✅ Funcional | Gestión de pacientes |

---

#### 7. SCDF (Core) ⚠️ PARCIAL

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/scdf` | |
| **Frontend** | ⚠️ Workspace | `scdf-client.tsx` |
| **Backend** | ⚠️ Parcial | `diagnostics.py::compute_scdf()` |

**Nota:** SCDF es herramienta de workspace profesional, no ejecuta vía `/api/tests/execute/`.

---

#### 8. SCID-5 (Core) ❌ PROTOTIPO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/scid5` | |
| **Frontend** | ⚠️ Parcial | `scid5-client.tsx` + `SCID5ClinicalModule.tsx` |
| **Backend** | ⚠️ Parcial | `SCID5AIAssistant` en `analysis_views.py` |

**Estado:**
- Exploración holística (no diagnóstico clínico)
- IA asistida para asistencia
- Correlación con BioEmotional implementada
- Pendiente: Federación completa

---

#### 9. TESTS (Core) ✅ COMPLETO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ruta** | `/dashboard/therapist/(core)/tests` | |
| **Estado** | ✅ Funcional | Catálogo y ejecución de tests |

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Alta Prioridad (Módulos con UI pero sin backend)

1. **Resonancia Ancestral** - UI completo (1590 líneas), necesita definición funcional y backend SWM
2. **Cábala Aplicada** - UI shell listo, necesita backend SWM y visualización Árbol de la Vida

### Media Prioridad (Parcialmente funcionales)

3. **Transgeneracional Profundo** - UI mínimo, requiere definición completa
4. **BioEmotional Experiencial Profunda** - Funcional pero comparte backend con core, considerar SWM dedicado

### Baja Prioridad (Ya funcionales o redirects)

5. **MCMI4-Mystic** - Redirect funciona, SWM backend completo
6. **Astrología-Tarot** - Funcional, pendiente IA simbólica (Fase 0)

---

## 📁 BACKEND SWM EXISTENTE

```
backend/swm/
├── mcmi4/                    ✅ Completo
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   ├── services/
│   └── tests/
├── mcmi4_reflection/         ✅ Completo
│   ├── models.py
│   ├── views.py
│   └── tests/
└── tarot/                    ✅ Completo
    ├── models.py
    ├── views.py
    └── services/
```

**No existen (requeridos para módulos prototipo):**
- `backend/swm/resonancia/` ❌
- `backend/swm/cabala/` ❌
- `backend/swm/transgenerational/` ❌

---

## 🔗 DEPENDENCIAS CRÍTICAS

```
MSHE ← depende de → [BioEmotional, Tests, Astrología, SCID-5]
SCID-5 ← depende de → [BioEmotional, Tests]
BioEmotional Experiencial ← usa → BioEmotional Core API
SWM MCMI4 ← depende de → TestRequest con MCMI-4 ejecutado
```

---

## ✅ CHECKLIST PARA COMPLETAR MÓDULO SWM

Para cada módulo prototipo, se requiere:

- [ ] Definición funcional clara (qué hace, para quién)
- [ ] Decisión arquitectónica (SWM completo vs herramienta libre)
- [ ] Backend `models.py` con WorkspaceInstance, Session, Artifacts
- [ ] Backend `views.py` con endpoints: create, start, progress, seal, results
- [ ] Backend `urls.py` bajo `/api/swm/{module}/`
- [ ] Backend `serializers.py`
- [ ] Tests de integración
- [ ] Frontend API client en `lib/api/`
- [ ] Integración con sistema de permisos
- [ ] Documentación de gobernanza

---

**FIN DEL DOCUMENTO DE AUDITORÍA**

*Generado automáticamente - No contiene modificaciones de código*
