/** Payload de GET /api/therapist/reports/summary/ */

export interface TherapistReportsPortfolioWindow {
  patients_active?: number;
  tests_assigned: number;
  tests_pending: number;
  tests_completed: number;
  action_items?: number;
}

export interface TherapistReportsPortfolio {
  total: TherapistReportsPortfolioWindow;
  last_30_days: Omit<TherapistReportsPortfolioWindow, 'patients_active' | 'action_items'>;
}

export interface TherapistReportsRecentResult {
  id: number;
  patient_id: number | null;
  patient_display_name: string;
  test_code: string | null;
  test_name: string;
  completed_at: string | null;
  severity_label: string | null;
  referral_recommended: boolean;
  alert: boolean;
  href: string;
}

export interface TherapistReportsPatientMetric {
  id: number;
  display_name: string;
  therapy_status: string;
  tests: {
    assigned: number;
    pending: number;
    completed: number;
  };
  alerts_open: number;
  sessions_count: number;
  last_activity_at: string | null;
  href: string;
}

export interface TherapistReportsSessionRecent {
  id: number;
  patient_id: number | null;
  patient_display_name: string;
  session_date: string | null;
  session_type: string;
  duration_minutes: number | null;
  href: string | null;
}

export interface TherapistReportsSessionsBlock {
  total: number;
  last_30_days: number;
  recent: TherapistReportsSessionRecent[];
}

export interface TherapistReportsSummary {
  generated_at: string;
  disclaimer: string;
  portfolio: TherapistReportsPortfolio;
  alerts_open: number;
  recent_results: TherapistReportsRecentResult[];
  patients: TherapistReportsPatientMetric[];
  sessions: TherapistReportsSessionsBlock;
}