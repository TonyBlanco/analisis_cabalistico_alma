/**
 * Shared activation + flow helpers for method → TreeStructuralState adapters.
 */

import type {
  TreeFlow,
  TreeSefirah,
  SefiraId,
  SefiraRole,
  FlowPolarity,
  FlowDirection,
} from './tree-structural-state.types';
import { SEFIROT_TOPOLOGY, TREE_PATHS, VALID_SEFIRA_IDS } from './tree-topology';

export const LATENT_BASELINE_ACTIVATION = 0.15;
const FLOW_ACTIVE_THRESHOLD = 0.35;

export function weightToActivation(weight: number): number {
  const clamped = Math.max(0, Math.min(1, weight));
  return LATENT_BASELINE_ACTIVATION + clamped * (1 - LATENT_BASELINE_ACTIVATION);
}

export function determineRole(activation: number): SefiraRole {
  if (activation >= 0.7) return 'dominant';
  if (activation >= 0.4) return 'present';
  return 'latent';
}

export function flowDirectionBetween(from: SefiraId, to: SefiraId): FlowDirection {
  const fromY = SEFIROT_TOPOLOGY[from]?.position.y ?? 0;
  const toY = SEFIROT_TOPOLOGY[to]?.position.y ?? 0;
  const delta = toY - fromY;
  if (Math.abs(delta) < 80) return 'lateral';
  return delta > 0 ? 'down' : 'up';
}

export function flowPolarityFromActivations(fromAct: number, toAct: number): FlowPolarity {
  const diff = Math.abs(fromAct - toAct);
  if (diff < 0.12) return 'harmonic';
  if (diff > 0.28) return 'tensional';
  return 'integrative';
}

export function buildSefirotArray(sefirotMap: Partial<Record<SefiraId, number>>): TreeSefirah[] {
  return VALID_SEFIRA_IDS.map((id) => {
    const activation = sefirotMap[id] ?? LATENT_BASELINE_ACTIVATION;
    return {
      id,
      activation: Math.round(activation * 1000) / 1000,
      role: determineRole(activation),
    };
  });
}

/** Connect canonical tree paths where both endpoints exceed the activation threshold. */
export function buildTopologyFlows(sefirot: TreeSefirah[]): TreeFlow[] {
  const activationById = Object.fromEntries(sefirot.map((s) => [s.id, s.activation])) as Record<
    SefiraId,
    number
  >;
  const flows: TreeFlow[] = [];

  for (const path of TREE_PATHS) {
    const fromAct = activationById[path.from] ?? 0;
    const toAct = activationById[path.to] ?? 0;
    if (fromAct < FLOW_ACTIVE_THRESHOLD || toAct < FLOW_ACTIVE_THRESHOLD) continue;

    flows.push({
      from: path.from,
      to: path.to,
      polarity: flowPolarityFromActivations(fromAct, toAct),
      intensity: Math.round(((fromAct + toAct) / 2) * 1000) / 1000,
      direction: flowDirectionBetween(path.from, path.to),
      pathId: path.id,
    });
  }

  return flows;
}

export interface InclusionEntry {
  frequency: number;
  isAbsent: boolean;
  isDominant: boolean;
}

export function applyInclusionToActivations(
  sefirotMap: Partial<Record<SefiraId, number>>,
  inclusionMap: Record<number, InclusionEntry>,
  numberToSefirah: Record<number, SefiraId>,
): void {
  for (const numStr of Object.keys(inclusionMap)) {
    const num = parseInt(numStr, 10);
    const data = inclusionMap[num];
    const sefiraId = numberToSefirah[num];
    if (!sefiraId || data.isAbsent) continue;

    const current = sefirotMap[sefiraId] ?? LATENT_BASELINE_ACTIVATION;

    if (data.isDominant) {
      const boost = 0.08 + Math.min(data.frequency, 4) * 0.05;
      sefirotMap[sefiraId] = Math.min(1, current + boost);
      continue;
    }

    if (data.frequency > 0) {
      const soft = LATENT_BASELINE_ACTIVATION + data.frequency * 0.04;
      sefirotMap[sefiraId] = Math.max(current, Math.min(0.55, soft));
    }
  }
}

export function applyMalchutManifestation(
  sefirotMap: Partial<Record<SefiraId, number>>,
  highWeightPrimaryCount: number,
): void {
  if (highWeightPrimaryCount < 3) return;

  const malchutActivation = Math.min(0.82, 0.48 + highWeightPrimaryCount * 0.07);
  sefirotMap.malchut = Math.max(sefirotMap.malchut ?? 0, malchutActivation);

  const yesodBridge = Math.min(1, (sefirotMap.malchut ?? 0) * 0.9);
  sefirotMap.yesod = Math.max(sefirotMap.yesod ?? 0, yesodBridge);
}