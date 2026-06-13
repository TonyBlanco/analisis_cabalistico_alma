'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTestResults, getTestResult, deleteTestResult } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';
import ReadableResult from '@/components/test-results/ReadableResult';
import { getUserRole } from '@/lib/getUserRole';
import { MCMI4_SIGNAL_PUBLIC_NAME } from '@/lib/mcmi4SignalCopy';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * Patient Results Section Component
 * 
 * Shows patient's own completed test results.
 * READ-ONLY: No editing, no regeneration, just viewing.
 */
export default function PatientResultsSection() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultsData = await getTestResults();
      // Sort by created_at descending (most recent first)
      const sortedResults = resultsData.sort((a: TestResult, b: TestResult) => {
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

  useEffect(() => {
    (async () => {
      try {
        const role = await getUserRole();
        setUserRole(role);
      } catch (err) {
        console.warn('Could not determine user role', err);
      }
    })();
  }, []);

  const handleViewDetails = async (result: TestResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
    setLoadingDetail(true);

    try {
      // Fetch full result details
      const fullResult = await getTestResult(result.id);
      setSelectedResult(fullResult);
    } catch (err) {
      console.error('Error fetching result details:', err);
      // Continue with the partial result we already have
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Consultante</h2>
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <div className="h-2 w-32 bg-gray-200 rounded mb-2"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Consultante</h2>
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
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Consultante</h2>

        {results.length === 0 ? (
          <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
              <p className="text-gray-500 text-sm">
              El consultante aún no ha completado ningún test.
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
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {result.test_module?.name || result.test_module_name || 'Test sin nombre'}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span>
                        {new Date(result.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {result.test_module?.code && result.test_module.code !== 'mcmi4-signal' && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {result.test_module.code}
                        </span>
                      )}
                      {result.test_module?.code === 'mcmi4-signal' && (
                        <span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded">
                          {MCMI4_SIGNAL_PUBLIC_NAME}
                        </span>
                      )}
                    </div>
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
                    {selectedResult.test_module?.name || selectedResult.test_module_name || 'Resultado del Test'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Completado el {new Date(selectedResult.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {userRole === 'therapist' && (
                    <button
                      onClick={async () => {
                        if (!selectedResult) return;
                        const ok = confirm('¿Eliminar este resultado? Esto archivará el resultado.');
                        if (!ok) return;
                        try {
                          setDeleting(true);
                          await deleteTestResult(selectedResult.id);
                          // remove deleted result from list
                          setResults((prev) => prev.filter((r) => r.id !== selectedResult.id));
                          setShowDetailModal(false);
                          setSelectedResult(null);
                          // Return to therapist workspace if applicable
                          router.back();
                        } catch (err) {
                          console.error('Error deleting result:', err);
                          alert('Error al eliminar el resultado');
                        } finally {
                          setDeleting(false);
                        }
                      }}
                      disabled={deleting}
                      className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? 'Eliminando...' : 'Eliminar resultado'}
                    </button>
                  )}
                  <button
                    onClick={handleCloseDetail}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              {loadingDetail ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">Cargando detalles...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Result Data */}
                  {selectedResult.result_data && (
                    <ReadableResult 
                      resultData={selectedResult.result_data} 
                      resultId={selectedResult.id}
                      showRaw={false}
                      clientFacing={userRole !== 'therapist'}
                      testCode={selectedResult.test_module?.code}
                      executionMode={selectedResult.test_module?.execution_mode}
                      isTherapist={userRole === 'therapist'}
                      responsesDetail={selectedResult.responses_detail}
                      therapistSuggestion={
                        userRole === 'therapist'
                          ? selectedResult.therapist_next_exploration_suggestion
                          : undefined
                      }
                    />
                  )}

                  {/* Notes */}
                  {selectedResult.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Notas</h3>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedResult.notes}
                      </div>
                    </div>
                  )}

                  {/* CTA for MCMI-4 Signal → Reflection */}
                  {selectedResult.test_module?.code === 'mcmi4-signal' && userRole !== 'therapist' && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Reflexión Personal</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Has completado la evaluación. Ahora puedes registrar tus reflexiones personales sobre los resultados.
                      </p>
                      <Link 
                        href="/dashboard/patient/swm/mcmi4-reflection"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        Continuar con tu Reflexión
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!selectedResult.result_data && !selectedResult.input_data && !selectedResult.notes && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No hay detalles adicionales disponibles para este resultado.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
