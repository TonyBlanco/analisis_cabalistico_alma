import { describe, it, expect } from 'vitest';
import { adaptGenericMethodToTree } from '../generic-method-adapter';
import { analyzeTreeState } from '../tree-analysis';
import {
  buildFormativeBrief,
  methodContextFromSymbolicState,
  FormativeBriefSafetyGateError,
} from '../formative-reading';
import {
  collectFormativeBriefTextChunks,
  validateSafetyContent,
} from '../formative-safety';
import { SYMBOLIC_INTERPRETER_META } from '../symbolic-interpreter.types';
import type { GenericSymbolicState } from '../generic-method-adapter';

const hodManifestState: GenericSymbolicState = {
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

const chesedHeavyState: GenericSymbolicState = {
  methodId: 'pitagoras',
  methodName: 'Pitágoras',
  primaryNumbers: [
    { key: 'esencia', label: 'Esencia', value: 4, weight: 1 },
    { key: 'expresion', label: 'Expresión', value: 4, weight: 0.95 },
    { key: 'herencia', label: 'Herencia', value: 6, weight: 0.85 },
    { key: 'camino', label: 'Camino de Vida', value: 4, weight: 0.8 },
  ],
  inclusionMap: {
    4: { frequency: 4, isAbsent: false, isDominant: true },
    6: { frequency: 2, isAbsent: false, isDominant: false },
    1: { frequency: 0, isAbsent: true, isDominant: false },
  },
};

function briefWithoutTimestamp(brief: ReturnType<typeof buildFormativeBrief>) {
  const { generatedAt: _g, ...rest } = brief;
  return rest;
}

function assertNoProhibitedTerms(brief: ReturnType<typeof buildFormativeBrief>) {
  for (const chunk of collectFormativeBriefTextChunks(brief)) {
    const lower = chunk.toLowerCase();
    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
      expect(lower).not.toContain(term.toLowerCase());
    }
  }
}

describe('buildFormativeBrief', () => {
  it('produces therapist-oriented sections for hod→yesod→malchut pattern', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const ctx = methodContextFromSymbolicState({
      ...hodManifestState,
      primaryNumbers: hodManifestState.primaryNumbers.map((n) => ({
        ...n,
        meaning: {
          titulo: n.value === 8 ? 'El Realista' : n.value === 9 ? 'El Humanitario' : 'El Constructor',
          cualidad: n.value === 8 ? 'Materialización' : 'Orden',
        },
      })),
    });
    const brief = buildFormativeBrief(tree, analysis, ctx);

    expect(brief.headline.length).toBeGreaterThan(10);
    expect(brief.workingHypothesis).toContain('Hipótesis de trabajo');
    expect(brief.dominantSefirot.some((s) => s.id === 'hod' || s.id === 'yesod')).toBe(true);
    expect(brief.dominantSefirot[0].therapistNote).toMatch(/podría|polo/i);
    expect(brief.processArc.toLowerCase()).toContain('hod');
    expect(brief.sessionQuestions.length).toBeGreaterThanOrEqual(4);
    expect(brief.interventionAngles.length).toBeGreaterThanOrEqual(3);
    expect(brief.transferentialCues.length).toBeGreaterThanOrEqual(2);
    expect(brief.methodBridge.some((l) => l.includes('Esencia'))).toBe(true);
    expect(brief.disclaimer).toContain('No constituye evaluación clínica');
  });

  it('narrates active paths with human labels', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const brief = buildFormativeBrief(tree, analysis);

    if (brief.pathProcesses.length > 0) {
      expect(brief.pathProcesses[0].narrative.length).toBeGreaterThan(10);
      expect(brief.pathProcesses[0].fromLabel).not.toBe(brief.pathProcesses[0].pathId);
    }
  });

  it('includes pillar and olam axes readings', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const brief = buildFormativeBrief(tree, analysis);

    expect(brief.pillarAxes.length).toBe(3);
    expect(brief.pillarAxes[0].therapeuticAngle.length).toBeGreaterThan(10);
    expect(brief.olamAxes.length).toBeGreaterThan(0);
  });

  it('bridges clinical context when provided', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const brief = buildFormativeBrief(tree, analysis, undefined, {
      ritmoState: 'fluido',
      harmonyIndex: 0.72,
      illuminatedSefirot: ['Hod', 'Yesod'],
    });

    expect(brief.clinicalBridge.some((l) => l.includes('Ritmo álmico'))).toBe(true);
    expect(brief.clinicalBridge.some((l) => l.includes('armonía'))).toBe(true);
  });
});

describe('buildFormativeBrief — determinism (FIX-3.3)', () => {
  it('same inputs produce identical brief when generatedAt is fixed', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const ctx = methodContextFromSymbolicState(hodManifestState);
    const clinical = { ritmoState: 'latente', harmonyIndex: 0.5, illuminatedSefirot: ['Hod'] };
    const opts = { generatedAt: '2026-06-09T12:00:00.000Z' };

    const a = buildFormativeBrief(tree, analysis, ctx, clinical, opts);
    const b = buildFormativeBrief(tree, analysis, ctx, clinical, opts);

    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('default generatedAt is empty for reproducible symbolic payload', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);
    const brief = buildFormativeBrief(tree, analysis);

    expect(brief.generatedAt).toBe('');
    const once = briefWithoutTimestamp(brief);
    const twice = briefWithoutTimestamp(buildFormativeBrief(tree, analysis));
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });
});

describe('buildFormativeBrief — safety gate (FIX-3.1)', () => {
  it('output contains no prohibited terms across representative inputs', () => {
    const cases = [
      { state: hodManifestState, clinical: undefined },
      { state: chesedHeavyState, clinical: { ritmoState: 'fragmentado', harmonyIndex: 0.2 } },
      {
        state: hodManifestState,
        clinical: {
          mundoPredominante: 'Yetzirah',
          illuminatedSefirot: ['Hod', 'Keter', 'Chesed'],
          ritmoState: 'forzado',
          harmonyIndex: 0.91,
        },
      },
    ];

    for (const { state, clinical } of cases) {
      const tree = adaptGenericMethodToTree(state);
      const analysis = analyzeTreeState(tree);
      const ctx = methodContextFromSymbolicState(state);
      const brief = buildFormativeBrief(tree, analysis, ctx, clinical);
      assertNoProhibitedTerms(brief);
    }
  });

  it('sanitizes dynamic clinicalBridge injection with prohibited terms', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);

    const brief = buildFormativeBrief(tree, analysis, undefined, {
      mundoPredominante: 'trastorno siempre presente',
      illuminatedSefirot: ['debes cambiar'],
      ritmoState: 'nunca fluido',
    });

    assertNoProhibitedTerms(brief);
    expect(brief.clinicalBridge.length).toBeGreaterThan(0);
    for (const line of brief.clinicalBridge) {
      expect(validateSafetyContent(line).passed).toBe(true);
    }
  });

  it('throwOnSafetyViolation surfaces gate failures without emitting unsafe text', () => {
    const tree = adaptGenericMethodToTree(hodManifestState);
    const analysis = analyzeTreeState(tree);

    expect(() =>
      buildFormativeBrief(tree, analysis, undefined, {
        mundoPredominante: 'patología estructural',
      }, { throwOnSafetyViolation: true }),
    ).toThrow(FormativeBriefSafetyGateError);

    const safe = buildFormativeBrief(tree, analysis, undefined, {
      mundoPredominante: 'patología estructural',
    });
    assertNoProhibitedTerms(safe);
  });
});