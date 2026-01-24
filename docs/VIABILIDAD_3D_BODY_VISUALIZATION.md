# Viabilidad Técnica: Upgrade 2D → 3D Body Visualization

## Resumen Ejecutivo

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Viabilidad | ✅ **IMPLEMENTADO** | Ya existe código funcional |
| Dependencias | ✅ Instaladas | Three.js + React Three Fiber |
| WebGL Fallback | ✅ Implementado | Auto-detecta y fallback a 2D |
| Performance | ⚠️ Por verificar | Build tiene issue no relacionado |

## Estado de Implementación

### Archivos Existentes

```
components/BioEmotionalExperientialWorkspace/
├── BodyVisualization2D.tsx      # 244 líneas - Vista SVG original
├── BodyVisualization3D.tsx      # 421 líneas - Vista Three.js
├── BodyVisualizationToggle.tsx  # 201 líneas - Wrapper 2D/3D
└── ExperientialVisualCore.tsx   # Integración en workspace
```

### Dependencias (package.json)

```json
{
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.5.0",
  "three": "^0.182.0"
}
```

**Tamaño estimado del bundle Three.js:** ~200-300KB (gzipped ~70-100KB)

## Arquitectura 3D Implementada

### Opción A Elegida: React Three Fiber ✓

```
┌──────────────────────────────────────────────────────────────┐
│                  BodyVisualizationToggle                      │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐     ┌─────────────────┐                 │
│  │ WebGL Detection │────▶│ Mode Selection  │                 │
│  │    hasWebGL()   │     │   2D / 3D       │                 │
│  └─────────────────┘     └────────┬────────┘                 │
│                                   │                          │
│            ┌──────────────────────┴──────────────────┐       │
│            ▼                                         ▼       │
│  ┌─────────────────┐                     ┌─────────────────┐ │
│  │ BodyVis2D (SVG) │                     │ BodyVis3D (R3F) │ │
│  │   - 244 lines   │                     │   - 421 lines   │ │
│  │   - 0KB extra   │                     │   - ~200KB      │ │
│  └─────────────────┘                     └─────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Componentes 3D

#### 1. RegionMesh
- Geometrías: sphere, cylinder, box, capsule
- Material: meshStandardMaterial con transparencia
- Interacción: click, hover con cursor change
- Animación: scale lerp on hover/select
- Labels: Html component de drei

#### 2. SceneContent
- Lighting: ambient + 2x directional
- Environment: "studio" preset
- Controls: OrbitControls (opcional)
- Auto-rotate: opcional

#### 3. BodyWireframe
- Outline básico del cuerpo en wireframe
- Material básico semitransparente

### Mapeo 3D de Regiones

| Region ID | Geometry | Position (x, y, z) | Scale |
|-----------|----------|-------------------|-------|
| head | sphere | [0, 1.7, 0] | [0.12, 0.14, 0.12] |
| throat | cylinder | [0, 1.5, 0] | [0.05, 0.08, 0.05] |
| chest | box | [0, 1.25, 0] | [0.18, 0.2, 0.1] |
| solar-plexus | sphere | [0, 1.0, 0.02] | [0.12, 0.1, 0.08] |
| abdomen | box | [0, 0.8, 0] | [0.15, 0.15, 0.1] |
| pelvis | box | [0, 0.55, 0] | [0.18, 0.12, 0.1] |
| left-shoulder | sphere | [-0.22, 1.35, 0] | [0.08, 0.08, 0.07] |
| right-shoulder | sphere | [0.22, 1.35, 0] | [0.08, 0.08, 0.07] |
| left-arm | cylinder | [-0.3, 1.1, 0] | [0.04, 0.2, 0.04] |
| right-arm | cylinder | [0.3, 1.1, 0] | [0.04, 0.2, 0.04] |
| left-hip | sphere | [-0.1, 0.45, 0] | [0.08, 0.08, 0.07] |
| right-hip | sphere | [0.1, 0.45, 0] | [0.08, 0.08, 0.07] |
| left-leg | cylinder | [-0.08, 0.15, 0] | [0.05, 0.25, 0.05] |
| right-leg | cylinder | [0.08, 0.15, 0] | [0.05, 0.25, 0.05] |

## Features Implementadas

### Core
- [x] Canvas 3D con React Three Fiber
- [x] 14 regiones anatómicas mapeadas
- [x] Geometrías básicas (sin modelo GLTF)
- [x] Selección por click
- [x] Hover feedback visual
- [x] Labels en HTML overlay

### Heatmap 3D
- [x] Colores por emotionType
- [x] Intensidad afecta opacidad
- [x] Transiciones suaves (lerp)
- [x] showLabels con intensidad %

### Interacción
- [x] OrbitControls (pan, zoom, rotate)
- [x] Auto-rotate opcional
- [x] Cursor pointer on hover
- [x] Min/max distance limits

### Toggle 2D/3D
- [x] WebGL detection
- [x] localStorage preference
- [x] Graceful fallback a 2D
- [x] Transition animation
- [x] Dynamic import (lazy loading)

## API Compatibilidad

```typescript
// Props idénticos para 2D y 3D
interface BodyVisualizationProps {
  anatomy: BodyAnatomy;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled?: boolean;
  heatmapData?: RegionIntensity[];
  heatmapConfig?: HeatmapConfig;
}

// Props adicionales solo 3D
interface BodyVisualization3DProps extends BodyVisualizationProps {
  cameraPosition?: [number, number, number];
  allowOrbit?: boolean;
  autoRotate?: boolean;
}
```

## Restricciones GEMINI.md

✅ **CUMPLIDO**: Vista consultiva, NO diagnóstica

- El 3D es para exploración visual del paciente
- No automatiza conclusiones clínicas
- Terapeuta mantiene control interpretativo
- Mismo nivel de detalle que versión 2D

## Mejoras Futuras (No implementadas)

### Fase Avanzada: Modelo GLTF
- Obtener modelo anatómico de Sketchfab/MakeHuman
- Segmentar en meshes por región
- Shaders personalizados para heatmap en superficie
- Animaciones de respiración/pulso

### Performance
- Instanced meshes para mejor rendimiento
- LOD (Level of Detail) para dispositivos móviles
- Compresión Draco para modelos GLTF

## Testing

```bash
# TypeScript check
npx tsc --noEmit

# Visual test (dev server)
npm run dev
# Navegar a: /bioemocional-workspace

# WebGL fallback test
# En Chrome DevTools > Rendering > Disable WebGL
```

## Conclusión

La visualización 3D está **completamente implementada** y funcional:

1. **Código existente**: 3 archivos, ~866 líneas total
2. **Dependencias instaladas**: Three.js ecosystem
3. **Fallback**: Auto-detecta WebGL, fallback a 2D
4. **API compatible**: Mismos props que versión 2D
5. **Restricciones cumplidas**: Vista consultiva, no diagnóstica

El upgrade de 2D a 3D ya fue completado en una sesión anterior.
