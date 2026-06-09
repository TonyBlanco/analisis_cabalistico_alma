/** Payload de GET /api/therapist/metrics/ — solo agregados, sin PII. */

export interface TherapistMetricsKPI {
  total_patients: number;
  active_patients_30d: number;
  sessions_this_month: number;
  fichas_this_month: number;
  new_patients_30d: number;
}

export interface MonthlyCount {
  /** Formato YYYY-MM */
  month: string;
  count: number;
}

export interface TherapyStatusBreakdown {
  active?: number;
  paused?: number;
  inactive?: number;
  archived?: number;
  [key: string]: number | undefined;
}

export interface ConsentBreakdown {
  with_consent: number;
  without_consent: number;
}

export interface TherapistMetrics {
  kpi: TherapistMetricsKPI;
  sessions_by_month: MonthlyCount[];
  fichas_by_month: MonthlyCount[];
  therapy_status_breakdown: TherapyStatusBreakdown;
  consent_breakdown: ConsentBreakdown;
}
