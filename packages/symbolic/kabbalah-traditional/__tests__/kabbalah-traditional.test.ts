import { describe, it, expect } from 'vitest';
import { TREE_PATHS, SEFIROT_TOPOLOGY } from '../../tree/tree-topology';
import { SYMBOLIC_INTERPRETER_META } from '../../tree/symbolic-interpreter.types';
import type { SefiraId } from '../../tree/tree-structural-state.types';
import type { TopologyPathId } from '../../correspondences/types';
import {
  TRADITIONAL_SEFIRAH_CORRESPONDENCES,
  SOUL_LEVELS,
  SEFER_YETZIRAH_BY_PATH,
  PARTZUFIM,
  LURIANIC_CONCEPTS,
  DAAT_OVERLAY,
  resolveTraditionalSefirah,
  resolveTraditionalPath,
  resolvePartzuf,
  resolveSoulLevels,
} from '../index';

const ALL_SEFIROT: SefiraId[] = [
  'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
  'tiferet', 'netzach', 'hod', 'yesod', 'malchut',
];

const ALL_PATHS: TopologyPathId[] = [
  'keter-chokmah', 'keter-binah', 'keter-tiferet',
  'chokmah-binah', 'chokmah-tiferet', 'chokmah-chesed',
  'binah-tiferet', 'binah-gevurah',
  'chesed-gevurah', 'chesed-tiferet', 'chesed-netzach',
  'gevurah-tiferet', 'gevurah-hod',
  'tiferet-netzach', 'tiferet-yesod', 'tiferet-hod',
  'netzach-hod', 'netzach-yesod', 'netzach-malchut',
  'hod-yesod', 'hod-malchut', 'yesod-malchut',
];

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('TRADITIONAL_SEFIRAH_CORRESPONDENCES', () => {
  it('covers all 10 sefirot', () => {
    expect(Object.keys(TRADITIONAL_SEFIRAH_CORRESPONDENCES)).toHaveLength(10);
    for (const id of ALL_SEFIROT) {
      expect(TRADITIONAL_SEFIRAH_CORRESPONDENCES[id]).toBeDefined();
    }
  });

  it('each sefirah has divine name, archangel, choir, and olam matching topology', () => {
    for (const id of ALL_SEFIROT) {
      const data = TRADITIONAL_SEFIRAH_CORRESPONDENCES[id];
      expect(data.divineNameHebrew.length).toBeGreaterThan(0);
      expect(data.divineNameTranslit.length).toBeGreaterThan(0);
      expect(data.archangel.length).toBeGreaterThan(0);
      expect(data.angelicChoir.length).toBeGreaterThan(0);
      expect(data.olam).toBe(SEFIROT_TOPOLOGY[id].olam);
    }
  });
});

describe('SOUL_LEVELS', () => {
  it('maps five soul parts to worlds', () => {
    expect(SOUL_LEVELS).toHaveLength(5);
    expect(SOUL_LEVELS.map((s) => s.part)).toEqual([
      'nefesh', 'ruach', 'neshamah', 'chayah', 'yechidah',
    ]);
  });

  it('resolveSoulLevels returns the same reference table', () => {
    expect(resolveSoulLevels()).toBe(SOUL_LEVELS);
  });
});

describe('SEFER_YETZIRAH_BY_PATH', () => {
  it('has 3 mothers + 7 doubles + 12 simples = 22', () => {
    const entries = Object.values(SEFER_YETZIRAH_BY_PATH);
    expect(entries).toHaveLength(22);

    const mothers = entries.filter((e) => e.letterClass === 'mother');
    const doubles = entries.filter((e) => e.letterClass === 'double');
    const simples = entries.filter((e) => e.letterClass === 'simple');

    expect(mothers).toHaveLength(3);
    expect(doubles).toHaveLength(7);
    expect(simples).toHaveLength(12);
  });

  it('letter set matches TREE_PATHS exactly', () => {
    const yetzirahLetters = new Set(
      Object.values(SEFER_YETZIRAH_BY_PATH).map((e) => e.hebrewLetter),
    );
    const topologyLetters = new Set(TREE_PATHS.map((p) => p.hebrewLetter));
    expect(yetzirahLetters).toEqual(topologyLetters);
  });

  it('mothers are aleph, mem, shin', () => {
    const mothers = Object.values(SEFER_YETZIRAH_BY_PATH)
      .filter((e) => e.letterClass === 'mother')
      .map((e) => e.hebrewLetter)
      .sort();
    expect(mothers).toEqual(['א', 'מ', 'ש']);
  });
});

describe('lurianic reference data', () => {
  it('PARTZUFIM covers all 10 sefirot without overlap', () => {
    const assigned = Object.values(PARTZUFIM).flat();
    expect(assigned).toHaveLength(10);
    expect(new Set(assigned)).toEqual(new Set(ALL_SEFIROT));
  });

  it('DAAT_OVERLAY is optional and references chokmah, binah, tiferet', () => {
    expect(DAAT_OVERLAY.id).toBe('daat');
    expect(DAAT_OVERLAY.hidden).toBe(true);
    expect(DAAT_OVERLAY.between).toEqual(['chokmah', 'binah', 'tiferet']);
    expect('daat' in SEFIROT_TOPOLOGY).toBe(false);
    expect(Object.keys(SEFIROT_TOPOLOGY)).toHaveLength(10);
  });

  it('LURIANIC_CONCEPTS lists four neutral cosmological references', () => {
    expect(LURIANIC_CONCEPTS.map((c) => c.id)).toEqual([
      'tzimtzum', 'shevirat_hakelim', 'tikkun', 'ein_sof',
    ]);
  });
});

describe('resolve API', () => {
  it('resolveTraditionalSefirah returns data for all 10 sefirot', () => {
    for (const id of ALL_SEFIROT) {
      const result = resolveTraditionalSefirah(id);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(id);
    }
  });

  it('resolveTraditionalPath returns data for all 22 paths', () => {
    expect(ALL_PATHS).toHaveLength(22);
    for (const id of ALL_PATHS) {
      const result = resolveTraditionalPath(id);
      expect(result).not.toBeNull();
      expect(result!.pathId).toBe(id);
    }
  });

  it('resolvePartzuf returns a partzuf for every sefirah', () => {
    for (const id of ALL_SEFIROT) {
      expect(resolvePartzuf(id)).not.toBeNull();
    }
  });

  it('returns null for unknown ids', () => {
    expect(resolveTraditionalSefirah('unknown' as SefiraId)).toBeNull();
    expect(resolveTraditionalPath('unknown-path')).toBeNull();
    expect(resolvePartzuf('unknown' as SefiraId)).toBeNull();
  });
});

describe('safety lint', () => {
  it('module string data contains no prohibited terms', () => {
    const payload = collectStrings({
      TRADITIONAL_SEFIRAH_CORRESPONDENCES,
      SOUL_LEVELS,
      SEFER_YETZIRAH_BY_PATH,
      PARTZUFIM,
      LURIANIC_CONCEPTS,
      DAAT_OVERLAY,
    }).join(' ').toLowerCase();

    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
      expect(payload).not.toContain(term.toLowerCase());
    }
  });
});