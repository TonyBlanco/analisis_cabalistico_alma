interface SefirotInteractiveProps {
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export default function SefirotInteractive({
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: SefirotInteractiveProps) {
  const sefirotData = [
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
];

  return (
    <svg viewBox="0 0 400 600" className="w-full h-full">
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
      
      {/* Fondo */}
      <rect width="400" height="600" fill="#f8fafc" />
      
      {/* Lineas de pilares */}
      <text x="100" y="20" className="pillar-label">PILAR DE LA SEVERIDAD</text>
      <text x="200" y="20" className="pillar-label">PILAR DEL EQUILIBRIO</text>
      <text x="300" y="20" className="pillar-label">PILAR DE LA MISERICORDIA</text>
      
      {/* Lineas de pilares */}
      <line x1="100" y1="25" x2="100" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
      <line x1="200" y1="25" x2="200" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
      <line x1="300" y1="25" x2="300" y2="540" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
      
      {/* Senderos (paths) */}
      <g>
        <line className="path" x1="200" y1="60" x2="200" y2="270" />
        <line className="path" x1="200" y1="270" x2="200" y2="450" />
        <line className="path" x1="200" y1="450" x2="200" y2="540" />
        <line className="path" x1="300" y1="132" x2="300" y2="240" />
        <line className="path" x1="300" y1="240" x2="300" y2="390" />
        <line className="path" x1="100" y1="132" x2="100" y2="240" />
        <line className="path" x1="100" y1="240" x2="100" y2="390" />
        <line className="path" x1="200" y1="60" x2="300" y2="132" />
        <line className="path" x1="200" y1="60" x2="100" y2="132" />
        <line className="path" x1="300" y1="132" x2="100" y2="132" />
        <line className="path" x1="300" y1="132" x2="200" y2="270" />
        <line className="path" x1="100" y1="132" x2="200" y2="270" />
        <line className="path" x1="300" y1="132" x2="100" y2="240" />
        <line className="path" x1="100" y1="132" x2="300" y2="240" />
        <line className="path" x1="300" y1="240" x2="200" y2="270" />
        <line className="path" x1="100" y1="240" x2="200" y2="270" />
        <line className="path" x1="300" y1="240" x2="100" y2="240" />
        <line className="path" x1="300" y1="240" x2="100" y2="390" />
        <line className="path" x1="100" y1="240" x2="300" y2="390" />
        <line className="path" x1="200" y1="270" x2="300" y2="390" />
        <line className="path" x1="200" y1="270" x2="100" y2="390" />
        <line className="path" x1="300" y1="390" x2="200" y2="450" />
        <line className="path" x1="100" y1="390" x2="200" y2="450" />
        <line className="path" x1="300" y1="390" x2="100" y2="390" />
        <line className="path" x1="300" y1="390" x2="200" y2="540" />
        <line className="path" x1="100" y1="390" x2="200" y2="540" />
      </g>
      
      {/* Sefirot interactivas */}
      {sefirotData.map((s) => {
        const isSelected = selectedId === s.id;
        const isHovered = hoveredId === s.id;
        const strokeWidth = isSelected ? 4 : isHovered ? 3.5 : 2.5;
        const opacity = selectedId && !isSelected ? 0.5 : 1;
        const currentStroke = isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : s.stroke;
        
        return (
          <g
            key={s.id}
            className="sefira-group"
            style={{ opacity }}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => onHover(s.id)}
            onMouseLeave={() => onHover(null)}
          >
            <circle
              className="sefira"
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={s.grad}
              stroke={currentStroke}
              strokeWidth={strokeWidth}
            />
            <text className="hebrew" x={s.cx} y={s.cy - 6} fill={s.textFill}>
              {s.hebrew}
            </text>
            <text className="label" x={s.cx} y={s.cy + 6} fill={s.textFill}>
              {s.name}
            </text>
            <text className="meaning" x={s.cx} y={s.cy + s.r + 15} fill="#64748b">
              {s.meaning}
            </text>
          </g>
        );
      })}
    </svg>
  );
}



