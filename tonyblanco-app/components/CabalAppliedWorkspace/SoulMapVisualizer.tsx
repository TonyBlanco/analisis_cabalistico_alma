'use client';

/**
 * SoulMapVisualizer.tsx - P2.1 Soul Maps Visualization
 * 
 * Visualiza el mapa del alma con el Árbol de la Vida.
 * Este componente es OBSERVACIONAL - muestra datos, no interpreta.
 * 
 * Usa SVG para la visualización del Árbol de la Vida con Sefirot
 * y senderos conectores.
 */

import { useEffect, useRef, useState } from 'react';
import { Download, Save, AlertTriangle, RefreshCw, Loader2, Info } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-base';

interface SoulMap {
  meta: {
    birth_date: string;
    full_name: string;
    analysis_date: string;
    generated_at: string;
    age: number;
  };
  primary_sefirot: {
    life_path: {
      sefira: string;
      details: { id: string; name: string; position: number; meaning: string };
      description: string;
    };
    name_essence: {
      sefira: string;
      details: { id: string; name: string; position: number; meaning: string };
      description: string;
    };
    current_cycle: {
      sefira: string;
      details: { id: string; name: string; position: number; meaning: string };
      description: string;
    };
  };
  sefira_intensities: { [key: string]: number };
  synchronicities: string[];
  disclaimer: string;
}

// NEW: Props that accept consultante data for dynamic loading
interface SoulMapVisualizerProps {
  consultanteId: number | null;
  consultanteName: string | null;
  birthDate: string | null;
  soulMap?: SoulMap; // Optional: if provided, skip loading
  onSave?: () => void;
  onExportPDF?: () => void;
}

// Posiciones de Sefirot en el Árbol (coordenadas relativas 0-1)
const SEFIROT_POSITIONS: { [key: string]: { x: number; y: number } } = {
  keter: { x: 0.5, y: 0.05 },
  chokmah: { x: 0.25, y: 0.15 },
  binah: { x: 0.75, y: 0.15 },
  chesed: { x: 0.25, y: 0.35 },
  gevurah: { x: 0.75, y: 0.35 },
  tiferet: { x: 0.5, y: 0.45 },
  netzach: { x: 0.25, y: 0.65 },
  hod: { x: 0.75, y: 0.65 },
  yesod: { x: 0.5, y: 0.78 },
  malkuth: { x: 0.5, y: 0.93 },
};

// Senderos conectores del Árbol
const PATHS: [string, string][] = [
  ['keter', 'chokmah'], ['keter', 'binah'], ['keter', 'tiferet'],
  ['chokmah', 'binah'], ['chokmah', 'chesed'], ['chokmah', 'tiferet'],
  ['binah', 'gevurah'], ['binah', 'tiferet'],
  ['chesed', 'gevurah'], ['chesed', 'tiferet'], ['chesed', 'netzach'],
  ['gevurah', 'tiferet'], ['gevurah', 'hod'],
  ['tiferet', 'netzach'], ['tiferet', 'hod'], ['tiferet', 'yesod'],
  ['netzach', 'hod'], ['netzach', 'yesod'],
  ['hod', 'yesod'],
  ['yesod', 'malkuth'],
];

// Nombres de Sefirot en español
const SEFIRA_NAMES: { [key: string]: string } = {
  keter: 'Keter',
  chokmah: 'Chokmah',
  binah: 'Binah',
  chesed: 'Chesed',
  gevurah: 'Gevurah',
  tiferet: 'Tiferet',
  netzach: 'Netzach',
  hod: 'Hod',
  yesod: 'Yesod',
  malkuth: 'Malkuth',
};

export default function SoulMapVisualizer({ 
  consultanteId,
  consultanteName,
  birthDate,
  soulMap: propSoulMap, 
  onSave, 
  onExportPDF 
}: SoulMapVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSefira, setHoveredSefira] = useState<string | null>(null);
  const [loadedSoulMap, setLoadedSoulMap] = useState<SoulMap | null>(propSoulMap || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const width = 400;
  const height = 500;

  // Load soul map data from backend if not provided
  useEffect(() => {
    if (propSoulMap) {
      setLoadedSoulMap(propSoulMap);
      return;
    }
    
    if (!consultanteId || !birthDate) {
      return;
    }

    const fetchSoulMap = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No authentication token');
        }

        const apiBase = getApiBaseUrl();
        const response = await fetch(
          `${apiBase}/api/swm/cabala/soul-map/?consultante_id=${consultanteId}`,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Generate default soul map from birth date
            setLoadedSoulMap(generateDefaultSoulMap(consultanteName || 'Consultante', birthDate));
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        setLoadedSoulMap(data);
      } catch (err: any) {
        // Fallback: generate from available data
        if (birthDate) {
          setLoadedSoulMap(generateDefaultSoulMap(consultanteName || 'Consultante', birthDate));
        } else {
          setError(err.message || 'Error cargando mapa del alma');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSoulMap();
  }, [consultanteId, birthDate, propSoulMap, consultanteName]);

  // Generate a default soul map from birth date using basic numerology
  function generateDefaultSoulMap(name: string, birthDateStr: string): SoulMap {
    const date = new Date(birthDateStr);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    
    // Simple reduction to 1-10 for Sefira mapping
    const reduceToSefira = (num: number): number => {
      let n = num;
      while (n > 10) {
        n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
      }
      return n || 1;
    };
    
    const lifePathNum = reduceToSefira(day + month + year);
    const nameNum = reduceToSefira(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    const currentYear = new Date().getFullYear();
    const cycleNum = reduceToSefira(currentYear - year);
    
    const sefirotByNumber: { [key: number]: string } = {
      1: 'keter', 2: 'chokmah', 3: 'binah', 4: 'chesed', 5: 'gevurah',
      6: 'tiferet', 7: 'netzach', 8: 'hod', 9: 'yesod', 10: 'malkuth'
    };
    
    const sefirotDetails: { [key: string]: { id: string; name: string; position: number; meaning: string } } = {
      keter: { id: 'keter', name: 'Keter', position: 1, meaning: 'Corona - Voluntad Divina' },
      chokmah: { id: 'chokmah', name: 'Chokmah', position: 2, meaning: 'Sabiduría - Inspiración' },
      binah: { id: 'binah', name: 'Binah', position: 3, meaning: 'Entendimiento - Comprensión' },
      chesed: { id: 'chesed', name: 'Chesed', position: 4, meaning: 'Misericordia - Bondad' },
      gevurah: { id: 'gevurah', name: 'Gevurah', position: 5, meaning: 'Rigor - Fuerza' },
      tiferet: { id: 'tiferet', name: 'Tiferet', position: 6, meaning: 'Belleza - Armonía' },
      netzach: { id: 'netzach', name: 'Netzach', position: 7, meaning: 'Victoria - Eternidad' },
      hod: { id: 'hod', name: 'Hod', position: 8, meaning: 'Gloria - Esplendor' },
      yesod: { id: 'yesod', name: 'Yesod', position: 9, meaning: 'Fundamento - Conexión' },
      malkuth: { id: 'malkuth', name: 'Malkuth', position: 10, meaning: 'Reino - Manifestación' },
    };
    
    const lifePathSefira = sefirotByNumber[lifePathNum] || 'tiferet';
    const nameSefira = sefirotByNumber[nameNum] || 'tiferet';
    const cycleSefira = sefirotByNumber[cycleNum] || 'tiferet';
    
    // Calculate basic intensities
    const intensities: { [key: string]: number } = {};
    Object.keys(sefirotDetails).forEach(sefira => {
      intensities[sefira] = 0.1;
    });
    intensities[lifePathSefira] = (intensities[lifePathSefira] || 0) + 0.4;
    intensities[nameSefira] = (intensities[nameSefira] || 0) + 0.3;
    intensities[cycleSefira] = (intensities[cycleSefira] || 0) + 0.2;
    
    return {
      meta: {
        birth_date: birthDateStr,
        full_name: name,
        analysis_date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString(),
        age: currentYear - year,
      },
      primary_sefirot: {
        life_path: {
          sefira: lifePathSefira,
          details: sefirotDetails[lifePathSefira],
          description: `Sendero de vida a través de ${sefirotDetails[lifePathSefira].name}`,
        },
        name_essence: {
          sefira: nameSefira,
          details: sefirotDetails[nameSefira],
          description: `Esencia del nombre resonando con ${sefirotDetails[nameSefira].name}`,
        },
        current_cycle: {
          sefira: cycleSefira,
          details: sefirotDetails[cycleSefira],
          description: `Ciclo actual influenciado por ${sefirotDetails[cycleSefira].name}`,
        },
      },
      sefira_intensities: intensities,
      synchronicities: [],
      disclaimer: 'Este mapa es simbólico y observacional. No constituye diagnóstico ni predicción.',
    };
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-2 text-sm">Cargando Mapa del Alma...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600">
        <AlertTriangle className="h-8 w-8" />
        <p className="mt-2 text-sm">{error}</p>
        {consultanteId && birthDate && (
          <button
            onClick={() => setLoadedSoulMap(generateDefaultSoulMap(consultanteName || 'Consultante', birthDate))}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Generar desde datos básicos
          </button>
        )}
      </div>
    );
  }

  // No data state
  if (!loadedSoulMap) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <AlertTriangle className="h-6 w-6" />
        <p className="mt-2 text-sm">No hay datos disponibles para el Mapa del Alma.</p>
        <p className="text-xs text-gray-400 mt-1">Seleccione un consultante con fecha de nacimiento.</p>
      </div>
    );
  }

  const soulMap = loadedSoulMap;

  // Determina si una Sefirá es primaria
  const isPrimarySefira = (sefira: string): boolean => {
    return (
      soulMap.primary_sefirot.life_path.sefira === sefira ||
      soulMap.primary_sefirot.name_essence.sefira === sefira ||
      soulMap.primary_sefirot.current_cycle.sefira === sefira
    );
  };

  // Obtiene color de la Sefirá basado en intensidad y si es primaria
  const getSefiraColor = (sefira: string): string => {
    const intensity = soulMap.sefira_intensities[sefira] || 0;
    const isPrimary = isPrimarySefira(sefira);

    if (isPrimary) {
      return '#9f7aea'; // purple-500
    }
    if (intensity > 0.5) {
      return '#f56565'; // red-500
    }
    if (intensity > 0.2) {
      return '#ed8936'; // orange-500
    }
    return '#e9d8fd'; // purple-100
  };

  return (
    <div className="soul-map-container bg-white dark:bg-gray-900 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mapa del Alma</h3>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
            <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Visualización Simbólica del Alma</p>
              <p>• Árbol de la Vida con Sefirot primarias</p>
              <p>• Resonancias basadas en nombre y fecha</p>
              <p>• Intensidades de energía por Sefirá</p>
              <p>• NO es predicción, es contemplación</p>
              <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {soulMap.disclaimer}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel izquierdo: Info del mapa */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Sefirot Primarias
            </h4>
            <div className="space-y-2">
              <SefiraCard
                label="Camino de Vida"
                sefira={soulMap.primary_sefirot.life_path.sefira}
                details={soulMap.primary_sefirot.life_path.details}
                color="purple"
              />
              <SefiraCard
                label="Esencia del Nombre"
                sefira={soulMap.primary_sefirot.name_essence.sefira}
                details={soulMap.primary_sefirot.name_essence.details}
                color="blue"
              />
              <SefiraCard
                label="Ciclo Actual"
                sefira={soulMap.primary_sefirot.current_cycle.sefira}
                details={soulMap.primary_sefirot.current_cycle.details}
                color="green"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Datos del Consultante
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div><span className="font-medium">Nombre:</span> {soulMap.meta.full_name}</div>
              <div><span className="font-medium">Nacimiento:</span> {new Date(soulMap.meta.birth_date).toLocaleDateString('es-ES')}</div>
              <div><span className="font-medium">Edad:</span> {soulMap.meta.age} años</div>
              <div><span className="font-medium">Generado:</span> {new Date(soulMap.meta.generated_at).toLocaleString('es-ES')}</div>
            </div>
          </div>

          {soulMap.synchronicities.length > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
              <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                ✨ Sincronicidades
              </h4>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                {soulMap.synchronicities.map((sync, idx) => (
                  <li key={idx}>{sync}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar Mapa
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar PDF
              </button>
            )}
          </div>
        </div>

        {/* Panel derecho: Árbol de la Vida SVG */}
        <div className="flex justify-center items-center">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {/* Senderos */}
            {PATHS.map(([from, to], idx) => {
              const fromPos = SEFIROT_POSITIONS[from];
              const toPos = SEFIROT_POSITIONS[to];
              return (
                <line
                  key={`path-${idx}`}
                  x1={fromPos.x * width}
                  y1={fromPos.y * height}
                  x2={toPos.x * width}
                  y2={toPos.y * height}
                  stroke="#cbd5e0"
                  strokeWidth={2}
                  opacity={0.4}
                />
              );
            })}

            {/* Sefirot */}
            {Object.entries(SEFIROT_POSITIONS).map(([sefira, pos]) => {
              const intensity = soulMap.sefira_intensities[sefira] || 0;
              const isPrimary = isPrimarySefira(sefira);
              const isHovered = hoveredSefira === sefira;
              const color = getSefiraColor(sefira);
              const radius = isPrimary ? 28 : 22;

              return (
                <g
                  key={sefira}
                  onMouseEnter={() => setHoveredSefira(sefira)}
                  onMouseLeave={() => setHoveredSefira(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Círculo de fondo */}
                  <circle
                    cx={pos.x * width}
                    cy={pos.y * height}
                    r={radius + (isHovered ? 4 : 0)}
                    fill={color}
                    stroke={isPrimary ? '#805ad5' : '#9f7aea'}
                    strokeWidth={isPrimary ? 3 : 1}
                    opacity={0.3 + Math.min(0.7, intensity + (isPrimary ? 0.5 : 0))}
                  />
                  {/* Círculo principal */}
                  <circle
                    cx={pos.x * width}
                    cy={pos.y * height}
                    r={radius}
                    fill={color}
                    stroke={isPrimary ? '#805ad5' : '#9f7aea'}
                    strokeWidth={isPrimary ? 3 : 1}
                    opacity={0.8}
                  />
                  {/* Nombre de la Sefirá */}
                  <text
                    x={pos.x * width}
                    y={pos.y * height + 4}
                    textAnchor="middle"
                    fontSize={isPrimary ? 11 : 9}
                    fontWeight={isPrimary ? 'bold' : 'normal'}
                    fill="#2d3748"
                  >
                    {SEFIRA_NAMES[sefira]}
                  </text>
                  {/* Indicador de intensidad */}
                  {intensity > 0 && (
                    <circle
                      cx={pos.x * width + radius - 5}
                      cy={pos.y * height - radius + 5}
                      r={8}
                      fill="#f56565"
                      opacity={intensity}
                    />
                  )}
                </g>
              );
            })}

            {/* Leyenda */}
            <g transform={`translate(10, ${height - 60})`}>
              <circle cx={10} cy={10} r={8} fill="#9f7aea" stroke="#805ad5" strokeWidth={2} />
              <text x={25} y={14} fontSize={10} fill="#4a5568">Sefirá Primaria</text>
              
              <circle cx={10} cy={35} r={6} fill="#f56565" opacity={0.7} />
              <text x={25} y={39} fontSize={10} fill="#4a5568">Intensidad clínica</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Info de Sefirá hovereada */}
      {hoveredSefira && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {SEFIRA_NAMES[hoveredSefira]}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {isPrimarySefira(hoveredSefira) && '★ Sefirá primaria en tu mapa'}
            {(soulMap.sefira_intensities[hoveredSefira] || 0) > 0 && (
              <span className="ml-2 text-red-600">
                Intensidad: {Math.round((soulMap.sefira_intensities[hoveredSefira] || 0) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card para mostrar info de Sefirá primaria
 */
function SefiraCard({
  label,
  sefira,
  details,
  color,
}: {
  label: string;
  sefira: string;
  details: { id: string; name: string; position: number; meaning: string };
  color: 'purple' | 'blue' | 'green';
}) {
  const colorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  return (
    <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {details.name || sefira}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {details.meaning || ''}
      </div>
    </div>
  );
}

export type { SoulMap };
