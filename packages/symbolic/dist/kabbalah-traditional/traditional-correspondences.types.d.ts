/**
 * Traditional Jewish Kabbalah — correspondence types.
 * DATA ONLY — keyed by canonical SefiraId from tree-topology.
 */
import type { OlamId } from '../tree/tree-topology';
import type { SefiraId } from '../tree/tree-structural-state.types';
export type SoulPart = 'nefesh' | 'ruach' | 'neshamah' | 'chayah' | 'yechidah';
export type SoulOlam = OlamId | 'adam_kadmon';
export interface TraditionalSefirahData {
    id: SefiraId;
    divineNameHebrew: string;
    divineNameTranslit: string;
    archangel: string;
    angelicChoir: string;
    olam: OlamId;
}
export interface SoulLevelData {
    part: SoulPart;
    olam: SoulOlam;
    hebrew: string;
}
//# sourceMappingURL=traditional-correspondences.types.d.ts.map