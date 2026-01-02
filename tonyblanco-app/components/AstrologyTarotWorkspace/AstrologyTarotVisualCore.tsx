'use client';

import type { AstrologyTarotSectionId, TarotSystemId } from './types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TarotDeck } from '@/components/TarotCard';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import type { TarotCardData } from '@/components/TarotCard/TarotCard.types';
import TarotDrawPanel from '@/components/tarot/TarotDrawPanel';
import { ARCANOS_MAYORES } from '@/components/BodySoulVisualization/plugins/tarot/tarot.logic';
import type { PatientContext } from '@/components/BodySoulVisualization/types';
import BotaImageReferencePanel from '@/components/tarot/bota/BotaImageReferencePanel';
import { THOTH_MAJOR_ARCANA } from '../../../src/symbolic/tarot/decks/thoth';
import { GOLDEN_DAWN_MAJOR_ARCANA } from '../../../src/symbolic/tarot/decks/golden-dawn';
import { BOTA_MAJOR_ARCANA } from '../../../src/symbolic/tarot/decks/bota';
import { HERMETIC_MAJOR_ARCANA } from '../../../src/symbolic/tarot/decks/hermetic';
import { SEPHIROTH_MAJOR_ARCANA } from '../../../src/symbolic/tarot/decks/sephiroth';
import { addSymbolicTimelineEvent } from '@/components/SymbolicTimeline';

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
}

type SwmV3PayloadCard = {
  id: string;
  name: string;
  arcana?: string;
  tags?: string[];
  symbols?: {
    hebrew_letter?: string | null;
    letter_name?: string | null;
    gematria?: number | null;
    path?: string | null;
    sefirot?: string[];
    system?: string;
    source?: string;
    [key: string]: unknown;
  };
};

type SwmV3Payload = {
  id: string;
  summary: string;
  themes: string[];
  correspondences: string[];
  caution: string;
  cards: SwmV3PayloadCard[];
  symbolic_reading?: {
    system?: { id: string; label: string };
    card?: { name: string; arcana: string; keywords: string[] };
    symbolic_reading?: {
      core_meaning: string;
      contextual_meaning: string;
      position_meaning: string;
      system_frame: string;
    };
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
}: AstrologyTarotVisualCoreProps) {
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
  const systemKey = selectedSystem ?? 'thoth';
  const isSystemImplemented = true;
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
  const systemLabel = systemLabelMap[systemKey] ?? systemKey;
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
  const lastSessionKey = useRef<string | null>(null);

  const activeSwmCard = swmPayload?.cards?.[0] ?? null;
  const activeSymbols = activeSwmCard?.symbols ?? null;
  const structured = swmPayload?.symbolic_reading?.symbolic_reading ?? null;
  const structuredKeywords = swmPayload?.symbolic_reading?.card?.keywords ?? null;

  const handleCardSelect = (card: TarotCardData | null) => {
    setSelectedCard(card);
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
    if (!isSystemImplemented) {
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
    if (!isSystemImplemented || !selectedCard) {
      setSwmPayload(null);
      return;
    }

    const controller = new AbortController();
    const fetchPayload = async () => {
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
          }),
        });

        if (!response.ok) {
          setSwmPayload(null);
          return;
        }

        const data = (await response.json()) as SwmV3ApiResponse;
        if (!data?.success || !data?.payload) {
          setSwmPayload(null);
          return;
        }

        setSwmPayload(data.payload);
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') {
          setSwmPayload(null);
        }
      }
    };

    fetchPayload();
    return () => controller.abort();
  }, [isSystemImplemented, systemKey, selectedCard?.id]);

  useEffect(() => {
    if (!patientId || !selectedCard) {
      return;
    }

    if (!isSystemImplemented) {
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
    isSystemImplemented,
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
        {!isSystemImplemented && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-amber-800">
                  SISTEMA SIMBÓLICO · PRÓXIMAMENTE
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
        {activeSection === 'tarot-correspondences' && isSystemImplemented && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Correspondencias simbolicas disponibles para consulta visual.
          </div>
        )}
        {activeSection === 'tarot-correspondences' && !isSystemImplemented && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Correspondencias no disponibles: sistema en preparación.
          </div>
        )}
        {activeSection === 'tarot-ai-draft' && isSystemImplemented && (
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
                  <span className="font-medium">Paciente:</span>{' '}
                  <span>{patientName || 'Paciente no seleccionado'}</span>
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
              <button
                type="submit"
                className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-gray-200"
              >
                Guardar borrador
              </button>
            </div>

            {draft && (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-500">
                Borrador listo. Datos almacenados localmente.
              </div>
            )}
          </form>
        )}

        {activeSection === 'tarot-ai-draft' && !isSystemImplemented && (
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

        {isSystemImplemented && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Sistema simbólico activo
              </div>
              <span className="text-[10px] uppercase tracking-wide text-emerald-700">
                IMPLEMENTADO (MOCK EDUCATIVO)
              </span>
            </div>
            <div className="mt-1 font-medium">{systemLabel}</div>

            {!selectedCard && (
              <div className="mt-2 text-xs text-gray-500">
                Selecciona una carta en el mazo para visualizar datos simbólicos.
              </div>
            )}

            {selectedCard && !swmPayload && (
              <div className="mt-2 text-xs text-gray-500">
                Cargando datos simbólicos...
              </div>
            )}

            {selectedCard && swmPayload && (
              <div className="mt-2 grid gap-2">
                <div>
                  <span className="font-medium">Carta:</span>{' '}
                  <span>{selectedCard.name}</span>
                </div>
                <div>
                  <span className="font-medium">Letra hebrea:</span>{' '}
                  <span>{activeSymbols?.hebrew_letter ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Nombre:</span>{' '}
                  <span>{activeSymbols?.letter_name ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Valor gemátrico:</span>{' '}
                  <span>
                    {typeof activeSymbols?.gematria === 'number'
                      ? String(activeSymbols.gematria)
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Sendero:</span>{' '}
                  <span>{activeSymbols?.path ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium">Sefirot relacionadas:</span>{' '}
                  <span>
                    {Array.isArray(activeSymbols?.sefirot) && activeSymbols.sefirot.length
                      ? activeSymbols.sefirot.join(' - ')
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
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Lectura simbólica (mínima)
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
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
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700">Significado central</div>
                    <div className="text-sm text-gray-700">
                      {structured?.core_meaning ?? 'Significado no disponible.'}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-700">Contexto</div>
                    <div className="text-sm text-gray-700">
                      {structured?.contextual_meaning ?? 'Contexto no disponible.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
