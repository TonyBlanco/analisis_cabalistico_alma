import type { AdvancedChartInput } from '../chart/chartTypes';

export type PsychProfile = {
  dominantArchetypes: Array<{ planet: string; reason: string; weight: number }>;
  shadowConflicts: Array<{ pattern: string; evidence: string[]; weight: number }>;
  individuationKeys: Array<{ theme: string; evidence: string[] }>;
  relationshipThemes: Array<{ theme: string; evidence: string[] }>;
  vocationThemes: Array<{ theme: string; evidence: string[] }>;
  sevenSinsArchetypes: Array<{ archetype: string; evidence: string[] }>;
  notes: string[];
};

// Deterministic symbolic engine: no invented text, only derives from chart structures
export function buildPsychProfile(input: AdvancedChartInput): PsychProfile {
  const planets = input.planets;
  const aspects = input.aspects;

  // Dominance by angularity (in houses 1/4/7/10) + number of aspects
  const angularPlanets = planets.filter(p => [1,4,7,10].includes(p.house));
  const aspectCounts: Record<string, number> = {};
  aspects.forEach(a => { aspectCounts[a.a] = (aspectCounts[a.a]||0)+1; aspectCounts[a.b] = (aspectCounts[a.b]||0)+1; });

  const dominantArchetypes = planets
    .map(p => ({ planet: p.key, score: (angularPlanets.find(ap=>ap.key===p.key)?3:0) + (aspectCounts[p.key]||0) }))
    .sort((a,b)=>b.score-a.score)
    .slice(0,5)
    .map(d => ({ planet: d.planet, reason: `angular:${angularPlanets.some(ap=>ap.key===d.planet)} aspects:${aspectCounts[d.planet]||0}`, weight: d.score }));

  // Shadow conflicts: find squares/oppositions involving luminaries (sun/moon) or ASC regent
  const shadow = aspects.filter(a => ['square','opposition'].includes(a.type)).map(a => {
    return { pattern: `${a.a}-${a.b} ${a.type}`, evidence: [a.type], weight: Math.max(1, 3 - Math.abs(a.orb || 0)) };
  });

  // Individuation keys: trines/sextiles to luminaries
  const individ = aspects.filter(a => ['trine','sextile'].includes(a.type)).map(a=>({ theme: `${a.a}↔${a.b}`, evidence:[a.type]})).slice(0,6);

  // Relationship & vocation themes heuristic
  const relationshipThemes = [] as Array<{theme:string; evidence:string[]}>;
  const vocationThemes = [] as Array<{theme:string; evidence:string[]}>;

  // Seven sins mapping (symbolic heuristics)
  const sins: Array<{ archetype:string; evidence:string[] }> = [];
  if (planets.some(p=>p.key==='mars' && (aspectCounts['mars']||0)>2)) sins.push({ archetype:'Ira', evidence:['Marte aspectos tensos'] });
  if (planets.some(p=>p.key==='sun' && p.house===10)) sins.push({ archetype:'Orgullo', evidence:['Sol en casa X'] });

  return {
    dominantArchetypes,
    shadowConflicts: shadow,
    individuationKeys: individ,
    relationshipThemes,
    vocationThemes,
    sevenSinsArchetypes: sins,
    notes: ['Lectura simbólica y orientativa — no clínica.']
  };
}
