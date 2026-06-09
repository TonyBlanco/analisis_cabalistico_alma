import { describe, it, expect } from 'vitest';
import { analyzeTreeState } from '../tree-analysis';
import type { TreeStructuralState } from '../tree-structural-state.types';
import { SYMBOLIC_INTERPRETER_META } from '../symbolic-interpreter.types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const emptyState: TreeStructuralState = {
  source: { method: 'test', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
  sefirot: [],
  flows: [],
};

const singleSefirahState: TreeStructuralState = {
  source: { method: 'test', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
  sefirot: [{ id: 'tiferet', activation: 0.8, role: 'dominant' }],
  flows: [],
};

const fullyActiveState: TreeStructuralState = {
  source: { method: 'test', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
  sefirot: [
    { id: 'keter',   activation: 1.0, role: 'dominant' },
    { id: 'chokmah', activation: 0.9, role: 'dominant' },
    { id: 'binah',   activation: 0.85, role: 'dominant' },
    { id: 'chesed',  activation: 0.8, role: 'dominant' },
    { id: 'gevurah', activation: 0.75, role: 'dominant' },
    { id: 'tiferet', activation: 0.7, role: 'dominant' },
    { id: 'netzach', activation: 0.65, role: 'present' },
    { id: 'hod',     activation: 0.6, role: 'present' },
    { id: 'yesod',   activation: 0.55, role: 'present' },
    { id: 'malchut', activation: 0.5, role: 'present' },
  ],
  flows: [
    { from: 'keter',   to: 'tiferet',  polarity: 'harmonic',    intensity: 0.9, direction: 'down' },
    { from: 'tiferet', to: 'yesod',    polarity: 'harmonic',    intensity: 0.7, direction: 'down' },
    { from: 'yesod',   to: 'malchut',  polarity: 'integrative', intensity: 0.6, direction: 'down' },
    { from: 'chesed',  to: 'gevurah',  polarity: 'tensional',   intensity: 0.5, direction: 'lateral' },
    { from: 'chokmah', to: 'binah',    polarity: 'harmonic',    intensity: 0.8, direction: 'lateral' },
  ],
};

const disconnectedState: TreeStructuralState = {
  source: { method: 'test', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
  sefirot: [
    { id: 'keter',   activation: 0.9, role: 'dominant' },
    { id: 'malchut', activation: 0.7, role: 'dominant' },
  ],
  flows: [],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('analyzeTreeState — empty tree', () => {
  it('returns zero pillar balance', () => {
    const result = analyzeTreeState(emptyState);
    expect(result.pillarBalance.severity).toBe(0);
    expect(result.pillarBalance.mercy).toBe(0);
    expect(result.pillarBalance.equilibrium).toBe(0);
  });

  it('returns zero triad and olam activation', () => {
    const result = analyzeTreeState(emptyState);
    expect(result.triadActivation.supernal).toBe(0);
    expect(result.olamActivation.atziluth).toBe(0);
  });

  it('returns empty ranking', () => {
    expect(analyzeTreeState(emptyState).ranking).toHaveLength(0);
  });

  it('returns 0 connected components for empty tree', () => {
    expect(analyzeTreeState(emptyState).graph.connectedComponents).toBe(0);
  });
});

describe('analyzeTreeState — single sefirah', () => {
  it('ranks tiferet at position 0', () => {
    const result = analyzeTreeState(singleSefirahState);
    expect(result.ranking[0].id).toBe('tiferet');
    expect(result.ranking[0].activation).toBe(0.8);
  });

  it('equilibrium pillar carries all activation', () => {
    const result = analyzeTreeState(singleSefirahState);
    expect(result.pillarBalance.equilibrium).toBeCloseTo(1, 5);
    expect(result.pillarBalance.mercy).toBe(0);
    expect(result.pillarBalance.severity).toBe(0);
  });

  it('ethical triad carries all triad activation', () => {
    const result = analyzeTreeState(singleSefirahState);
    expect(result.triadActivation.ethical).toBeCloseTo(0.8, 5);
    expect(result.triadActivation.supernal).toBe(0);
  });

  it('yetzirah carries all olam activation', () => {
    const result = analyzeTreeState(singleSefirahState);
    expect(result.olamActivation.yetzirah).toBeCloseTo(0.8, 5);
    expect(result.olamActivation.atziluth).toBe(0);
  });
});

describe('analyzeTreeState — fully active tree', () => {
  it('pillarBalance sums to ~1', () => {
    const r = analyzeTreeState(fullyActiveState);
    const sum = r.pillarBalance.severity + r.pillarBalance.mercy + r.pillarBalance.equilibrium;
    expect(sum).toBeCloseTo(1, 5);
  });

  it('ranking is sorted descending by activation', () => {
    const r = analyzeTreeState(fullyActiveState);
    for (let i = 1; i < r.ranking.length; i++) {
      expect(r.ranking[i].activation).toBeLessThanOrEqual(r.ranking[i - 1].activation);
    }
    expect(r.ranking[0].id).toBe('keter');
  });

  it('polarityDistribution sums to 1', () => {
    const r = analyzeTreeState(fullyActiveState);
    const sum = r.polarityDistribution.harmonic + r.polarityDistribution.integrative + r.polarityDistribution.tensional;
    expect(sum).toBeCloseTo(1, 5);
  });

  it('activePaths maps flows to canonical TREE_PATHS ids', () => {
    const r = analyzeTreeState(fullyActiveState);
    expect(r.graph.activePaths).toContain('keter-tiferet');
    expect(r.graph.activePaths).toContain('tiferet-yesod');
    expect(r.graph.activePaths).toContain('yesod-malchut');
  });

  it('longestActivePath is an array of SefiraIds', () => {
    const r = analyzeTreeState(fullyActiveState);
    expect(Array.isArray(r.longestActivePath ?? r.graph.longestActivePath)).toBe(true);
  });
});

describe('analyzeTreeState — disconnected flows', () => {
  it('two isolated sefirot yield 2 connected components', () => {
    const r = analyzeTreeState(disconnectedState);
    expect(r.graph.connectedComponents).toBe(2);
  });

  it('activePaths is empty when no flows match canonical paths', () => {
    const r = analyzeTreeState(disconnectedState);
    expect(r.graph.activePaths).toHaveLength(0);
  });
});

describe('analyzeTreeState — determinism', () => {
  it('same input produces byte-identical output (golden test)', () => {
    const r1 = analyzeTreeState(fullyActiveState);
    const r2 = analyzeTreeState(fullyActiveState);
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });

  it('different inputs produce different outputs', () => {
    const r1 = analyzeTreeState(singleSefirahState);
    const r2 = analyzeTreeState(fullyActiveState);
    expect(JSON.stringify(r1)).not.toBe(JSON.stringify(r2));
  });
});

describe('analyzeTreeState — safety lint', () => {
  it('analysis output contains no prohibited terms', () => {
    const r = analyzeTreeState(fullyActiveState);
    const serialized = JSON.stringify(r).toLowerCase();
    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
      expect(serialized).not.toContain(term.toLowerCase());
    }
  });
});
