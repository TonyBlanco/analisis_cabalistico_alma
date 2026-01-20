'use client';

import { useMemo, useState } from 'react';
import ConsentModal, { type SwmV3ConsentMode } from '@/components/SWMV3/ConsentModal';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import TarotSpreadView, { type TarotCardDraw, type TarotSpread, type TarotSpreadPosition } from './TarotSpreadView';
import SymbolicReadingPanel from './SymbolicReadingPanel';
import { resolveBotaIdentity } from '@holistica/symbolic/tarot/bota/botaIdentityResolver';
import { buildBotaPositionMeaning } from '@holistica/symbolic/tarot/bota/positionInterpreter';
import { buildBotaSynthesis } from '@holistica/symbolic/tarot/bota/synthesisBuilder';

type ConsentState = {
  mode: SwmV3ConsentMode;
  acceptedAt: string;
  version: string;
};

type SwmV3ApiResponse = {
  success: boolean;
  stored: boolean;
  mode: SwmV3ConsentMode | null;
  reading_id: string | null;
  payload?: any;
  error?: string;
};

type SymbolicReading = {
  system: { id: string; label: string };
  spread: TarotSpread;
  cards: TarotCardDraw[];
};

const SYSTEMS: Array<{ id: string; label: string }> = [
  { id: 'thoth', label: 'Thoth Tarot (Crowley)' },
  { id: 'golden-dawn', label: 'Golden Dawn Tarot' },
  { id: 'rota', label: 'R.O.T.A. (tarot hermético)' },
  { id: 'marsella', label: 'Tarot de Marsella (simbólico)' },
  { id: 'rider-waite', label: 'Rider–Waite (simbólico)' },
  { id: 'tarot-cabalistico', label: 'Tarot cabalístico (Árbol de la Vida)' },
  { id: 'oracle-symbolic', label: 'Oráculo simbólico genérico' },
  { id: 'bota', label: 'B.O.T.A. Tarot' },
  { id: 'hermetic', label: 'Hermetic Tarot' },
  { id: 'sephiroth', label: 'Tarot of the Sephiroth' },
];

const SPREADS: Array<{ id: string; nameSpanish: string }> = [
  { id: 'simple', nameSpanish: 'Tirada simple' },
  { id: 'three_cards', nameSpanish: 'Tirada trina' },
  { id: 'observation', nameSpanish: 'Tirada de observación' },
];

const CONTEXTS: Array<{ id: string; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'love', label: 'Vínculo' },
  { id: 'career', label: 'Trabajo' },
  { id: 'spiritual', label: 'Espiritual' },
];

function safeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
}

function buildSpread(spreadId: string, cards: TarotCardDraw[]): TarotSpread {
  const nameSpanish = SPREADS.find((s) => s.id === spreadId)?.nameSpanish ?? spreadId;
  const positionsFromCards: TarotSpreadPosition[] = [];
  for (const draw of cards) {
    if (draw.position && typeof draw.position.id === 'string' && draw.position.id.trim()) {
      positionsFromCards.push(draw.position);
    }
  }
  const dedup = new Map<string, TarotSpreadPosition>();
  for (const p of positionsFromCards) {
    if (!dedup.has(p.id)) dedup.set(p.id, p);
  }
  return {
    id: spreadId,
    nameSpanish,
    positions: Array.from(dedup.values()),
  };
}

const READING_FALLBACK_TEXT = 'Lectura no disponible para esta carta.';

function safeDict(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? (value as Record<string, any>) : null;
}

function cardDisplayName(draw: TarotCardDraw | null | undefined): string {
  const symbols = safeDict(draw?.symbols);
  const nameSpanish = symbols && typeof symbols.nameSpanish === 'string' ? symbols.nameSpanish : null;
  return (nameSpanish || draw?.card?.nameSpanish || draw?.card?.name || draw?.card?.id || '').trim();
}

function positionDisplayName(draw: TarotCardDraw | null | undefined): string {
  const pos = draw?.position;
  return (pos?.nameSpanish || pos?.label || pos?.id || '').trim();
}

function drawKeywords(draw: TarotCardDraw): string[] {
  if ((draw?.symbols?.system || '').toString().toLowerCase() === 'bota') return [];
  const symbols = safeDict(draw.symbols);
  const candidate = draw.reversed ? symbols?.keywordsReversed : symbols?.keywords;
  if (Array.isArray(candidate)) return candidate.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  const fallback = draw.card?.keywords;
  if (Array.isArray(fallback)) return fallback.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  return [];
}

function drawText(draw: TarotCardDraw, contextFocus: string): string {
  if ((draw?.symbols?.system || '').toString().toLowerCase() === 'bota') {
    const identity = resolveBotaIdentity({
      id: draw.card?.id,
      name: draw.card?.name || null,
      nameSpanish: draw.card?.nameSpanish || null,
      symbols: draw.symbols,
      imageUrl: draw.card?.imageUrl || null,
    });
    if (!identity) return '';
    return (
      buildBotaPositionMeaning({
        identity,
        positionId: draw.position?.id ?? null,
        positionLabel: (draw.position?.nameSpanish || draw.position?.label || null) as string | null,
      }) || ''
    );
  }
  const symbols = safeDict(draw.symbols);
  const orientationKey = draw.reversed ? 'reversed' : 'upright';
  const focus = contextFocus || 'general';
  const texts = safeDict(symbols?.[orientationKey]);
  const byFocus = texts && typeof texts[focus] === 'string' ? String(texts[focus]).trim() : '';
  const byGeneral = texts && typeof texts.general === 'string' ? String(texts.general).trim() : '';
  if (byFocus) return byFocus;
  if (byGeneral) return byGeneral;
  const srContainer = draw.symbolic_reading && typeof draw.symbolic_reading === 'object' ? (draw.symbolic_reading as any).symbolic_reading : null;
  const srCore = srContainer && typeof srContainer.core_meaning === 'string' ? srContainer.core_meaning.trim() : '';
  const srCtx = srContainer && typeof srContainer.context_meaning === 'string' ? srContainer.context_meaning.trim() : '';
  return srCore || srCtx || '';
}

function synthesize(cards: TarotCardDraw[], contextFocus: string): string {
  if (cards.some((c) => (c?.symbols?.system || '').toString().toLowerCase() === 'bota')) {
    const items = cards
      .map((draw) => {
        const identity = resolveBotaIdentity({
          id: draw.card?.id,
          name: draw.card?.name || null,
          nameSpanish: draw.card?.nameSpanish || null,
          symbols: draw.symbols,
          imageUrl: draw.card?.imageUrl || null,
        });
        if (!identity) return null;
        return {
          identity,
          positionLabel: (draw.position?.nameSpanish || draw.position?.label || draw.position?.id || '').toString(),
        };
      })
      .filter(Boolean) as Array<{ identity: any; positionLabel: string }>;

    return buildBotaSynthesis(items) || '';
  }
  const focus = contextFocus || 'general';
  const parts = cards.slice(0, 3).map((draw) => {
    const pos = positionDisplayName(draw) || 'Posición';
    const name = cardDisplayName(draw) || 'Carta';
    const kws = drawKeywords(draw).slice(0, 2);
    const kwText = kws.length ? ` (${kws.join(' · ')})` : '';
    const orientation = draw.reversed ? 'invertida' : 'derecha';
    return `${pos}: ${name} (${orientation})${kwText}`;
  });
  if (!parts.length) return '';
  return `El conjunto de cartas organiza un relato simbólico por posiciones (${focus}), destacando tensiones y continuidades observables. ${parts.join(' / ')}.`;
}

export default function TarotDrawPanel(props: {
  consultantId?: string | null;
  systemId?: string;
  onSystemChange?: (systemId: string) => void;
  useBotaSvg?: boolean;
}) {
  const [systemIdState, setSystemIdState] = useState<string>('thoth');
  const systemId = props.systemId ?? systemIdState;
  const setSystemId = (next: string) => {
    setSystemIdState(next);
    props.onSystemChange?.(next);
  };
  const [spreadId, setSpreadId] = useState<string>('simple');
  const [intention, setIntention] = useState<string>('');
  const [contextFocus, setContextFocus] = useState<string>('general');

  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reading, setReading] = useState<SymbolicReading | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCardDraw | null>(null);

  const systemLabel = useMemo(() => SYSTEMS.find((s) => s.id === systemId)?.label ?? systemId, [systemId]);

  const handleRun = async () => {
    setError(null);

    if (!consent) {
      setShowConsent(true);
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/swm-v3/symbolic-readings/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          system_id: systemId,
          reading_type: 'educational',
          selected_cards: [],
          consent_mode: consent.mode,
          spread_type: spreadId,
          context_focus: contextFocus,
          intention,
          consultant_id: consent.mode === 'store_with_consent' ? props.consultantId ?? null : null,
          ...(consent.mode === 'no_store'
            ? {}
            : {
                consent: {
                  explicit_opt_in: true,
                  version: consent.version,
                  accepted_at: consent.acceptedAt,
                },
              }),
        }),
      });

      const json = (await response.json().catch(() => null)) as SwmV3ApiResponse | null;
      if (!response.ok || !json) {
        setError('No se pudo ejecutar la lectura.');
        return;
      }
      if (!json.success) {
        setError(json.error || 'No se pudo ejecutar la lectura.');
        return;
      }

      const payload = json.payload && typeof json.payload === 'object' ? json.payload : null;
      const cardsRaw = Array.isArray(payload?.cards) ? payload.cards : [];
      const draws: TarotCardDraw[] = cardsRaw
        .filter((c: any) => c && typeof c === 'object')
        .map((c: any, index: number) => ({
          id: safeString(c.draw_id) || safeString(c.id) || `draw-${index + 1}`,
          position: c.position && typeof c.position === 'object' ? (c.position as any) : null,
          reversed: Boolean(c.reversed),
          card: {
            id: safeString(c.id) || `card-${index + 1}`,
            nameSpanish: safeString(c.symbols?.nameSpanish) || safeString(c.nameSpanish) || safeString(c.name) || undefined,
            name: safeString(c.name) || undefined,
            imageUrl: safeString(c.imageUrl) || safeString(c.image_url) || undefined,
            keywords: safeStringArray(c.symbols?.keywords).length
              ? safeStringArray(c.symbols?.keywords)
              : safeStringArray(c.keywords).length
                ? safeStringArray(c.keywords)
                : safeStringArray(c.tags),
            keywordsReversed: safeStringArray(c.symbols?.keywordsReversed).length
              ? safeStringArray(c.symbols?.keywordsReversed)
              : safeStringArray(c.keywordsReversed),
          },
          symbols: c.symbols && typeof c.symbols === 'object' ? c.symbols : null,
          symbolic_reading: c.symbolic_reading && typeof c.symbolic_reading === 'object' ? c.symbolic_reading : null,
        }));

      const nextReading: SymbolicReading = {
        system: { id: systemId, label: systemLabel },
        spread: buildSpread(spreadId, draws),
        cards: draws,
      };

      setReading(nextReading);
      setSelectedCard(draws[0] ?? null);
    } catch (e: any) {
      setError(e?.message || 'Error inesperado al ejecutar la lectura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tarot (SWM v3)</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">Tirada simbólica</div>
          <div className="mt-1 text-xs text-slate-600">
            Backend decide el payload. Frontend solo visualiza.
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <div>
            <label className="block text-xs font-medium text-slate-700">Sistema simbólico</label>
            <select
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {SYSTEMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Spread</label>
            <select
              value={spreadId}
              onChange={(e) => setSpreadId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {SPREADS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameSpanish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Contexto</label>
            <select
              value={contextFocus}
              onChange={(e) => setContextFocus(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {CONTEXTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Intención (no se almacena como texto libre)</label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Describe el foco de observación (opcional)"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? 'Ejecutando…' : consent ? 'Ejecutar lectura' : 'Configurar consentimiento'}
            </button>
            {consent ? (
              <button
                type="button"
                onClick={() => setShowConsent(true)}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
              >
                Cambiar consentimiento
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          ) : null}
        </div>

        <div className="space-y-3 lg:col-span-2">
          <TarotSpreadView
            spread={reading?.spread ?? null}
            systemId={systemId}
            useBotaSvg={props.useBotaSvg}
            cards={reading?.cards ?? []}
            selectedCardDrawId={selectedCard?.id ?? null}
            onSelectCard={(draw) => setSelectedCard(draw)}
          />

          <SymbolicReadingPanel
            systemLabel={systemLabel}
            selectedCard={selectedCard}
            contextFocus={contextFocus}
          />

          {reading?.cards?.length ? (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Interpretación por posición
              </div>
              <div className="mt-3 space-y-3">
                {reading.cards.map((draw) => {
                  const pos = positionDisplayName(draw) || 'Posición';
                  const name = cardDisplayName(draw) || draw.card.id;
                  const text = drawText(draw, contextFocus) || READING_FALLBACK_TEXT;
                  const kws = drawKeywords(draw);
                  return (
                    <div key={draw.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900">
                          {pos}: {name}
                        </div>
                        <div className="text-xs text-slate-600">{draw.reversed ? 'Invertida' : 'Derecha'}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-700">{text}</div>
                      {kws.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {kws.slice(0, 12).map((kw) => (
                            <span
                              key={kw}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
                <div className="text-xs font-medium text-slate-700">Síntesis simbólica</div>
                <div className="mt-1 text-sm text-slate-700">{synthesize(reading.cards, contextFocus)}</div>
                <div className="mt-2 text-xs text-slate-600">
                  Lectura simbólica descriptiva. No contiene conclusiones ni recomendaciones.
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <ConsentModal
        open={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={(c) => {
          setConsent({ mode: c.mode, acceptedAt: c.acceptedAt, version: c.version });
          setShowConsent(false);
        }}
      />
    </section>
  );
}
