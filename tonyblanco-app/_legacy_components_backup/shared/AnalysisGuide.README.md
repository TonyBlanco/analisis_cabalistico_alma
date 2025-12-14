# AnalysisGuide - Componente de Guía Educativa

Componente reutilizable para mostrar guías educativas en toda la plataforma. Diseñado para ser usado en Gematria, Mapa del Alma, Tarot, y otras herramientas.

## Características

- ✅ Panel lateral deslizable (Sheet/Slide-over)
- ✅ Diseño limpio y profesional
- ✅ Soporte para contenido estructurado (secciones) o simple (HTML/ReactNode)
- ✅ Colores de acento personalizables
- ✅ Ancho configurable
- ✅ Ejemplos prácticos integrados
- ✅ Accesible (ARIA labels, tecla Escape)

## Props

```typescript
interface AnalysisGuideProps {
  isOpen: boolean;              // Controla si el panel está abierto
  onClose: () => void;          // Función para cerrar
  title: string;                // Título principal
  subtitle?: string;            // Subtítulo opcional
  content: ReactNode | string | GuideSection[];  // Contenido
  accentColor?: 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}
```

## Uso Básico

### Opción 1: Contenido Simple (String HTML)

```tsx
import AnalysisGuide from '@/components/shared/AnalysisGuide';

const [showGuide, setShowGuide] = useState(false);

<AnalysisGuide
  isOpen={showGuide}
  onClose={() => setShowGuide(false)}
  title="Guía de Tarot"
  subtitle="Interpretación de Cartas"
  content="<p>Contenido HTML aquí...</p>"
  accentColor="purple"
/>
```

### Opción 2: Contenido React

```tsx
<AnalysisGuide
  isOpen={showGuide}
  onClose={() => setShowGuide(false)}
  title="Guía de Tarot"
  content={
    <div>
      <h3>Introducción</h3>
      <p>Texto explicativo...</p>
    </div>
  }
/>
```

### Opción 3: Secciones Estructuradas (Recomendado)

```tsx
import AnalysisGuide, { GuideSection } from '@/components/shared/AnalysisGuide';
import { Info, Sparkles } from 'lucide-react';

const guideSections: GuideSection[] = [
  {
    id: 'intro',
    title: 'Introducción',
    subtitle: 'Conceptos básicos',
    icon: <Info className="h-6 w-6 text-blue-600" />,
    color: 'blue',
    content: (
      <p>Explicación detallada...</p>
    ),
    examples: [
      { label: 'Ejemplo 1', value: 'Valor del ejemplo' },
      { label: 'Ejemplo 2', value: 'Otro valor' }
    ]
  },
  {
    id: 'avanzado',
    title: 'Nivel Avanzado',
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    color: 'purple',
    content: 'Contenido avanzado...'
  }
];

<AnalysisGuide
  isOpen={showGuide}
  onClose={() => setShowGuide(false)}
  title="Guía Completa"
  subtitle="Manual de Referencia"
  content={guideSections}
  accentColor="amber"
  maxWidth="2xl"
/>
```

## Ejemplo Real: Gematria

Ver `tonyblanco-app/data/gematria-guide-sections.ts` para un ejemplo completo con todas las secciones estructuradas.

## Colores Disponibles

- `amber`: Dorado/Naranja (por defecto)
- `blue`: Azul
- `purple`: Púrpura
- `emerald`: Verde esmeralda
- `rose`: Rosa

## Colores de Sección

Cada sección puede tener su propio color:
- `blue`
- `purple`
- `amber`
- `indigo`
- `emerald`
- `rose`

## Anchos Disponibles

- `sm`: max-w-sm
- `md`: max-w-md
- `lg`: max-w-lg
- `xl`: max-w-xl
- `2xl`: max-w-2xl (por defecto)
- `3xl`: max-w-3xl
- `4xl`: max-w-4xl

## Interfaz GuideSection

```typescript
interface GuideSection {
  id: string;                    // Identificador único
  title: string;                 // Título de la sección
  subtitle?: string;             // Subtítulo opcional
  icon?: React.ReactNode;        // Icono personalizado
  color?: 'blue' | 'purple' | 'amber' | 'indigo' | 'emerald' | 'rose';
  content: React.ReactNode | string;  // Contenido de la sección
  examples?: Array<{             // Ejemplos prácticos opcionales
    label: string;
    value: string | React.ReactNode;
  }>;
}
```

## Mejores Prácticas

1. **Usa secciones estructuradas** para contenido complejo (más fácil de mantener)
2. **Agrupa contenido relacionado** en la misma sección
3. **Incluye ejemplos prácticos** cuando sea relevante
4. **Elige colores consistentes** con el tema de tu herramienta
5. **Mantén el contenido conciso** pero completo

## Accesibilidad

- ✅ Soporte para tecla Escape
- ✅ ARIA labels apropiados
- ✅ Modal semántico (role="dialog")
- ✅ Focus management

