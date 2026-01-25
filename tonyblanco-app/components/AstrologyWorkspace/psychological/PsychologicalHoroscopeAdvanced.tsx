"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Copy, Check, AlertCircle } from 'lucide-react';
import type { AdvancedChartInput } from '../chart/chartTypes';
import { buildPsychProfile } from './psychEngine';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/auth';

interface Props {
  advanced: AdvancedChartInput;
  patientId?: string;
}

interface AIInterpretation {
  section: string;
  content: string;
  loading: boolean;
  error?: string;
}

export default function PsychologicalHoroscopeAdvanced({ advanced, patientId }: Props) {
  const profile = useMemo(() => buildPsychProfile(advanced), [advanced]);
  
  // AI interpretation state
  const [aiInterpretations, setAiInterpretations] = useState<Record<string, AIInterpretation>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const generateInterpretation = useCallback(async (section: string, data: any) => {
    if (!patientId) return;

    setAiInterpretations(prev => ({
      ...prev,
      [section]: { section, content: '', loading: true }
    }));

    try {
      const token = getAuthToken();
      const apiUrl = getApiBaseUrl();

      const response = await fetch(`${apiUrl}/astrology/interpret/psychological/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          patient_id: patientId,
          section,
          data,
          profile_summary: {
            dominantArchetypes: profile.dominantArchetypes,
            shadowConflicts: profile.shadowConflicts,
            individuationKeys: profile.individuationKeys,
            sevenSinsArchetypes: profile.sevenSinsArchetypes,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const result = await response.json();
      
      setAiInterpretations(prev => ({
        ...prev,
        [section]: { section, content: result.interpretation, loading: false }
      }));
    } catch (error: any) {
      setAiInterpretations(prev => ({
        ...prev,
        [section]: { section, content: '', loading: false, error: error.message }
      }));
    }
  }, [patientId, profile]);

  const generateAllInterpretations = async () => {
    if (!patientId) return;
    setIsGeneratingAll(true);

    const sections = [
      { key: 'archetypes', data: profile.dominantArchetypes },
      { key: 'shadow', data: profile.shadowConflicts },
      { key: 'individuation', data: profile.individuationKeys },
      { key: 'sins', data: profile.sevenSinsArchetypes },
    ];

    for (const { key, data } of sections) {
      if (data.length > 0 || key === 'archetypes') {
        await generateInterpretation(key, data);
      }
    }

    setIsGeneratingAll(false);
  };

  const renderInterpretation = (section: string) => {
    const interp = aiInterpretations[section];
    if (!interp) return null;

    if (interp.loading) {
      return (
        <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span className="text-sm text-purple-700">Generando interpretación junguiana...</span>
        </div>
      );
    }

    if (interp.error) {
      return (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{interp.error}</span>
        </div>
      );
    }

    if (interp.content) {
      return (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800">Interpretación AI (Enfoque Junguiano)</span>
            </div>
            <button
              onClick={() => copyToClipboard(interp.content, section)}
              className="p-1 hover:bg-purple-100 rounded transition-colors"
              title="Copiar interpretación"
            >
              {copiedSection === section ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-purple-500" />
              )}
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {interp.content}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">Psicológico Avanzado — Lectura simbólica</h3>
          <p className="text-xs text-gray-600">Enfoque junguiano (Liz Greene) — interpretación simbólica, no clínica.</p>
        </div>
        {patientId && (
          <button
            onClick={generateAllInterpretations}
            disabled={isGeneratingAll}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Interpretando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Interpretar Todo
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* Arquetipos Dominantes */}
        <section className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('archetypes')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">🎭 Arquetipos Dominantes</span>
              <span className="text-xs text-gray-500">({profile.dominantArchetypes.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {!aiInterpretations['archetypes']?.content && patientId && (
                <button
                  onClick={(e) => { e.stopPropagation(); generateInterpretation('archetypes', profile.dominantArchetypes); }}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600"
                  title="Generar interpretación AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              {expandedSections['archetypes'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedSections['archetypes'] && (
            <div className="p-3">
              <div className="grid gap-2">
                {profile.dominantArchetypes.map(d => (
                  <div key={d.planet} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded">
                    <div>
                      <div className="font-medium text-sm capitalize">{d.planet}</div>
                      <div className="text-xs text-gray-500">{d.reason}</div>
                    </div>
                    <div className="text-xs font-semibold text-purple-600">peso {d.weight}</div>
                  </div>
                ))}
              </div>
              {renderInterpretation('archetypes')}
            </div>
          )}
        </section>

        {/* Conflictos Internos (Sombra) */}
        <section className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('shadow')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">🌑 Conflictos Internos (Sombra)</span>
              <span className="text-xs text-gray-500">({profile.shadowConflicts.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {profile.shadowConflicts.length > 0 && !aiInterpretations['shadow']?.content && patientId && (
                <button
                  onClick={(e) => { e.stopPropagation(); generateInterpretation('shadow', profile.shadowConflicts); }}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600"
                  title="Generar interpretación AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              {expandedSections['shadow'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedSections['shadow'] && (
            <div className="p-3">
              {profile.shadowConflicts.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No hay tensiones mayores detectadas.</div>
              ) : (
                <div className="grid gap-2">
                  {profile.shadowConflicts.map((s, i) => (
                    <div key={i} className="p-2 bg-white border border-gray-100 rounded">
                      <div className="font-medium text-sm">{s.pattern}</div>
                      <div className="text-xs text-gray-500">Evidencias: {s.evidence.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
              {renderInterpretation('shadow')}
            </div>
          )}
        </section>

        {/* Individuación */}
        <section className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('individuation')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">🌀 Individuación — Pistas de integración</span>
              <span className="text-xs text-gray-500">({profile.individuationKeys.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {profile.individuationKeys.length > 0 && !aiInterpretations['individuation']?.content && patientId && (
                <button
                  onClick={(e) => { e.stopPropagation(); generateInterpretation('individuation', profile.individuationKeys); }}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600"
                  title="Generar interpretación AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              {expandedSections['individuation'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedSections['individuation'] && (
            <div className="p-3">
              {profile.individuationKeys.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No hay claves de individuación detectables.</div>
              ) : (
                <div className="grid gap-2">
                  {profile.individuationKeys.map((k, i) => (
                    <div key={i} className="p-2 bg-white border border-gray-100 rounded">
                      <div className="font-medium text-sm">{k.theme}</div>
                      <div className="text-xs text-gray-500">Evidencias: {k.evidence.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
              {renderInterpretation('individuation')}
            </div>
          )}
        </section>

        {/* Los Siete Pecados */}
        <section className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('sins')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">⚖️ Los Siete Pecados — arquetipos simbólicos</span>
              <span className="text-xs text-gray-500">({profile.sevenSinsArchetypes.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {profile.sevenSinsArchetypes.length > 0 && !aiInterpretations['sins']?.content && patientId && (
                <button
                  onClick={(e) => { e.stopPropagation(); generateInterpretation('sins', profile.sevenSinsArchetypes); }}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600"
                  title="Generar interpretación AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              {expandedSections['sins'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedSections['sins'] && (
            <div className="p-3">
              {profile.sevenSinsArchetypes.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No hay arquetipos extremos detectados.</div>
              ) : (
                <div className="grid gap-2">
                  {profile.sevenSinsArchetypes.map((s, i) => (
                    <div key={i} className="p-2 bg-white border border-gray-100 rounded">
                      <div className="font-medium text-sm">{s.archetype}</div>
                      <div className="text-xs text-gray-500">Evidencias: {s.evidence.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
              {renderInterpretation('sins')}
            </div>
          )}
        </section>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Disclaimer:</strong> Lectura simbólica y orientativa basada en arquetipos junguianos. 
            No constituye diagnóstico clínico ni sustituye la evaluación profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
