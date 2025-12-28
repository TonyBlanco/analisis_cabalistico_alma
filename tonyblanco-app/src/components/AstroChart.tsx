import React, { useState } from 'react';

// Símbolos zodiacales
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
};

// Símbolos planetarios (no usado directamente en la lógica pero útil)
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀',
  mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅',
  neptune: '♆', pluto: '♇'
};

// Datos de ejemplo (reemplazar con cálculos reales)
const exampleData = {
  ascendant: 170, // Grados desde Aries 0°
  houses: [170, 200, 230, 260, 290, 320, 350, 20, 50, 80, 110, 140], // Cúspides
  planets: [
    { name: 'sun', symbol: '☉', degree: 197, sign: 'libra', label: '17°♎' },
    { name: 'moon', symbol: '☽', degree: 19, sign: 'aries', label: '19°♈' },
    { name: 'mercury', symbol: '☿', degree: 183, sign: 'libra', label: '3°♎' },
    { name: 'venus', symbol: '♀', degree: 191, sign: 'libra', label: '11°♎' },
    { name: 'mars', symbol: '♂', degree: 346, sign: 'pisces', label: '16°♓' },
    { name: 'jupiter', symbol: '♃', degree: 27, sign: 'taurus', label: '27°♉' },
    { name: 'saturn', symbol: '♄', degree: 293, sign: 'capricorn', label: '23°♑' },
    { name: 'uranus', symbol: '♅', degree: 7, sign: 'aries', label: '7°♈' },
    { name: 'neptune', symbol: '♆', degree: 20, sign: 'aries', label: '20°♈' },
    { name: 'pluto', symbol: '♇', degree: 294, sign: 'capricorn', label: '24°♑' }
  ]
};

const AstroChart: React.FC = () => {
  const [showAspects, setShowAspects] = useState(true);

  const size = 800;
  const center = size / 2;
  const outerRadius = 380;
  const zodiacRadius = 350;
  const houseRadius = 320;
  const planetRadius = 240;
  const innerRadius = 100;

  // Convertir grado a coordenadas (0° = arriba, sentido horario)
  const degToPoint = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180; // ajuste para 0° arriba
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  // Dibujar círculos concéntricos
  const renderCircles = () => (
    <>
      <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#333" strokeWidth={2} />
      <circle cx={center} cy={center} r={zodiacRadius} fill="none" stroke="#666" strokeWidth={1} />
      <circle cx={center} cy={center} r={houseRadius} fill="none" stroke="#999" strokeWidth={2} />
      <circle cx={center} cy={center} r={planetRadius} fill="none" stroke="#ccc" strokeWidth={1} />
      <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#333" strokeWidth={2} />
    </>
  );

  // Dibujar signos zodiacales (30° cada uno)
  const renderZodiacSigns = () => {
    const signs = Object.values(ZODIAC_SYMBOLS);
    return signs.map((symbol, i) => {
      const degree = i * 30 + 15; // Centro de cada signo
      const point = degToPoint(degree, (outerRadius + zodiacRadius) / 2);

      return (
        <g key={`sign-${i}`}>
          {/* Línea divisoria */}
          <line
            x1={degToPoint(i * 30, zodiacRadius).x}
            y1={degToPoint(i * 30, zodiacRadius).y}
            x2={degToPoint(i * 30, outerRadius).x}
            y2={degToPoint(i * 30, outerRadius).y}
            stroke="#999"
            strokeWidth={1}
          />
          {/* Símbolo del signo */}
          <text
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={24}
            fill="#4a5568"
            fontWeight={700}
          >
            {symbol}
          </text>
        </g>
      );
    });
  };

  // Dibujar casas
  const renderHouses = () => {
    return exampleData.houses.map((degree, i) => {
      const nextDegree = exampleData.houses[(i + 1) % 12];
      const delta = nextDegree > degree ? (nextDegree - degree) : (360 + nextDegree - degree);
      const midDegree = (degree + delta / 2) % 360;

      const innerPoint = degToPoint(degree, innerRadius);
      const outerPoint = degToPoint(degree, houseRadius);
      const labelPoint = degToPoint(midDegree, (houseRadius + innerRadius) / 2);

      return (
        <g key={`house-${i}`}>
          {/* Línea de la casa */}
          <line
            x1={innerPoint.x}
            y1={innerPoint.y}
            x2={outerPoint.x}
            y2={outerPoint.y}
            stroke="#333"
            strokeWidth={i % 3 === 0 ? 3 : 1.5}
          />
          {/* Número de casa */}
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fill="#666"
            fontWeight={500}
          >
            {i + 1}
          </text>
        </g>
      );
    });
  };

  // Dibujar planetas
  const renderPlanets = () => {
    return exampleData.planets.map((planet, i) => {
      const point = degToPoint(planet.degree, planetRadius);
      const labelPoint = degToPoint(planet.degree, planetRadius - 35);

      const colors: Record<string, string> = {
        sun: '#FFD700', moon: '#C0C0C0', mercury: '#87CEEB',
        venus: '#FF69B4', mars: '#DC143C', jupiter: '#FF8C00',
        saturn: '#4169E1', uranus: '#00CED1', neptune: '#1E90FF', pluto: '#8B4513'
      };

      return (
        <g key={`planet-${i}`}>
          {/* Línea hacia el planeta */}
          <line
            x1={degToPoint(planet.degree, houseRadius).x}
            y1={degToPoint(planet.degree, houseRadius).y}
            x2={point.x}
            y2={point.y}
            stroke="#ccc"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          {/* Símbolo planetario */}
          <circle
            cx={point.x}
            cy={point.y}
            r={20}
            fill={colors[planet.name] || '#666'}
            stroke="#fff"
            strokeWidth={2}
          />
          <text
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={18}
            fill="#fff"
            fontWeight={700}
          >
            {planet.symbol}
          </text>
          {/* Grado del planeta */}
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#333"
            fontWeight={500}
          >
            {planet.label}
          </text>
        </g>
      );
    });
  };

  // Calcular y dibujar aspectos
  const renderAspects = () => {
    if (!showAspects) return null;

    const aspects: React.ReactNode[] = [];
    const planets = exampleData.planets;

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const rawDiff = Math.abs(planets[i].degree - planets[j].degree);
        const diff = rawDiff > 180 ? 360 - rawDiff : rawDiff;

        const aspectTypes = [
          { angle: 0, color: '#FFD700', name: 'Conjunción', width: 2 },
          { angle: 60, color: '#4169E1', name: 'Sextil', width: 1.5 },
          { angle: 90, color: '#DC143C', name: 'Cuadratura', width: 2 },
          { angle: 120, color: '#32CD32', name: 'Trígono', width: 2 },
          { angle: 180, color: '#FF4500', name: 'Oposición', width: 2 }
        ];

        const orb = 8;
        const aspect = aspectTypes.find(a => Math.abs(diff - a.angle) <= orb);

        if (aspect) {
          const p1 = degToPoint(planets[i].degree, planetRadius - 30);
          const p2 = degToPoint(planets[j].degree, planetRadius - 30);

          aspects.push(
            <line
              key={`aspect-${i}-${j}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={aspect.color}
              strokeWidth={aspect.width}
              opacity={0.4}
            />
          );
        }
      }
    }

    return <g>{aspects}</g>;
  };

  // Marcador del Ascendente
  const renderAscendant = () => {
    const point = degToPoint(exampleData.ascendant, houseRadius + 15);
    return (
      <g>
        <text
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fill="#DC143C"
          fontWeight={700}
        >
          AC
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Carta Natal</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAspects}
              onChange={(e) => setShowAspects(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">Mostrar aspectos</span>
          </label>
        </div>

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="border border-gray-200 rounded-lg bg-white"
        >
          {/* Círculos base */}
          {renderCircles()}

          {/* Aspectos (detrás de todo) */}
          {renderAspects()}

          {/* Signos zodiacales */}
          {renderZodiacSigns()}

          {/* Casas */}
          {renderHouses()}

          {/* Planetas */}
          {renderPlanets()}

          {/* Ascendente */}
          {renderAscendant()}
        </svg>

        <div className="mt-4 grid grid-cols-5 gap-3 text-sm">
          {exampleData.planets.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="text-lg">{p.symbol}</span>
              <span className="text-gray-600">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 max-w-2xl">
        <h3 className="font-semibold mb-2">Próximos pasos:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Integrar cálculos reales con <code className="bg-gray-100 px-1">swisseph</code> o <code className="bg-gray-100 px-1">astronomy-engine</code></li>
          <li>• Añadir sistema de casas (Placidus, Koch, etc.)</li>
          <li>• Implementar tabla de aspectos</li>
          <li>• Añadir exportación a PDF/PNG</li>
          <li>• Mejorar colisión de etiquetas cuando planetas están cerca</li>
        </ul>
      </div>
    </div>
  );
};

export default AstroChart;
