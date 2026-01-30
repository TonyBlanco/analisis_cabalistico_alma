/**
 * AI Interpretation Panel
 * Displays AI-generated therapeutic interpretations.
 * THERAPIST-ONLY component.
 */
'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, BookOpen, Loader2 } from 'lucide-react';

interface AIInterpretation {
  interpretation_id: string;
  narrative: {
    summary: string;
    key_insights: string[];
    clinical_concerns: string[];
    strengths: string[];
  };
  suggested_diagnoses: Array<{
    code: string;
    name: string;
    probability: number;
    evidence: string[];
  }>;
  therapeutic_route: {
    immediate_focus: {
      sefira?: string;
      issue: string;
      techniques: string[];
    };
    complementary_modalities: Array<{
      modality: string;
      rationale: string;
    }>;
    next_assessments: string[];
    contraindications: string[];
  };
  metadata: {
    model_used: string;
    timestamp: string;
    cost_usd: number;
    tokens?: {
      total: number;
    };
    cached?: boolean;
  };
}

interface AIInterpretationPanelProps {
  testResultId: number;
  existingInterpretation?: AIInterpretation;
  onRefresh?: () => void;
}

export default function AIInterpretationPanel({
  testResultId,
  existingInterpretation,
  onRefresh
}: AIInterpretationPanelProps) {
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(
    existingInterpretation || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInterpretation = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/ai-engine/interpret/${testResultId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify({ force_refresh: forceRefresh })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error generando interpretación');
      }

      const data = await response.json();
      setInterpretation(data);
      onRefresh?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('AI Engine error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!interpretation && !loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Interpretación IA</h3>
          <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            Solo Terapeuta
          </span>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed">
          Genera una interpretación terapéutica profunda usando IA con contexto de DSM-5, 
          ICD-11, modalidades terapéuticas y conocimiento cabalístico.
        </p>

        <button
          onClick={() => generateInterpretation(false)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generar Interpretación IA
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Tiempo estimado: 10-15 segundos • Costo: ~$0.20
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
        <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Generando interpretación con IA...</p>
        <p className="text-sm text-gray-500 mt-2">Analizando resultados y consultando bases de conocimiento...</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-900">Error al generar interpretación</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => generateInterpretation(false)}
          className="text-red-600 hover:text-red-800 underline font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!interpretation) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Interpretación IA</h3>
          {interpretation.metadata.cached && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Cache
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {interpretation.metadata.model_used} • ${interpretation.metadata.cost_usd.toFixed(4)}
          </span>
          <button
            onClick={() => generateInterpretation(true)}
            className="text-purple-600 hover:text-purple-800 transition"
            title="Regenerar interpretación"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Narrative Summary */}
      <div className="mb-6 bg-white rounded-lg p-4 border border-purple-100">
        <h4 className="font-semibold text-gray-900 mb-2">Resumen</h4>
        <p className="text-gray-700 leading-relaxed">{interpretation.narrative.summary}</p>
      </div>

      {/* Key Insights */}
      {interpretation.narrative.key_insights.length > 0 && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-green-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Insights Clave
          </h4>
          <ul className="space-y-2">
            {interpretation.narrative.key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {interpretation.narrative.strengths.length > 0 && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-3">Fortalezas</h4>
          <ul className="space-y-2">
            {interpretation.narrative.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">★</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinical Concerns */}
      {interpretation.narrative.clinical_concerns.length > 0 && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-orange-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Áreas de Atención
          </h4>
          <ul className="space-y-2">
            {interpretation.narrative.clinical_concerns.map((concern, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span className="text-gray-700">{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Diagnoses */}
      {interpretation.suggested_diagnoses.length > 0 && (
        <div className="mb-6 bg-white rounded-lg p-4 border border-indigo-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Patrones Sugeridos
          </h4>
          <div className="space-y-3">
            {interpretation.suggested_diagnoses.map((diagnosis, idx) => (
              <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm text-indigo-600">{diagnosis.code}</span>
                    <p className="font-medium text-gray-900">{diagnosis.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">
                    {(diagnosis.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 mt-2">
                  {diagnosis.evidence.map((evidence, evidx) => (
                    <li key={evidx}>→ {evidence}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapeutic Route */}
      <div className="bg-white rounded-lg p-4 border border-purple-100">
        <h4 className="font-semibold text-gray-900 mb-3">Ruta Terapéutica</h4>
        
        {/* Immediate Focus */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-purple-900 mb-2">Enfoque Inmediato</h5>
          {interpretation.therapeutic_route.immediate_focus.sefira && (
            <p className="text-sm text-gray-600 mb-1">
              <strong>Sefirá:</strong> {interpretation.therapeutic_route.immediate_focus.sefira}
            </p>
          )}
          <p className="text-gray-700 mb-2 font-medium">{interpretation.therapeutic_route.immediate_focus.issue}</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {interpretation.therapeutic_route.immediate_focus.techniques.map((technique, idx) => (
              <li key={idx}>✓ {technique}</li>
            ))}
          </ul>
        </div>

        {/* Complementary Modalities */}
        {interpretation.therapeutic_route.complementary_modalities.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Modalidades Complementarias</h5>
            <div className="space-y-2">
              {interpretation.therapeutic_route.complementary_modalities.map((modality, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">{modality.modality}</p>
                  <p className="text-sm text-gray-600">{modality.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Assessments */}
        {interpretation.therapeutic_route.next_assessments.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Evaluaciones Sugeridas</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              {interpretation.therapeutic_route.next_assessments.map((assessment, idx) => (
                <li key={idx}>→ {assessment}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contraindications */}
        {interpretation.therapeutic_route.contraindications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="font-medium text-yellow-900 mb-2">Contraindicaciones</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              {interpretation.therapeutic_route.contraindications.map((contra, idx) => (
                <li key={idx}>⚠ {contra}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-500 text-center">
          ID: {interpretation.interpretation_id} • {new Date(interpretation.metadata.timestamp).toLocaleString('es-ES')}
          {interpretation.metadata.tokens && ` • ${interpretation.metadata.tokens.total} tokens`}
        </p>
      </div>
    </div>
  );
}
