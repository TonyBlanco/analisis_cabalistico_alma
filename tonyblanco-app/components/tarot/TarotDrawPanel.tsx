'use client';

import { useMemo, useState } from 'react';
import ConsentModal, { type SwmV3ConsentMode } from '@/components/SWMV3/ConsentModal';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import TarotSpreadView, { type TarotCardDraw, type TarotSpread, type TarotSpreadPosition } from './TarotSpreadView';
import SymbolicReadingPanel from './SymbolicReadingPanel';

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

export default function TarotDrawPanel(props: { consultantId?: string | null }) {
  const [systemId, setSystemId] = useState<string>('thoth');
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
            nameSpanish: safeString(c.nameSpanish) || safeString(c.name) || undefined,
            name: safeString(c.name) || undefined,
            imageUrl: safeString(c.imageUrl) || safeString(c.image_url) || undefined,
            keywords: safeStringArray(c.keywords).length ? safeStringArray(c.keywords) : safeStringArray(c.tags),
          },
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
            cards={reading?.cards ?? []}
            selectedCardDrawId={selectedCard?.id ?? null}
            onSelectCard={(draw) => setSelectedCard(draw)}
          />

          <SymbolicReadingPanel
            systemLabel={systemLabel}
            selectedCard={selectedCard}
          />
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
