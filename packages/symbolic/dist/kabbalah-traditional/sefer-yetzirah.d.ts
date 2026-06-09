/**
 * Sefer Yetzirah — letter classification for the 22 canonical paths.
 *
 * Derives from TREE_PATHS (same Hebrew letters). DATA ONLY.
 * 3 mothers + 7 doubles + 12 simples = 22.
 */
import type { TopologyPathId } from '../correspondences/types';
export type LetterClass = 'mother' | 'double' | 'simple';
export interface SeferYetzirahLetter {
    pathId: TopologyPathId;
    hebrewLetter: string;
    letterClass: LetterClass;
    /** mother→element, double→planet, simple→zodiac sign (neutral reference). */
    attribution: string;
}
export declare const SEFER_YETZIRAH_BY_PATH: Record<TopologyPathId, SeferYetzirahLetter>;
//# sourceMappingURL=sefer-yetzirah.d.ts.map