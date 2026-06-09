/**
 * Traditional Jewish Kabbalah — read-only resolver API.
 *
 * Single access point for traditional correspondences.
 * Deterministic, pure, no side effects.
 */
import { TRADITIONAL_SEFIRAH_CORRESPONDENCES, SOUL_LEVELS, } from './traditional-correspondences.data';
import { SEFER_YETZIRAH_BY_PATH } from './sefer-yetzirah';
import { lookupPartzufForSefira } from './lurianic';
export function resolveTraditionalSefirah(id) {
    return TRADITIONAL_SEFIRAH_CORRESPONDENCES[id] ?? null;
}
export function resolveTraditionalPath(pathId) {
    if (!(pathId in SEFER_YETZIRAH_BY_PATH)) {
        return null;
    }
    return SEFER_YETZIRAH_BY_PATH[pathId];
}
export function resolvePartzuf(id) {
    if (!(id in TRADITIONAL_SEFIRAH_CORRESPONDENCES)) {
        return null;
    }
    return lookupPartzufForSefira(id);
}
export function resolveSoulLevels() {
    return SOUL_LEVELS;
}
