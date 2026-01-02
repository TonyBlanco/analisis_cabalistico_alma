'use client';

import clsx from 'clsx';

export type BotaTarotCardData = {
  id: string;
  number?: number | null;
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

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function line(label: string, value: unknown): string | null {
  const v = cleanText(value);
  return v ? label + ': ' + v : null;
}

export default function BotaTarotCardSVG({
  card,
  reversed = false,
}: {
  card: BotaTarotCardData;
  reversed?: boolean;
}) {
  const title = cleanText(card.name) || cleanText(card.id) || 'Carta';

  const metaLines = [
    line('Letra', card.hebrewLetter),
    typeof card.letterValue === 'number' ? 'Valor: ' + String(card.letterValue) : null,
    card.path != null ? 'Sendero: ' + String(card.path) : null,
    line('Sefirot', card.sefirot),
    line('Elemento', card.element),
    line('Planeta', card.planet),
    line('Signo', card.sign),
    line('Decano', card.decan),
  ].filter((v): v is string => Boolean(v));

  const swatches = card.colors
    ? [
        { key: 'king', label: 'Rey', color: cleanText(card.colors.king) },
        { key: 'queen', label: 'Reina', color: cleanText(card.colors.queen) },
        { key: 'emperor', label: 'Emper.', color: cleanText(card.colors.emperor) },
        { key: 'empress', label: 'Empr.', color: cleanText(card.colors.empress) },
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
        {card.number != null ? '#' + String(card.number) : ''}
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
      ) : (
        <text x="36" y="448" fontSize="11" fill="#64748b">
          No disponible
        </text>
      )}
    </svg>
  );
}

