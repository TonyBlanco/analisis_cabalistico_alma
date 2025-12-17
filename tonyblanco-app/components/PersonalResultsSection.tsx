'use client';

import { useState, useEffect } from 'react';
import { getTestResults } from '@/lib/test-api';
import Link from 'next/link';
import { Calendar, FileText } from 'lucide-react';

/**
 * Personal Results Section Component
 *
 * Displays personal exploration results with non-clinical language.
 */
export default function PersonalResultsSection() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTestResults();
      setResults(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultados';
      setError(errorMessage);
      console.error('Error fetching personal results:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Mis exploraciones</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Cargando exploraciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Mis exploraciones</h2>
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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Mis exploraciones</h2>
        <p className="text-sm text-gray-600">
          Explora tus resultados anteriores y continúa tu camino de autoconocimiento
        </p>
      </div>

      {results.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Aún no has realizado ninguna exploración</p>
          <p className="text-gray-400 text-xs">
            Comienza explorando las herramientas disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.id || index}
              className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {result.test_module?.name || result.analysis_type || 'Exploración'}
                  </h3>
                  {result.created_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/dashboard/personal/explorations/${result.id}`}
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Ver resultado
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
