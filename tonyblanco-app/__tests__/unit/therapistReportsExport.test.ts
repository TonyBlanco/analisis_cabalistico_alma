import { describe, expect, it } from 'vitest';
import { buildTherapistReportsCsv } from '@/lib/therapistReportsExport';
import type { TherapistReportsSummary } from '@/lib/types/therapist-reports';

const sample: TherapistReportsSummary = {
  generated_at: '2026-06-13T12:00:00Z',
  disclaimer: 'Indicativo.',
  portfolio: {
    total: {
      patients_active: 2,
      tests_assigned: 5,
      tests_pending: 2,
      tests_completed: 3,
      action_items: 1,
    },
    last_30_days: {
      tests_assigned: 4,
      tests_pending: 1,
      tests_completed: 2,
    },
  },
  alerts_open: 1,
  recent_results: [
    {
      id: 99,
      patient_id: 1,
      patient_display_name: 'Ana López',
      test_code: 'phq9',
      test_name: 'PHQ-9',
      completed_at: '2026-06-12T10:00:00Z',
      severity_label: 'Moderada',
      referral_recommended: true,
      alert: true,
      href: '/dashboard/therapist/tests/results/99',
    },
  ],
  patients: [],
  sessions: { total: 3, last_30_days: 2, recent: [] },
};

describe('buildTherapistReportsCsv', () => {
  it('includes portfolio totals and alert row', () => {
    const csv = buildTherapistReportsCsv(sample);
    expect(csv).toContain('Consultantes activos,2');
    expect(csv).toContain('Alertas abiertas,1');
    expect(csv).toContain('Ana López');
    expect(csv).toContain('Derivación');
    expect(csv).toContain('sí');
  });
});