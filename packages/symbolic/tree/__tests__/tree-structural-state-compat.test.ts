import { describe, it, expect } from 'vitest';
import type { TreeStructuralState } from '../tree-structural-state.types';
import { TREE_STRUCTURAL_STATE_META } from '../tree-structural-state.types';

describe('TreeStructuralState v0.2 retrocompatibility', () => {
  it('a v0.1 object (no optional fields) is still a valid TreeStructuralState', () => {
    const v01State: TreeStructuralState = {
      source: { method: 'pitagoras', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
      sefirot: [
        { id: 'keter',   activation: 0.9, role: 'dominant' },
        { id: 'tiferet', activation: 0.6, role: 'present'  },
        { id: 'yesod',   activation: 0.3, role: 'latent'   },
      ],
      flows: [
        { from: 'keter', to: 'tiferet', polarity: 'harmonic', intensity: 0.75, direction: 'down' },
      ],
    };

    expect(v01State.sefirot[0].pillar).toBeUndefined();
    expect(v01State.sefirot[0].triad).toBeUndefined();
    expect(v01State.sefirot[0].olam).toBeUndefined();
    expect(v01State.flows[0].pathId).toBeUndefined();
    expect(v01State.source.method).toBe('pitagoras');
  });

  it('a v0.2 object with optional fields is valid', () => {
    const v02State: TreeStructuralState = {
      source: { method: 'pitagoras', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
      sefirot: [
        { id: 'keter',   activation: 0.9, role: 'dominant', pillar: 'equilibrium', triad: 'supernal', olam: 'atziluth' },
        { id: 'tiferet', activation: 0.6, role: 'present',  pillar: 'equilibrium', triad: 'ethical',  olam: 'yetzirah' },
      ],
      flows: [
        { from: 'keter', to: 'tiferet', polarity: 'harmonic', intensity: 0.75, direction: 'down', pathId: 'keter-tiferet' },
      ],
    };

    expect(v02State.sefirot[0].pillar).toBe('equilibrium');
    expect(v02State.sefirot[1].triad).toBe('ethical');
    expect(v02State.flows[0].pathId).toBe('keter-tiferet');
  });

  it('contract version is 0.2', () => {
    expect(TREE_STRUCTURAL_STATE_META.version).toBe('0.2');
  });

  it('v0.1 types import correctly without circular dependency errors', async () => {
    const mod = await import('../tree-structural-state.types');
    expect(mod.TREE_STRUCTURAL_STATE_META).toBeDefined();
    expect(typeof mod.TREE_STRUCTURAL_STATE_META.version).toBe('string');
  });
});
