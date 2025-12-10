'use client';

import React from 'react';
import { getAngelName } from '@/lib/angels_db';

interface AngelsWheelProps {
  angelFisico: number;  // 1-72
  angelMental: number;  // 1-72
  angelEmocional: number; // 1-72
}

export default function AngelsWheel({ angelFisico, angelMental, angelEmocional }: AngelsWheelProps) {
  // Obtener nombres en hebreo
  const nombreFisico = getAngelName(angelFisico);
  const nombreEmocional = getAngelName(angelEmocional);
  const nombreMental = getAngelName(angelMental);
  
  // Configuración del SVG
  const radius = 150;
  const center = 150;
  const size = 300;

  // Signos del Zodíaco (Unicode o Emojis para simplificar, se puede usar paths SVG)
  const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  // Función para calcular coordenadas polares a cartesianas
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Restamos 90 grados para que el 0 empiece arriba (las 12 en punto)
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Función para dibujar un sector (un arco de 5 grados)
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y // Cierra el camino volviendo al centro
    ].join(" ");
  };

  // Generamos los 72 sectores
  const sectors = Array.from({ length: 72 }, (_, i) => {
    const index = i + 1; // Ángeles del 1 al 72
    const startAngle = i * 5;
    const endAngle = (i + 1) * 5;
    
    // Determinar si este sector está activo
    let fillColor = "transparent";
    let strokeColor = "rgba(255, 255, 255, 0.1)";
    let opacity = 0.5;
    let isActive = false;

    // Prioridad de colores si se solapan
    if (index === angelFisico) {
      fillColor = "#fbbf24"; // Amber-400 (Sol/Destino)
      strokeColor = "#fbbf24";
      opacity = 1;
      isActive = true;
    } else if (index === angelMental) {
      fillColor = "#22d3ee"; // Cyan-400 (Mental/Intelecto)
      strokeColor = "#22d3ee";
      opacity = 1;
      isActive = true;
    } else if (index === angelEmocional) {
      fillColor = "#f472b6"; // Pink-400 (Emocional - si es diferente)
      // Si solapa con físico, usamos un gradiente o patrón (aquí simplificado)
      if (index !== angelFisico) {
        fillColor = "#f472b6";
        strokeColor = "#f472b6";
        opacity = 1;
        isActive = true;
      }
    }

    return (
      <path
        key={index}
        d={describeArc(center, center, radius - 40, startAngle, endAngle)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isActive ? 2 : 0.5}
        fillOpacity={isActive ? 0.8 : 0}
        className="transition-all duration-500"
      />
    );
  });

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square flex items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="rotate-0">
        {/* Fondo del círculo */}
        <circle cx={center} cy={center} r={radius} fill="#0f172a" stroke="#312e81" strokeWidth="2" />
        
        {/* Anillo de los 72 sectores (Ángeles) */}
        <g>{sectors}</g>

        {/* Anillo del Zodíaco (Exterior) */}
        {zodiacSigns.map((sign, i) => {
          const angle = (i * 30) + 15; // Centrar en el sector de 30 grados
          const pos = polarToCartesian(center, center, radius - 20, angle);
          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="20"
              className="font-serif select-none"
            >
              {sign}
            </text>
          );
        })}

        {/* Círculo central (Hueco) */}
        <circle cx={center} cy={center} r={radius - 90} fill="#020617" stroke="#312e81" strokeWidth="1" />

        {/* Leyenda Central MEJORADA */}
        <g className="font-sans" textAnchor="middle">
          {/* Físico (Arriba) */}
          <text x={center} y={center - 35} fill="#fbbf24" fontSize="10" fontWeight="bold" opacity="0.7">FÍSICO</text>
          <text x={center} y={center - 15} fill="#fbbf24" fontSize="24" fontWeight="bold" className="font-serif">
            {nombreFisico.hebrew}
          </text>
          
          {/* Separador */}
          <line x1={center - 20} y1={center} x2={center + 20} y2={center} stroke="rgba(255,255,255,0.1)" />

          {/* Emocional (Izquierda) y Mental (Derecha) */}
          <text x={center - 35} y={center + 20} fill="#f472b6" fontSize="18" fontWeight="bold" className="font-serif">
            {nombreEmocional.hebrew}
          </text>
          <text x={center + 35} y={center + 20} fill="#22d3ee" fontSize="18" fontWeight="bold" className="font-serif">
            {nombreMental.hebrew}
          </text>
          
          {/* Etiquetas pequeñas */}
          <text x={center - 35} y={center + 35} fill="#f472b6" fontSize="8" opacity="0.7">EMOCIONAL</text>
          <text x={center + 35} y={center + 35} fill="#22d3ee" fontSize="8" opacity="0.7">MENTAL</text>
        </g>
      </svg>
      
      {/* Efecto de brillo detrás */}
      <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full"></div>
    </div>
  );
}

