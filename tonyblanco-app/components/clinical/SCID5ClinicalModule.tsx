'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivePatient } from '@/lib/active-patient';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Activity, MapPin } from 'lucide-react';
import { correlateSCID5AllSections, SCID5CorrelationResult } from '@/lib/api/bioemotional-clinical';

type SectionKey =
  | 'emotional_vitality'
  | 'anxiety_calm'
  | 'meaning_reality'
  | 'impact_memory'
  | 'self_regulation'
  | 'identity_relationships';

type IntensityLevel = 'leve' | 'moderada' | 'intensa' | 'no_aplica';

interface SectionData {
  explorado: boolean;
  patrones_observados: boolean;
  intensidad_experiencial: IntensityLevel;
  notas_observacionales: string;
}

interface HolisticData {
  holistic_exploration: Record<SectionKey, SectionData>;
  additional_observations: string;
  holistic_summary: string;
}

interface AIAssistanceResponse {
  section: string;
  depth_level: number;
  suggested_questions: Array<{ q: string; intent: string }>;
  symbolic_correlations: Array<{ source: string; note: string }>;
  draft_section_synthesis: string;
  ethical_guardrails: string[];
  therapist_actions: Array<{ action: string; why: string }>;
}

const SECTIONS: Record<SectionKey, { title: string; description: string }> = {
  emotional_vitality: {
    title: 'Estado emocional y vitalidad',
    description: 'Explorar la cualidad general del estado emocional y la energía vital de la persona.',
  },
  anxiety_calm: {
    title: 'Ansiedad, preocupación y calma interior',
    description: 'Explorar la relación de la persona con la inquietud, la anticipación y la sensación de seguridad interna.',
  },
  meaning_reality: {
    title: 'Experiencia de realidad y significado',
    description: 'Explorar cómo la persona construye significado, interpreta su experiencia y se relaciona con su mundo interno.',
  },
  impact_memory: {
    title: 'Experiencias de impacto, memoria y estrés',
    description: 'Explorar vivencias que han dejado huella emocional o corporal.',
  },
  self_regulation: {
    title: 'Autorregulación y conducta',
    description: 'Explorar la relación de la persona con sus impulsos, decisiones y acciones.',
  },
  identity_relationships: {
    title: 'Patrones de identidad y relación',
    description: 'Explorar patrones estables de relación consigo mismo y con los demás.',
  },
};

const INITIAL_SECTION: SectionData = {
  explorado: false,
  patrones_observados: false,
  intensidad_experiencial: 'no_aplica',
  notas_observacionales: '',
};

const INITIAL_DATA: HolisticData = {
  holistic_exploration: {
    emotional_vitality: { ...INITIAL_SECTION },
    anxiety_calm: { ...INITIAL_SECTION },
    meaning_reality: { ...INITIAL_SECTION },
    impact_memory: { ...INITIAL_SECTION },
    self_regulation: { ...INITIAL_SECTION },
    identity_relationships: { ...INITIAL_SECTION },
  },
  additional_observations: '',
  holistic_summary: '',
};

export default function SCID5ClinicalModule() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HolisticData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // AI Assistant state
  const [aiDepthLevel, setAiDepthLevel] = useState<1 | 2 | 3>(1);
  const [aiAssistance, setAiAssistance] = useState<Record<string, AIAssistanceResponse>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});

  // BioEmotional Correlation state
  const [bioCorrelations, setBioCorrelations] = useState<Record<SectionKey, SCID5CorrelationResult> | null>(null);
  const [bioCorrelationLoading, setBioCorrelationLoading] = useState(false);
  const [bioCorrelationError, setBioCorrelationError] = useState<string | null>(null);

  const patientId = searchParams?.get('patient_id');
  const activePatient = getActivePatient();

  useEffect(() => {
    if (patientId) {
      loadBioEmotionalCorrelations();
    }
  }, [patientId]);

  const loadBioEmotionalCorrelations = async () => {
    if (!patientId) return;

    setBioCorrelationLoading(true);
    setBioCorrelationError(null);

    try {
      const correlations = await correlateSCID5AllSections(parseInt(patientId));
      // correlateSCID5AllSections already returns a Record
      setBioCorrelations(correlations as Record<SectionKey, SCID5CorrelationResult>);
    } catch (err) {
      console.error('Error loading BioEmotional correlations:', err);
      setBioCorrelationError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBioCorrelationLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId && activePatient) {
      // Could redirect, but since client handles it, assume it's set
    }
  }, [patientId, activePatient]);

  const updateSection = (key: SectionKey, field: keyof SectionData, value: any) => {
    setData((prev) => ({
      ...prev,
      holistic_exploration: {
        ...prev.holistic_exploration,
        [key]: {
          ...prev.holistic_exploration[key],
          [field]: value,
        },
      },
    }));
  };

  const requestAIAssistance = async (sectionKey: SectionKey) => {
    if (!patientId || aiLoading[sectionKey]) return;

    setAiLoading(prev => ({ ...prev, [sectionKey]: true }));
    setAiError((prev) => {
      const next = { ...prev };
      delete next[sectionKey];
      return next;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/analysis-records/scid5-ai-assistant/?patient_id=${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          scid5_data: data,
          depth_level: aiDepthLevel,
          active_section: sectionKey,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error obteniendo asistencia IA');
      }

      const assistance: AIAssistanceResponse = await response.json();
      setAiAssistance(prev => ({ ...prev, [sectionKey]: assistance }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setAiError(prev => ({ ...prev, [sectionKey]: errorMessage }));
    } finally {
      setAiLoading(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const handleSave = async () => {
    if (!patientId || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/analysis-records/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          kind: 'holistic_exploration',
          patient: parseInt(patientId),
          raw_input: data,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al guardar');
      }

      setSuccess(true);
      // Reset form or keep as is
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const hasIncompleteRequired = Object.values(data.holistic_exploration).some(
    (section) => section.patrones_observados && !section.notas_observacionales.trim()
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          SCID-5 — Exploración Holística Estructurada
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Herramienta de exploración holística (no diagnóstica). Uso exclusivo del terapeuta.
        </p>
        {activePatient && (
          <p className="text-xs text-gray-500">
            Paciente: {activePatient.name} (ID: {activePatient.id})
          </p>
        )}

        {/* AI Assistant Configuration */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Asistente IA Holístico</h3>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Nivel de profundidad:
            </label>
            <select
              value={aiDepthLevel}
              onChange={(e) => setAiDepthLevel(parseInt(e.target.value) as 1 | 2 | 3)}
              className="border border-gray-300 rounded-md p-1 text-sm"
            >
              <option value={1}>Básico (2-3 preguntas)</option>
              <option value={2}>Profundo (4-6 preguntas)</option>
              <option value={3}>Avanzado (6-10 preguntas)</option>
            </select>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            El asistente IA sugiere preguntas, correlaciones simbólicas y borradores revisables.
            Todas las sugerencias requieren validación y edición por parte del terapeuta.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Registro guardado exitosamente.</p>
        </div>
      )}

      <div className="space-y-4">
        {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
          const section = SECTIONS[key];
          const sectionData = data.holistic_exploration[key];
          return (
            <details key={key} className="bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  {section.title}
                  {(bioCorrelations?.[key]?.matched_regions?.length ?? 0) > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {bioCorrelations![key].matched_regions.length} región{bioCorrelations![key].matched_regions.length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    requestAIAssistance(key);
                  }}
                  disabled={aiLoading[key]}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 text-sm"
                >
                  <Lightbulb className="h-4 w-4" />
                  {aiLoading[key] ? 'Cargando...' : 'Asistente IA'}
                </button>
              </summary>
              <div className="p-4 border-t border-gray-200 space-y-4">
                <p className="text-sm text-gray-600">{section.description}</p>

                {/* AI Assistance Panel */}
                {(aiAssistance[key] || aiError[key]) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Asistencia IA - Nivel {aiAssistance[key]?.depth_level || aiDepthLevel}</h4>
                    </div>

                    {aiError[key] && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">{aiError[key]}</p>
                      </div>
                    )}

                    {aiAssistance[key] && (
                      <>
                        {/* Suggested Questions */}
                        {aiAssistance[key].suggested_questions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-blue-800 mb-2">Preguntas sugeridas:</h5>
                            <ul className="space-y-2">
                              {aiAssistance[key].suggested_questions.map((q, idx) => (
                                <li key={idx} className="bg-white p-3 rounded border border-blue-100">
                                  <p className="text-sm font-medium text-gray-900 mb-1">"{q.q}"</p>
                                  <p className="text-xs text-gray-600">Propósito: {q.intent}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Symbolic Correlations */}
                        {aiAssistance[key].symbolic_correlations.length > 0 && (
                          <div>
                            <h5 className="font-medium text-blue-800 mb-2">Correlaciones simbólicas:</h5>
                            <ul className="space-y-2">
                              {aiAssistance[key].symbolic_correlations.map((corr, idx) => (
                                <li key={idx} className="bg-white p-3 rounded border border-blue-100">
                                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded mb-1">
                                    {corr.source.toUpperCase()}
                                  </span>
                                  <p className="text-sm text-gray-700">{corr.note}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Draft Synthesis */}
                        {aiAssistance[key].draft_section_synthesis && (
                          <div>
                            <h5 className="font-medium text-blue-800 mb-2">Borrador de síntesis (editable):</h5>
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-sm text-gray-700 italic">{aiAssistance[key].draft_section_synthesis}</p>
                            </div>
                          </div>
                        )}

                        {/* Ethical Guardrails */}
                        {aiAssistance[key].ethical_guardrails.length > 0 && (
                          <div>
                            <h5 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Recordatorios éticos:
                            </h5>
                            <ul className="space-y-1">
                              {aiAssistance[key].ethical_guardrails.map((guard, idx) => (
                                <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {guard}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Therapist Actions */}
                        {aiAssistance[key].therapist_actions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">Acciones sugeridas:</h5>
                            <ul className="space-y-2">
                              {aiAssistance[key].therapist_actions.map((action, idx) => (
                                <li key={idx} className="bg-white p-3 rounded border border-green-100">
                                  <p className="text-sm font-medium text-gray-900 mb-1">{action.action}</p>
                                  <p className="text-xs text-gray-600">{action.why}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* BioEmotional Correlation Panel */}
                {(() => {
                  const correlation = bioCorrelations?.[key];
                  const matchedRegions = correlation?.matched_regions ?? [];
                  if (matchedRegions.length === 0) return null;

                  const strength = correlation?.correlation_strength ?? 0;
                  return (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Correlación Corporal BioEmotional</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        strength >= 0.7 ? 'bg-green-100 text-green-800' :
                        strength >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(strength * 100).toFixed(0)}% correlación
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Regiones corporales asociadas:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {matchedRegions.map((region, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-1"
                          >
                            {region.region}
                            <span className="text-xs opacity-70">({region.count}x)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {correlation?.clinical_notes && (
                      <div className="text-sm text-purple-700 bg-white rounded p-2 border border-purple-100">
                        <strong>Nota clínica:</strong> {correlation.clinical_notes}
                      </div>
                    )}
                  </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sectionData.explorado}
                      onChange={(e) => updateSection(key, 'explorado', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">¿Se exploró esta área?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sectionData.patrones_observados}
                      onChange={(e) => updateSection(key, 'patrones_observados', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">¿Se observaron patrones?</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intensidad experiencial
                  </label>
                  <select
                    value={sectionData.intensidad_experiencial}
                    onChange={(e) => updateSection(key, 'intensidad_experiencial', e.target.value as IntensityLevel)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="no_aplica">No aplica</option>
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="intensa">Intensa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas observacionales
                    {sectionData.patrones_observados && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    value={sectionData.notas_observacionales}
                    onChange={(e) => updateSection(key, 'notas_observacionales', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Registrar observaciones clínicas..."
                  />
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones holísticas adicionales
        </label>
        <textarea
          value={data.additional_observations}
          onChange={(e) => setData((prev) => ({ ...prev, additional_observations: e.target.value }))}
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Factores culturales, espirituales, contextuales..."
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Síntesis holística del acompañante *
        </label>
        <textarea
          value={data.holistic_summary}
          onChange={(e) => setData((prev) => ({ ...prev, holistic_summary: e.target.value }))}
          rows={6}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Síntesis elaborada desde una mirada holística e integradora..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || hasIncompleteRequired || !data.holistic_summary.trim()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </div>
  );
}