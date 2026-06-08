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
  kabbalistic_details?: Record<string, unknown> | null;
};

type Props = {
  spread?: TarotSpread | null;
  systemId?: string | null;
  useBotaSvg?: boolean;
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

export default function TarotSpreadView({
  spread,
  systemId,
  useBotaSvg,
  cards,
  selectedCardDrawId,
  onSelectCard,
}: Props) {
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
          const isBota = Boolean(useBotaSvg) || (systemId || '').toLowerCase() === 'bota';
          const botaPngSrc = isBota && draw ? getBotaMajorPngSrc(draw) : null;

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
                      {botaPngSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={botaPngSrc}
                          alt={(draw.card.nameSpanish || draw.card.name || draw.card.id || '').toString()}
                          className={clsx(
                            'h-full w-full object-contain bg-white select-none pointer-events-none',
                            Boolean(draw.reversed) && 'rotate-180',
                          )}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <BotaTarotCardSVG card={mapBotaCard(draw)} reversed={Boolean(draw.reversed)} />
                      )}
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

const BOTA_MAJOR_PNG_BY_KEY: Record<string, string> = {
  'el loco': '00_el_loco.png',
  'the fool': '00_el_loco.png',
  '00 el loco': '00_el_loco.png',
  '00 the fool': '00_el_loco.png',
  'el mago': '01_el_mago.png',
  'the magician': '01_el_mago.png',
  '01 el mago': '01_el_mago.png',
  '01 the magician': '01_el_mago.png',
  'la sacerdotisa': '02_la_sacerdotisa.png',
  'the high priestess': '02_la_sacerdotisa.png',
  '02 la sacerdotisa': '02_la_sacerdotisa.png',
  '02 the high priestess': '02_la_sacerdotisa.png',
  'la emperatriz': '03_la_emperatriz.png',
  'the empress': '03_la_emperatriz.png',
  '03 la emperatriz': '03_la_emperatriz.png',
  '03 the empress': '03_la_emperatriz.png',
  'el emperador': '04_el_emperador.png',
  'the emperor': '04_el_emperador.png',
  '04 el emperador': '04_el_emperador.png',
  '04 the emperor': '04_el_emperador.png',
  'el hierofante': '05_el_hierofante.png',
  'the hierophant': '05_el_hierofante.png',
  'the pope': '05_el_hierofante.png',
  '05 el hierofante': '05_el_hierofante.png',
  '05 the hierophant': '05_el_hierofante.png',
  'los amantes': '06_los_amantes.png',
  'the lovers': '06_los_amantes.png',
  '06 los amantes': '06_los_amantes.png',
  '06 the lovers': '06_los_amantes.png',
  'el carro': '07_el_carro.png',
  'the chariot': '07_el_carro.png',
  '07 el carro': '07_el_carro.png',
  '07 the chariot': '07_el_carro.png',
  'la fuerza': '08_la_fuerza.png',
  strength: '08_la_fuerza.png',
  '08 la fuerza': '08_la_fuerza.png',
  '08 strength': '08_la_fuerza.png',
  'el ermitano': '09_el_ermitano.png',
  'the hermit': '09_el_ermitano.png',
  '09 el ermitano': '09_el_ermitano.png',
  '09 the hermit': '09_el_ermitano.png',
  'la rueda': '10_la_rueda.png',
  'wheel of fortune': '10_la_rueda.png',
  '10 la rueda': '10_la_rueda.png',
  '10 wheel of fortune': '10_la_rueda.png',
  'la justicia': '11_la_justicia.png',
  justice: '11_la_justicia.png',
  '11 la justicia': '11_la_justicia.png',
  '11 justice': '11_la_justicia.png',
  'el colgado': '12_el_colgado.png',
  'the hanged man': '12_el_colgado.png',
  '12 el colgado': '12_el_colgado.png',
  '12 the hanged man': '12_el_colgado.png',
  'la muerte': '13_la_muerte.png',
  death: '13_la_muerte.png',
  '13 la muerte': '13_la_muerte.png',
  '13 death': '13_la_muerte.png',
  'la templanza': '14_la_templanza.png',
  temperance: '14_la_templanza.png',
  '14 la templanza': '14_la_templanza.png',
  '14 temperance': '14_la_templanza.png',
  'el diablo': '15_el_diablo.png',
  'the devil': '15_el_diablo.png',
  '15 el diablo': '15_el_diablo.png',
  '15 the devil': '15_el_diablo.png',
  'la torre': '16_la_torre.png',
  'the tower': '16_la_torre.png',
  '16 la torre': '16_la_torre.png',
  '16 the tower': '16_la_torre.png',
  'la estrella': '17_la_estrella.png',
  'the star': '17_la_estrella.png',
  '17 la estrella': '17_la_estrella.png',
  '17 the star': '17_la_estrella.png',
  'la luna': '18_la_luna.png',
  'the moon': '18_la_luna.png',
  '18 la luna': '18_la_luna.png',
  '18 the moon': '18_la_luna.png',
  'el sol': '19_el_sol.png',
  'the sun': '19_el_sol.png',
  '19 el sol': '19_el_sol.png',
  '19 the sun': '19_el_sol.png',
  'el juicio': '20_el_juicio.png',
  judgement: '20_el_juicio.png',
  judgment: '20_el_juicio.png',
  '20 el juicio': '20_el_juicio.png',
  '20 judgement': '20_el_juicio.png',
  '20 judgment': '20_el_juicio.png',
  'el mundo': '21_el_mundo.png',
  'the world': '21_el_mundo.png',
  '21 el mundo': '21_el_mundo.png',
  '21 the world': '21_el_mundo.png',
};

function normalizeBotaKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBotaMajorPngSrc(draw: TarotCardDraw): string | null {
  const candidates: Array<string | null | undefined> = [
    draw.card?.id,
    draw.card?.nameSpanish,
    draw.card?.name,
    typeof draw.symbols?.nameSpanish === 'string' ? draw.symbols.nameSpanish : null,
  ];

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const key = normalizeBotaKey(raw);
    const byName = BOTA_MAJOR_PNG_BY_KEY[key];
    if (byName) return `/symbolic_assets/tarot/bota/majors/${byName}`;
  }

  return null;
}
