import { HEBREW_LETTERS } from '../cabala/letters';
import { ARCANOS_MAYORES } from '../tarot/arcanos';
import { TREE_PATHS as TOPOLOGY_PATHS } from '../tree/tree-topology';
import { SEFIRAH_CORRESPONDENCES, PATH_CORRESPONDENCES, } from './golden-dawn-data';
// Maps canonical SefiraId (keter/malchut) → legacy SefirahId (kether/malkuth).
// Used only for the backward-compat ResolvedCorrespondence return type.
const SEFIRA_TO_SEFIRAH = {
    keter: 'kether',
    chokmah: 'chokmah',
    binah: 'binah',
    chesed: 'chesed',
    gevurah: 'gevurah',
    tiferet: 'tiferet',
    netzach: 'netzach',
    hod: 'hod',
    yesod: 'yesod',
    malchut: 'malkuth',
};
function buildResolved(letterId) {
    const letter = HEBREW_LETTERS.find((l) => l.id === letterId);
    if (!letter)
        return null;
    const pathCorr = Object.values(PATH_CORRESPONDENCES).find((p) => p.letterId === letterId);
    if (!pathCorr)
        return null;
    const topoPath = TOPOLOGY_PATHS.find((p) => p.id === pathCorr.id);
    if (!topoPath)
        return null;
    const fromId = SEFIRA_TO_SEFIRAH[topoPath.from];
    const toId = SEFIRA_TO_SEFIRAH[topoPath.to];
    return {
        letter,
        path: {
            id: `${fromId}-${toId}`,
            from: fromId,
            to: toId,
            letterId,
        },
        sefirot: [fromId, toId],
    };
}
export function resolveByLetter(letterId) {
    return buildResolved(letterId);
}
export function resolveByArcano(arcanoNumber) {
    const arcano = ARCANOS_MAYORES.find((item) => item.number === arcanoNumber);
    if (!arcano)
        return null;
    return buildResolved(arcano.letterId);
}
export function resolveByPath(pathId) {
    // Convert legacy kether-*/malkuth ids to canonical keter-*/malchut ids
    const topologyId = pathId.replace('kether', 'keter').replace('malkuth', 'malchut');
    const pathCorr = PATH_CORRESPONDENCES[topologyId];
    if (!pathCorr)
        return null;
    return buildResolved(pathCorr.letterId);
}
export function resolveSefirahCorrespondences(id) {
    return SEFIRAH_CORRESPONDENCES[id] ?? null;
}
export function resolvePathCorrespondences(pathId) {
    return PATH_CORRESPONDENCES[pathId] ?? null;
}
