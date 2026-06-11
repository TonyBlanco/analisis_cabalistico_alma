import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TherapistWorkloadSection from '@/components/dashboard/TherapistWorkloadSection';
import type { TherapistWorkload } from '@/lib/types/therapist-workload';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockWorkload: TherapistWorkload = {
  summary: {
    patients_active: 1,
    tests_assigned_total: 2,
    tests_pending_total: 1,
    tests_completed_total: 1,
    action_items_total: 0,
  },
  patients: [
    {
      id: 1,
      display_name: 'Ana López',
      therapy_status: 'active',
      therapy_level: 'assiyah',
      has_login: true,
      profile_complete: true,
      last_session_at: '2026-06-01T10:00:00Z',
      sessions_count: 2,
      tests: { assigned: 2, pending: 1, completed: 1 },
      tests_recent: [
        {
          assignment_id: 10,
          test_module_id: 3,
          test_code: 'phq9',
          test_name: 'PHQ-9',
          status: 'pending',
          result_id: null,
          assigned_at: '2026-06-05T12:00:00Z',
          completed_at: null,
        },
      ],
      progress: {
        stage: 'assiyah',
        sessions_count: 2,
        last_activity_at: '2026-06-05T12:00:00Z',
      },
      action_items: [],
    },
  ],
  action_items: [],
};

describe('TherapistWorkload types', () => {
  it('fixture cumple el contrato workload (D1)', () => {
    expect(mockWorkload.summary.patients_active).toBe(1);
    expect(mockWorkload.patients[0].tests_recent[0].test_code).toBe('phq9');
    expect(mockWorkload.patients[0].progress.stage).toBe('assiyah');
  });
});

describe('TherapistWorkloadSection', () => {
  it('muestra skeleton en loading', () => {
    render(
      <TherapistWorkloadSection
        workload={null}
        status="loading"
        error={null}
        isEmpty={false}
        onRetry={() => {}}
      />
    );

    expect(screen.getByLabelText('Cargando trabajo en curso')).toBeInTheDocument();
  });

  it('muestra error con botón reintentar', () => {
    const onRetry = vi.fn();
    render(
      <TherapistWorkloadSection
        workload={null}
        status="error"
        error="Network error"
        isEmpty={false}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('renderiza resumen y consultante con workload', () => {
    render(
      <TherapistWorkloadSection
        workload={mockWorkload}
        status="success"
        error={null}
        isEmpty={false}
        onRetry={() => {}}
      />
    );

    expect(screen.getByLabelText('Mis consultantes y trabajo en curso')).toBeInTheDocument();
    expect(screen.getByLabelText('Resumen de trabajo en curso')).toBeInTheDocument();
    expect(screen.getByText('Consultantes activos')).toBeInTheDocument();
    expect(screen.getAllByText('Ana López').length).toBeGreaterThan(0);
    expect(screen.getByText('Consultantes (1)')).toBeInTheDocument();
  });
});