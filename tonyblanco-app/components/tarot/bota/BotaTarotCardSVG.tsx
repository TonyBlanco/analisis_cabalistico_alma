'use client';

import clsx from 'clsx';

export interface BotaTarotCardSVGProps {
  title: string;
  reversed: boolean;
  cardCode?: string | null;
  symbols: {
    hebrew_letter?: string | null;
    letter_value?: number | null;
    path?: number | null;
    sefirot?: string | string[] | null;
    element?: string | null;
    planet?: string | null;
    sign?: string | null;
    scales?: {
      king?: string | null;
      queen?: string | null;
      emperor?: string | null;
      empress?: string | null;
    } | null;
    kabbalistic?: any;
  };
}

// Backward-compat for existing callers (to be removed once all callsites use BotaTarotCardSVGProps).
export type LegacyBotaTarotCardData = {
  id: string;
  name?: string | null;
  hebrewLetter?: string | null;
  letterValue?: number | null;
  path?: number | string | null;
  sefirot?: string | null;
  element?: string | null;
  planet?: string | null;
  sign?: string | null;
  decan?: string | null;
  colors?: {
    king?: string | null;
    queen?: string | null;
    emperor?: string | null;
    empress?: string | null;
  } | null;
};

// Backward-compatible export name used by existing callsites.
export type BotaTarotCardData = LegacyBotaTarotCardData;

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function line(label: string, value: unknown): string | null {
  const v = cleanText(value);
  return v ? label + ': ' + v : null;
}

function normalizeSymbols(raw: any): BotaTarotCardSVGProps['symbols'] {
  const base = raw && typeof raw === 'object' ? raw : {};
  const k = base.kabbalistic && typeof base.kabbalistic === 'object' ? base.kabbalistic : base;
  const scales = base.scales && typeof base.scales === 'object' ? base.scales : null;
  const colors =
    k.colors && typeof k.colors === 'object'
      ? k.colors
      : k.kabbalistic?.colors && typeof k.kabbalistic.colors === 'object'
        ? k.kabbalistic.colors
        : null;

  return {
    hebrew_letter: base.hebrew_letter ?? k.hebrew_letter ?? k.hebrewLetter ?? null,
    letter_value: base.letter_value ?? k.letter_value ?? k.letterValue ?? null,
    path: base.path ?? k.path ?? null,
    sefirot: base.sefirot ?? k.sefirot ?? k.sefirot ?? null,
    element: base.element ?? k.element ?? null,
    planet: base.planet ?? k.planet ?? null,
    sign: base.sign ?? k.sign ?? null,
    scales:
      scales ||
      (colors
        ? {
            king: colors.king ?? null,
            queen: colors.queen ?? null,
            emperor: colors.emperor ?? null,
            empress: colors.empress ?? null,
          }
        : null),
    kabbalistic: base.kabbalistic,
  };
}

function normalizeProps(
  props: BotaTarotCardSVGProps | { card: LegacyBotaTarotCardData; reversed?: boolean },
): BotaTarotCardSVGProps {
  if ('symbols' in props) {
    return {
      ...props,
      title: cleanText(props.title),
      reversed: Boolean(props.reversed),
      symbols: normalizeSymbols(props.symbols),
    };
  }

  const card = props.card;
  return {
    title: cleanText(card.name) || cleanText(card.id),
    reversed: Boolean(props.reversed),
    cardCode: null,
    symbols: normalizeSymbols({
      hebrew_letter: card.hebrewLetter ?? null,
      letter_value: card.letterValue ?? null,
      path: typeof card.path === 'number' ? card.path : null,
      sefirot: card.sefirot ?? null,
      element: card.element ?? null,
      planet: card.planet ?? null,
      sign: card.sign ?? null,
      scales: card.colors
        ? {
            king: card.colors.king ?? null,
            queen: card.colors.queen ?? null,
            emperor: card.colors.emperor ?? null,
            empress: card.colors.empress ?? null,
          }
        : null,
    }),
  };
}

export default function BotaTarotCardSVG(
  props: BotaTarotCardSVGProps | { card: LegacyBotaTarotCardData; reversed?: boolean },
) {
  const normalized = normalizeProps(props);
  const title = normalized.title;
  const reversed = normalized.reversed;
  const symbols = normalized.symbols;

  const metaLines = [
    line('Letra', symbols.hebrew_letter),
    typeof symbols.letter_value === 'number' ? 'Valor: ' + String(symbols.letter_value) : null,
    symbols.path != null ? 'Sendero: ' + String(symbols.path) : null,
    Array.isArray(symbols.sefirot) ? line('Sefirot', symbols.sefirot.join(', ')) : line('Sefirot', symbols.sefirot),
    line('Elemento', symbols.element),
    line('Planeta', symbols.planet),
    line('Signo', symbols.sign),
  ].filter((v): v is string => Boolean(v));

  const swatches = symbols.scales
    ? [
        { key: 'king', label: 'Rey', color: cleanText(symbols.scales.king) },
        { key: 'queen', label: 'Reina', color: cleanText(symbols.scales.queen) },
        { key: 'emperor', label: 'Emper.', color: cleanText(symbols.scales.emperor) },
        { key: 'empress', label: 'Empr.', color: cleanText(symbols.scales.empress) },
      ].filter((s) => s.color)
    : [];

  return (
    <svg
      viewBox="0 0 300 480"
      width="100%"
      height="100%"
      role="img"
      aria-label={title}
      className={clsx('rounded-lg border border-slate-200 bg-white', reversed && 'rotate-180')}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="10" y="10" width="280" height="460" rx="12" fill="#ffffff" stroke="#e2e8f0" />

      <rect x="24" y="24" width="252" height="64" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
      <text x="36" y="52" fontSize="14" fontWeight="700" fill="#0f172a">
        {title}
      </text>
      <text x="36" y="74" fontSize="11" fill="#475569">
        {cleanText(normalized.cardCode) || ''}
      </text>

      <rect x="24" y="100" width="252" height="290" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="36" y="124" fontSize="10" fontWeight="700" fill="#64748b">
        KABBALISTIC / SYMBOLIC
      </text>

      {metaLines.slice(0, 10).map((value, idx) => (
        <text key={idx} x="36" y={148 + idx * 18} fontSize="11" fill="#334155">
          {value}
        </text>
      ))}

      <rect x="24" y="402" width="252" height="56" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
      <text x="36" y="426" fontSize="10" fontWeight="700" fill="#64748b">
        Escalas de color
      </text>

      {swatches.length ? (
        <g transform="translate(36, 436)">
          {swatches.slice(0, 4).map((s, idx) => (
            <g key={s.key} transform={'translate(' + String(idx * 60) + ',0)'}>
              <rect x="0" y="0" width="16" height="16" rx="4" fill={s.color} stroke="#cbd5e1" />
              <text x="22" y="12" fontSize="10" fill="#334155">
                {s.label}
              </text>
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}
