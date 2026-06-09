import { describe, it, expect } from 'vitest';
import { resolveSefirahCorrespondences, resolvePathCorrespondences } from '../resolve';
import { SEFIRAH_CORRESPONDENCES, PATH_CORRESPONDENCES } from '../golden-dawn-data';
import type { SefirahId, TreePathId } from '../types';

const ALL_SEFIROT: SefirahId[] = [
  'kether', 'chokmah', 'binah', 'chesed', 'gevurah',
  'tiferet', 'netzach', 'hod', 'yesod', 'malkuth',
];

const ALL_PATHS: TreePathId[] = [
  'kether-chokmah', 'kether-binah', 'kether-tiferet',
  'chokmah-binah', 'chokmah-tiferet', 'chokmah-chesed',
  'binah-tiferet', 'binah-gevurah',
  'chesed-gevurah', 'chesed-tiferet', 'chesed-netzach',
  'gevurah-tiferet', 'gevurah-hod',
  'tiferet-netzach', 'tiferet-yesod', 'tiferet-hod',
  'netzach-hod', 'netzach-yesod', 'netzach-malkuth',
  'hod-yesod', 'hod-malkuth', 'yesod-malkuth',
];

describe('resolveSefirahCorrespondences', () => {
  it('returns data for all 10 sefirot', () => {
    for (const id of ALL_SEFIROT) {
      const result = resolveSefirahCorrespondences(id);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(id);
    }
  });

  it('every sefirah has a non-empty planet', () => {
    for (const id of ALL_SEFIROT) {
      const result = resolveSefirahCorrespondences(id);
      expect(result!.planet.length).toBeGreaterThan(0);
    }
  });

  it('every sefirah has a non-empty kingScaleColor', () => {
    for (const id of ALL_SEFIROT) {
      const result = resolveSefirahCorrespondences(id);
      expect(result!.kingScaleColor.length).toBeGreaterThan(0);
    }
  });

  it('malkuth has earth element', () => {
    expect(resolveSefirahCorrespondences('malkuth')!.element).toBe('earth');
  });

  it('kether has spirit element', () => {
    expect(resolveSefirahCorrespondences('kether')!.element).toBe('spirit');
  });

  it('returns null for unknown id', () => {
    expect(resolveSefirahCorrespondences('unknown' as SefirahId)).toBeNull();
  });
});

describe('resolvePathCorrespondences', () => {
  it('returns data for all 22 paths', () => {
    expect(ALL_PATHS).toHaveLength(22);
    for (const id of ALL_PATHS) {
      const result = resolvePathCorrespondences(id);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(id);
    }
  });

  it('every path has a tarotArcanum in range 0..21', () => {
    for (const id of ALL_PATHS) {
      const result = resolvePathCorrespondences(id);
      expect(result!.tarotArcanum).toBeGreaterThanOrEqual(0);
      expect(result!.tarotArcanum).toBeLessThanOrEqual(21);
    }
  });

  it('tarotArcanum values are unique across all 22 paths', () => {
    const arcana = ALL_PATHS.map((id) => resolvePathCorrespondences(id)!.tarotArcanum);
    expect(new Set(arcana).size).toBe(22);
  });

  it('every path has a non-empty hebrewLetter', () => {
    for (const id of ALL_PATHS) {
      const result = resolvePathCorrespondences(id);
      expect(result!.hebrewLetter.length).toBeGreaterThan(0);
    }
  });

  it('pathNumbers are unique and in range 11..32', () => {
    const numbers = ALL_PATHS.map((id) => resolvePathCorrespondences(id)!.pathNumber);
    expect(new Set(numbers).size).toBe(22);
    for (const n of numbers) {
      expect(n).toBeGreaterThanOrEqual(11);
      expect(n).toBeLessThanOrEqual(32);
    }
  });

  it('kether-chokmah maps to The Fool (arcanum 0, aleph, air)', () => {
    const c = resolvePathCorrespondences('kether-chokmah')!;
    expect(c.tarotArcanum).toBe(0);
    expect(c.hebrewLetter).toBe('א');
    expect(c.element).toBe('air');
    expect(c.planet).toBeNull();
  });

  it('yesod-malkuth maps to The World (arcanum 21, tav, saturn)', () => {
    const c = resolvePathCorrespondences('yesod-malkuth')!;
    expect(c.tarotArcanum).toBe(21);
    expect(c.hebrewLetter).toBe('ת');
    expect(c.planet).toBe('saturn');
  });

  it('returns null for unknown path', () => {
    expect(resolvePathCorrespondences('unknown-path' as TreePathId)).toBeNull();
  });
});

describe('data completeness', () => {
  it('SEFIRAH_CORRESPONDENCES covers all 10 sefirot', () => {
    expect(Object.keys(SEFIRAH_CORRESPONDENCES)).toHaveLength(10);
  });

  it('PATH_CORRESPONDENCES covers all 22 paths', () => {
    expect(Object.keys(PATH_CORRESPONDENCES)).toHaveLength(22);
  });
});
