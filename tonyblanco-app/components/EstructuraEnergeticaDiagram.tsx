'use client';

/**
 * Componente para visualizar la Estructura Energética
 * Muestra un diagrama con círculos (dominantes/maestrías) y cuadrados (ausentes/kármicos)
 * conectados con flechas verdes (flujo energético) y rojas (bloqueos)
 */

interface EstructuraEnergeticaProps {
  imagen_alma?: number[];
  razones_karmicas?: number[];
  familias?: Record<string, { total: number; miembros: Record<string, number> }>;
}

export default function EstructuraEnergeticaDiagram({
  imagen_alma = [],
  razones_karmicas = [],
  familias = {}
}: EstructuraEnergeticaProps) {
  // Posiciones de los números en el diagrama (estilo estrella/mandala)
  const positions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 50 },   // Arriba derecha
    2: { x: 200, y: 100 },  // Arriba izquierda  
    3: { x: 400, y: 120 },  // Arriba derecha
    4: { x: 100, y: 200 },  // Izquierda
    5: { x: 500, y: 200 },  // Derecha
    6: { x: 300, y: 250 },  // Centro
    7: { x: 300, y: 400 },  // Abajo
    8: { x: 450, y: 350 },  // Abajo derecha
    9: { x: 150, y: 350 },  // Abajo izquierda
    10: { x: 400, y: 200 }, // Centro derecha (opcional)
  };

  // Definir conexiones (flechas)
  const connections = [
    // Flechas verdes (flujo positivo) - números dominantes
    { from: 6, to: 1, type: 'green' },
    { from: 6, to: 5, type: 'green' },
    { from: 6, to: 9, type: 'green' },
    { from: 9, to: 3, type: 'green' },
    { from: 4, to: 6, type: 'green' },
    { from: 7, to: 6, type: 'green' },
    // Flechas rojas (bloqueos) - números ausentes
    { from: 2, to: 6, type: 'red' },
    { from: 6, to: 8, type: 'red' },
    { from: 5, to: 6, type: 'red' },
    { from: 6, to: 2, type: 'red' },
  ];

  const isImagenAlma = (num: number) => imagen_alma.includes(num);
  const isRazonKarmica = (num: number) => razones_karmicas.includes(num);
  
  const getNodeFrequency = (num: number) => {
    if (familias[num]) {
      return familias[num].total;
    }
    return 0;
  };

  const getNodeSize = (num: number) => {
    const freq = getNodeFrequency(num);
    if (freq >= 6) return 45; // Maestría alta
    if (freq >= 3) return 35; // Maestría
    if (freq === 0) return 30; // Ausente
    return 32; // Normal
  };

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-center">⚡ Estructura Energética</h3>
      
      <svg viewBox="0 0 600 500" className="w-full h-auto">
        {/* Definir marcadores de flecha */}
        <defs>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
          <marker
            id="arrowhead-red"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {/* Dibujar conexiones (flechas) */}
        {connections.map((conn, idx) => {
          const from = positions[conn.from];
          const to = positions[conn.to];
          if (!from || !to) return null;

          const color = conn.type === 'green' ? '#10b981' : '#ef4444';
          const marker = conn.type === 'green' ? 'url(#arrowhead-green)' : 'url(#arrowhead-red)';

          return (
            <line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="2"
              markerEnd={marker}
              opacity="0.6"
            />
          );
        })}

        {/* Dibujar nodos (números) */}
        {Object.entries(positions).map(([numStr, pos]) => {
          const num = parseInt(numStr);
          const freq = getNodeFrequency(num);
          const isAlma = isImagenAlma(num);
          const isKarmica = isRazonKarmica(num);
          const size = getNodeSize(num);

          let fillColor = '#4b5563'; // gray-600 default
          let strokeColor = '#6b7280'; // gray-500
          let shape = 'circle';

          if (isKarmica) {
            fillColor = '#7f1d1d'; // red-900
            strokeColor = '#dc2626'; // red-600
            shape = 'rect'; // Cuadrado para kármicos
          } else if (isAlma || freq >= 3) {
            fillColor = '#065f46'; // green-800
            strokeColor = '#10b981'; // green-500
            shape = 'circle'; // Círculo para dominantes
          }

          return (
            <g key={num}>
              {shape === 'circle' ? (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size / 2}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ) : (
                <rect
                  x={pos.x - size / 2}
                  y={pos.y - size / 2}
                  width={size}
                  height={size}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              )}
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {num}
              </text>
              {freq > 0 && (
                <text
                  x={pos.x}
                  y={pos.y + 30}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {freq}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-800 border-2 border-green-500"></div>
          <span className="text-gray-300">Imagen Alma / Maestría</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-900 border-2 border-red-600"></div>
          <span className="text-gray-300">Razón Kármica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-green-500"></div>
            <div className="w-0 h-0 border-l-8 border-l-green-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
          <span className="text-gray-300">Flujo Energético</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-red-500"></div>
            <div className="w-0 h-0 border-l-8 border-l-red-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
          <span className="text-gray-300">Bloqueo</span>
        </div>
      </div>
    </div>
  );
}
