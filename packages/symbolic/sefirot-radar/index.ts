/**
 * Sefirot Radar - Package Index
 * 
 * Sistema de visualización de desequilibrios sefiróticos
 * cruzando tests clínicos, biografía y cálculos cabalísticos.
 */

// Types
export type {
  SefiraId,
  PillarType,
  EnergyState,
  ClinicalTestData,
  BiographyData,
  CabalisticCalcData,
  SymbolicSystemData,
  DataSource,
  SefiraScore,
  PillarAnalysis,
  Imbalance,
  WorkRecommendation,
  SefirotRadarResult,
  RadarSnapshot,
  EvolutionAnalysis,
} from './types';

// Data definitions
export {
  SEFIROT_DATA,
  PILLARS_DATA,
  NUMBER_TO_SEFIRA,
  SEFIRA_TO_NUMBER,
  ENERGY_THRESHOLDS,
  getEnergyState,
  getEnergyStateColor,
  getEnergyStateLabel,
  type SefiraDefinition,
  type PillarDefinition,
} from './sefirot-data';

// Clinical mappings
export {
  CLINICAL_TEST_MAPPINGS,
  BIOGRAPHY_MAPPINGS,
  findTestMapping,
  findBiographyImpacts,
  type ClinicalTestMapping,
  type BiographyEventMapping,
} from './clinical-mappings';

// Engine
export {
  computeSefirotRadar,
  createClinicalTestSource,
  createPitagorasSource,
} from './radar-engine';
