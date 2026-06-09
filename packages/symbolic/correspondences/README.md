# Symbolic Correspondences — Hermetic Golden Dawn

Capa de correspondencias **herméticas** (Golden Dawn / Regardie / Liber 777).
Sistema paralelo: `packages/symbolic/kabbalah-traditional/` (cábala judía tradicional).

## Scope
- Data only + pure functions
- No UI, no analysis, no interpretation
- No clinical or business logic

## What It Provides
- `SEFIRAH_CORRESPONDENCES` — planeta, elemento, color, tarot por Sefirá
- `PATH_CORRESPONDENCES` — letra hebrea, arcano mayor, planeta/signo por sendero
- `resolveSefirahCorrespondences` / `resolvePathCorrespondences`
- `getCorrespondenceSystem('hermetic-golden-dawn')` — fachada `CorrespondenceSystem`

## System selector (Fase 2)

```ts
import { getCorrespondenceSystem, CORRESPONDENCE_SYSTEM_IDS } from './system';

// 'hermetic-golden-dawn' | 'jewish-traditional'
const system = getCorrespondenceSystem('hermetic-golden-dawn');
system.sefirah('tiferet');
system.path('tiferet-yesod');
```

Keys use canonical `SefiraId` / `TopologyPathId` (`keter` / `malchut` spelling).

## Note
No interpretation is performed here. See `docs/04_SYMBOLIC_SYSTEM/KABBALAH_TRADITIONAL_MODULE.md`.
