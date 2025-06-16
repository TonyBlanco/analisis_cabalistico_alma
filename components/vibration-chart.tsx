
'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface VibrationChartProps {
  calculations: any;
}

export function VibrationChart({ calculations }: VibrationChartProps) {
  const data = [
    {
      subject: 'Cuerpo',
      value: Math.min(calculations.vibracionCuerpo % 100, 50), // Normalizar valores grandes
      fullMark: 50,
    },
    {
      subject: 'Alma',
      value: Math.min(calculations.vibracionAlma % 100, 50),
      fullMark: 50,
    },
    {
      subject: 'Espíritu',
      value: Math.min(calculations.vibracionEspiritu % 100, 50),
      fullMark: 50,
    },
    {
      subject: 'Hoy',
      value: calculations.vibracionHoy,
      fullMark: 10,
    },
    {
      subject: 'Origen',
      value: calculations.temaOrigen,
      fullMark: 10,
    },
    {
      subject: 'Transformación',
      value: calculations.principioTransformacion,
      fullMark: 10,
    },
    {
      subject: 'Destino',
      value: calculations.temaDestino,
      fullMark: 10,
    },
    {
      subject: 'Estructura',
      value: calculations.estructuraEnergetica,
      fullMark: 10,
    },
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255, 215, 0, 0.3)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 10, fill: '#E5E7EB' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fontSize: 8, fill: '#9CA3AF' }}
          />
          <Radar
            name="Vibraciones"
            dataKey="value"
            stroke="#FFD700"
            fill="rgba(255, 215, 0, 0.3)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', color: '#E5E7EB' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
