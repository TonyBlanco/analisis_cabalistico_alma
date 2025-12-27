import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../lib/auth';

interface Planet {
  nombre: string;
  signo: string;
  grados: number;
  longitud_ecliptica: number;
  casa: number;
  es_retrogrado: boolean;
}

interface CabalisticPlanetData {
  sefira?: {
    sefira_id: string;
    sefira_name: string;
    sefira_number: number;
  } | null;
  path?: {
    path_number: number;
    path_name: string;
    hebrew_letter: string;
    tarot: number;
    hebrew_char?: string | null;
  } | null;
  planet_info?: {
    planet: string;
    sign_letter?: string | null;
    path_id?: string | null;
    sefira?: string | null;
    sefaria_refs?: Array<{
      title: string;
      url: string;
      // Optional: AI-generated (non-verbatim) therapeutic guidance.
      snippet?: string | null;
    }>;
  } | null;
}

export interface CabalisticData {
  planets?: Record<string, CabalisticPlanetData>;
  hebrew_letters?: string[];
  tikun_signals?: Array<Record<string, any>>;
}

interface House {
  numero: number;
  signo: string;
  cuspide_grados: number;
  cuspide_longitud: number;
}

interface Aspect {
  planeta1: string;
  planeta2: string;
  tipo: string;
  orbe: number;
  es_aplicativo: boolean;
}

interface Metadata {
  sistema_casas: string;
  zodiac_type?: 'tropical' | 'sidereal' | 'draconic' | string;
  ayanamsha?: string | null;
  fuente: string;
  calculated_at: string;
  version_engine: string;
  input_snapshot: any;
}

export interface NatalChartPayload {
  planetas: Planet[];
  casas: House[];
  aspectos: Aspect[];
  metadatos: Metadata;
  cabalistic_data?: CabalisticData;
}

export interface MultiTechLayerPayload {
  reference_date?: string;
  method?: string;
  chart?: NatalChartPayload | null;
}

export interface MultiTechAnalysisResult {
  meta?: Record<string, any>;
  natal?: NatalChartPayload | null;
  transits?: NatalChartPayload | null;
  solarReturn?: MultiTechLayerPayload | null;
  progressions?: MultiTechLayerPayload | null;
}

interface UseNatalChartReturn {
  chart: NatalChartPayload | null;
  analysisResult: MultiTechAnalysisResult | null;
  loading: boolean;
  error: string | null;
  missingFields: string[] | null;
  calculateChart: (houseSystem?: string, zodiacType?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

function normalizePlanetName(name: unknown): string {
  if (typeof name !== 'string') return String(name ?? '');
  return name.trim().toLowerCase();
}

function normalizePayload(payload: any): NatalChartPayload | null {
  if (!payload) return null;

  const planetasRaw: any[] = Array.isArray(payload.planetas) ? payload.planetas : [];
  const planetas = planetasRaw.map((p) => ({
    ...p,
    nombre: normalizePlanetName(p?.nombre),
  }));

  const metadatos = payload.metadatos || {};
  return {
    planetas,
    casas: Array.isArray(payload.casas) ? payload.casas : [],
    aspectos: Array.isArray(payload.aspectos) ? payload.aspectos : [],
    metadatos,
    cabalistic_data: payload.cabalistic_data,
  };
}

/**
 * Hook para obtener y calcular carta natal desde el backend.
 * 
 * RESPONSABILIDADES:
 * - GET: Recuperar carta natal existente
 * - POST: Calcular nueva carta desde perfil del paciente
 * - Manejo de estados (loading, error, empty)
 * - NO hace caching global, cada instancia es independiente
 */
export function useNatalChart(patientId: string | undefined): UseNatalChartReturn {
  const [chart, setChart] = useState<NatalChartPayload | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MultiTechAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[] | null>(null);

  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchChart = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMissingFields(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(
        `${apiURL}/therapist/patients/${patientId}/astrology-kerykeion/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        // No hay carta calculada (estado esperado)
        setChart(null);
        setAnalysisResult(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      // Normalize backend response shapes:
      // - Some responses return { chart: {...}, calculated_at, house_system, source }
      // - Others return { chart_payload: { planetas, casas, aspectos, metadatos } }
      let payload: any = null;

      if (data.chart) {
        // Build NatalChartPayload from response
        payload = {
          planetas: data.chart.planetas || [],
          casas: data.chart.casas || [],
          aspectos: data.chart.aspectos || [],
          metadatos: {
            sistema_casas: data.house_system || (data.chart.metadatos && data.chart.metadatos.sistema_casas) || 'placidus',
            zodiac_type: data.zodiac_type || (data.chart.metadatos && data.chart.metadatos.zodiac_type) || undefined,
            ayanamsha: (data.chart.metadatos && data.chart.metadatos.ayanamsha) || null,
            fuente: data.source || (data.chart.metadatos && data.chart.metadatos.fuente) || 'kerykeion',
            calculated_at: data.calculated_at || (data.chart.metadatos && data.chart.metadatos.calculated_at) || new Date().toISOString(),
            version_engine: (data.chart.metadatos && data.chart.metadatos.version_engine) || 'unknown',
            input_snapshot: (data.chart.metadatos && data.chart.metadatos.input_snapshot) || null,
          },
          cabalistic_data: data.chart.cabalistic_data || data.chart.cabalistic_data,
        };
      } else if (data.chart_payload) {
        payload = data.chart_payload;
      } else if (data.planetas) {
        // Already in chart shape
        payload = data as any;
      } else {
        payload = null;
      }

      setChart(normalizePayload(payload));
      setAnalysisResult(data.analysis_result ?? data.analysisResult ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar carta natal');
      setChart(null);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  }, [patientId, apiURL]);

  const calculateChart = useCallback(async (houseSystem?: string, zodiacType?: string) => {
    if (!patientId) {
      setError('No patient ID provided');
      return;
    }

    setLoading(true);
    setError(null);
    setMissingFields(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }

      const bodyPayload: any = {};
      if (houseSystem) {
        // Backend now accepts canonical names and short codes (P/K/E/W/R/...)
        bodyPayload.house_system = houseSystem;
      }

      if (zodiacType) {
        bodyPayload.zodiac_type = zodiacType;
      }

      const response = await fetch(
        `${apiURL}/therapist/patients/${patientId}/astrology-kerykeion/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.missing_fields) {
          setMissingFields(errorData.missing_fields);
          setError(errorData.error || 'Faltan campos en el perfil del paciente');
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      // Normalize POST response (same shape as GET)
      let payload: any = null;
      if (data.chart) {
        payload = {
          planetas: data.chart.planetas || [],
          casas: data.chart.casas || [],
          aspectos: data.chart.aspectos || [],
          metadatos: {
            sistema_casas: data.house_system || (data.chart.metadatos && data.chart.metadatos.sistema_casas) || 'placidus',
            zodiac_type: data.zodiac_type || (data.chart.metadatos && data.chart.metadatos.zodiac_type) || undefined,
            ayanamsha: (data.chart.metadatos && data.chart.metadatos.ayanamsha) || null,
            fuente: data.source || (data.chart.metadatos && data.chart.metadatos.fuente) || 'kerykeion',
            calculated_at: data.calculated_at || (data.chart.metadatos && data.chart.metadatos.calculated_at) || new Date().toISOString(),
            version_engine: (data.chart.metadatos && data.chart.metadatos.version_engine) || 'unknown',
            input_snapshot: (data.chart.metadatos && data.chart.metadatos.input_snapshot) || null,
          },
          cabalistic_data: data.chart.cabalistic_data || data.chart.cabalistic_data,
        };
      } else if (data.chart_payload) {
        payload = data.chart_payload;
      } else if (data.planetas) {
        payload = data as any;
      } else {
        // Fallback: try to use 'chart' prop or raw
        payload = data.chart || data;
      }

      setChart(normalizePayload(payload));
      setAnalysisResult(data.analysis_result ?? data.analysisResult ?? null);
      setError(null);
      setMissingFields(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular carta natal');
    } finally {
      setLoading(false);
    }
  }, [patientId, apiURL]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return {
    chart,
    analysisResult,
    loading,
    error,
    missingFields,
    calculateChart,
    refetch: fetchChart,
  };
}
