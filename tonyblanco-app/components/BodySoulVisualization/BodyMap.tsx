import type { BodyRegion, BodyViewSide } from './types';

interface BodyMapProps {
  regions: BodyRegion[];
  selectedRegionId: string | null;
  side: BodyViewSide;
  onSelectRegion: (regionId: string) => void;
  className?: string;
}

const regionRingClass =
  'fill-amber-400/20 stroke-amber-500 stroke-[1.5]';
const regionBaseClass =
  'fill-transparent stroke-slate-400/60 stroke-[1] hover:stroke-slate-600 transition-colors';

export default function BodyMap({
  regions,
  selectedRegionId,
  side,
  onSelectRegion,
  className,
}: BodyMapProps) {
  const regionsForSide = regions.filter((region) => region.side === side);
  const visibleRegions =
    regionsForSide.length > 0 ? regionsForSide : regions.filter((region) => region.side === 'front');

  return (
    <svg
      viewBox="0 0 100 100"
      className={className || 'w-full h-auto'}
      role="img"
      aria-label="Body map"
    >
      <g className="fill-slate-100 stroke-slate-300">
        <circle cx="50" cy="14" r="8" />
        <rect x="46" y="22" width="8" height="6" rx="3" />
        <path d="M36 28 Q50 20 64 28 L70 56 Q50 62 30 56 Z" />
        <path d="M30 56 L38 90 Q50 96 62 90 L70 56 Q50 60 30 56 Z" />
        <path d="M30 32 L18 52 L24 56 L36 36 Z" />
        <path d="M70 32 L82 52 L76 56 L64 36 Z" />
      </g>

      {visibleRegions.map((region) => {
        const isSelected = selectedRegionId === region.id;
        const classes = isSelected ? regionRingClass : regionBaseClass;
        return (
          <circle
            key={region.id}
            cx={region.hotspot.x}
            cy={region.hotspot.y}
            r={region.hotspot.r}
            className={classes}
            role="button"
            tabIndex={0}
            onClick={() => onSelectRegion(region.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectRegion(region.id);
              }
            }}
          >
            <title>{region.label}</title>
          </circle>
        );
      })}
    </svg>
  );
}
