'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ActivePatientIndicator from '@/components/ActivePatientIndicator';
import { useRoleGuard } from '@/lib/role-guards';
import { getActivePatient } from '@/lib/active-patient';

type TabId = 'dictionary' | 'tree' | 'hypotheses';

interface DictionaryConflict {
  descripcion?: string | null;
  emociones?: string[];
  frases_resentir?: string[];
  notas?: string | null;
}

interface DictionaryEntry {
  termino: string;
  definicion?: string | null;
  sentido_biologico?: string | null;
  conflictos_emocionales?: DictionaryConflict[];
  referencias_cruzadas?: string[];
  fuente?: {
    book?: string;
    author?: string;
    pages?: number[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TreeOfLifeInterpretation {
  nombre?: string;
  cualidad?: string;
  [key: string]: unknown;
}

interface TreeOfLifeResult {
  sefira?: string;
  interpretacion?: TreeOfLifeInterpretation;
  nota?: string;
}

type HypothesisStatus = 'open' | 'in_review' | 'discarded';
type HypothesisType = 'lealtad_invisible' | 'repeticion' | 'aniversario' | 'proyecto_sentido' | 'otro';

interface Hypothesis {
  id: string;
  patient_id: string;
  termino_bioemocional: string;
  hypothesis_type: HypothesisType;
  description: string;
  status: HypothesisStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

/**
 * Therapist Bio-Emotional & Transgenerational Tree Module
 *
 * Route: /dashboard/therapist/bioemotional
 *
 * Módulo clínico **solo terapeuta**, dependiente de paciente activo.
 * Todas las acciones requieren interacción explícita del terapeuta.
 */
export default function TherapistBioEmotionalPage() {
  // Guard existente para asegurar rol therapist (no modificar patrón global)
  const { authorized } = useRoleGuard({
    currentUserRole: undefined,
    allowedRoles: ['therapist'],
    redirectTo: '/dashboard',
  } as any);

  const [activeTab, setActiveTab] = useState<TabId>('dictionary');

  // Paciente activo (solo lectura desde util existente)
  const [activePatientId, setActivePatientId] = useState<number | null>(null);

  // Estado del diccionario / autocomplete
  const [dictQuery, setDictQuery] = useState('');
  const [dictSearching, setDictSearching] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictResults, setDictResults] = useState<DictionaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [dictTreeOfLife, setDictTreeOfLife] = useState<TreeOfLifeResult | null>(null);

  // Estado de hipótesis
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [hypothesesLoading, setHypothesesLoading] = useState(false);
  const [hypothesesError, setHypothesesError] = useState<string | null>(null);
  const [hypothesesAccessDenied, setHypothesesAccessDenied] = useState(false);

  const [formTerm, setFormTerm] = useState('');
  const [formType, setFormType] = useState<HypothesisType>('lealtad_invisible');
  const [formStatus, setFormStatus] = useState<HypothesisStatus>('open');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edición de hipótesis existente (solo descripción / estado)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivePatient = () => {
      const patient = getActivePatient();
      setActivePatientId(patient ? patient.id : null);
    };

    loadActivePatient();

    const handleChange = () => {
      loadActivePatient();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('activePatientChanged', handleChange);
      window.addEventListener('storage', handleChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('activePatientChanged', handleChange);
        window.removeEventListener('storage', handleChange);
      }
    };
  }, []);

  // Cargar hipótesis cuando haya paciente activo
  useEffect(() => {
    if (!activePatientId) {
      setHypotheses([]);
      setHypothesesError(null);
      setHypothesesAccessDenied(false);
      return;
    }

    const fetchHypotheses = async () => {
      setHypothesesLoading(true);
      setHypothesesError(null);
      setHypothesesAccessDenied(false);
      try {
        const res = await fetch(
          `/api/bioemotional/hypotheses/?patient_id=${encodeURIComponent(String(activePatientId))}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        );
        if (res.status === 403) {
          setHypothesesAccessDenied(true);
          setHypothesesError('No tienes permiso para ver las hipótesis de este paciente.');
          setHypotheses([]);
          return;
        }
        if (!res.ok) {
          let detail = 'No se pudieron cargar las hipótesis.';
          try {
            const data = await res.json();
            detail = (data && (data.detail as string)) || detail;
          } catch {
            // ignore parse error
          }
          setHypothesesError(detail);
          setHypotheses([]);
          return;
        }
        const data = (await res.json()) as Hypothesis[];
        setHypotheses(data);
      } catch (error) {
        console.error('Error fetching hypotheses', error);
        setHypothesesError('Error de red al cargar hipótesis.');
        setHypotheses([]);
      } finally {
        setHypothesesLoading(false);
      }
    };

    void fetchHypotheses();
  }, [activePatientId]);

  const handleSearchDictionary = async () => {
    const q = dictQuery.trim();
    if (!q) {
      setDictResults([]);
      setSelectedEntry(null);
      setDictTreeOfLife(null);
      return;
    }
    setDictSearching(true);
    setDictError(null);
    setSelectedEntry(null);
    setDictTreeOfLife(null);
    try {
      const res = await fetch(
        `/api/bioemotional/dictionary/?q=${encodeURIComponent(q)}&with_tree=1`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      );
      if (res.status === 403) {
        setDictError('No tienes permiso para consultar el diccionario bio-emocional.');
        setDictResults([]);
        return;
      }
      if (!res.ok) {
        let message = 'No se pudo buscar en el diccionario.';
        try {
          const body = await res.json();
          message = (body && (body.detail as string)) || message;
        } catch {
          // ignore
        }
        setDictError(message);
        setDictResults([]);
        return;
      }
      const data = await res.json();
      const results = Array.isArray(data) ? data : (data?.results || []);
      const tree = Array.isArray(data) ? null : (data?.tree_of_life || null);
      setDictResults(results);
      setDictTreeOfLife(tree);
      if (results.length > 0) {
        setSelectedEntry(results[0]);
        setFormTerm(results[0].termino);
      }
    } catch (error) {
      console.error('Error searching dictionary', error);
      setDictError('Error de red al buscar en el diccionario.');
      setDictResults([]);
    } finally {
      setDictSearching(false);
    }
  };

  // Búsqueda incremental (sincronizada con el input)
  useEffect(() => {
    const q = dictQuery.trim();
    if (!q) {
      setDictResults([]);
      setSelectedEntry(null);
      setDictError(null);
      return;
    }
    if (q.length < 2) {
      // evitar ruido con términos de una sola letra
      return;
    }
    const handle = setTimeout(() => {
      void handleSearchDictionary();
    }, 300);
    return () => clearTimeout(handle);
  }, [dictQuery]);

  const handleSelectDictionaryEntry = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setFormTerm(entry.termino);
  };

  const refreshHypotheses = async () => {
    if (!activePatientId) return;
    try {
      const res = await fetch(
        `/api/bioemotional/hypotheses/?patient_id=${encodeURIComponent(String(activePatientId))}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      );
      if (res.status === 403) {
        setHypothesesAccessDenied(true);
        setHypothesesError('No tienes permiso para ver las hipótesis de este paciente.');
        setHypotheses([]);
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as Hypothesis[];
      setHypotheses(data);
    } catch (error) {
      console.error('Error refreshing hypotheses', error);
    }
  };

  const handleCreateHypothesis = async (event: FormEvent) => {
    event.preventDefault();
    if (!activePatientId) {
      setFormError('Selecciona un paciente activo antes de crear una hipótesis.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/bioemotional/hypotheses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          patient_id: activePatientId,
          termino_bioemocional: formTerm.trim(),
          hypothesis_type: formType,
          description: formDescription.trim(),
          status: formStatus,
        }),
      });

      if (!res.ok) {
        let message = 'No se pudo crear la hipótesis.';
        try {
          const body = await res.json();
          // Intentar extraer mensaje de campo concreto
          message =
            (body.detail as string) ||
            (body.termino_bioemocional && String(body.termino_bioemocional)) ||
            (body.patient_id && String(body.patient_id)) ||
            message;
        } catch {
          // ignore
        }
        setFormError(message);
        return;
      }

      setFormDescription('');
      setFormStatus('open');
      await refreshHypotheses();
    } catch (error) {
      console.error('Error creating hypothesis', error);
      setFormError('Error de red al crear la hipótesis.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const startEditHypothesis = (h: Hypothesis) => {
    setEditingId(h.id);
    setEditDescription(h.description);
    setEditError(null);
  };

  const cancelEditHypothesis = () => {
    setEditingId(null);
    setEditDescription('');
    setEditError(null);
  };

  const handleSaveEditHypothesis = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(
        `/api/bioemotional/hypotheses/${encodeURIComponent(editingId)}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ description: editDescription.trim() }),
        },
      );
      if (!res.ok) {
        let message = 'No se pudo actualizar la hipótesis.';
        try {
          const body = await res.json();
          message = (body.detail as string) || message;
        } catch {
          // ignore
        }
        setEditError(message);
        return;
      }
      await refreshHypotheses();
      cancelEditHypothesis();
    } catch (error) {
      console.error('Error updating hypothesis', error);
      setEditError('Error de red al actualizar la hipótesis.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleUpdateHypothesisStatus = async (id: string, status: HypothesisStatus) => {
    try {
      const res = await fetch(`/api/bioemotional/hypotheses/${encodeURIComponent(id)}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.error('No se pudo actualizar el estado de la hipótesis');
        return;
      }
      await refreshHypotheses();
    } catch (error) {
      console.error('Error updating hypothesis status', error);
    }
  };

  const handleDeleteHypothesis = async (id: string) => {
    const confirmed = window.confirm('¿Seguro que quieres eliminar esta hipótesis?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/bioemotional/hypotheses/${encodeURIComponent(id)}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        console.error('No se pudo eliminar la hipótesis');
        return;
      }
      await refreshHypotheses();
    } catch (error) {
      console.error('Error deleting hypothesis', error);
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Bio-Emoción & Árbol Transgeneracional
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Espacio clínico para explorar patrones bio-emocionales y transgeneracionales del
          paciente, de forma estructurada y auditabile, sin diagnósticos automáticos.
        </p>
      </div>

      {/* Paciente activo (no modificar comportamiento, solo reutilizar) */}
      <ActivePatientIndicator />

      {/* Tabs de sección */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'dictionary'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Diccionario
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'tree'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Árbol
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'hypotheses'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Hipótesis
          </button>
        </div>

        {/* Diccionario: búsqueda + detalle READ-ONLY */}
        {activeTab === 'dictionary' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Explora el diccionario bio-emocional para apoyar tu análisis clínico. Esta sección es
              solo de lectura; cualquier interpretación o uso clínico debe ser redactado por ti.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={dictQuery}
                  onChange={(e) => setDictQuery(e.target.value)}
                  placeholder='Buscar término (p. ej. "ABASIA")'
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={handleSearchDictionary}
                  disabled={dictSearching}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60"
                >
                  {dictSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {dictError && <p className="text-sm text-red-600">{dictError}</p>}

              {dictResults.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Resultados ({dictResults.length})
                    </p>
                    <div className="max-h-64 overflow-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                      {dictResults.map((entry) => (
                        <button
                          key={entry.termino}
                          type="button"
                          onClick={() => handleSelectDictionaryEntry(entry)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            selectedEntry && selectedEntry.termino === entry.termino
                              ? 'bg-gray-900/5 font-semibold'
                              : ''
                          }`}
                        >
                          {entry.termino}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">Detalles del término</p>
                    {selectedEntry ? (
                      <div className="border border-gray-200 rounded-md p-3 text-sm space-y-2">
                        <h2 className="font-semibold text-gray-900">{selectedEntry.termino}</h2>
                        {selectedEntry.definicion && (
                          <p className="text-gray-700 whitespace-pre-line">
                            {selectedEntry.definicion}
                          </p>
                        )}
                        {selectedEntry.sentido_biologico && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-0.5">
                              Sentido biológico
                            </p>
                            <p className="text-gray-700 whitespace-pre-line">
                              {selectedEntry.sentido_biologico}
                            </p>
                          </div>
                        )}
                        {selectedEntry.conflictos_emocionales &&
                          selectedEntry.conflictos_emocionales.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                Conflictos emocionales
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedEntry.conflictos_emocionales.map((c, index) => (
                                  <li key={index} className="text-gray-700">
                                    {c.descripcion && (
                                      <span className="block whitespace-pre-line">
                                        {c.descripcion}
                                      </span>
                                    )}
                                    {c.emociones && c.emociones.length > 0 && (
                                      <span className="block text-xs text-gray-500">
                                        Emociones: {c.emociones.join(', ')}
                                      </span>
                                    )}
                                    {c.frases_resentir && c.frases_resentir.length > 0 && (
                                      <span className="block text-xs text-gray-500">
                                        Frases de resentir: {c.frases_resentir.join(' · ')}
                                      </span>
                                    )}
                                    {c.notas && (
                                      <span className="block text-xs text-gray-500">
                                        Notas: {c.notas}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {selectedEntry.referencias_cruzadas &&
                          selectedEntry.referencias_cruzadas.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                Referencias cruzadas
                              </p>
                              <p className="text-xs text-gray-600">
                                {selectedEntry.referencias_cruzadas.join(', ')}
                              </p>
                            </div>
                          )}
                        {selectedEntry.fuente && (
                          <p className="text-xs text-gray-500">
                            Fuente:{' '}
                            {selectedEntry.fuente.book && (
                              <span>{String(selectedEntry.fuente.book)}</span>
                            )}
                            {selectedEntry.fuente.pages &&
                              Array.isArray(selectedEntry.fuente.pages) &&
                              selectedEntry.fuente.pages.length > 0 && (
                                <span>{` · págs. ${selectedEntry.fuente.pages.join(', ')}`}</span>
                              )}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Este contenido es solo de referencia. Cualquier hipótesis o uso clínico
                          debe ser redactado manualmente por ti.
                        </p>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-md p-4 text-sm text-gray-500">
                        Selecciona un término en la lista para ver su contenido de referencia.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dictResults.length === 0 && !dictSearching && !dictError && (
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-sm text-gray-500">
                  Introduce un término y pulsa “Buscar” para consultar el diccionario bio-emocional.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Árbol: se mantiene como placeholder estructural (sin lógica nueva) */}
        {activeTab === 'tree' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Aquí se representará el árbol transgeneracional del paciente (personas y eventos
              clave). Todas las altas/bajas/modificaciones requieren tu acción explícita.
            </p>
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-sm text-gray-500">
              Zona preparada para CRUD manual de:
              <ul className="list-disc list-inside mt-1">
                <li>Personas del árbol (GenealogyPerson).</li>
                <li>Eventos familiares (GenealogyEvent).</li>
              </ul>
              <p className="mt-2">
                No habrá generación automática de árbol ni sugerencias. Toda la información la
                introduces tú como terapeuta.
              </p>
            </div>
          </div>
        )}

        {/* Hipótesis: gestión manual por terapeuta */}
        {activeTab === 'hypotheses' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-700">
              En esta sección puedes registrar y actualizar hipótesis bio-transgeneracionales
              estructuradas para el paciente activo. No hay diagnósticos automáticos ni scoring.
            </p>

            {hypothesesAccessDenied && (
              <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md p-3">
                No tienes permiso para ver o editar hipótesis para este paciente.
              </div>
            )}

            {!activePatientId && (
              <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm rounded-md p-3">
                Selecciona un paciente activo en el panel superior antes de trabajar con hipótesis.
              </div>
            )}

            {hypothesesError && (
              <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md p-3">
                {hypothesesError}
              </div>
            )}

            {/* Lista de hipótesis */}
            {!hypothesesAccessDenied && (
              <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Hipótesis registradas</h2>
                {hypothesesLoading && (
                  <p className="text-xs text-gray-500">Cargando hipótesis del paciente…</p>
                )}
              </div>

              {hypotheses.length === 0 && !hypothesesLoading && activePatientId && (
                <p className="text-sm text-gray-500">
                  Aún no has registrado hipótesis para este paciente.
                </p>
              )}

              {hypotheses.length > 0 && (
                <div className="space-y-2">
                  {hypotheses.map((h) => (
                    <div
                      key={h.id}
                      className="border border-gray-200 rounded-md p-3 text-sm flex flex-col gap-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Término bio-emocional
                          </p>
                          <p className="font-semibold text-gray-900">{h.termino_bioemocional}</p>
                          <p className="mt-1 text-gray-700 whitespace-pre-line">{h.description}</p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Tipo de hipótesis</label>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {h.hypothesis_type}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Estado</label>
                            <select
                              className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white"
                              value={h.status}
                              onChange={(e) =>
                                handleUpdateHypothesisStatus(
                                  h.id,
                                  e.target.value as HypothesisStatus,
                                )
                              }
                            >
                              <option value="open">open</option>
                              <option value="in_review">in_review</option>
                              <option value="discarded">discarded</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p>
                            Creada:{' '}
                            {new Date(h.created_at).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditHypothesis(h)}
                              className="text-xs text-gray-700 hover:text-gray-900"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHypothesis(h.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        {editingId === h.id && (
                          <form
                            onSubmit={handleSaveEditHypothesis}
                            className="mt-1 border-t border-gray-100 pt-2 space-y-2"
                          >
                            <label className="block text-xs font-medium text-gray-700">
                              Editar descripción
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y"
                            />
                            {editError && (
                              <p className="text-xs text-red-600">
                                {editError}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditHypothesis}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={editSaving}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-60"
                              >
                                {editSaving ? 'Guardando…' : 'Guardar cambios'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Formulario de nueva hipótesis */}
            {!hypothesesAccessDenied && (
              <div className="border border-gray-200 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Nueva hipótesis</h2>
              <form onSubmit={handleCreateHypothesis} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">
                      Término bio-emocional (debe existir en el diccionario)
                    </label>
                    <input
                      type="text"
                      value={formTerm}
                      onChange={(e) => setFormTerm(e.target.value)}
                      placeholder="Coincidir con 'termino' del diccionario"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Tipo de hipótesis</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as HypothesisType)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
                    >
                      <option value="lealtad_invisible">lealtad_invisible</option>
                      <option value="repeticion">repeticion</option>
                      <option value="aniversario">aniversario</option>
                      <option value="proyecto_sentido">proyecto_sentido</option>
                      <option value="otro">otro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Estado inicial</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as HypothesisStatus)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
                    >
                      <option value="open">open</option>
                      <option value="in_review">in_review</option>
                      <option value="discarded">discarded</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Descripción de la hipótesis (texto redactado por ti)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y"
                    placeholder="Describe de forma clínica y neutral la hipótesis transgeneracional que estás explorando."
                  />
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={formSubmitting || !activePatientId}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Guardando…' : 'Guardar hipótesis'}
                  </button>
                </div>
              </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
