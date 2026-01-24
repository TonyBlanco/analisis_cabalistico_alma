export type WorkspaceState = 'observation' | 'analysis' | 'synthesis' | 'closure' | 'evolution';

export type BodyAnatomy = 'male' | 'female' | 'intersex' | 'unknown';

export interface ExperientialContext {
  patientId: number | null;
  patientName: string | null;
  biologicalSex: BodyAnatomy;
  sessionLabel: string;
}

/**
 * Progress tracking for each workspace phase (0-100)
 */
export interface WorkspaceProgress {
  observation: number;
  analysis: number;
  synthesis: number;
  closure: number;
  evolution: number;
}

// ============================================
// HEATMAP TYPES (PROMPT #6)
// ============================================

/**
 * Types of emotions/sensations that can be mapped to body regions
 */
export type EmotionType = 'neutral' | 'tension' | 'pain' | 'blocked' | 'flow' | 'warmth';

/**
 * Intensity data for a specific anatomical region
 */
export interface RegionIntensity {
  regionId: string;
  intensity: number; // 0-100
  emotionType: EmotionType;
  lastUpdated: Date;
  notes?: string;
}

/**
 * Complete heatmap data for a session
 */
export interface HeatmapData {
  sessionId: string;
  patientId: string;
  timestamp: Date;
  regions: RegionIntensity[];
}

/**
 * Configuration options for heatmap visualization
 */
export interface HeatmapConfig {
  enabled: boolean;
  showLabels: boolean;
  opacity: number; // 0-1
  colorScheme: 'default' | 'warm' | 'cool' | 'monochrome';
}
