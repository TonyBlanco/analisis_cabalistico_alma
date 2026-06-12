'use client';

import clsx from 'clsx';
import type { TarotCardDraw, TarotSpreadPosition } from './TarotSpreadView';
import TarotCardView from './TarotCardView';
import BotaTarotCardSVG, { type BotaTarotCardData } from './bota/BotaTarotCardSVG';

/** Canonical Tree of Life node positions (grid coordinates). */
const TREE_NODES: Array<{ id: string; row: number; col: number }> = [
  { id: 'keter', row: 0, col: 2 },
  { id: 'chokmah', row: 1, col: 1 },
  { id: 'binah', row: 1, col: 3 },
  { id: 'chesed', row: 2, col: 0 },
  { id: 'gevurah', row: 2, col: 4 },
  { id: 'tiferet', row: 2, col: 2 },
  { id: 'netzach', row: 3, col: 1 },
  { id: 'hod', row: 3, col: 3 },
  { id: 'yesod', row: 4, col: 2 },
  { id: 'malchut', row: 5, col: 2 },
];

const TREE_PATHS: Array<[string, string]> = [
  ['keter', 'chokmah'],
  ['keter', 'binah'],
  ['chokmah', 'binah'],
  ['chokmah', 'chesed'],
  ['binah', 'gevurah'],
  ['chesed', 'gevurah'],
  ['chesed', 'tiferet'],
  ['gevurah', 'tiferet'],
  ['keter', 'tiferet'],
  ['tiferet', 'netzach'],
  ['tiferet', 'hod'],
  ['netzach', 'hod'],
  ['netzach', 'yesod'],
  ['hod', 'yesod'],
  ['yesod', 'malchut'],
];

const ORDERED_SEFIROT = TREE_NODES.map((n) => n.id);

type Props = {
  title: string;
  cards: TarotCardDraw[];
  systemId?: string | null;
  useBotaSvg?: boolean;
  selectedCardDrawId?: string | null;
  onSelectCard?: (draw: TarotCardDraw) => void;
  mapBotaCard: (draw: TarotCardDraw) => BotaTarotCardData;
  getBotaMajorPngSrc: (draw: TarotCardDraw) => string | null;
};

function positionLabel(position: TarotSpreadPosition | null | undefined): string {
  return (
    (position?.nameSpanish || position?.label || position?.id || '').trim() || 'Sefirá'
  );
}

function cardLabel(draw: TarotCardDraw): string {
  const symbols = draw.symbols && typeof draw.symbols === 'object' ? draw.symbols : null;
  const fromSymbols =
    symbols && typeof (symbols as { nameSpanish?: string }).nameSpanish === 'string'
      ? (symbols as { nameSpanish: string }).nameSpanish
      : null;
  return (fromSymbols || draw.card?.nameSpanish || draw.card?.name || draw.card?.id || '').trim();
}

function TreeCardTile({
  draw,
  position,
  isBota,
  useBotaSvg,
  selected,
  onSelect,
  mapBotaCard,
  getBotaMajorPngSrc,
  compact = false,
}: {
  draw: TarotCardDraw;
  position: TarotSpreadPosition | null;
  isBota: boolean;
  useBotaSvg?: boolean;
  selected: boolean;
  onSelect?: () => void;
  mapBotaCard: (draw: TarotCardDraw) => BotaTarotCardData;
  getBotaMajorPngSrc: (draw: TarotCardDraw) => string | null;
  compact?: boolean;
}) {
  const sefira = positionLabel(position);
  const name = cardLabel(draw) || 'Carta';
  const botaPngSrc = isBota ? getBotaMajorPngSrc(draw) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'group flex w-full flex-col items-center gap-2 rounded-xl border bg-[#14141F] p-2 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow,transform] duration-150',
        'hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]',
        selected
          ? 'border-[#D4AF37] ring-2 ring-[rgba(212,175,55,0.25)]'
          : 'border-[rgba(212,175,55,0.28)]',
        compact ? 'max-w-[140px]' : 'max-w-[132px]',
      )}
      aria-label={`${sefira}: ${name}${draw.reversed ? ', invertida' : ''}`}
    >
      <div className="w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">{sefira}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-[#F4F1E8]">{name}</p>
      </div>

      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-lg border border-[rgba(212,175,55,0.22)] bg-[#0C0C16] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          compact ? 'aspect-[2/3] max-h-[168px]' : 'aspect-[2/3]',
        )}
      >
        {isBota && useBotaSvg ? (
          botaPngSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={botaPngSrc}
              alt={name}
              className={clsx(
                'h-full w-full object-contain',
                draw.reversed && 'rotate-180',
              )}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <BotaTarotCardSVG card={mapBotaCard(draw)} reversed={Boolean(draw.reversed)} />
          )
        ) : draw.card?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draw.card.imageUrl}
            alt={name}
            className={clsx('h-full w-full object-cover', draw.reversed && 'rotate-180')}
            loading="lazy"
          />
        ) : (
          <div
            className={clsx(
              'flex h-full w-full items-center justify-center px-2 text-[10px] text-[#A9A698]',
              draw.reversed && 'rotate-180',
            )}
          >
            {name}
          </div>
        )}
        {draw.reversed ? (
          <span className="absolute bottom-1 right-1 rounded-full border border-[rgba(251,191,36,0.45)] bg-[rgba(23,18,4,0.82)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#F3C14B]">
            Invertida
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function TreeOfLifeSpreadLayout({
  title,
  cards,
  systemId,
  useBotaSvg,
  selectedCardDrawId,
  onSelectCard,
  mapBotaCard,
  getBotaMajorPngSrc,
}: Props) {
  const byPositionId = new Map<string, TarotCardDraw>();
  for (const draw of cards) {
    if (draw?.position?.id) byPositionId.set(draw.position.id, draw);
  }

  const isBota = Boolean(useBotaSvg) || (systemId || '').toLowerCase() === 'bota';

  const nodeCenters: Record<string, { x: number; y: number }> = {};
  const cols = 5;
  const rows = 6;
  for (const node of TREE_NODES) {
    nodeCenters[node.id] = {
      x: ((node.col + 0.5) / cols) * 100,
      y: ((node.row + 0.5) / rows) * 100,
    };
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[rgba(212,175,55,0.18)] bg-[#07070C] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
            Tirada del Árbol
          </div>
          <div className="mt-0.5 text-sm font-semibold text-[#F4F1E8]">{title}</div>
        </div>
        <div className="text-[11px] text-[#A9A698]">{cards.length} cartas</div>
      </div>

      {/* Desktop / tablet: geometric tree */}
      <div className="relative mt-4 hidden min-h-[620px] md:block">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {TREE_PATHS.map(([from, to]) => {
            const a = nodeCenters[from];
            const b = nodeCenters[to];
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(212,175,55,0.22)"
                strokeWidth="0.35"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div
          className="relative grid h-full w-full gap-y-3"
          style={{
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(6, minmax(88px, auto))',
          }}
        >
          {TREE_NODES.map((node) => {
            const draw = byPositionId.get(node.id) ?? null;
            const position = draw?.position ?? { id: node.id, nameSpanish: node.id };
            return (
              <div
                key={node.id}
                className="flex items-center justify-center px-1"
                style={{ gridColumn: node.col + 1, gridRow: node.row + 1 }}
              >
                {draw ? (
                  <TreeCardTile
                    draw={draw}
                    position={position}
                    isBota={isBota}
                    useBotaSvg={useBotaSvg}
                    selected={draw.id === selectedCardDrawId}
                    onSelect={() => onSelectCard?.(draw)}
                    mapBotaCard={mapBotaCard}
                    getBotaMajorPngSrc={getBotaMajorPngSrc}
                  />
                ) : (
                  <div className="flex h-[120px] w-full max-w-[120px] items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.12)] text-[10px] text-[#71705F]">
                    {positionLabel(position)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: ordered list */}
      <ol className="mt-4 space-y-3 md:hidden">
        {ORDERED_SEFIROT.map((sefiraId, index) => {
          const draw = byPositionId.get(sefiraId) ?? cards[index] ?? null;
          const position = draw?.position ?? { id: sefiraId };
          return (
            <li key={sefiraId} className="flex items-start gap-3">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.35)] text-[11px] font-semibold text-[#D4AF37]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {draw ? (
                  <TreeCardTile
                    draw={draw}
                    position={position}
                    isBota={isBota}
                    useBotaSvg={useBotaSvg}
                    selected={draw.id === selectedCardDrawId}
                    onSelect={() => onSelectCard?.(draw)}
                    mapBotaCard={mapBotaCard}
                    getBotaMajorPngSrc={getBotaMajorPngSrc}
                    compact
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.12)] px-3 py-4 text-xs text-[#A9A698]">
                    {positionLabel(position)} — sin carta
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Accessible compact list for keyboard users on large screens (visually hidden) */}
      <div className="sr-only">
        {ORDERED_SEFIROT.map((sefiraId) => {
          const draw = byPositionId.get(sefiraId);
          if (!draw) return null;
          return (
            <TarotCardView
              key={`sr-${sefiraId}`}
              card={draw.card}
              reversed={Boolean(draw.reversed)}
              selected={draw.id === selectedCardDrawId}
              onSelect={() => onSelectCard?.(draw)}
            />
          );
        })}
      </div>
    </section>
  );
}