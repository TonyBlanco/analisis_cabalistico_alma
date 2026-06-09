/**
 * Traditional Jewish Kabbalah — correspondence tables.
 *
 * Static data: divine names, archangels, angelic choirs, soul levels.
 * DATA ONLY — no logic, no interpretation.
 * Keys use canonical SefiraId from tree-topology.ts.
 */
import { SEFIROT_TOPOLOGY } from '../tree/tree-topology';
export const TRADITIONAL_SEFIRAH_CORRESPONDENCES = {
    keter: {
        id: 'keter',
        divineNameHebrew: 'אהיה',
        divineNameTranslit: 'Eheieh',
        archangel: 'Metatron',
        angelicChoir: 'Chayot ha-Kodesh',
        olam: SEFIROT_TOPOLOGY.keter.olam,
    },
    chokmah: {
        id: 'chokmah',
        divineNameHebrew: 'יה',
        divineNameTranslit: 'Yah',
        archangel: 'Raziel',
        angelicChoir: 'Ophanim',
        olam: SEFIROT_TOPOLOGY.chokmah.olam,
    },
    binah: {
        id: 'binah',
        divineNameHebrew: 'יהוה אלהים',
        divineNameTranslit: 'YHVH Elohim',
        archangel: 'Tzaphkiel',
        angelicChoir: 'Aralim',
        olam: SEFIROT_TOPOLOGY.binah.olam,
    },
    chesed: {
        id: 'chesed',
        divineNameHebrew: 'אל',
        divineNameTranslit: 'El',
        archangel: 'Tzadkiel',
        angelicChoir: 'Chashmalim',
        olam: SEFIROT_TOPOLOGY.chesed.olam,
    },
    gevurah: {
        id: 'gevurah',
        divineNameHebrew: 'אלהים גבור',
        divineNameTranslit: 'Elohim Gibor',
        archangel: 'Khamael',
        angelicChoir: 'Seraphim',
        olam: SEFIROT_TOPOLOGY.gevurah.olam,
    },
    tiferet: {
        id: 'tiferet',
        divineNameHebrew: 'יהוה אלוה ודעת',
        divineNameTranslit: 'YHVH Eloah va-Daat',
        archangel: 'Raphael',
        angelicChoir: 'Malachim',
        olam: SEFIROT_TOPOLOGY.tiferet.olam,
    },
    netzach: {
        id: 'netzach',
        divineNameHebrew: 'יהוה צבאות',
        divineNameTranslit: 'YHVH Tzevaot',
        archangel: 'Haniel',
        angelicChoir: 'Elohim',
        olam: SEFIROT_TOPOLOGY.netzach.olam,
    },
    hod: {
        id: 'hod',
        divineNameHebrew: 'אלהים צבאות',
        divineNameTranslit: 'Elohim Tzevaot',
        archangel: 'Michael',
        angelicChoir: 'Bene Elohim',
        olam: SEFIROT_TOPOLOGY.hod.olam,
    },
    yesod: {
        id: 'yesod',
        divineNameHebrew: 'שדי אל חי',
        divineNameTranslit: 'Shaddai El Chai',
        archangel: 'Gabriel',
        angelicChoir: 'Kerubim',
        olam: SEFIROT_TOPOLOGY.yesod.olam,
    },
    malchut: {
        id: 'malchut',
        divineNameHebrew: 'אדני הארץ',
        divineNameTranslit: 'Adonai ha-Aretz',
        archangel: 'Sandalphon',
        angelicChoir: 'Ishim',
        olam: SEFIROT_TOPOLOGY.malchut.olam,
    },
};
/** Soul levels mapped by world (reference data, not per-Sefirah). */
export const SOUL_LEVELS = [
    { part: 'nefesh', olam: 'assiah', hebrew: 'נפש' },
    { part: 'ruach', olam: 'yetzirah', hebrew: 'רוח' },
    { part: 'neshamah', olam: 'beriah', hebrew: 'נשמה' },
    { part: 'chayah', olam: 'atziluth', hebrew: 'חיה' },
    { part: 'yechidah', olam: 'adam_kadmon', hebrew: 'יחידה' },
];
