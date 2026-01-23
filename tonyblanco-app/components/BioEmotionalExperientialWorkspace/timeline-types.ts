/**
 * Timeline Types for BioEmotional Experiential Workspace
 * PROMPT #7: Timeline y Comparación de Sesiones
 */

import type { RegionIntensity } from './types';

// ============================================
// SESSION SUMMARY
// ============================================

/**
 * Summary of a single session for timeline display
 */
export interface SessionSummary {
  id: string;
  date: Date;
  patientId: string;
  regionsObserved: string[];
  observationsCount: number;
  hypothesesCount: number;
  synthesisCompleted: boolean;
  emotionalState: 'better' | 'same' | 'worse' | 'unknown';
  heatmapData?: RegionIntensity[];
  notes?: string;
}

// ============================================
// SESSION COMPARISON
// ============================================

/**
 * Comparison data between two sessions
 */
export interface SessionComparison {
  sessionA: SessionSummary;
  sessionB: SessionSummary;
  differences: SessionDifferences;
}

/**
 * Detailed differences between two sessions
 */
export interface SessionDifferences {
  /** Regions that appear in B but not in A */
  newRegions: string[];
  /** Regions that were in A but not in B (resolved) */
  resolvedRegions: string[];
  /** Regions present in both sessions */
  persistentRegions: string[];
  /** Intensity changes for regions present in both */
  intensityChanges: IntensityChange[];
}

/**
 * Change in intensity for a specific region
 */
export interface IntensityChange {
  regionId: string;
  /** Percentage change from session A to B (-100 to +100) */
  changePercent: number;
  /** Emotion type in session A */
  emotionTypeA?: string;
  /** Emotion type in session B */
  emotionTypeB?: string;
}

// ============================================
// EVOLUTION DATA
// ============================================

/**
 * Complete evolution data for trend analysis
 */
export interface EvolutionData {
  sessions: SessionSummary[];
  trends: EvolutionTrends;
}

/**
 * Calculated trends from session history
 */
export interface EvolutionTrends {
  /** Most frequently worked regions */
  mostWorkedRegions: RegionFrequency[];
  /** Emotional progression over time */
  emotionalProgression: ('better' | 'same' | 'worse' | 'unknown')[];
  /** Average observations per session */
  averageObservationsPerSession: number;
  /** Average hypotheses per session */
  averageHypothesesPerSession: number;
  /** Sessions with completed synthesis */
  completionRate: number;
}

/**
 * Frequency data for a region
 */
export interface RegionFrequency {
  regionId: string;
  count: number;
  lastSeen?: Date;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate differences between two sessions
 */
export function calculateSessionDifferences(
  sessionA: SessionSummary,
  sessionB: SessionSummary
): SessionDifferences {
  const regionsA = new Set(sessionA.regionsObserved);
  const regionsB = new Set(sessionB.regionsObserved);

  const newRegions = [...regionsB].filter((r) => !regionsA.has(r));
  const resolvedRegions = [...regionsA].filter((r) => !regionsB.has(r));
  const persistentRegions = [...regionsA].filter((r) => regionsB.has(r));

  // Calculate intensity changes for persistent regions
  const intensityChanges: IntensityChange[] = [];

  if (sessionA.heatmapData && sessionB.heatmapData) {
    const heatmapA = new Map(sessionA.heatmapData.map((h) => [h.regionId, h]));
    const heatmapB = new Map(sessionB.heatmapData.map((h) => [h.regionId, h]));

    for (const regionId of persistentRegions) {
      const dataA = heatmapA.get(regionId);
      const dataB = heatmapB.get(regionId);

      if (dataA && dataB) {
        const changePercent = dataB.intensity - dataA.intensity;
        intensityChanges.push({
          regionId,
          changePercent,
          emotionTypeA: dataA.emotionType,
          emotionTypeB: dataB.emotionType,
        });
      }
    }
  }

  return {
    newRegions,
    resolvedRegions,
    persistentRegions,
    intensityChanges,
  };
}

/**
 * Calculate evolution trends from session history
 */
export function calculateEvolutionTrends(sessions: SessionSummary[]): EvolutionTrends {
  if (sessions.length === 0) {
    return {
      mostWorkedRegions: [],
      emotionalProgression: [],
      averageObservationsPerSession: 0,
      averageHypothesesPerSession: 0,
      completionRate: 0,
    };
  }

  // Count region frequencies
  const regionCounts = new Map<string, { count: number; lastSeen: Date }>();
  for (const session of sessions) {
    for (const region of session.regionsObserved) {
      const existing = regionCounts.get(region);
      if (existing) {
        existing.count += 1;
        if (session.date > existing.lastSeen) {
          existing.lastSeen = session.date;
        }
      } else {
        regionCounts.set(region, { count: 1, lastSeen: session.date });
      }
    }
  }

  // Sort by frequency
  const mostWorkedRegions: RegionFrequency[] = [...regionCounts.entries()]
    .map(([regionId, data]) => ({
      regionId,
      count: data.count,
      lastSeen: data.lastSeen,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 regions

  // Emotional progression
  const emotionalProgression = sessions.map((s) => s.emotionalState);

  // Averages
  const totalObservations = sessions.reduce((sum, s) => sum + s.observationsCount, 0);
  const totalHypotheses = sessions.reduce((sum, s) => sum + s.hypothesesCount, 0);
  const completedSessions = sessions.filter((s) => s.synthesisCompleted).length;

  return {
    mostWorkedRegions,
    emotionalProgression,
    averageObservationsPerSession: totalObservations / sessions.length,
    averageHypothesesPerSession: totalHypotheses / sessions.length,
    completionRate: (completedSessions / sessions.length) * 100,
  };
}

/**
 * Create a comparison object from two sessions
 */
export function createSessionComparison(
  sessionA: SessionSummary,
  sessionB: SessionSummary
): SessionComparison {
  return {
    sessionA,
    sessionB,
    differences: calculateSessionDifferences(sessionA, sessionB),
  };
}
