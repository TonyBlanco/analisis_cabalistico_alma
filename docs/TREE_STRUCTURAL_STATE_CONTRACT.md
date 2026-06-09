# TreeStructuralState v0.2 — Contrato de Estado Estructural

> **Actualizado 2026-06-09 — Fase 1 completada.**
> v0.1 sigue siendo válido (retrocompatible). Nuevos campos son todos opcionales.
> Arquitectura completa: [docs/04_SYMBOLIC_SYSTEM/TREE_MODULE_V02.md](04_SYMBOLIC_SYSTEM/TREE_MODULE_V02.md)

## RESUMEN EJECUTIVO

**TreeStructuralState v0.2** es el contrato que define qué puede renderizar el Árbol de la Vida.
Extiende v0.1 con campos opcionales de topología (`pillar`, `triad`, `olam`, `pathId`)
y un objeto de análisis estructural separado (`TreeStructuralAnalysis`).

### Regla de Oro
> **El Árbol NO INTERPRETA. SOLO RENDERIZA este estado.**

---

## 🎯 PROPÓSITO

Separar **cálculo simbólico** (métodos cabalísticos) de **visualización** (Árbol de la Vida).

**Antes:**
```
Método → Backend → Persistencia → UI (acoplado, interpretativo)
```

**Ahora (v0.1):**
```
Método → TreeStructuralState → Árbol (renderiza) → UI (puro, no persistente)
```

---

## 🧩 ESTRUCTURA DEL CONTRATO

### `TreeStructuralState`

```typescript
type TreeStructuralState = {
  source: {
    method: string;          // "pitagoras", "gematria_standard"
    mode: "manual";          // siempre manual en esta fase
    timestamp: string;       // ISO
  };

  sefirot: Array<{
    id: SefiraId;            // "keter", "chokmah", etc.
    activation: number;      // 0..1 intensidad relativa
    role: "dominant" | "present" | "latent";
  }>;

  flows: Array<{
    from: SefiraId;
    to: SefiraId;
    polarity: "harmonic" | "integrative" | "tensional";
    intensity: number;       // 0..1 (grosor / opacidad)
    direction: "down" | "up" | "lateral";
  }>;

  notes?: {
    scope: "symbolic-structural";
    disclaimer: string;      // texto fijo, no editable por IA
  };
};
```

### Sefirot Canónicos

```typescript
type SefiraId =
  | 'keter'      // 1: Corona (unidad)
  | 'chokmah'    // 2: Sabiduría (expansión)
  | 'binah'      // 3: Comprensión (forma)
  | 'chesed'     // 4: Misericordia (abundancia)
  | 'gevurah'    // 5: Rigor (límite)
  | 'tiferet'    // 6: Belleza (balance)
  | 'netzach'    // 7: Victoria (persistencia)
  | 'hod'        // 8: Esplendor (comunicación)
  | 'yesod'      // 9: Fundamento (inconsciente)
  | 'malchut';   // 10: Reino (manifestación)
```

---

## 🎨 LENGUAJE VISUAL (NO NEGOCIABLE)

### Colores por Polaridad

| Polaridad      | Color     | Significado Visual                     |
|----------------|-----------|----------------------------------------|
| `harmonic`     | 🟢 Verde  | Flujo expansivo / armónico             |
| `integrative`  | 🟠 Naranja| Proceso de integración / aprendizaje   |
| `tensional`    | 🔴 Rojo   | Restricción / desafío / límite         |

❌ **Nunca usar:** "positivo/negativo", "bueno/malo"

### Flechas

- **Dirección clara** (punta visible)
- **Curvas suaves** (no líneas duras)
- **Grosor según intensidad:**
  - `intensity 0.3` → línea fina, opaca 40%
  - `intensity 0.6` → línea media, opaca 70%
  - `intensity 1.0` → línea gruesa, opaca 100%

### Leyenda Obligatoria (SIEMPRE visible)

```
🟢 Armónico · 🟠 Integrador · 🔴 Tensional
Representación simbólica estructural · No interpretación automática
```

Esta leyenda te protege ética y legalmente.

---

## 🔌 USO: ADAPTADORES

Cada método simbólico debe tener un **adaptador** que traduzca su salida a `TreeStructuralState`.

### Ejemplo: Adaptador Pitágoras

**Ubicación:** `src/symbolic/tree/pitagoras-tree-adapter.ts`

```typescript
import { adaptPitagorasToTree } from '@/src/symbolic/tree';

// Ejecutar Pitágoras
const pitagorasState = ejecutarMetodoPitagorico(input);

// Adaptar a TreeStructuralState
const treeState = adaptPitagorasToTree(pitagorasState);

// Renderizar en el Árbol
<TreeWithFlows treeState={treeState} />
```

### Mapeo Pitágoras → Sefirot

| Número | Sefirá   | Concepto                          |
|--------|----------|-----------------------------------|
| 1      | Keter    | Corona, unidad                    |
| 2      | Chokmah  | Sabiduría, expansión              |
| 3      | Binah    | Comprensión, forma                |
| 4      | Chesed   | Misericordia, abundancia          |
| 5      | Gevurah  | Rigor, límite                     |
| 6      | Tiferet  | Belleza, balance                  |
| 7      | Netzach  | Victoria, persistencia            |
| 8      | Hod      | Esplendor, comunicación           |
| 9      | Yesod    | Fundamento, inconsciente          |
| 10     | Malchut  | Reino (se activa con 3+ dominantes)|

---

## 🚀 INTEGRACIÓN EN WORKSPACE

### Flujo de Ejecución

1. **Usuario selecciona método** (ej: Pitágoras) en UI
2. **Ejecutar método** → genera `PitagorasSymbolicState`
3. **Adaptar** → `adaptPitagorasToTree(pitagorasState)` → `TreeStructuralState`
4. **Renderizar** → `<TreeWithFlows treeState={treeState} />`

### Código en `CabalAppliedVisualCore.tsx`

```typescript
import { adaptPitagorasToTree, type TreeStructuralState } from '@/src/symbolic/tree';
import { TreeWithFlows } from '@/components/Tree';

const [treeStructuralState, setTreeStructuralState] = useState<TreeStructuralState | null>(null);

function runSelectedMethodForPatient() {
  // ... input preparation ...
  const estado = ejecutarMetodoPitagorico(input);
  setPitagorasState(estado);
  
  // Generar TreeStructuralState
  if (selectedMethod === 'pitagoras') {
    const treeState = adaptPitagorasToTree(estado);
    setTreeStructuralState(treeState);
  }
}

// En el render:
<TreeWithFlows treeState={treeStructuralState} size="responsive" />
```

---

## 🔒 REGLAS DEL CONTRATO (NO NEGOCIABLES)

### ❌ PROHIBIDO

- Texto interpretativo
- Conclusiones clínicas
- "Bueno / malo"
- Decisiones automáticas
- Backend / persistencia
- Modificar lógica del método simbólico
- Cambiar cálculo del Árbol

### ✔ PERMITIDO

- Activación de Sefirot (0..1)
- Relaciones entre Sefirot (flujos)
- Dirección de flujos (down/up/lateral)
- Polaridad de flujos (harmonic/integrative/tensional)
- Renderizado visual neutro

---

## 📦 ARCHIVOS CREADOS

```
src/symbolic/tree/
├── tree-structural-state.types.ts  # Contrato TreeStructuralState v0.1
├── pitagoras-tree-adapter.ts       # Adaptador Pitágoras → Tree
└── index.ts                         # Exports públicos

tonyblanco-app/components/Tree/
├── TreeWithFlows.tsx                # Componente con flechas y leyenda
└── index.ts                         # Export TreeWithFlows
```

---

## 🧪 VALIDACIÓN

### Checklist de Compliance

- [ ] Estado es `TreeStructuralState` válido
- [ ] Leyenda visible en UI
- [ ] Colores según tabla (verde/naranja/rojo)
- [ ] Sin texto interpretativo
- [ ] Sin persistencia/backend
- [ ] Disclaimer presente: "Representación simbólica estructural · No interpretación automática"

---

## 🔮 FUTURO (FASE 2)

- Adaptadores para otros métodos (gematría, notarikon, etc.)
- Comparación de múltiples estados (overlay)
- Animaciones sutiles (fade-in 200-300ms, sin parpadeo)
- Exportar TreeStructuralState como JSON (solo descarga, no backend)

---

## 📚 REFERENCIAS

- **Contrato original:** Este documento
- **Diseño simbólico:** `docs/SYMBOLIC_AI_MODULE_ACTIVATION_MAP.md`
- **Árbol estructural:** `docs/SYMBOLIC_TREE_STRUCTURAL_STATE.md`
- **Pitágoras:** `src/symbolic/methods/pitagoras/`

---

## ⚖️ DISCLAIMER LEGAL

> **TreeStructuralState v0.1** es un contrato de representación simbólica estructural.
> 
> NO constituye interpretación automática, diagnóstico clínico ni toma de decisiones.
> 
> Todo uso requiere supervisión humana profesional.

---

**Versión:** 0.1  
**Fecha:** 2025-12-23  
**Estado:** Implementado ✅  
**Próxima revisión:** Fase 2 (post-validación)
