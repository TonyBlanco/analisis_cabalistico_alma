'use client';

import { useState, useEffect } from 'react';
import { Menu, Filter, Calendar, User, FileText, X, Eye, Save } from 'lucide-react';
import ContextualSlideMenu from '@/components/ContextualSlideMenu';
import { getActivePatient } from '@/lib/active-patient';
import { getPatientResults, getAnalysisRecordDetail, updateAnalysisAnnotations, AnalysisRecord } from '@/lib/analysis-api';

/**
 * Resultados - Panel Terapeuta
 * 
 * Vista principal: Timeline / lista filtrable
 * Requiere paciente activo seleccionado
 * Slide contextual: Filtros (por paciente, tipo, fecha, visibilidad)
 */
export default function TherapistResultsPage() {
  const [slideOpen, setSlideOpen] = useState(false);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [results, setResults] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisRecord | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [annotations, setAnnotations] = useState({ summary: '', notes: '', visible_to_patient: false });
  const [savingAnnotations, setSavingAnnotations] = useState(false);

  useEffect(() => {
    const loadActivePatient = () => {
      const patient = getActivePatient();
      if (patient) {
        setActivePatientId(patient.id);
        fetchResults(patient.id);
      } else {
        setActivePatientId(null);
        setResults([]);
      }
    };

    loadActivePatient();
    window.addEventListener('activePatientChanged', loadActivePatient);
    return () => window.removeEventListener('activePatientChanged', loadActivePatient);
  }, []);

  const fetchResults = async (patientId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientResults(patientId);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultados';
      setError(errorMessage);
      console.error('Error fetching patient results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (result: AnalysisRecord) => {
    setSelectedResult(result);
    setShowDetailView(true);
    
    // Cargar anotaciones existentes
    if (result.therapist_annotations) {
      setAnnotations({
        summary: result.therapist_annotations.summary || '',
        notes: result.therapist_annotations.notes || '',
        visible_to_patient: result.therapist_annotations.visible_to_patient || false,
      });
    } else {
      setAnnotations({ summary: '', notes: '', visible_to_patient: false });
    }

    // Cargar detalle completo
    try {
      const fullResult = await getAnalysisRecordDetail(result.id);
      setSelectedResult(fullResult);
    } catch (err) {
      console.error('Error fetching result details:', err);
    }
  };

  const handleSaveAnnotations = async () => {
    if (!selectedResult) return;

    setSavingAnnotations(true);
    try {
      const updated = await updateAnalysisAnnotations(selectedResult.id, annotations);
      setSelectedResult(updated);
      
      // Actualizar en la lista
      setResults(results.map(r => r.id === updated.id ? updated : r));
      
      // Mostrar feedback
      alert('Anotaciones guardadas correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar anotaciones';
      alert(errorMessage);
      console.error('Error saving annotations:', err);
    } finally {
      setSavingAnnotations(false);
    }
  };

  const filterItems = [
    {
      id: 'patient',
      label: 'Por paciente',
      icon: <User className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implementar selector de paciente
        console.log('Filtrar por paciente');
      },
    },
    {
      id: 'type',
      label: 'Por tipo',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implementar selector de tipo
        console.log('Filtrar por tipo');
      },
    },
    {
      id: 'date',
      label: 'Por fecha',
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implementar selector de fecha
        console.log('Filtrar por fecha');
      },
    },
    {
      id: 'visibility',
      label: 'Por visibilidad',
      icon: <Filter className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implementar selector de visibilidad
        console.log('Filtrar por visibilidad');
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Resultados
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Historial y resultados de análisis realizados
            </p>
          </div>
          <button
            onClick={() => setSlideOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>
      </div>

      {/* Require active patient */}
      {!activePatientId ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              Selecciona un paciente para ver sus resultados
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Ve al Workspace y selecciona un paciente activo
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Cargando resultados...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => activePatientId && fetchResults(activePatientId)}
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
              No hay resultados para este paciente aún.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Los resultados aparecerán aquí una vez que se ejecuten análisis
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados del paciente</h2>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {result.module_code} ({result.kind})
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {result.visibility}
                      </span>
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
                  <button
                    onClick={() => handleViewResult(result)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Ver resultado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail View - Vista Central con Anotaciones */}
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
                  onClick={() => {
                    setShowDetailView(false);
                    setSelectedResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Result Content */}
              <div className="space-y-6">
                {/* Resultado estructurado */}
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

                {/* Anotaciones del terapeuta - Editable */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-md p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Anotaciones del terapeuta</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Resumen
                      </label>
                      <textarea
                        value={annotations.summary}
                        onChange={(e) => setAnnotations({ ...annotations, summary: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={2}
                        placeholder="Resumen breve del resultado..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notas
                      </label>
                      <textarea
                        value={annotations.notes}
                        onChange={(e) => setAnnotations({ ...annotations, notes: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={6}
                        placeholder="Notas detalladas sobre el resultado..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="visible_to_patient"
                        checked={annotations.visible_to_patient}
                        onChange={(e) => setAnnotations({ ...annotations, visible_to_patient: e.target.checked })}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor="visible_to_patient" className="text-sm text-gray-700">
                        Visible para el paciente
                      </label>
                    </div>

                    <button
                      onClick={handleSaveAnnotations}
                      disabled={savingAnnotations}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {savingAnnotations ? 'Guardando...' : 'Guardar anotaciones'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Slide Menu - Filtros */}
      <ContextualSlideMenu
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Filtros"
        items={filterItems.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          onClick: item.onClick,
        }))}
      />
    </div>
  );
}
