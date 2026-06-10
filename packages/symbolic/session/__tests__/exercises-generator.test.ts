import { describe, expect, it } from 'vitest';
import { buildInteractiveExercises } from '../exercises-generator';
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
    stage: 'exercises',
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

describe('buildInteractiveExercises', () => {
  it('genera ejercicios del workspace con consentimiento', () => {
    const result = buildInteractiveExercises(baseState(), {
      workspace: 'transgenerational',
      now: CLOCK,
    });
    expect(result.generatedAt).toBe('2026-01-01T12:00:00.000Z');
    expect(result.consentSatisfied).toBe(true);
    expect(result.exercises.length).toBeGreaterThan(0);
    expect(result.exercises.every((e) => e.title && e.description)).toBe(true);
  });

  it('refleja la falta de consentimiento', () => {
    const result = buildInteractiveExercises(
      baseState({ consent: { granted: false } }),
      { now: CLOCK },
    );
    expect(result.consentSatisfied).toBe(false);
  });

  it('deriva un ejercicio personalizado desde una observación', () => {
    const state = withObservation(baseState(), 'Vínculo materno', 'desc');
    const result = buildInteractiveExercises(state, { now: CLOCK });
    const derived = result.exercises.find((e) =>
      e.provenance.includes('Vínculo materno'),
    );
    expect(derived).toBeDefined();
    expect(derived?.kind).toBe('reflection');
    expect(derived?.safe).toBe(true);
  });

  it('el rail anti-fraude bloquea promesas de cura en cualquier rol', () => {
    for (const role of ['observational', 'clinical'] as const) {
      const state = withObservation(baseState({ role }), 'cura milagrosa', 'desc');
      const result = buildInteractiveExercises(state, { now: CLOCK });
      const flagged = result.exercises.find((e) => e.title.includes('cura milagrosa'));
      expect(flagged?.safe).toBe(false);
      expect(result.safeExercises).not.toContainEqual(
        expect.objectContaining({ title: flagged?.title }),
      );
    }
  });
});
