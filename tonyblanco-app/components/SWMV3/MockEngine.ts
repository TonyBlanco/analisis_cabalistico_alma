"use client";

import type { ExampleArcanaV3 } from '../../../src/symbolic/tarot/decks/example_ai_v3';

export type SwmV3Reading = {
  id: string;
  summary: string;
  themes: string[];
  correspondences: string[];
  caution: string;
  cards: Array<Pick<ExampleArcanaV3, 'id' | 'name' | 'symbolicKeywords' | 'educationalThemes'>>;
};

// Deterministic mock engine for Phase 2. NO IA. NO persistence.
export function runMockInterpretation(): SwmV3Reading {
  // Require the example deck as data-only
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const deck = require('../../../src/symbolic/tarot/decks/example_ai_v3')?.EXAMPLE_AI_V3_MAJOR_ARCANA || [];

  const selected = deck.slice(0, 3).map((c: any) => ({
    id: c.id,
    name: c.name,
    symbolicKeywords: c.symbolicKeywords || [],
    educationalThemes: c.educationalThemes || [],
  }));

  const themes = Array.from(new Set(selected.flatMap((s) => s.educationalThemes))).slice(0, 5);
  const correspondences = Array.from(new Set(selected.flatMap((s) => s.symbolicKeywords))).slice(0, 8);

  const reading: SwmV3Reading = {
    id: 'swm-v3-mock-' + selected.map((s) => s.id).join('-'),
    summary:
      'Lectura educativa generada por motor mock: enfoque simbólico y formativo, sin prescripciones.',
    themes,
    correspondences,
    caution: 'Lectura educativa (mock) — no es consejo ni diagnóstico clínico.',
    cards: selected,
  };

  return reading;
}

export default runMockInterpretation;
