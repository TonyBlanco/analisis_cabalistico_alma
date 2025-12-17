'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableTests } from '@/lib/test-api';
import { TestModule } from '@/lib/test-types';
import { Sparkles, BookOpen, Heart, Target } from 'lucide-react';

/**
 * Personal Explorations Section Component
 * 
 * Shows a catalog of available tests for personal users.
 * Uses friendly, non-clinical language.
 */
export default function PersonalExplorationsSection() {
  const router = useRouter();
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTests();
      const allTests = response.tests || [];

      // Filter: Only tests available for personal users
      const personalTests = allTests.filter((test: TestModule) => {
        return test.available_for_personal === true;
      });

      setTests(personalTests);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar exploraciones';
      setError(errorMessage);
      console.error('Error fetching personal tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = (testCode: string) => {
    router.push(`/dashboard/personal/${testCode}`);
  };

  const getTestIcon = (testCode: string) => {
    if (testCode.includes('compatibility') || testCode.includes('pareja')) {
      return Heart;
    }
    if (testCode.includes('profesional') || testCode.includes('career')) {
      return Target;
    }
    if (testCode.includes('basic') || testCode.includes('cabalistic')) {
      return Sparkles;
    }
    return BookOpen;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exploraciones disponibles</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Cargando exploraciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exploraciones disponibles</h2>
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Exploraciones disponibles</h2>
        <p className="text-sm text-gray-600">
          Herramientas cabalísticas para autoconocimiento y crecimiento personal
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No hay exploraciones disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => {
            const Icon = getTestIcon(test.code);
            return (
              <div
                key={test.code}
                className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer bg-white"
                onClick={() => handleExplore(test.code)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">{test.name}</h3>
                    {test.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Exploración personal
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExplore(test.code);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Explorar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

