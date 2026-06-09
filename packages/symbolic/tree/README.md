# packages/symbolic/tree — Tree of Life Module

Motor simbólico del Árbol de la Vida. **TypeScript puro, sin backend, sin Python.**

---

## Capas (v0.2)

```
tree-topology.ts          ← datos canónicos fijos (10 Sefirot, 22 senderos)
        ↓
TreeStructuralState v0.2  ← estado vivo (qué está activo ahora)
        ↓
tree-analysis.ts          ← métricas deterministas neutras
        ↓
symbolic-interpreter.ts   ← observaciones IA (read-only, safety-gated)
```

Las capas son **unidireccionales**: la topología no sabe del estado; el análisis no interpreta; el intérprete no accede a datos personales.

---

## Contratos públicos

### `TreeStructuralState` (v0.2)

```ts
interface TreeStructuralState {
  source: { method: string; mode: 'manual'; timestamp: string };
  sefirot: TreeSefirah[];   // activation 0..1, role, + opcionales: pillar/triad/olam
  flows:   TreeFlow[];      // polarity, intensity, direction, + opcional: pathId
  notes?:  TreeNotes;
}
```

Los campos `pillar`, `triad`, `olam` (en sefirot) y `pathId` (en flows) son **opcionales** — un objeto v0.1 sigue siendo válido.

### `analyzeTreeState(state): TreeStructuralAnalysis`

```ts
const analysis = analyzeTreeState(myState);

analysis.pillarBalance          // { severity: 0.23, mercy: 0.33, equilibrium: 0.44 }
analysis.triadActivation        // { supernal: 0.78, ethical: 0.53, astral: 0.43, receptacle: 0.4 }
analysis.olamActivation         // { atziluth: 0.9, beriah: 0.72, yetzirah: 0.53, assiah: 0.4 }
analysis.polarityDistribution   // { harmonic: 0.5, integrative: 0.25, tensional: 0.25 }
analysis.graph.connectedComponents
analysis.graph.degreeCentrality
analysis.graph.longestActivePath
analysis.ranking                // sefirot ordenadas por activation desc
```

**Garantías:** puro, determinista (mismo input → mismo output), sin red, sin `Date.now()`.
Memoizado por hash del estado.

### `SEFIROT_TOPOLOGY` y `TREE_PATHS`

```ts
import { SEFIROT_TOPOLOGY, TREE_PATHS } from './tree-topology';

SEFIROT_TOPOLOGY['tiferet']
// → { pillar: 'equilibrium', triad: 'ethical', olam: 'yetzirah', position: { x: 300, y: 380 } }

TREE_PATHS.length  // 22
TREE_PATHS[0]      // { id: 'keter-chokmah', from: 'keter', to: 'chokmah', hebrewLetter: 'א', pathNumber: 11 }
```

---

## Uso rápido

```ts
import {
  adaptPitagorasToTree,
  analyzeTreeState,
  generateSymbolicInterpretation,
} from '@holistica/symbolic/tree';

// 1. Generar estado desde un método
const state = adaptPitagorasToTree(pitagorasResult);
// state.sefirot[0].pillar === 'equilibrium'  ← poblado automáticamente

// 2. Analizar estructura
const analysis = analyzeTreeState(state);

// 3. Interpretar (requiere callback de IA)
const interpretation = await generateSymbolicInterpretation(
  {
    treeState: state,
    safetyLevel: 'observational',
    structuralAnalysis: analysis,
    correspondenceSystem: 'jewish-traditional',  // opcional: hermetic-golden-dawn | jewish-traditional
  },
  myAICallback,
);
```

---

## Reglas de seguridad (NO NEGOCIABLES)

> Provenientes de `SOURCE_OF_TRUTH.md` y `SYMBOLIC_INTERPRETER_META`.

- NO diagnóstico clínico · NO etiquetas psicológicas · NO consejos personales
- NO determinismo (`siempre`, `nunca`, `debes`) · NO "bueno / malo"
- El análisis devuelve **solo números y enums neutros** — nunca texto valorativo
- El intérprete es **read-only** sobre `TreeStructuralState`
- `SYMBOLIC_INTERPRETER_META.prohibitedTerms` se aplica a toda salida de texto

---

## Tests

```bash
cd packages/symbolic
npm test               # 81 tests
npm run typecheck      # tsc --noEmit sin errores
```

| Suite | Tests | Cubre |
|---|---|---|
| `tree-topology.test.ts` | 12 | invariantes 10+22, unicidad |
| `tree-structural-state-compat.test.ts` | 4 | retrocompatibilidad v0.1 |
| `tree-analysis.test.ts` | 18 | golden tests, determinismo, lint prohibitedTerms |
| `golden-dawn.test.ts` | 16 | correspondencias herméticas 10+22 |
| `kabbalah-traditional.test.ts` | 15 | correspondencias tradicionales, Sefer Yetzirah, lurianic |
| `system.test.ts` | 4 | selector hermetic-golden-dawn / jewish-traditional |
| `adapters-v02.test.ts` | 5 | campos v0.2 en sefirot + flows |
| `interpreter-with-analysis.test.ts` | 7 | análisis + correspondencias en prompt, safety |

---

## Correspondencias (Fase 2)

Dos sistemas paralelos, mismo `SefiraId` / `TreePath.id`:

| Sistema | Módulo | Uso |
|---|---|---|
| Hermético Golden Dawn | `correspondences/` | planeta, elemento, tarot, colores |
| Judío tradicional | `kabbalah-traditional/` | nombres divinos, arcángeles, Sefer Yetzirah |

Docs: `docs/04_SYMBOLIC_SYSTEM/KABBALAH_TRADITIONAL_MODULE.md`

---

## Fuera de alcance

- Aplicar conceptos luriánicos a lecturas de personas
- Migración a Python / `backend/cabala_py/`
- Endpoints nuevos DRF/FastAPI
- Mezclar hermética y tradicional en una sola tabla
