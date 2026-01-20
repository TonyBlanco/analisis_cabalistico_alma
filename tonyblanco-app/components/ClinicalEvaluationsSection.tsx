'use client';

import { useState, useEffect } from 'react';
import { getAvailableTests, executeTest } from '@/lib/test-api';
import { TestModule, ExecuteTestRequest } from '@/lib/test-types';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { getPatientDetail } from '@/lib/assignment-api';
import { validateProfileForAnalysis } from '@/lib/profile-validation';
import ProfileCompletionModal from './ProfileCompletionModal';
import { generateWithGemini } from '@/lib/gemini-config';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

/**
 * Holistic Evaluations Section Component
 * 
 * Displays therapist_holistic tests with "Execute" button.
 * Only executes when active consultante is selected.
 * Opens a modal/form to collect input data for the test execution.
 */
export default function ClinicalEvaluationsSection() {
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executingTestCode, setExecutingTestCode] = useState<string | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [testToExecute, setTestToExecute] = useState<TestModule | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidationResult, setProfileValidationResult] = useState<{ missingFields: string[] } | null>(null);
  const [activePatientId, setActivePatientIdState] = useState<number | null>(null);
  const [activePatientName, setActivePatientNameState] = useState<string | null>(null);
  const [analysisRecords, setAnalysisRecords] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<any | null>(null);
  const [analysisDetailLoading, setAnalysisDetailLoading] = useState(false);
  const [analysisDetailError, setAnalysisDetailError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMessage, setNotesMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Cargar paciente activo solo en cliente para evitar mismatches SSR/CSR
  useEffect(() => {
    const id = getActivePatientId();
    const name = getActivePatientName();
    setActivePatientIdState(id);
    setActivePatientNameState(name);
  }, []);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (!activePatientId) {
      setAnalysisRecords([]);
      setAnalysisError(null);
      setSelectedAnalysisId(null);
      setAnalysisDetail(null);
      setNotes('');
      setNotesMessage(null);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setAnalysisError('No auth token found.');
      return;
    }

    const fetchAnalysisRecords = async () => {
      setAnalysisLoading(true);
      setAnalysisError(null);

      try {
        const response = await fetch(
          `${API_URL}/analysis-records/?patient_id=${encodeURIComponent(String(activePatientId))}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Error al cargar evaluaciones holísticas');
        }
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data?.results || []);
        setAnalysisRecords(items);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar evaluaciones holísticas';
        setAnalysisError(errorMessage);
        setAnalysisRecords([]);
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchAnalysisRecords();
  }, [activePatientId]);

  useEffect(() => {
    if (!selectedAnalysisId) {
      setAnalysisDetail(null);
      setNotes('');
      setNotesMessage(null);
      setAiNarrative(null);
      setAiError(null);
      setAiMessage(null);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setAnalysisDetailError('No auth token found.');
      return;
    }

    const fetchDetail = async () => {
      setAnalysisDetailLoading(true);
      setAnalysisDetailError(null);
      setNotesMessage(null);

      try {
        const response = await fetch(`${API_URL}/analysis-records/${selectedAnalysisId}/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Error al cargar el análisis.');
        }
        const data = await response.json();
        setAnalysisDetail(data);
        setNotes(String(data?.annotations || data?.notes || ''));
        setAiNarrative(null);
        setAiError(null);
        setAiMessage(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el análisis.';
        setAnalysisDetailError(errorMessage);
      } finally {
        setAnalysisDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedAnalysisId]);

  useEffect(() => {
    // Load patient data when modal opens
    if (showExecuteModal && testToExecute && activePatientId) {
      loadPatientData();
    }
  }, [showExecuteModal, testToExecute, activePatientId]);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTests();
      // Filter only therapist_clinical tests
      const clinicalTests = (response.tests || []).filter(
        (test: TestModule) => test.available_for_therapists === true && test.available_for_personal === false
      );
      setTests(clinicalTests);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar evaluaciones holísticas';
      setError(errorMessage);
      console.error('Error fetching clinical tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    if (!activePatientId) return;

    try {
      const patient = await getPatientDetail(activePatientId);
      setPatientData(patient);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setPatientData(null);
    }
  };

  const handleExecuteTest = async (test: TestModule) => {
    if (!activePatientId) {
      alert('Por favor, selecciona un consultante activo antes de ejecutar una evaluación holística.');
      return;
    }

    // VALIDATION: Check profile before allowing clinical evaluation
    const validation = await validateProfileForAnalysis();
    if (!validation.isValid) {
      setProfileValidationResult({ missingFields: validation.missingFields });
      setShowProfileModal(true);
      return;
    }

    setTestToExecute(test);
    setShowExecuteModal(true);
  };

  const handleConfirmExecute = async () => {
    if (!testToExecute || !activePatientId || !patientData) return;

    setExecutingTestCode(testToExecute.code);

    try {
      // Prepare input_data based on test type
      const inputData: Record<string, any> = {
        nombre: patientData.full_name || patientData.first_name || '',
        fecha_nacimiento: patientData.birth_date || '',
        fecha: new Date().toISOString().split('T')[0],
        terapeuta: 'Terapeuta', // TODO: Get actual therapist name from session
      };

      // For clinical tests, we typically need responses/responses data
      // This will vary by test type - for now, we'll use a minimal structure
      if (testToExecute.test_type === 'bdi' || testToExecute.test_type === 'bai') {
        // These tests require responses - but we'll let the backend handle validation
        inputData.responses = {};
      }

      const request: ExecuteTestRequest = {
        test_module_code: testToExecute.code,
        input_data: inputData,
        patient_id: activePatientId,
        client_name: patientData.full_name || patientData.first_name || '',
        client_birth_date: patientData.birth_date || '',
        save_result: true,
      };

      const result = await executeTest(request);

      // Show success message
      alert(`Exploración "${testToExecute.name}" completada correctamente.`);
      
      // Close modal and refresh
      setShowExecuteModal(false);
      setTestToExecute(null);
      setPatientData(null);

      // Trigger refresh event for results list
      window.dispatchEvent(new Event('assignedTestsChanged'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al ejecutar evaluación';
      alert(errorMessage);
      console.error('Error executing clinical test:', error);
    } finally {
      setExecutingTestCode(null);
    }
  };

  const handleCancelExecute = () => {
    setShowExecuteModal(false);
    setTestToExecute(null);
    setPatientData(null);
  };

  const buildAiPrompt = () => {
    if (!analysisDetail) return '';

    const analysisType = analysisDetail.analysis_type || analysisDetail.type || analysisDetail.name || 'N/A';
    const analysisDate = analysisDetail.created_at || analysisDetail.updated_at || 'N/A';
    const analysisSummary = analysisDetail.summary || 'N/A';
    const resultData = safeJson(analysisDetail.result_data ?? analysisDetail);
    const therapistNotes = notes && notes.trim() ? notes.trim() : 'N/A';

    return [
      'Eres un asistente holístico para uso exclusivo del terapeuta.',
      'Usa solo la informacion provista; no inventes datos.',
      'No lecturas ni prescripciones.',
      'Devuelve en espanol con la estructura exacta:',
      'Observaciones clave:',
      '- ...',
      'Patrones detectados:',
      '- ...',
      'Hipotesis terapeuticas (no lecturas):',
      '- ...',
      'Sugerencias de exploracion (no prescripciones):',
      '- ...',
      '',
      'Datos del analisis:',
      `Tipo: ${analysisType}`,
      `Fecha: ${analysisDate}`,
      `Resumen: ${analysisSummary}`,
      `Resultados (result_data): ${resultData}`,
      `Notas del terapeuta: ${therapistNotes}`
    ].join('\n');
  };

  const handleGenerateNarrative = async () => {
    if (!analysisDetail) return;

    setAiLoading(true);
    setAiError(null);
    setAiMessage(null);

    try {
      const prompt = buildAiPrompt();
      const narrative = await generateWithGemini(prompt);

      if (!narrative) {
        throw new Error('Empty response');
      }

      setAiNarrative(narrative);
      setAiMessage('Narrativa generada.');
    } catch {
      setAiError('No se pudo generar la narrativa. Intenta nuevamente.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyNarrative = async () => {
    if (!aiNarrative) return;

    try {
      await navigator.clipboard.writeText(aiNarrative);
      setAiMessage('Narrativa copiada al portapapeles.');
      setAiError(null);
    } catch {
      setAiError('No se pudo copiar la narrativa.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evaluaciones Holísticas</h2>
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <div className="h-2 w-40 bg-gray-200 rounded mb-2"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando evaluaciones holísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evaluaciones Holísticas</h2>
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
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Evaluaciones Holísticas</h2>
          {activePatientName && (
            <p className="text-sm text-gray-500 mt-1">
              Consultante activo:{' '}
              <span className="font-medium">{activePatientName}</span>
            </p>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-sm text-gray-500">No hay evaluaciones holísticas disponibles.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.code}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    {test.description && (
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Evaluación holística
                      </span>
                      {test.test_type && (
                        <span className="text-xs text-gray-500">{test.test_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ExecuteTestButton
                      test={test}
                      onExecute={() => handleExecuteTest(test)}
                      disabled={executingTestCode === test.code || !activePatientId}
                      hasActivePatient={!!activePatientId}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Evaluaciones Holísticas Registradas</h3>
          {analysisLoading && (
            <p className="text-sm text-gray-500">Cargando evaluaciones holísticas...</p>
          )}
          {!analysisLoading && analysisError && (
            <p className="text-sm text-red-600">{analysisError}</p>
          )}
          {!analysisLoading && !analysisError && analysisRecords.length === 0 && (
            <p className="text-sm text-gray-500">No hay evaluaciones holísticas registradas.</p>
          )}
          {!analysisLoading && !analysisError && analysisRecords.length > 0 && (
            <div className="space-y-3">
              {analysisRecords.map((record) => {
                const recordType = record.analysis_type || record.module || record.type || record.name;
                const recordStatus = record.status || record.state;
                const recordDate = record.completed_at || record.created_at || record.updated_at;
                const recordId = String(record.uuid || record.id || '');
                const hasSummary = recordType || recordStatus || recordDate;

                return (
                  <div key={recordId} className="border border-gray-200 rounded-md p-3">
                    {hasSummary ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>Tipo: {recordType || 'N/A'}</div>
                        <div>Estado: {recordStatus || 'N/A'}</div>
                        <div>Fecha: {recordDate || 'N/A'}</div>
                      </div>
                    ) : (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                        {safeJson(record)}
                      </pre>
                    )}

                    {recordId && (
                      <button
                        onClick={() => setSelectedAnalysisId(recordId)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver síntesis
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedAnalysisId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Síntesis Holística</h3>
              <p className="text-xs text-gray-500">Análisis holístico — uso exclusivo del terapeuta</p>
            </div>
            <button
              onClick={() => setSelectedAnalysisId(null)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Cerrar
            </button>
          </div>

          {analysisDetailLoading && (
            <p className="text-sm text-gray-500">Cargando análisis...</p>
          )}
          {!analysisDetailLoading && analysisDetailError && (
            <p className="text-sm text-red-600">{analysisDetailError}</p>
          )}
          {!analysisDetailLoading && !analysisDetailError && analysisDetail && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 space-y-1">
                <div>Tipo: {analysisDetail.analysis_type || analysisDetail.type || analysisDetail.name || 'N/A'}</div>
                <div>Fecha: {analysisDetail.created_at || analysisDetail.updated_at || 'N/A'}</div>
                {analysisDetail.summary && (
                  <div>Resumen: {analysisDetail.summary}</div>
                )}
              </div>

              <details className="text-sm text-gray-700">
                <summary className="cursor-pointer text-gray-600">Ver resultado (raw)</summary>
                <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap break-words">
                  {safeJson(analysisDetail.result_data ?? analysisDetail)}
                </pre>
              </details>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del terapeuta
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {notesMessage && (
                <div
                  className={`rounded-md border p-3 text-sm ${
                    notesMessage.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {notesMessage.text}
                </div>
              )}

              <button
                type="button"
                disabled={savingNotes}
                onClick={async () => {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                  if (!token) {
                    setNotesMessage({ type: 'error', text: 'Sesión no válida. Vuelve a iniciar sesión.' });
                    return;
                  }
                  setSavingNotes(true);
                  setNotesMessage(null);
                  try {
                    const response = await fetch(
                      `${API_URL}/analysis-records/${selectedAnalysisId}/annotations/`,
                      {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Token ${token}`,
                        },
                        body: JSON.stringify({ annotations: notes }),
                      }
                    );
                    if (!response.ok) {
                      throw new Error('No se pudo guardar la nota holística.');
                    }
                    const updated = await response.json();
                    setAnalysisDetail(updated);
                    setNotes(String(updated?.annotations || updated?.notes || notes));
                    setNotesMessage({ type: 'success', text: 'Notas guardadas correctamente.' });
                  } catch {
                    setNotesMessage({ type: 'error', text: 'No se pudo guardar la nota holística.' });
                  } finally {
                    setSavingNotes(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {savingNotes ? 'Guardando...' : 'Guardar notas'}
              </button>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Narrativa asistida (IA)</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Contenido generado por IA como apoyo al criterio holístico.
                </p>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateNarrative}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  {aiLoading ? 'Generando...' : 'Generar narrativa holística (IA)'}
                </button>

                {aiError && (
                  <p className="text-sm text-red-600 mt-2">{aiError}</p>
                )}
                {aiMessage && (
                  <p className="text-sm text-green-700 mt-2">{aiMessage}</p>
                )}

                {aiNarrative && (
                  <div className="mt-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                      {aiNarrative}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopyNarrative}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Copiar texto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileValidationResult(null);
        }}
        missingFields={profileValidationResult?.missingFields}
      />

      {/* Execute Confirmation Modal */}
      {showExecuteModal && testToExecute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCancelExecute}>
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Iniciar Exploración Holística</h3>
            
            {patientData ? (
              <>
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Consultante:</strong> {patientData.full_name || patientData.first_name || 'N/A'}
                  </p>
                  {patientData.birth_date && (
                    <p className="text-sm text-gray-600">
                      <strong>Fecha de nacimiento:</strong> {new Date(patientData.birth_date).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Deseas iniciar la exploración <strong>"{testToExecute.name}"</strong> para este consultante?
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Nota: Los datos del consultante se utilizarán para la evaluación. Los resultados se guardarán automáticamente.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Cargando datos del consultante...
              </p>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleCancelExecute}
                disabled={executingTestCode === testToExecute.code}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExecute}
                disabled={executingTestCode === testToExecute.code || !patientData}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {executingTestCode === testToExecute.code ? 'Explorando...' : 'Explorar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// Helper component for execute button
function ExecuteTestButton({
  test,
  onExecute,
  disabled,
  hasActivePatient,
}: {
  test: TestModule;
  onExecute: () => void;
  disabled: boolean;
  hasActivePatient: boolean;
}) {
  if (!disabled && !hasActivePatient) {
    return (
      <button
        disabled
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
        title="Selecciona un consultante activo para iniciar exploraciones"
      >
        Explorar
      </button>
    );
  }

  return (
    <button
      onClick={onExecute}
      disabled={disabled}
      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      style={{ backgroundColor: 'var(--accent-color)' }}
    >
      {disabled ? 'Explorando...' : 'Explorar'}
    </button>
  );
}
