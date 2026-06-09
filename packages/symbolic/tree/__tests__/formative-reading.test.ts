import { describe, it, expect } from 'vitest';
import { adaptGenericMethodToTree } from '../generic-method-adapter';
import { analyzeTreeState } from '../tree-analysis';
import { buildFormativeBrief, methodContextFromSymbolicState } from '../formative-reading';
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
    expect(brief.dominantSefirot[0].therapistNote.length).toBeGreaterThan(20);
    expect(brief.processArc.toLowerCase()).toContain('hod');
    expect(brief.sessionQuestions.length).toBeGreaterThanOrEqual(4);
    expect(brief.interventionAngles.length).toBeGreaterThanOrEqual(3);
    expect(brief.transferentialCues.length).toBeGreaterThanOrEqual(2);
    expect(brief.methodBridge.some((l) => l.includes('Esencia'))).toBe(true);
    expect(brief.disclaimer).toContain('No constituye diagnóstico');
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