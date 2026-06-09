/**
 * Build read-only correspondence tables for API v1.
 */
import { CORRESPONDENCE_SYSTEM_IDS, getCorrespondenceSystem, } from '../correspondences/system';
import { TREE_PATHS, VALID_SEFIRA_IDS } from '../tree/tree-topology';
export function isValidSystemId(value) {
    return CORRESPONDENCE_SYSTEM_IDS.includes(value);
}
function resolveSefirahData(systemId, id) {
    if (systemId === 'jewish-traditional') {
        return getCorrespondenceSystem('jewish-traditional').sefirah(id);
    }
    return getCorrespondenceSystem('hermetic-golden-dawn').sefirah(id);
}
function resolvePathData(systemId, pathId) {
    if (systemId === 'jewish-traditional') {
        return getCorrespondenceSystem('jewish-traditional').path(pathId);
    }
    return getCorrespondenceSystem('hermetic-golden-dawn').path(pathId);
}
export function buildCorrespondencesResponse(systemId) {
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
