'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { getAuthToken } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

interface CleanupData {
  test_results_linked: number;
  test_results_orphan: number;
  assignments: number;
  total: number;
}

interface CleanupResult {
  dry_run: boolean;
  patient: {
    id: number;
    full_name: string;
  };
  counts?: CleanupData;
  deleted?: {
    test_results_orphan: number;
    test_results_linked: number;
    assignments: number;
  };
  message: string;
}

interface DataCleanupPanelProps {
  patientId: string;
}

export default function DataCleanupPanel({ patientId }: DataCleanupPanelProps) {
  const [counts, setCounts] = useState<CleanupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCounts();
  }, [patientId]);

  const loadCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/therapist/cleanup/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load cleanup data');
      }

      const data = await response.json();
      // Find the patient in the list
      const patientData = data.patients?.find((p: any) => String(p.id) === String(patientId));
      
      if (patientData) {
        setCounts(patientData.counts);
      } else {
        setCounts({ test_results_linked: 0, test_results_orphan: 0, assignments: 0, total: 0 });
      }
    } catch (err: any) {
      console.error('Error loading counts:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (dryRun: boolean) => {
    setIsExecuting(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/therapist/cleanup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          dry_run: dryRun,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Cleanup failed');
      }

      const result = await response.json();
      setCleanupResult(result);
      
      if (!dryRun) {
        // Refresh counts after actual cleanup
        await loadCounts();
        setTimeout(() => {
          setShowConfirmModal(false);
          setCleanupResult(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error executing cleanup:', err);
      setError(err.message || 'Error executing cleanup');
    } finally {
      setIsExecuting(false);
    }
  };

  const openConfirmModal = () => {
    setCleanupResult(null);
    setError(null);
    setShowConfirmModal(true);
    // Auto-execute dry-run
    setTimeout(() => handleCleanup(true), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
      </div>
    );
  }

  const hasData = counts && counts.total > 0;

  return (
    <>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {hasData ? (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    Este consultante tiene datos de tests que pueden ser limpiados:
                  </p>
                  <div className="space-y-1 text-sm text-yellow-800">
                    <div className="flex justify-between">
                      <span>TestResults vinculados:</span>
                      <span className="font-semibold">{counts.test_results_linked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TestResults sin vínculo:</span>
                      <span className="font-semibold">{counts.test_results_orphan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assignments:</span>
                      <span className="font-semibold">{counts.assignments}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-yellow-300">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">{counts.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={openConfirmModal}
              className="w-full px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar datos de tests
            </button>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">
              ✓ No hay datos de tests para limpiar en este consultante
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Confirmar Limpieza de Datos</h3>
                  <p className="text-sm text-gray-600">
                    Esta acción eliminará permanentemente los datos de tests de este consultante.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {cleanupResult && cleanupResult.dry_run && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Vista Previa (Dry-run)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">TestResults vinculados:</span>
                      <span className="font-medium">{cleanupResult.counts?.test_results_linked || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TestResults sin vínculo:</span>
                      <span className="font-medium">{cleanupResult.counts?.test_results_orphan || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assignments:</span>
                      <span className="font-medium">{cleanupResult.counts?.assignments || 0}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900 font-semibold">Total a eliminar:</span>
                      <span className="font-bold text-red-600">
                        {(cleanupResult.counts?.test_results_linked || 0) +
                          (cleanupResult.counts?.test_results_orphan || 0) +
                          (cleanupResult.counts?.assignments || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {cleanupResult && cleanupResult.deleted && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Limpieza Completada</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">TestResults eliminados:</span>
                      <span className="font-medium">
                        {cleanupResult.deleted.test_results_linked + cleanupResult.deleted.test_results_orphan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Assignments eliminados:</span>
                      <span className="font-medium">{cleanupResult.deleted.assignments}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. Los datos eliminados no podrán recuperarse.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isExecuting}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCleanup(false)}
                  disabled={isExecuting || (cleanupResult && !cleanupResult.dry_run)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : cleanupResult && !cleanupResult.dry_run ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Completado
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirmar Limpieza
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
