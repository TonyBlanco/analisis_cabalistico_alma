/**
 * Sefer Yetzirah — letter classification for the 22 canonical paths.
 *
 * Derives from TREE_PATHS (same Hebrew letters). DATA ONLY.
 * 3 mothers + 7 doubles + 12 simples = 22.
 */

import { TREE_PATHS } from '../tree/tree-topology';
import type { TopologyPathId } from '../correspondences/types';

export type LetterClass = 'mother' | 'double' | 'simple';

export interface SeferYetzirahLetter {
  pathId: TopologyPathId;
  hebrewLetter: string;
  letterClass: LetterClass;
  /** mother→element, double→planet, simple→zodiac sign (neutral reference). */
  attribution: string;
}

/** Letter → Sefer Yetzirah class and attribution (canonical tradition). */
const LETTER_CLASSIFICATION: Record<
  string,
  { letterClass: LetterClass; attribution: string }
> = {
  א: { letterClass: 'mother', attribution: 'air' },
  מ: { letterClass: 'mother', attribution: 'water' },
  ש: { letterClass: 'mother', attribution: 'fire' },
  ב: { letterClass: 'double', attribution: 'mercury' },
  ג: { letterClass: 'double', attribution: 'moon' },
  ד: { letterClass: 'double', attribution: 'venus' },
  כ: { letterClass: 'double', attribution: 'jupiter' },
  פ: { letterClass: 'double', attribution: 'mars' },
  ר: { letterClass: 'double', attribution: 'sun' },
  ת: { letterClass: 'double', attribution: 'saturn' },
  ה: { letterClass: 'simple', attribution: 'aries' },
  ו: { letterClass: 'simple', attribution: 'taurus' },
  ז: { letterClass: 'simple', attribution: 'gemini' },
  ח: { letterClass: 'simple', attribution: 'cancer' },
  ט: { letterClass: 'simple', attribution: 'leo' },
  י: { letterClass: 'simple', attribution: 'virgo' },
  ל: { letterClass: 'simple', attribution: 'libra' },
  נ: { letterClass: 'simple', attribution: 'scorpio' },
  ס: { letterClass: 'simple', attribution: 'sagittarius' },
  ע: { letterClass: 'simple', attribution: 'capricorn' },
  צ: { letterClass: 'simple', attribution: 'aquarius' },
  ק: { letterClass: 'simple', attribution: 'pisces' },
};

function buildSeferYetzirahTable(): Record<TopologyPathId, SeferYetzirahLetter> {
  const table = {} as Record<TopologyPathId, SeferYetzirahLetter>;

  for (const path of TREE_PATHS) {
    const classification = LETTER_CLASSIFICATION[path.hebrewLetter];
    if (!classification) {
      throw new Error(
        `Missing Sefer Yetzirah classification for letter ${path.hebrewLetter} (path ${path.id})`,
      );
    }
    table[path.id as TopologyPathId] = {
      pathId: path.id as TopologyPathId,
      hebrewLetter: path.hebrewLetter,
      letterClass: classification.letterClass,
      attribution: classification.attribution,
    };
  }

  return table;
}

export const SEFER_YETZIRAH_BY_PATH: Record<TopologyPathId, SeferYetzirahLetter> =
  buildSeferYetzirahTable();