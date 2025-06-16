
'use client';

import { motion } from 'framer-motion';

interface MandalaProps {
  calculations: any;
}

export function MandalaVisualization({ calculations }: MandalaProps) {
  const centerNumber = calculations.estructuraEnergetica;
  
  // Obtener números de cuentas pendientes con sus frecuencias
  const cuentasPendientes = Object.entries(calculations.cuentasPendientes || {});
  const frecuenciasValues = Object.values(calculations.cuentasPendientes || {}).map(v => Number(v));
  const maxFrecuencia = frecuenciasValues.length > 0 ? Math.max(...frecuenciasValues, 1) : 1;
  
  // Usar imagen del alma completa si está disponible, sino cuentas pendientes, sino números fundamentales
  let numbers;
  if (calculations.imagenAlmaCompleta && Object.keys(calculations.imagenAlmaCompleta.frecuencias).length > 0) {
    const imagenFrecuencias = Object.entries(calculations.imagenAlmaCompleta.frecuencias);
    numbers = imagenFrecuencias.slice(0, 8).map(([numero, frecuencia]) => ({ numero: parseInt(numero), frecuencia: Number(frecuencia) }));
  } else if (cuentasPendientes.length > 0) {
    numbers = cuentasPendientes.slice(0, 6).map(([numero, frecuencia]) => ({ numero: parseInt(numero), frecuencia: Number(frecuencia) }));
  } else {
    numbers = [
      { numero: calculations.temaOrigen, frecuencia: 1 },
      { numero: calculations.principioTransformacion, frecuencia: 1 },
      { numero: calculations.temaDestino, frecuencia: 1 },
      { numero: calculations.vibracionCuerpo % 100, frecuencia: 1 },
      { numero: calculations.vibracionAlma % 100, frecuencia: 1 },
      { numero: calculations.vibracionEspiritu % 100, frecuencia: 1 }
    ];
  }

  const colors = [
    '#FFD700', // Dorado
    '#9370DB', // Púrpura
    '#1E3A8A', // Azul profundo
    '#059669', // Verde esmeralda
    '#DC2626', // Rojo
    '#F59E0B'  // Ámbar
  ];

  return (
    <div className="w-full h-80 relative flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Círculos concéntricos de fondo */}
        {[60, 80, 100, 120].map((radius, index) => (
          <motion.circle
            key={radius}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255, 215, 0, 0.1)"
            strokeWidth="0.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: index * 0.2 }}
          />
        ))}

        {/* Números exteriores con frecuencias */}
        {numbers.map((item, index) => {
          const angle = (index * 60) - 90; // Distribuir en círculo
          const radius = 70;
          const x = 100 + radius * Math.cos(angle * Math.PI / 180);
          const y = 100 + radius * Math.sin(angle * Math.PI / 180);
          
          // Calcular tamaño del círculo basado en frecuencia
          const baseRadius = 12;
          const radiusMultiplier = cuentasPendientes.length > 0 ? 
            1 + (item.frecuencia / maxFrecuencia) * 0.5 : 1;
          const circleRadius = baseRadius * radiusMultiplier;

          return (
            <motion.g key={index}>
              <motion.circle
                cx={x}
                cy={y}
                r={circleRadius}
                fill={colors[index]}
                stroke="#FFD700"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                className="drop-shadow-lg"
              />
              <motion.text
                x={x}
                y={y + 2}
                textAnchor="middle"
                fontSize="8"
                fill="#FFFFFF"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.3 + 0.5 }}
              >
                {item.numero}
              </motion.text>
              {/* Mostrar barras de frecuencia si hay cuentas pendientes */}
              {cuentasPendientes.length > 0 && (
                <motion.text
                  x={x}
                  y={y - circleRadius - 5}
                  textAnchor="middle"
                  fontSize="6"
                  fill="#FFD700"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.3 + 0.7 }}
                >
                  {'|'.repeat(Math.min(item.frecuencia, 5))}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Número central */}
        <motion.g>
          <motion.circle
            cx="100"
            cy="100"
            r="20"
            fill="url(#centerGradient)"
            stroke="#FFD700"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="drop-shadow-xl"
          />
          <motion.text
            x="100"
            y="105"
            textAnchor="middle"
            fontSize="12"
            fill="#FFFFFF"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
          >
            {centerNumber}
          </motion.text>
        </motion.g>

        {/* Líneas conectoras */}
        {numbers.map((_, index) => {
          const angle = (index * 60) - 90;
          const radius = 70;
          const x = 100 + radius * Math.cos(angle * Math.PI / 180);
          const y = 100 + radius * Math.sin(angle * Math.PI / 180);

          return (
            <motion.line
              key={index}
              x1="100"
              y1="100"
              x2={x}
              y2={y}
              stroke="rgba(255, 215, 0, 0.4)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.2 + 1 }}
            />
          );
        })}

        {/* Gradiente para el centro */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#9370DB" />
          </radialGradient>
        </defs>
      </svg>

      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-xs text-purple-300">
          Tu Mandala Personal de Cuentas Pendientes
        </p>
      </div>
    </div>
  );
}
