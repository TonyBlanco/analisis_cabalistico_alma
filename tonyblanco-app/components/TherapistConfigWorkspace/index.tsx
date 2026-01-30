'use client';

import { useState, useEffect } from 'react';
import { Settings, Trash2, Database, Users, AlertTriangle, RefreshCcw, ChevronRight, ChevronDown } from 'lucide-react';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

interface PatientDataSummary {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  counts: {
    test_results_linked: number;
    test_results_orphan: number;
    assignments: number;
    total: number;
  };
}

interface CleanupPreview {
  patient_id: number;
  patient_name: string;
  items_to_delete: {
    test_results: number;
    assignments: number;
  };
  dry_run: boolean;
}

interface CleanupResult {
  success: boolean;
  patient_id: number;
  patient_name: string;
  deleted: {
    test_results: number;
    assignments: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TherapistConfigWorkspace() {
  // Active patient from therapist context
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);

  // Data cleanup state
  const [patientData, setPatientData] = useState<PatientDataSummary | null>(null);
  const [cleanupPreview, setCleanupPreview] = useState<CleanupPreview | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cleanup: true,
    future: false,
  });

  // ============================================================================
  // PATIENT CONTEXT LOADING
  // ============================================================================

  useEffect(() => {
    const loadActivePatient = () => {
      setIsLoadingPatient(true);
      const activeId = getActivePatientId();
      const activeName = getActivePatientName();

      setPatientId(activeId);
      setPatientName(activeName);
      setIsLoadingPatient(false);
    };

    loadActivePatient();

    // Listen for active patient changes
    const handlePatientChange = () => {
      loadActivePatient();
      // Reset state when patient changes
      setPatientData(null);
      setCleanupPreview(null);
      setError(null);
      setSuccessMessage(null);
    };

    window.addEventListener('activePatientChanged', handlePatientChange);
    return () => window.removeEventListener('activePatientChanged', handlePatientChange);
  }, []);

  // Load patient data when patient is selected
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // ============================================================================
  // DATA OPERATIONS
  // ============================================================================

  const loadPatientData = async () => {
    if (!patientId) return;

    setIsLoadingData(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/therapist/cleanup/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error cargando datos del paciente');
      }

      const data = await response.json();
      const patients: PatientDataSummary[] = data.patients || [];
      
      // Find the active patient's data (by patient id, not patient_id)
      const activePatientData = patients.find(p => p.id === patientId);
      setPatientData(activePatientData || null);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePreviewCleanup = async () => {
    if (!patientId) return;

    setIsPreviewLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/therapist/cleanup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          dry_run: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en preview');
      }

      const preview: CleanupPreview = await response.json();
      setCleanupPreview(preview);
    } catch (err: any) {
      setError(err.message || 'Error en preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleExecuteCleanup = async () => {
    if (!patientId || !cleanupPreview) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar todos los datos de test de ${patientName}?\n\n` +
      `Se eliminarán:\n` +
      `- ${cleanupPreview.items_to_delete.test_results} resultados de test\n` +
      `- ${cleanupPreview.items_to_delete.assignments} asignaciones\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsExecuting(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/therapist/cleanup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          dry_run: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error ejecutando limpieza');
      }

      const result: CleanupResult = await response.json();
      
      setSuccessMessage(
        `Limpieza completada: ${result.deleted.test_results} resultados y ` +
        `${result.deleted.assignments} asignaciones eliminadas.`
      );
      setCleanupPreview(null);
      
      // Reload patient data to reflect changes
      await loadPatientData();
    } catch (err: any) {
      setError(err.message || 'Error ejecutando limpieza');
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración del Terapeuta</h1>
              <p className="text-sm text-gray-500">Herramientas de administración y mantenimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Context Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {isLoadingPatient ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando contexto...</span>
            </div>
          ) : patientId ? (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-600">Paciente activo:</span>
              <span className="text-sm font-medium text-gray-900">{patientName}</span>
              <span className="text-xs text-gray-400">(ID: {patientId})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Selecciona un paciente desde el panel de Pacientes para continuar
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Section: Data Cleanup */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('cleanup')}
              className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">Limpieza de Datos de Test</h2>
                  <p className="text-sm text-gray-500">Eliminar resultados y asignaciones de prueba</p>
                </div>
              </div>
              {expandedSections.cleanup ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSections.cleanup && (
              <div className="px-6 py-6 border-t border-gray-100">
                {!patientId ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Selecciona un paciente para ver y gestionar sus datos de test
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Error/Success Messages */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">{error}</span>
                        </div>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Database className="h-4 w-4" />
                          <span className="text-sm font-medium">{successMessage}</span>
                        </div>
                      </div>
                    )}

                    {/* Patient Data Summary */}
                    {isLoadingData ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                        <span>Cargando datos...</span>
                      </div>
                    ) : patientData ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Resumen de datos</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{patientData.counts.test_results_linked}</div>
                            <div className="text-xs text-gray-500">Tests Vinculados</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-2xl font-bold text-amber-600">{patientData.counts.test_results_orphan}</div>
                            <div className="text-xs text-gray-500">Tests Huérfanos</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{patientData.counts.assignments}</div>
                            <div className="text-xs text-gray-500">Asignaciones</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-2xl font-bold text-indigo-600">{patientData.counts.total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">No hay datos de test para este paciente</p>
                      </div>
                    )}

                    {/* Cleanup Preview */}
                    {cleanupPreview && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-amber-800 mb-2">Vista previa de eliminación</h3>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• {cleanupPreview.items_to_delete.test_results} resultados de test</li>
                          <li>• {cleanupPreview.items_to_delete.assignments} asignaciones</li>
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePreviewCleanup}
                        disabled={isPreviewLoading || isExecuting || !patientData?.counts?.total}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isPreviewLoading ? (
                          <>
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4" />
                            Vista Previa
                          </>
                        )}
                      </button>

                      {cleanupPreview && (
                        <button
                          type="button"
                          onClick={handleExecuteCleanup}
                          disabled={isExecuting}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isExecuting ? (
                            <>
                              <RefreshCcw className="h-4 w-4 animate-spin" />
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Eliminar Datos
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={loadPatientData}
                        disabled={isLoadingData}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        <RefreshCcw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                        Actualizar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Future Utilities (Placeholder) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('future')}
              className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">Más Herramientas</h2>
                  <p className="text-sm text-gray-500">Próximamente: gestión avanzada</p>
                </div>
              </div>
              {expandedSections.future ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSections.future && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Próximamente se añadirán más herramientas de administración
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Exportación de datos, configuración de notificaciones, preferencias...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
