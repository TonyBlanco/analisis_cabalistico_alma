'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TarotCardDraw } from './TarotSpreadView';
import { resolveBotaIdentity, buildBotaPositionMeaning, getBotaVisualStructure } from '@holistica/symbolic/tarot/bota';

type Props = {
  systemLabel?: string | null;
  selectedCard?: TarotCardDraw | null;
  contextFocus?: string | null;
};

const FIELD_FALLBACK = 'Campo simbólico no disponible para esta carta.';
const CARD_FALLBACK = 'Selecciona una carta para ver su lectura simbólica.';

type BotaPositionDefinition = {
  label: string;
  definition: string;
  scope: string;
};

type BotaPositionsOntology = Record<string, BotaPositionDefinition>;

function line(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v || FIELD_FALLBACK;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^(\d{1,2}_)+/, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function botaPositionKey(selectedCard: TarotCardDraw | null | undefined): string | null {
  const id = (selectedCard?.position?.id || '').toString().trim().toLowerCase();
  if (id === 'origin') return 'origen';
  if (id === 'present') return 'presente';
  if (id === 'direction') return 'direccion';

  const label = (selectedCard?.position?.nameSpanish || selectedCard?.position?.label || '').toString();
  const normalized = normalizeKey(label);
  if (!normalized) return null;
  if (normalized.includes('origen')) return 'origen';
  if (normalized.includes('presente') || normalized.includes('estado_actual')) return 'presente';
  if (normalized.includes('direccion') || normalized.includes('direccion')) return 'direccion';
  return null;
}

function extractSelectedReading(selectedCard: TarotCardDraw | null | undefined): {
  positionLabel: string;
  core: string | null;
  contextual: string | null;
  context: string | null;
  positionMeaning: string | null;
  systemFrame: string | null;
} {
  const pos = selectedCard?.position;
  const positionLabel = (pos?.nameSpanish || pos?.label || pos?.id || '').trim();

  const srContainer = selectedCard?.symbolic_reading;
  const sr = srContainer && typeof srContainer === 'object' ? (srContainer as any).symbolic_reading : null;
  return {
    positionLabel,
    core: sr && typeof sr.core_meaning === 'string' ? sr.core_meaning : null,
    contextual: sr && typeof sr.contextual_meaning === 'string' ? sr.contextual_meaning : null,
    context: sr && typeof sr.context_meaning === 'string' ? sr.context_meaning : null,
    positionMeaning: sr && typeof sr.position_meaning === 'string' ? sr.position_meaning : null,
    systemFrame: sr && typeof sr.system_frame === 'string' ? sr.system_frame : null,
  };
}

export default function SymbolicReadingPanel({ systemLabel, selectedCard, contextFocus }: Props) {
  const cardName = (selectedCard?.card?.nameSpanish || selectedCard?.card?.name || '').trim();
  const extracted = extractSelectedReading(selectedCard);
  const symbols = selectedCard?.symbols && typeof selectedCard.symbols === 'object' ? (selectedCard.symbols as any) : null;
  
  // NEW: Extract kabbalistic_details from card
  const kabbalah = (selectedCard as any)?.kabbalistic_details && typeof (selectedCard as any).kabbalistic_details === 'object'
    ? ((selectedCard as any).kabbalistic_details as any)
    : null;
  
  const systemId = (symbols?.system || '').toString().toLowerCase();
  const isBota = systemId === 'bota' || (systemLabel || '').toLowerCase().includes('b.o.t.a');
  const orientationKey = selectedCard?.reversed ? 'reversed' : 'upright';
  const focusKey = (typeof contextFocus === 'string' && contextFocus.trim()) ? contextFocus.trim() : 'general';
  const symbolTexts = symbols && typeof symbols[orientationKey] === 'object' ? (symbols[orientationKey] as any) : null;
  const textByContext =
    symbolTexts && typeof symbolTexts[focusKey] === 'string' && symbolTexts[focusKey].trim()
      ? symbolTexts[focusKey].trim()
      : symbolTexts && typeof symbolTexts.general === 'string' && symbolTexts.general.trim()
        ? symbolTexts.general.trim()
        : null;

  const symbolKeywordsRaw =
    symbols && (selectedCard?.reversed ? symbols.keywordsReversed : symbols.keywords);
  const keywords =
    Array.isArray(symbolKeywordsRaw)
      ? symbolKeywordsRaw.filter(Boolean)
      : Array.isArray(selectedCard?.card?.keywords)
        ? selectedCard!.card!.keywords!.filter(Boolean)
        : [];

  const [botaMode, setBotaMode] = useState<'structural' | 'educational'>('structural');
  const [positionsOntology, setPositionsOntology] = useState<BotaPositionsOntology | null>(null);
  const [editorialText, setEditorialText] = useState<string | null>(null);

  const positionKey = useMemo(() => (isBota ? botaPositionKey(selectedCard) : null), [isBota, selectedCard]);
  const positionDefinition = useMemo(() => {
    if (!isBota || !positionKey || !positionsOntology) return null;
    return positionsOntology[positionKey] ?? null;
  }, [isBota, positionKey, positionsOntology]);

  const botaIdentity = useMemo(() => {
    if (!isBota || !selectedCard) return null;
    return resolveBotaIdentity({
      id: selectedCard.card?.id,
      name: selectedCard.card?.name || null,
      nameSpanish: selectedCard.card?.nameSpanish || null,
      symbols: selectedCard.symbols,
      imageUrl: selectedCard.card?.imageUrl || null,
    });
  }, [isBota, selectedCard]);

  const botaVisual = useMemo(() => {
    if (!isBota || !botaIdentity?.id) return null;
    return getBotaVisualStructure(botaIdentity.id);
  }, [isBota, botaIdentity?.id]);

  const botaConsciousnessLine = useMemo(() => {
    if (!isBota || !botaIdentity?.consciousness) return null;
    const { power, aspect, humanFaculty } = botaIdentity.consciousness;
    const parts: string[] = [];
    if (power) parts.push(`Poder: ${power}`);
    if (aspect) parts.push(`Aspecto: ${aspect}`);
    if (humanFaculty) parts.push(`Facultad humana: ${humanFaculty}`);
    return parts.length ? parts.join(' · ') : null;
  }, [isBota, botaIdentity?.consciousness]);

  const botaMainText = useMemo(() => {
    if (!isBota || !botaIdentity) return null;
    const parts: string[] = [];
    if (botaIdentity.hebrewLetter) parts.push(`Letra: ${botaIdentity.hebrewLetter}`);
    if (typeof botaIdentity.path === 'number') parts.push(`Sendero: ${botaIdentity.path}`);
    if (botaIdentity.sefirot?.length) {
      const s = botaIdentity.sefirot;
      parts.push(`Sefirot: ${s.length >= 2 ? `${s[0]}–${s[1]}` : s[0]}`);
    }
    if (botaIdentity.cabalisticIntelligence) parts.push(`Inteligencia: ${botaIdentity.cabalisticIntelligence}`);
    return parts.length ? parts.join(' · ') : null;
  }, [isBota, botaIdentity]);

  const botaPositionMeaning = useMemo(() => {
    if (!isBota || !selectedCard || !botaIdentity) return null;
    return buildBotaPositionMeaning({
      identity: botaIdentity,
      positionId: selectedCard.position?.id ?? null,
      positionLabel: (selectedCard.position?.nameSpanish || selectedCard.position?.label || null) as string | null,
    });
  }, [isBota, selectedCard, botaIdentity]);

  const hasAnyReading = useMemo(() => {
    return (
      Boolean(textByContext) ||
      Boolean(extracted.core?.trim()) ||
      Boolean(extracted.context?.trim()) ||
      Boolean(extracted.contextual?.trim()) ||
      Boolean(extracted.positionMeaning?.trim()) ||
      Boolean(extracted.systemFrame?.trim()) ||
      (isBota && Boolean(botaConsciousnessLine || botaMainText || botaPositionMeaning))
    );
  }, [
    textByContext,
    extracted.core,
    extracted.context,
    extracted.contextual,
    extracted.positionMeaning,
    extracted.systemFrame,
    isBota,
    botaConsciousnessLine,
    botaMainText,
    botaPositionMeaning,
  ]);

  const editorialKey = useMemo(() => {
    if (!isBota) return null;
    const name = (typeof symbols?.nameSpanish === 'string' && symbols.nameSpanish.trim())
      ? symbols.nameSpanish.trim()
      : cardName;
    const normalized = normalizeKey(name);
    return normalized ? normalized : null;
  }, [isBota, symbols, cardName]);

  useEffect(() => {
    if (!isBota) return;

    let cancelled = false;

    const loadPositions = async () => {
      if (positionsOntology) return;
      const res = await fetch('/docs/bota/positions/bota_positions.json', { cache: 'force-cache' }).catch(() => null);
      if (!res || !res.ok) return;
      const json = (await res.json().catch(() => null)) as unknown;
      if (!json || typeof json !== 'object') return;
      if (!cancelled) setPositionsOntology(json as BotaPositionsOntology);
    };

    loadPositions();

    return () => {
      cancelled = true;
    };
  }, [isBota, positionsOntology]);

  useEffect(() => {
    if (!isBota) return;
    if (botaMode !== 'educational') {
      setEditorialText(null);
      return;
    }
    if (!editorialKey) return;

    let cancelled = false;

    const loadEditorial = async () => {
      const res = await fetch(`/docs/bota/editorial/${editorialKey}.md`, { cache: 'force-cache' }).catch(() => null);
      if (!res || !res.ok) {
        if (!cancelled) setEditorialText(null);
        return;
      }
      const txt = await res.text().catch(() => '');
      const cleaned = (txt || '').trim();
      if (!cancelled) setEditorialText(cleaned || null);
    };

    loadEditorial();

    return () => {
      cancelled = true;
    };
  }, [isBota, botaMode, editorialKey]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lectura simbólica</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">
            {systemLabel?.trim() || 'Sistema simbólico'}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Lectura simbólica descriptiva. No diagnóstica.
          </div>
        </div>
        {isBota ? (
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setBotaMode('structural')}
                className={`rounded px-2 py-1 font-medium ${botaMode === 'structural' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
              >
                Vista estructural
              </button>
              <button
                type="button"
                onClick={() => setBotaMode('educational')}
                className={`rounded px-2 py-1 font-medium ${botaMode === 'educational' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
              >
                Vista educativa
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-700">Carta seleccionada</div>
          <div className="mt-1 text-sm text-slate-900">{cardName || FIELD_FALLBACK}</div>
          {extracted.positionLabel ? (
            <div className="mt-1 text-xs text-slate-600">Posición: {extracted.positionLabel}</div>
          ) : null}
          {selectedCard ? (
            <div className="mt-1 text-xs text-slate-600">
              Orientación: {selectedCard.reversed ? 'Invertida' : 'Derecha'}
            </div>
          ) : null}
        </div>

        {!selectedCard ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{CARD_FALLBACK}</div>
        ) : null}

        {selectedCard && !hasAnyReading ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{CARD_FALLBACK}</div>
        ) : null}

        {isBota && selectedCard && botaMode === 'structural' ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="text-xs font-medium text-slate-700">Estructura B.O.T.A.</div>
            {botaVisual ? (
              <div className="mt-2 space-y-2">
                <img
                  src={botaVisual.imagePath}
                  alt={`Estructura B.O.T.A. — ${cardName || 'carta'}`}
                  className="w-full max-w-xl rounded-md border border-slate-200 bg-white"
                />
                {botaVisual.sefirot.length ? (
                  <div className="text-xs text-slate-600">
                    Sefirot activas:{' '}
                    <span className="font-medium text-slate-900">{botaVisual.sefirot.join(' · ')}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="mt-2 text-sm text-slate-700">{botaConsciousnessLine ?? '—'}</div>
          </div>
        ) : null}

        {isBota && selectedCard && botaMode === 'educational' ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="text-xs font-medium text-slate-700">Definición de la posición</div>
            {positionDefinition ? (
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div className="text-sm font-semibold text-slate-900">{positionDefinition.label}</div>
                <div>{positionDefinition.definition}</div>
                <div className="text-xs text-slate-500">Alcance: {positionDefinition.scope}</div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-slate-700">—</div>
            )}
          </div>
        ) : null}

        {isBota && selectedCard && botaMode === 'educational' && botaPositionMeaning ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="text-xs font-medium text-slate-700">Significado por posición (B.O.T.A.)</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{botaPositionMeaning}</div>
          </div>
        ) : null}

        {isBota && selectedCard && botaMode === 'educational' && editorialText ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="text-xs font-medium text-slate-700">Texto educativo (B.O.T.A.)</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{editorialText}</div>
          </div>
        ) : null}

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Marco simbólico del sistema</div>
          <div className="mt-1 text-sm text-slate-700">{line(extracted.systemFrame)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Texto principal</div>
          <div className="mt-1 text-sm text-slate-700">
            {isBota ? (botaMainText ?? '—') : (textByContext ? textByContext : line(extracted.core))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Contexto aplicado</div>
          <div className="mt-1 text-sm text-slate-700">
            {isBota ? (botaPositionMeaning ?? '—') : line(extracted.context || extracted.contextual)}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Significado de la posición</div>
          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {isBota && positionDefinition
              ? `${positionDefinition.label}: ${positionDefinition.definition}\nEnfoque: ${positionDefinition.scope}.`
              : isBota
                ? '—'
                : line(extracted.positionMeaning)}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Keywords</div>
          {keywords.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {keywords.slice(0, 12).map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-sm text-slate-700">{isBota ? '—' : FIELD_FALLBACK}</div>
          )}
        </div>

        {/* Kabbalistic Data Section */}
        {kabbalah && (
          <div className="rounded-md border border-purple-200 bg-purple-50 p-3">
            <div className="text-xs font-medium text-purple-900">Datos Cabalísticos</div>
            <div className="mt-2 grid gap-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg text-purple-700">{kabbalah.hebrew_letter || '-'}</span>
                <span className="text-xs text-slate-600">{kabbalah.letter_name || '-'}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-700">Gematria:</span> {kabbalah.gematria ?? '-'}
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-700">Sendero:</span> {kabbalah.path ?? '-'}
              </div>
              {kabbalah.sefirot && Array.isArray(kabbalah.sefirot) && kabbalah.sefirot.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-slate-700">Sefirot:</span> {kabbalah.sefirot.join(' → ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
