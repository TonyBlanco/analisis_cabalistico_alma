import { CrossInput, CrossInsights } from './types';

export function mapCrossInsights(input: CrossInput): CrossInsights {
  const outline = input.psych_astrology_outline;
  const tests = input.psychological_tests_results || {};

  const resonances = [] as any[];
  const convergences = [] as any[];
  const divergences = [] as any[];

  // Simple heuristic mappings (symbolic only)
  if (outline.vocation_symbols && outline.vocation_symbols.length) {
    resonances.push({
      label: 'Vocación simbólica',
      description: `Sugerencias: ${outline.vocation_symbols.join(', ')}`,
      evidence: ['Casa 10 / regente fuerte']
    });
  }

  if (tests && tests.summary && typeof tests.summary === 'string') {
    convergences.push({
      label: 'Resumen test',
      description: `Resumen proporcionado por tests: ${tests.summary}`,
      evidence: []
    });
  }

  // divergence heuristic: when tests highlight regulation issues but astrology shows stabilizing Saturn
  if (tests && tests.flags && tests.flags.includes && Array.isArray(tests.flags)) {
    if (tests.flags.includes('regulation_issues')) {
      divergences.push({
        label: 'Regulación emocional (tests vs astro)',
        description: 'Tests indican dificultades regulatorias; la carta muestra estructuras que pueden ser recursos o tensiones.',
        evidence: ['Luna / Saturno / casas angulares']
      });
    }
  }

  return {
    symbolic_resonances: resonances,
    convergences,
    divergences,
  } as CrossInsights;
}

export default { mapCrossInsights };
