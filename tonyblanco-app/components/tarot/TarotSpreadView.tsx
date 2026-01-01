'use client';

import clsx from 'clsx';
import TarotCardView, { type TarotCardViewCard } from './TarotCardView';

export type TarotSpreadPosition = {
  id: string;
  nameSpanish?: string | null;
  label?: string | null;
};

export type TarotSpread = {
  id: string;
  nameSpanish?: string | null;
  positions: TarotSpreadPosition[];
};

export type TarotCardDraw = {
  id: string;
  position?: TarotSpreadPosition | null;
  reversed?: boolean;
  card: TarotCardViewCard;
  symbolic_reading?: any;
};

type Props = {
  spread?: TarotSpread | null;
  cards: TarotCardDraw[];
  selectedCardDrawId?: string | null;
  onSelectCard?: (draw: TarotCardDraw) => void;
};

function gridCols(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (count <= 6) return 'grid-cols-1 sm:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

export default function TarotSpreadView({ spread, cards, selectedCardDrawId, onSelectCard }: Props) {
  const positions = Array.isArray(spread?.positions) ? spread!.positions : [];
  const title = (spread?.nameSpanish || spread?.id || '').trim() || 'Tirada';
  const count = Math.max(cards.length, positions.length);

  const items: Array<{ key: string; position: TarotSpreadPosition | null; draw: TarotCardDraw | null }> = [];
  const byPositionId = new Map<string, TarotCardDraw>();
  for (const draw of cards) {
    if (draw?.position?.id) byPositionId.set(draw.position.id, draw);
  }

  for (let index = 0; index < count; index++) {
    const position = positions[index] ?? null;
    const draw = position?.id ? byPositionId.get(position.id) ?? cards[index] ?? null : cards[index] ?? null;
    items.push({ key: `${position?.id ?? 'pos'}-${draw?.id ?? index}`, position, draw });
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        No hay cartas para renderizar.
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Spread</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">{title}</div>
        </div>
        <div className="text-[11px] text-slate-500">{items.length} carta(s)</div>
      </div>

      <div className={clsx('mt-3 grid gap-3', gridCols(items.length))}>
        {items.map((item, index) => {
          const posLabel =
            (item.position?.nameSpanish || item.position?.label || item.position?.id || '').trim() ||
            'Posición (no definida)';
          const draw = item.draw;

          return (
            <div key={item.key} className="space-y-2">
              <div className="text-xs font-medium text-slate-700">
                {posLabel}
                <span className="ml-2 text-[11px] text-slate-400">#{index + 1}</span>
              </div>

              {draw ? (
                <TarotCardView
                  card={draw.card}
                  reversed={Boolean(draw.reversed)}
                  selected={draw.id === selectedCardDrawId}
                  onSelect={() => onSelectCard?.(draw)}
                />
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Este sistema aún no define una carta para esta posición.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
