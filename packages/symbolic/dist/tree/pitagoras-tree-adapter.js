/**
 * Pitagoras → TreeStructuralState Adapter
 */
import { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';
import { SEFIROT_TOPOLOGY } from './tree-topology';
import { applyInclusionToActivations, applyMalchutManifestation, buildSefirotArray, buildTopologyFlows, weightToActivation, } from './adapter-utils';
const NUMBER_TO_SEFIRAH = {
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
function enrichSefirah(s) {
    const topo = SEFIROT_TOPOLOGY[s.id];
    if (!topo)
        return s;
    return { ...s, pillar: topo.pillar, triad: topo.triad, olam: topo.olam };
}
export function adaptPitagorasToTree(pitagorasState) {
    const sefirotMap = {};
    pitagorasState.primaryNumbers.forEach((num) => {
        const sefiraId = NUMBER_TO_SEFIRAH[num.value];
        if (!sefiraId)
            return;
        const activation = weightToActivation(num.weight);
        const currentActivation = sefirotMap[sefiraId] ?? 0;
        sefirotMap[sefiraId] = Math.max(currentActivation, activation);
    });
    applyInclusionToActivations(sefirotMap, pitagorasState.inclusionMap, NUMBER_TO_SEFIRAH);
    const highWeightPrimaryCount = pitagorasState.primaryNumbers.filter((n) => n.weight >= 0.85).length;
    applyMalchutManifestation(sefirotMap, highWeightPrimaryCount);
    const sefirot = buildSefirotArray(sefirotMap);
    const flows = buildTopologyFlows(sefirot);
    return {
        source: {
            method: 'pitagoras',
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
