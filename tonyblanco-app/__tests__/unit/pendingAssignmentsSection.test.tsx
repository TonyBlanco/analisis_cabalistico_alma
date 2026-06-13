import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PendingAssignmentsSection from '@/components/PendingAssignmentsSection';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockRefresh = vi.fn();

vi.mock('@/lib/usePatientPendingTests', () => ({
  usePatientPendingTests: vi.fn(),
}));

import { usePatientPendingTests } from '@/lib/usePatientPendingTests';

describe('PendingAssignmentsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows screening-general as pending with Comenzar when hook returns it', () => {
    vi.mocked(usePatientPendingTests).mockReturnValue({
      pendingTests: [
        {
          id: 42,
          code: 'screening-general',
          name: 'Screening Psicológico General',
          description: 'Exploración orientativa',
          route: '/dashboard/patient/tests/screening-general',
        },
      ],
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<PendingAssignmentsSection />);

    expect(screen.getByText('Tests Pendientes (1)')).toBeInTheDocument();
    expect(screen.getByText('Screening Psicológico General')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
    expect(screen.queryByText('No tienes tests pendientes en este momento.')).not.toBeInTheDocument();
  });

  it('shows empty state when no pending tests', () => {
    vi.mocked(usePatientPendingTests).mockReturnValue({
      pendingTests: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<PendingAssignmentsSection />);

    expect(screen.getByText('No tienes tests pendientes en este momento.')).toBeInTheDocument();
  });
});