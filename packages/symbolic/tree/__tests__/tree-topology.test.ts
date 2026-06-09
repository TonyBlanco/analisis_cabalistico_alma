import { describe, it, expect } from 'vitest';
import {
  SEFIROT_TOPOLOGY,
  TREE_PATHS,
  VALID_SEFIRA_IDS,
} from '../tree-topology';

describe('SEFIROT_TOPOLOGY invariants', () => {
  it('has exactly 10 sefirot', () => {
    expect(Object.keys(SEFIROT_TOPOLOGY).length).toBe(10);
  });

  it('contains all canonical SefiraIds', () => {
    const ids = Object.keys(SEFIROT_TOPOLOGY);
    for (const id of VALID_SEFIRA_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('every sefira has pillar, triad/receptacle, olam, and position', () => {
    const validPillars = ['severity', 'mercy', 'equilibrium'];
    const validTriads = ['supernal', 'ethical', 'astral', 'receptacle'];
    const validOlamot = ['atziluth', 'beriah', 'yetzirah', 'assiah'];

    for (const [id, entry] of Object.entries(SEFIROT_TOPOLOGY)) {
      expect(validPillars).toContain(entry.pillar);
      expect(validTriads).toContain(entry.triad);
      expect(validOlamot).toContain(entry.olam);
      expect(typeof entry.position.x).toBe('number');
      expect(typeof entry.position.y).toBe('number');
    }
  });

  it('malchut is the only receptacle', () => {
    const receptacles = Object.entries(SEFIROT_TOPOLOGY)
      .filter(([, e]) => e.triad === 'receptacle')
      .map(([id]) => id);
    expect(receptacles).toEqual(['malchut']);
  });

  it('each pillar contains the correct sefirot', () => {
    const mercy    = Object.entries(SEFIROT_TOPOLOGY).filter(([, e]) => e.pillar === 'mercy').map(([id]) => id);
    const severity = Object.entries(SEFIROT_TOPOLOGY).filter(([, e]) => e.pillar === 'severity').map(([id]) => id);
    const equil    = Object.entries(SEFIROT_TOPOLOGY).filter(([, e]) => e.pillar === 'equilibrium').map(([id]) => id);

    expect(mercy.sort()).toEqual(['chesed', 'chokmah', 'netzach'].sort());
    expect(severity.sort()).toEqual(['binah', 'gevurah', 'hod'].sort());
    expect(equil.sort()).toEqual(['keter', 'malchut', 'tiferet', 'yesod'].sort());
  });
});

describe('TREE_PATHS invariants', () => {
  it('has exactly 22 paths', () => {
    expect(TREE_PATHS.length).toBe(22);
  });

  it('pathNumbers are unique and in range 11..32', () => {
    const numbers = TREE_PATHS.map((p) => p.pathNumber);
    const unique = new Set(numbers);
    expect(unique.size).toBe(22);
    for (const n of numbers) {
      expect(n).toBeGreaterThanOrEqual(11);
      expect(n).toBeLessThanOrEqual(32);
    }
  });

  it('every path.from and path.to is a valid SefiraId', () => {
    for (const path of TREE_PATHS) {
      expect(VALID_SEFIRA_IDS).toContain(path.from);
      expect(VALID_SEFIRA_IDS).toContain(path.to);
    }
  });

  it('path ids are unique', () => {
    const ids = TREE_PATHS.map((p) => p.id);
    expect(new Set(ids).size).toBe(22);
  });

  it('each path has a non-empty hebrewLetter', () => {
    for (const path of TREE_PATHS) {
      expect(path.hebrewLetter.length).toBeGreaterThan(0);
    }
  });

  it('hebrew letters are unique across paths', () => {
    const letters = TREE_PATHS.map((p) => p.hebrewLetter);
    expect(new Set(letters).size).toBe(22);
  });

  it('paths are sorted by pathNumber ascending', () => {
    for (let i = 1; i < TREE_PATHS.length; i++) {
      expect(TREE_PATHS[i].pathNumber).toBeGreaterThan(TREE_PATHS[i - 1].pathNumber);
    }
  });
});
