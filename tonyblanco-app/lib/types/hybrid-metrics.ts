/**
 * Payload de GET /api/therapist/hybrid-metrics/ — Modo Interactivo Asistido
 * (Hibrido), Step 9 / D6. Solo agregados, sin PII.
 *
 * El rol (observacional vs clinico) lo resuelve SIEMPRE Django a partir del
 * UserProfile verificado; el cliente nunca lo decide.
 */

export interface HybridModeKPI {
  sessions_started: number;
  interpretations_generated: number;
  interpretations_accepted: number;
  exercises_completed: number;
  anti_fraud_blocks: number;
  notes_created: number;
}

export interface HybridEventsByMonth {
  /** Formato YYYY-MM */
  month: string;
  count: number;
}

/** Conteo de eventos por workspace simbolico (claves dinamicas del backend). */
export type HybridWorkspaceBreakdown = Record<string, number>;

export interface HybridRoleBreakdown {
  observational: number;
  clinical: number;
}

export interface HybridModeMetrics {
  kpi: HybridModeKPI;
  kpi_this_month: HybridModeKPI;
  events_by_month: HybridEventsByMonth[];
  by_workspace: HybridWorkspaceBreakdown;
  role_breakdown: HybridRoleBreakdown;
}
