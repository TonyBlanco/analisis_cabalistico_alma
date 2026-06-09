# Tree of Life Module — Arquitectura v0.2

**Fecha:** 2026-06-09 · **Fase:** 1 completada · **Alcance:** TypeScript only, sin backend

---

## Arquitectura de capas

```
┌──────────────────────────────────────────────────────┐
│  tree-topology.ts  (datos canónicos, nunca cambian)  │
│  • 10 Sefirot con pillar / triad / olam / position   │
│  • 22 senderos Golden Dawn (pathNumber 11–32)        │
│  • SEFIROT_TOPOLOGY + TREE_PATHS como const          │
└────────────────────────┬─────────────────────────────┘
                         │ importado por
┌────────────────────────▼─────────────────────────────┐
│  TreeStructuralState v0.2  (estado vivo)             │
│  • Campos v0.1: activation, role, polarity…          │
│  • NUEVOS opcionales: pillar, triad, olam, pathId    │
│  • Retrocompatible: v0.1 sigue siendo válido         │
└────────────────────────┬─────────────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           ▼                            ▼
┌──────────────────┐       ┌────────────────────────────┐
│ tree-analysis.ts │       │  correspondences/           │
│ (métricas)       │       │  golden-dawn-data.ts        │
│ • pillarBalance  │       │  • SefirahCorrespondence    │
│ • triadActivation│       │  • PathCorrespondence       │
│ • graph BFS/DFS  │       │  • planeta, elemento, tarot │
│ Determinista     │       │  resolve.ts (API única)     │
│ Puro, memoizado  │       └────────────────────────────┘
└────────┬─────────┘
         │ consumido por (read-only)
┌────────▼─────────────────────────────────────────────┐
│  symbolic-interpreter.ts  (IA, safety-gated)         │
│  • Recibe TreeStructuralState + TreeStructuralAnalysis│
│  • SYMBOLIC_INTERPRETER_META.prohibitedTerms activo  │
│  • Observaciones estructurales únicamente            │
└──────────────────────────────────────────────────────┘
```

---

## Tipos nuevos (v0.2)

### `PillarId` / `TriadId` / `OlamId`

```ts
type PillarId = 'severity' | 'mercy' | 'equilibrium';
type TriadId  = 'supernal' | 'ethical' | 'astral';
type OlamId   = 'atziluth' | 'beriah' | 'yetzirah' | 'assiah';
```

### `TreePath` (topology)

```ts
interface TreePath {
  id: string;          // 'keter-chokmah'
  from: SefiraId;
  to: SefiraId;
  hebrewLetter: string; // 'א'
  pathNumber: number;   // 11..32
}
```

### `TreeStructuralAnalysis`

```ts
interface TreeStructuralAnalysis {
  sourceVersion: string;
  pillarBalance:        Record<PillarId, number>;           // fracción 0..1
  triadActivation:      Record<TriadId | 'receptacle', number>;
  olamActivation:       Record<OlamId, number>;
  polarityDistribution: Record<FlowPolarity, number>;
  graph: {
    activeNodes: SefiraId[];
    activePaths: string[];
    degreeCentrality: Record<SefiraId, number>;
    connectedComponents: number;
    longestActivePath: SefiraId[];
  };
  ranking: { id: SefiraId; activation: number; role: SefiraRole }[];
}
```

### `SefirahCorrespondence` / `PathCorrespondence` (Golden Dawn)

```ts
interface SefirahCorrespondence {
  id: SefirahId;
  planet: GoldenDawnPlanet;     // 'sun', 'moon', 'saturn', …
  element: GoldenDawnElement | null;
  kingScaleColor: string;
  tarotArcanaNumbers: number[];
}

interface PathCorrespondence {
  id: TreePathId;
  hebrewLetter: string;
  pathNumber: number;           // 11..32
  tarotArcanum: number;         // 0–21 Arcanos Mayores
  planet: GoldenDawnPlanet | null;
  element: GoldenDawnElement | null;
  zodiacSign: string | null;
}
```

---

## Invariantes garantizados por tests

| Invariante | Test |
|---|---|
| `SEFIROT_TOPOLOGY` tiene exactamente 10 Sefirot | `tree-topology.test.ts` |
| `TREE_PATHS` tiene exactamente 22 senderos | `tree-topology.test.ts` |
| `pathNumber` únicos en rango 11–32 | `tree-topology.test.ts` |
| Letras hebreas únicas por sendero | `tree-topology.test.ts` |
| v0.1 sigue siendo válido sin campos nuevos | `tree-structural-state-compat.test.ts` |
| `analyzeTreeState` produce salida idéntica para mismo input | `tree-analysis.test.ts` |
| Salida de análisis no contiene `prohibitedTerms` | `tree-analysis.test.ts` |
| `resolveSefirahCorrespondences` cubre las 10 Sefirot | `golden-dawn.test.ts` |
| `resolvePathCorrespondences` cubre los 22 senderos | `golden-dawn.test.ts` |
| Arcanos Mayores únicos (0–21) en las 22 vías | `golden-dawn.test.ts` |
| Adaptadores pueblan `pillar`, `triad`, `olam`, `pathId` | `adapters-v02.test.ts` |
| Intérprete filtra `prohibitedTerms` en output con análisis | `interpreter-with-analysis.test.ts` |

---

## Correspondencias Golden Dawn — resumen

### Sefirot → Planetas (Columna Izquierda = Rigor, Centro = Equilibrio, Derecha = Misericordia)

| Sefirá | Pilar | Tríada | Mundo | Planeta |
|---|---|---|---|---|
| Keter | equilibrium | supernal | atziluth | Primum Mobile |
| Chokmah | mercy | supernal | beriah | Zodíaco |
| Binah | severity | supernal | beriah | Saturno |
| Chesed | mercy | ethical | yetzirah | Júpiter |
| Gevurah | severity | ethical | yetzirah | Marte |
| Tiferet | equilibrium | ethical | yetzirah | Sol |
| Netzach | mercy | astral | yetzirah | Venus |
| Hod | severity | astral | yetzirah | Mercurio |
| Yesod | equilibrium | astral | yetzirah | Luna |
| Malchut | equilibrium | receptacle | assiah | Tierra |

### 22 Senderos → Arcanos Mayores (Golden Dawn)

| Sendero | Letra | Arcano | Elem/Planeta/Signo |
|---|---|---|---|
| 11 Keter–Chokmah | א | 0 El Loco | Aire |
| 12 Keter–Binah | ב | I El Mago | Mercurio |
| 13 Keter–Tiferet | ג | II Alta Sacerdotisa | Luna |
| 14 Chokmah–Binah | ד | III La Emperatriz | Venus |
| 15 Chokmah–Tiferet | ה | IV El Emperador | Aries |
| 16 Chokmah–Chesed | ו | V El Hierofante | Tauro |
| 17 Binah–Tiferet | ז | VI Los Amantes | Géminis |
| 18 Binah–Gevurah | ח | VII El Carro | Cáncer |
| 19 Chesed–Gevurah | ט | VIII La Fuerza | Leo |
| 20 Chesed–Tiferet | י | IX El Ermitaño | Virgo |
| 21 Chesed–Netzach | כ | X Rueda de la Fortuna | Júpiter |
| 22 Gevurah–Tiferet | ל | XI La Justicia | Libra |
| 23 Gevurah–Hod | מ | XII El Colgado | Agua |
| 24 Tiferet–Netzach | נ | XIII La Muerte | Escorpio |
| 25 Tiferet–Yesod | ס | XIV La Templanza | Sagitario |
| 26 Tiferet–Hod | ע | XV El Diablo | Capricornio |
| 27 Netzach–Hod | פ | XVI La Torre | Marte |
| 28 Netzach–Yesod | צ | XVII La Estrella | Acuario |
| 29 Netzach–Malchut | ק | XVIII La Luna | Piscis |
| 30 Hod–Yesod | ר | XIX El Sol | Sol |
| 31 Hod–Malchut | ש | XX El Juicio | Fuego |
| 32 Yesod–Malchut | ת | XXI El Mundo | Saturno |

---

## API pública (`@holistica/symbolic/tree`)

```ts
// Topología
export { SEFIROT_TOPOLOGY, TREE_PATHS, VALID_SEFIRA_IDS }
export type { PillarId, TriadId, OlamId, TreePath, SefirotTopoEntry }

// Estado
export { TREE_STRUCTURAL_STATE_META }
export type { TreeStructuralState, TreeSefirah, TreeFlow, SefiraId, SefiraRole, … }

// Análisis
export { analyzeTreeState }
export type { TreeStructuralAnalysis, GraphMetrics }

// Adaptadores
export { adaptPitagorasToTree, adaptGenericMethodToTree }

// Intérprete
export { generateSymbolicInterpretation, validateTreeStateForInterpretation, createFallbackInterpretation }
export { SYMBOLIC_INTERPRETER_META }
```

---

## Fuera de alcance (Fase 1)

- Cábala Judía Tradicional (Tikkun, Shevirah, Ein Sof, Qliphoth)
- Migración a Python / `backend/cabala_py/`
- Endpoints DRF/FastAPI nuevos
- Render del Árbol (frontend — consume el contrato, no lo produce)
- Texto interpretativo adicional fuera del intérprete existente
