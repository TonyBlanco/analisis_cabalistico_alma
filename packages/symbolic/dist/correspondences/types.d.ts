export type SefirahId = 'kether' | 'chokmah' | 'binah' | 'chesed' | 'gevurah' | 'tiferet' | 'netzach' | 'hod' | 'yesod' | 'malkuth';
export type HebrewLetterId = 'aleph' | 'beth' | 'gimel' | 'daleth' | 'heh' | 'vav' | 'zayin' | 'cheth' | 'teth' | 'yod' | 'kaph' | 'lamed' | 'mem' | 'nun' | 'samekh' | 'ayin' | 'pe' | 'tzaddi' | 'qoph' | 'resh' | 'shin' | 'tav';
export type TreePathId = 'kether-chokmah' | 'kether-binah' | 'kether-tiferet' | 'chokmah-binah' | 'chokmah-tiferet' | 'chokmah-chesed' | 'binah-tiferet' | 'binah-gevurah' | 'chesed-gevurah' | 'chesed-tiferet' | 'chesed-netzach' | 'gevurah-tiferet' | 'gevurah-hod' | 'tiferet-netzach' | 'tiferet-yesod' | 'tiferet-hod' | 'netzach-hod' | 'netzach-yesod' | 'netzach-malkuth' | 'hod-yesod' | 'hod-malkuth' | 'yesod-malkuth';
export interface HebrewLetter {
    id: HebrewLetterId;
    name: string;
    transliteration: string;
    gematria: number;
}
export interface TreePath {
    id: TreePathId;
    from: SefirahId;
    to: SefirahId;
    letterId: HebrewLetterId;
}
export interface ArcanoMajor {
    number: number;
    name: string;
    letterId: HebrewLetterId;
}
export interface ResolvedCorrespondence {
    letter: HebrewLetter;
    path: TreePath;
    sefirot: [SefirahId, SefirahId];
}
//# sourceMappingURL=types.d.ts.map