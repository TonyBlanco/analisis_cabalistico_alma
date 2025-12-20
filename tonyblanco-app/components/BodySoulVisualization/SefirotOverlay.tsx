import type { SefirahConnection, SefirahDefinition } from './types';

interface SefirotOverlayProps {
  sefirot: SefirahDefinition[];
  connections: SefirahConnection[];
  selectedSefirahId: string | null;
  onSelectSefirah: (sefirahId: string) => void;
  className?: string;
}

const colorClassMap: Record<
  string,
  { fill: string; stroke: string; text: string; ring: string }
> = {
  'amber-500': {
    fill: 'fill-amber-500/20',
    stroke: 'stroke-amber-500',
    text: 'fill-amber-700',
    ring: 'stroke-amber-700',
  },
  'sky-500': {
    fill: 'fill-sky-500/20',
    stroke: 'stroke-sky-500',
    text: 'fill-sky-700',
    ring: 'stroke-sky-700',
  },
  'indigo-500': {
    fill: 'fill-indigo-500/20',
    stroke: 'stroke-indigo-500',
    text: 'fill-indigo-700',
    ring: 'stroke-indigo-700',
  },
  'emerald-500': {
    fill: 'fill-emerald-500/20',
    stroke: 'stroke-emerald-500',
    text: 'fill-emerald-700',
    ring: 'stroke-emerald-700',
  },
  'rose-500': {
    fill: 'fill-rose-500/20',
    stroke: 'stroke-rose-500',
    text: 'fill-rose-700',
    ring: 'stroke-rose-700',
  },
  'teal-500': {
    fill: 'fill-teal-500/20',
    stroke: 'stroke-teal-500',
    text: 'fill-teal-700',
    ring: 'stroke-teal-700',
  },
  'lime-500': {
    fill: 'fill-lime-500/20',
    stroke: 'stroke-lime-500',
    text: 'fill-lime-700',
    ring: 'stroke-lime-700',
  },
  'fuchsia-500': {
    fill: 'fill-fuchsia-500/20',
    stroke: 'stroke-fuchsia-500',
    text: 'fill-fuchsia-700',
    ring: 'stroke-fuchsia-700',
  },
  'slate-500': {
    fill: 'fill-slate-500/20',
    stroke: 'stroke-slate-500',
    text: 'fill-slate-700',
    ring: 'stroke-slate-700',
  },
  'orange-500': {
    fill: 'fill-orange-500/20',
    stroke: 'stroke-orange-500',
    text: 'fill-orange-700',
    ring: 'stroke-orange-700',
  },
};

const getColorClasses = (token: string) =>
  colorClassMap[token] || {
    fill: 'fill-slate-500/10',
    stroke: 'stroke-slate-500',
    text: 'fill-slate-700',
    ring: 'stroke-slate-700',
  };

export default function SefirotOverlay({
  sefirot,
  connections,
  selectedSefirahId,
  onSelectSefirah,
  className,
}: SefirotOverlayProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className || 'w-full h-auto'}
      role="img"
      aria-label="Sefirot overlay"
    >
      <g className="stroke-slate-300">
        {connections.map((connection) => {
          const from = sefirot.find((node) => node.id === connection.fromId);
          const to = sefirot.find((node) => node.id === connection.toId);
          if (!from || !to) return null;
          return (
            <line
              key={`${connection.fromId}-${connection.toId}`}
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              strokeWidth={1}
            />
          );
        })}
      </g>

      {sefirot.map((node) => {
        const colorClasses = getColorClasses(node.colorToken);
        const isSelected = selectedSefirahId === node.id;
        return (
          <g key={node.id}>
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={5}
              className={`${colorClasses.fill} ${colorClasses.stroke} ${
                isSelected ? `${colorClasses.ring} stroke-[2.5]` : 'stroke-[1.2]'
              }`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectSefirah(node.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectSefirah(node.id);
                }
              }}
            >
              <title>{node.spanishName}</title>
            </circle>
            <text
              x={node.position.x}
              y={node.position.y - 7}
              textAnchor="middle"
              className={`text-[4px] ${colorClasses.text}`}
            >
              {node.spanishName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
