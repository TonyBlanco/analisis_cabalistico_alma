/**
 * Generic Method → TreeStructuralState Adapter
 *
 * Adaptador genérico reutilizable para cualquier método simbólico
 * que siga la estructura PitagorasSymbolicState (primaryNumbers + inclusionMap).
 */

import type {
  TreeStructuralState,
  TreeSefirah,
  SefiraId,
} from './tree-structural-state.types';
import { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';
import { SEFIROT_TOPOLOGY } from './tree-topology';
import {
  applyInclusionToActivations,
  applyMalchutManifestation,
  buildSefirotArray,
  buildTopologyFlows,
  weightToActivation,
} from './adapter-utils';

/**
 * Interface genérica para métodos simbólicos compatibles
 * (cualquier método con primaryNumbers e inclusionMap)
 */
export interface GenericSymbolicState {
  methodId: string;
  methodName: string;
  primaryNumbers: Array<{
    key: string;
    label: string;
    value: number;
    weight: number; // 0-1
  }>;
  inclusionMap: Record<number, {
    frequency: number;
    isAbsent: boolean;
    isDominant: boolean;
  }>;
}

const NUMBER_TO_SEFIRAH: Record<number, SefiraId> = {
  1: 'keter',
  2: 'chokmah',
  3: 'binah',
  4: 'chesed',
  5: 'gevurah',
  6: 'tiferet',
  7: 'netzach',
  8: 'hod',
  9: 'yesod',
};

function enrichSefirah(s: TreeSefirah): TreeSefirah {
  const topo = SEFIROT_TOPOLOGY[s.id];
  if (!topo) return s;
  return { ...s, pillar: topo.pillar, triad: topo.triad, olam: topo.olam };
}

/**
 * Adaptar estado simbólico genérico a TreeStructuralState
 */
export function adaptGenericMethodToTree(symbolicState: GenericSymbolicState): TreeStructuralState {
  const sefirotMap: Partial<Record<SefiraId, number>> = {};

  symbolicState.primaryNumbers.forEach((num) => {
    const sefiraId = NUMBER_TO_SEFIRAH[num.value];
    if (!sefiraId) return;

    const activation = weightToActivation(num.weight);
    const currentActivation = sefirotMap[sefiraId] ?? 0;
    sefirotMap[sefiraId] = Math.max(currentActivation, activation);
  });

  applyInclusionToActivations(sefirotMap, symbolicState.inclusionMap, NUMBER_TO_SEFIRAH);

  const highWeightPrimaryCount = symbolicState.primaryNumbers.filter((n) => n.weight >= 0.85).length;
  applyMalchutManifestation(sefirotMap, highWeightPrimaryCount);

  const sefirot = buildSefirotArray(sefirotMap);
  const flows = buildTopologyFlows(sefirot);

  return {
    source: {
      method: symbolicState.methodId,
      mode: 'manual',
      timestamp: new Date().toISOString(),
    },
    sefirot: sefirot.map(enrichSefirah),
    flows,
    notes: {
      scope: 'symbolic-structural',
      disclaimer: TREE_STRUCTURAL_STATE_META.disclaimer,
    },
  };
}