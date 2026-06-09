/**
 * Golden Dawn Correspondence Tables
 *
 * Static data for the Hermetic/Golden Dawn system.
 * DATA ONLY — no logic, no interpretation.
 * Source: Regardie "The Golden Dawn", Liber 777, Sepher Yetzirah (GD recension).
 *
 * Keys use canonical SefiraId / TopologyPathId (keter/malchut spelling).
 */

import type { SefiraId } from '../tree/tree-structural-state.types';
import type {
  SefirahCorrespondence,
  PathCorrespondence,
  TopologyPathId,
} from './types';

export const SEFIRAH_CORRESPONDENCES: Record<SefiraId, SefirahCorrespondence> = {
  keter:   { id: 'keter',   planet: 'primum_mobile', element: 'spirit', kingScaleColor: 'brilliantWhite',         tarotArcanaNumbers: [] },
  chokmah: { id: 'chokmah', planet: 'zodiac',         element: null,     kingScaleColor: 'softBlue',               tarotArcanaNumbers: [] },
  binah:   { id: 'binah',   planet: 'saturn',         element: null,     kingScaleColor: 'crimson',                tarotArcanaNumbers: [] },
  chesed:  { id: 'chesed',  planet: 'jupiter',        element: null,     kingScaleColor: 'deepViolet',             tarotArcanaNumbers: [] },
  gevurah: { id: 'gevurah', planet: 'mars',           element: null,     kingScaleColor: 'orange',                 tarotArcanaNumbers: [] },
  tiferet: { id: 'tiferet', planet: 'sun',            element: null,     kingScaleColor: 'clearPinkRose',          tarotArcanaNumbers: [] },
  netzach: { id: 'netzach', planet: 'venus',          element: null,     kingScaleColor: 'amber',                  tarotArcanaNumbers: [] },
  hod:     { id: 'hod',     planet: 'mercury',        element: null,     kingScaleColor: 'violetPurple',           tarotArcanaNumbers: [] },
  yesod:   { id: 'yesod',   planet: 'moon',           element: null,     kingScaleColor: 'indigo',                 tarotArcanaNumbers: [] },
  malchut: { id: 'malchut', planet: 'earth',          element: 'earth',  kingScaleColor: 'yellowOliveRussetBlack', tarotArcanaNumbers: [] },
};

export const PATH_CORRESPONDENCES: Record<TopologyPathId, PathCorrespondence> = {
  'keter-chokmah':   { id: 'keter-chokmah',   letterId: 'aleph',  hebrewLetter: 'א', pathNumber: 11, tarotArcanum: 0,  planet: null,      element: 'air',   zodiacSign: null          },
  'keter-binah':     { id: 'keter-binah',     letterId: 'beth',   hebrewLetter: 'ב', pathNumber: 12, tarotArcanum: 1,  planet: 'mercury', element: null,    zodiacSign: null          },
  'keter-tiferet':   { id: 'keter-tiferet',   letterId: 'gimel',  hebrewLetter: 'ג', pathNumber: 13, tarotArcanum: 2,  planet: 'moon',    element: null,    zodiacSign: null          },
  'chokmah-binah':   { id: 'chokmah-binah',   letterId: 'daleth', hebrewLetter: 'ד', pathNumber: 14, tarotArcanum: 3,  planet: 'venus',   element: null,    zodiacSign: null          },
  'chokmah-tiferet': { id: 'chokmah-tiferet', letterId: 'heh',    hebrewLetter: 'ה', pathNumber: 15, tarotArcanum: 4,  planet: null,      element: null,    zodiacSign: 'aries'       },
  'chokmah-chesed':  { id: 'chokmah-chesed',  letterId: 'vav',    hebrewLetter: 'ו', pathNumber: 16, tarotArcanum: 5,  planet: null,      element: null,    zodiacSign: 'taurus'      },
  'binah-tiferet':   { id: 'binah-tiferet',   letterId: 'zayin',  hebrewLetter: 'ז', pathNumber: 17, tarotArcanum: 6,  planet: null,      element: null,    zodiacSign: 'gemini'      },
  'binah-gevurah':   { id: 'binah-gevurah',   letterId: 'cheth',  hebrewLetter: 'ח', pathNumber: 18, tarotArcanum: 7,  planet: null,      element: null,    zodiacSign: 'cancer'      },
  'chesed-gevurah':  { id: 'chesed-gevurah',  letterId: 'teth',   hebrewLetter: 'ט', pathNumber: 19, tarotArcanum: 8,  planet: null,      element: null,    zodiacSign: 'leo'         },
  'chesed-tiferet':  { id: 'chesed-tiferet',  letterId: 'yod',    hebrewLetter: 'י', pathNumber: 20, tarotArcanum: 9,  planet: null,      element: null,    zodiacSign: 'virgo'       },
  'chesed-netzach':  { id: 'chesed-netzach',  letterId: 'kaph',   hebrewLetter: 'כ', pathNumber: 21, tarotArcanum: 10, planet: 'jupiter', element: null,    zodiacSign: null          },
  'gevurah-tiferet': { id: 'gevurah-tiferet', letterId: 'lamed',  hebrewLetter: 'ל', pathNumber: 22, tarotArcanum: 11, planet: null,      element: null,    zodiacSign: 'libra'       },
  'gevurah-hod':     { id: 'gevurah-hod',     letterId: 'mem',    hebrewLetter: 'מ', pathNumber: 23, tarotArcanum: 12, planet: null,      element: 'water', zodiacSign: null          },
  'tiferet-netzach': { id: 'tiferet-netzach', letterId: 'nun',    hebrewLetter: 'נ', pathNumber: 24, tarotArcanum: 13, planet: null,      element: null,    zodiacSign: 'scorpio'     },
  'tiferet-yesod':   { id: 'tiferet-yesod',   letterId: 'samekh', hebrewLetter: 'ס', pathNumber: 25, tarotArcanum: 14, planet: null,      element: null,    zodiacSign: 'sagittarius' },
  'tiferet-hod':     { id: 'tiferet-hod',     letterId: 'ayin',   hebrewLetter: 'ע', pathNumber: 26, tarotArcanum: 15, planet: null,      element: null,    zodiacSign: 'capricorn'   },
  'netzach-hod':     { id: 'netzach-hod',     letterId: 'pe',     hebrewLetter: 'פ', pathNumber: 27, tarotArcanum: 16, planet: 'mars',    element: null,    zodiacSign: null          },
  'netzach-yesod':   { id: 'netzach-yesod',   letterId: 'tzaddi', hebrewLetter: 'צ', pathNumber: 28, tarotArcanum: 17, planet: null,      element: null,    zodiacSign: 'aquarius'    },
  'netzach-malchut': { id: 'netzach-malchut', letterId: 'qoph',   hebrewLetter: 'ק', pathNumber: 29, tarotArcanum: 18, planet: null,      element: null,    zodiacSign: 'pisces'      },
  'hod-yesod':       { id: 'hod-yesod',       letterId: 'resh',   hebrewLetter: 'ר', pathNumber: 30, tarotArcanum: 19, planet: 'sun',     element: null,    zodiacSign: null          },
  'hod-malchut':     { id: 'hod-malchut',     letterId: 'shin',   hebrewLetter: 'ש', pathNumber: 31, tarotArcanum: 20, planet: null,      element: 'fire',  zodiacSign: null          },
  'yesod-malchut':   { id: 'yesod-malchut',   letterId: 'tav',    hebrewLetter: 'ת', pathNumber: 32, tarotArcanum: 21, planet: 'saturn',  element: null,    zodiacSign: null          },
};
