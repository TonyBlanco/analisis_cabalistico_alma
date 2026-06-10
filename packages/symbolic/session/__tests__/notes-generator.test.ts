import { describe, it, expect } from 'vitest';
import { buildSessionNotesDraft } from '../notes-generator';
import type { SymbolicSessionState } from '../types';

const CLOCK = () => '2026-01-01T12:00:00.000Z';

function baseState(overrides: Partial<SymbolicSessionState> = {}): SymbolicSessionState {
  const ts = '2026-01-01T00:00:00.000Z';
  return {
    id: 'sess-1',
    createdAt: ts,
    updatedAt: ts,
    role: 'observational',
    stage: 'session_notes',
    consent: { granted: true, grantedAt: ts, scope: 'assisted_interpretation' },
    notes: [],
    exercises: [],
    safetyLog: [],
    history: [],
    ...overrides,
  } as SymbolicSessionState;
}

function withObservation(content: string, title = 'Patrón'): SymbolicSessionState['interpretation'] {
  return {
    observations: [{ type: 'pattern-recognition', title, content }],
  } as unknown as SymbolicSessionState['interpretation'];
}

describe('buildSessionNotesDraft', () => {
  it('builds an editable draft with framing, map and summary (observational)', () => {
    const draft = buildSessionNotesDraft(baseState(), { workspace: 'generic', now: CLOCK });

    expect(draft.role).toBe('observational');
    expect(draft.generatedAt).toBe('2026-01-01T12:00:00.000Z');
    expect(draft.consentSatisfied).toBe(true);
    expect(draft.summary.length).toBeGreaterThan(0);
    expect(draft.sections.map((s) => s.id)).toContain('encuadre');
    expect(draft.sections.map((s) => s.id)).toContain('mapa');
    expect(draft.safetyValidation.passed).toBe(true);
    expect(draft.antiFraud.passed).toBe(true);
  });

  it('flags the clinical lexicon for observational but allows it for the verified clinical role', () => {
    const interpretation = withObservation('Se observa un posible diagnóstico de base.');

    const observational = buildSessionNotesDraft(
      baseState({ role: 'observational', interpretation }),
      { now: CLOCK },
    );
    expect(observational.safetyValidation.passed).toBe(false);
    expect(observational.safetyValidation.warnings.length).toBeGreaterThan(0);

    const clinical = buildSessionNotesDraft(
      baseState({ role: 'clinical', interpretation }),
      { now: CLOCK },
    );
    expect(clinical.safetyValidation.passed).toBe(true);
  });

  it('always enforces the anti-fraud rail, regardless of role', () => {
    const ts = '2026-01-01T00:00:00.000Z';
    const note = { id: 'n1', author: 'therapist', content: 'cura garantizada en tres sesiones', createdAt: ts, safe: true };

    for (const role of ['observational', 'clinical'] as const) {
      const draft = buildSessionNotesDraft(
        baseState({ role, notes: [note] as unknown as SymbolicSessionState['notes'] }),
        { now: CLOCK },
      );
      expect(draft.antiFraud.passed).toBe(false);
      expect(draft.safetyValidation.passed).toBe(false);
    }
  });

  it('reports consentSatisfied=false when consent is not granted', () => {
    const draft = buildSessionNotesDraft(
      baseState({ consent: { granted: false } }),
      { now: CLOCK },
    );
    expect(draft.consentSatisfied).toBe(false);
  });

  it('uses the workspace-specific focus title', () => {
    const draft = buildSessionNotesDraft(baseState(), { workspace: 'cabala-applied', now: CLOCK });
    const focus = draft.sections.find((s) => s.id === 'focus');
    expect(focus?.title).toBe('Sefirot y senderos a profundizar');
  });
});
