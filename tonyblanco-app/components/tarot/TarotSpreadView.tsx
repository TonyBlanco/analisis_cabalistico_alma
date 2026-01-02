'use client';

import clsx from 'clsx';
import TarotCardView, { type TarotCardViewCard } from './TarotCardView';
import BotaTarotCardSVG, { type BotaTarotCardData } from './bota/BotaTarotCardSVG';

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
  symbols?: any;
  symbolic_reading?: any;
};

type Props = {
  spread?: TarotSpread | null;
  systemId?: string | null;
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

export default function TarotSpreadView({ spread, systemId, cards, selectedCardDrawId, onSelectCard }: Props) {
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
          const isBota = (systemId || '').toLowerCase() === 'bota';

          return (
            <div key={item.key} className="space-y-2">
              <div className="text-xs font-medium text-slate-700">
                {posLabel}
                <span className="ml-2 text-[11px] text-slate-400">#{index + 1}</span>
              </div>

              {draw ? (
                isBota ? (
                  <button
                    type="button"
                    onClick={() => onSelectCard?.(draw)}
                    className={clsx(
                      'w-full rounded-lg border bg-white p-2 text-left shadow-sm transition-colors',
                      'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300',
                      draw.id === selectedCardDrawId
                        ? 'border-emerald-300 ring-2 ring-emerald-200'
                        : 'border-slate-200',
                    )}
                    aria-label={(draw.card.nameSpanish || draw.card.name || draw.card.id || '').toString()}
                  >
                    <div className="aspect-[3/5] w-full overflow-hidden rounded-md">
                      <BotaTarotCardSVG card={mapBotaCard(draw)} reversed={Boolean(draw.reversed)} />
                    </div>
                  </button>
                ) : (
                  <TarotCardView
                    card={draw.card}
                    reversed={Boolean(draw.reversed)}
                    selected={draw.id === selectedCardDrawId}
                    onSelect={() => onSelectCard?.(draw)}
                  />
                )
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

function mapBotaCard(draw: TarotCardDraw): BotaTarotCardData {
  const symbols = draw.symbols && typeof draw.symbols === 'object' ? (draw.symbols as any) : null;
  const kabbalistic =
    symbols?.kabbalistic && typeof symbols.kabbalistic === 'object' ? symbols.kabbalistic : null;
  const colors = kabbalistic?.colors && typeof kabbalistic.colors === 'object' ? kabbalistic.colors : null;

  return {
    id: String(draw.card?.id ?? draw.id),
    name:
      typeof symbols?.nameSpanish === 'string' && symbols.nameSpanish.trim()
        ? symbols.nameSpanish.trim()
        : (draw.card?.nameSpanish || draw.card?.name || draw.card?.id || '').toString(),
    hebrewLetter: typeof kabbalistic?.hebrewLetter === 'string' ? kabbalistic.hebrewLetter : null,
    letterValue: typeof kabbalistic?.letterValue === 'number' ? kabbalistic.letterValue : null,
    path: kabbalistic?.path ?? null,
    sefirot: Array.isArray(kabbalistic?.sefirot) ? kabbalistic.sefirot.join(', ') : null,
    element: typeof kabbalistic?.element === 'string' ? kabbalistic.element : null,
    planet: typeof kabbalistic?.planet === 'string' ? kabbalistic.planet : null,
    sign: typeof kabbalistic?.sign === 'string' ? kabbalistic.sign : null,
    decan: typeof kabbalistic?.decan === 'string' ? kabbalistic.decan : null,
    colors: colors
      ? {
          king: typeof colors.king === 'string' ? colors.king : null,
          queen: typeof colors.queen === 'string' ? colors.queen : null,
          emperor: typeof colors.emperor === 'string' ? colors.emperor : null,
          empress: typeof colors.empress === 'string' ? colors.empress : null,
        }
      : null,
  };
}
