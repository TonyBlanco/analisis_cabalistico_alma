export type TarotMinorSuit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotMinorRank =
  | 'ace'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';

export interface TarotMinorCard {
  suit: TarotMinorSuit;
  rank: TarotMinorRank;
  name: string;
}

export const TAROT_MINOR_SUITS: TarotMinorSuit[] = [
  'wands',
  'cups',
  'swords',
  'pentacles',
];

export const TAROT_MINOR_RANKS: TarotMinorRank[] = [
  'ace',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'page',
  'knight',
  'queen',
  'king',
];

export const TAROT_MINORS: TarotMinorCard[] = [];
