/**
 * Sefirot Radar - Computation Engine
 * 
 * Motor de cálculo que integra múltiples fuentes de datos
 * para generar el radar de desequilibrios sefiróticos.
 */

import type {
  SefiraId,
  DataSource,
  ClinicalTestData,
  BiographyData,
  CabalisticCalcData,
  SymbolicSystemData,
  SefiraScore,
  PillarAnalysis,
  Imbalance,
  WorkRecommendation,
  SefirotRadarResult,
} from './types';

import {
  SEFIROT_DATA,
  PILLARS_DATA,
  NUMBER_TO_SEFIRA,
  getEnergyState,
  getEnergyStateColor,
  getEnergyStateLabel,
  ENERGY_THRESHOLDS,
} from './sefirot-data';

import { findTestMapping, findBiographyImpacts } from './clinical-mappings';

// ============================================================================
// DEFAULT WEIGHTS FOR DATA SOURCES
// ============================================================================

const DEFAULT_WEIGHTS: Record<DataSource['source'], number> = {
  'clinical-test': 0.35,
  'cabalistic-calc': 0.30,
  'biography': 0.20,
  'symbolic-system': 0.15,
};

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

export function computeSefirotRadar(
  dataSources: DataSource[],
  options?: {
    /** Override default weights */
    customWeights?: Partial<Record<DataSource['source'], number>>;
    /** Base level for sefirot with no data (default: 50) */
    baseLevel?: number;
  }
): SefirotRadarResult {
  const weights = { ...DEFAULT_WEIGHTS, ...options?.customWeights };
  const baseLevel = options?.baseLevel ?? 50;
  
  // Initialize accumulators for each sefira
  const sefirotAccumulators: Record<SefiraId, {
    totalWeight: number;
    weightedSum: number;
    contributors: SefiraScore['contributors'];
  }> = {} as any;
  
  const allSefirot: SefiraId[] = [
    'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
    'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'
  ];
  
  for (const sefiraId of allSefirot) {
    sefirotAccumulators[sefiraId] = {
      totalWeight: 0,
      weightedSum: 0,
      contributors: [],
    };
  }
  
  // Process each data source
  for (const source of dataSources) {
    const sourceWeight = source.weight ?? weights[source.source];
    
    switch (source.source) {
      case 'clinical-test':
        processClinicalTest(source, sourceWeight, sefirotAccumulators);
        break;
      case 'biography':
        processBiography(source, sourceWeight, sefirotAccumulators);
        break;
      case 'cabalistic-calc':
        processCabalisticCalc(source, sourceWeight, sefirotAccumulators);
        break;
      case 'symbolic-system':
        processSymbolicSystem(source, sourceWeight, sefirotAccumulators);
        break;
    }
  }
  
  // Calculate final scores for each sefira
  const sefirotScores: SefiraScore[] = allSefirot.map(sefiraId => {
    const acc = sefirotAccumulators[sefiraId];
    const def = SEFIROT_DATA[sefiraId];
    
    // Calculate level (weighted average, or base if no data)
    let level: number;
    if (acc.totalWeight > 0) {
      level = Math.round(acc.weightedSum / acc.totalWeight);
    } else {
      level = baseLevel;
    }
    
    // Clamp to 0-100
    level = Math.max(0, Math.min(100, level));
    
    const state = getEnergyState(level);
    const stateDescription = generateStateDescription(sefiraId, state, def);
    
    return {
      id: sefiraId,
      name: def.name,
      hebrewName: def.hebrewName,
      level,
      state,
      pillar: def.pillar,
      contributors: acc.contributors,
      stateDescription,
      color: getEnergyStateColor(state),
    };
  });
  
  // Analyze pillars
  const pillars = analyzePillars(sefirotScores);
  
  // Detect imbalances
  const imbalances = detectImbalances(sefirotScores, pillars);
  
  // Generate recommendations
  const recommendations = generateRecommendations(sefirotScores, imbalances);
  
  // Generate main insight
  const mainInsight = generateMainInsight(sefirotScores, pillars, imbalances);
  
  // Generate summary
  const summary = generateSummary(sefirotScores, pillars, imbalances, recommendations);
  
  // Compile data sources used
  const dataSourcesSummary = dataSources.map(ds => ({
    type: ds.source,
    name: getDataSourceName(ds),
    weight: ds.weight ?? weights[ds.source],
  }));
  
  return {
    generatedAt: new Date().toISOString(),
    sefirot: sefirotScores,
    pillars,
    imbalances,
    recommendations,
    mainInsight,
    summary,
    dataSources: dataSourcesSummary,
  };
}

// ============================================================================
// DATA SOURCE PROCESSORS
// ============================================================================

function processClinicalTest(
  source: ClinicalTestData,
  weight: number,
  accumulators: Record<SefiraId, { totalWeight: number; weightedSum: number; contributors: SefiraScore['contributors'] }>
): void {
  const mapping = findTestMapping(source.testType);
  
  if (mapping) {
    // Use mapping to interpret scores
    for (const scaleMap of mapping.scaleMapping) {
      const score = source.sefirotScores[scaleMap.sefira];
      if (score !== undefined) {
        const effectiveWeight = weight * scaleMap.weight;
        
        // Convert score based on direction
        let contribution: number;
        if (scaleMap.direction === 'negative') {
          contribution = 100 - score; // High clinical score = low sefira energy
        } else if (scaleMap.direction === 'inverted') {
          contribution = 50 + (50 - score) * 0.5; // Complex relationship
        } else {
          contribution = score;
        }
        
        accumulators[scaleMap.sefira].totalWeight += effectiveWeight;
        accumulators[scaleMap.sefira].weightedSum += contribution * effectiveWeight;
        accumulators[scaleMap.sefira].contributors.push({
          source: 'clinical-test',
          name: `${source.testName} (${scaleMap.scaleName})`,
          contribution: Math.round(contribution),
          direction: contribution >= 50 ? 'up' : 'down',
        });
      }
    }
  } else {
    // Direct mapping without interpretation
    for (const [sefiraId, score] of Object.entries(source.sefirotScores)) {
      if (score !== undefined) {
        accumulators[sefiraId as SefiraId].totalWeight += weight;
        accumulators[sefiraId as SefiraId].weightedSum += score * weight;
        accumulators[sefiraId as SefiraId].contributors.push({
          source: 'clinical-test',
          name: source.testName,
          contribution: score,
          direction: score >= 50 ? 'up' : 'down',
        });
      }
    }
  }
}

function processBiography(
  source: BiographyData,
  weight: number,
  accumulators: Record<SefiraId, { totalWeight: number; weightedSum: number; contributors: SefiraScore['contributors'] }>
): void {
  for (const impact of source.impacts) {
    const effectiveWeight = weight * (source.weight ?? 1);
    
    // Convert direction to score
    const contribution = impact.direction === 'overload' 
      ? 50 + (impact.intensity * 0.5) // Move towards high
      : 50 - (impact.intensity * 0.5); // Move towards low
    
    accumulators[impact.sefira].totalWeight += effectiveWeight;
    accumulators[impact.sefira].weightedSum += contribution * effectiveWeight;
    accumulators[impact.sefira].contributors.push({
      source: 'biography',
      name: `${source.category}: ${source.description.substring(0, 30)}...`,
      contribution: Math.round(contribution),
      direction: impact.direction === 'overload' ? 'up' : 'down',
    });
  }
}

function processCabalisticCalc(
  source: CabalisticCalcData,
  weight: number,
  accumulators: Record<SefiraId, { totalWeight: number; weightedSum: number; contributors: SefiraScore['contributors'] }>
): void {
  // Process direct sefirot scores
  for (const [sefiraId, score] of Object.entries(source.sefirotScores)) {
    if (score !== undefined) {
      accumulators[sefiraId as SefiraId].totalWeight += weight;
      accumulators[sefiraId as SefiraId].weightedSum += score * weight;
      accumulators[sefiraId as SefiraId].contributors.push({
        source: 'cabalistic-calc',
        name: source.method,
        contribution: score,
        direction: score >= 50 ? 'up' : 'down',
      });
    }
  }
  
  // Process ausencias (missing numbers = empty sefirot)
  if (source.ausencias) {
    for (const num of source.ausencias) {
      const sefiraId = NUMBER_TO_SEFIRA[num];
      if (sefiraId) {
        const emptyWeight = weight * 0.8;
        const emptyContribution = 25; // Significantly low
        
        accumulators[sefiraId].totalWeight += emptyWeight;
        accumulators[sefiraId].weightedSum += emptyContribution * emptyWeight;
        accumulators[sefiraId].contributors.push({
          source: 'cabalistic-calc',
          name: `${source.method} (ausencia ${num})`,
          contribution: emptyContribution,
          direction: 'down',
        });
      }
    }
  }
  
  // Process dominantes (dominant numbers = overloaded sefirot)
  if (source.dominantes) {
    for (const num of source.dominantes) {
      const sefiraId = NUMBER_TO_SEFIRA[num];
      if (sefiraId) {
        const overloadWeight = weight * 0.8;
        const overloadContribution = 80; // Significantly high
        
        accumulators[sefiraId].totalWeight += overloadWeight;
        accumulators[sefiraId].weightedSum += overloadContribution * overloadWeight;
        accumulators[sefiraId].contributors.push({
          source: 'cabalistic-calc',
          name: `${source.method} (dominante ${num})`,
          contribution: overloadContribution,
          direction: 'up',
        });
      }
    }
  }
  
  // Process current cycle
  if (source.currentCycle) {
    const cycleWeight = weight * 0.5;
    const cycleContribution = 70; // Current focus
    
    accumulators[source.currentCycle.sefira].totalWeight += cycleWeight;
    accumulators[source.currentCycle.sefira].weightedSum += cycleContribution * cycleWeight;
    accumulators[source.currentCycle.sefira].contributors.push({
      source: 'cabalistic-calc',
      name: `Ciclo actual (año ${source.currentCycle.year})`,
      contribution: cycleContribution,
      direction: 'up',
    });
  }
}

function processSymbolicSystem(
  source: SymbolicSystemData,
  weight: number,
  accumulators: Record<SefiraId, { totalWeight: number; weightedSum: number; contributors: SefiraScore['contributors'] }>
): void {
  for (const [sefiraId, score] of Object.entries(source.sefirotScores)) {
    if (score !== undefined) {
      accumulators[sefiraId as SefiraId].totalWeight += weight;
      accumulators[sefiraId as SefiraId].weightedSum += score * weight;
      accumulators[sefiraId as SefiraId].contributors.push({
        source: 'symbolic-system',
        name: source.system,
        contribution: score,
        direction: score >= 50 ? 'up' : 'down',
      });
    }
  }
}

// ============================================================================
// PILLAR ANALYSIS
// ============================================================================

function analyzePillars(sefirotScores: SefiraScore[]): PillarAnalysis[] {
  return (['left', 'center', 'right'] as const).map(pillarId => {
    const pillarDef = PILLARS_DATA[pillarId];
    const pillarSefirot = sefirotScores.filter(s => s.pillar === pillarId);
    
    const averageLevel = pillarSefirot.length > 0
      ? Math.round(pillarSefirot.reduce((sum, s) => sum + s.level, 0) / pillarSefirot.length)
      : 50;
    
    const state = getEnergyState(averageLevel);
    
    let insight: string;
    if (state === 'overload' || state === 'critical-high') {
      insight = pillarDef.overloadMeaning;
    } else if (state === 'empty' || state === 'critical-low') {
      insight = pillarDef.emptyMeaning;
    } else {
      insight = `El ${pillarDef.name} está en un estado de relativo equilibrio.`;
    }
    
    return {
      pillar: pillarId,
      name: pillarDef.name,
      description: pillarDef.description,
      averageLevel,
      sefirot: pillarDef.sefirot,
      state,
      insight,
    };
  });
}

// ============================================================================
// IMBALANCE DETECTION
// ============================================================================

function detectImbalances(
  sefirotScores: SefiraScore[],
  pillars: PillarAnalysis[]
): Imbalance[] {
  const imbalances: Imbalance[] = [];
  
  // 1. Check pillar asymmetry (left vs right)
  const leftPillar = pillars.find(p => p.pillar === 'left')!;
  const rightPillar = pillars.find(p => p.pillar === 'right')!;
  const pillarDiff = Math.abs(leftPillar.averageLevel - rightPillar.averageLevel);
  
  if (pillarDiff >= 30) {
    const highPillar = leftPillar.averageLevel > rightPillar.averageLevel ? leftPillar : rightPillar;
    const lowPillar = leftPillar.averageLevel > rightPillar.averageLevel ? rightPillar : leftPillar;
    
    imbalances.push({
      type: 'pillar-asymmetry',
      severity: pillarDiff >= 50 ? 'critical' : pillarDiff >= 40 ? 'high' : 'medium',
      description: `${highPillar.name} saturado (${highPillar.averageLevel}%), ${lowPillar.name} vacío (${lowPillar.averageLevel}%)`,
      involvedSefirot: [...highPillar.sefirot, ...lowPillar.sefirot] as SefiraId[],
      workRecommendation: `Fortalecer ${lowPillar.name} para reequilibrar`,
      priority: 1,
    });
  }
  
  // 2. Check individual sefira overloads
  const overloaded = sefirotScores.filter(s => s.state === 'overload' || s.state === 'critical-high');
  for (const sefira of overloaded) {
    const severity = sefira.state === 'critical-high' ? 'critical' : 
                     sefira.level >= 85 ? 'high' : 'medium';
    
    imbalances.push({
      type: 'sefira-overload',
      severity,
      description: `${sefira.name}: ${sefira.level}% (${sefira.stateDescription})`,
      involvedSefirot: [sefira.id],
      workRecommendation: SEFIROT_DATA[sefira.id].balancingPractices[0] || 'Soltar exceso de energía',
      priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
    });
  }
  
  // 3. Check individual sefira empties
  const empties = sefirotScores.filter(s => s.state === 'empty' || s.state === 'critical-low');
  for (const sefira of empties) {
    const severity = sefira.state === 'critical-low' ? 'critical' : 
                     sefira.level <= 20 ? 'high' : 'medium';
    
    imbalances.push({
      type: 'sefira-empty',
      severity,
      description: `${sefira.name}: ${sefira.level}% (${sefira.stateDescription})`,
      involvedSefirot: [sefira.id],
      workRecommendation: SEFIROT_DATA[sefira.id].balancingPractices[0] || 'Nutrir esta energía',
      priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
    });
  }
  
  // 4. Check axis tensions (e.g., Chesed vs Gevurah)
  const chesed = sefirotScores.find(s => s.id === 'chesed')!;
  const gevurah = sefirotScores.find(s => s.id === 'gevurah')!;
  const cgDiff = Math.abs(chesed.level - gevurah.level);
  
  if (cgDiff >= 40) {
    const high = chesed.level > gevurah.level ? 'Chesed' : 'Gevurah';
    const low = chesed.level > gevurah.level ? 'Gevurah' : 'Chesed';
    
    imbalances.push({
      type: 'axis-tension',
      severity: cgDiff >= 60 ? 'high' : 'medium',
      description: `Eje ${high}-${low}: Tensión de ${cgDiff}% (${high} dominante)`,
      involvedSefirot: ['chesed', 'gevurah'],
      workRecommendation: high === 'Chesed' 
        ? 'Establecer límites más claros, equilibrar el dar con el recibir'
        : 'Cultivar autocompasión, suavizar la autocrítica',
      priority: 2,
    });
  }
  
  // Sort by priority
  return imbalances.sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

function generateRecommendations(
  sefirotScores: SefiraScore[],
  imbalances: Imbalance[]
): WorkRecommendation[] {
  const recommendations: WorkRecommendation[] = [];
  const processedSefirot = new Set<SefiraId>();
  
  // Generate from imbalances
  for (const imbalance of imbalances) {
    for (const sefiraId of imbalance.involvedSefirot) {
      if (processedSefirot.has(sefiraId)) continue;
      processedSefirot.add(sefiraId);
      
      const sefira = sefirotScores.find(s => s.id === sefiraId)!;
      const def = SEFIROT_DATA[sefiraId];
      
      let action: WorkRecommendation['action'];
      let reason: string;
      
      if (sefira.state === 'overload' || sefira.state === 'critical-high') {
        action = 'release';
        reason = `Nivel de ${sefira.level}% indica sobrecarga. ${def.overloadManifestation.slice(0, 2).join(', ')}.`;
      } else if (sefira.state === 'empty' || sefira.state === 'critical-low') {
        action = 'strengthen';
        reason = `Nivel de ${sefira.level}% indica vacío. ${def.emptyManifestation.slice(0, 2).join(', ')}.`;
      } else {
        action = 'balance';
        reason = `Mantener el equilibrio actual de ${sefira.level}%.`;
      }
      
      recommendations.push({
        sefira: sefiraId,
        action,
        reason,
        practices: def.balancingPractices,
        priority: imbalance.priority,
      });
    }
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

function generateStateDescription(
  sefiraId: SefiraId,
  state: import('./types').EnergyState,
  def: typeof SEFIROT_DATA[SefiraId]
): string {
  switch (state) {
    case 'critical-high':
      return `Crítico: ${def.overloadManifestation[0]}`;
    case 'overload':
      return `Sobrecarga: ${def.overloadManifestation[0]}`;
    case 'balanced':
      return `Equilibrado: ${def.balancedQualities[0]}`;
    case 'empty':
      return `Vacío: ${def.emptyManifestation[0]}`;
    case 'critical-low':
      return `Crítico: ${def.emptyManifestation[0]}`;
  }
}

function generateMainInsight(
  sefirotScores: SefiraScore[],
  pillars: PillarAnalysis[],
  imbalances: Imbalance[]
): string {
  // Find most significant imbalance
  const pillarImbalance = imbalances.find(i => i.type === 'pillar-asymmetry');
  
  if (pillarImbalance) {
    return pillarImbalance.description;
  }
  
  // Otherwise describe overall state
  const criticals = sefirotScores.filter(s => s.state === 'critical-high' || s.state === 'critical-low');
  if (criticals.length > 0) {
    const names = criticals.map(s => `${s.name} (${s.level}%)`).join(', ');
    return `Sefirot en estado crítico: ${names}`;
  }
  
  const overloads = sefirotScores.filter(s => s.state === 'overload');
  const empties = sefirotScores.filter(s => s.state === 'empty');
  
  if (overloads.length > 0 && empties.length > 0) {
    return `${overloads.length} sefirot sobrecargadas, ${empties.length} vacías. Patrón de desequilibrio distribuido.`;
  }
  
  return 'Estado general relativamente equilibrado con áreas de atención específicas.';
}

function generateSummary(
  sefirotScores: SefiraScore[],
  pillars: PillarAnalysis[],
  imbalances: Imbalance[],
  recommendations: WorkRecommendation[]
): string {
  const parts: string[] = [];
  
  // Pillar summary
  const leftPillar = pillars.find(p => p.pillar === 'left')!;
  const rightPillar = pillars.find(p => p.pillar === 'right')!;
  const centerPillar = pillars.find(p => p.pillar === 'center')!;
  
  parts.push(`📊 **Estado de Pilares:**`);
  parts.push(`- ${leftPillar.name}: ${leftPillar.averageLevel}% (${getEnergyStateLabel(leftPillar.state)})`);
  parts.push(`- ${rightPillar.name}: ${rightPillar.averageLevel}% (${getEnergyStateLabel(rightPillar.state)})`);
  parts.push(`- ${centerPillar.name}: ${centerPillar.averageLevel}% (${getEnergyStateLabel(centerPillar.state)})`);
  
  // Top imbalances
  if (imbalances.length > 0) {
    parts.push('');
    parts.push(`⚠️ **Desequilibrios principales (${imbalances.length}):**`);
    for (const imb of imbalances.slice(0, 3)) {
      parts.push(`- ${imb.description}`);
    }
  }
  
  // Top recommendations
  if (recommendations.length > 0) {
    parts.push('');
    parts.push(`✨ **Plan de trabajo sugerido:**`);
    for (const rec of recommendations.slice(0, 3)) {
      const sefiraDef = SEFIROT_DATA[rec.sefira];
      const actionLabel = rec.action === 'strengthen' ? 'Fortalecer' : rec.action === 'release' ? 'Soltar' : 'Equilibrar';
      parts.push(`- ${actionLabel} ${sefiraDef.name}: ${rec.practices[0]}`);
    }
  }
  
  return parts.join('\n');
}

function getDataSourceName(source: DataSource): string {
  switch (source.source) {
    case 'clinical-test':
      return source.testName;
    case 'biography':
      return `Biografía: ${source.category}`;
    case 'cabalistic-calc':
      return source.method;
    case 'symbolic-system':
      return source.system;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a ClinicalTestData source from raw test scores
 */
export function createClinicalTestSource(
  testType: string,
  testName: string,
  scores: Record<string, number>,
  timestamp?: string
): ClinicalTestData {
  // Map scores to sefirot based on test mapping
  const sefirotScores: Partial<Record<SefiraId, number>> = {};
  const mapping = findTestMapping(testType);
  
  if (mapping) {
    for (const scaleMap of mapping.scaleMapping) {
      const score = scores[scaleMap.scaleName] ?? scores[scaleMap.scaleCode ?? ''];
      if (score !== undefined) {
        sefirotScores[scaleMap.sefira] = score;
      }
    }
  }
  
  return {
    source: 'clinical-test',
    testType,
    testName,
    sefirotScores,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

/**
 * Create a CabalisticCalcData source from Pitagoras results
 */
export function createPitagorasSource(
  ausencias: number[],
  dominantes: number[],
  caminoVida?: number
): CabalisticCalcData {
  const sefirotScores: Partial<Record<SefiraId, number>> = {};
  
  // Map path of life to current focus
  if (caminoVida && NUMBER_TO_SEFIRA[caminoVida]) {
    sefirotScores[NUMBER_TO_SEFIRA[caminoVida]] = 65; // Elevated focus
  }
  
  return {
    source: 'cabalistic-calc',
    method: 'Pitágoras',
    sefirotScores,
    ausencias,
    dominantes,
  };
}
