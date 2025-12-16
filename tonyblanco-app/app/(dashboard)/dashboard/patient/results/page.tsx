'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { useRouter } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

interface AnalysisRecord {
  id: string;
  kind: string;
  module_code: string;
  created_at: string;
  computed_result?: any;
  therapist_annotations?: {
    visible_to_patient?: boolean;
    interpretation?: string;
    notes?: string;
  } | null;
  birth_data_snapshot?: {
    legal_name?: string;
    birth_date?: string;
  };
}

/**
 * Patient Results Page
 *
 * Route: /dashboard/patient/results
 *
 * Shows patient's own results using AnalysisRecord.
 * Uses GET /api/analysis-records/my-results/
 * Therapist annotations visible ONLY if visible_to_patient = true
 */
export default function PatientResultsPage() {
  const router = useRouter();
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [results, setResults] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (authorized && role === 'patient') {
      fetchResults();
    }
  }, [authorized, role]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/analysis-records/my-results/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar resultados');
      }

      const data = await response.json();
      const sortedResults = (data.results || []).sort((a: AnalysisRecord, b: AnalysisRecord) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setResults(sortedResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultados';
      setError(errorMessage);
      console.error('Error fetching patient results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: AnalysisRecord) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  const formatResultData = (result: AnalysisRecord): string => {
    if (!result.computed_result) {
      return 'No hay datos de resultado disponibles.';
    }

    // Try to extract readable text from computed_result
    if (typeof result.computed_result === 'string') {
      return result.computed_result;
    }

    if (typeof result.computed_result === 'object') {
      // Look for common readable fields
      const readableFields = [
        'summary',
        'interpretation',
        'analysis',
        'result',
        'conclusion',
        'description',
      ];

      for (const field of readableFields) {
        if (result.computed_result[field]) {
          return String(result.computed_result[field]);
        }
      }

      // Fallback: format as JSON but prettier
      return JSON.stringify(result.computed_result, null, 2);
    }

    return 'Resultado no disponible en formato legible.';
  };

  // Loading state
  if (roleLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Unauthorized - guard handles redirect
  if (!authorized || role !== 'patient') {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Mis Resultados</h1>
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
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            Mis Resultados
          </h1>
          <p className="text-sm text-gray-600">
            Resultados de los análisis y tests que has completado
          </p>
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-sm">
              Aún no has completado ningún test.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Los resultados aparecerán aquí una vez que completes los tests asignados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {result.module_code || 'Análisis'}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span>
                        {new Date(result.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {result.kind}
                      </span>
                    </div>
                    {result.birth_data_snapshot?.legal_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Para: {result.birth_data_snapshot.legal_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewDetails(result)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Ver resultado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedResult.module_code || 'Resultado del Análisis'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Completado el{' '}
                    {new Date(selectedResult.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Result Data */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Resultado</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formatResultData(selectedResult)}
                  </div>
                </div>

                {/* Therapist Annotations (only if visible_to_patient = true) */}
                {selectedResult.therapist_annotations &&
                  selectedResult.therapist_annotations.visible_to_patient && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Notas de tu Terapeuta
                      </h3>
                      {selectedResult.therapist_annotations.interpretation && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Interpretación</p>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedResult.therapist_annotations.interpretation}
                          </div>
                        </div>
                      )}
                      {selectedResult.therapist_annotations.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Notas</p>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedResult.therapist_annotations.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
