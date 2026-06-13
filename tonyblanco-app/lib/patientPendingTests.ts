import { getAvailableTests, getTestResults } from '@/lib/test-api';
import type { TestModule } from '@/lib/test-types';
import {
  clinicalTestsRegistry,
  DEPRECATED_TEST_CODE_ALIASES,
  normalizeClinicalTestCode,
} from '@/lib/clinicalTests.registry';

export type PatientPendingTest = {
  id: number;
  code: string;
  name: string;
  description?: string;
  test_type?: string;
  route: string | null;
};

const normalizeCode = (code?: string | null) => normalizeClinicalTestCode(String(code || ''));

function buildRouteMaps() {
  const routeByTestCode = new Map<string, string>();
  for (const entry of clinicalTestsRegistry) {
    if (entry.patient_route) {
      routeByTestCode.set(normalizeCode(entry.test_code), entry.patient_route);
    }
  }

  const routeAliases = new Map<string, string>([
    ['phq9', 'phq-9'],
    ['gad7', 'gad-7'],
    ['bdi2', 'bdi-ii'],
    ['stai', 'anxiety-state-trait'],
    ['mcmi4-mystic', 'mcmi4-mystic'],
  ]);
  for (const [from, to] of Object.entries(DEPRECATED_TEST_CODE_ALIASES)) {
    routeAliases.set(normalizeCode(from), normalizeCode(to));
  }

  return { routeByTestCode, routeAliases };
}

const { routeByTestCode, routeAliases } = buildRouteMaps();

export function resolvePatientTestRoute(code?: string | null): string | null {
  const normalizedCode = normalizeCode(code);
  const mappedCode = routeAliases.get(normalizedCode) || normalizedCode;
  return routeByTestCode.get(mappedCode) ?? null;
}

/** Same visibility rules as PatientAssignedTestsSection (patient self flow). */
export function filterAssignedPatientTests(tests: TestModule[]): TestModule[] {
  const visibleTests = tests.filter((test) => (test.is_active ? 'active' : 'inactive') === 'active');
  return visibleTests.filter((test) => test.user_access?.has_special_access === true);
}

export function buildCompletedTestIds(results: Array<{ test_module?: { id?: number } | null }>): Set<number> {
  return new Set(results.map((result) => result.test_module?.id).filter((id): id is number => Boolean(id)));
}

export function partitionAssignedTests(assigned: TestModule[], completedIds: Set<number>) {
  const pending = assigned.filter((test) => test.id && !completedIds.has(test.id));
  const completed = assigned.filter((test) => test.id && completedIds.has(test.id));
  return { pending, completed };
}

export function toPatientPendingTests(tests: TestModule[]): PatientPendingTest[] {
  return tests.map((test) => ({
    id: test.id,
    code: test.code,
    name: test.name,
    description: test.description,
    test_type: test.test_type,
    route: resolvePatientTestRoute(test.code),
  }));
}

export async function loadPatientAssignedTestsSnapshot(): Promise<{
  assigned: TestModule[];
  completedIds: Set<number>;
  userType: string;
}> {
  const response = await getAvailableTests();
  const allTests = response.tests || [];
  const assigned = filterAssignedPatientTests(allTests);

  let completedIds = new Set<number>();
  try {
    const results = await getTestResults();
    completedIds = buildCompletedTestIds(results);
  } catch (err) {
    console.warn('Error fetching results for pending-tests snapshot:', err);
  }

  return { assigned, completedIds, userType: response.user_type || '' };
}

export async function loadPatientPendingTests(): Promise<PatientPendingTest[]> {
  const { assigned, completedIds } = await loadPatientAssignedTestsSnapshot();
  const { pending } = partitionAssignedTests(assigned, completedIds);
  return toPatientPendingTests(pending);
}