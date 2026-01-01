'use client';

import clsx from 'clsx';

export type TarotCardViewCard = {
  id: string;
  nameSpanish?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  keywords?: string[] | null;
};

type Props = {
  card: TarotCardViewCard;
  reversed?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export default function TarotCardView({ card, reversed = false, selected = false, onSelect }: Props) {
  const label = (card.nameSpanish || card.name || card.id || '').trim() || 'Carta';
  const keywords = Array.isArray(card.keywords) ? card.keywords.filter(Boolean) : [];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full rounded-lg border bg-white p-3 text-left shadow-sm transition-colors',
        'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300',
        selected ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-slate-200',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt={label}
              className={clsx('h-full w-full object-cover transition-transform', reversed && 'rotate-180')}
            />
          ) : (
            <div className={clsx('flex h-full w-full items-center justify-center text-[10px] text-slate-500', reversed && 'rotate-180')}>
              Sin imagen
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold text-slate-900">{label}</div>
            {reversed ? (
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                Invertida
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Derecha
              </span>
            )}
          </div>

          {keywords.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {keywords.slice(0, 10).map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[11px] text-slate-500">Sin keywords</div>
          )}
        </div>
      </div>
    </button>
  );
}

