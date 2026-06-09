# packages/symbolic/kabbalah-traditional — Cábala Judía Tradicional

Módulo **paralelo** a `correspondences/` (Golden Dawn hermética). Enriquece el Árbol con tablas tradicionales judías: nombres divinos, arcángeles, coros angélicos, niveles del alma, clasificación Sefer Yetzirah y referencia luriánica neutra.

**TypeScript puro · read-only · sin backend · sin Python.**

---

## Relación con la topología canónica

```
tree-topology.ts  (ÚNICA fuente de estructura: 10 Sefirot + 22 senderos)
        ↓
kabbalah-traditional/  (correspondencias keyeadas por SefiraId y TreePath.id)
        ↓
correspondences/system.ts  (selector hermetic-golden-dawn | jewish-traditional)
        ↓
symbolic-interpreter.ts  (inyección opcional en prompt, safety-gated)
```

Este módulo **no redefine** el Árbol. Importa `SefiraId`, `OlamId`, `TREE_PATHS` de `tree-topology.ts`.

**Da'at** existe solo como `DAAT_OVERLAY` (opcional, `hidden: true`). No entra en `SEFIROT_TOPOLOGY`, no cuenta para la invariante de 10, no participa en `tree-analysis.ts`.

---

## Archivos

| Archivo | Contenido |
|---|---|
| `traditional-correspondences.types.ts` | `TraditionalSefirahData`, `SoulLevelData`, `SoulPart` |
| `traditional-correspondences.data.ts` | Tablas 10 Sefirot + 5 niveles del alma |
| `sefer-yetzirah.ts` | 3 madres + 7 dobles + 12 simples (letras de `TREE_PATHS`) |
| `lurianic.ts` | `PARTZUFIM`, `LURIANIC_CONCEPTS`, `DAAT_OVERLAY` |
| `resolve.ts` | API única de acceso |
| `index.ts` | Exports públicos |

---

## API pública

```ts
import {
  resolveTraditionalSefirah,
  resolveTraditionalPath,
  resolvePartzuf,
  resolveSoulLevels,
  TRADITIONAL_SEFIRAH_CORRESPONDENCES,
  SEFER_YETZIRAH_BY_PATH,
  PARTZUFIM,
  LURIANIC_CONCEPTS,
  DAAT_OVERLAY,
} from '../kabbalah-traditional';
```

### Sefirot tradicionales

```ts
const keter = resolveTraditionalSefirah('keter');
// → { divineNameHebrew: 'אהיה', divineNameTranslit: 'Eheieh',
//     archangel: 'Metatron', angelicChoir: 'Chayot ha-Kodesh', olam: 'atziluth', … }
```

### Sefer Yetzirah (22 letras)

```ts
const path = resolveTraditionalPath('keter-tiferet');
// → { pathId: 'keter-tiferet', hebrewLetter: 'ג', letterClass: 'double', attribution: 'moon' }
```

### Partzufim

```ts
resolvePartzuf('tiferet');  // → 'zeir_anpin'
```

---

## Selector de sistema (con hermética)

```ts
import { getCorrespondenceSystem } from '../correspondences/system';

const traditional = getCorrespondenceSystem('jewish-traditional');
traditional.sefirah('chesed');  // TraditionalSefirahData
traditional.path('chesed-tiferet');  // SeferYetzirahLetter
```

---

## Uso en el intérprete simbólico

```ts
import { generateSymbolicInterpretation } from '../tree/symbolic-interpreter';

await generateSymbolicInterpretation(
  {
    treeState: state,
    safetyLevel: 'observational',
    structuralAnalysis: analysis,
    correspondenceSystem: 'jewish-traditional',  // opcional
  },
  aiCallback,
);
```

El prompt incluye una sección `CORRESPONDENCE REFERENCE` con tablas neutras de Sefirot activos y senderos con `pathId`. No incluye conceptos luriánicos interpretativos (Tzimtzum, Tikkun, etc.).

---

## Reglas de seguridad (NO NEGOCIABLES)

> Heredan de `SOURCE_OF_TRUTH.md` y `SYMBOLIC_INTERPRETER_META`.

- NO diagnóstico clínico · NO etiquetas psicológicas · NO consejos personales
- NO determinismo · NO lectura holística · NO "bueno / malo"
- SOLO datos estructural-simbólicos como **tablas tipadas**
- Conceptos luriánicos (`LURIANIC_CONCEPTS`) son **referencia neutra**, nunca aplicados a una persona
- Acceso **read-only** · sin datos personales en esta capa

---

## Invariantes (tests)

| Invariante | Suite |
|---|---|
| 10 Sefirot con nombre divino, arcángel, coro, olam alineado con topología | `kabbalah-traditional.test.ts` |
| 3 madres + 7 dobles + 12 simples = 22; letras = `TREE_PATHS` | `kabbalah-traditional.test.ts` |
| `resolveTraditionalSefirah` / `resolveTraditionalPath` sin `null` para 10+22 | `kabbalah-traditional.test.ts` |
| `SEFIROT_TOPOLOGY` sigue en 10; Da'at solo overlay | `kabbalah-traditional.test.ts` |
| Sin `prohibitedTerms` en datos del módulo | `kabbalah-traditional.test.ts` |
| `CorrespondenceSystem` tradicional resuelve 10+22 | `system.test.ts` |
| Intérprete inyecta referencia tradicional sin términos prohibidos | `interpreter-with-analysis.test.ts` |

```bash
cd packages/symbolic
npm test
npm run typecheck
```

---

## Fuera de alcance

- Aplicar Shevirat haKelim / Tikkun a lecturas de personas
- Migración a Python / `backend/cabala_py/`
- Redefinir topología (Da'at solo overlay)
- Mezclar hermética y tradicional en una sola tabla