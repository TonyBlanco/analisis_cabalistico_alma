/**
 * Correspondence system selector — Hermetic vs Traditional Jewish.
 *
 * Aditive facade over existing resolvers. No behavior change to Golden Dawn APIs.
 */
import { resolveTraditionalSefirah, resolveTraditionalPath, } from '../kabbalah-traditional/resolve';
import { resolveSefirahCorrespondences, resolvePathCorrespondences, } from './resolve';
export const HERMETIC_GOLDEN_DAWN_SYSTEM = {
    id: 'hermetic-golden-dawn',
    sefirah: resolveSefirahCorrespondences,
    path: (pathId) => resolvePathCorrespondences(pathId),
};
export const JEWISH_TRADITIONAL_SYSTEM = {
    id: 'jewish-traditional',
    sefirah: resolveTraditionalSefirah,
    path: resolveTraditionalPath,
};
export function getCorrespondenceSystem(id) {
    switch (id) {
        case 'hermetic-golden-dawn':
            return HERMETIC_GOLDEN_DAWN_SYSTEM;
        case 'jewish-traditional':
            return JEWISH_TRADITIONAL_SYSTEM;
        default: {
            const _exhaustive = id;
            return _exhaustive;
        }
    }
}
export const CORRESPONDENCE_SYSTEM_IDS = [
    'hermetic-golden-dawn',
    'jewish-traditional',
];
