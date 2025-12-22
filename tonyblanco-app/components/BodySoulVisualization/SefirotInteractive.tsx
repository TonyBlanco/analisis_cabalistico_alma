import type { CSSProperties, ReactNode } from 'react';

export const SEFIROT_CANONICAL = [
  {
    id: 'keter',
    cx: 200,
    cy: 60,
    r: 30,
    grad: '#e2e8f0',
    stroke: '#94a3b8',
    hebrew: 'כתר',
    name: 'Keter',
    meaning: 'Corona',
    textFill: '#1e293b',
  },
  {
    id: 'chokmah',
    cx: 300,
    cy: 132,
    r: 26,
    grad: '#7dd3fc',
    stroke: '#0ea5e9',
    hebrew: 'חכמה',
    name: 'Chokmah',
    meaning: 'Sabiduria',
    textFill: '#0c4a6e',
  },
  {
    id: 'binah',
    cx: 100,
    cy: 132,
    r: 26,
    grad: '#4338ca',
    stroke: '#4338ca',
    hebrew: 'בינה',
    name: 'Binah',
    meaning: 'Entendimiento',
    textFill: '#e0e7ff',
  },
  {
    id: 'chesed',
    cx: 300,
    cy: 240,
    r: 26,
    grad: '#93c5fd',
    stroke: '#2563eb',
    hebrew: 'חסד',
    name: 'Chesed',
    meaning: 'Misericordia',
    textFill: '#1e3a8a',
  },
  {
    id: 'gevurah',
    cx: 100,
    cy: 240,
    r: 26,
    grad: '#fca5a5',
    stroke: '#dc2626',
    hebrew: 'גבורה',
    name: 'Gevurah',
    meaning: 'Rigor',
    textFill: '#7f1d1d',
  },
  {
    id: 'tiferet',
    cx: 200,
    cy: 270,
    r: 28,
    grad: '#fef08a',
    stroke: '#ca8a04',
    hebrew: 'תפארת',
    name: 'Tiferet',
    meaning: 'Belleza',
    textFill: '#713f12',
  },
  {
    id: 'netzach',
    cx: 300,
    cy: 390,
    r: 26,
    grad: '#86efac',
    stroke: '#16a34a',
    hebrew: 'נצח',
    name: 'Netzach',
    meaning: 'Victoria',
    textFill: '#14532d',
  },
  {
    id: 'hod',
    cx: 100,
    cy: 390,
    r: 26,
    grad: '#fdba74',
    stroke: '#ea580c',
    hebrew: 'הוד',
    name: 'Hod',
    meaning: 'Esplendor',
    textFill: '#7c2d12',
  },
  {
    id: 'yesod',
    cx: 200,
    cy: 450,
    r: 26,
    grad: '#e9d5ff',
    stroke: '#a855f7',
    hebrew: 'יסוד',
    name: 'Yesod',
    meaning: 'Fundamento',
    textFill: '#581c87',
  },
  {
    id: 'malkuth',
    cx: 200,
    cy: 540,
    r: 30,
    grad: '#d9f99d',
    stroke: '#65a30d',
    hebrew: 'מלכות',
    name: 'Malkuth',
    meaning: 'Reino',
    textFill: '#365314',
  },
] as const;

export const SEFIROT_PATHS = [
  { id: 'keter-chokmah', from: 'keter', to: 'chokmah' },
  { id: 'keter-binah', from: 'keter', to: 'binah' },
  { id: 'chokmah-binah', from: 'chokmah', to: 'binah' },
  { id: 'chokmah-chesed', from: 'chokmah', to: 'chesed' },
  { id: 'binah-gevurah', from: 'binah', to: 'gevurah' },
  { id: 'chesed-gevurah', from: 'chesed', to: 'gevurah' },
  { id: 'chesed-tiferet', from: 'chesed', to: 'tiferet' },
  { id: 'gevurah-tiferet', from: 'gevurah', to: 'tiferet' },
  { id: 'tiferet-netzach', from: 'tiferet', to: 'netzach' },
  { id: 'tiferet-hod', from: 'tiferet', to: 'hod' },
  { id: 'netzach-hod', from: 'netzach', to: 'hod' },
  { id: 'netzach-yesod', from: 'netzach', to: 'yesod' },
  { id: 'hod-yesod', from: 'hod', to: 'yesod' },
  { id: 'tiferet-yesod', from: 'tiferet', to: 'yesod' },
  { id: 'yesod-malkuth', from: 'yesod', to: 'malkuth' },
  { id: 'chesed-netzach', from: 'chesed', to: 'netzach' },
  { id: 'gevurah-hod', from: 'gevurah', to: 'hod' },
] as const;

export type SefirotId = (typeof SEFIROT_CANONICAL)[number]['id'];
export type SefirotPathId = (typeof SEFIROT_PATHS)[number]['id'];

export interface SefirotNodeRingStyle {
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  radius?: number;
}

export interface SefirotNodeStyle {
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  radius?: number;
  ring?: SefirotNodeRingStyle;
}

export interface SefirotPathStyle {
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  repeat?: {
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
  };
}

interface SefirotInteractiveProps {
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onPathHover?: (id: string | null) => void;
  interactive?: boolean;
  nodeStyleOverrides?: Partial<Record<SefirotId, SefirotNodeStyle>>;
  pathStyleOverrides?: Partial<Record<SefirotPathId, SefirotPathStyle>>;
  showBackground?: boolean;
  showPillarLabels?: boolean;
  showPillarGuides?: boolean;
  showLabels?: boolean;
  showHebrew?: boolean;
  showMeaning?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function SefirotInteractive({
  selectedId = null,
  hoveredId = null,
  onSelect,
  onHover,
  onPathHover,
  interactive,
  nodeStyleOverrides,
  pathStyleOverrides,
  showBackground = true,
  showPillarLabels = true,
  showPillarGuides = true,
  showLabels = true,
  showHebrew = true,
  showMeaning = true,
  className,
  style,
  children,
}: SefirotInteractiveProps) {
  const isInteractive =
    interactive ?? Boolean(onSelect || onHover || onPathHover);
  const sefirotData = SEFIROT_CANONICAL;
  const pathData = SEFIROT_PATHS;
  const nodeById = new Map<SefirotId, (typeof SEFIROT_CANONICAL)[number]>(
    sefirotData.map((node) => [node.id, node]),
  );

  return (
    <svg viewBox="0 0 400 600" className={className ?? 'w-full h-full'} style={style}>
      <defs>
        <style>
          {`
            .path { stroke: #cbd5e1; stroke-width: 1.5; fill: none; opacity: 0.7; }
            .sefira { transition: all 0.3s; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
            .sefira:hover { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1); }
            .sefira-group { cursor: pointer; }
            .label { font-family: 'Georgia', serif; font-size: 14px; font-weight: 600; text-anchor: middle; pointer-events: none; }
            .hebrew { font-family: 'Times New Roman', serif; font-size: 11px; text-anchor: middle; opacity: 0.7; pointer-events: none; }
            .meaning { font-family: 'Arial', sans-serif; font-size: 10px; text-anchor: middle; opacity: 0.6; font-style: italic; pointer-events: none; }
            .pillar-label { font-family: 'Arial', sans-serif; font-size: 9px; font-weight: 600; fill: #64748b; text-anchor: middle; }
          `}
        </style>
      </defs>

      {showBackground ? <rect width="400" height="600" fill="#f8fafc" /> : null}

      {showPillarLabels ? (
        <>
          <text x="100" y="20" className="pillar-label">PILAR DE LA SEVERIDAD</text>
          <text x="200" y="20" className="pillar-label">PILAR DEL EQUILIBRIO</text>
          <text x="300" y="20" className="pillar-label">PILAR DE LA MISERICORDIA</text>
        </>
      ) : null}

      {showPillarGuides ? (
        <>
          <line x1="100" y1="25" x2="100" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
          <line x1="200" y1="25" x2="200" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
          <line x1="300" y1="25" x2="300" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
        </>
      ) : null}

      <g>
        {pathData.map((path) => {
          const from = nodeById.get(path.from);
          const to = nodeById.get(path.to);
          if (!from || !to) return null;

          const overrides = pathStyleOverrides?.[path.id] ?? {};
          const repeat = overrides.repeat;
          const stroke = overrides.stroke ?? '#cbd5e1';
          const strokeWidth = overrides.strokeWidth ?? 1.5;
          const opacity = overrides.opacity ?? 0.7;

          return (
            <g key={path.id}>
              {repeat ? (
                <line
                  x1={from.cx}
                  y1={from.cy}
                  x2={to.cx}
                  y2={to.cy}
                  stroke={repeat.stroke ?? stroke}
                  strokeWidth={repeat.strokeWidth ?? strokeWidth + 1}
                  opacity={repeat.opacity ?? 0.35}
                />
              ) : null}
              <line
                className="path"
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
                onMouseEnter={
                  isInteractive && onPathHover
                    ? () => onPathHover(path.id)
                    : undefined
                }
                onMouseLeave={
                  isInteractive && onPathHover
                    ? () => onPathHover(null)
                    : undefined
                }
                style={{ cursor: isInteractive ? 'pointer' : 'default' }}
              />
            </g>
          );
        })}
      </g>

      {sefirotData.map((s) => {
        const isSelected = selectedId === s.id;
        const isHovered = hoveredId === s.id;
        const overrides = nodeStyleOverrides?.[s.id];
        const strokeWidth = overrides?.strokeWidth ?? (isSelected ? 4 : isHovered ? 3.5 : 2.5);
        const opacity = overrides?.opacity ?? (selectedId && !isSelected ? 0.5 : 1);
        const currentStroke = overrides?.stroke ?? (isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : s.stroke);
        const fill = overrides?.fill ?? s.grad;
        const radius = overrides?.radius ?? s.r;
        const ring = overrides?.ring;
        const ringRadius = ring?.radius ?? radius + 3;

        return (
          <g
            key={s.id}
            className="sefira-group"
            style={{ opacity }}
            onClick={isInteractive && onSelect ? () => onSelect(s.id) : undefined}
            onMouseEnter={isInteractive && onHover ? () => onHover(s.id) : undefined}
            onMouseLeave={isInteractive && onHover ? () => onHover(null) : undefined}
          >
            {ring ? (
              <circle
                cx={s.cx}
                cy={s.cy}
                r={ringRadius}
                fill="none"
                stroke={ring.stroke ?? currentStroke}
                strokeWidth={ring.strokeWidth ?? 1.2}
                opacity={ring.opacity ?? 0.4}
              />
            ) : null}
            <circle
              className="sefira"
              cx={s.cx}
              cy={s.cy}
              r={radius}
              fill={fill}
              stroke={currentStroke}
              strokeWidth={strokeWidth}
            />
            {showHebrew ? (
              <text className="hebrew" x={s.cx} y={s.cy - 6} fill={s.textFill}>
                {s.hebrew}
              </text>
            ) : null}
            {showLabels ? (
              <text className="label" x={s.cx} y={s.cy + 6} fill={s.textFill}>
                {s.name}
              </text>
            ) : null}
            {showMeaning ? (
              <text className="meaning" x={s.cx} y={s.cy + radius + 15} fill="#64748b">
                {s.meaning}
              </text>
            ) : null}
          </g>
        );
      })}
      {children}
    </svg>
  );
}
