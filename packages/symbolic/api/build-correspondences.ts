/**
 * Build read-only correspondence tables for API v1.
 */

import {
  CORRESPONDENCE_SYSTEM_IDS,
  getCorrespondenceSystem,
  type SystemId,
} from '../correspondences/system';
import { TREE_PATHS, VALID_SEFIRA_IDS } from '../tree/tree-topology';
import type { CorrespondencesResponseV1 } from './dto';

export function isValidSystemId(value: string): value is SystemId {
  return (CORRESPONDENCE_SYSTEM_IDS as readonly string[]).includes(value);
}

function resolveSefirahData(systemId: SystemId, id: (typeof VALID_SEFIRA_IDS)[number]) {
  if (systemId === 'jewish-traditional') {
    return getCorrespondenceSystem('jewish-traditional').sefirah(id)!;
  }
  return getCorrespondenceSystem('hermetic-golden-dawn').sefirah(id)!;
}

function resolvePathData(systemId: SystemId, pathId: string) {
  if (systemId === 'jewish-traditional') {
    return getCorrespondenceSystem('jewish-traditional').path(pathId)!;
  }
  return getCorrespondenceSystem('hermetic-golden-dawn').path(pathId)!;
}

export function buildCorrespondencesResponse(
  systemId: SystemId,
): CorrespondencesResponseV1 {
  return {
    systemId,
    sefirot: VALID_SEFIRA_IDS.map((id) => ({
      id,
      data: resolveSefirahData(systemId, id),
    })),
    paths: TREE_PATHS.map((path) => ({
      id: path.id,
      data: resolvePathData(systemId, path.id),
    })),
  };
}