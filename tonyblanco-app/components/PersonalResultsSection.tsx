'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMyResults, AnalysisRecord } from '@/lib/api';
import { FileText, Calendar, Eye } from 'lucide-react';

/**
 * Personal Results Section Component
 * 
 * Shows saved exploration results for personal users.
 * Uses friendly, non-clinical language.
 */
export default function PersonalResultsSection() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTestResults();
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar exploraciones';
      setError(errorMessage);
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result: AnalysisRecord) => {
    // Use AnalysisRecord UUID for navigation
    const testCode = result.test_module?.code;
    if (testCode) {
      router.push(`/dashboard/personal/${testCode}?resultId=${result.id}`);
    } else {
      // Fallback: navigate to results page if available
      router.push(`/dashboard/personal/explorations?resultId=${result.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis exploraciones</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Cargando exploraciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis exploraciones</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchResults}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Mis exploraciones</h2>
        <p className="text-sm text-gray-600">
          Revisa tus exploraciones anteriores y profundiza en tus resultados
        </p>
      </div>

      {results.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">
            Aún no has realizado ninguna exploración
          </p>
          <p className="text-gray-400 text-xs">
            Tus exploraciones aparecerán aquí una vez que las completes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">
                      {result.test_module?.name || 'Exploración'}
                    </h3>
                  </div>
                  {result.created_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                  )}
                  {result.test_module?.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.test_module.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleViewResult(result)}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver resultado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
