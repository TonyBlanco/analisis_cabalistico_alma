/**
 * LaboratorioNombresPanel.tsx - INNOVACIÓN 4: Laboratorio de Nombres
 * 
 * Analizador profundo de nombres (propio, padres, hijos, pareja) que cruza:
 * - Gematría de cada nombre
 * - Letras compartidas
 * - Valores numéricos relacionados
 * - Arquetipos asociados
 * 
 * Valor terapéutico: Explora vínculos desde lo simbólico,
 * detecta "resonancias" entre personas importantes.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Users, 
  Hash, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  Info,
  Heart,
  Link2,
  BookOpen
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ==============================================================================
// TYPES
// ==============================================================================

interface FamilyMember {
  id: string;
  name: string;
  relation: 'self' | 'mother' | 'father' | 'spouse' | 'child' | 'sibling' | 'grandparent' | 'other';
  hebrewName?: string;
}

interface GematriaValue {
  standard: number;
  reduced: number;
  ordinal: number;
}

interface NameAnalysis {
  name: string;
  hebrew_transliteration: string;
  gematria: GematriaValue;
  letters: string[];
  archetype: string;
  sefira_resonance: string;
  numerical_meaning: string;
}

interface SharedLetterConnection {
  letter: string;
  hebrew_letter: string;
  meaning: string;
  shared_by: string[];
}

interface NumericalResonance {
  value: number;
  names_involved: string[];
  interpretation: string;
  combined_meaning: string;
}

interface GenerativeQuestion {
  question: string;
  context: string;
  names_involved: string[];
}

interface LaboratorioResult {
  individual_analyses: NameAnalysis[];
  shared_letters: SharedLetterConnection[];
  numerical_resonances: NumericalResonance[];
  family_patterns: string[];
  generative_questions: GenerativeQuestion[];
  synthesis: string;
}

interface LaboratorioNombresPanelProps {
  consultantName?: string;
  birthDate?: string;
  onAnalysisComplete?: (result: LaboratorioResult) => void;
}

// ==============================================================================
// CONSTANTS
// ==============================================================================

const RELATION_LABELS: Record<FamilyMember['relation'], string> = {
  self: '👤 Yo (Consultante)',
  mother: '👩 Madre',
  father: '👨 Padre',
  spouse: '💑 Pareja',
  child: '👶 Hijo/a',
  sibling: '👫 Hermano/a',
  grandparent: '👴 Abuelo/a',
  other: '👥 Otro'
};

const RELATION_ICONS: Record<FamilyMember['relation'], string> = {
  self: '👤',
  mother: '👩',
  father: '👨',
  spouse: '💑',
  child: '👶',
  sibling: '👫',
  grandparent: '👴',
  other: '👥'
};

// ==============================================================================
// COMPONENT
// ==============================================================================

export default function LaboratorioNombresPanel({
  consultantName = '',
  birthDate,
  onAnalysisComplete
}: LaboratorioNombresPanelProps) {
  // State
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', name: consultantName, relation: 'self' }
  ]);
  const [result, setResult] = useState<LaboratorioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    individuals: true,
    shared: false,
    resonances: false,
    questions: false
  });

  // Handlers
  const addMember = useCallback(() => {
    const newId = String(Date.now());
    setMembers(prev => [...prev, { id: newId, name: '', relation: 'other' }]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMember = useCallback((id: string, field: keyof FamilyMember, value: string) => {
    setMembers(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const runAnalysis = useCallback(async () => {
    const validMembers = members.filter(m => m.name.trim());
    
    if (validMembers.length < 2) {
      setError('Se necesitan al menos 2 nombres para analizar relaciones');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cabala/laboratorio-nombres/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: JSON.stringify({
          members: validMembers.map(m => ({
            name: m.name.trim(),
            relation: m.relation,
            hebrew_name: m.hebrewName?.trim() || null
          })),
          birth_date: birthDate
        })
      });

      if (!response.ok) {
        throw new Error('Error al analizar nombres');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setResult(data.analysis);
        onAnalysisComplete?.(data.analysis);
        // Expandir todas las secciones al recibir resultados
        setExpandedSections({
          individuals: true,
          shared: true,
          resonances: true,
          questions: true
        });
      } else {
        throw new Error(data.error || 'Error en el análisis');
      }
    } catch (err) {
      console.error('[LaboratorioNombres] Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [members, birthDate, onAnalysisComplete]);

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Laboratorio de Nombres</h2>
              <p className="text-indigo-100 text-sm">Gematría relacional familiar</p>
            </div>
          </div>
          <div className="group relative">
            <Info className="h-5 w-5 text-white/70 cursor-help" />
            <div className="absolute right-0 top-8 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Análisis Simbólico de Nombres</p>
              <p>• Gematría individual y compartida</p>
              <p>• Letras en común entre nombres</p>
              <p>• Resonancias numéricas familiares</p>
              <p className="mt-2 text-gray-300 italic">
                Los nombres son puertas al alma. Este análisis revela conexiones ocultas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 space-y-4">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            El análisis de nombres es simbólico y exploratorio. Las conexiones reveladas 
            son puntos de reflexión terapéutica, no determinaciones.
          </p>
        </div>

        {/* Family Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Nombres a Analizar</h3>
            <button
              onClick={addMember}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar Nombre
            </button>
          </div>

          {members.map((member, idx) => (
            <div 
              key={member.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
            >
              <span className="text-xl">{RELATION_ICONS[member.relation]}</span>
              
              <select
                value={member.relation}
                onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(RELATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                placeholder="Nombre completo"
                className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="text"
                value={member.hebrewName || ''}
                onChange={(e) => updateMember(member.id, 'hebrewName', e.target.value)}
                placeholder="Hebreo (opcional)"
                className="w-32 text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
              />

              {idx > 0 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Analyze Button */}
        <button
          onClick={runAnalysis}
          disabled={loading || members.filter(m => m.name.trim()).length < 2}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analizando conexiones...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Analizar Conexiones Familiares
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="border-t border-gray-200 bg-white">
          {/* Individual Analyses */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('individuals')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">Análisis Individual</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {result.individual_analyses.length} nombres
                </span>
              </div>
              {expandedSections.individuals ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            
            {expandedSections.individuals && (
              <div className="px-6 pb-4 grid gap-3">
                {result.individual_analyses.map((analysis, idx) => (
                  <div 
                    key={idx}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{analysis.name}</h4>
                        <p className="text-sm text-indigo-600">{analysis.hebrew_transliteration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-700">{analysis.gematria.standard}</div>
                        <div className="text-xs text-gray-500">
                          Red: {analysis.gematria.reduced} | Ord: {analysis.gematria.ordinal}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Arquetipo:</span>
                        <p className="font-medium text-gray-900">{analysis.archetype}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Sefirá:</span>
                        <p className="font-medium text-gray-900">{analysis.sefira_resonance}</p>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-700 italic">{analysis.numerical_meaning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared Letters */}
          {result.shared_letters.length > 0 && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('shared')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Letras Compartidas</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {result.shared_letters.length} conexiones
                  </span>
                </div>
                {expandedSections.shared ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {expandedSections.shared && (
                <div className="px-6 pb-4 space-y-3">
                  {result.shared_letters.map((conn, idx) => (
                    <div 
                      key={idx}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-700">{conn.hebrew_letter}</span>
                        <span className="text-lg text-gray-600">({conn.letter})</span>
                        <div className="flex-1" />
                        <div className="flex gap-1">
                          {conn.shared_by.map((name, i) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{conn.meaning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Numerical Resonances */}
          {result.numerical_resonances.length > 0 && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('resonances')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="font-semibold text-gray-900">Resonancias Numéricas</span>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    {result.numerical_resonances.length}
                  </span>
                </div>
                {expandedSections.resonances ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {expandedSections.resonances && (
                <div className="px-6 pb-4 space-y-3">
                  {result.numerical_resonances.map((res, idx) => (
                    <div 
                      key={idx}
                      className="bg-pink-50 border border-pink-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-pink-700">{res.value}</span>
                        <div className="flex gap-1 flex-wrap">
                          {res.names_involved.map((name, i) => (
                            <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{res.interpretation}</p>
                      <p className="text-sm text-gray-600 mt-1">{res.combined_meaning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generative Questions */}
          {result.generative_questions.length > 0 && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('questions')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-gray-900">Preguntas Generativas</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {result.generative_questions.length}
                  </span>
                </div>
                {expandedSections.questions ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {expandedSections.questions && (
                <div className="px-6 pb-4 space-y-3">
                  {result.generative_questions.map((q, idx) => (
                    <div 
                      key={idx}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <p className="text-lg font-medium text-amber-900 mb-2">❓ {q.question}</p>
                      <p className="text-sm text-gray-600">{q.context}</p>
                      <div className="mt-2 flex gap-1">
                        {q.names_involved.map((name, i) => (
                          <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Synthesis */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h4 className="font-semibold text-gray-900 mb-2">✨ Síntesis</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{result.synthesis}</p>
          </div>
        </div>
      )}
    </div>
  );
}
