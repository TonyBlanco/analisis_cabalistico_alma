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
  'fill-transparent stroke-slate-400/60 stroke-[1] hover:stroke-slate-600 transition-colors cursor-pointer';

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
      viewBox="0 0 100 140"
      className={className || 'w-full h-auto'}
      role="img"
      aria-label="Mapa corporal"
    >
      <defs>
        {/* Gradientes para dar profundidad */}
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f1f5f9', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="headGradient" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
        </radialGradient>
      </defs>

      {/* Cuerpo base mejorado */}
      <g className="body-structure">
        
        {/* Cabeza más realista */}
        <ellipse 
          cx="50" 
          cy="14" 
          rx="8.5" 
          ry="10" 
          fill="url(#headGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Detalles faciales sutiles */}
        <ellipse cx="47" cy="13" rx="1" ry="0.8" fill="#cbd5e1" opacity="0.6" />
        <ellipse cx="53" cy="13" rx="1" ry="0.8" fill="#cbd5e1" opacity="0.6" />
        <path d="M48 16.5 Q50 17.5 52 16.5" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5" />
        
        {/* Cuello */}
        <path 
          d="M46 23 L46 27 Q46 28 47 28 L53 28 Q54 28 54 27 L54 23" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Hombros y clavículas */}
        <ellipse 
          cx="50" 
          cy="29" 
          rx="16" 
          ry="4" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M38 30 Q50 28 62 30" 
          fill="none" 
          stroke="#cbd5e1" 
          strokeWidth="0.6" 
          opacity="0.7"
        />
        
        {/* Torso superior (pecho) */}
        <path 
          d="M37 32 
             Q34 36 34 42
             L34 52
             Q34 56 36 58
             L37 32 Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M63 32 
             Q66 36 66 42
             L66 52
             Q66 56 64 58
             L63 32 Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Pecho central */}
        <path 
          d="M37 32 
             Q50 34 63 32
             L64 58
             Q50 61 36 58
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Línea media del torso */}
        <line x1="50" y1="32" x2="50" y2="58" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4" />
        
        {/* Costillas sutiles */}
        <path d="M42 38 Q50 37 58 38" fill="none" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.3" />
        <path d="M40 42 Q50 41 60 42" fill="none" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.3" />
        <path d="M39 46 Q50 45 61 46" fill="none" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.3" />
        <path d="M39 50 Q50 49 61 50" fill="none" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.3" />
        
        {/* Abdomen */}
        <path 
          d="M36 58 
             Q34 62 34 68
             L34 78
             Q34 82 36 84
             L36 58 Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M64 58 
             Q66 62 66 68
             L66 78
             Q66 82 64 84
             L64 58 Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M36 58 
             L36 84
             Q50 86 64 84
             L64 58
             Q50 61 36 58 Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Ombligo */}
        <ellipse cx="50" cy="70" rx="1.5" ry="1" fill="#cbd5e1" opacity="0.5" />
        
        {/* Línea alba (abdomen) */}
        <line x1="50" y1="58" x2="50" y2="84" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4" />
        
        {/* Músculos abdominales sutiles */}
        <path d="M44 62 L56 62" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.25" />
        <path d="M43 68 L57 68" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.25" />
        <path d="M43 74 L57 74" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.25" />
        <path d="M44 80 L56 80" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.25" />
        
        {/* Cadera y pelvis */}
        <ellipse 
          cx="50" 
          cy="86" 
          rx="15" 
          ry="6" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M35 86 Q35 90 37 92 L37 86" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        <path 
          d="M65 86 Q65 90 63 92 L63 86" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Pierna izquierda */}
        <path 
          d="M37 92 
             Q35 100 35 108
             L35 122
             Q35 126 36 128
             L39 128
             Q40 126 40 122
             L40 108
             Q40 100 39 92
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Pierna derecha */}
        <path 
          d="M63 92 
             Q65 100 65 108
             L65 122
             Q65 126 64 128
             L61 128
             Q60 126 60 122
             L60 108
             Q60 100 61 92
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Rodillas */}
        <ellipse cx="37.5" cy="108" rx="2.5" ry="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
        <ellipse cx="62.5" cy="108" rx="2.5" ry="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
        
        {/* Pies izquierdo */}
        <ellipse 
          cx="37" 
          cy="132" 
          rx="4" 
          ry="2.5" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Pie derecho */}
        <ellipse 
          cx="63" 
          cy="132" 
          rx="4" 
          ry="2.5" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Brazo izquierdo */}
        <path 
          d="M34 32 
             Q28 36 24 42
             L20 56
             Q18 60 19 64
             L22 64
             Q24 60 26 56
             L30 42
             Q33 36 34 34
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Brazo derecho */}
        <path 
          d="M66 32 
             Q72 36 76 42
             L80 56
             Q82 60 81 64
             L78 64
             Q76 60 74 56
             L70 42
             Q67 36 66 34
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Codos */}
        <ellipse cx="20" cy="56" rx="2" ry="2.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
        <ellipse cx="80" cy="56" rx="2" ry="2.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
        
        {/* Antebrazo izquierdo */}
        <path 
          d="M19 64 
             L18 76
             Q18 78 19 79
             L21 79
             Q22 78 22 76
             L23 64
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Antebrazo derecho */}
        <path 
          d="M81 64 
             L82 76
             Q82 78 81 79
             L79 79
             Q78 78 78 76
             L77 64
             Z" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Mano izquierda */}
        <ellipse 
          cx="20" 
          cy="82" 
          rx="2.5" 
          ry="3" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Mano derecha */}
        <ellipse 
          cx="80" 
          cy="82" 
          rx="2.5" 
          ry="3" 
          fill="url(#bodyGradient)" 
          stroke="#94a3b8" 
          strokeWidth="0.8"
        />
        
        {/* Dedos sutiles */}
        <path d="M18 84 L17 86" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M20 85 L20 87" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M22 84 L23 86" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
        
        <path d="M82 84 L83 86" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M80 85 L80 87" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M78 84 L77 86" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" />
      </g>

      {/* Regiones interactivas (hotspots) */}
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