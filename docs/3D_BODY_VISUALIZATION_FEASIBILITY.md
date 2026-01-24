# Estudio de Viabilidad: Upgrade 2D → 3D Body Visualization

> **Fecha**: 2026-01-24
> **Autor**: Agente Investigador/Implementador
> **Estado**: ✅ VIABLE - Implementación Recomendada

---

## 📋 Resumen Ejecutivo

**Conclusión**: La migración a visualización 3D es **técnicamente viable** y **recomendada** usando **Three.js + React Three Fiber**.

| Criterio | Evaluación |
|----------|------------|
| Viabilidad Técnica | ✅ Alta |
| Complejidad de Implementación | 🟡 Media |
| Impacto en Bundle | ⚠️ +150-200KB |
| Compatibilidad WebGL | ✅ 98%+ navegadores |
| Valor UX | ✅ Alto |

---

## 🔍 Análisis del Estado Actual

### Componente `BodyVisualization2D.tsx`

```
Líneas: 244
Dependencias: React, SVG paths
Regiones anatómicas: 14
Anatomías soportadas: male, female, intersex, unknown
Features:
  - Heatmap con colores por emotionType
  - Selección interactiva de regiones
  - Hotspots con labels
  - Configuración de opacidad
```

### Estructura de Datos Compatible

```typescript
interface RegionIntensity {
  regionId: string;
  intensity: number;    // 0-100
  emotionType: EmotionType;
  lastUpdated: Date;
}
```

Esta estructura es **100% reutilizable** para 3D.

---

## ⚖️ Evaluación de Opciones

### Opción A: Three.js + React Three Fiber ⭐ RECOMENDADA

| Aspecto | Evaluación |
|---------|------------|
| Ecosistema | Maduro, bien documentado |
| Integración React | Nativa con R3F |
| Control programático | Total |
| Performance | Excelente con optimizaciones |
| Curva aprendizaje | Media |

**Dependencias a agregar:**
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.88.0"
}
```

**Bundle impact:** ~180KB (gzip: ~60KB)

### Opción B: Spline ❌ DESCARTADA

- Dependencia externa para edición
- Control limitado sobre interacciones
- No permite shaders personalizados para heatmap

### Opción C: CSS 3D Transform ❌ DESCARTADA

- No es 3D real, solo perspectiva
- No permite navegación orbital
- Limitaciones severas para heatmap dinámico

---

## 🏗️ Arquitectura Propuesta

### Modelo 3D

**Estrategia**: Modelo procedural generado en código

En lugar de depender de un archivo GLTF externo:
- Usar geometrías primitivas de Three.js
- Combinar esferas, cilindros y formas para cuerpo humano simplificado
- Segmentar por regiones anatómicas existentes

**Ventajas:**
- Sin assets externos
- Control total sobre segmentación
- Ajustable programáticamente por anatomía

### Componentes

```
components/BioEmotionalExperientialWorkspace/
├── BodyVisualization2D.tsx      (existente, mantener)
├── BodyVisualization3D.tsx      (NUEVO)
├── BodyVisualizationToggle.tsx  (NUEVO - wrapper con toggle)
├── three/
│   ├── BodyModel.tsx            (modelo procedural)
│   ├── HeatmapMaterial.tsx      (shader para intensidad)
│   ├── RegionMesh.tsx           (mesh interactivo por región)
│   └── CameraControls.tsx       (órbita, zoom, pan)
```

### API Compatible

```typescript
// Misma interfaz que 2D
interface BodyVisualization3DProps {
  anatomy: BodyAnatomy;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled?: boolean;
  heatmapData?: RegionIntensity[];
  heatmapConfig?: HeatmapConfig;
  // Nuevas props opcionales
  cameraPosition?: [number, number, number];
  allowOrbit?: boolean;
  autoRotate?: boolean;
}
```

---

## 📊 Análisis de Rendimiento

### Benchmarks Esperados

| Métrica | Target | Factible |
|---------|--------|----------|
| FPS (desktop) | 60 | ✅ |
| FPS (mobile) | 30 | ✅ |
| TTI adicional | <500ms | ✅ |
| Memory | <50MB | ✅ |

### Optimizaciones Incluidas

1. **Lazy loading**: Componente 3D cargado dinámicamente
2. **LOD**: Nivel de detalle reducido en mobile
3. **Instanced meshes**: Para regiones similares
4. **Frustum culling**: Automático en Three.js

---

## 🛡️ Fallback y Compatibilidad

```typescript
// WebGL detection
const hasWebGL = typeof window !== 'undefined' && 
  (window.WebGLRenderingContext || window.WebGL2RenderingContext);

// Auto-fallback
<BodyVisualizationToggle
  mode={hasWebGL ? 'auto' : '2d'}
  // ...props
/>
```

### Soporte de Navegadores

| Navegador | WebGL | Soporte |
|-----------|-------|---------|
| Chrome 90+ | ✅ | ✅ |
| Firefox 85+ | ✅ | ✅ |
| Safari 15+ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ |
| Mobile Safari | ✅ | ⚠️ (reducido) |
| Chrome Android | ✅ | ✅ |

---

## ⚠️ Restricciones Mantenidas (GEMINI.md)

> **Vista consultiva, NO diagnóstica**

El componente 3D:
- ❌ NO automatiza conclusiones
- ❌ NO sugiere diagnósticos
- ❌ NO interpreta datos sin terapeuta
- ✅ Permite exploración visual del consultante
- ✅ Visualiza intensidad emocional registrada manualmente
- ✅ Terapeuta mantiene control interpretativo total

---

## 📅 Plan de Implementación

### Fase 1: Setup (30 min)
- [x] Documento de viabilidad
- [ ] Instalar dependencias Three.js

### Fase 2: Modelo Base (2 hr)
- [ ] Crear geometría procedural del cuerpo
- [ ] Mapear a regiones anatómicas existentes
- [ ] Implementar variantes por anatomía

### Fase 3: Interactividad (1 hr)
- [ ] Raycasting para selección
- [ ] Hover states
- [ ] Controles de cámara

### Fase 4: Heatmap 3D (1 hr)
- [ ] Material con vertex colors
- [ ] Transiciones suaves
- [ ] Labels 3D (opcional)

### Fase 5: Integración (30 min)
- [ ] Toggle 2D/3D
- [ ] Fallback WebGL
- [ ] Tests de rendimiento

---

## ✅ Recomendación Final

**PROCEDER CON IMPLEMENTACIÓN** usando Three.js + React Three Fiber con:

1. Modelo procedural (sin assets externos)
2. Toggle 2D/3D con preferencia guardada
3. Fallback automático si no hay WebGL
4. Mismo API que componente 2D

El beneficio UX justifica el overhead de bundle (~60KB gzip adicional).
