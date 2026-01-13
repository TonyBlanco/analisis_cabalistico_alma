export type BotaConsciousness = {
    power: string | null;
    aspect: string | null;
    humanFaculty: string | null;
};
export type BotaIdentity = {
    id: string;
    nameSpanish: string | null;
    hebrewLetter: string | null;
    letterValue: number | null;
    path: number | null;
    sefirot: string[] | null;
    cabalisticIntelligence: string | null;
    consciousness: BotaConsciousness | null;
    element: string | null;
    astrology: unknown | null;
};
export type BotaCardLike = {
    id?: string | null;
    slug?: string | null;
    code?: string | null;
    name?: string | null;
    nameSpanish?: string | null;
    imageUrl?: string | null;
    asset_path?: string | null;
    symbols?: any;
};
export declare function resolveBotaIdentity(card: BotaCardLike): BotaIdentity | null;
//# sourceMappingURL=botaIdentityResolver.d.ts.map