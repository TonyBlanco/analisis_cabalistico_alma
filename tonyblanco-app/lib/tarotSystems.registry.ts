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
  {
    id: 'marsella',
    label: 'Tarot de Marsella (simbólico)',
    description: 'Tradición francesa · iconografía histórica',
    tier: 'full',
    backendSystem: 'marseille',
    swmV3Implemented: true,
    hasLocalDeckMapping: false,
  },
  {
    id: 'rider-waite',
    label: 'Rider–Waite (simbólico)',
    description: 'Waite–Smith · arquetipos occidentales clásicos',
    tier: 'full',
    backendSystem: 'rider-waite',
    swmV3Implemented: true,
    hasLocalDeckMapping: false,
  },
  {
    id: 'rota',
    label: 'R.O.T.A. (tarot hermético)',
    description: 'Rosacruz · correspondencias GD e iniciación',
    tier: 'full',
    backendSystem: 'golden-dawn',
    swmV3Implemented: true,
    hasLocalDeckMapping: false,
  },
  {
    id: 'tarot-cabalistico',
    label: 'Tarot cabalístico (Árbol de la Vida)',
    description: 'Path working · correspondencias sefiróticas',
    tier: 'full',
    backendSystem: 'bota',
    swmV3Implemented: true,
    hasLocalDeckMapping: false,
  },
  {
    id: 'oracle-symbolic',
    label: 'Oráculo simbólico genérico',
    description: 'Arquetipos universales · sin sistema hermético fijo',
    tier: 'full',
    backendSystem: 'rider-waite',
    swmV3Implemented: true,
    hasLocalDeckMapping: false,
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

/** Sistemas activos en sidebar + Tirada Libre / Árbol */
export function getActiveTarotSystems(): TarotSystemRegistryEntry[] {
  return TAROT_SYSTEMS_REGISTRY.filter((e) => e.tier === 'full' || e.tier === 'educational');
}

export function normalizeTarotSystemId(id: TarotSystemId | null | undefined): TarotSystemId {
  if (id && getTarotSystemEntry(id)) {
    return id;
  }
  return 'thoth';
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