import { describe, it, expect } from 'vitest';
import {
  __testBuildExplorationItems,
  buildPatientProcessSnapshot,
  getPatientFacingExplorationLabel,
  sortProcessTimelineItems,
  type ProcessTimelineItem,
} from '@/lib/patientProcess';
import type { TestModule, TestResult } from '@/lib/test-types';

describe('patientProcess — exploration timeline', () => {
  const assigned: TestModule[] = [
    {
      id: 1,
      code: 'aq_kabbalah',
      name: 'AQ-Kabbalah (Espectro)',
      description: '',
      test_type: 'basic',
      required_access_level: 'free',
      is_active: true,
      available_for_therapists: true,
      available_for_personal: true,
      uses_per_month: null,
      icon: '',
      order: 0,
      estimated_duration: 10,
      is_available: true,
      execution_mode: 'patient_self',
      user_access: { can_use: true, uses_count: 0, current_month_uses: 0, monthly_limit: null, last_used: null, has_special_access: true },
    },
    {
      id: 2,
      code: 'wellness',
      name: 'Wellness Assessment',
      description: '',
      test_type: 'wellness',
      required_access_level: 'free',
      is_active: true,
      available_for_therapists: true,
      available_for_personal: true,
      uses_per_month: null,
      icon: '',
      order: 1,
      estimated_duration: 10,
      is_available: true,
      execution_mode: 'patient_self',
      user_access: { can_use: true, uses_count: 0, current_month_uses: 0, monthly_limit: null, last_used: null, has_special_access: true },
    },
  ];

  const results: TestResult[] = [
    {
      id: 99,
      test_module: { id: 1, code: 'aq_kabbalah', name: 'AQ', test_type: 'basic', execution_mode: 'patient_self' },
      input_data: {},
      result_data: { summary_text: 'ok' },
      is_favorite: false,
      is_archived: false,
      created_at: '2026-06-10T12:00:00Z',
      updated_at: '2026-06-10T12:00:00Z',
    },
  ];

  it('labels explorations without clinical instrument names', () => {
    expect(getPatientFacingExplorationLabel('aq_kabbalah', 'AQ-Kabbalah (Espectro)')).toBe(
      'Espectro de conciencia',
    );
    expect(getPatientFacingExplorationLabel('phq-9', 'PHQ-9 (Depresión)')).not.toMatch(/PHQ-9/);
  });

  it('shows pending and completed with correct status and CTAs', () => {
    const completedIds = new Set([1]);
    const items = __testBuildExplorationItems(assigned, completedIds, results);

    const completed = items.find((i) => i.id === 'completed-1');
    const pending = items.find((i) => i.id === 'pending-2');

    expect(completed?.status).toBe('completed');
    expect(completed?.ctaLabel).toBe('Ver resultado');
    expect(completed?.ctaHref).toContain('/aq-kabbalah/result');
    expect(completed?.title).toBe('Espectro de conciencia');

    expect(pending?.status).toBe('pending');
    expect(pending?.ctaLabel).toBe('Comenzar');
    expect(pending?.title).toBe('Exploración de bienestar');
  });

  it('orders pending before completed', () => {
    const items = sortProcessTimelineItems([
      { id: 'c', kind: 'exploration_completed', status: 'completed', title: 'Done', date: '2026-06-01', sortKey: 1 },
      { id: 'p', kind: 'exploration_pending', status: 'pending', title: 'Todo', date: null, sortKey: 2 },
    ] as ProcessTimelineItem[]);
    expect(items[0].id).toBe('p');
  });

  it('aggregates stats in snapshot', () => {
    const exploration = __testBuildExplorationItems(assigned, new Set([1]), results);
    const therapist: ProcessTimelineItem[] = [
      {
        id: 'natal',
        kind: 'therapist_activity',
        status: 'completed',
        title: 'Tu terapeuta ha calculado tu carta natal',
        date: '2026-06-09',
        sortKey: 3,
      },
    ];
    const snap = buildPatientProcessSnapshot(exploration, therapist);
    expect(snap.stats.total).toBe(3);
    expect(snap.stats.pending).toBe(1);
    expect(snap.stats.completed).toBeGreaterThanOrEqual(1);
  });
});