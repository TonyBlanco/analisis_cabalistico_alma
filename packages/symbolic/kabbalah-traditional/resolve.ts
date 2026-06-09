/**
 * Traditional Jewish Kabbalah — read-only resolver API.
 *
 * Single access point for traditional correspondences.
 * Deterministic, pure, no side effects.
 */

import type { SefiraId } from '../tree/tree-structural-state.types';
import type { TopologyPathId } from '../correspondences/types';
import {
  TRADITIONAL_SEFIRAH_CORRESPONDENCES,
  SOUL_LEVELS,
} from './traditional-correspondences.data';
import type {
  SoulLevelData,
  TraditionalSefirahData,
} from './traditional-correspondences.types';
import { SEFER_YETZIRAH_BY_PATH, type SeferYetzirahLetter } from './sefer-yetzirah';
import { lookupPartzufForSefira, type PartzufId } from './lurianic';

export function resolveTraditionalSefirah(id: SefiraId): TraditionalSefirahData | null {
  return TRADITIONAL_SEFIRAH_CORRESPONDENCES[id] ?? null;
}

export function resolveTraditionalPath(pathId: string): SeferYetzirahLetter | null {
  if (!(pathId in SEFER_YETZIRAH_BY_PATH)) {
    return null;
  }
  return SEFER_YETZIRAH_BY_PATH[pathId as TopologyPathId];
}

export function resolvePartzuf(id: SefiraId): PartzufId | null {
  if (!(id in TRADITIONAL_SEFIRAH_CORRESPONDENCES)) {
    return null;
  }
  return lookupPartzufForSefira(id);
}

export function resolveSoulLevels(): readonly SoulLevelData[] {
  return SOUL_LEVELS;
}