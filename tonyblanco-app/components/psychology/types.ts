export interface PsychAstroInput {
  natal_chart_snapshot: any; // read-only payload from backend
  active_calculation_session?: any; // optional preview session
  planetary_positions: Array<{ name: string; deg: number; sign?: string; house?: number }>; 
  house_emphasis?: Array<{ house: number; weight: number }> ;
  dominant_aspects?: Array<{ type: string; bodies: string[]; orb: number }> ;
  psychological_tests_summary?: any;
}

export interface PsychAstroOutline {
  core_identity: string;
  dominant_archetypes: string[];
  shadow_dynamics: string[];
  internal_conflicts: string[];
  individuation_path: string[];
  relational_patterns?: string[];
  vocation_symbols?: string[];
  child_archetypes?: string[];
}

export interface CrossInput {
  psych_astrology_outline: PsychAstroOutline;
  psychological_tests_results: any;
}

export interface CrossInsight {
  label: string;
  description: string;
  evidence?: string[];
}

export interface CrossInsights {
  symbolic_resonances: CrossInsight[];
  convergences: CrossInsight[];
  divergences: CrossInsight[];
}

export default {};
