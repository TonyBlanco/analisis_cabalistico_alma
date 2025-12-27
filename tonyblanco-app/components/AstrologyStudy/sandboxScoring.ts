'use client';

type Aspect = { from: string; to: string; type: string; orb?: number };
type PlanetPlacement = { name: string; house: number; element?: string; modality?: string };

export type SandboxScore = {
  id: string;
  name: string;
  value: number | 'N/A';
  variablesUsed: string[];
  formulaText: string;
  limitationsText: string;
};

const TENSION_TYPES = new Set(['square', 'opposition', 'quincunx']);
const HARMONIC_TYPES = new Set(['trine', 'sextile', 'conjunction']);

function safeDivision(num: number, den: number) {
  return den === 0 ? 0 : num / den;
}

export function computeSandboxScores(aspects: Aspect[], placements: PlanetPlacement[]): SandboxScore[] {
  const totalAspects = aspects.length;
  const tensionCount = aspects.filter((a) => TENSION_TYPES.has(a.type)).length;
  const harmonyCount = aspects.filter((a) => HARMONIC_TYPES.has(a.type)).length;

  const density: SandboxScore = {
    id: 'density_aspects',
    name: 'Densidad de aspectos',
    value: totalAspects,
    variablesUsed: ['#aspectos_visibles'],
    formulaText: '#aspectos_visibles',
    limitationsText: 'No pondera relevancia. Solo conteo visible.',
  };

  const ratio: SandboxScore = {
    id: 'tension_harmony_ratio',
    name: 'Ratio tensión/armonía',
    value: Number(safeDivision(tensionCount, Math.max(1, harmonyCount)).toFixed(2)),
    variablesUsed: ['#tensos', '#armónicos'],
    formulaText: '#tensos / max(1, #armónicos)',
    limitationsText: 'No incluye significados. Solo clasifica por tipo de aspecto.',
  };

  const houseFreq: Record<number, number> = {};
  placements.forEach((p) => {
    houseFreq[p.house] = (houseFreq[p.house] || 0) + 1;
  });
  const totalPlanets = placements.length || 1;
  const maxHouseCount = Math.max(...Object.values(houseFreq), 0);
  const houseConcentration: SandboxScore = {
    id: 'house_concentration',
    name: 'Concentración por casas',
    value: Number((maxHouseCount / totalPlanets).toFixed(2)),
    variablesUsed: ['planetas_por_casa', 'total_planetas'],
    formulaText: 'max(planetas_por_casa) / total_planetas',
    limitationsText: 'No evalúa significado; solo distribución.',
  };

  const angularity: SandboxScore = {
    id: 'angularity_count',
    name: 'Angularidad (1/4/7/10)',
    value: placements.filter((p) => [1, 4, 7, 10].includes(p.house)).length,
    variablesUsed: ['planetas_en_1_4_7_10'],
    formulaText: 'conteo(planetas en casas 1,4,7,10)',
    limitationsText: 'No pondera dignidad ni velocidad. Solo posición en casas angulares.',
  };

  const elementsAvailable = placements.some((p) => p.element) && placements.length > 0;
  let elementValue: number | 'N/A' = 'N/A';
  if (elementsAvailable) {
    const freq: Record<string, number> = {};
    placements.forEach((p) => {
      if (!p.element) return;
      freq[p.element] = (freq[p.element] || 0) + 1;
    });
    const maxElement = Math.max(...Object.values(freq), 0);
    elementValue = Number((maxElement / placements.length).toFixed(2));
  }
  const elementMode: SandboxScore = {
    id: 'element_mode_distribution',
    name: 'Dominancia elemento/modo',
    value: elementValue,
    variablesUsed: ['elementos?'],
    formulaText: elementsAvailable ? 'max(% por elemento)' : 'no disponible en payload',
    limitationsText: elementsAvailable ? 'Solo distribución; no pondera fortaleza.' : 'Dataset no expone elemento/modo.',
  };

  const structuralComplexity: SandboxScore = {
    id: 'structural_complexity',
    name: 'Complejidad estructural (didáctica)',
    value: Number(
      (
        0.35 * (typeof density.value === 'number' ? density.value : 0) +
        0.25 * (typeof angularity.value === 'number' ? angularity.value : 0) +
        0.2 * (typeof houseConcentration.value === 'number' ? houseConcentration.value : 0) +
        0.2 * (typeof ratio.value === 'number' ? ratio.value : 0)
      ).toFixed(2)
    ),
    variablesUsed: ['densidad', 'angularidad', 'concentración', 'ratio tensión'],
    formulaText: '0.35*densidad + 0.25*angularidad + 0.20*concentración + 0.20*ratio',
    limitationsText: 'Peso fijo, con fines pedagógicos. No es médico ni predictivo.',
  };

  return [density, ratio, houseConcentration, angularity, elementMode, structuralComplexity];
}
