/**
 * TreeWithFlows — Árbol de la Vida con Flujos Direccionales
 * 
 * Componente que renderiza TreeStructuralState v0.1 con:
 * - Sefirot activadas (halos según intensidad)
 * - Flechas dirigidas entre Sefirot (color según polaridad, grosor según intensidad)
 * - Leyenda visual obligatoria
 * 
 * NO interpreta. SOLO renderiza el estado recibido.
 */

'use client';

import type { CSSProperties } from 'react';
import TreeOfLifeSVG from './TreeOfLifeSVG';
import type { TreeSefirahId } from './tree.types';
import type { TreeStructuralState, SefiraId, FlowPolarity } from '../../../src/symbolic/tree';

interface TreeWithFlowsProps {
  /** TreeStructuralState v0.1 para renderizar */
  treeState: TreeStructuralState | null;
  
  /** Tamaño del árbol */
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  
  /** Clase CSS opcional */
  className?: string;
  
  /** Mostrar leyenda (por defecto true) */
  showLegend?: boolean;
}

/**
 * Colores semánticos según polaridad
 */
const POLARITY_COLORS: Record<FlowPolarity, string> = {
  harmonic: '#10b981',      // Verde: flujo armónico
  integrative: '#f59e0b',   // Naranja: integración
  tensional: '#ef4444',     // Rojo: tensión
};

/**
 * Convertir SefiraId a TreeSefirahId (compatible con Tree component)
 */
function toTreeSefirahId(sefiraId: SefiraId): TreeSefirahId {
  return sefiraId as TreeSefirahId;
}

export default function TreeWithFlows({
  treeState,
  size = 'md',
  className = '',
  showLegend = true,
}: TreeWithFlowsProps) {
  if (!treeState) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className="text-sm text-gray-500">Sin datos estructurales del Árbol</p>
      </div>
    );
  }

  // Mapear Sefirot activas a highlighted sefirot con opacidades
  const highlightedSefirot: TreeSefirahId[] = [];
  const highlightedSefirotOpacity: Partial<Record<TreeSefirahId, number>> = {};
  
  treeState.sefirot.forEach((sefira) => {
    const treeId = toTreeSefirahId(sefira.id);
    highlightedSefirot.push(treeId);
    highlightedSefirotOpacity[treeId] = Math.max(0.3, sefira.activation);
  });

  return (
    <div className={`relative ${className}`}>
      {/* Árbol base */}
      <TreeOfLifeSVG
        highlightedSefirot={highlightedSefirot}
        highlightedSefirotOpacity={highlightedSefirotOpacity}
        emphasis="soft"
        size={size}
        className="relative z-0"
      />

      {/* Overlay de flechas (SVG superpuesto) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 400 550"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Definir markers (puntas de flecha) para cada polaridad */}
          {(['harmonic', 'integrative', 'tensional'] as FlowPolarity[]).map((polarity) => (
            <marker
              key={polarity}
              id={`arrow-${polarity}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill={POLARITY_COLORS[polarity]}
                opacity="0.9"
              />
            </marker>
          ))}
        </defs>

        {/* Renderizar flujos como flechas curvas */}
        {treeState.flows.map((flow, idx) => {
          // Obtener coordenadas de Sefirot (aproximadas del layout canónico)
          const coords = getSefirahCoords(flow.from);
          const coordsTo = getSefirahCoords(flow.to);
          
          if (!coords || !coordsTo) return null;

          const [x1, y1] = coords;
          const [x2, y2] = coordsTo;
          
          // Calcular control point para curva suave
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const offsetX = (y2 - y1) * 0.15; // Curvatura lateral
          const offsetY = (x1 - x2) * 0.15;
          const cx = midX + offsetX;
          const cy = midY + offsetY;

          const color = POLARITY_COLORS[flow.polarity];
          const strokeWidth = 1 + flow.intensity * 2.5; // 1-3.5px según intensidad
          const opacity = 0.4 + flow.intensity * 0.5; // 0.4-0.9 según intensidad

          return (
            <path
              key={`flow-${idx}`}
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={opacity}
              markerEnd={`url(#arrow-${flow.polarity})`}
              className="transition-all duration-200"
            />
          );
        })}
      </svg>

      {/* Leyenda obligatoria */}
      {showLegend && (
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 text-xs z-20">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-green-500 rounded" />
              <span className="text-gray-700">Armónico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-500 rounded" />
              <span className="text-gray-700">Integrador</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-red-500 rounded" />
              <span className="text-gray-700">Tensional</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 border-t border-gray-200 pt-1.5 mt-1.5">
            Representación simbólica estructural · No interpretación automática
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Coordenadas aproximadas de Sefirot en el layout canónico (viewBox 400x550)
 * Basado en el layout estándar del Árbol de la Vida
 */
function getSefirahCoords(sefiraId: SefiraId): [number, number] | null {
  const coords: Record<SefiraId, [number, number]> = {
    keter: [200, 60],
    chokmah: [300, 132],
    binah: [100, 132],
    chesed: [300, 220],
    gevurah: [100, 220],
    tiferet: [200, 220],
    netzach: [300, 340],
    hod: [100, 340],
    yesod: [200, 440],
    malchut: [200, 520],
  };
  
  return coords[sefiraId] || null;
}
