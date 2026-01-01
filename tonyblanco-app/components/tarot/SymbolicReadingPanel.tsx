'use client';

import type { TarotCardDraw } from './TarotSpreadView';

type SymbolicReadingText = {
  core_meaning?: string | null;
  contextual_meaning?: string | null;
  position_meaning?: string | null;
  system_frame?: string | null;
};

type Props = {
  systemLabel?: string | null;
  selectedCard?: TarotCardDraw | null;
  reading?: SymbolicReadingText | null;
};

const FALLBACK = 'Este sistema aún no define este campo simbólico.';

function line(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v || FALLBACK;
}

export default function SymbolicReadingPanel({ systemLabel, selectedCard, reading }: Props) {
  const cardName = (selectedCard?.card?.nameSpanish || selectedCard?.card?.name || '').trim();

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
          <div className="mt-1 text-sm text-slate-900">{cardName || FALLBACK}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Marco simbólico del sistema</div>
          <div className="mt-1 text-sm text-slate-700">{line(reading?.system_frame)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Significado central</div>
          <div className="mt-1 text-sm text-slate-700">{line(reading?.core_meaning)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Contexto</div>
          <div className="mt-1 text-sm text-slate-700">{line(reading?.contextual_meaning)}</div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium text-slate-700">Significado de la posición</div>
          <div className="mt-1 text-sm text-slate-700">{line(reading?.position_meaning)}</div>
        </div>
      </div>
    </section>
  );
}

