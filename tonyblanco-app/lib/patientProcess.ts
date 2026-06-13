import { getApiBaseUrl } from '@/lib/api-base';
import { getTestResults } from '@/lib/test-api';
import type { TestModule, TestResult } from '@/lib/test-types';
import {
  DEPRECATED_TEST_CODE_ALIASES,
  getClinicalTestRegistryEntry,
  normalizeClinicalTestCode,
} from '@/lib/clinicalTests.registry';
import {
  loadPatientAssignedTestsSnapshot,
  partitionAssignedTests,
  resolvePatientTestRoute,
} from '@/lib/patientPendingTests';

export type ProcessTimelineStatus = 'completed' | 'in_progress' | 'pending' | 'assigned';

export type ProcessTimelineKind =
  | 'exploration_pending'
  | 'exploration_completed'
  | 'therapist_activity';

export type ProcessTimelineItem = {
  id: string;
  kind: ProcessTimelineKind;
  status: ProcessTimelineStatus;
  title: string;
  subtitle?: string;
  date: string | null;
  sortKey: number;
  ctaLabel?: string;
  ctaHref?: string;
};

export type PatientProcessSnapshot = {
  items: ProcessTimelineItem[];
  stats: {
    completed: number;
    pending: number;
    therapistActivities: number;
    total: number;
  };
  pendingBackend: string[];
};

type TherapistMilestone = {
  id: string;
  kind?: string;
  activity_type?: string;
  status?: string;
  title: string;
  date?: string | null;
};

const WARM_EXPLORATION_LABELS: Record<string, string> = {
  wellness: 'Exploración de bienestar',
  nutrition: 'Relación con la alimentación',
  insomnia: 'Descanso y sueño',
  'stress-regulation': 'Regulación del estrés',
  'screening-general': 'Exploración general',
  'anxiety-state-trait': 'Exploración de calma y activación',
  'past-lives': 'Memorias del alma',
  'sha-harmony': 'Armonía interior',
  'eat26-spirit': 'Relación con el sustento',
  'dudit-spirit': 'Exploración de hábitos y equilibrio',
  'ybocs-soul': 'Equilibrio de pensamientos y rituales',
  'asrs-essence': 'Ritmo esencial del alma',
  'aq-kabbalah': 'Espectro de conciencia',
  'mcmi4-signal': 'Señal de exploración personal',
  'mcmi4-mystic': 'Exploración de mundos interiores',
};

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

export function getPatientFacingExplorationLabel(
  code: string,
  fallbackName?: string,
  publicName?: string | null,
): string {
  const normalized = normalizeClinicalTestCode(code);
  const canonical = DEPRECATED_TEST_CODE_ALIASES[normalized] ?? normalized;
  if (WARM_EXPLORATION_LABELS[canonical]) {
    return WARM_EXPLORATION_LABELS[canonical];
  }
  if (publicName && !/[({[](PHQ|GAD|BDI|ASRS|AQ-|MCMI|SCID|DUDIT|Y-BOCS|EAT-26)/i.test(publicName)) {
    return publicName.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  }
  const entry = getClinicalTestRegistryEntry(code);
  if (entry?.guidance?.what) {
    return entry.guidance.what.replace(/\s*\(no diagnóstico\)\.?/i, '').trim();
  }
  const raw = fallbackName || entry?.display_name || 'Exploración personal';
  return raw
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(PHQ-9|GAD-7|BDI-II?|ASRS|AQ-|MCMI|SCID|DUDIT|Y-BOCS|EAT-26)[^,]*/gi, '')
    .trim() || 'Exploración personal';
}

function parseTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function findLatestResultForTest(results: TestResult[], testId: number): TestResult | undefined {
  return results
    .filter((r) => r.test_module?.id === testId)
    .sort((a, b) => parseTimestamp(b.created_at) - parseTimestamp(a.created_at))[0];
}

export function resolveExplorationResultHref(testCode: string, resultId?: number): string | null {
  const route = resolvePatientTestRoute(testCode);
  if (route) return `${route}/result`;
  if (resultId) return `/dashboard/patient/results/${resultId}`;
  return '/dashboard/patient/results';
}

function buildExplorationItems(
  assigned: TestModule[],
  completedIds: Set<number>,
  results: TestResult[],
): ProcessTimelineItem[] {
  const { pending, completed } = partitionAssignedTests(assigned, completedIds);
  const items: ProcessTimelineItem[] = [];

  for (const test of pending) {
    const label = getPatientFacingExplorationLabel(
      test.code,
      test.name,
      (test as TestModule & { public_name?: string }).public_name,
    );
    const route = resolvePatientTestRoute(test.code);
    items.push({
      id: `pending-${test.id}`,
      kind: 'exploration_pending',
      status: 'pending',
      title: label,
      subtitle: 'Tu terapeuta te invitó a completar esta exploración.',
      date: null,
      sortKey: Date.now(),
      ctaLabel: route ? 'Comenzar' : 'Ir a exploraciones',
      ctaHref: route || '/dashboard/patient/tests',
    });
  }

  for (const test of completed) {
    const label = getPatientFacingExplorationLabel(
      test.code,
      test.name,
      (test as TestModule & { public_name?: string }).public_name,
    );
    const latest = test.id ? findLatestResultForTest(results, test.id) : undefined;
    const href = resolveExplorationResultHref(test.code, latest?.id);
    items.push({
      id: `completed-${test.id}`,
      kind: 'exploration_completed',
      status: 'completed',
      title: label,
      subtitle: 'Exploración completada. Puedes revisar tu lectura cuando quieras.',
      date: latest?.created_at ?? null,
      sortKey: parseTimestamp(latest?.created_at) || Date.now(),
      ctaLabel: href ? 'Ver resultado' : undefined,
      ctaHref: href ?? undefined,
    });
  }

  return items;
}

function buildTherapistActivityItems(milestones: TherapistMilestone[]): ProcessTimelineItem[] {
  return milestones.map((m) => ({
    id: m.id,
    kind: 'therapist_activity' as const,
    status: (m.status === 'in_progress' ? 'in_progress' : 'completed') as ProcessTimelineStatus,
    title: m.title,
    subtitle:
      m.status === 'in_progress'
        ? 'Tu terapeuta está trabajando en esto por ti.'
        : 'Exploración registrada por tu terapeuta.',
    date: m.date ?? null,
    sortKey: parseTimestamp(m.date) || Date.now() - 1,
  }));
}

export function sortProcessTimelineItems(items: ProcessTimelineItem[]): ProcessTimelineItem[] {
  const statusRank: Record<ProcessTimelineStatus, number> = {
    pending: 0,
    assigned: 1,
    in_progress: 2,
    completed: 3,
  };
  return [...items].sort((a, b) => {
    const rankDiff = statusRank[a.status] - statusRank[b.status];
    if (rankDiff !== 0) return rankDiff;
    return b.sortKey - a.sortKey;
  });
}

export function buildPatientProcessSnapshot(
  explorationItems: ProcessTimelineItem[],
  therapistItems: ProcessTimelineItem[],
  pendingBackend: string[] = [],
): PatientProcessSnapshot {
  const items = sortProcessTimelineItems([...explorationItems, ...therapistItems]);
  return {
    items,
    stats: {
      completed: items.filter((i) => i.status === 'completed').length,
      pending: items.filter((i) => i.status === 'pending' || i.status === 'assigned').length,
      therapistActivities: items.filter((i) => i.kind === 'therapist_activity').length,
      total: items.length,
    },
    pendingBackend,
  };
}

export async function fetchPatientProcessMilestones(): Promise<{
  milestones: TherapistMilestone[];
  pendingBackend: string[];
}> {
  const API_BASE_URL = getApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/patient/process-milestones/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    return { milestones: [], pendingBackend: ['process_milestones_unavailable'] };
  }
  const body = await response.json();
  return {
    milestones: Array.isArray(body?.milestones) ? body.milestones : [],
    pendingBackend: Array.isArray(body?.pending_backend) ? body.pending_backend : [],
  };
}

export async function loadPatientProcessSnapshot(): Promise<PatientProcessSnapshot> {
  const [{ assigned, completedIds }, resultsResult, milestonesResult] = await Promise.all([
    loadPatientAssignedTestsSnapshot(),
    getTestResults().catch(() => [] as TestResult[]),
    fetchPatientProcessMilestones(),
  ]);

  const explorationItems = buildExplorationItems(assigned, completedIds, resultsResult);
  const therapistItems = buildTherapistActivityItems(milestonesResult.milestones);

  return buildPatientProcessSnapshot(
    explorationItems,
    therapistItems,
    milestonesResult.pendingBackend,
  );
}

/** @internal test helper */
export function __testBuildExplorationItems(
  assigned: TestModule[],
  completedIds: Set<number>,
  results: TestResult[],
) {
  return buildExplorationItems(assigned, completedIds, results);
}