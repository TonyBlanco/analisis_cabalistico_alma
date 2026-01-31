'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  BookOpen,
  Sparkles,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  AlertCircle,
  Download,
  Loader2,
  RefreshCw,
  Brain,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  listGematriaReadings,
  saveGematriaReading,
  deleteGematriaReading,
  listGematriaSyntheses,
  generateGematriaSynthesis,
  exportSynthesisToHolistic,
  deleteGematriaSynthesis,
  getPatternAnalysis,
  type GematriaReadingListItem,
  type GematriaSynthesis,
  type PatternAnalysis,
} from '@/lib/gematria-readings-api';

// ============================================================================
// Types
// ============================================================================

interface GematriaReadingsPanelProps {
  patientId: number;
  patientName: string;
  currentReading?: {
    method: string;
    methodDisplay: string;
    inputName: string;
    inputBirthDate?: string;
    hebrewTransliteration?: string;
    calculatedNumbers: Record<string, any>;
    calculationDetails?: Record<string, any>;
    sefirotCorrespondence?: Record<string, any>;
    numberInterpretations?: Record<string, any>;
    methodInterpretation?: string;
  } | null;
  onSaveSuccess?: () => void;
}

// ============================================================================
// Sub-components
// ============================================================================

function ReadingCard({
  reading,
  onDelete,
  isDeleting,
}: {
  reading: GematriaReadingListItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  const nums = reading.calculated_numbers || {};
  const dateStr = new Date(reading.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-indigo-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              {reading.method_display}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              reading.status === 'synthesized' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {reading.status === 'synthesized' ? 'Sintetizado' : 'Guardado'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">{reading.input_name}</p>
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(reading.id)}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* Numbers preview */}
      <div className="flex gap-3 mt-2">
        {nums.esencia && (
          <div className="text-center">
            <span className="text-[10px] text-rose-600 block">E</span>
            <span className="text-sm font-bold text-rose-700">{nums.esencia.reducido}</span>
          </div>
        )}
        {nums.expresion && (
          <div className="text-center">
            <span className="text-[10px] text-sky-600 block">X</span>
            <span className="text-sm font-bold text-sky-700">{nums.expresion.reducido}</span>
          </div>
        )}
        {nums.herencia && (
          <div className="text-center">
            <span className="text-[10px] text-amber-600 block">H</span>
            <span className="text-sm font-bold text-amber-700">{nums.herencia.reducido}</span>
          </div>
        )}
        {nums.caminoVida && (
          <div className="text-center">
            <span className="text-[10px] text-emerald-600 block">CV</span>
            <span className="text-sm font-bold text-emerald-700">{nums.caminoVida.reducido}</span>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <p><strong>Resumen:</strong> {reading.summary}</p>
        </div>
      )}
    </div>
  );
}

function SynthesisCard({
  synthesis,
  onExport,
  onDelete,
  isExporting,
  isDeleting,
}: {
  synthesis: GematriaSynthesis;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
  isExporting: boolean;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(synthesis.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-gray-900">{synthesis.title}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {synthesis.readings_count} lecturas • {dateStr}
          </p>
          {synthesis.methods_covered.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {synthesis.methods_covered.map((m) => (
                <span key={m} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {synthesis.exported_to_holistic ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Check className="h-3 w-3" />
              Exportado
            </span>
          ) : (
            <button
              onClick={() => onExport(synthesis.id)}
              disabled={isExporting}
              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              Exportar
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-purple-600"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(synthesis.id)}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
            title="Eliminar síntesis"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* AI Narrative */}
          {synthesis.ai_narrative && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-1">📝 Síntesis Narrativa</p>
              <p className="text-sm text-gray-700">{synthesis.ai_narrative}</p>
            </div>
          )}
          
          {/* Dominant Numbers */}
          {synthesis.dominant_numbers.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-2">🔢 Números Dominantes</p>
              <div className="flex flex-wrap gap-2">
                {synthesis.dominant_numbers.map((d, i) => (
                  <div key={i} className="bg-indigo-50 rounded px-2 py-1 text-center">
                    <span className="text-lg font-bold text-indigo-700">{d.number}</span>
                    <span className="text-[10px] text-gray-500 block">{d.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Archetypal Patterns */}
          {synthesis.archetypal_patterns.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-2">🎭 Patrones Arquetípicos</p>
              <div className="flex flex-wrap gap-1">
                {synthesis.archetypal_patterns.map((a, i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {a.archetype} ({a.count}x)
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Light & Shadow */}
          <div className="grid grid-cols-2 gap-2">
            {synthesis.light_themes.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-1">☀️ Luz</p>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {synthesis.light_themes.slice(0, 3).map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            )}
            {synthesis.shadow_themes.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">🌙 Sombra</p>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {synthesis.shadow_themes.slice(0, 3).map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Tikun Suggestions */}
          {synthesis.tikun_suggestions.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-1">✨ Sugerencias de Tikún</p>
              <ul className="text-xs text-gray-700 space-y-0.5">
                {synthesis.tikun_suggestions.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Cross-SWM */}
          {synthesis.cross_swm_sources.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">🔗 Integración Cross-SWM</p>
              <div className="flex flex-wrap gap-1">
                {synthesis.cross_swm_sources.map((s, i) => (
                  <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    {s.swm.toUpperCase()}
                  </span>
                ))}
              </div>
              {synthesis.ai_synthesis.cross_swm_insights && (
                <p className="text-xs text-gray-600 mt-2">{synthesis.ai_synthesis.cross_swm_insights}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function GematriaReadingsPanel({
  patientId,
  patientName,
  currentReading,
  onSaveSuccess,
}: GematriaReadingsPanelProps) {
  const [readings, setReadings] = useState<GematriaReadingListItem[]>([]);
  const [syntheses, setSyntheses] = useState<GematriaSynthesis[]>([]);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'readings' | 'synthesis'>('readings');
  const [therapistNotes, setTherapistNotes] = useState('');
  
  // Load data
  const loadData = useCallback(async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [readingsRes, synthesesRes, analysisRes] = await Promise.all([
        listGematriaReadings(patientId),
        listGematriaSyntheses(patientId),
        getPatternAnalysis(patientId),
      ]);
      
      setReadings(readingsRes.readings);
      setSyntheses(synthesesRes.syntheses);
      setPatternAnalysis(analysisRes);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [patientId]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Save current reading
  const handleSaveReading = async () => {
    if (!currentReading || !patientId) {
      setError('No hay lectura actual para guardar');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        patient_id: patientId,
        method: currentReading.method,
        input_name: currentReading.inputName,
        input_birth_date: currentReading.inputBirthDate || null,
        hebrew_transliteration: currentReading.hebrewTransliteration || '',
        calculated_numbers: currentReading.calculatedNumbers || {},
        calculation_details: currentReading.calculationDetails || {},
        sefirotic_correspondence: currentReading.sefirotCorrespondence || {},
        number_interpretations: currentReading.numberInterpretations || {},
        method_interpretation: currentReading.methodInterpretation || '',
        therapist_notes: therapistNotes,
      };
      console.log('[GematriaReadingsPanel] Saving reading with payload:', payload);
      await saveGematriaReading(payload);
      
      setSuccessMessage('Lectura guardada exitosamente');
      setTherapistNotes('');
      await loadData();
      onSaveSuccess?.();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error guardando lectura');
    } finally {
      setSaving(false);
    }
  };
  
  // Delete reading
  const handleDeleteReading = async (readingId: string) => {
    if (!confirm('¿Eliminar esta lectura?')) return;
    
    try {
      setDeleting(readingId);
      await deleteGematriaReading(readingId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error eliminando lectura');
    } finally {
      setDeleting(null);
    }
  };
  
  // Generate synthesis
  const handleGenerateSynthesis = async () => {
    if (readings.length === 0) {
      setError('No hay lecturas para sintetizar');
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      
      await generateGematriaSynthesis({
        patient_id: patientId,
        include_cross_swm: true,
        title: `Síntesis Gematrica - ${patientName}`,
      });
      
      setSuccessMessage('¡Síntesis generada exitosamente!');
      setActiveTab('synthesis');
      await loadData();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error generando síntesis');
    } finally {
      setGenerating(false);
    }
  };
  
  // Export to holistic
  const handleExport = async (synthesisId: string) => {
    try {
      setExporting(synthesisId);
      setError(null);
      
      const result = await exportSynthesisToHolistic(synthesisId);
      
      if (result.success) {
        setSuccessMessage(`${result.message}${result.destination ? ` → ${result.destination}` : ''}`);
        await loadData();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al exportar la síntesis');
    } finally {
      setExporting(null);
    }
  };
  
  // Delete synthesis
  const handleDeleteSynthesis = async (synthesisId: string) => {
    if (!confirm('¿Eliminar esta síntesis? Esta acción no se puede deshacer.')) return;
    
    try {
      setDeleting(synthesisId);
      setError(null);
      
      const result = await deleteGematriaSynthesis(synthesisId);
      
      if (result.success) {
        setSuccessMessage(result.message);
        await loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Error eliminando síntesis');
    } finally {
      setDeleting(null);
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-semibold">Lecturas Gematricas</h3>
            <div className="group relative">
              <Info className="h-4 w-4 text-white/70 hover:text-white cursor-help transition-colors" />
              <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
                <p className="font-medium mb-1">Espacio Observacional de Gematría</p>
                <p>• Guarda lecturas numéricas calculadas</p>
                <p>• Genera síntesis de patrones recurrentes</p>
                <p>• NO hace interpretaciones automáticas</p>
                <p>• Permite notas del terapeuta para contexto</p>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-white/70 mt-1">{patientName}</p>
      </div>
      
      {/* Save Current Reading */}
      {currentReading && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900">
                Guardar lectura actual: <span className="text-indigo-600">{currentReading.methodDisplay}</span>
              </p>
              <textarea
                value={therapistNotes}
                onChange={(e) => setTherapistNotes(e.target.value)}
                placeholder="Notas del terapeuta (opcional)..."
                className="mt-2 w-full text-xs border border-indigo-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <button
              onClick={handleSaveReading}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}
      
      {/* Messages */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('readings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'readings'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Layers className="h-4 w-4" />
            Lecturas ({readings.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('synthesis')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'synthesis'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Brain className="h-4 w-4" />
            Síntesis ({syntheses.length})
          </span>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
          </div>
        ) : activeTab === 'readings' ? (
          <div className="space-y-4">
            {/* Pattern Analysis Preview */}
            {patternAnalysis?.has_data && patternAnalysis.pattern_analysis && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200 mb-4">
                <p className="text-xs font-semibold text-amber-700 mb-2">📊 Análisis de Patrones</p>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Lecturas:</span>
                    <span className="ml-1 font-bold text-amber-700">{patternAnalysis.pattern_analysis.total_readings}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Métodos:</span>
                    <span className="ml-1 font-bold text-amber-700">{patternAnalysis.pattern_analysis.methods_analyzed.length}</span>
                  </div>
                  {patternAnalysis.cross_swm_available && patternAnalysis.cross_swm_available > 0 && (
                    <div>
                      <span className="text-gray-500">Cross-SWM:</span>
                      <span className="ml-1 font-bold text-blue-700">{patternAnalysis.cross_swm_available}</span>
                    </div>
                  )}
                </div>
                
                {/* Generate Synthesis Button */}
                {readings.length >= 1 && (
                  <button
                    onClick={handleGenerateSynthesis}
                    disabled={generating}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all text-sm font-medium"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generando síntesis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generar Síntesis con AI
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* Readings List */}
            {readings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay lecturas guardadas</p>
                <p className="text-xs mt-1">Guarda lecturas para generar síntesis</p>
              </div>
            ) : (
              <div className="space-y-2">
                {readings.map((reading) => (
                  <ReadingCard
                    key={reading.id}
                    reading={reading}
                    onDelete={handleDeleteReading}
                    isDeleting={deleting === reading.id}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {syntheses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay síntesis generadas</p>
                <p className="text-xs mt-1">Guarda lecturas y genera una síntesis con AI</p>
              </div>
            ) : (
              <div className="space-y-4">
                {syntheses.map((synthesis) => (
                  <SynthesisCard
                    key={synthesis.id}
                    synthesis={synthesis}
                    onExport={handleExport}
                    onDelete={handleDeleteSynthesis}
                    isExporting={exporting === synthesis.id}
                    isDeleting={deleting === synthesis.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500">
        Las síntesis son herramientas simbólicas de acompañamiento. No constituyen diagnóstico.
      </div>
    </div>
  );
}
