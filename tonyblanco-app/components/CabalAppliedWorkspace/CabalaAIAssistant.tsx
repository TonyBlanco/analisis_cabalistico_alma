'use client';

/**
 * CabalaAIAssistant.tsx
 * 
 * P3 - IA ASISTIDA: Ethical AI assistance for Kabbalistic analysis.
 * 
 * IMPORTANT ETHICAL CONSTRAINTS:
 * - NO personal interpretation of consultante's soul
 * - NO diagnosis or clinical advice
 * - NO predictions or divination
 * - ALL outputs are DRAFTS requiring therapist review
 * - AI is ASSISTIVE only - therapist has full sovereignty
 * 
 * Features:
 * - P3.1: Text Exploration (concept extraction, reading suggestions)
 * - P3.2: Synthesis Assistance (note summarization, reflection questions)
 * - P3.3: Meditation Generation (draft scripts for therapist review)
 * 
 * @author Sistema Holístico
 * @date 2026-01-31
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  Book,
  FileText,
  HelpCircle,
  Sunrise,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Info,
  Shield,
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

type AIFeature = 'extract-concepts' | 'suggest-readings' | 'summarize-notes' | 'reflection-questions' | 'generate-meditation';

interface AIResponse {
  data?: Record<string, unknown>;
  disclaimer?: string;
  requires_review?: boolean;
  error?: string;
  violations?: string[];
}

interface CabalaAIAssistantProps {
  consultanteId?: number | string;
  selectedSefira?: string;
  workspaceNotes?: string[];
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEFIROT = [
  'Keter', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
  'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
];

const MEDITATION_STYLES = [
  { value: 'guided', label: 'Guiada', description: 'Con instrucciones paso a paso' },
  { value: 'visualization', label: 'Visualización', description: 'Con imágenes y símbolos' },
  { value: 'contemplative', label: 'Contemplativa', description: 'Silencio y presencia' },
];

// ============================================================================
// API HELPERS
// ============================================================================

async function callCabalaAI(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>
): Promise<AIResponse> {
  const token = getAuthToken();
  if (!token) {
    return { error: 'No autenticado. Por favor, inicia sesión.' };
  }

  const url = `${API_BASE_URL}/cabala-ai/${endpoint}`;
  console.log('[CabalaAI] Calling:', url, 'with token:', token.substring(0, 8) + '...');

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();
    console.log('[CabalaAI] Response:', response.status, responseData);

    if (!response.ok) {
      return { error: responseData.error || responseData.detail || 'Error del servidor' };
    }

    // Wrap the response data in the expected format
    // The backend returns fields directly (meditation_text, suggestions, etc.)
    // We need to wrap them in 'data' for renderAIData to work
    return {
      data: responseData,
      disclaimer: responseData.disclaimer,
      requires_review: responseData.requires_review || responseData.requires_therapist_review,
    };
  } catch (err) {
    console.error('[CabalaAI] Request failed:', err);
    return { error: 'Error de conexión. Verifica que el servidor esté activo.' };
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EthicalDisclaimer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
            Gobernanza Ética IA
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>
      
      {expanded && (
        <div className="mt-3 text-sm text-amber-700 dark:text-amber-300 space-y-2">
          <p>• La IA es únicamente <strong>asistiva</strong> - no interpreta almas ni diagnostica.</p>
          <p>• Todas las salidas son <strong>borradores</strong> que requieren revisión del terapeuta.</p>
          <p>• El terapeuta tiene <strong>soberanía total</strong> sobre el contenido final.</p>
          <p>• La Cábala es un <strong>mapa simbólico</strong>, no una verdad absoluta.</p>
          <p>• No se hacen predicciones, lecturas de vidas pasadas, ni determinaciones de karma.</p>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full p-4 rounded-lg border text-left transition-all
        ${disabled 
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
          : 'bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-lg 
          ${disabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-purple-100 dark:bg-purple-900/50'}
        `}>
          {loading ? (
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          ) : (
            <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-purple-600'}`} />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function ResponseDisplay({
  response,
  onCopy,
}: {
  response: AIResponse;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (response.error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{response.error}</p>
            {response.violations && response.violations.length > 0 && (
              <ul className="text-sm text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
                {response.violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      {response.requires_review && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-200 dark:border-purple-700">
          <Info className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            Borrador - Requiere revisión del terapeuta
          </span>
          <button
            onClick={handleCopy}
            className="ml-auto p-1.5 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            title="Copiar contenido"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none">
        {response.data && renderAIData(response.data)}
      </div>

      {response.disclaimer && (
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-4 pt-3 border-t border-purple-200 dark:border-purple-700 italic">
          {response.disclaimer}
        </p>
      )}
    </div>
  );
}

function renderAIData(data: Record<string, unknown>): React.ReactNode {
  // Debug: log what data we're rendering
  console.log('[CabalaAI] renderAIData received:', Object.keys(data), data);
  
  // Handle different response types
  
  // Concepts extraction
  if ('concepts' in data && Array.isArray(data.concepts)) {
    return (
      <div>
        <h5 className="font-medium mb-2">Conceptos Identificados:</h5>
        <ul className="space-y-1">
          {data.concepts.map((concept: unknown, i: number) => (
            <li key={i} className="text-sm">• {String(concept)}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Reading suggestions (structured array)
  if ('readings' in data && Array.isArray(data.readings)) {
    return (
      <div>
        <h5 className="font-medium mb-2">Lecturas Sugeridas:</h5>
        <ul className="space-y-2">
          {data.readings.map((reading: unknown, i: number) => {
            if (typeof reading === 'object' && reading !== null) {
              const r = reading as Record<string, unknown>;
              const author = r.author ? String(r.author) : null;
              const desc = r.description ? String(r.description) : null;
              return (
                <li key={i} className="text-sm">
                  <strong>{String(r.title || '')}</strong>
                  {author && <span className="text-gray-500"> - {author}</span>}
                  {desc && <p className="text-xs text-gray-600 mt-0.5">{desc}</p>}
                </li>
              );
            }
            return <li key={i} className="text-sm">• {String(reading)}</li>;
          })}
        </ul>
      </div>
    );
  }

  // Reading suggestions (free text format from AI)
  if ('suggestions' in data) {
    const topic = 'topic' in data ? String(data.topic) : null;
    const sefira = 'sefira' in data ? String(data.sefira) : null;
    return (
      <div>
        <h5 className="font-medium mb-2">Lecturas Sugeridas:</h5>
        {topic && (
          <p className="text-xs text-gray-500 mb-2">
            Tema: <strong>{topic}</strong>
            {sefira && <span> • Sefirá: <strong>{sefira}</strong></span>}
          </p>
        )}
        <div className="text-sm whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-3 rounded border border-purple-200 dark:border-purple-700">
          {String(data.suggestions)}
        </div>
      </div>
    );
  }

  // Notes summary
  if ('summary' in data) {
    const hasKeyThemes = data.key_themes && Array.isArray(data.key_themes);
    return (
      <div>
        <h5 className="font-medium mb-2">Resumen de Notas:</h5>
        <p className="text-sm whitespace-pre-wrap">{String(data.summary)}</p>
        {hasKeyThemes ? (
          <div className="mt-3">
            <h6 className="font-medium text-xs mb-1">Temas Clave:</h6>
            <div className="flex flex-wrap gap-1">
              {(data.key_themes as unknown[]).map((theme: unknown, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">
                  {String(theme)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // Reflection questions
  if ('questions' in data && Array.isArray(data.questions)) {
    return (
      <div>
        <h5 className="font-medium mb-2">Preguntas de Reflexión:</h5>
        <ol className="space-y-2 list-decimal list-inside">
          {data.questions.map((q: unknown, i: number) => (
            <li key={i} className="text-sm">{String(q)}</li>
          ))}
        </ol>
      </div>
    );
  }

  // Meditation script (direct format from backend)
  if ('meditation_text' in data) {
    const sefira = 'sefira' in data ? String(data.sefira) : null;
    const duration = 'duration_minutes' in data ? String(data.duration_minutes) : null;
    const style = 'style' in data ? String(data.style) : null;
    const instructions = 'therapist_instructions' in data ? String(data.therapist_instructions) : null;
    return (
      <div>
        <h5 className="font-medium mb-2">Borrador de Meditación:</h5>
        {sefira && (
          <p className="text-xs text-gray-500 mb-1">
            Sefirá: <strong>{sefira}</strong>
            {duration && <span> • Duración: {duration} min</span>}
            {style && <span> • Estilo: {style}</span>}
          </p>
        )}
        {instructions && (
          <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded mb-3 text-yellow-800 dark:text-yellow-200">
            📝 {instructions}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-3 rounded border border-purple-200 dark:border-purple-700">
          {String(data.meditation_text)}
        </div>
      </div>
    );
  }

  // Meditation script (nested object format)
  if ('meditation' in data) {
    const med = data.meditation as Record<string, unknown>;
    const medTitle = med.title ? String(med.title) : null;
    const medDuration = med.duration_minutes ? String(med.duration_minutes) : null;
    const medClosing = med.closing ? String(med.closing) : null;
    return (
      <div>
        <h5 className="font-medium mb-2">Borrador de Meditación:</h5>
        {medTitle ? <p className="text-lg font-semibold mb-2">{medTitle}</p> : null}
        {medDuration ? (
          <p className="text-xs text-gray-500 mb-3">Duración aprox: {medDuration} minutos</p>
        ) : null}
        <div className="text-sm whitespace-pre-wrap">{String(med.script || med.content || '')}</div>
        {medClosing ? (
          <p className="text-sm italic mt-3 pt-3 border-t border-purple-200">{medClosing}</p>
        ) : null}
      </div>
    );
  }

  // Sefira attributes
  if ('sefira' in data && 'attributes' in data) {
    const attrs = data.attributes as Record<string, unknown>;
    return (
      <div>
        <h5 className="font-medium mb-2">Atributos de {String(data.sefira)}:</h5>
        <dl className="space-y-2 text-sm">
          {Object.entries(attrs).map(([key, value]) => (
            <div key={key}>
              <dt className="font-medium text-purple-700 dark:text-purple-300 capitalize">
                {key.replace(/_/g, ' ')}:
              </dt>
              <dd className="ml-4 text-gray-600 dark:text-gray-400">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  // Generic fallback
  return (
    <pre className="text-xs overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CabalaAIAssistant({
  consultanteId,
  selectedSefira,
  workspaceNotes = [],
  className = '',
}: CabalaAIAssistantProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  
  // Form states
  const [textInput, setTextInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [sefiraInput, setSefiraInput] = useState(selectedSefira || 'Tiferet');
  const [questionCount, setQuestionCount] = useState(5);
  const [meditationDuration, setMeditationDuration] = useState(10);
  const [meditationStyle, setMeditationStyle] = useState<'guided' | 'visualization' | 'contemplative'>('guided');

  // Update sefira when prop changes
  React.useEffect(() => {
    if (selectedSefira) {
      setSefiraInput(selectedSefira);
    }
  }, [selectedSefira]);

  const resetState = useCallback(() => {
    setActiveFeature(null);
    setResponse(null);
    setTextInput('');
    setTopicInput('');
  }, []);

  // ====================== P3.1: Text Exploration ======================
  
  const handleExtractConcepts = async () => {
    if (!textInput.trim()) return;
    
    setLoading(true);
    setResponse(null);
    
    const result = await callCabalaAI('extract-concepts/', 'POST', {
      text: textInput,
      consultante_id: consultanteId,
    });
    
    setResponse(result);
    setLoading(false);
  };

  const handleSuggestReadings = async () => {
    if (!topicInput.trim()) return;
    
    setLoading(true);
    setResponse(null);
    
    const result = await callCabalaAI('suggest-readings/', 'POST', {
      topic: topicInput,
      sefira: sefiraInput,
    });
    
    setResponse(result);
    setLoading(false);
  };

  // ====================== P3.2: Synthesis Assistance ======================

  const handleSummarizeNotes = async () => {
    if (workspaceNotes.length === 0) {
      setResponse({ error: 'No hay notas en el workspace para resumir' });
      return;
    }
    
    setLoading(true);
    setResponse(null);
    
    const result = await callCabalaAI('summarize-notes/', 'POST', {
      notes: workspaceNotes,
      consultante_id: consultanteId,
    });
    
    setResponse(result);
    setLoading(false);
  };

  const handleReflectionQuestions = async () => {
    setLoading(true);
    setResponse(null);
    
    const result = await callCabalaAI('reflection-questions/', 'POST', {
      sefira: sefiraInput,
      count: questionCount,
      context: textInput || undefined,
    });
    
    setResponse(result);
    setLoading(false);
  };

  // ====================== P3.3: Meditation Generation ======================

  const handleGenerateMeditation = async () => {
    setLoading(true);
    setResponse(null);
    
    const result = await callCabalaAI('generate-meditation/', 'POST', {
      sefira: sefiraInput,
      duration_minutes: meditationDuration,
      style: meditationStyle,
    });
    
    setResponse(result);
    setLoading(false);
  };

  const handleCopyResponse = useCallback(() => {
    if (!response?.data) return;
    
    const text = JSON.stringify(response.data, null, 2);
    navigator.clipboard.writeText(text);
  }, [response]);

  // ====================== RENDER ======================

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
          Asistente IA - Cábala Aplicada
        </h3>
        {activeFeature && (
          <button
            onClick={resetState}
            className="ml-2 text-xs text-purple-600 hover:text-purple-800 underline"
          >
            ← Menú IA
          </button>
        )}
        <span className="ml-auto text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
          P3 - IA Asistida
        </span>
      </div>

      <div className="p-4">
        <EthicalDisclaimer />

        {/* Feature Selection */}
        {!activeFeature && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* P3.1: Text Exploration */}
            <FeatureCard
              icon={Sparkles}
              title="Extraer Conceptos"
              description="Identifica conceptos cabalísticos en un texto"
              onClick={() => setActiveFeature('extract-concepts')}
              loading={loading}
            />
            <FeatureCard
              icon={Book}
              title="Sugerir Lecturas"
              description="Recomienda textos sobre un tema cabalístico"
              onClick={() => setActiveFeature('suggest-readings')}
              loading={loading}
            />
            
            {/* P3.2: Synthesis Assistance */}
            <FeatureCard
              icon={FileText}
              title="Resumir Notas"
              description="Sintetiza las notas del workspace"
              onClick={() => setActiveFeature('summarize-notes')}
              disabled={workspaceNotes.length === 0}
              loading={loading}
            />
            <FeatureCard
              icon={HelpCircle}
              title="Preguntas de Reflexión"
              description="Genera preguntas abiertas para una Sefirá"
              onClick={() => setActiveFeature('reflection-questions')}
              loading={loading}
            />
            
            {/* P3.3: Meditation Generation */}
            <FeatureCard
              icon={Sunrise}
              title="Meditación (Borrador)"
              description="Genera un guión de meditación para revisión"
              onClick={() => setActiveFeature('generate-meditation')}
              loading={loading}
            />
          </div>
        )}

        {/* Active Feature Forms */}
        {activeFeature && (
          <div className="space-y-4">
            <button
              onClick={resetState}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              ← Volver a opciones
            </button>

            {/* Extract Concepts Form */}
            {activeFeature === 'extract-concepts' && (
              <div className="space-y-3">
                <h4 className="font-medium">Extraer Conceptos Cabalísticos</h4>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Pega aquí el texto a analizar (máximo 5000 caracteres)..."
                  className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
                  maxLength={5000}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{textInput.length}/5000</span>
                  <button
                    onClick={handleExtractConcepts}
                    disabled={loading || !textInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Analizar
                  </button>
                </div>
              </div>
            )}

            {/* Suggest Readings Form */}
            {activeFeature === 'suggest-readings' && (
              <div className="space-y-3">
                <h4 className="font-medium">Sugerir Lecturas</h4>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Tema cabalístico (ej: 'El camino de Geburah a Chesed')"
                  className="w-full p-3 border rounded-lg text-sm"
                />
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Sefirá relacionada (opcional)</label>
                    <select
                      value={sefiraInput}
                      onChange={(e) => setSefiraInput(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      <option value="">Ninguna específica</option>
                      {SEFIROT.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSuggestReadings}
                    disabled={loading || !topicInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Sugerir
                  </button>
                </div>
              </div>
            )}

            {/* Summarize Notes */}
            {activeFeature === 'summarize-notes' && (
              <div className="space-y-3">
                <h4 className="font-medium">Resumir Notas del Workspace</h4>
                <p className="text-sm text-gray-600">
                  Se resumirán {workspaceNotes.length} notas del workspace actual.
                </p>
                <button
                  onClick={handleSummarizeNotes}
                  disabled={loading || workspaceNotes.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generar Resumen
                </button>
              </div>
            )}

            {/* Reflection Questions Form */}
            {activeFeature === 'reflection-questions' && (
              <div className="space-y-3">
                <h4 className="font-medium">Generar Preguntas de Reflexión</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Sefirá</label>
                    <select
                      value={sefiraInput}
                      onChange={(e) => setSefiraInput(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {SEFIROT.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Número de preguntas</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Contexto adicional (opcional)..."
                  className="w-full h-20 p-3 border rounded-lg resize-none text-sm"
                />
                <button
                  onClick={handleReflectionQuestions}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generar Preguntas
                </button>
              </div>
            )}

            {/* Meditation Generation Form */}
            {activeFeature === 'generate-meditation' && (
              <div className="space-y-3">
                <h4 className="font-medium">Generar Borrador de Meditación</h4>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                  <p className="text-amber-800 dark:text-amber-200">
                    <strong>⚠️ Borrador:</strong> Esta meditación es un punto de partida. 
                    El terapeuta debe revisarla y adaptarla antes de usarla con el consultante.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Sefirá</label>
                    <select
                      value={sefiraInput}
                      onChange={(e) => setSefiraInput(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {SEFIROT.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Duración (minutos)</label>
                    <input
                      type="number"
                      min={5}
                      max={30}
                      value={meditationDuration}
                      onChange={(e) => setMeditationDuration(parseInt(e.target.value) || 10)}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Estilo</label>
                    <select
                      value={meditationStyle}
                      onChange={(e) => setMeditationStyle(e.target.value as typeof meditationStyle)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {MEDITATION_STYLES.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateMeditation}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generar Borrador
                </button>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="mt-4">
                <ResponseDisplay response={response} onCopy={handleCopyResponse} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CabalaAIAssistant;
