'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

interface HolisticSynthesis {
  scores: Record<string, number>;
  color_alerts: Record<string, string>;
  axis_contributions: Record<string, any[]>;
  metadata: {
    total_records: number;
    computed_at: string;
    patient_id: number;
  };
}

interface AIAnalysis {
  dominant_themes: string[];
  priority_axes: string[];
  recurrent_patterns: string[];
  areas_of_progress: string[];
  areas_of_stagnation: string[];
  evaluated_summary: string;
  confidence_level: 'low' | 'medium' | 'high';
  limits_notice: string;
}

interface AnalysisRecord {
  id: string;
  kind: string;
  computed_result: HolisticSynthesis;
  raw_input: {
    ai_analysis: AIAnalysis;
  };
  therapist_annotations?: {
    summary?: string;
    notes?: string;
    therapist_validation?: boolean;
  };
  created_at: string;
}

const AXIS_NAMES: Record<string, string> = {
  identity_purpose: 'Identidad y Propósito',
  emotion_regulation: 'Emoción y Regulación',
  relationships_bonds: 'Relaciones y Vínculos',
  vital_energy: 'Energía Vital y Cuerpo Simbólico',
  cycles_change: 'Ciclos y Procesos de Cambio',
  memory_lineage: 'Memoria y Linaje Transgeneracional'
};

const COLOR_MESSAGES: Record<string, string> = {
  verde: 'Área integrada',
  amarillo: 'Área en proceso',
  naranja: 'Área que merece atención consciente',
  rojo: 'Área importante para explorar con acompañamiento'
};

const COLOR_CLASSES: Record<string, string> = {
  verde: 'bg-green-100 text-green-800',
  amarillo: 'bg-yellow-100 text-yellow-800',
  naranja: 'bg-orange-100 text-orange-800',
  rojo: 'bg-red-100 text-red-800'
};

export default function PatientHolisticSummary() {
  const [synthesis, setSynthesis] = useState<AnalysisRecord | null>(null);
  const [evolution, setEvolution] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHolisticSummary();
  }, []);

  const loadHolisticSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analysis records for current patient
      const response = await fetch(`${API_BASE_URL}/analysis-records/`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analysis records');
      }

      const data = await response.json();
      const msheRecords = data.results.filter((r: AnalysisRecord) =>
        r.kind === 'holistic_evaluative_synthesis' && r.therapist_annotations?.therapist_validation
      );

      if (msheRecords.length === 0) {
        setError('No hay síntesis holística disponible aún. Tu terapeuta generará una cuando sea el momento apropiado.');
        return;
      }

      // Get the most recent validated synthesis
      const latestSynthesis = msheRecords[0];
      setSynthesis(latestSynthesis);
      setEvolution(msheRecords);

    } catch (err) {
      console.error('Error loading holistic summary:', err);
      setError('Error al cargar la síntesis holística. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getEvolutionIndicator = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return '→'; // Neutral for first reading

    const diff = currentScore - previousScore;
    if (diff > 5) return '↑'; // Significant improvement
    if (diff < -5) return '↓'; // Significant change
    return '→'; // Stable
  };

  const getEvolutionText = (indicator: string) => {
    switch (indicator) {
      case '↑': return 'proceso de integración';
      case '↓': return 'cambio observado';
      case '→': return 'etapa actual';
      default: return 'proceso personal';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tu síntesis holística...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Síntesis Holística No Disponible
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!synthesis) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No hay síntesis holística disponible.</p>
        </div>
      </div>
    );
  }

  const therapistSummary = synthesis.therapist_annotations?.summary;
  const aiAnalysis = synthesis.raw_input.ai_analysis;
  const scores = synthesis.computed_result.scores;
  const colorAlerts = synthesis.computed_result.color_alerts;

  // Get previous synthesis for evolution comparison
  const previousSynthesis = evolution.length > 1 ? evolution[1] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tu Síntesis Holística
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Lectura simbólica orientativa
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            Esta información no es médica ni diagnóstica. Es una lectura simbólica que acompaña tu proceso personal.
          </p>
        </div>
      </div>

      {/* Areas de Atención */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Áreas de Atención
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(colorAlerts).map(([axis, color]) => (
            <div key={axis} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">
                {AXIS_NAMES[axis] || axis}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${COLOR_CLASSES[color]}`}>
                {COLOR_MESSAGES[color]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lectura Integrada */}
      {therapistSummary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lectura Integrada
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {therapistSummary}
            </p>
          </div>
        </div>
      )}

      {/* Lectura Simbólica */}
      {aiAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lectura Simbólica
          </h2>
          <div className="space-y-4">
            {aiAnalysis.dominant_themes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Temas Principales</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {aiAnalysis.dominant_themes.slice(0, 3).map((theme, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {theme}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysis.areas_of_progress.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Áreas de Progreso</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {aiAnalysis.areas_of_progress.slice(0, 3).map((area, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evolución Personal */}
      {evolution.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Evolución Personal
          </h2>
          <div className="space-y-4">
            {Object.entries(scores).map(([axis, score]) => {
              const previousScore = previousSynthesis?.computed_result.scores[axis];
              const indicator = getEvolutionIndicator(score, previousScore);
              const evolutionText = getEvolutionText(indicator);

              return (
                <div key={axis} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    {AXIS_NAMES[axis] || axis}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{evolutionText}</span>
                    <span className="text-lg">{indicator}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Las flechas indican cambios significativos en tu proceso personal a lo largo del tiempo.
          </p>
        </div>
      )}

      {/* Footer Ético */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Aviso Importante
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Esta lectura es simbólica y orientativa. Las decisiones personales siempre dependen de tu discernimiento y acompañamiento profesional cuando lo consideres necesario.
          </p>
        </div>
      </div>
    </div>
  );
}