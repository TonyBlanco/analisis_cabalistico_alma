import { describe, it, expect } from 'vitest';
import { adaptGenericMethodToTree } from '../generic-method-adapter';
import type { GenericSymbolicState } from '../generic-method-adapter';
import { validateTreeStateForInterpretation } from '../symbolic-interpreter';

const sampleState: GenericSymbolicState = {
  methodId: 'test-method',
  methodName: 'Test Method',
  primaryNumbers: [
    { key: 'n1', label: 'A', value: 6, weight: 0.9 },
    { key: 'n2', label: 'B', value: 9, weight: 0.75 },
    { key: 'n3', label: 'C', value: 1, weight: 0.6 },
  ],
  inclusionMap: {
    1: { frequency: 3, isAbsent: false, isDominant: true },
    6: { frequency: 4, isAbsent: false, isDominant: true },
    9: { frequency: 2, isAbsent: false, isDominant: false },
  },
};

describe('adaptGenericMethodToTree — v0.2 topology enrichment', () => {
  it('sefirot have pillar, triad, and olam populated', () => {
    const result = adaptGenericMethodToTree(sampleState);
    for (const s of result.sefirot) {
      expect(s.pillar).toBeDefined();
      expect(s.triad).toBeDefined();
      expect(s.olam).toBeDefined();
    }
  });

  it('tiferet (6) maps to equilibrium pillar, ethical triad, yetzirah', () => {
    const result = adaptGenericMethodToTree(sampleState);
    const tiferet = result.sefirot.find((s) => s.id === 'tiferet');
    expect(tiferet).toBeDefined();
    expect(tiferet!.pillar).toBe('equilibrium');
    expect(tiferet!.triad).toBe('ethical');
    expect(tiferet!.olam).toBe('yetzirah');
  });

  it('keter (1) maps to equilibrium pillar, supernal triad, atziluth', () => {
    const result = adaptGenericMethodToTree(sampleState);
    const keter = result.sefirot.find((s) => s.id === 'keter');
    expect(keter).toBeDefined();
    expect(keter!.pillar).toBe('equilibrium');
    expect(keter!.triad).toBe('supernal');
    expect(keter!.olam).toBe('atziluth');
  });

  it('flows that match a canonical path get pathId', () => {
    const result = adaptGenericMethodToTree(sampleState);
    const flowsWithPathId = result.flows.filter((f) => f.pathId !== undefined);
    expect(flowsWithPathId.length).toBeGreaterThanOrEqual(0);
    for (const f of flowsWithPathId) {
      expect(typeof f.pathId).toBe('string');
      expect(f.pathId!.length).toBeGreaterThan(0);
    }
  });

  it('canonical vertical chain keter→tiferet→yesod receives pathId on each flow', () => {
    const verticalState: GenericSymbolicState = {
      methodId: 'vertical-chain',
      methodName: 'Vertical Chain',
      primaryNumbers: [
        { key: 'k', label: 'Keter', value: 1, weight: 0.9 },
        { key: 't', label: 'Tiferet', value: 6, weight: 0.85 },
        { key: 'y', label: 'Yesod', value: 9, weight: 0.8 },
      ],
      inclusionMap: {
        1: { frequency: 2, isAbsent: false, isDominant: true },
        6: { frequency: 2, isAbsent: false, isDominant: true },
        9: { frequency: 2, isAbsent: false, isDominant: true },
      },
    };

    const result = adaptGenericMethodToTree(verticalState);
    const keterTiferet = result.flows.find(
      (f) =>
        (f.from === 'keter' && f.to === 'tiferet') ||
        (f.from === 'tiferet' && f.to === 'keter'),
    );
    const tiferetYesod = result.flows.find(
      (f) =>
        (f.from === 'tiferet' && f.to === 'yesod') ||
        (f.from === 'yesod' && f.to === 'tiferet'),
    );

    expect(keterTiferet?.pathId).toBe('keter-tiferet');
    expect(tiferetYesod?.pathId).toBe('tiferet-yesod');
  });

  it('state is still a valid TreeStructuralState (has source, sefirot, flows)', () => {
    const result = adaptGenericMethodToTree(sampleState);
    expect(result.source.method).toBe('test-method');
    expect(Array.isArray(result.sefirot)).toBe(true);
    expect(Array.isArray(result.flows)).toBe(true);
  });

  it('always emits exactly 10 sefirot for API v1 validation', () => {
    const result = adaptGenericMethodToTree(sampleState);
    expect(result.sefirot).toHaveLength(10);
    expect(validateTreeStateForInterpretation(result).valid).toBe(true);
  });

  it('uses graduated activations instead of only 1.0 and 0.15 buckets', () => {
    const result = adaptGenericMethodToTree(sampleState);
    const values = result.sefirot.map((s) => s.activation);
    const midRange = values.filter((v) => v > 0.2 && v < 0.95);
    expect(midRange.length).toBeGreaterThanOrEqual(2);
  });

  it('connects malchut via canonical yesod-malchut when manifestation rule fires', () => {
    const manifestState: GenericSymbolicState = {
      methodId: 'manifest',
      methodName: 'Manifest',
      primaryNumbers: [
        { key: 'a', label: 'A', value: 1, weight: 1 },
        { key: 'b', label: 'B', value: 2, weight: 0.95 },
        { key: 'c', label: 'C', value: 3, weight: 0.9 },
        { key: 'd', label: 'D', value: 4, weight: 0.88 },
      ],
      inclusionMap: {
        1: { frequency: 3, isAbsent: false, isDominant: true },
        2: { frequency: 3, isAbsent: false, isDominant: true },
        3: { frequency: 3, isAbsent: false, isDominant: true },
        4: { frequency: 2, isAbsent: false, isDominant: false },
      },
    };

    const result = adaptGenericMethodToTree(manifestState);
    const malchut = result.sefirot.find((s) => s.id === 'malchut');
    expect(malchut?.activation).toBeGreaterThanOrEqual(0.4);

    const yesodMalchut = result.flows.find(
      (f) =>
        (f.from === 'yesod' && f.to === 'malchut') ||
        (f.from === 'malchut' && f.to === 'yesod'),
    );
    expect(yesodMalchut?.pathId).toBe('yesod-malchut');
  });

  it('only emits flows along canonical TREE_PATHS', () => {
    const result = adaptGenericMethodToTree(sampleState);
    for (const flow of result.flows) {
      expect(flow.pathId).toBeDefined();
    }
  });
});
