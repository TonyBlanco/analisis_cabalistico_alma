import { describe, it, expect } from 'vitest';
import { sweepInterpretationForRole } from '../interpretation-safety';
import { adaptGenericMethodToTree } from '../generic-method-adapter';
import type { GenericSymbolicState } from '../generic-method-adapter';
import type { SymbolicInterpretation } from '../symbolic-interpreter.types';

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

const tree = adaptGenericMethodToTree(genericState);

function makeInterpretation(): SymbolicInterpretation {
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

describe('sweepInterpretationForRole', () => {
  it('observational drops clinical-lexicon AND anti-fraud observations', () => {
    const res = sweepInterpretationForRole(makeInterpretation(), 'observational');
    expect(res.removed).toBe(2);
    expect(res.interpretation.observations).toHaveLength(1);
    expect(res.interpretation.safetyValidation.passed).toBe(false);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it('clinical keeps clinical observation but still drops anti-fraud', () => {
    const res = sweepInterpretationForRole(makeInterpretation(), 'clinical');
    expect(res.removed).toBe(1);
    expect(res.interpretation.observations).toHaveLength(2);
    expect(res.interpretation.safetyValidation.passed).toBe(false);
  });

  it('defaults to observational when no role is provided', () => {
    const res = sweepInterpretationForRole(makeInterpretation());
    expect(res.removed).toBe(2);
  });

  it('leaves a fully safe interpretation untouched and passing', () => {
    const safe: SymbolicInterpretation = {
      sourceState: tree,
      timestamp: '2026-06-10T00:00:00.000Z',
      safetyLevel: 'educational',
      observations: [
        {
          type: 'structural-analysis',
          title: 'Panorama',
          content: 'Foco estructural en el sendero Hod-Yesod.',
          containsProhibitedContent: false,
        },
      ],
      safetyValidation: { passed: true, warnings: [] },
    };
    const res = sweepInterpretationForRole(safe, 'clinical');
    expect(res.removed).toBe(0);
    expect(res.interpretation.observations).toHaveLength(1);
    expect(res.interpretation.safetyValidation.passed).toBe(true);
  });
});
