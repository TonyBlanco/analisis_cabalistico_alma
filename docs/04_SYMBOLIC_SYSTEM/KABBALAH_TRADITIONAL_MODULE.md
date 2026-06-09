# Cábala Judía Tradicional — Módulo Fase 2

**Fecha:** 2026-06-09 · **Fase:** 2 completada · **Alcance:** TypeScript only, sin backend

---

## Objetivo

Añadir un **segundo sistema de correspondencias** (tradicional judío) en paralelo a la hermética Golden Dawn (`packages/symbolic/correspondences/`), reutilizando los mismos `SefiraId` y `TreePath.id` canónicos de `tree-topology.ts`.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  tree-topology.ts  (canónico — NO se modifica en Fase 2)    │
│  10 Sefirot · 22 senderos · SEFIROT_TOPOLOGY · TREE_PATHS   │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│  correspondences/       │    │  kabbalah-traditional/          │
│  Golden Dawn (hermética)│    │  Cábala Judía Tradicional       │
│  golden-dawn-data.ts    │    │  traditional-correspondences.*  │
│  resolve.ts             │    │  sefer-yetzirah.ts              │
│  system.ts (PR-5)       │    │  lurianic.ts                    │
└────────────┬────────────┘    │  resolve.ts                     │
             │                 └──────────────┬──────────────────┘
             └────────────┬───────────────────┘
                          ▼
              ┌───────────────────────┐
              │  CorrespondenceSystem │
              │  hermetic-golden-dawn │
              │  jewish-traditional   │
              └───────────┬───────────┘
                          │ correspondenceSystem? (opcional)
                          ▼
              ┌───────────────────────┐
              │  symbolic-interpreter │
              │  (read-only, gated)   │
              └───────────────────────┘
```

Ambos sistemas coexisten sin pisarse. El pipeline elige uno por `SystemId`.

---

## Módulo `packages/symbolic/kabbalah-traditional/`

### Correspondencias por Sefirá

| Sefirá | Nombre divino | Arcángel | Coro angélico | Mundo |
|---|---|---|---|---|
| Keter | אהיה · Eheieh | Metatron | Chayot ha-Kodesh | atziluth |
| Chokmah | יה · Yah | Raziel | Ophanim | beriah |
| Binah | יהוה אלהים · YHVH Elohim | Tzaphkiel | Aralim | beriah |
| Chesed | אל · El | Tzadkiel | Chashmalim | yetzirah |
| Gevurah | אלהים גבור · Elohim Gibor | Khamael | Seraphim | yetzirah |
| Tiferet | יהוה אלוה ודעת · YHVH Eloah va-Daat | Raphael | Malachim | yetzirah |
| Netzach | יהוה צבאות · YHVH Tzevaot | Haniel | Elohim | yetzirah |
| Hod | אלהים צבאות · Elohim Tzevaot | Michael | Bene Elohim | yetzirah |
| Yesod | שדי אל חי · Shaddai El Chai | Gabriel | Kerubim | yetzirah |
| Malchut | אדני הארץ · Adonai ha-Aretz | Sandalphon | Ishim | assiah |

El campo `olam` se deriva de `SEFIROT_TOPOLOGY` (invariante testeada).

### Niveles del alma (por mundo, no por Sefirá)

| Parte | Mundo | Hebreo |
|---|---|---|
| nefesh | assiah | נפש |
| ruach | yetzirah | רוח |
| neshamah | beriah | נשמה |
| chayah | atziluth | חיה |
| yechidah | adam_kadmon | יחידה |

### Sefer Yetzirah — clasificación de letras

| Clase | Cantidad | Letras | Atribución |
|---|---|---|---|
| Madres | 3 | א מ ש | aire, agua, fuego |
| Dobles | 7 | ב ג ד כ פ ר ת | planetas |
| Simples | 12 | ה ו ז ח ט י ל נ ס ע צ ק | signos zodiacales |

Invariante: el conjunto de letras coincide exactamente con `TREE_PATHS`.

### Datos luriánicos (referencia neutra)

- **Partzufim:** `arich_anpin`→Keter, `abba`→Chokmah, `imma`→Binah, `zeir_anpin`→6 Sefirot medias, `nukva`→Malchut
- **Conceptos:** Tzimtzum, Shevirat haKelim, Tikkun, Ein Sof — solo en `LURIANIC_CONCEPTS`, nunca en prompts del intérprete
- **Da'at:** `DAAT_OVERLAY` opcional (`hidden: true`), entre Chokmah/Binah/Tiferet — **no** en topología ni análisis

---

## Selector `CorrespondenceSystem` (PR-5)

```ts
// packages/symbolic/correspondences/system.ts

export type SystemId = 'hermetic-golden-dawn' | 'jewish-traditional';

export interface CorrespondenceSystem<TSefirah, TPath> {
  readonly id: SystemId;
  sefirah(id: SefiraId): TSefirah | null;
  path(pathId: string): TPath | null;
}

export function getCorrespondenceSystem(id: SystemId): CorrespondenceSystem<…>;
```

Fachada aditiva: los resolvers Golden Dawn existentes no cambian de comportamiento.

---

## Integración intérprete (PR-6)

```ts
interface SymbolicInterpretationRequest {
  treeState: TreeStructuralState;
  safetyLevel: SymbolicSafetyLevel;
  structuralAnalysis?: TreeStructuralAnalysis;
  correspondenceSystem?: SystemId;  // nuevo, opcional
}
```

Cuando `correspondenceSystem` está presente, el prompt incluye tablas de referencia para:
- Sefirot con `role !== 'latent'`
- Flows con `pathId` definido

La sección inyectada pasa lint de `SYMBOLIC_INTERPRETER_META.prohibitedTerms`.

---

## Reglas innegociables

Heredan de `SOURCE_OF_TRUTH.md` y Fase 1:

- ❌ NO diagnóstico · NO etiquetas psicológicas · NO consejos · NO determinismo
- ❌ NO lectura holística · NO "bueno / malo"
- ✅ SOLO tablas estructural-simbólicas, read-only
- ✅ `tree-topology.ts` es la única fuente de estructura
- ✅ Da'at solo overlay; invariante de 10 Sefirot intacta
- ✅ Conceptos luriánicos nunca aplicados a personas

---

## Criterios de aceptación (Done)

- [x] 10 Sefirot con nombre divino, arcángel, coro, mundo alineado con topología
- [x] Sefer Yetzirah: 3+7+12=22, letras = `TREE_PATHS`
- [x] `resolveTraditionalSefirah` / `resolveTraditionalPath` sin `null` para 10+22
- [x] `SEFIROT_TOPOLOGY` sigue en 10; `tree-analysis.ts` sin cambios
- [x] Determinismo: sin red, sin `Date.now()`, sin azar
- [x] Lint `prohibitedTerms` en datos y sección de correspondencias del intérprete
- [x] `tsc --noEmit` sin errores; sin `any` en APIs públicas nuevas
- [x] Hermética y Fase 1 sin regresión (81 tests)

---

## Tests

```bash
cd packages/symbolic
npm test        # 81 tests
npm run typecheck
```

| Suite | Tests | Cubre |
|---|---|---|
| `kabbalah-traditional.test.ts` | 15 | datos, Sefer Yetzirah, lurianic, resolve, safety |
| `system.test.ts` | 4 | selector hermético/tradicional |
| `interpreter-with-analysis.test.ts` | 7 | inyección correspondencias + safety |
| `golden-dawn.test.ts` | 16 | hermética sin regresión |
| `tree-*.test.ts` | 39 | Fase 1 sin regresión |

---

## Documentación relacionada

| Doc | Uso |
|---|---|
| `packages/symbolic/kabbalah-traditional/README.md` | Guía del módulo (desarrolladores) |
| `docs/04_SYMBOLIC_SYSTEM/TREE_MODULE_V02.md` | Árbol v0.2 + capas (Fase 1+2) |
| `packages/symbolic/tree/README.md` | Uso rápido tree + intérprete |
| `packages/symbolic/correspondences/README.md` | Golden Dawn + selector |

---

## Fuera de alcance (Fase 2)

- Aplicar Tikkun / Shevirat haKelim a lecturas personales
- Python / `backend/cabala_py/`
- Redefinir topología
- Endpoints nuevos
- Mezclar hermética y tradicional en una sola tabla