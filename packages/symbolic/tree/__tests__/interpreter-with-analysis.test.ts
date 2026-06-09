import { describe, it, expect } from 'vitest';
import {
  generateSymbolicInterpretation,
  validateTreeStateForInterpretation,
} from '../symbolic-interpreter';
import { analyzeTreeState } from '../tree-analysis';
import { SYMBOLIC_INTERPRETER_META } from '../symbolic-interpreter.types';
import type { TreeStructuralState } from '../tree-structural-state.types';

const sampleState: TreeStructuralState = {
  source: { method: 'pitagoras', mode: 'manual', timestamp: '2026-01-01T00:00:00.000Z' },
  sefirot: [
    { id: 'keter',   activation: 0.9, role: 'dominant',  pillar: 'equilibrium', triad: 'supernal', olam: 'atziluth' },
    { id: 'tiferet', activation: 0.7, role: 'dominant',  pillar: 'equilibrium', triad: 'ethical',  olam: 'yetzirah' },
    { id: 'yesod',   activation: 0.5, role: 'present',   pillar: 'equilibrium', triad: 'astral',   olam: 'yetzirah' },
    { id: 'malchut', activation: 0.4, role: 'present',   pillar: 'equilibrium', triad: 'receptacle', olam: 'assiah' },
    { id: 'chesed',  activation: 0.6, role: 'present',   pillar: 'mercy',       triad: 'ethical',  olam: 'yetzirah' },
    { id: 'gevurah', activation: 0.3, role: 'latent',    pillar: 'severity',    triad: 'ethical',  olam: 'yetzirah' },
    { id: 'chokmah', activation: 0.8, role: 'dominant',  pillar: 'mercy',       triad: 'supernal', olam: 'beriah' },
    { id: 'binah',   activation: 0.65, role: 'present',  pillar: 'severity',    triad: 'supernal', olam: 'beriah' },
    { id: 'netzach', activation: 0.45, role: 'present',  pillar: 'mercy',       triad: 'astral',   olam: 'yetzirah' },
    { id: 'hod',     activation: 0.35, role: 'latent',   pillar: 'severity',    triad: 'astral',   olam: 'yetzirah' },
  ],
  flows: [
    { from: 'keter',   to: 'tiferet',  polarity: 'harmonic',    intensity: 0.85, direction: 'down', pathId: 'keter-tiferet' },
    { from: 'tiferet', to: 'yesod',    polarity: 'harmonic',    intensity: 0.65, direction: 'down', pathId: 'tiferet-yesod' },
    { from: 'yesod',   to: 'malchut',  polarity: 'integrative', intensity: 0.55, direction: 'down', pathId: 'yesod-malchut' },
    { from: 'chesed',  to: 'gevurah',  polarity: 'tensional',   intensity: 0.45, direction: 'lateral' },
  ],
};

describe('generateSymbolicInterpretation — with structural analysis', () => {
  it('accepted interpretation has observations filtered for prohibited content', async () => {
    const analysis = analyzeTreeState(sampleState);

    let capturedPrompt = '';
    const mockAI = async (prompt: string): Promise<string> => {
      capturedPrompt = prompt;
      return JSON.stringify({
        observations: [
          { type: 'structural-analysis', title: 'Equilibrium dominance', content: 'The middle pillar carries the majority of activation.' },
          { type: 'pattern-recognition', title: 'Harmonic vertical axis', content: 'Dominant harmonic flows trace the central column from Keter to Malchut.' },
          { type: 'educational-context', title: 'Pitagoras mapping', content: 'This method maps numerical frequency to sefirot, emphasizing the vertical axis.' },
          { type: 'symbolic-comparison', title: 'Structural cues', content: 'Practitioners may observe the degree of triad coherence across the three pillars.' },
        ],
      });
    };

    const result = await generateSymbolicInterpretation(
      { treeState: sampleState, safetyLevel: 'observational', structuralAnalysis: analysis },
      mockAI,
    );

    expect(result.safetyValidation.passed).toBe(true);
    expect(result.observations.length).toBeGreaterThan(0);
    expect(capturedPrompt).toContain('Pillar balance');
    expect(capturedPrompt).toContain('Triad activation');
  });

  it('analysis data in prompt contains no prohibited terms', async () => {
    const analysis = analyzeTreeState(sampleState);
    const serialized = JSON.stringify(analysis).toLowerCase();
    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
      expect(serialized).not.toContain(term.toLowerCase());
    }
  });

  it('injecting a prohibited term in AI response sets containsProhibitedContent', async () => {
    const analysis = analyzeTreeState(sampleState);

    const mockAI = async (_prompt: string): Promise<string> =>
      JSON.stringify({
        observations: [
          { type: 'structural-analysis', title: 'Test', content: 'This is a diagnóstico clínico pattern.' },
        ],
      });

    const result = await generateSymbolicInterpretation(
      { treeState: sampleState, safetyLevel: 'educational', structuralAnalysis: analysis },
      mockAI,
    );

    expect(result.safetyValidation.passed).toBe(false);
    expect(result.observations).toHaveLength(0);
    expect(result.safetyValidation.warnings.length).toBeGreaterThan(0);
  });

  it('injects jewish-traditional correspondence reference without prohibited terms', async () => {
    const analysis = analyzeTreeState(sampleState);

    let capturedPrompt = '';
    const mockAI = async (prompt: string): Promise<string> => {
      capturedPrompt = prompt;
      return JSON.stringify({
        observations: [
          { type: 'structural-analysis', title: 'Reference context', content: 'Structural observation with traditional tables available.' },
        ],
      });
    };

    const result = await generateSymbolicInterpretation(
      {
        treeState: sampleState,
        safetyLevel: 'observational',
        structuralAnalysis: analysis,
        correspondenceSystem: 'jewish-traditional',
      },
      mockAI,
    );

    expect(result.safetyValidation.passed).toBe(true);
    expect(capturedPrompt).toContain('CORRESPONDENCE REFERENCE (jewish-traditional');
    expect(capturedPrompt).toContain('divineName=Eheieh');
    expect(capturedPrompt).toContain('class=double');
    expect(capturedPrompt).not.toContain('Tzimtzum');
    expect(capturedPrompt).not.toContain('Tikkun');

    const correspondenceSection = capturedPrompt
      .split('## CORRESPONDENCE REFERENCE')[1]
      ?.split('---')[0]
      ?.toLowerCase() ?? '';
    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
      expect(correspondenceSection).not.toContain(term.toLowerCase());
    }
  });

  it('injects hermetic-golden-dawn correspondence reference when selected', async () => {
    let capturedPrompt = '';
    const mockAI = async (prompt: string): Promise<string> => {
      capturedPrompt = prompt;
      return JSON.stringify({
        observations: [
          { type: 'structural-analysis', title: 'Hermetic ref', content: 'Structural observation.' },
        ],
      });
    };

    await generateSymbolicInterpretation(
      {
        treeState: sampleState,
        safetyLevel: 'educational',
        correspondenceSystem: 'hermetic-golden-dawn',
      },
      mockAI,
    );

    expect(capturedPrompt).toContain('CORRESPONDENCE REFERENCE (hermetic-golden-dawn');
    expect(capturedPrompt).toContain('kingScaleColor=');
  });

  it('works without structuralAnalysis (backwards compatible)', async () => {
    const mockAI = async (_prompt: string): Promise<string> =>
      JSON.stringify({
        observations: [
          { type: 'structural-analysis', title: 'Test', content: 'Structural observation.' },
        ],
      });

    const result = await generateSymbolicInterpretation(
      { treeState: sampleState, safetyLevel: 'educational' },
      mockAI,
    );

    expect(result.observations.length).toBeGreaterThan(0);
  });
});

describe('validateTreeStateForInterpretation', () => {
  it('valid 10-sefirot state passes', () => {
    const fullState: TreeStructuralState = {
      ...sampleState,
      sefirot: [
        { id: 'keter',   activation: 0.9, role: 'dominant' },
        { id: 'chokmah', activation: 0.8, role: 'dominant' },
        { id: 'binah',   activation: 0.7, role: 'present' },
        { id: 'chesed',  activation: 0.6, role: 'present' },
        { id: 'gevurah', activation: 0.5, role: 'present' },
        { id: 'tiferet', activation: 0.4, role: 'latent' },
        { id: 'netzach', activation: 0.3, role: 'latent' },
        { id: 'hod',     activation: 0.2, role: 'latent' },
        { id: 'yesod',   activation: 0.1, role: 'latent' },
        { id: 'malchut', activation: 0.05, role: 'latent' },
      ],
    };
    expect(validateTreeStateForInterpretation(fullState).valid).toBe(true);
  });
});
