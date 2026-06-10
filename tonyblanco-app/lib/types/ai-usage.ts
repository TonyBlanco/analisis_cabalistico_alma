/** Payload de GET /api/therapist/ai-usage/ */

export interface AIUsageTaskBreakdown {
  count: number;
  cost_eur: string;
  tokens: number;
}

export interface TherapistAIUsageSummary {
  billing_period: string;
  included_credit_eur: string;
  consumed_eur: string;
  remaining_eur: string;
  overage_eur: string;
  total_tokens: number;
  by_task_type: Record<string, AIUsageTaskBreakdown>;
  metering_enforced: boolean;
  event_count: number;
}

export interface AIUsageHistoryEvent {
  id: number;
  task_type: string;
  provider: string;
  model: string;
  total_tokens: number;
  estimated_cost_eur: string;
  patient_id: number | null;
  source_type: string;
  source_id: string;
  created_at: string;
}

export interface TherapistAIUsageHistory {
  billing_period: string;
  events: AIUsageHistoryEvent[];
  count: number;
}