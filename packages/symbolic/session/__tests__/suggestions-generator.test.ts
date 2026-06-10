import { describe, expect, it } from 'vitest';
import { buildExplorationSuggestions } from '../suggestions-generator';
import type { SymbolicSessionState } from '../types';

const CLOCK = () => '2026-01-01T12:00:00.000Z';

function baseState(
  overrides: Partial<SymbolicSessionState> = {},
): SymbolicSessionState {
  return {
    id: 'sess-1',
    createdAt: '2026-01-01T11:00:00.000Z',
    updatedAt: '2026-01-01T11:30:00.000Z',
    role: 'observational',
    stage: 'assisted_interpretation',
    consent: { granted: true, grantedAt: '2026-01-01T11:05:00.000Z' },
    notes: [],
    exercises: [],
    safetyLog: [],
    history: [],
    ...overrides,
  };
}

function withObservation(
  state: SymbolicSessionState,
  title: string,
  content: string,
): SymbolicSessionState {
  const existing = state.interpretation?.observations ?? [];
  return {
    ...state,
    interpretation: {
      ...(state.interpretation ?? {}),
      observations: [...existing, { type: 'pattern', title, content }],
    },
  } as SymbolicSessionState;
}

describe('buildExplorationSuggestions', () => {
  it('genera sugerencias del workspace con consentimiento satisfecho', () => {
    const result = buildExplorationSuggestions(baseState(), {
      workspace: 'cabala-applied',
      now: CLOCK,
    });
    expect(result.generatedAt).toBe('2026-01-01T12:00:00.000Z');
    expect(result.consentSatisfied).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.every((s) => s.prompt.length > 0)).toBe(true);
  });

  it('deriva una sugerencia desde una observación de la interpretación', () => {
    const state = withObservation(baseState(), 'Tensión Geburá-Jesed', 'desc');
    const result = buildExplorationSuggestions(state, { now: CLOCK });
    const derived = result.suggestions.find((s) =>
      s.provenance.includes('Tensión Geburá-Jesed'),
    );
    expect(derived).toBeDefined();
    expect(derived?.safe).toBe(true);
  });

  it('marca insegura una sugerencia con léxico clínico en rol observacional', () => {
    const state = withObservation(
      baseState({ role: 'observational' }),
      'diagnóstico',
      'desc',
    );
    const result = buildExplorationSuggestions(state, { now: CLOCK });
    const flagged = result.suggestions.find((s) => s.prompt.includes('diagnóstico'));
    expect(flagged?.safe).toBe(false);
    expect(result.safeSuggestions).not.toContainEqual(
      expect.objectContaining({ prompt: flagged?.prompt }),
    );
  });

  it('permite el léxico clínico en rol clínico verificado', () => {
    const state = withObservation(
      baseState({ role: 'clinical' }),
      'diagnóstico',
      'desc',
    );
    const result = buildExplorationSuggestions(state, { now: CLOCK });
    const flagged = result.suggestions.find((s) => s.prompt.includes('diagnóstico'));
    expect(flagged?.safe).toBe(true);
  });

  it('el rail anti-fraude bloquea "cura garantizada" en cualquier rol', () => {
    for (const role of ['observational', 'clinical'] as const) {
      const state = withObservation(baseState({ role }), 'cura garantizada', 'desc');
      const result = buildExplorationSuggestions(state, { now: CLOCK });
      const flagged = result.suggestions.find((s) =>
        s.prompt.includes('cura garantizada'),
      );
      expect(flagged?.safe).toBe(false);
    }
  });
});
