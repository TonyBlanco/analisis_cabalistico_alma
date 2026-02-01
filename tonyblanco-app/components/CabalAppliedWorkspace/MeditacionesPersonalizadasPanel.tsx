/**
 * MeditacionesPersonalizadasPanel.tsx - INNOVACIÓN 5: Meditaciones Personalizadas
 * 
 * Generador de meditaciones guiadas adaptadas a:
 * - Sefirá del ciclo actual
 * - Sefirá deficiente (según tests)
 * - Sefirá objetivo (según proceso terapéutico)
 * 
 * Valor terapéutico: Tarea inter-sesión concreta,
 * texto para llevar a casa, refuerza trabajo terapéutico.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Sparkles,
  Heart,
  Moon,
  Sun,
  Download,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Loader2,
  Info,
  Clock,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ==============================================================================
// TYPES
// ==============================================================================

type SefiraName = 'keter' | 'chokmah' | 'binah' | 'chesed' | 'gevurah' | 'tiferet' | 'netzach' | 'hod' | 'yesod' | 'malkuth';

type MeditationType = 'equilibrio' | 'fortalecimiento' | 'sanacion' | 'integracion';

interface MeditationConfig {
  target_sefira: SefiraName;
  meditation_type: MeditationType;
  duration_minutes: number;
  include_breathing?: boolean;
  include_visualization?: boolean;
  personal_intention?: string;
}

interface MeditationContent {
  title: string;
  sefira: SefiraName;
  sefira_name?: string;
  duration_minutes: number;
  type: MeditationType;
  type_name?: string;
  // Static generator fields
  introduction?: string;
  breathing_exercise?: string;
  visualization?: string;
  affirmations?: string[];
  closing?: string;
  practice_tips?: string[];
  best_time?: string;
  frequency_recommendation?: string;
  // AI generator fields
  opening?: string;
  sefira_explanation?: string;
  activation?: string;
  divine_name_contemplation?: string;
  integration?: string;
  divine_name?: string;
  color?: string;
  generated_by_ai?: boolean;
}

interface MeditacionesPanelProps {
  consultantName?: string;
  consultanteUuid?: string;
  currentSefira?: SefiraName;
  deficientSefira?: SefiraName;
  onMeditationGenerated?: (meditation: MeditationContent) => void;
}

// ==============================================================================
// CONSTANTS
// ==============================================================================

const SEFIROT_INFO: Record<SefiraName, { 
  name: string; 
  color: string; 
  bgColor: string;
  borderColor: string;
  icon: string;
  quality: string;
  balancing_sefira: SefiraName;
}> = {
  keter: { 
    name: 'Kéter', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-white to-gray-100',
    borderColor: 'border-gray-300',
    icon: '👑', 
    quality: 'Voluntad divina, conexión espiritual',
    balancing_sefira: 'malkuth'
  },
  chokmah: { 
    name: 'Jojmá', 
    color: 'text-gray-800', 
    bgColor: 'bg-gradient-to-br from-gray-200 to-gray-300',
    borderColor: 'border-gray-400',
    icon: '💡', 
    quality: 'Sabiduría primordial, intuición',
    balancing_sefira: 'binah'
  },
  binah: { 
    name: 'Biná', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
    borderColor: 'border-gray-600',
    icon: '🌊', 
    quality: 'Entendimiento, receptividad',
    balancing_sefira: 'chokmah'
  },
  chesed: { 
    name: 'Jésed', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
    borderColor: 'border-blue-400',
    icon: '💙', 
    quality: 'Amor incondicional, expansión',
    balancing_sefira: 'gevurah'
  },
  gevurah: { 
    name: 'Gevurá', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
    borderColor: 'border-red-400',
    icon: '🔥', 
    quality: 'Límites sanos, fortaleza',
    balancing_sefira: 'chesed'
  },
  tiferet: { 
    name: 'Tiféret', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400',
    icon: '☀️', 
    quality: 'Belleza, armonía, equilibrio',
    balancing_sefira: 'yesod'
  },
  netzach: { 
    name: 'Nétzaj', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-700',
    borderColor: 'border-green-400',
    icon: '🌿', 
    quality: 'Victoria, perseverancia, emoción',
    balancing_sefira: 'hod'
  },
  hod: { 
    name: 'Hod', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-orange-500 to-orange-700',
    borderColor: 'border-orange-400',
    icon: '🧠', 
    quality: 'Gloria, pensamiento, comunicación',
    balancing_sefira: 'netzach'
  },
  yesod: { 
    name: 'Yesod', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700',
    borderColor: 'border-purple-400',
    icon: '🌙', 
    quality: 'Fundamento, conexión, sueños',
    balancing_sefira: 'tiferet'
  },
  malkuth: { 
    name: 'Maljut', 
    color: 'text-white', 
    bgColor: 'bg-gradient-to-br from-amber-700 to-amber-900',
    borderColor: 'border-amber-600',
    icon: '🌍', 
    quality: 'Reino, manifestación, cuerpo',
    balancing_sefira: 'keter'
  }
};

const MEDITATION_TYPES: Record<MeditationType, { label: string; description: string; icon: string }> = {
  equilibrio: { 
    label: 'Equilibrio', 
    description: 'Balancear excesos o deficiencias',
    icon: '⚖️'
  },
  fortalecimiento: { 
    label: 'Fortalecimiento', 
    description: 'Potenciar cualidades de la Sefirá',
    icon: '💪'
  },
  sanacion: { 
    label: 'Sanación', 
    description: 'Sanar bloqueos o heridas',
    icon: '💚'
  },
  integracion: { 
    label: 'Integración', 
    description: 'Integrar luz y sombra',
    icon: '🔄'
  }
};

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

// ==============================================================================
// COMPONENT
// ==============================================================================

export default function MeditacionesPersonalizadasPanel({
  consultantName = 'Consultante',
  consultanteUuid,
  currentSefira,
  deficientSefira,
  onMeditationGenerated
}: MeditacionesPanelProps) {
  // Configuration State
  const [selectedSefira, setSelectedSefira] = useState<SefiraName | null>(deficientSefira || currentSefira || null);
  const [meditationType, setMeditationType] = useState<MeditationType>('equilibrio');
  const [duration, setDuration] = useState(10);
  const [includeBreathing, setIncludeBreathing] = useState(true);
  const [includeVisualization, setIncludeVisualization] = useState(true);
  const [personalIntention, setPersonalIntention] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Result State
  const [meditation, setMeditation] = useState<MeditationContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToConsultant, setSavedToConsultant] = useState(false);

  // Handlers
  const generateMeditation = useCallback(async () => {
    if (!selectedSefira) {
      setError('Selecciona una Sefirá para la meditación');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedToConsultant(false);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cabala/meditaciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: JSON.stringify({
          target_sefira: selectedSefira,
          meditation_type: meditationType,
          duration_minutes: duration,
          include_breathing: includeBreathing,
          include_visualization: includeVisualization,
          personal_intention: personalIntention || null,
          consultant_name: consultantName,
          consultante_uuid: consultanteUuid,
          save_to_profile: saveToProfile && !!consultanteUuid
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar meditación');
      }

      const data = await response.json();
      
      if (data.success && data.meditation) {
        setMeditation(data.meditation);
        if (data.saved_document_id) {
          setSavedToConsultant(true);
        }
        onMeditationGenerated?.(data.meditation);
      } else {
        throw new Error(data.error || 'Error en la generación');
      }
    } catch (err) {
      console.error('[MeditacionesPanel] Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedSefira, meditationType, duration, includeBreathing, includeVisualization, personalIntention, consultantName, consultanteUuid, saveToProfile, onMeditationGenerated]);

  const copyMeditation = useCallback(() => {
    if (!meditation) return;

    // Formato para meditación generada por IA
    if (meditation.generated_by_ai) {
      const text = `
MEDITACIÓN: ${meditation.title}
Duración: ${meditation.duration_minutes} minutos
Sefirá: ${meditation.sefira_name || SEFIROT_INFO[meditation.sefira]?.name || meditation.sefira}
Tipo: ${meditation.type_name || meditation.type}
${meditation.divine_name ? `Nombre Divino: ${meditation.divine_name}` : ''}
${meditation.color ? `Color: ${meditation.color}` : ''}

═══════════════════════════════════

APERTURA Y ENRAIZAMIENTO
${meditation.opening || ''}

SOBRE LA SEFIRÁ
${meditation.sefira_explanation || ''}

${meditation.breathing_exercise ? `EJERCICIO DE RESPIRACIÓN\n${meditation.breathing_exercise}\n` : ''}
ACTIVACIÓN
${meditation.activation || ''}

CONTEMPLACIÓN DEL NOMBRE
${meditation.divine_name_contemplation || ''}

${meditation.visualization ? `VISUALIZACIÓN\n${meditation.visualization}\n` : ''}
INTEGRACIÓN
${meditation.integration || ''}

CIERRE
${meditation.closing || ''}

═══════════════════════════════════

CONSEJOS PARA LA PRÁCTICA
${(meditation.practice_tips || []).map(t => `• ${t}`).join('\n')}

${meditation.best_time ? `Mejor momento: ${meditation.best_time}` : ''}
      `.trim();

      navigator.clipboard.writeText(text);
    } else {
      // Formato para meditación estática (fallback)
      const text = `
MEDITACIÓN: ${meditation.title}
Duración: ${meditation.duration_minutes} minutos
Sefirá: ${SEFIROT_INFO[meditation.sefira]?.name || meditation.sefira}

═══════════════════════════════════

INTRODUCCIÓN
${meditation.introduction || ''}

${meditation.breathing_exercise ? `EJERCICIO DE RESPIRACIÓN\n${meditation.breathing_exercise}\n\n` : ''}
VISUALIZACIÓN
${meditation.visualization || ''}

AFIRMACIONES
${(meditation.affirmations || []).map(a => `• ${a}`).join('\n')}

CIERRE
${meditation.closing || ''}

═══════════════════════════════════

CONSEJOS PARA LA PRÁCTICA
${(meditation.practice_tips || []).map(t => `• ${t}`).join('\n')}

Mejor momento: ${meditation.best_time || 'En cualquier momento tranquilo'}
Frecuencia recomendada: ${meditation.frequency_recommendation || 'Según tu ritmo'}
      `.trim();

      navigator.clipboard.writeText(text);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [meditation]);

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl border border-purple-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Moon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Meditaciones Personalizadas</h2>
              <p className="text-purple-100 text-sm">Prácticas adaptadas a tu proceso</p>
            </div>
          </div>
          <div className="group relative">
            <Info className="h-5 w-5 text-white/70 cursor-help" />
            <div className="absolute right-0 top-8 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Meditaciones Sefiróticas</p>
              <p>• Adaptadas a tu ciclo actual</p>
              <p>• Enfocadas en Sefirot a fortalecer</p>
              <p>• Texto descargable para casa</p>
              <p className="mt-2 text-gray-300 italic">
                Tarea inter-sesión que refuerza el trabajo terapéutico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="p-6 space-y-6">
        {/* Sefira Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Selecciona la Sefirá para tu meditación
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(SEFIROT_INFO) as SefiraName[]).map((sefira) => {
              const info = SEFIROT_INFO[sefira];
              const isSelected = selectedSefira === sefira;
              const isCurrent = currentSefira === sefira;
              const isDeficient = deficientSefira === sefira;
              
              return (
                <button
                  key={sefira}
                  onClick={() => setSelectedSefira(sefira)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? `${info.bgColor} ${info.borderColor} ring-2 ring-offset-2 ring-purple-500` 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-center">
                    <span className="text-2xl">{info.icon}</span>
                    <p className={`text-xs font-medium mt-1 ${isSelected ? info.color : 'text-gray-700'}`}>
                      {info.name}
                    </p>
                  </div>
                  
                  {/* Indicators */}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white px-1 rounded">
                      Actual
                    </span>
                  )}
                  {isDeficient && (
                    <span className="absolute -top-1 -left-1 text-xs bg-amber-500 text-white px-1 rounded">
                      Fortalecer
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedSefira && (
            <p className="mt-2 text-sm text-gray-600 italic">
              {SEFIROT_INFO[selectedSefira].quality}
            </p>
          )}
        </div>

        {/* Meditation Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Tipo de Meditación
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(MEDITATION_TYPES) as [MeditationType, typeof MEDITATION_TYPES[MeditationType]][]).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setMeditationType(type)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${meditationType === type 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-medium text-gray-900">{info.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{info.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <Clock className="inline h-4 w-4 mr-1" />
            Duración
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`
                  px-4 py-2 rounded-lg border transition-all
                  ${duration === mins 
                    ? 'border-purple-500 bg-purple-100 text-purple-700 font-medium' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBreathing}
              onChange={(e) => setIncludeBreathing(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Incluir ejercicio de respiración</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVisualization}
              onChange={(e) => setIncludeVisualization(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Incluir visualización guiada</span>
          </label>
        </div>

        {/* Personal Intention */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Intención Personal (opcional)
          </label>
          <textarea
            value={personalIntention}
            onChange={(e) => setPersonalIntention(e.target.value)}
            placeholder="Ej: Quiero trabajar mi dificultad para poner límites..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateMeditation}
          disabled={loading || !selectedSefira}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generando meditación...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generar Meditación Personalizada
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {meditation && (
        <div className="border-t border-purple-200 bg-white">
          {/* Success banner if saved to consultant */}
          {savedToConsultant && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                ¡Meditación guardada en el perfil del consultante!
              </span>
            </div>
          )}
          
          {/* AI-generated badge */}
          {meditation.generated_by_ai && (
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-2 flex items-center gap-2 text-purple-700 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Generada con IA Cabalística especializada</span>
            </div>
          )}
          
          {/* Meditation Header */}
          <div className={`${SEFIROT_INFO[meditation.sefira]?.bgColor || 'bg-purple-600'} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{SEFIROT_INFO[meditation.sefira]?.icon || '✨'}</span>
                <div>
                  <h3 className={`text-lg font-bold ${SEFIROT_INFO[meditation.sefira]?.color || 'text-white'}`}>
                    {meditation.title}
                  </h3>
                  <p className={`text-sm ${SEFIROT_INFO[meditation.sefira]?.color || 'text-white'} opacity-80`}>
                    {meditation.duration_minutes} minutos • {meditation.type_name || MEDITATION_TYPES[meditation.type]?.label || meditation.type}
                  </p>
                </div>
              </div>
              <button
                onClick={copyMeditation}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className={`h-4 w-4 ${SEFIROT_INFO[meditation.sefira].color}`} />
                    <span className={`text-sm ${SEFIROT_INFO[meditation.sefira].color}`}>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className={`h-4 w-4 ${SEFIROT_INFO[meditation.sefira]?.color || 'text-white'}`} />
                    <span className={`text-sm ${SEFIROT_INFO[meditation.sefira]?.color || 'text-white'}`}>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meditation Content - AI Format */}
          {meditation.generated_by_ai ? (
            <div className="p-6 space-y-6">
              {/* Divine Name and Color */}
              {(meditation.divine_name || meditation.color) && (
                <div className="flex gap-4 text-sm">
                  {meditation.divine_name && (
                    <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      <span className="text-purple-700">Nombre: </span>
                      <span className="font-medium text-purple-900">{meditation.divine_name}</span>
                    </div>
                  )}
                  {meditation.color && (
                    <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      <span className="text-gray-600">Color: </span>
                      <span className="font-medium text-gray-900">{meditation.color}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Opening */}
              {meditation.opening && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Apertura y Enraizamiento
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{meditation.opening}</p>
                </div>
              )}

              {/* Sefira Explanation */}
              {meditation.sefira_explanation && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    ✡️ Sobre {meditation.sefira_name || meditation.sefira}
                  </h4>
                  <p className="text-indigo-800 leading-relaxed whitespace-pre-line">{meditation.sefira_explanation}</p>
                </div>
              )}

              {/* Breathing Exercise */}
              {meditation.breathing_exercise && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    🌬️ Ejercicio de Respiración
                  </h4>
                  <p className="text-blue-800 leading-relaxed whitespace-pre-line">{meditation.breathing_exercise}</p>
                </div>
              )}

              {/* Activation */}
              {meditation.activation && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    ⚡ Activación
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{meditation.activation}</p>
                </div>
              )}

              {/* Divine Name Contemplation */}
              {meditation.divine_name_contemplation && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Contemplación del Nombre
                  </h4>
                  <p className="text-purple-800 leading-relaxed whitespace-pre-line">{meditation.divine_name_contemplation}</p>
                </div>
              )}

              {/* Visualization */}
              {meditation.visualization && (
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                  <h4 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
                    🔮 Visualización
                  </h4>
                  <p className="text-pink-800 leading-relaxed whitespace-pre-line">{meditation.visualization}</p>
                </div>
              )}

              {/* Integration */}
              {meditation.integration && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Integración
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{meditation.integration}</p>
                </div>
              )}

              {/* Closing */}
              {meditation.closing && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Cierre
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{meditation.closing}</p>
                </div>
              )}

              {/* Practice Tips */}
              {meditation.practice_tips && meditation.practice_tips.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Consejos para la Práctica</h4>
                  <ul className="space-y-1">
                    {meditation.practice_tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                  {meditation.best_time && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                      <span className="text-gray-500">Mejor momento:</span>{' '}
                      <span className="font-medium text-gray-900">{meditation.best_time}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Meditation Content - Static Format (Fallback) */
            <div className="p-6 space-y-6">
              {/* Introduction */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Introducción
                </h4>
                <p className="text-gray-700 leading-relaxed">{meditation.introduction}</p>
              </div>

              {/* Breathing Exercise */}
              {meditation.breathing_exercise && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    🌬️ Ejercicio de Respiración
                  </h4>
                  <p className="text-blue-800 leading-relaxed">{meditation.breathing_exercise}</p>
                </div>
              )}

              {/* Visualization */}
              {meditation.visualization && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Visualización
                  </h4>
                  <p className="text-purple-800 leading-relaxed whitespace-pre-line">{meditation.visualization}</p>
                </div>
              )}

              {/* Affirmations */}
              {meditation.affirmations && meditation.affirmations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Afirmaciones
                  </h4>
                  <div className="space-y-2">
                    {meditation.affirmations.map((aff, idx) => (
                      <div 
                        key={idx}
                        className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-2 text-pink-900"
                      >
                        "{aff}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Closing */}
              {meditation.closing && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Cierre
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{meditation.closing}</p>
                </div>
              )}

              {/* Practice Tips */}
              {meditation.practice_tips && meditation.practice_tips.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Consejos para la Práctica</h4>
                  <ul className="space-y-1">
                    {meditation.practice_tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Mejor momento:</span>{' '}
                      <span className="font-medium text-gray-900">{meditation.best_time}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frecuencia:</span>{' '}
                      <span className="font-medium text-gray-900">{meditation.frequency_recommendation}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-6 pb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>Nota:</strong> Esta meditación es una herramienta de apoyo terapéutico. 
              El terapeuta puede revisar y adaptar el contenido antes de compartirlo con el consultante.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
