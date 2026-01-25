# 🎨 InquiryWidget — Diseño UX y Especificación de Componente

**Fecha:** 2026-01-25  
**Autor:** DOCS > Agent (Claude Sonnet 4.5)  
**Estado:** Especificación para Implementación  
**Versión:** 1.0  
**Documento Padre:** [PATIENT_INTERACTION_STRATEGY.md](./PATIENT_INTERACTION_STRATEGY.md)

---

## 1. Resumen del Componente

El **InquiryWidget** es un componente React colapsable que muestra las "brechas de conocimiento" (knowledge gaps) detectadas para un paciente específico al abrir cualquier módulo SWM. Permite al terapeuta:

1. **Ver gaps priorizados** (críticos → importantes → opcionales)
2. **Preguntar ahora** — Registrar respuesta verbal durante sesión
3. **Enviar cuestionario** — Generar email con preguntas seleccionadas
4. **Ignorar temporalmente** — Ocultar gap para esta sesión

---

## 2. Mockup Visual

### 2.1 Estado Colapsado (Badge Visible)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🌟 CARTA NATAL DE JUAN PÉREZ                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │              [Contenido principal del módulo Astrología]             │   │
│  │                                                                      │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  💬 Información Faltante                             🔴 2  🟡 3  [ ▼ ] │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Estado Expandido (Lista de Gaps)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🌟 CARTA NATAL DE JUAN PÉREZ                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │              [Contenido principal del módulo Astrología]             │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  💬 Información Faltante                             🔴 2  🟡 3  [ ▲ ] │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  🔴 CRÍTICO                                                          │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Eventos vitales recientes (últimos 30 días)                   │  │  │
│  │  │  ─────────────────────────────────────────────────────────────  │  │  │
│  │  │  Para interpretar los tránsitos actuales necesitamos conocer   │  │  │
│  │  │  qué está sucediendo en la vida del paciente.                  │  │  │
│  │  │                                                                 │  │  │
│  │  │  [ 🎤 Preguntar Ahora ]  [ 📧 Enviar ]  [ ⏭️ Ignorar ]         │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  🔴 CRÍTICO                                                          │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Confianza en hora de nacimiento                               │  │  │
│  │  │  ─────────────────────────────────────────────────────────────  │  │  │
│  │  │  ¿Qué tan seguro está el paciente de su hora exacta?           │  │  │
│  │  │                                                                 │  │  │
│  │  │  [ 🎤 Preguntar Ahora ]  [ 📧 Enviar ]  [ ⏭️ Ignorar ]         │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  🟡 IMPORTANTE                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Resonancia de tránsitos                                       │  │  │
│  │  │  ─────────────────────────────────────────────────────────────  │  │  │
│  │  │  ¿Cuáles temas planetarios siente más activos actualmente?     │  │  │
│  │  │                                                                 │  │  │
│  │  │  [ 🎤 Preguntar Ahora ]  [ 📧 Enviar ]  [ ⏭️ Ignorar ]         │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  📧 Enviar cuestionario con 2 preguntas seleccionadas  [ Preparar ] │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Estado "Preguntar Ahora" (Modal Inline)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔴 Eventos vitales recientes (últimos 30 días)                      │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                       │
│  📝 Pregunta sugerida:                                               │
│  "¿Qué eventos significativos han ocurrido en tu vida en los         │
│   últimos 30 días? Cambios de trabajo, mudanzas, relaciones..."      │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  Respuesta del paciente (transcripción):                        │ │
│  │  _____________________________________________________________  │ │
│  │  |                                                             | │ │
│  │  | Hace 2 semanas mi padre fue hospitalizado, muy estresante.  | │ │
│  │  | También estoy considerando cambiar de trabajo porque no me  | │ │
│  │  | siento valorado. Mi relación con Ana está un poco tensa...  | │ │
│  │  |_____________________________________________________________| │ │
│  │                                                                  │ │
│  │  Caracteres: 234/1000                                           │ │
│  │                                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│         [ Cancelar ]              [ ✓ Guardar Respuesta ]            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.4 Estado "Todos los Gaps Resueltos"

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✅ Información Completa                                      [ ▼ ] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Todas las preguntas relevantes para Astrología han sido             │
│  respondidas. El módulo opera con contexto completo.                 │
│                                                                       │
│  Última actualización: hace 3 días                                   │
│                                                                       │
│  [ Ver historial de respuestas ]                                     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.5 Estado Empty (Sin Gaps Definidos)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ℹ️ Sin requerimientos adicionales                            [ ▼ ] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Este módulo no tiene preguntas contextuales configuradas.           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.6 Estado Loading

```
┌──────────────────────────────────────────────────────────────────────┐
│  💬 Información Faltante                                      [ ▼ ] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│              ◌ ◌ ◌  Cargando información faltante...                 │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Variante: Posición Sidebar

```
┌───────────────────────────────────────────────────┬────────────────────────┐
│                                                    │ 💬 INFO FALTANTE       │
│    🌟 CARTA NATAL DE JUAN PÉREZ                   │ ────────────────────── │
│                                                    │                        │
│    ┌──────────────────────────────────────────┐   │ 🔴 Eventos vitales     │
│    │                                           │   │    [ Preguntar ]       │
│    │                                           │   │    [ Enviar ] [✕]      │
│    │       [Contenido del módulo]              │   │                        │
│    │                                           │   │ ────────────────────── │
│    │                                           │   │                        │
│    │                                           │   │ 🔴 Hora de nacimiento  │
│    │                                           │   │    [ Preguntar ]       │
│    │                                           │   │    [ Enviar ] [✕]      │
│    │                                           │   │                        │
│    │                                           │   │ ────────────────────── │
│    │                                           │   │                        │
│    │                                           │   │ 🟡 Tránsitos           │
│    │                                           │   │    [ Preguntar ]       │
│    │                                           │   │    [ Enviar ] [✕]      │
│    │                                           │   │                        │
│    └──────────────────────────────────────────┘   │ ────────────────────── │
│                                                    │ 📧 Enviar todo (3)     │
│                                                    │ [ Preparar Email ]     │
│                                                    │                        │
└───────────────────────────────────────────────────┴────────────────────────┘
```

---

## 4. Especificación Técnica de Props

```typescript
// src/components/inquiry/InquiryWidget.types.ts

/**
 * Módulos SWM soportados por el Active Inquiry Engine
 */
type ModuleCode = 
  | 'astrology' 
  | 'cabala' 
  | 'transgenerational' 
  | 'bioemotional'
  | 'mshe';

/**
 * Posición del widget en la interfaz
 */
type WidgetPosition = 'footer' | 'sidebar' | 'header' | 'modal';

/**
 * Prioridad del gap de conocimiento
 */
type GapPriority = 'critical' | 'important' | 'optional';

/**
 * Información de un gap de conocimiento
 */
interface KnowledgeGap {
  /** Código único del inquiry (ej: "astro_current_life_events") */
  code: string;
  /** Título corto para el widget */
  title: string;
  /** Descripción/ayuda para el terapeuta */
  description: string;
  /** Pregunta completa sugerida */
  questionText: string;
  /** Prioridad visual */
  priority: GapPriority;
  /** Tipo de respuesta esperada */
  questionType: 'scale_1_10' | 'text_long' | 'text_short' | 'choice_single' | 'choice_multi' | 'yes_no';
  /** Opciones si es choice_single o choice_multi */
  choices?: Array<{ value: string; label: string }>;
  /** Placeholder para campos de texto */
  placeholder?: string;
  /** Validación */
  validation?: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
}

/**
 * Respuesta registrada para un gap
 */
interface GapResponse {
  gapCode: string;
  value: string | number | string[];
  collectedAt: string; // ISO date
  collectedBy: 'therapist_session' | 'patient_self' | 'pre_session';
}

/**
 * Props principales del InquiryWidget
 */
interface InquiryWidgetProps {
  /** ID del paciente actual */
  patientId: number;
  
  /** Código del módulo SWM que está abierto */
  moduleCode: ModuleCode;
  
  /** Posición del widget en la interfaz */
  position?: WidgetPosition;
  
  /** Si inicia expandido (default: false para footer, true para sidebar) */
  defaultExpanded?: boolean;
  
  /** Máximo de gaps a mostrar antes de "Ver más" (default: 5) */
  maxVisibleGaps?: number;
  
  /** Ocultar gaps opcionales (default: false) */
  hideOptional?: boolean;
  
  /** Callback cuando se resuelve un gap en sesión */
  onGapResolved?: (gapCode: string, response: GapResponse) => void;
  
  /** Callback cuando se envía cuestionario */
  onQuestionnaireSent?: (gapCodes: string[], batchId: string) => void;
  
  /** Callback cuando se ignora un gap */
  onGapIgnored?: (gapCode: string) => void;
  
  /** Callback cuando cambia el estado de expansión */
  onExpandChange?: (isExpanded: boolean) => void;
  
  /** Override de estilos para el contenedor */
  className?: string;
  
  /** Texto personalizado para el título colapsado */
  collapsedTitle?: string;
}
```

---

## 5. Estados del Componente

```typescript
// src/components/inquiry/InquiryWidget.state.ts

/**
 * Estados posibles del widget
 */
type WidgetState = 
  | 'loading'        // Cargando gaps desde API
  | 'error'          // Error al cargar
  | 'empty'          // No hay gaps definidos para este módulo
  | 'has_gaps'       // Hay gaps pendientes
  | 'all_resolved'   // Todos los gaps han sido respondidos
  | 'asking'         // Modal de "Preguntar Ahora" abierto
  | 'sending'        // Preparando envío de cuestionario
  | 'success';       // Acción completada exitosamente

/**
 * Estado interno completo del widget
 */
interface InquiryWidgetState {
  /** Estado actual del widget */
  status: WidgetState;
  
  /** Si el widget está expandido */
  isExpanded: boolean;
  
  /** Lista de gaps detectados */
  gaps: KnowledgeGap[];
  
  /** Gaps ignorados para esta sesión (codes) */
  ignoredGaps: Set<string>;
  
  /** Gaps seleccionados para cuestionario (codes) */
  selectedForQuestionnaire: Set<string>;
  
  /** Gap actualmente siendo respondido (si asking) */
  activeGap: KnowledgeGap | null;
  
  /** Respuesta en progreso */
  draftResponse: string;
  
  /** Mensaje de error si hay */
  errorMessage: string | null;
  
  /** Timestamp de última actualización */
  lastFetch: Date | null;
}

/**
 * Contadores para el badge
 */
interface GapCounts {
  critical: number;
  important: number;
  optional: number;
  total: number;
}
```

---

## 6. Diagrama de Estados

```
                    ┌──────────────┐
                    │   LOADING    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌──────────┐  ┌─────────────┐
        │  ERROR  │  │  EMPTY   │  │  HAS_GAPS   │
        └─────────┘  └──────────┘  └──────┬──────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     ▼                    ▼                    ▼
              ┌──────────┐         ┌──────────┐         ┌──────────┐
              │  ASKING  │         │ SENDING  │         │ IGNORING │
              └────┬─────┘         └────┬─────┘         └────┬─────┘
                   │                    │                    │
                   │  Save              │  Send              │
                   ▼                    ▼                    ▼
              ┌──────────┐         ┌──────────┐         ┌──────────┐
              │ SUCCESS  │         │ SUCCESS  │         │ HAS_GAPS │
              └────┬─────┘         └────┬─────┘         └──────────┘
                   │                    │
                   └────────────────────┘
                              │
                              ▼
                     ┌───────────────┐
                     │ Check if more │
                     │   gaps left   │
                     └───────┬───────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
       ┌──────────┐                 ┌───────────────┐
       │ HAS_GAPS │                 │ ALL_RESOLVED  │
       └──────────┘                 └───────────────┘
```

---

## 7. Interacciones de Usuario

### 7.1 Flujo "Preguntar Ahora"

```
1. Terapeuta hace clic en [ 🎤 Preguntar Ahora ]
2. Widget entra en estado ASKING
3. Se muestra modal inline con:
   - Pregunta sugerida (texto completo)
   - Campo de texto para transcribir respuesta
   - Botones: Cancelar / Guardar
4. Terapeuta transcribe respuesta verbal del paciente
5. Terapeuta hace clic en [ ✓ Guardar Respuesta ]
6. POST /api/inquiry/responses/
7. Gap se marca como resuelto (desaparece de lista)
8. Callback onGapResolved se ejecuta
9. Si no quedan gaps → estado ALL_RESOLVED
```

### 7.2 Flujo "Enviar Cuestionario"

```
1. Terapeuta selecciona gaps (checkbox o click en [ 📧 Enviar ])
2. Los gaps seleccionados se acumulan en selectedForQuestionnaire
3. Terapeuta hace clic en [ Preparar Email ] (footer del widget)
4. Widget entra en estado SENDING
5. Se muestra preview del cuestionario:
   - Lista de preguntas seleccionadas
   - Email destino del paciente
   - Fecha de expiración (default: 7 días)
6. Terapeuta confirma envío
7. POST /api/inquiry/batches/
8. Sistema envía email al paciente
9. Callback onQuestionnaireSent se ejecuta
10. Gaps enviados se marcan con badge "📧 Pendiente"
```

### 7.3 Flujo "Ignorar Gap"

```
1. Terapeuta hace clic en [ ⏭️ Ignorar ]
2. Gap se añade a ignoredGaps (solo para esta sesión)
3. Gap desaparece visualmente de la lista
4. Callback onGapIgnored se ejecuta
5. Al cerrar módulo o cambiar de paciente, ignoredGaps se resetea
```

---

## 8. API Endpoints Consumidos

```typescript
// Obtener gaps para paciente/módulo
GET /api/inquiry/gaps/
Query params:
  - patient_id: number
  - module: ModuleCode
Response: {
  gaps: KnowledgeGap[],
  resolved_count: number,
  total_count: number
}

// Guardar respuesta en sesión
POST /api/inquiry/responses/
Body: {
  patient_id: number,
  inquiry_code: string,
  response_value: any,
  collected_by: 'therapist_session',
  session_id?: number,
  notes?: string
}

// Crear batch/cuestionario
POST /api/inquiry/batches/
Body: {
  patient_id: number,
  inquiry_codes: string[],
  expires_in_days?: number,
  send_email?: boolean
}
Response: {
  batch_id: string,
  access_token: string,
  public_url: string
}

// Historial de respuestas
GET /api/inquiry/responses/{patient_id}/
Query params:
  - module?: ModuleCode
  - from_date?: string
```

---

## 9. Tokens de Diseño

```scss
// Variables de diseño para consistencia con UI existente

// Colores de prioridad
$priority-critical: #dc2626;    // red-600
$priority-important: #f59e0b;   // amber-500  
$priority-optional: #22c55e;    // green-500
$priority-resolved: #6b7280;    // gray-500

// Backgrounds
$widget-bg: #ffffff;
$widget-bg-dark: #1f2937;
$gap-card-bg: #f9fafb;          // gray-50
$gap-card-bg-dark: #374151;     // gray-700

// Bordes
$widget-border: #e5e7eb;        // gray-200
$widget-border-dark: #4b5563;   // gray-600

// Espaciado
$widget-padding: 16px;
$gap-card-padding: 12px;
$gap-card-gap: 12px;

// Tipografía
$title-size: 14px;
$title-weight: 600;
$description-size: 13px;
$badge-size: 12px;

// Animaciones
$expand-duration: 200ms;
$expand-easing: ease-out;

// Breakpoints (responsive)
$tablet-min: 768px;
$mobile-max: 767px;
```

---

## 10. Responsive Behavior

### Desktop (> 1024px)
- Posición: Footer o Sidebar (configurable)
- Sidebar width: 280px
- Gaps visibles sin scroll: 5

### Tablet (768px - 1024px)
- Posición: Footer siempre (sidebar colapsa)
- Height máximo: 40vh
- Scroll interno si > 3 gaps

### Mobile (< 768px)
- Posición: Modal fullscreen al expandir
- Badge siempre visible en footer
- Botones de acción en stack vertical

---

## 11. Accesibilidad (a11y)

```typescript
// Atributos ARIA requeridos

// Contenedor principal
<div 
  role="region"
  aria-label="Información faltante del paciente"
  aria-expanded={isExpanded}
>

// Botón expandir/colapsar
<button
  aria-controls="inquiry-gap-list"
  aria-expanded={isExpanded}
  aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} información faltante. ${gapCounts.critical} críticos, ${gapCounts.important} importantes`}
>

// Lista de gaps
<ul 
  id="inquiry-gap-list"
  role="list"
  aria-label="Lista de preguntas pendientes"
>

// Card de gap individual
<li 
  role="listitem"
  aria-labelledby={`gap-title-${gap.code}`}
>

// Badge de prioridad
<span 
  role="status"
  aria-label={`Prioridad: ${gap.priority}`}
>
```

---

## 12. Casos de Uso Especiales

### 12.1 Gap con Follow-up Condicional

Algunos gaps tienen lógica condicional (ej: "Si satisfacción < 4, preguntar obstáculos").

```typescript
// El backend retorna gaps con follow_up_triggered
interface KnowledgeGap {
  // ... campos base
  follow_up_triggered_by?: string;  // code del gap padre
  follow_up_condition?: string;     // "score <= 4"
}

// UI muestra estos gaps indentados bajo el padre
```

### 12.2 Gaps Dinámicos (por entidad)

Algunos gaps aplican por entidad (ej: carga emocional por cada ancestro).

```typescript
interface DynamicGap extends KnowledgeGap {
  dynamic: true;
  entity_type: 'GenealogyPerson' | 'BioTransgenerationalHypothesis';
  entity_id: number;
  entity_label: string;  // "Abuelo paterno - Juan"
}
```

### 12.3 Gap Expirado (respuesta antigua)

Si una respuesta previa ya expiró, el gap reaparece con indicador.

```typescript
interface ExpiredGap extends KnowledgeGap {
  previous_response?: {
    value: any;
    collected_at: string;
    expired_reason: 'time_expired' | 'manual_invalidation';
  };
}

// UI muestra: "Última respuesta hace 45 días (expirada)"
```

---

## 13. Estructura de Archivos Propuesta

```
src/
├── components/
│   └── inquiry/
│       ├── InquiryWidget.tsx           # Componente principal
│       ├── InquiryWidget.types.ts      # Tipos e interfaces
│       ├── InquiryWidget.styles.ts     # Styled-components o CSS modules
│       ├── InquiryWidget.test.tsx      # Tests unitarios
│       ├── hooks/
│       │   ├── useInquiryGaps.ts       # Hook para fetch de gaps
│       │   ├── useInquiryResponse.ts   # Hook para guardar respuestas
│       │   └── useInquiryBatch.ts      # Hook para cuestionarios
│       ├── components/
│       │   ├── GapCard.tsx             # Card individual de gap
│       │   ├── GapBadge.tsx            # Badge de prioridad
│       │   ├── AskNowModal.tsx         # Modal de "Preguntar Ahora"
│       │   ├── SendQuestionnaireModal.tsx
│       │   └── ResponseInput.tsx       # Input según question_type
│       └── utils/
│           ├── prioritySort.ts         # Ordenar gaps por prioridad
│           └── gapFilters.ts           # Filtrar gaps ignorados
└── api/
    └── inquiry.ts                      # Cliente API
```

---

## 14. Integración con Módulos Existentes

El widget se integra en cada módulo SWM de la siguiente manera:

```tsx
// Ejemplo: src/pages/astrology/NatalChart.tsx

import { InquiryWidget } from '@/components/inquiry/InquiryWidget';

export function NatalChartPage({ patientId }: { patientId: number }) {
  const handleGapResolved = (code: string, response: GapResponse) => {
    // Opcional: refetch data del módulo con nuevo contexto
    refetchNatalChartData();
  };

  return (
    <div className="natal-chart-layout">
      <main className="natal-chart-content">
        {/* Contenido existente del módulo */}
        <NatalChartVisualization patientId={patientId} />
      </main>
      
      {/* Widget de información faltante */}
      <InquiryWidget
        patientId={patientId}
        moduleCode="astrology"
        position="footer"
        onGapResolved={handleGapResolved}
      />
    </div>
  );
}
```

---

## 15. Métricas de Éxito

| Métrica | Target | Medición |
|---------|--------|----------|
| Tiempo para resolver gap | < 60 segundos | Analytics de tiempo entre open widget → save response |
| Tasa de respuesta en sesión | > 70% | gaps resueltos / gaps mostrados |
| Tasa de cuestionarios completados | > 50% | batches completed / batches sent |
| Gaps críticos promedio por sesión | < 2 | Promedio al abrir módulo |
| Satisfacción terapeuta | > 4/5 | Survey post-implementación |

---

## 16. Dependencias de Implementación

### Backend (ya implementado)
- [x] Modelo `InquiryDefinition` 
- [x] Modelo `PatientInquiryResponse`
- [x] Endpoint `GET /api/inquiry/gaps/`
- [x] Endpoint `POST /api/inquiry/responses/`
- [x] 30 inquiries cargadas en BD

### Frontend (pendiente)
- [ ] Componente `InquiryWidget`
- [ ] Hook `useInquiryGaps`
- [ ] Hook `useInquiryResponse`
- [ ] Integración en módulo Astrología (piloto)
- [ ] Tests de componente

### Infraestructura (pendiente)
- [ ] Sistema de envío de emails para cuestionarios
- [ ] Página pública para completar cuestionario
- [ ] Notificaciones de cuestionario completado

---

## Aprobación

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| AGENTE_ARQ | — | — | Pendiente |
| UX Lead | — | — | Pendiente |
| Frontend Lead | — | — | Pendiente |

---

*Documento generado por DOCS > Agent — Listo para revisión de gobernanza.*
