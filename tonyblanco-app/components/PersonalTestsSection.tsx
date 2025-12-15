'use client';

import { useState, useEffect } from 'react';
import { getAvailableTests, getTestResults } from '@/lib/test-api';
import { TestModule } from '@/lib/test-types';
import Link from 'next/link';

/**
 * Personal Tests Section Component
 * 
 * Shows cabalistic tools available for personal users.
 * Limited to self-reflection tests only (available_for_personal === true).
 */
export default function PersonalTestsSection() {
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTestIds, setCompletedTestIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTests();
      const allTests = response.tests || [];

      // Filter: Only tests available for personal users (self-reflection)
      // Exclude therapist_clinical tests (available_for_therapists === true && available_for_personal === false)
      const personalTests = allTests.filter((test: TestModule) => {
        return test.available_for_personal === true;
      });

      setTests(personalTests);

      // Fetch completed results to show status
      try {
        const results = await getTestResults();
        const completedIds = new Set(
          results.map((result: any) => result.test_module?.id).filter(Boolean)
        );
        setCompletedTestIds(completedIds);
      } catch (err) {
        console.warn('Error fetching results for status check:', err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar herramientas';
      setError(errorMessage);
      console.error('Error fetching personal tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingTests = tests.filter((test) => !completedTestIds.has(test.id));
  const completedTests = tests.filter((test) => completedTestIds.has(test.id));

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exploraciones personales</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Cargando herramientas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exploraciones personales</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchTests}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Exploraciones personales</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tests simbólicos y cabalísticos orientados al autoconocimiento y al crecimiento personal.
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No hay herramientas disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTests.map((test) => (
            <div
              key={test.code}
              className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">{test.name}</h3>
                  {test.description && (
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Exploración personal
                    </span>
                    {test.test_type && (
                      <span className="text-xs text-gray-500">
                        Tipo: {test.test_type}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/personal/${test.code}`}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Explorar
                </Link>
              </div>
            </div>
          ))}

          {completedTests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mis exploraciones recientes</h3>
              {completedTests.map((test) => (
                <div
                  key={test.code}
                  className="border border-gray-200 rounded-md p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                    </div>
                    <Link
                      href={`/dashboard/personal/${test.code}`}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Ver resultado
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
