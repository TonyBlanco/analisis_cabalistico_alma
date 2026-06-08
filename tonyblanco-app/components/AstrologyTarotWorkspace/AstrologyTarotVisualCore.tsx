'use client';

import type { AstrologyTarotSectionId, TarotSystemId } from './types';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { TarotDeck } from '@/components/TarotCard';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import type { TarotCardData } from '@/components/TarotCard/TarotCard.types';
import TarotDrawPanel from '@/components/tarot/TarotDrawPanel';
import { ARCANOS_MAYORES } from '@/components/BodySoulVisualization/plugins/tarot/tarot.logic';
import type { PatientContext } from '@/components/BodySoulVisualization/types';
import BotaImageReferencePanel from '@/components/tarot/bota/BotaImageReferencePanel';
import { THOTH_MAJOR_ARCANA } from '@holistica/symbolic/tarot/decks/thoth';
import { GOLDEN_DAWN_MAJOR_ARCANA } from '@holistica/symbolic/tarot/decks/golden-dawn';
import { BOTA_MAJOR_ARCANA } from '@holistica/symbolic/tarot/decks/bota';
import { HERMETIC_MAJOR_ARCANA } from '@holistica/symbolic/tarot/decks/hermetic';
import { SEPHIROTH_MAJOR_ARCANA } from '@holistica/symbolic/tarot/decks/sephiroth';
import { addSymbolicTimelineEvent } from '@/components/SymbolicTimeline';
import { useSaveTarotSpread } from '@/lib/api/swm/tarot/hooks/useSaveTarotSpread';
import type { TarotCard as SwmTarotCard } from '@/lib/api/swm/tarot/types';
// Tarot Holístico AI Integration
import { useTarotHolistic } from '@/lib/api/swm/tarot/hooks/useTarotHolistic';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getTarotSystemEntry,
  isTarotSystemUsable,
  normalizeTarotSystemId,
  tarotSystemStatusLabel,
} from '@/lib/tarotSystems.registry';

const SPREAD_SECTIONS: AstrologyTarotSectionId[] = [
  'tarot-free-spread',
  'tarot-tree-spread',
];

interface AstrologyTarotVisualCoreProps {
  activeSection: AstrologyTarotSectionId;
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: unknown) => void;
  onCardSelect?: (card: unknown) => void;
  selectedSystem?: TarotSystemId | null;
  onSystemChange?: (systemId: TarotSystemId) => void;
  // SWM Integration props
  instanceId?: string | null;
  sessionId?: string | null;
  isWorkspaceActive?: boolean;
  onSpreadSaved?: () => void;
}

type SwmV3PayloadCard = {
  id: string;
  name: string;
  arcana?: string;
  tags?: string[];
  kabbalistic_details?: {
    hebrew_letter?: string | null;
    letter_name?: string | null;
    gematria?: number | null;
    path?: string | null;
    sefirot?: string[];
    letter_meaning?: string | null;
    intelligence?: string | null;
    cube_of_space?: string | null;
    tags?: string[];
    [key: string]: unknown;
  };
};

type SwmV3Payload = {
  reading_id?: string;
  system?: {
    id: string;
    name: string;
    implemented: boolean;
    description: string;
    source: string;
  };
  spread?: {
    id: string;
    name: string;
    positions: number;
  };
  cards: SwmV3PayloadCard[];
  context?: string | null;
  intention?: string | null;
  generated_at?: string;
  educational_disclaimer?: string;
  // Legacy fields for compatibility
  id?: string;
  summary?: string;
  themes?: string[];
  correspondences?: string[];
  caution?: string;
  symbolic_reading?: {
    system?: { id: string; label: string };
    card?: { name: string; arcana: string; keywords: string[] };
    symbolic_reading?: {
      core_meaning: string;
      contextual_meaning: string;
      position_meaning: string;
      system_frame: string;
    };
    ai_generated?: boolean;
    ai_provider?: string;
    notes?: string;
  };
};

type SwmV3ApiResponse = {
  success: boolean;
  stored: boolean;
  mode: string | null;
  reading_id: string | null;
  payload?: SwmV3Payload;
  error?: string;
};

export default function AstrologyTarotVisualCore({
  activeSection,
  patientId,
  patientName,
  patientBirthDate,
  onSefirahHighlight,
  onReadingComplete,
  onCardSelect,
  selectedSystem,
  onSystemChange,
  // SWM Integration
  instanceId,
  sessionId,
  isWorkspaceActive,
  onSpreadSaved,
}: AstrologyTarotVisualCoreProps) {
  // SWM Hook for saving spreads
  const { saveSpread, isLoading: isSavingSpread, error: saveSpreadError } = useSaveTarotSpread();
  const [therapistNotes, setTherapistNotes] = useState('');
  
  // Tarot Holístico AI Hook
  const {
    isLoading: isAiLoading,
    error: aiError,
    hasConsent,
    acceptConsent,
    interpretCard,
    providerUsed,
    modelUsed,
    lastCardInterpretation,
    schema: aiSchema,
  } = useTarotHolistic();
  
  // AI Interpretation state
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiThemes, setAiThemes] = useState<string[]>([]);
  
  const deckCards = useMemo<TarotCardData[]>(
    () =>
      ARCANOS_MAYORES.map((card) => ({
        id: card.id,
        name: card.spanishName || card.name,
        number: card.number,
        arcana: 'major',
        element: card.element,
        keywords: card.keywords,
        imageUrl: `/tarot/${card.id}.png`,
        sefirahId: card.sefirah,
      })),
    []
  );

  const sectionConfig: Record<
    AstrologyTarotSectionId,
    { title: string; description: string }
  > = {
    'tarot-natal': {
      title: 'Carta Natal',
      description: 'Vista simbolica de origen. Observacional.',
    },
    'tarot-tree-spread': {
      title: 'Tirada del Arbol',
      description: 'Distribucion visual de cartas por posiciones.',
    },
    'tarot-free-spread': {
      title: 'Tirada Libre',
      description: 'Exploracion abierta sin estructura fija.',
    },
    'tarot-correspondences': {
      title: 'Correspondencias',
      description: 'Relaciones simbolicas entre cartas y atributos.',
    },
    'tarot-deck-view': {
      title: 'Visualizar Mazo',
      description: 'Vista completa del mazo tarot.',
    },
    'tarot-ai-draft': {
      title: 'Preparar Analisis IA',
      description: 'Preparacion simbolica sin ejecucion.',
    },
  };

  const activeConfig = sectionConfig[activeSection];
  const systemKey = normalizeTarotSystemId(selectedSystem ?? 'thoth');
  const isSpreadSection = SPREAD_SECTIONS.includes(activeSection);
  const systemEntry = getTarotSystemEntry(systemKey);
  const isSystemUsable = isTarotSystemUsable(systemKey);
  const hasSwmBackend = systemEntry?.swmV3Implemented ?? false;
  const systemTier = systemEntry?.tier ?? 'preparing';
  const systemLabelMap: Partial<Record<TarotSystemId, string>> = {
    thoth: 'Thoth Tarot (Crowley)',
    'golden-dawn': 'Golden Dawn Tarot',
    rota: 'R.O.T.A. (tarot hermético)',
    marsella: 'Tarot de Marsella (simbólico)',
    'rider-waite': 'Rider–Waite (simbólico)',
    'tarot-cabalistico': 'Tarot cabalístico (Árbol de la Vida)',
    'oracle-symbolic': 'Oráculo simbólico genérico',
    bota: 'B.O.T.A. Tarot',
    hermetic: 'Hermetic Tarot',
    sephiroth: 'Tarot of the Sephiroth',
  };
  const systemLabel = systemEntry?.label ?? systemLabelMap[systemKey] ?? systemKey;
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  const [analysisSources, setAnalysisSources] = useState({
    tarot: true,
    cabala: false,
    paths: false,
  });
  const [analysisType, setAnalysisType] = useState<
    'exploratorio' | 'integrativo' | 'evolutivo'
  >('exploratorio');
  const [intention, setIntention] = useState('');
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [swmPayload, setSwmPayload] = useState<SwmV3Payload | null>(null);
  const [swmLoading, setSwmLoading] = useState(false);
  const [swmFetchFailed, setSwmFetchFailed] = useState(false);
  const lastSessionKey = useRef<string | null>(null);

  const activeSwmCard = swmPayload?.cards?.[0] ?? null;
  const activeKabbalisticDetails = activeSwmCard?.kabbalistic_details ?? null;
  
  // DEBUG: Log para verificar datos
  if (typeof window !== 'undefined' && activeSwmCard) {
    console.log('🔍 DEBUG activeSwmCard:', activeSwmCard);
    console.log('🔍 DEBUG kabbalistic_details:', activeKabbalisticDetails);
  }
  
  const structured = swmPayload?.symbolic_reading?.symbolic_reading ?? null;
  const structuredKeywords = swmPayload?.symbolic_reading?.card?.keywords ?? null;

  const handleCardSelect = (card: TarotCardData | null) => {
    setSelectedCard(card);
    setAiInterpretation(null);
    setAiThemes([]);
    onCardSelect?.(card);
  };

  const thothMapping = useMemo(() => {
    if (systemKey !== 'thoth' || !selectedCard) {
      return null;
    }
    return THOTH_MAJOR_ARCANA.find(
      (entry) => entry.arcanaId === selectedCard.id
    );
  }, [selectedCard, systemKey]);

  const goldenDawnMapping = useMemo(() => {
    if (systemKey !== 'golden-dawn' || !selectedCard) {
      return null;
    }
    if (typeof selectedCard.number !== 'number') {
      return null;
    }
    return GOLDEN_DAWN_MAJOR_ARCANA.find(
      (entry) => entry.number === selectedCard.number
    );
  }, [selectedCard, systemKey]);

  const botaMapping = useMemo(() => {
    if (systemKey !== 'bota' || !selectedCard) {
      return null;
    }
    if (typeof selectedCard.number !== 'number') {
      return null;
    }
    return BOTA_MAJOR_ARCANA.find(
      (entry) => entry.number === selectedCard.number
    );
  }, [selectedCard, systemKey]);

  const hermeticMapping = useMemo(() => {
    if (systemKey !== 'hermetic' || !selectedCard) {
      return null;
    }
    if (typeof selectedCard.number !== 'number') {
      return null;
    }
    return HERMETIC_MAJOR_ARCANA.find(
      (entry) => entry.number === selectedCard.number
    );
  }, [selectedCard, systemKey]);

  const sephirothMapping = useMemo(() => {
    if (systemKey !== 'sephiroth' || !selectedCard) {
      return null;
    }
    if (typeof selectedCard.number !== 'number') {
      return null;
    }
    return SEPHIROTH_MAJOR_ARCANA.find(
      (entry) => entry.number === selectedCard.number
    );
  }, [selectedCard, systemKey]);

  const handleDraftSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSystemUsable) {
      return;
    }
    const draftPayload = {
      patientId: patientId ?? null,
      system: systemKey,
      selectedCards: selectedCard
        ? [{ id: selectedCard.id, name: selectedCard.name }]
        : [],
      correspondences: {
        tarot: analysisSources.tarot,
        cabala: analysisSources.cabala,
        paths: analysisSources.paths,
      },
      analysisType,
      intention,
      timestamp: new Date().toISOString(),
    };
    setDraft(draftPayload);
    if (process.env.NODE_ENV !== 'production') {
      console.log('SymbolicAnalysisDraft', draftPayload);
    }

    if (!patientId || !selectedCard) {
      return;
    }

    addSymbolicTimelineEvent({
      patientId,
      date: new Date().toISOString(),
      workspace: 'tarot',
      system: systemKey,
      symbols: {
        cards: [selectedCard.id],
      },
      notes: intention || undefined,
      source: 'ai-prep',
    });
  };

  const displayDate = new Date().toLocaleDateString('es-ES');

  const resolveSystemMapping = () => {
    switch (systemKey) {
      case 'thoth':
        return thothMapping
          ? {
              letters: [thothMapping.hebrewLetter],
              sefirot: thothMapping.sefirot,
              paths: [thothMapping.path],
            }
          : null;
      case 'golden-dawn':
        return goldenDawnMapping
          ? {
              letters: [goldenDawnMapping.hebrewLetter],
              sefirot: goldenDawnMapping.sefirot,
              paths: [goldenDawnMapping.path],
            }
          : null;
      case 'bota':
        return botaMapping
          ? {
              letters: [botaMapping.hebrewLetter],
              sefirot: botaMapping.sefirot,
              paths: [botaMapping.path],
            }
          : null;
      case 'hermetic':
        return hermeticMapping
          ? {
              letters: [hermeticMapping.hebrewLetter],
              sefirot: hermeticMapping.sefirot,
              paths: [hermeticMapping.path],
            }
          : null;
      case 'sephiroth':
        return sephirothMapping
          ? {
              letters: [sephirothMapping.hebrewLetter],
              sefirot: sephirothMapping.sefirot,
              paths: [sephirothMapping.path],
            }
          : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!hasSwmBackend || !selectedCard) {
      setSwmPayload(null);
      setSwmLoading(false);
      setSwmFetchFailed(false);
      return;
    }

    const controller = new AbortController();
    const fetchPayload = async () => {
      setSwmLoading(true);
      setSwmFetchFailed(false);
      setSwmPayload(null);
      try {
        const token = getAuthToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {}),
        };

        const response = await fetch(`${API_BASE_URL}/swm-v3/symbolic-readings/`, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            system_id: systemKey,
            consent_mode: 'no_store',
            reading_type: 'educational',
            selected_cards: [selectedCard.id],
            include_ai: false,
          }),
        });

        if (!response.ok) {
          setSwmFetchFailed(true);
          return;
        }

        const data = (await response.json()) as SwmV3ApiResponse;
        if (!data?.success || !data?.payload) {
          setSwmFetchFailed(true);
          return;
        }

        setSwmPayload(data.payload);
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') {
          setSwmFetchFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSwmLoading(false);
        }
      }
    };

    fetchPayload();
    return () => controller.abort();
  }, [hasSwmBackend, systemKey, selectedCard?.id]);

  useEffect(() => {
    if (!patientId || !selectedCard) {
      return;
    }

    if (!isSystemUsable) {
      return;
    }

    if (activeSection === 'tarot-ai-draft') {
      return;
    }

    const sessionKey = `${patientId}:${systemKey}:${selectedCard.id}:${activeSection}`;
    if (lastSessionKey.current === sessionKey) {
      return;
    }

    const mapping = resolveSystemMapping();
    addSymbolicTimelineEvent({
      patientId,
      date: new Date().toISOString(),
      workspace: 'tarot',
      system: systemKey,
      symbols: {
        cards: [selectedCard.id],
        letters: mapping?.letters,
        sefirot: mapping?.sefirot,
        paths: mapping?.paths,
      },
      source: 'manual',
    });

    lastSessionKey.current = sessionKey;
  }, [
    activeSection,
    patientId,
    selectedCard,
    systemKey,
    isSystemUsable,
    thothMapping,
    goldenDawnMapping,
    botaMapping,
    hermeticMapping,
    sephirothMapping,
  ]);

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{activeConfig.title}</h3>
          <p className="text-xs text-gray-500">
            {activeConfig.description}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Sección activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="grid gap-4">
        {!isSystemUsable && !isSpreadSection && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-amber-800">
                  {tarotSystemStatusLabel(systemTier)}
                </div>
                <div className="mt-1 font-medium">{systemLabel}</div>
              </div>
              <div className="text-[11px] text-amber-800">Inactivo</div>
            </div>
            <p className="mt-2">
              Este sistema está preparado pero aún no está activo.
            </p>
            <p className="mt-1 text-xs text-amber-800">
              No se ejecutará análisis en esta fase.
            </p>
          </div>
        )}

        {activeSection === 'tarot-deck-view' && (
          <>
            <TarotDeck
              cards={deckCards}
              layout="grid"
              interactive={true}
              onCardSelect={handleCardSelect}
            />
            {systemKey === 'bota' && <BotaImageReferencePanel />}
          </>
        )}
        {activeSection === 'tarot-tree-spread' && (
          <TarotDrawPanel
            consultantId={patientId ? String(patientId) : null}
            systemId={systemKey}
            onSystemChange={(next) => onSystemChange?.(next as TarotSystemId)}
            useBotaSvg={systemKey === 'bota'}
          />
        )}
        {activeSection === 'tarot-free-spread' && (
          <TarotDrawPanel
            consultantId={patientId ? String(patientId) : null}
            systemId={systemKey}
            onSystemChange={(next) => onSystemChange?.(next as TarotSystemId)}
            useBotaSvg={systemKey === 'bota'}
          />
        )}
        {activeSection === 'tarot-natal' && (
          <TarotDeck
            cards={deckCards.slice(0, 3)}
            layout="grid"
            interactive={true}
            onCardSelect={handleCardSelect}
          />
        )}
        {activeSection === 'tarot-correspondences' && isSystemUsable && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            {selectedCard ? (
              <div className="grid gap-2">
                <div>
                  <span className="font-medium">Carta:</span> {selectedCard.name}
                </div>
                {(() => {
                  const mapping = resolveSystemMapping();
                  if (!mapping) {
                    return (
                      <p className="text-xs text-gray-500">
                        Selecciona una carta en otra sección para ver correspondencias.
                      </p>
                    );
                  }
                  return (
                    <>
                      <div>
                        <span className="font-medium">Letras hebreas:</span>{' '}
                        {mapping.letters.filter(Boolean).join(', ') || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Sefirot:</span>{' '}
                        {mapping.sefirot?.join(', ') || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Senderos:</span>{' '}
                        {mapping.paths.filter(Boolean).join(', ') || '—'}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p>Selecciona una carta para consultar correspondencias del sistema activo.</p>
            )}
          </div>
        )}
        {activeSection === 'tarot-correspondences' && !isSystemUsable && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Correspondencias no disponibles: sistema en preparación.
          </div>
        )}
        {activeSection === 'tarot-ai-draft' && isSystemUsable && (
          <form
            className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 space-y-4"
            onSubmit={handleDraftSubmit}
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Contexto (solo lectura)
              </div>
              <div className="mt-2 grid gap-2 text-xs">
                <div>
                  <span className="font-medium">Consultante:</span>{' '}
                  <span>{patientName || 'Consultante no seleccionado'}</span>
                </div>
                <div>
                  <span className="font-medium">ID:</span>{' '}
                  <span>{patientId ?? '—'}</span>
                </div>
                <div>
                  <span className="font-medium">Fecha:</span>{' '}
                  <span>{displayDate}</span>
                </div>
                <div>
                  <span className="font-medium">Sistema activo:</span>{' '}
                  <span>{systemLabel}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Carta observacional
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Selección manual para preparación simbólica. Sin tirada, sin predicción clínica.
              </p>
              <select
                className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                value={selectedCard?.id ?? ''}
                onChange={(event) => {
                  const nextId = event.target.value;
                  if (!nextId) {
                    handleCardSelect(null);
                    return;
                  }
                  const card = deckCards.find((entry) => entry.id === nextId) ?? null;
                  handleCardSelect(card);
                }}
              >
                <option value="">— Elegir arcano mayor —</option>
                {deckCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {typeof card.number === 'number' ? `${card.number}. ` : ''}
                    {card.name}
                  </option>
                ))}
              </select>
              {selectedCard && (
                <div className="mt-2 flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  {selectedCard.imageUrl ? (
                    <img
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      className="h-14 w-9 rounded object-cover border border-gray-200"
                    />
                  ) : null}
                  <div>
                    <div className="font-medium">{selectedCard.name}</div>
                    {Array.isArray(selectedCard.keywords) && selectedCard.keywords.length > 0 && (
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {selectedCard.keywords.slice(0, 4).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Fuentes simbolicas
              </div>
              <div className="mt-2 grid gap-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analysisSources.tarot}
                    onChange={(event) =>
                      setAnalysisSources((prev) => ({
                        ...prev,
                        tarot: event.target.checked,
                      }))
                    }
                  />
                  Tarot (cartas seleccionadas)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analysisSources.cabala}
                    onChange={(event) =>
                      setAnalysisSources((prev) => ({
                        ...prev,
                        cabala: event.target.checked,
                      }))
                    }
                  />
                  Correspondencias cabalisticas
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analysisSources.paths}
                    onChange={(event) =>
                      setAnalysisSources((prev) => ({
                        ...prev,
                        paths: event.target.checked,
                      }))
                    }
                  />
                  Senderos del Arbol de la Vida
                </label>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Tipo de analisis
              </div>
              <div className="mt-2 grid gap-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="analysisType"
                    value="exploratorio"
                    checked={analysisType === 'exploratorio'}
                    onChange={() => setAnalysisType('exploratorio')}
                  />
                  Exploratorio simbolico
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="analysisType"
                    value="integrativo"
                    checked={analysisType === 'integrativo'}
                    onChange={() => setAnalysisType('integrativo')}
                  />
                  Integrativo transversal
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="analysisType"
                    value="evolutivo"
                    checked={analysisType === 'evolutivo'}
                    onChange={() => setAnalysisType('evolutivo')}
                  />
                  Evolutivo (temporal)
                </label>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Intencion
              </div>
              <textarea
                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
                rows={3}
                value={intention}
                onChange={(event) => setIntention(event.target.value)}
                placeholder="Explorar patrones simbolicos relevantes…"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500">
                Preparacion de analisis simbolico (fase 0)
              </span>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-gray-200"
                >
                  Guardar borrador
                </button>
                <button
                  type="button"
                  disabled={isAiLoading || !selectedCard}
                  title={
                    selectedCard
                      ? 'Generar interpretación simbólica asistida'
                      : 'Elige una carta observacional arriba'
                  }
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!selectedCard) return;
                    try {
                      const result = await interpretCard({
                        arcanaId: selectedCard.id,
                        arcanaName: selectedCard.name,
                        position: 'general',
                        reversed: false,
                        tarotSystem: systemKey,
                        context: {
                          question: intention || undefined,
                          consultantId: patientId
                            ? Number(patientId) || undefined
                            : undefined,
                        },
                      });
                      setAiInterpretation(result.text);
                      setAiThemes(result.themes);
                    } catch (err) {
                      console.error('Error en interpretación AI:', err);
                    }
                  }}
                  className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Interpretando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Interpretar con IA
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resultado de interpretación AI */}
            {aiInterpretation && (
              <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Interpretación Simbólica Holística</span>
                  {providerUsed && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                      {providerUsed.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiInterpretation}</div>
                {aiThemes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {aiThemes.map((theme, idx) => (
                      <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-[10px] text-gray-500 italic">
                  Interpretación educativa y exploratoria. No constituye consejo profesional.
                </div>
              </div>
            )}

            {/* Error de AI */}
            {aiError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {aiError}
              </div>
            )}

            {draft && (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-500">
                Borrador listo. Datos almacenados localmente.
              </div>
            )}
          </form>
        )}

        {activeSection === 'tarot-ai-draft' && !isSystemUsable && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Panel informativo (solo lectura)
            </div>
            <p className="mt-2">
              Este sistema está preparado pero aún no está activo.
            </p>
            <p className="mt-1 text-xs text-gray-600">
              No se ejecutará análisis en esta fase.
            </p>
          </div>
        )}

        {isSystemUsable && !isSpreadSection && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Sistema simbólico activo
              </div>
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  systemTier === 'full' ? 'text-emerald-700' : 'text-sky-700'
                }`}
              >
                {tarotSystemStatusLabel(systemTier)}
              </span>
            </div>
            <div className="mt-1 font-medium">{systemLabel}</div>

            {!selectedCard && (
              <div className="mt-2 text-xs text-gray-500">
                {activeSection === 'tarot-ai-draft'
                  ? 'Elige una carta observacional en el formulario de preparación.'
                  : 'Selecciona una carta en el mazo para visualizar datos simbólicos.'}
              </div>
            )}

            {selectedCard && hasSwmBackend && swmLoading && (
              <div className="mt-2 text-xs text-gray-500">
                Cargando datos simbólicos...
              </div>
            )}

            {selectedCard && hasSwmBackend && !swmLoading && swmFetchFailed && (
              <div className="mt-2 text-xs text-amber-700">
                No se pudo cargar SWM v3. Mostrando correspondencias locales.
              </div>
            )}

            {selectedCard && !swmLoading && !swmPayload && (() => {
              const mapping = resolveSystemMapping();
              if (!mapping) {
                return (
                  <div className="mt-2 text-xs text-gray-500">
                    Sin mapeo local para esta carta en el sistema seleccionado.
                  </div>
                );
              }
              return (
                <div className="mt-2 grid gap-2 text-xs">
                  <div>
                    <span className="font-medium">Carta:</span> {selectedCard.name}
                  </div>
                  <div>
                    <span className="font-medium">Letra hebrea:</span>{' '}
                    {mapping.letters.filter(Boolean).join(', ') || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Sefirot:</span>{' '}
                    {mapping.sefirot?.join(', ') || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Sendero:</span>{' '}
                    {mapping.paths.filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              );
            })()}

            {selectedCard && swmPayload && (
              <div className="mt-2 grid gap-2">
                <div>
                  <span className="font-medium">Carta:</span>{' '}
                  <span>{selectedCard.name}</span>
                </div>
                <div>
                  <span className="font-medium">Letra hebrea:</span>{' '}
                  <span>{activeKabbalisticDetails?.hebrew_letter ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Nombre:</span>{' '}
                  <span>{activeKabbalisticDetails?.letter_name ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Valor gemátrico:</span>{' '}
                  <span>
                    {typeof activeKabbalisticDetails?.gematria === 'number'
                      ? String(activeKabbalisticDetails.gematria)
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Sendero:</span>{' '}
                  <span>{activeKabbalisticDetails?.path ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Sefirot relacionadas:</span>{' '}
                  <span>
                    {Array.isArray(activeKabbalisticDetails?.sefirot) && activeKabbalisticDetails.sefirot.length
                      ? activeKabbalisticDetails.sefirot.join(' - ')
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Tags:</span>{' '}
                  <span>
                    {Array.isArray(activeSwmCard?.tags) && activeSwmCard.tags.length
                      ? activeSwmCard.tags.join(', ')
                      : '-'}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      Lectura simbólica
                    </div>
                    {swmPayload?.symbolic_reading?.ai_generated !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        swmPayload.symbolic_reading.ai_generated 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {swmPayload.symbolic_reading.ai_generated 
                          ? `✨ ${swmPayload.symbolic_reading.ai_provider?.toUpperCase() || 'IA'}` 
                          : '📚 Tradición'}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 italic">
                    {structured?.system_frame ?? 'Marco simbólico no disponible.'}
                  </div>
                  {Array.isArray(structuredKeywords) && structuredKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {structuredKeywords.slice(0, 10).map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-purple-800">Significado central</div>
                    <div className="text-sm text-gray-700 mt-0.5">
                      {structured?.core_meaning ?? 'Significado no disponible.'}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-purple-800">Contexto</div>
                    <div className="text-sm text-gray-700 mt-0.5">
                      {structured?.contextual_meaning ?? 'Contexto no disponible.'}
                    </div>
                  </div>
                  {swmPayload?.symbolic_reading?.notes && (
                    <div className="mt-2 text-[11px] text-gray-400 italic">
                      {swmPayload.symbolic_reading.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* SWM Save Spread Panel */}
      {isWorkspaceActive && instanceId && selectedCard && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h4 className="text-sm font-medium text-indigo-900">Guardar Tirada</h4>
          <p className="mt-1 text-xs text-indigo-700">
            Carta seleccionada: {selectedCard.name}
          </p>
          
          <div className="mt-3">
            <label className="block text-xs font-medium text-indigo-800">
              Notas del terapeuta (opcional)
            </label>
            <textarea
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              placeholder="Observaciones simbólicas, contexto de la sesión..."
              className="mt-1 w-full rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={2}
            />
          </div>
          
          {saveSpreadError && (
            <p className="mt-2 text-xs text-red-600">{saveSpreadError}</p>
          )}
          
          <button
            onClick={async () => {
              if (!instanceId || !selectedCard) return;
              
              const cards: SwmTarotCard[] = [{
                position: 1,
                card_id: selectedCard.id,
                reversed: false,
                name: selectedCard.name,
                arcana: selectedCard.arcana || 'major',
                system: systemKey,
                keywords: selectedCard.keywords,
              }];
              
              try {
                await saveSpread({
                  instance_id: instanceId,
                  cards,
                  therapist_notes: therapistNotes,
                });
                setTherapistNotes('');
                onSpreadSaved?.();
                console.log('✅ Tirada guardada');
              } catch (error) {
                console.error('❌ Error al guardar tirada:', error);
              }
            }}
            disabled={isSavingSpread}
            className="mt-3 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingSpread ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              'Guardar Tirada'
            )}
          </button>
        </div>
      )}
    </section>
  );
}
