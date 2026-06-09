/**
 * Tree Topology — Canonical Structure of the Tree of Life
 *
 * Single source of truth for the FIXED structure of the Tree:
 * 10 Sefirot, 22 paths, pillars, triads, worlds (Golden Dawn system).
 *
 * DATA ONLY — no logic, no interpretation.
 * Invariants (enforced by tests):
 *   Object.keys(SEFIROT_TOPOLOGY).length === 10
 *   TREE_PATHS.length === 22
 */
/**
 * Canonical attributes of each Sefira (Golden Dawn).
 *
 * Pillars:
 *   mercy      = right column: Chokmah, Chesed, Netzach
 *   severity   = left column:  Binah, Gevurah, Hod
 *   equilibrium = middle column: Keter, Tiferet, Yesod, Malchut
 *
 * Worlds (Olamot):
 *   atziluth = Keter
 *   beriah   = Chokmah, Binah
 *   yetzirah = Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod
 *   assiah   = Malchut
 *
 * Position: canonical layout units (x: 0–600, y: 0–800).
 */
export const SEFIROT_TOPOLOGY = {
    keter: { pillar: 'equilibrium', triad: 'supernal', olam: 'atziluth', position: { x: 300, y: 30 } },
    chokmah: { pillar: 'mercy', triad: 'supernal', olam: 'beriah', position: { x: 500, y: 120 } },
    binah: { pillar: 'severity', triad: 'supernal', olam: 'beriah', position: { x: 100, y: 120 } },
    chesed: { pillar: 'mercy', triad: 'ethical', olam: 'yetzirah', position: { x: 500, y: 280 } },
    gevurah: { pillar: 'severity', triad: 'ethical', olam: 'yetzirah', position: { x: 100, y: 280 } },
    tiferet: { pillar: 'equilibrium', triad: 'ethical', olam: 'yetzirah', position: { x: 300, y: 380 } },
    netzach: { pillar: 'mercy', triad: 'astral', olam: 'yetzirah', position: { x: 500, y: 500 } },
    hod: { pillar: 'severity', triad: 'astral', olam: 'yetzirah', position: { x: 100, y: 500 } },
    yesod: { pillar: 'equilibrium', triad: 'astral', olam: 'yetzirah', position: { x: 300, y: 600 } },
    malchut: { pillar: 'equilibrium', triad: 'receptacle', olam: 'assiah', position: { x: 300, y: 750 } },
};
/**
 * The 22 canonical paths of the Tree of Life (Golden Dawn).
 * Numbered 11–32 following the Sepher Yetzirah / Golden Dawn tradition.
 * hebrewLetter: Unicode Hebrew character associated with each path.
 */
export const TREE_PATHS = [
    { id: 'keter-chokmah', from: 'keter', to: 'chokmah', hebrewLetter: 'א', pathNumber: 11 },
    { id: 'keter-binah', from: 'keter', to: 'binah', hebrewLetter: 'ב', pathNumber: 12 },
    { id: 'keter-tiferet', from: 'keter', to: 'tiferet', hebrewLetter: 'ג', pathNumber: 13 },
    { id: 'chokmah-binah', from: 'chokmah', to: 'binah', hebrewLetter: 'ד', pathNumber: 14 },
    { id: 'chokmah-tiferet', from: 'chokmah', to: 'tiferet', hebrewLetter: 'ה', pathNumber: 15 },
    { id: 'chokmah-chesed', from: 'chokmah', to: 'chesed', hebrewLetter: 'ו', pathNumber: 16 },
    { id: 'binah-tiferet', from: 'binah', to: 'tiferet', hebrewLetter: 'ז', pathNumber: 17 },
    { id: 'binah-gevurah', from: 'binah', to: 'gevurah', hebrewLetter: 'ח', pathNumber: 18 },
    { id: 'chesed-gevurah', from: 'chesed', to: 'gevurah', hebrewLetter: 'ט', pathNumber: 19 },
    { id: 'chesed-tiferet', from: 'chesed', to: 'tiferet', hebrewLetter: 'י', pathNumber: 20 },
    { id: 'chesed-netzach', from: 'chesed', to: 'netzach', hebrewLetter: 'כ', pathNumber: 21 },
    { id: 'gevurah-tiferet', from: 'gevurah', to: 'tiferet', hebrewLetter: 'ל', pathNumber: 22 },
    { id: 'gevurah-hod', from: 'gevurah', to: 'hod', hebrewLetter: 'מ', pathNumber: 23 },
    { id: 'tiferet-netzach', from: 'tiferet', to: 'netzach', hebrewLetter: 'נ', pathNumber: 24 },
    { id: 'tiferet-yesod', from: 'tiferet', to: 'yesod', hebrewLetter: 'ס', pathNumber: 25 },
    { id: 'tiferet-hod', from: 'tiferet', to: 'hod', hebrewLetter: 'ע', pathNumber: 26 },
    { id: 'netzach-hod', from: 'netzach', to: 'hod', hebrewLetter: 'פ', pathNumber: 27 },
    { id: 'netzach-yesod', from: 'netzach', to: 'yesod', hebrewLetter: 'צ', pathNumber: 28 },
    { id: 'netzach-malchut', from: 'netzach', to: 'malchut', hebrewLetter: 'ק', pathNumber: 29 },
    { id: 'hod-yesod', from: 'hod', to: 'yesod', hebrewLetter: 'ר', pathNumber: 30 },
    { id: 'hod-malchut', from: 'hod', to: 'malchut', hebrewLetter: 'ש', pathNumber: 31 },
    { id: 'yesod-malchut', from: 'yesod', to: 'malchut', hebrewLetter: 'ת', pathNumber: 32 },
];
export const VALID_SEFIRA_IDS = [
    'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
    'tiferet', 'netzach', 'hod', 'yesod', 'malchut',
];
