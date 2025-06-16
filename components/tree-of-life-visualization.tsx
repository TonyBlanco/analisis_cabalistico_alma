
'use client';

import { motion } from 'framer-motion';

interface TreeOfLifeProps {
  calculations: any;
}

export function TreeOfLifeVisualization({ calculations }: TreeOfLifeProps) {
  const sefirot = [
    { name: 'Keter', x: 50, y: 10, color: '#FFFFFF', active: calculations.temaOrigen === 1 || calculations.principioTransformacion === 1 || calculations.temaDestino === 1 },
    { name: 'Chokmah', x: 25, y: 25, color: '#87CEEB', active: calculations.temaOrigen === 2 || calculations.principioTransformacion === 2 || calculations.temaDestino === 2 },
    { name: 'Binah', x: 75, y: 25, color: '#8B0000', active: calculations.temaOrigen === 3 || calculations.principioTransformacion === 3 || calculations.temaDestino === 3 },
    { name: 'Chesed', x: 25, y: 45, color: '#4169E1', active: calculations.temaOrigen === 4 || calculations.principioTransformacion === 4 || calculations.temaDestino === 4 },
    { name: 'Geburah', x: 75, y: 45, color: '#DC143C', active: calculations.temaOrigen === 5 || calculations.principioTransformacion === 5 || calculations.temaDestino === 5 },
    { name: 'Tiferet', x: 50, y: 50, color: '#FFD700', active: calculations.temaOrigen === 6 || calculations.principioTransformacion === 6 || calculations.temaDestino === 6 },
    { name: 'Netzach', x: 25, y: 70, color: '#32CD32', active: calculations.temaOrigen === 7 || calculations.principioTransformacion === 7 || calculations.temaDestino === 7 },
    { name: 'Hod', x: 75, y: 70, color: '#FF8C00', active: calculations.temaOrigen === 8 || calculations.principioTransformacion === 8 || calculations.temaDestino === 8 },
    { name: 'Yesod', x: 50, y: 80, color: '#9370DB', active: calculations.temaOrigen === 9 || calculations.principioTransformacion === 9 || calculations.temaDestino === 9 },
    { name: 'Malkut', x: 50, y: 95, color: '#8B4513', active: true }
  ];

  const paths = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
    [5, 6], [5, 7], [6, 7], [6, 8], [7, 8], [8, 9]
  ];

  return (
    <div className="w-full h-96 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Paths */}
        {paths.map(([start, end], index) => (
          <motion.line
            key={index}
            x1={sefirot[start].x}
            y1={sefirot[start].y}
            x2={sefirot[end].x}
            y2={sefirot[end].y}
            stroke="rgba(255, 215, 0, 0.3)"
            strokeWidth="0.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: index * 0.1 }}
          />
        ))}

        {/* Sefirot */}
        {sefirot.map((sefira, index) => (
          <motion.g key={sefira.name}>
            <motion.circle
              cx={sefira.x}
              cy={sefira.y}
              r={sefira.active ? "3" : "2"}
              fill={sefira.active ? sefira.color : "rgba(255, 255, 255, 0.3)"}
              stroke={sefira.active ? "#FFD700" : "rgba(255, 255, 255, 0.5)"}
              strokeWidth="0.2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={sefira.active ? "drop-shadow-lg" : ""}
            />
            <motion.text
              x={sefira.x}
              y={sefira.y - 4}
              textAnchor="middle"
              fontSize="2"
              fill={sefira.active ? "#FFD700" : "#FFFFFF"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
            >
              {sefira.name}
            </motion.text>
          </motion.g>
        ))}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-xs text-purple-300">
          Las Sefirot iluminadas representan tus centros energéticos activos
        </p>
      </div>
    </div>
  );
}
