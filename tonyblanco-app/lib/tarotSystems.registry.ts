import type { TarotSystemId } from '@/components/AstrologyTarotWorkspace/types';
import type { TarotSystem } from '@/lib/api/swm/tarot/types';

/** Capa de madurez — una sola fuente para sidebar + VisualCore */
export type TarotSystemTier = 'full' | 'educational' | 'preparing';

export type TarotSystemRegistryEntry = {
  id: TarotSystemId;
  label: string;
  description: string;
  tier: TarotSystemTier;
  /** Backend SWM `tarot_system` (alias cuando el id FE no existe en Django) */
  backendSystem: TarotSystem;
  /** SWM v3 `get_system_metadata().implemented` */
  swmV3Implemented: boolean;
  /** Mapeo major arcana en `@holistica/symbolic/tarot/decks` */
  hasLocalDeckMapping: boolean;
};

export const TAROT_SYSTEMS_REGISTRY: TarotSystemRegistryEntry[] = [
  {
    id: 'thoth',
    label: 'Thoth Tarot (Crowley)',
    description: 'Letras hebreas · Astrología · Árbol de la Vida',
    tier: 'full',
    backendSystem: 'thoth',
    swmV3Implemented: true,
    hasLocalDeckMapping: true,
  },
  {
    id: 'bota',
    label: 'B.O.T.A. Tarot',
    description: 'Estudio cabalístico estructurado (Paul Foster Case)',
    tier: 'full',
    backendSystem: 'bota',
    swmV3Implemented: true,
    hasLocalDeckMapping: true,
  },
  {
    id: 'golden-dawn',
    label: 'Golden Dawn Tarot',
    description: 'Sistema cabalístico hermético (Book T · correspondencias GD)',
    tier: 'full',
    backendSystem: 'golden-dawn',
    swmV3Implemented: true,
    hasLocalDeckMapping: true,
  },
  {
    id: 'hermetic',
    label: 'Hermetic Tarot',
    description: 'Simbolismo Godfrey Dowson · tradición Golden Dawn',
    tier: 'full',
    backendSystem: 'golden-dawn',
    swmV3Implemented: true,
    hasLocalDeckMapping: true,
  },
  {
    id: 'sephiroth',
    label: 'Tarot of the Sephiroth',
    description: 'Path working sefirótico · Árbol de la Vida',
    tier: 'full',
    backendSystem: 'bota',
    swmV3Implemented: true,
    hasLocalDeckMapping: true,
  },
];

const byId = new Map(TAROT_SYSTEMS_REGISTRY.map((e) => [e.id, e]));

export function getTarotSystemEntry(id: TarotSystemId | null | undefined): TarotSystemRegistryEntry | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export function isTarotSystemUsable(id: TarotSystemId | null | undefined): boolean {
  const entry = getTarotSystemEntry(id);
  return entry?.tier === 'full' || entry?.tier === 'educational';
}

export function tarotSystemStatusLabel(tier: TarotSystemTier): string {
  switch (tier) {
    case 'full':
      return 'IMPLEMENTADO (LECTURA EDUCATIVA + IA)';
    case 'educational':
      return 'EDUCATIVO LOCAL (MAPEO SIN SWM V3)';
    default:
      return 'SISTEMA SIMBÓLICO · EN PREPARACIÓN';
  }
}