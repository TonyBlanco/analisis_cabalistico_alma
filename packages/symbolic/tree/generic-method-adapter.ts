/**
 * Generic Method → TreeStructuralState Adapter
 * 
 * Adaptador genérico reutilizable para cualquier método simbólico
 * que siga la estructura PitagorasSymbolicState (primaryNumbers + inclusionMap).
 * 
 * REGLAS:
 * - NO interpretación textual
 * - NO diagnóstico
 * - Solo mapeo estructural: números → sefirot + flujos
 * - Determinista: mismo input → mismo TreeStructuralState
 */

import type {
  TreeStructuralState,
  TreeSefirah,
  TreeFlow,
  SefiraId,
  SefiraRole,
  FlowPolarity,
  FlowDirection,
} from './tree-structural-state.types';
import { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';
import { SEFIROT_TOPOLOGY, TREE_PATHS, VALID_SEFIRA_IDS } from './tree-topology';

const LATENT_BASELINE_ACTIVATION = 0.15;

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

function enrichSefirah(s: TreeSefirah): TreeSefirah {
  const topo = SEFIROT_TOPOLOGY[s.id];
  if (!topo) return s;
  return { ...s, pillar: topo.pillar, triad: topo.triad, olam: topo.olam };
}

function enrichFlow(f: TreeFlow): TreeFlow {
  for (const path of TREE_PATHS) {
    if (
      (path.from === f.from && path.to === f.to) ||
      (path.from === f.to   && path.to === f.from)
    ) {
      return { ...f, pathId: path.id };
    }
  }
  return f;
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

/**
 * Determinar rol de una Sefirá según su peso de activación
 */
function determineRole(activation: number): SefiraRole {
  if (activation >= 0.7) return 'dominant';
  if (activation >= 0.4) return 'present';
  return 'latent';
}

/**
 * Calcular intensidad de flujo entre dos números (0..1)
 */
function calculateFlowIntensity(fromWeight: number, toWeight: number): number {
  return (fromWeight + toWeight) / 2;
}

/**
 * Determinar polaridad de flujo según diferencia de pesos y posiciones
 */
function determineFlowPolarity(
  fromNum: number,
  toNum: number,
  fromWeight: number,
  toWeight: number
): FlowPolarity {
  const diff = Math.abs(fromWeight - toWeight);
  
  if (diff < 0.2) return 'harmonic';
  if (diff > 0.4 && fromNum < toNum) return 'tensional';
  if (diff >= 0.2 && diff <= 0.4) return 'integrative';
  
  return 'integrative';
}

/**
 * Determinar dirección de flujo entre Sefirot
 */
function determineFlowDirection(fromNum: number, toNum: number): FlowDirection {
  if (fromNum < toNum) return 'down';
  if (fromNum > toNum) return 'up';
  return 'lateral';
}

/**
 * Adaptar estado simbólico genérico a TreeStructuralState
 * 
 * @param symbolicState - Estado de cualquier método compatible
 * @returns TreeStructuralState v0.1
 */
export function adaptGenericMethodToTree(symbolicState: GenericSymbolicState): TreeStructuralState {
  const sefirotMap: Record<SefiraId, number> = {} as Record<SefiraId, number>;

  // 1. Mapear números principales a Sefirot
  symbolicState.primaryNumbers.forEach((num) => {
    const sefiraId = NUMBER_TO_SEFIRAH[num.value];
    if (!sefiraId) return;
    
    const currentActivation = sefirotMap[sefiraId] || 0;
    sefirotMap[sefiraId] = Math.max(currentActivation, num.weight);
  });

  // 2. Activar Sefirot según números dominantes en inclusión
  for (const numStr in symbolicState.inclusionMap) {
    if (!symbolicState.inclusionMap.hasOwnProperty(numStr)) continue;
    const data = symbolicState.inclusionMap[parseInt(numStr, 10)];
    const num = parseInt(numStr, 10);
    if (data.isDominant) {
      const sefiraId = NUMBER_TO_SEFIRAH[num];
      if (sefiraId) {
        const currentActivation = sefirotMap[sefiraId] || 0;
        sefirotMap[sefiraId] = Math.min(1.0, currentActivation + 0.3);
      }
    }
  }

  // 3. Activar Malchut si hay múltiples dominantes
  const dominantCount = symbolicState.primaryNumbers.filter((n) => n.weight >= 0.85).length;
  if (dominantCount >= 3) {
    const currentMalchut = sefirotMap['malchut'] || 0;
    sefirotMap['malchut'] = Math.max(currentMalchut, 0.75);
  }

  // 4. Construir las 10 Sefirot canónicas (inactivas = latent baseline)
  const sefirot: TreeSefirah[] = VALID_SEFIRA_IDS.map((id) => {
    const activation = sefirotMap[id] ?? LATENT_BASELINE_ACTIVATION;
    return {
      id,
      activation,
      role: determineRole(activation),
    };
  });

  // 5. Generar flujos entre Sefirot activas
  const flows: TreeFlow[] = [];
  const activeSefirot = symbolicState.primaryNumbers
    .filter((n) => n.weight >= 0.4)
    .sort((a, b) => b.weight - a.weight);

  for (let i = 0; i < activeSefirot.length - 1; i++) {
    const fromNum = activeSefirot[i];
    const toNum = activeSefirot[i + 1];
    
    const fromSefira = NUMBER_TO_SEFIRAH[fromNum.value];
    const toSefira = NUMBER_TO_SEFIRAH[toNum.value];
    
    if (!fromSefira || !toSefira) continue;

    flows.push({
      from: fromSefira,
      to: toSefira,
      polarity: determineFlowPolarity(fromNum.value, toNum.value, fromNum.weight, toNum.weight),
      intensity: calculateFlowIntensity(fromNum.weight, toNum.weight),
      direction: determineFlowDirection(fromNum.value, toNum.value),
    });
  }

  // 6. Si Malchut está activa, crear flujos hacia ella
  if (sefirotMap['malchut']) {
    const topSefirot = activeSefirot.slice(0, 2);
    topSefirot.forEach((num) => {
      const fromSefira = NUMBER_TO_SEFIRAH[num.value];
      if (fromSefira && fromSefira !== 'malchut') {
        flows.push({
          from: fromSefira,
          to: 'malchut',
          polarity: 'harmonic',
          intensity: num.weight * 0.8,
          direction: 'down',
        });
      }
    });
  }

  // 7. Enrich with v0.2 topology fields and return
  return {
    source: {
      method: symbolicState.methodId,
      mode: 'manual',
      timestamp: new Date().toISOString(),
    },
    sefirot: sefirot.map(enrichSefirah),
    flows: flows.map(enrichFlow),
    notes: {
      scope: 'symbolic-structural',
      disclaimer: TREE_STRUCTURAL_STATE_META.disclaimer,
    },
  };
}
