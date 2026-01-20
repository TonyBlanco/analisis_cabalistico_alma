export type TarotMinorSuit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotMinorRank = 'ace' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'page' | 'knight' | 'queen' | 'king';
export interface TarotMinorCard {
    suit: TarotMinorSuit;
    rank: TarotMinorRank;
    name: string;
}
export declare const TAROT_MINOR_SUITS: TarotMinorSuit[];
export declare const TAROT_MINOR_RANKS: TarotMinorRank[];
export declare const TAROT_MINORS: TarotMinorCard[];
//# sourceMappingURL=minors.d.ts.map