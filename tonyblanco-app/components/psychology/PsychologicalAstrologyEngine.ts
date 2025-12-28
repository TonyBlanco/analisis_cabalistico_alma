import { PsychAstroInput, PsychAstroOutline } from './types';

function pick<T>(arr: T[], n = 3) {
  return arr.slice(0, n);
}

// NOTE: This engine returns symbolic, non-diagnostic language. Editable by the professional.
export function generatePsychAstroOutline(input: PsychAstroInput): PsychAstroOutline {
  const planets = input.planetary_positions || [];
  const houses = input.house_emphasis || [];
  const aspects = input.dominant_aspects || [];

  // Core identity: synthesize Sun/Moon/Asc if available
  const sun = planets.find((p) => /^Sun$/i.test(p.name));
  const moon = planets.find((p) => /^Moon$/i.test(p.name));
  const asc = (input.natal_chart_snapshot && input.natal_chart_snapshot.ascendant) || planets.find((p) => p.name === 'Asc');

  const coreParts: string[] = [];
  if (sun) coreParts.push(`Sol en ${sun.sign || Math.round(sun.deg)}°`);
  if (moon) coreParts.push(`Luna en ${moon.sign || Math.round(moon.deg)}°`);
  if (asc) coreParts.push(`Ascendente ${asc.sign || Math.round((asc as any).deg || 0)}°`);

  const angularPlanets = planets.filter((p) => (typeof (p as any).house === 'number') && (((p as any).house <= 3) || ((p as any).house >= 10)));
  const dominantArchetypes = angularPlanets.map((p) => `${p.name} (angular)`).concat(planets.slice(0, 3).map((p) => `${p.name}`));

  const tensionAspects = aspects.filter((a) => /square|opp|opposition|conjunction/i.test(a.type) || /square/i.test(a.type));
  const shadow = tensionAspects.map((a) => `${a.type}: ${a.bodies.join('-')}`);

  const conflicts = tensionAspects.length ? shadow.slice(0, 3) : ['Tensiones menores identificadas por aspectos cerrados.'];

  const individuation: string[] = [];
  if (houses.length) {
    const strongHouse = houses.sort((a, b) => b.weight - a.weight)[0];
    if (strongHouse) individuation.push(`Enfoque de individuación en casa ${strongHouse.house}`);
  }
  individuation.push('Trabajo simbólico recomendado: integrar polaridades y cultivar imágenes internas.');

  const outline: PsychAstroOutline = {
    core_identity: coreParts.join(' · ') || 'Datos insuficientes para una síntesis arquetípica completa.',
    dominant_archetypes: pick(Array.from(new Set(dominantArchetypes))),
    shadow_dynamics: pick(Array.from(new Set(shadow))),
    internal_conflicts: pick(Array.from(new Set(conflicts))),
    individuation_path: pick(individuation, 4),
    relational_patterns: ['Patrones relacionales sugeridos por posiciones lunares y Venus/Marte.'],
    vocation_symbols: ['Sugerencias simbólicas derivadas de casas de trabajo y regentes.'],
    child_archetypes: ['Imágenes tempranas evocadas por Luna y cúspides angulares.'],
  };

  return outline;
}

export default { generatePsychAstroOutline };
