// components/inquiry/README.md

# InquiryWidget - Componente de Información Faltante

## Descripción

El `InquiryWidget` es un componente React que muestra las "brechas de conocimiento" detectadas para un paciente cuando el terapeuta abre un módulo SWM (Astrología, Cábala, Transgeneracional, BioEmocional).

## Uso Básico

```tsx
import { InquiryWidget } from '@/components/inquiry';

function AstrologyPage({ patientId }: { patientId: number }) {
  const handleGapResolved = (code: string, response: GapResponse) => {
    console.log('Gap resuelto:', code, response);
    // Opcional: refetch data del módulo
  };

  return (
    <div>
      {/* Contenido del módulo */}
      <NatalChartVisualization patientId={patientId} />
      
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

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `patientId` | `number` | **requerido** | ID del paciente |
| `moduleCode` | `ModuleCode` | **requerido** | Código del módulo SWM |
| `position` | `'footer' \| 'sidebar' \| 'header' \| 'modal'` | `'footer'` | Posición del widget |
| `defaultExpanded` | `boolean` | `false` | Si inicia expandido |
| `maxVisibleGaps` | `number` | `5` | Máximo de gaps visibles |
| `hideOptional` | `boolean` | `false` | Ocultar gaps opcionales |
| `onGapResolved` | `(code, response) => void` | - | Callback al resolver gap |
| `onQuestionnaireSent` | `(codes, batchId) => void` | - | Callback al enviar cuestionario |
| `onGapIgnored` | `(code) => void` | - | Callback al ignorar gap |

## Estados Visuales

- **Loading**: Spinner mientras carga gaps
- **Empty**: No hay gaps configurados para este módulo
- **Has Gaps**: Muestra lista de gaps pendientes
- **All Resolved**: Todos los gaps han sido respondidos
- **Error**: Error al cargar, con botón de retry

## Flujos de Interacción

### 1. Preguntar Ahora
1. Terapeuta hace clic en "🎤 Preguntar Ahora"
2. Se abre modal con pregunta sugerida
3. Terapeuta transcribe respuesta verbal
4. Clic en "Guardar Respuesta"
5. Gap se marca como resuelto

### 2. Enviar Cuestionario
1. Terapeuta selecciona gaps con "📧 Enviar"
2. Aparece botón de "Enviar cuestionario con X preguntas"
3. Sistema envía email al paciente
4. Gaps quedan marcados como "Pendientes"

### 3. Ignorar Temporalmente
1. Terapeuta hace clic en "⏭️ Ignorar"
2. Gap desaparece de la lista
3. Al cerrar módulo, se resetea

## Estructura de Archivos

```
components/inquiry/
├── InquiryWidget.tsx           # Componente principal
├── InquiryWidget.types.ts      # Tipos e interfaces
├── index.ts                    # Exports públicos
├── hooks/
│   ├── useInquiryGaps.ts       # Hook para fetch de gaps
│   └── useInquiryResponse.ts   # Hook para guardar respuestas
├── components/
│   ├── GapCard.tsx             # Card de gap individual
│   ├── GapBadge.tsx            # Badge de prioridad
│   └── AskNowModal.tsx         # Modal de pregunta
└── README.md                   # Este archivo
```

## Dependencias de Backend

El componente requiere que estos endpoints estén disponibles:

- `GET /api/inquiry/gaps/?patient_id={id}&module={code}`
- `POST /api/inquiry/responses/`
- `POST /api/inquiry/batches/`

Estos endpoints ya están implementados en el backend Django.

## Ejemplo de Respuesta API

```json
{
  "gaps": [
    {
      "code": "astro_current_life_events",
      "title": "Eventos vitales recientes",
      "description": "Para interpretar tránsitos necesitamos contexto",
      "questionText": "¿Qué eventos significativos han ocurrido...",
      "priority": "critical",
      "questionType": "text_long",
      "placeholder": "Ej: 'Comencé un nuevo trabajo...'",
      "validation": {
        "minLength": 20,
        "maxLength": 1000
      }
    }
  ],
  "resolved_count": 3,
  "total_count": 8
}
```

## Testing

Componente incluye:
- Props validation
- Estados del widget
- Interacciones de usuario (ask, send, ignore)
- Error handling

Para agregar tests:

```bash
npm test -- InquiryWidget.test.tsx
```

## Roadmap

- [ ] Implementar modal de confirmación de cuestionario
- [ ] Agregar animaciones de transición
- [ ] Soporte para gaps dinámicos (por entidad)
- [ ] Vista de historial de respuestas
- [ ] Notificaciones cuando se completa cuestionario
- [ ] Modo offline con sync posterior
