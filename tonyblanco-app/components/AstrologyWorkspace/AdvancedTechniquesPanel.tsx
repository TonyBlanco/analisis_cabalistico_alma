'use client';

import { useState, useCallback } from 'react';
import { 
  Orbit, 
  Sparkles, 
  Sun, 
  Heart, 
  Music, 
  Star, 
  MapPin, 
  Moon,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';

interface TechniqueResult {
  loading: boolean;
  error: string | null;
  data: any | null;
}

interface AdvancedTechniquesPanelProps {
  patientId: string | number;
  hasNatalChart: boolean;
}

type TechniqueKey = 
  | 'transits' 
  | 'progressions' 
  | 'solarReturn' 
  | 'synastry' 
  | 'harmonics' 
  | 'fixedStars' 
  | 'relocation' 
  | 'arabicParts';

const TECHNIQUES = [
  {
    key: 'transits' as TechniqueKey,
    name: 'Tránsitos',
    description: 'Posiciones planetarias actuales vs carta natal',
    icon: Orbit,
    endpoint: '/transits/',
    method: 'GET',
    color: 'blue',
  },
  {
    key: 'progressions' as TechniqueKey,
    name: 'Progresiones Secundarias',
    description: 'Evolución interna (técnica día-por-año)',
    icon: Sparkles,
    endpoint: '/progressions/',
    method: 'GET',
    color: 'purple',
  },
  {
    key: 'solarReturn' as TechniqueKey,
    name: 'Retorno Solar',
    description: 'Carta del cumpleaños astrológico',
    icon: Sun,
    endpoint: '/solar-return/',
    method: 'GET',
    color: 'amber',
    params: { year: new Date().getFullYear() },
  },
  {
    key: 'harmonics' as TechniqueKey,
    name: 'Cartas Armónicas',
    description: 'Patrones ocultos (H4, H5, H7, H9)',
    icon: Music,
    endpoint: '/harmonics/',
    method: 'GET',
    color: 'indigo',
    params: { all: true },
  },
  {
    key: 'fixedStars' as TechniqueKey,
    name: 'Estrellas Fijas',
    description: 'Conjunciones con 55 estrellas principales',
    icon: Star,
    endpoint: '/fixed-stars/',
    method: 'GET',
    color: 'yellow',
  },
  {
    key: 'arabicParts' as TechniqueKey,
    name: 'Partes Árabes',
    description: 'Parte de la Fortuna, Espíritu y 20+ lotes',
    icon: Moon,
    endpoint: '/arabic-parts/',
    method: 'GET',
    color: 'emerald',
  },
];

export default function AdvancedTechniquesPanel({ patientId, hasNatalChart }: AdvancedTechniquesPanelProps) {
  const [results, setResults] = useState<Record<TechniqueKey, TechniqueResult>>({
    transits: { loading: false, error: null, data: null },
    progressions: { loading: false, error: null, data: null },
    solarReturn: { loading: false, error: null, data: null },
    synastry: { loading: false, error: null, data: null },
    harmonics: { loading: false, error: null, data: null },
    fixedStars: { loading: false, error: null, data: null },
    relocation: { loading: false, error: null, data: null },
    arabicParts: { loading: false, error: null, data: null },
  });

  const [expandedTechnique, setExpandedTechnique] = useState<TechniqueKey | null>(null);
  const [solarReturnYear, setSolarReturnYear] = useState(new Date().getFullYear());
  const [harmonicNumber, setHarmonicNumber] = useState(5);
  const [calculateAll, setCalculateAll] = useState(true);

  const apiURL = getApiBaseUrl();

  const fetchTechnique = useCallback(async (technique: typeof TECHNIQUES[0]) => {
    if (!hasNatalChart) {
      setResults(prev => ({
        ...prev,
        [technique.key]: { loading: false, error: 'Primero calcule la carta natal', data: null }
      }));
      return;
    }

    setResults(prev => ({
      ...prev,
      [technique.key]: { loading: true, error: null, data: null }
    }));

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      let url = `${apiURL}/therapist/patients/${patientId}${technique.endpoint}`;
      
      // Add query params
      const params = new URLSearchParams();
      if (technique.key === 'solarReturn') {
        params.append('target_year', solarReturnYear.toString());
      }
      if (technique.key === 'harmonics') {
        if (calculateAll) {
          params.append('all', 'true');
        } else {
          params.append('harmonic', harmonicNumber.toString());
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: technique.method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
        throw new Error(errorData.error || errorData.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [technique.key]: { loading: false, error: null, data }
      }));
      
      // Auto-expand on success
      setExpandedTechnique(technique.key);
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [technique.key]: { 
          loading: false, 
          error: err instanceof Error ? err.message : 'Error desconocido', 
          data: null 
        }
      }));
    }
  }, [patientId, apiURL, hasNatalChart, solarReturnYear, harmonicNumber, calculateAll]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'text-pink-500' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500' },
    };
    return colors[color] || colors.blue;
  };

  const renderResultData = (key: TechniqueKey, data: any) => {
    if (!data) return null;

    switch (key) {
      case 'transits':
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Fecha: {data.data?.transit_date || 'N/A'}
            </div>
            <div className="text-sm font-medium">
              {data.data?.significant_transits?.length || 0} tránsitos significativos
            </div>
            {data.data?.significant_transits?.slice(0, 3).map((t: any, i: number) => (
              <div key={i} className="text-xs bg-white p-2 rounded border">
                <span className="font-medium">{t.transit_planet}</span> {t.aspect_type} {t.natal_planet}
                <span className="text-gray-500 ml-2">(orbe: {t.orb}°)</span>
              </div>
            ))}
          </div>
        );

      case 'progressions':
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Edad progresada: {data.data?.progressed_age?.toFixed(1) || 'N/A'} años
            </div>
            {data.data?.progressed_moon && (
              <div className="text-sm">
                Luna Progresada: <span className="font-medium">{data.data.progressed_moon.sign}</span>
                <span className="text-gray-500 ml-2">({data.data.progressed_moon.phase})</span>
              </div>
            )}
          </div>
        );

      case 'solarReturn':
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Momento exacto: {data.data?.solar_return_datetime || 'N/A'}
            </div>
            {data.data?.ascendant && (
              <div className="text-sm">
                ASC del año: <span className="font-medium">{data.data.ascendant.sign}</span> {data.data.ascendant.degree}°
              </div>
            )}
          </div>
        );

      case 'harmonics':
        return (
          <div className="space-y-2">
            {data.data?.harmonics && Object.entries(data.data.harmonics).map(([h, hData]: [string, any]) => (
              <div key={h} className="text-xs bg-white p-2 rounded border">
                <span className="font-medium">{h}</span>: {hData.harmonic_info?.theme || 'N/A'}
                {hData.clusters?.length > 0 && (
                  <div className="text-gray-500 mt-1">
                    {hData.clusters.length} cluster(s) encontrado(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'fixedStars':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {data.data?.conjunction_count || 0} conjunciones con estrellas fijas
            </div>
            {data.data?.royal_stars && (
              <div className="text-xs">
                Royal Stars activas: {
                  Object.entries(data.data.royal_stars)
                    .filter(([_, v]: [string, any]) => v.activated)
                    .map(([k]) => k)
                    .join(', ') || 'Ninguna'
                }
              </div>
            )}
            {data.data?.conjunctions?.slice(0, 3).map((c: any, i: number) => (
              <div key={i} className="text-xs bg-white p-2 rounded border">
                <span className="font-medium">{c.star}</span> ☌ {c.planet}
                <span className="text-gray-500 ml-2">({c.orb.toFixed(2)}°)</span>
              </div>
            ))}
          </div>
        );

      case 'arabicParts':
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Carta: {data.data?.chart_type || 'N/A'}
            </div>
            {data.data?.fortune && (
              <div className="text-sm">
                Parte de Fortuna: <span className="font-medium">{data.data.fortune.sign}</span> {data.data.fortune.sign_degree?.toFixed(1)}° (Casa {data.data.fortune.house})
              </div>
            )}
            {data.data?.spirit && (
              <div className="text-sm">
                Parte del Espíritu: <span className="font-medium">{data.data.spirit.sign}</span> {data.data.spirit.sign_degree?.toFixed(1)}° (Casa {data.data.spirit.house})
              </div>
            )}
          </div>
        );

      default:
        return (
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  if (!hasNatalChart) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-amber-800 font-medium">Carta natal requerida</p>
        <p className="text-sm text-amber-600">Calcule primero la carta natal para acceder a las técnicas avanzadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Técnicas Avanzadas</h3>
        <span className="text-xs text-gray-500">Swiss Ephemeris Engine</span>
      </div>

      {TECHNIQUES.map((technique) => {
        const result = results[technique.key];
        const colors = getColorClasses(technique.color);
        const Icon = technique.icon;
        const isExpanded = expandedTechnique === technique.key;

        return (
          <div 
            key={technique.key} 
            className={`border rounded-lg overflow-hidden ${colors.border} ${result.data ? colors.bg : 'bg-white'}`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${colors.text}`}>{technique.name}</h4>
                    <p className="text-xs text-gray-500">{technique.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {result.data && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  
                  <button
                    onClick={() => fetchTechnique(technique)}
                    disabled={result.loading}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      result.loading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `${colors.bg} ${colors.text} hover:opacity-80`
                    }`}
                  >
                    {result.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : result.data ? (
                      'Recalcular'
                    ) : (
                      'Calcular'
                    )}
                  </button>

                  {result.data && (
                    <button
                      onClick={() => setExpandedTechnique(isExpanded ? null : technique.key)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Extra controls for specific techniques */}
              {technique.key === 'solarReturn' && (
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-gray-500">Año:</label>
                  <input
                    type="number"
                    value={solarReturnYear}
                    onChange={(e) => setSolarReturnYear(parseInt(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border rounded"
                    min={1900}
                    max={2100}
                  />
                </div>
              )}

              {technique.key === 'harmonics' && (
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={calculateAll}
                      onChange={(e) => setCalculateAll(e.target.checked)}
                    />
                    Calcular todos (H4, H5, H7, H9)
                  </label>
                  {!calculateAll && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Armónico:</label>
                      <select
                        value={harmonicNumber}
                        onChange={(e) => setHarmonicNumber(parseInt(e.target.value))}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        {[4, 5, 7, 8, 9, 12].map(h => (
                          <option key={h} value={h}>H{h}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Error display */}
              {result.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {result.error}
                </div>
              )}
            </div>

            {/* Expanded result */}
            {isExpanded && result.data && (
              <div className={`border-t ${colors.border} p-3 ${colors.bg}`}>
                {renderResultData(technique.key, result.data)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
