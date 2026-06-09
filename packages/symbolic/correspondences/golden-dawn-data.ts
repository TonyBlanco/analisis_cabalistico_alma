/**
 * Golden Dawn Correspondence Tables
 *
 * Static data for the Hermetic/Golden Dawn system.
 * DATA ONLY — no logic, no interpretation.
 * Source: Regardie "The Golden Dawn", Liber 777, Sepher Yetzirah (GD recension).
 */

import type {
  SefirahCorrespondence,
  PathCorrespondence,
  TreePathId,
  SefirahId,
} from './types';

export const SEFIRAH_CORRESPONDENCES: Record<SefirahId, SefirahCorrespondence> = {
  kether:  { id: 'kether',  planet: 'primum_mobile', element: 'spirit', kingScaleColor: 'brilliantWhite',    tarotArcanaNumbers: [] },
  chokmah: { id: 'chokmah', planet: 'zodiac',         element: null,     kingScaleColor: 'softBlue',          tarotArcanaNumbers: [] },
  binah:   { id: 'binah',   planet: 'saturn',         element: null,     kingScaleColor: 'crimson',           tarotArcanaNumbers: [] },
  chesed:  { id: 'chesed',  planet: 'jupiter',        element: null,     kingScaleColor: 'deepViolet',        tarotArcanaNumbers: [] },
  gevurah: { id: 'gevurah', planet: 'mars',           element: null,     kingScaleColor: 'orange',            tarotArcanaNumbers: [] },
  tiferet: { id: 'tiferet', planet: 'sun',            element: null,     kingScaleColor: 'clearPinkRose',     tarotArcanaNumbers: [] },
  netzach: { id: 'netzach', planet: 'venus',          element: null,     kingScaleColor: 'amber',             tarotArcanaNumbers: [] },
  hod:     { id: 'hod',     planet: 'mercury',        element: null,     kingScaleColor: 'violetPurple',      tarotArcanaNumbers: [] },
  yesod:   { id: 'yesod',   planet: 'moon',           element: null,     kingScaleColor: 'indigo',            tarotArcanaNumbers: [] },
  malkuth: { id: 'malkuth', planet: 'earth',          element: 'earth',  kingScaleColor: 'yellowOliveRussetBlack', tarotArcanaNumbers: [] },
};

export const PATH_CORRESPONDENCES: Record<TreePathId, PathCorrespondence> = {
  'kether-chokmah':   { id: 'kether-chokmah',   hebrewLetter: 'א', pathNumber: 11, tarotArcanum: 0,  planet: null,      element: 'air',   zodiacSign: null          },
  'kether-binah':     { id: 'kether-binah',     hebrewLetter: 'ב', pathNumber: 12, tarotArcanum: 1,  planet: 'mercury', element: null,    zodiacSign: null          },
  'kether-tiferet':   { id: 'kether-tiferet',   hebrewLetter: 'ג', pathNumber: 13, tarotArcanum: 2,  planet: 'moon',    element: null,    zodiacSign: null          },
  'chokmah-binah':    { id: 'chokmah-binah',    hebrewLetter: 'ד', pathNumber: 14, tarotArcanum: 3,  planet: 'venus',   element: null,    zodiacSign: null          },
  'chokmah-tiferet':  { id: 'chokmah-tiferet',  hebrewLetter: 'ה', pathNumber: 15, tarotArcanum: 4,  planet: null,      element: null,    zodiacSign: 'aries'       },
  'chokmah-chesed':   { id: 'chokmah-chesed',   hebrewLetter: 'ו', pathNumber: 16, tarotArcanum: 5,  planet: null,      element: null,    zodiacSign: 'taurus'      },
  'binah-tiferet':    { id: 'binah-tiferet',    hebrewLetter: 'ז', pathNumber: 17, tarotArcanum: 6,  planet: null,      element: null,    zodiacSign: 'gemini'      },
  'binah-gevurah':    { id: 'binah-gevurah',    hebrewLetter: 'ח', pathNumber: 18, tarotArcanum: 7,  planet: null,      element: null,    zodiacSign: 'cancer'      },
  'chesed-gevurah':   { id: 'chesed-gevurah',   hebrewLetter: 'ט', pathNumber: 19, tarotArcanum: 8,  planet: null,      element: null,    zodiacSign: 'leo'         },
  'chesed-tiferet':   { id: 'chesed-tiferet',   hebrewLetter: 'י', pathNumber: 20, tarotArcanum: 9,  planet: null,      element: null,    zodiacSign: 'virgo'       },
  'chesed-netzach':   { id: 'chesed-netzach',   hebrewLetter: 'כ', pathNumber: 21, tarotArcanum: 10, planet: 'jupiter', element: null,    zodiacSign: null          },
  'gevurah-tiferet':  { id: 'gevurah-tiferet',  hebrewLetter: 'ל', pathNumber: 22, tarotArcanum: 11, planet: null,      element: null,    zodiacSign: 'libra'       },
  'gevurah-hod':      { id: 'gevurah-hod',      hebrewLetter: 'מ', pathNumber: 23, tarotArcanum: 12, planet: null,      element: 'water', zodiacSign: null          },
  'tiferet-netzach':  { id: 'tiferet-netzach',  hebrewLetter: 'נ', pathNumber: 24, tarotArcanum: 13, planet: null,      element: null,    zodiacSign: 'scorpio'     },
  'tiferet-yesod':    { id: 'tiferet-yesod',    hebrewLetter: 'ס', pathNumber: 25, tarotArcanum: 14, planet: null,      element: null,    zodiacSign: 'sagittarius' },
  'tiferet-hod':      { id: 'tiferet-hod',      hebrewLetter: 'ע', pathNumber: 26, tarotArcanum: 15, planet: null,      element: null,    zodiacSign: 'capricorn'   },
  'netzach-hod':      { id: 'netzach-hod',      hebrewLetter: 'פ', pathNumber: 27, tarotArcanum: 16, planet: 'mars',    element: null,    zodiacSign: null          },
  'netzach-yesod':    { id: 'netzach-yesod',    hebrewLetter: 'צ', pathNumber: 28, tarotArcanum: 17, planet: null,      element: null,    zodiacSign: 'aquarius'    },
  'netzach-malkuth':  { id: 'netzach-malkuth',  hebrewLetter: 'ק', pathNumber: 29, tarotArcanum: 18, planet: null,      element: null,    zodiacSign: 'pisces'      },
  'hod-yesod':        { id: 'hod-yesod',        hebrewLetter: 'ר', pathNumber: 30, tarotArcanum: 19, planet: 'sun',     element: null,    zodiacSign: null          },
  'hod-malkuth':      { id: 'hod-malkuth',      hebrewLetter: 'ש', pathNumber: 31, tarotArcanum: 20, planet: null,      element: 'fire',  zodiacSign: null          },
  'yesod-malkuth':    { id: 'yesod-malkuth',    hebrewLetter: 'ת', pathNumber: 32, tarotArcanum: 21, planet: 'saturn',  element: null,    zodiacSign: null          },
};
