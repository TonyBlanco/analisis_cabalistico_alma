import { describe, it, expect } from 'vitest';
import { adaptGenericMethodToTree } from '../../tree';
import type { GenericSymbolicState, SymbolicInterpretation } from '../../tree';
import {
  createSession,
  recordConsent,
  attachStructuralState,
  canEnterAssistedInterpretation,
  attachInterpretation,
  addSessionNote,
  addExercise,
  setSessionSummary,
  closeSession,
  SessionGateError,
} from '../session-orchestrator';

const CLOCK = { now: () => '2026-06-10T00:00:00.000Z' };

const genericState: GenericSymbolicState = {
  methodId: 'pitagoras',
  methodName: 'Pitágoras',
  primaryNumbers: [
    { key: 'esencia', label: 'Esencia', value: 8, weight: 1 },
    { key: 'expresion', label: 'Expresión', value: 9, weight: 0.9 },
    { key: 'herencia', label: 'Herencia', value: 8, weight: 0.85 },
    { key: 'camino', label: 'Camino de Vida', value: 5, weight: 0.8 },
  ],
  inclusionMap: {
    5: { frequency: 3, isAbsent: false, isDominant: true },
    8: { frequency: 3, isAbsent: false, isDominant: true },
    9: { frequency: 2, isAbsent: false, isDominant: false },
    1: { frequency: 0, isAbsent: true, isDominant: false },
  },
};

function buildTree() {
  return adaptGenericMethodToTree(genericState);
}

function makeInterpretation(tree: ReturnType<typeof buildTree>): SymbolicInterpretation {
  return {
    sourceState: tree,
    timestamp: '2026-06-10T00:00:00.000Z',
    safetyLevel: 'educational',
    observations: [
      {
        type: 'structural-analysis',
        title: 'Panorama',
        content: 'La estructura muestra foco en Hod y Yesod.',
        containsProhibitedContent: false,
      },
      {
        type: 'pattern-recognition',
        title: 'Clínico',
        content: 'Se observa un trastorno y un diagnóstico claro.',
        containsProhibitedContent: false,
      },
      {
        type: 'symbolic-comparison',
        title: 'Fraude',
        content: 'Te garantizo la cura milagrosa sin médico.',
        containsProhibitedContent: false,
      },
    ],
    safetyValidation: { passed: true, warnings: [] },
  };
}

describe('session orchestrator — creation & defaults', () => {
  it('creates an intake session with deterministic id and observational role', () => {
    const s = createSession({}, CLOCK);
    expect(s.stage).toBe('intake');
    expect(s.role).toBe('observational');
    expect(s.consent.granted).toBe(false);
    expect(s.id).toBe('session-2026-06-10T00:00:00.000Z');
    expect(s.createdAt).toBe('2026-06-10T00:00:00.000Z');
  });
});

describe('session orchestrator — consent gate', () => {
  it('blocks assisted interpretation without consent', () => {
    const tree = buildTree();
    let s = createSession({ id: 'sess' }, CLOCK);
    s = attachStructuralState(s, tree, undefined, CLOCK);

    const guard = canEnterAssistedInterpretation(s);
    expect(guard.allowed).toBe(false);
    expect(guard.reasons.join(' ')).toContain('Consentimiento');

    expect(() => attachInterpretation(s, makeInterpretation(tree), CLOCK)).toThrow(
      SessionGateError,
    );
  });

  it('blocks assisted interpretation without structural state', () => {
    let s = createSession({ id: 'sess' }, CLOCK);
    s = recordConsent(s, { grantedBy: 'therapist-1' }, CLOCK);
    const guard = canEnterAssistedInterpretation(s);
    expect(guard.allowed).toBe(false);
    expect(guard.reasons.join(' ')).toContain('TreeStructuralState');
  });
});

describe('session orchestrator — role-aware interpretation gate', () => {
  it('observational role drops clinical AND anti-fraud observations', () => {
    const tree = buildTree();
    let s = createSession({ id: 'sess', role: 'observational' }, CLOCK);
    s = attachStructuralState(s, tree, undefined, CLOCK);
    s = recordConsent(s, { grantedBy: 'therapist-1' }, CLOCK);

    const res = attachInterpretation(s, makeInterpretation(tree), CLOCK);
    expect(res.acceptedObservations).toBe(1);
    expect(res.rejectedObservations).toBe(2);
    expect(res.state.stage).toBe('assisted_interpretation');
    expect(res.state.interpretation?.observations).toHaveLength(1);
    expect(res.state.interpretation?.safetyValidation.passed).toBe(false);
  });

  it('clinical role keeps clinical observation but still drops anti-fraud', () => {
    const tree = buildTree();
    let s = createSession({ id: 'sess', role: 'clinical' }, CLOCK);
    s = attachStructuralState(s, tree, undefined, CLOCK);
    s = recordConsent(s, { grantedBy: 'therapist-1' }, CLOCK);

    const res = attachInterpretation(s, makeInterpretation(tree), CLOCK);
    expect(res.acceptedObservations).toBe(2);
    expect(res.rejectedObservations).toBe(1);
  });
});

describe('session orchestrator — notes / summary / exercises gating', () => {
  it('observational rejects clinical-lexicon notes; clinical accepts them', () => {
    const obs = addSessionNote(
      createSession({ id: 'a', role: 'observational' }, CLOCK),
      { author: 't', content: 'Sospecha de trastorno.' },
      CLOCK,
    );
    expect(obs.accepted).toBe(false);
    expect(obs.state.notes).toHaveLength(0);

    const clin = addSessionNote(
      createSession({ id: 'b', role: 'clinical' }, CLOCK),
      { author: 't', content: 'Sospecha de trastorno.' },
      CLOCK,
    );
    expect(clin.accepted).toBe(true);
    expect(clin.state.notes).toHaveLength(1);
    expect(clin.state.notes[0].id).toBe('b-note-1');
  });

  it('anti-fraud content is rejected for every role', () => {
    for (const role of ['observational', 'clinical'] as const) {
      const r = addSessionNote(
        createSession({ id: role, role }, CLOCK),
        { author: 't', content: 'Te garantizo la cura milagrosa.' },
        CLOCK,
      );
      expect(r.accepted).toBe(false);
    }
  });

  it('summary and exercise gates move stages and store safe content', () => {
    let s = createSession({ id: 'sess', role: 'observational' }, CLOCK);
    const sum = setSessionSummary(s, 'Sesión centrada en Hod y Yesod.', CLOCK);
    expect(sum.accepted).toBe(true);
    expect(sum.state.summary).toContain('Hod');

    const ex = addExercise(
      sum.state,
      { title: 'Observación simbólica', description: 'Explorar el sendero Hod-Yesod en casa.' },
      CLOCK,
    );
    expect(ex.accepted).toBe(true);
    expect(ex.state.exercises[0].id).toBe('sess-exercise-1');
    expect(ex.state.stage).toBe('exercises');
  });
});

describe('session orchestrator — lifecycle', () => {
  it('records stage transitions and closes', () => {
    const tree = buildTree();
    let s = createSession({ id: 'sess' }, CLOCK);
    s = attachStructuralState(s, tree, undefined, CLOCK);
    s = recordConsent(s, { grantedBy: 't' }, CLOCK);
    s = attachInterpretation(s, makeInterpretation(tree), CLOCK).state;
    s = closeSession(s, CLOCK);
    expect(s.stage).toBe('closed');
    expect(s.history.some((h) => h.to === 'structural')).toBe(true);
    expect(s.history.some((h) => h.to === 'assisted_interpretation')).toBe(true);
    expect(s.history.some((h) => h.to === 'closed')).toBe(true);
  });
});
