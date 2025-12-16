'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';
import { getMyResults, getAnalysisRecordDetail, AnalysisRecord } from '@/lib/analysis-api';
import { X, Eye, EyeOff, Calendar } from 'lucide-react';

/**
 * Resultados - Panel Paciente
 * 
 * Vista principal: Lista cronológica de resultados propios
 * Cada resultado muestra: Nombre, Fecha, Estado (nuevo/visto), Botón "Ver resultado"
 * Al abrir: Vista central con notas del terapeuta (si hay) y contenido interpretativo
 * ❌ El paciente NO edita resultados
 */
export default function PatientResultsPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisRecord | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [viewedResults, setViewedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
      }
    };
    load();
    fetchResults();
    
    // Load viewed results from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('patient_viewed_results');
      if (stored) {
        try {
          const viewed = JSON.parse(stored);
          setViewedResults(new Set(viewed));
        } catch (e) {
          console.error('Error loading viewed results:', e);
        }
      }
    }
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultsData = await getMyResults();
      // Ya vienen ordenados por fecha descendente desde el backend
      setResults(resultsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultados';
      setError(errorMessage);
      console.error('Error fetching patient results:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = (resultId: string) => {
    const newViewed = new Set(viewedResults);
    newViewed.add(resultId);
    setViewedResults(newViewed);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('patient_viewed_results', JSON.stringify(Array.from(newViewed)));
    }
  };

  const handleViewResult = async (result: AnalysisRecord) => {
    setSelectedResult(result);
    setShowDetailView(true);
    setLoadingDetail(true);
    
    // Mark as viewed
    markAsViewed(result.id);

    try {
      // Fetch full result details
      const fullResult = await getAnalysisRecordDetail(result.id);
      setSelectedResult(fullResult);
    } catch (err) {
      console.error('Error fetching result details:', err);
      // Continue with the partial result we already have
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailView(false);
    setSelectedResult(null);
  };

  const isNew = (result: AnalysisRecord) => !viewedResults.has(result.id);

  if (roleLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized || role !== 'patient') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Mis Resultados
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Consulta los resultados de tus tests y análisis
            </p>
          </div>
        </div>
      </div>

      {/* Results List - Cronológica */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center py-12">
            <div className="inline-block animate-pulse">
              <div className="h-2 w-32 bg-gray-200 rounded mb-2"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando resultados...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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
      ) : results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-gray-500 text-sm">
              Aún no has completado ningún test.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Los resultados aparecerán aquí una vez que completes los tests asignados.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h2>
          <div className="space-y-3">
            {results.map((result) => {
              const resultIsNew = isNew(result);
              return (
                <div
                  key={result.id}
                  className={`border rounded-md p-4 transition-all ${
                    resultIsNew
                      ? 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {result.module_code} ({result.kind})
                            </h3>
                            {resultIsNew && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Nuevo
                              </span>
                            )}
                            {!resultIsNew && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <Eye className="h-3 w-3 mr-1" />
                                Visto
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(result.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewResult(result)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      Ver resultado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail View - Vista Central */}
      {showDetailView && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedResult.module_code} ({selectedResult.kind})
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(selectedResult.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              {loadingDetail ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">Cargando detalles...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notas del terapeuta - Solo si visible_to_patient = true */}
                  {selectedResult.therapist_annotations && selectedResult.therapist_annotations.visible_to_patient && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-yellow-600">Notas del terapeuta</span>
                      </h3>
                      {selectedResult.therapist_annotations.summary && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Resumen</p>
                          <p className="text-sm text-gray-700">{selectedResult.therapist_annotations.summary}</p>
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

                  {/* Result Data - Interpretativo (cábala, etc.) */}
                  {selectedResult.computed_result && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Resultado del análisis</h3>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof selectedResult.computed_result === 'string'
                          ? selectedResult.computed_result
                          : JSON.stringify(selectedResult.computed_result, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!selectedResult.computed_result && (!selectedResult.therapist_annotations || !selectedResult.therapist_annotations.visible_to_patient) && (
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
    </div>
  );
}
