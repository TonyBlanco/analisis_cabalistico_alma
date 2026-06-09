import { describe, it, expect } from 'vitest';
import type { SefiraId } from '../../tree/tree-structural-state.types';
import type { TopologyPathId } from '../types';
import {
  getCorrespondenceSystem,
  HERMETIC_GOLDEN_DAWN_SYSTEM,
  JEWISH_TRADITIONAL_SYSTEM,
  CORRESPONDENCE_SYSTEM_IDS,
} from '../system';

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

describe('CorrespondenceSystem facade', () => {
  it('exposes both system ids', () => {
    expect(CORRESPONDENCE_SYSTEM_IDS).toEqual([
      'hermetic-golden-dawn',
      'jewish-traditional',
    ]);
  });

  it('hermetic system resolves 10 sefirot and 22 paths', () => {
    const system = HERMETIC_GOLDEN_DAWN_SYSTEM;
    expect(system.id).toBe('hermetic-golden-dawn');
    for (const id of ALL_SEFIROT) {
      expect(system.sefirah(id)).not.toBeNull();
    }
    for (const id of ALL_PATHS) {
      expect(system.path(id)).not.toBeNull();
    }
  });

  it('jewish-traditional system resolves 10 sefirot and 22 paths', () => {
    const system = JEWISH_TRADITIONAL_SYSTEM;
    expect(system.id).toBe('jewish-traditional');
    for (const id of ALL_SEFIROT) {
      expect(system.sefirah(id)).not.toBeNull();
    }
    for (const id of ALL_PATHS) {
      expect(system.path(id)).not.toBeNull();
    }
  });

  it('getCorrespondenceSystem returns the same instances', () => {
    expect(getCorrespondenceSystem('hermetic-golden-dawn')).toBe(
      HERMETIC_GOLDEN_DAWN_SYSTEM,
    );
    expect(getCorrespondenceSystem('jewish-traditional')).toBe(
      JEWISH_TRADITIONAL_SYSTEM,
    );
  });
});