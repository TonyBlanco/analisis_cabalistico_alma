// EXAMPLE / NON-PRODUCTION
// SWM v3 Phase 1 example deck (symbolic data only)
// - 3 arcanos maximum
// - Educational, symbolic, non-deterministic language
// - No functions, no logic, data-only

export interface ExampleArcanaV3 {
  id: string;
  name: string;
  arcanaType: 'major' | 'minor';
  symbolicKeywords: string[];
  educationalThemes: string[];
  interpretativeHints: string; // brief, educational, non-prescriptive
  sources: string[]; // metadata only, no literal quotes
  example: true;
  nonProduction: true;
}

export const EXAMPLE_AI_V3_MAJOR_ARCANA: ExampleArcanaV3[] = [
  {
    id: 'the_fool_example',
    name: 'The Fool (EXAMPLE)',
    arcanaType: 'major',
    symbolicKeywords: ['beginnings', 'openness', 'potential'],
    educationalThemes: ['curiosity', 'thresholds', 'new cycles'],
    interpretativeHints:
      'Observe patterns of openness and potential; encourage questions rather than prescriptions.',
    sources: ['example: symbolic mapping'],
    example: true,
    nonProduction: true,
  },
  {
    id: 'the_magician_example',
    name: 'The Magician (EXAMPLE)',
    arcanaType: 'major',
    symbolicKeywords: ['agency', 'focus', 'skill'],
    educationalThemes: ['resource awareness', 'intentionality'],
    interpretativeHints:
      'Highlight available resources and methods; frame as exploratory options for the consultante.',
    sources: ['example: symbolic mapping'],
    example: true,
    nonProduction: true,
  },
  {
    id: 'the_high_priestess_example',
    name: 'The High Priestess (EXAMPLE)',
    arcanaType: 'major',
    symbolicKeywords: ['intuition', 'inner knowledge', 'threshold'],
    educationalThemes: ['reflective practice', 'listening to process'],
    interpretativeHints:
      'Invite reflective inquiry and note tensions between inner knowing and external demands.',
    sources: ['example: symbolic mapping'],
    example: true,
    nonProduction: true,
  },
];

export default EXAMPLE_AI_V3_MAJOR_ARCANA;
