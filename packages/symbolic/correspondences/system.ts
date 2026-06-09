/**
 * Correspondence system selector — Hermetic vs Traditional Jewish.
 *
 * Aditive facade over existing resolvers. No behavior change to Golden Dawn APIs.
 */

import type { SefiraId } from '../tree/tree-structural-state.types';
import type { TraditionalSefirahData } from '../kabbalah-traditional/traditional-correspondences.types';
import type { SeferYetzirahLetter } from '../kabbalah-traditional/sefer-yetzirah';
import {
  resolveTraditionalSefirah,
  resolveTraditionalPath,
} from '../kabbalah-traditional/resolve';
import {
  resolveSefirahCorrespondences,
  resolvePathCorrespondences,
} from './resolve';
import type { PathCorrespondence, SefirahCorrespondence, TopologyPathId } from './types';

export type SystemId = 'hermetic-golden-dawn' | 'jewish-traditional';

export interface CorrespondenceSystem<TSefirah, TPath> {
  readonly id: SystemId;
  sefirah(id: SefiraId): TSefirah | null;
  path(pathId: string): TPath | null;
}

export const HERMETIC_GOLDEN_DAWN_SYSTEM: CorrespondenceSystem<
  SefirahCorrespondence,
  PathCorrespondence
> = {
  id: 'hermetic-golden-dawn',
  sefirah: resolveSefirahCorrespondences,
  path: (pathId: string) =>
    resolvePathCorrespondences(pathId as TopologyPathId),
};

export const JEWISH_TRADITIONAL_SYSTEM: CorrespondenceSystem<
  TraditionalSefirahData,
  SeferYetzirahLetter
> = {
  id: 'jewish-traditional',
  sefirah: resolveTraditionalSefirah,
  path: resolveTraditionalPath,
};

export function getCorrespondenceSystem(
  id: 'hermetic-golden-dawn',
): CorrespondenceSystem<SefirahCorrespondence, PathCorrespondence>;
export function getCorrespondenceSystem(
  id: 'jewish-traditional',
): CorrespondenceSystem<TraditionalSefirahData, SeferYetzirahLetter>;
export function getCorrespondenceSystem(
  id: SystemId,
): CorrespondenceSystem<
  SefirahCorrespondence | TraditionalSefirahData,
  PathCorrespondence | SeferYetzirahLetter
> {
  switch (id) {
    case 'hermetic-golden-dawn':
      return HERMETIC_GOLDEN_DAWN_SYSTEM;
    case 'jewish-traditional':
      return JEWISH_TRADITIONAL_SYSTEM;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export const CORRESPONDENCE_SYSTEM_IDS: readonly SystemId[] = [
  'hermetic-golden-dawn',
  'jewish-traditional',
] as const;