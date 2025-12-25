import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface NatalChartWheelProps {
  chart: NatalChartPayload;
  accent?: 'blue' | 'amber' | 'emerald' | 'slate';
  pending?: boolean;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

/**
 * Componente de rueda astrológica simple.
 * Muestra signos zodiacales, casas y planetas con posiciones reales.
 * 
 * NO calcula nada, solo visualiza datos del backend.
 */
export default function NatalChartWheel({ chart, accent = 'slate', pending = false }: NatalChartWheelProps) {
  const { planetas, casas } = chart;

  const accentStrokeClass =
    accent === 'blue'
      ? 'text-blue-600'
      : accent === 'amber'
        ? 'text-amber-600'
        : accent === 'emerald'
          ? 'text-emerald-600'
          : 'text-slate-600';

  const wheelMutedClass = pending ? 'opacity-70' : 'opacity-100';

  // Normalize longitudes and detect overlapping planets.
  // If several planets share (almost) the exact same longitude, apply a tiny visual offset
  // so they are all visible on the wheel while keeping the exact longitude in the tooltip.
  const normalizePlanetLongitudes = (planets: any[]) => {
    const EPS = 1e-6; // threshold to consider equal
    // Map by rounded longitude to clusters
    const clusters: Record<string, any[]> = {};
    planets.forEach((p) => {
      const key = (Math.round((p.longitud_ecliptica || 0) * 100) / 100).toFixed(2);
      clusters[key] = clusters[key] || [];
      clusters[key].push(p);
    });

    // For each cluster with >1 planet, compute small offsets in degrees
    const adjusted: any[] = [];
    Object.keys(clusters).forEach((k) => {
      const group = clusters[k];
      const base = group[0].longitud_ecliptica || 0;
      if (group.length === 1) {
        adjusted.push({ ...group[0], _display_longitude: base });
      } else {
        const spreadDeg = 0.6; // total spread in degrees across group
        const step = spreadDeg / Math.max(1, group.length - 1);
        const start = -spreadDeg / 2;
        group.forEach((p, i) => {
          adjusted.push({ ...p, _display_longitude: base + start + i * step });
        });
      }
    });

    return adjusted;
  };

  const displayedPlanets = normalizePlanetLongitudes(planetas || []);

  // Calcular posición de planetas en el círculo (basado en longitud eclíptica)
  const getPlanetPosition = (longitude: number) => {
    const radius = 65;
    const centerX = 100;
    const centerY = 100;
    // Normalize longitude to 0-360
    const lon = ((longitude % 360) + 360) % 360;
    // Convertir longitud a ángulo (0° Aries = top, clockwise). Subtract 90 to put Aries at top.
    const angle = (lon - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Calcular posición de cúspides de casas
  const getHouseCuspPosition = (longitude: number) => {
    const radius = 85;
    const centerX = 100;
    const centerY = 100;
    const lon = ((longitude % 360) + 360) % 360;
    const angle = (lon - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className={`w-full max-w-md h-auto ${wheelMutedClass}`}>
        {/* Círculo exterior (signos) */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-slate-400"
        />
        
        {/* Círculo medio (casas) */}
        <circle
          cx="100"
          cy="100"
          r="75"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-slate-300"
        />
        
        {/* Círculo interior (centro) */}
        <circle
          cx="100"
          cy="100"
          r="55"
          stroke="currentColor"
          strokeWidth="1"
          fill="white"
          className="text-slate-200"
        />

        {/* Divisiones de signos (12 secciones de 30°) */}
        {ZODIAC_SIGNS.map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x2 = 100 + 90 * Math.cos(angle);
          const y2 = 100 + 90 * Math.sin(angle);
          return (
            <line
              key={`sign-${i}`}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200"
            />
          );
        })}

        {/* Cúspides de casas */}
        {casas.map((casa) => {
          const pos = getHouseCuspPosition(casa.cuspide_longitud);
          return (
            <g key={`house-${casa.numero}`}>
              <line
                x1="100"
                y1="100"
                x2={pos.x}
                y2={pos.y}
                stroke="currentColor"
                strokeWidth="1"
                className={accentStrokeClass}
              />
              <text
                x={pos.x}
                y={pos.y}
                fontSize="8"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="middle"
                className={accentStrokeClass}
              >
                {casa.numero}
              </text>
            </g>
          );
        })}

        {/* Planetas (usamos _display_longitude cuando esté disponible para evitar overlap visual) */}
        {displayedPlanets.map((planeta) => {
          const lon = (planeta._display_longitude !== undefined) ? planeta._display_longitude : planeta.longitud_ecliptica;
          const pos = getPlanetPosition(lon);
          const symbol = PLANET_SYMBOLS[planeta.nombre] || '●';
          const title = `${planeta.nombre.toUpperCase()} ${planeta.signo ?? ''} ${planeta.grados != null ? planeta.grados + '°' : ''} (lon: ${planeta.longitud_ecliptica}°) - Casa ${planeta.casa ?? '—'}`;
          return (
            <g key={`${planeta.nombre}-${planeta.longitud_ecliptica}`}>
              <title>{title}</title>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill="currentColor"
                className={planeta.es_retrogrado ? 'text-red-500' : 'text-blue-500'}
              />
              <text
                x={pos.x}
                y={pos.y + 10}
                fontSize="10"
                fill="currentColor"
                textAnchor="middle"
                fontWeight="bold"
                className="text-slate-800"
              >
                {symbol}
              </text>
            </g>
          );
        })}

        {/* Etiquetas de signos (opcional, texto pequeño) */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 30 + 15 - 90) * (Math.PI / 180);
          const x = 100 + 82 * Math.cos(angle);
          const y = 100 + 82 * Math.sin(angle);
          return (
            <text
              key={`label-${sign}`}
              x={x}
              y={y}
              fontSize="6"
              fill="currentColor"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-slate-500"
            >
              {sign.slice(0, 3)}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Representación observacional de carta natal</p>
        <p className="text-[10px]">
          Sistema: {chart.metadatos.sistema_casas} | Fuente: {chart.metadatos.fuente}
        </p>
      </div>
    </div>
  );
}
