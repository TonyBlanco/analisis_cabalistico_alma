import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TestModule } from '@/lib/test-types';
import {
  filterAssignedPatientTests,
  buildCompletedTestIds,
  partitionAssignedTests,
  resolvePatientTestRoute,
  loadPatientPendingTests,
  toPatientPendingTests,
} from '@/lib/patientPendingTests';

vi.mock('@/lib/test-api', () => ({
  getAvailableTests: vi.fn(),
  getTestResults: vi.fn(),
}));

import { getAvailableTests, getTestResults } from '@/lib/test-api';

function makeTest(partial: Partial<TestModule> & { id: number; code: string; name: string }): TestModule {
  return {
    description: '',
    test_type: 'wellness',
    required_access_level: 'personal',
    is_active: true,
    available_for_therapists: true,
    available_for_personal: true,
    uses_per_month: null,
    icon: '',
    order: 0,
    estimated_duration: 10,
    is_available: true,
    execution_mode: 'patient_self',
    user_access: { has_special_access: true, can_use: true, uses_count: 0, current_month_uses: 0, monthly_limit: null, last_used: null },
    ...partial,
  };
}

describe('patientPendingTests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filterAssignedPatientTests keeps only active tests with has_special_access', () => {
    const tests = [
      makeTest({ id: 1, code: 'screening-general', name: 'Screening Psicológico General' }),
      makeTest({ id: 2, code: 'gad-7', name: 'GAD-7', user_access: { has_special_access: false, can_use: true, uses_count: 0, current_month_uses: 0, monthly_limit: null, last_used: null } }),
      makeTest({ id: 3, code: 'stress', name: 'Stress', is_active: false }),
    ];

    const assigned = filterAssignedPatientTests(tests);
    expect(assigned).toHaveLength(1);
    expect(assigned[0].code).toBe('screening-general');
  });

  it('partitionAssignedTests separates pending from completed', () => {
    const assigned = [
      makeTest({ id: 10, code: 'screening-general', name: 'Screening' }),
      makeTest({ id: 11, code: 'phq-9', name: 'PHQ-9' }),
    ];
    const completedIds = new Set([11]);

    const { pending, completed } = partitionAssignedTests(assigned, completedIds);
    expect(pending.map((t) => t.code)).toEqual(['screening-general']);
    expect(completed.map((t) => t.code)).toEqual(['phq-9']);
  });

  it('resolvePatientTestRoute returns registry patient_route for screening-general', () => {
    expect(resolvePatientTestRoute('screening-general')).toBe(
      '/dashboard/patient/tests/screening-general'
    );
  });

  it('loadPatientPendingTests returns has_special_access tests not yet completed', async () => {
    vi.mocked(getAvailableTests).mockResolvedValue({
      user_type: 'patient',
      tests: [
        makeTest({ id: 42, code: 'screening-general', name: 'Screening Psicológico General' }),
        makeTest({ id: 99, code: 'phq-9', name: 'PHQ-9' }),
      ],
    } as any);
    vi.mocked(getTestResults).mockResolvedValue([
      { test_module: { id: 99 } },
    ] as any);

    const pending = await loadPatientPendingTests();

    expect(pending).toHaveLength(1);
    expect(pending[0].name).toBe('Screening Psicológico General');
    expect(pending[0].route).toBe('/dashboard/patient/tests/screening-general');
  });

  it('buildCompletedTestIds ignores results without test_module id', () => {
    const ids = buildCompletedTestIds([{ test_module: { id: 5 } }, { test_module: null }, {}]);
    expect(Array.from(ids)).toEqual([5]);
  });

  it('toPatientPendingTests maps route from registry', () => {
    const pending = toPatientPendingTests([
      makeTest({ id: 1, code: 'screening-general', name: 'Screening Psicológico General' }),
    ]);
    expect(pending[0].route).toContain('screening-general');
  });
});