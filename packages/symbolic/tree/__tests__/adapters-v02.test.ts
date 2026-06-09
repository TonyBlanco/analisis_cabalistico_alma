import { describe, it, expect } from 'vitest';
import { adaptGenericMethodToTree } from '../generic-method-adapter';
import type { GenericSymbolicState } from '../generic-method-adapter';

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

  it('state is still a valid TreeStructuralState (has source, sefirot, flows)', () => {
    const result = adaptGenericMethodToTree(sampleState);
    expect(result.source.method).toBe('test-method');
    expect(Array.isArray(result.sefirot)).toBe(true);
    expect(Array.isArray(result.flows)).toBe(true);
  });
});
