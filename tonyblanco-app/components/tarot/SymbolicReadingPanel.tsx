'use client';

import type { TarotCardDraw } from './TarotSpreadView';

type Props = {
  systemLabel?: string | null;
  selectedCard?: TarotCardDraw | null;
};

const FIELD_FALLBACK = 'Este sistema aún no define este campo simbólico.';
const CARD_FALLBACK = 'Este sistema aún no define lectura detallada para esta carta.';

function line(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v || FIELD_FALLBACK;
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

export default function SymbolicReadingPanel({ systemLabel, selectedCard }: Props) {
  const cardName = (selectedCard?.card?.nameSpanish || selectedCard?.card?.name || '').trim();
  const keywords = Array.isArray(selectedCard?.card?.keywords) ? selectedCard!.card!.keywords!.filter(Boolean) : [];
  const extracted = extractSelectedReading(selectedCard);
  const hasAnyReading =
    Boolean(extracted.core?.trim()) ||
    Boolean(extracted.context?.trim()) ||
    Boolean(extracted.contextual?.trim()) ||
    Boolean(extracted.positionMeaning?.trim()) ||
    Boolean(extracted.systemFrame?.trim());

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
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-700">Carta seleccionada</div>
          <div className="mt-1 text-sm text-slate-900">{cardName || FIELD_FALLBACK}</div>
          {extracted.positionLabel ? (
            <div className="mt-1 text-xs text-slate-600">Posición: {extracted.positionLabel}</div>
          ) : null}
        </div>

        {!selectedCard ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{CARD_FALLBACK}</div>
        ) : null}

        {selectedCard && !hasAnyReading ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{CARD_FALLBACK}</div>
        ) : null}

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Marco simbólico del sistema</div>
          <div className="mt-1 text-sm text-slate-700">{line(extracted.systemFrame)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Significado central</div>
          <div className="mt-1 text-sm text-slate-700">
            {extracted.core?.includes('Este sistema no define')
              ? CARD_FALLBACK
              : line(extracted.core)}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Contexto aplicado</div>
          <div className="mt-1 text-sm text-slate-700">{line(extracted.context || extracted.contextual)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Significado de la posición</div>
          <div className="mt-1 text-sm text-slate-700">{line(extracted.positionMeaning)}</div>
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
            <div className="mt-1 text-sm text-slate-700">{FIELD_FALLBACK}</div>
          )}
        </div>
      </div>
    </section>
  );
}
