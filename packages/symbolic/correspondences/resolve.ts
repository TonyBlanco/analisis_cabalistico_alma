import { HEBREW_LETTERS } from '../cabala/letters';
import { TREE_PATHS } from '../cabala/paths';
import { ARCANOS_MAYORES } from '../tarot/arcanos';
import type {
  HebrewLetterId,
  ResolvedCorrespondence,
  TreePathId,
  SefirahId,
  SefirahCorrespondence,
  PathCorrespondence,
} from './types';
import {
  SEFIRAH_CORRESPONDENCES,
  PATH_CORRESPONDENCES,
} from './golden-dawn-data';

function buildResolved(letterId: HebrewLetterId): ResolvedCorrespondence | null {
  const letter = HEBREW_LETTERS.find((item) => item.id === letterId);
  const path = TREE_PATHS.find((item) => item.letterId === letterId);

  if (!letter || !path) {
    return null;
  }

  return {
    letter,
    path,
    sefirot: [path.from, path.to],
  };
}

export function resolveByLetter(letterId: HebrewLetterId): ResolvedCorrespondence | null {
  return buildResolved(letterId);
}

export function resolveByArcano(arcanoNumber: number): ResolvedCorrespondence | null {
  const arcano = ARCANOS_MAYORES.find((item) => item.number === arcanoNumber);

  if (!arcano) {
    return null;
  }

  return buildResolved(arcano.letterId);
}

export function resolveByPath(pathId: TreePathId): ResolvedCorrespondence | null {
  const path = TREE_PATHS.find((item) => item.id === pathId);

  if (!path) {
    return null;
  }

  return buildResolved(path.letterId);
}

export function resolveSefirahCorrespondences(id: SefirahId): SefirahCorrespondence | null {
  return SEFIRAH_CORRESPONDENCES[id] ?? null;
}

export function resolvePathCorrespondences(pathId: TreePathId): PathCorrespondence | null {
  return PATH_CORRESPONDENCES[pathId] ?? null;
}
