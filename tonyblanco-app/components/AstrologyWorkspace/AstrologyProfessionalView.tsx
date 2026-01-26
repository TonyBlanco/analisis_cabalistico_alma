"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';
import NatalChartSVGPro from './chart/NatalChartSVGAdvanced';
import { buildAdvancedInputFromPayload } from './chart/chartLayoutEngine';
import PsychologicalHoroscopeAdvanced from './psychological/PsychologicalHoroscopeAdvanced';
import AstrologyDoubleWheelSVG from './AstrologyDoubleWheelSVG';
import AstroDoubleWheelAdvanced from '@/components/astrology/AstroDoubleWheelAdvanced';
import InfoTooltip from '@/components/common/InfoTooltip';
// ... existing imports ...
import { InquiryWidget } from '@/components/inquiry/InquiryWidget';

import { getTherapistPatients } from '@/lib/patient-api';
import { computeSynastryAspects } from '@/components/astrology/astro-geometry';
//import { computeCompositeFromTwoNatal } from '@/components/astrology/composite';
import { getAuthToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';
import AstroWheelAdvanced from '@/components/astrology/AstroWheelAdvanced';
import { normalizeNatalForWheel } from '@/components/astrology/normalizer';
import CalculationStatusPanel from './CalculationStatusPanel';
import AstrologySidebar from './AstrologySidebar';
import AIInterpretationPanel from './AIInterpretationPanel';
import AISituationChat from './AISituationChat';

interface Props {
  consultante: ActiveConsultante;
  chart: NatalChartPayload | null;
  analysis_result?: MultiTechAnalysisResult | null;
  calculateChart?: (houseSystem?: string, zodiacType?: string) => Promise<void> | undefined;
  refetch?: () => Promise<void>;
}

type ChartVisualStyle = 'classic' | 'huber';
type HarmonicMode = 'off' | 'h5' | 'h7' | 'h9' | 'h11' | 'h13' | 'h16';
type PersonaMode = 'off' | 'social' | 'professional' | 'intimate';
type RelocationMode = 'off' | 'home' | 'work' | 'travel' | 'abroad';
type AdvancedObjectsState = { nodes: boolean; fortune: boolean; symbolicPoints: boolean };
type FixedStarsState = { primary: boolean; secondary: boolean };
type RelationshipMode = 'off' | 'couple' | 'family' | 'work' | 'social';
type RelationshipRole = 'active' | 'reactive';
type DevelopmentStage = 'off' | 'early_childhood' | 'childhood_early' | 'childhood_middle' | 'adolescence' | 'young_adult';

export default function AstrologyProfessionalView({ consultante, chart, analysis_result, calculateChart, refetch }: Props) {
  const router = useRouter();

  // Audit log (controlled, local-only): helps verify incoming data shapes
  if (typeof window !== 'undefined') {
    // Keep log minimal and non-sensitive
    // eslint-disable-next-line no-console
    console.debug('AstrologyProfessionalView - analysis_result', {
      hasAnalysis: Boolean(analysis_result), layers: {
        natal: Boolean(analysis_result?.natal || chart),
        transits: Boolean(analysis_result?.transits),
        solarReturn: Boolean(analysis_result?.solarReturn),
        progressions: Boolean(analysis_result?.progressions),
      }
    });
  }

  const natal = analysis_result?.natal ?? chart ?? null;
  const hasChart = Boolean(natal);
  const hasIdentity = Boolean(consultante?.fecha_nacimiento);
  const transits = analysis_result?.transits ?? null;
  const solarReturn = analysis_result?.solarReturn?.chart ?? null;
  const progressions = analysis_result?.progressions?.chart ?? null;

  const overlays = useMemo(() => ({
    natal: Boolean(natal),
    transits: Boolean(transits),
    solarReturn: Boolean(solarReturn),
    progressions: Boolean(progressions),
  }), [natal, transits, solarReturn, progressions]);

  // Synastry / partner-related UI state (declare before effects that reference them)
  const [synastryEnabled, setSynastryEnabled] = useState<boolean>(false);
  const [partnerList, setPartnerList] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerChart, setPartnerChart] = useState<any | null>(null);
  const [partnerLoading, setPartnerLoading] = useState<boolean>(false);
  const [partnerLoadError, setPartnerLoadError] = useState<string | null>(null);
  const [synastryAspects, setSynastryAspects] = useState<any[]>([]);

  // Local UI state for sidebar selectors (visual only)
  const [houseSystem, setHouseSystem] = useState<string>(natal?.metadatos?.sistema_casas || 'P');
  const [zodiacType, setZodiacType] = useState<string>(natal?.metadatos?.zodiac_type || 'tropical');

  // Auto-load therapist patients when synastry UI is enabled to avoid a 'blocked' select
  React.useEffect(() => {
    if (!synastryEnabled) return;
    let mounted = true;
    (async () => {
      try {
        setPartnerLoading(true);
        setPartnerLoadError(null);
        const list = await getTherapistPatients();
        if (!mounted) return;
        setPartnerList(list || []);
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Could not fetch patients on enable', e);
        if (!mounted) return;
        setPartnerList([]);
        setPartnerLoadError(String((e && e.message) || e || 'Error cargando pacientes'));
      } finally {
        if (mounted) setPartnerLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [synastryEnabled]);

  const [orb, setOrb] = useState<number>(6);
  const [visiblePlanets, setVisiblePlanets] = useState<Record<string, boolean>>(() => ({}));
  const [visibleAspects, setVisibleAspects] = useState<Record<string, boolean>>(() => ({}));
  const [showAsteroids, setShowAsteroids] = useState<boolean>(false);
  const [compositeChart, setCompositeChart] = useState<any | null>(null);
  const [davisonChart, setDavisonChart] = useState<any | null>(null);
  const [davisonGenerating, setDavisonGenerating] = useState<boolean>(false);

  // Advanced Transits (A16.3)
  const [showAdvancedTransits, setShowAdvancedTransits] = useState<boolean>(false);
  const [transitBaseType] = useState<'natal' | 'composite_chart' | 'davison_chart'>('natal');
  const [advancedTransitDate, setAdvancedTransitDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [transitsSnapshot, setTransitsSnapshot] = useState<any | null>(null);
  const [transitLoading, setTransitLoading] = useState<boolean>(false);
  const [transitError, setTransitError] = useState<string | null>(null);

  // A17: Progresiones Secundarias + Retorno Solar
  const [showSecondaryProgressions, setShowSecondaryProgressions] = useState<boolean>(false);
  const [progressedTargetDate, setProgressedTargetDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [progressionsSnapshot, setProgressionsSnapshot] = useState<any | null>(null);
  const [progressionsLoading, setProgressionsLoading] = useState<boolean>(false);
  const [progressionsError, setProgressionsError] = useState<string | null>(null);

  // A18: Comparative UI panels
  const [showCompareSolarReturn, setShowCompareSolarReturn] = useState<boolean>(false);
  const [showCompareProgressions, setShowCompareProgressions] = useState<boolean>(false);

  const [showSolarReturn, setShowSolarReturn] = useState<boolean>(false);
  const [solarReturnYear, setSolarReturnYear] = useState<number>(new Date().getFullYear());
  const [solarReturnSnapshot, setSolarReturnSnapshot] = useState<any | null>(null);
  const [solarReturnLoading, setSolarReturnLoading] = useState<boolean>(false);
  const [solarReturnError, setSolarReturnError] = useState<string | null>(null);

  // Solar Arc Directions state
  interface SolarArcPlanet {
    longitude: number;
    natal_longitude: number;
    arc_applied: number;
    sign: string;
    sign_degree: number;
  }
  interface SolarArcData {
    arc_degrees: number;
    target_date: string;
    method: string;
    planets: Record<string, SolarArcPlanet>;
  }
  const [solarArcData, setSolarArcData] = useState<SolarArcData | null>(null);
  const [solarArcDate, setSolarArcDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [solarArcLoading, setSolarArcLoading] = useState<boolean>(false);
  const [solarArcError, setSolarArcError] = useState<string | null>(null);

  // Lunar Return state
  interface LunarReturnData {
    return_datetime: string;
    lunar_position: number;
    return_lunar_position: number;
    precision: number;
    chart: any;
    target_month: string;
  }
  const [lunarReturnData, setLunarReturnData] = useState<LunarReturnData | null>(null);
  const [lunarReturnMonth, setLunarReturnMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [lunarReturnLoading, setLunarReturnLoading] = useState<boolean>(false);
  const [lunarReturnError, setLunarReturnError] = useState<string | null>(null);

  // Composite Chart state
  interface Person2Data {
    birth_date: string;
    birth_time: string;
    latitude: number;
    longitude: number;
    name: string;
  }
  interface CompositeChartData {
    composite_datetime: string;
    composite_location: { latitude: number; longitude: number };
    person1: { name: string; birth_datetime: string };
    person2: { name: string; birth_datetime: string };
    planets: Record<string, { longitude: number; sign: string; sign_degree: number; retrograde: boolean }>;
    houses: { cusps: number[]; system: string };
    angles: { asc: number; mc: number; ic: number; dsc: number };
  }
  const [compositeEnabled, setCompositeEnabled] = useState<boolean>(false);
  const [compositeData, setCompositeData] = useState<CompositeChartData | null>(null);
  const [compositeLoading, setCompositeLoading] = useState<boolean>(false);
  const [compositeError, setCompositeError] = useState<string | null>(null);

  // Davison Chart state
  interface DavisonChartData {
    davison_datetime: string;
    davison_location: { latitude: number; longitude: number };
    person1_datetime: string;
    person2_datetime: string;
    planets: Record<string, { longitude: number; sign: string; sign_degree: number }>;
    houses: Array<{ number: number; cusp_longitude: number; sign: string; sign_degree: number }>;
    ascendant: number;
    midheaven: number;
    method: string;
  }
  const [davisonEnabled, setDavisonEnabled] = useState<boolean>(false);
  const [davisonData, setDavisonData] = useState<DavisonChartData | null>(null);
  const [davisonLoading, setDavisonLoading] = useState<boolean>(false);
  const [davisonError, setDavisonError] = useState<string | null>(null);

  const [person2Data, setPerson2Data] = useState<Person2Data>({
    birth_date: '',
    birth_time: '12:00',
    latitude: 0,
    longitude: 0,
    name: 'Persona 2'
  });
  const [showPerson2Modal, setShowPerson2Modal] = useState<boolean>(false);

  const togglePlanet = (key: string) => setVisiblePlanets((p) => ({ ...p, [key]: !p[key] }));
  const toggleAspect = (key: string) => setVisibleAspects((a) => ({ ...a, [key]: !a[key] }));

  // Controlled active layers set (natal always available if present)
  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (overlays.natal) s.add('natal');
    return s;
  });
  const [symbolicDoubleWheel, setSymbolicDoubleWheel] = useState<boolean>(false);
  const [symbolicSolarReturnYear, setSymbolicSolarReturnYear] = useState<number | null>(null);
  const [symbolicLunarReturnDate, setSymbolicLunarReturnDate] = useState<string | null>(null);
  const [showCrossAspects, setShowCrossAspects] = useState<boolean>(false);
  const [harmonicMode, setHarmonicMode] = useState<HarmonicMode>('off');
  const [personaMode, setPersonaMode] = useState<PersonaMode>('off');
  const [relocationMode, setRelocationMode] = useState<RelocationMode>('off');
  const [advancedObjects, setAdvancedObjects] = useState<AdvancedObjectsState>({ nodes: false, fortune: false, symbolicPoints: false });
  const [fixedStars, setFixedStars] = useState<FixedStarsState>({ primary: false, secondary: false });
  const [relationshipMode, setRelationshipMode] = useState<RelationshipMode>('off');
  const [relationshipRole, setRelationshipRole] = useState<RelationshipRole>('active');
  const [developmentStage, setDevelopmentStage] = useState<DevelopmentStage>('off');
  const [solarReturnCompareEnabled, setSolarReturnCompareEnabled] = useState<boolean>(false);
  const [solarReturnCompareYearB, setSolarReturnCompareYearB] = useState<number | null>(null);
  const [visualStyle, setVisualStyle] = useState<ChartVisualStyle>('classic');

  const [activeTab, setActiveTab] = useState<'visual' | 'psych'>('visual');

  const handleLayerToggle = (layer: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      // natal is locked on
      if (layer === 'natal') return next;
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const hasActiveComputedLayers = useMemo(() => {
    const keys = ['transits', 'progressions', 'return_solar'] as const;
    return keys.some((k) => activeLayers.has(k));
  }, [activeLayers]);

  const harmonicOrder = useMemo(() => {
    if (harmonicMode === 'h5') return 5 as const;
    if (harmonicMode === 'h7') return 7 as const;
    if (harmonicMode === 'h9') return 9 as const;
    if (harmonicMode === 'h11') return 11 as const;
    if (harmonicMode === 'h13') return 13 as const;
    if (harmonicMode === 'h16') return 16 as const;
    return undefined;
  }, [harmonicMode]);

  // Fetch Solar Arc data when layer is active
  useEffect(() => {
    const isSolarArcActive = activeLayers.has('solarArc');

    if (!isSolarArcActive || !consultante?.id || !hasChart) {
      // Clear data when layer is deactivated
      if (!isSolarArcActive && solarArcData) {
        setSolarArcData(null);
        setSolarArcError(null);
      }
      return;
    }

    const fetchSolarArcData = async () => {
      setSolarArcLoading(true);
      setSolarArcError(null);

      try {
        const token = getAuthToken();
        if (!token) throw new Error('No auth token');

        const apiUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiUrl}/therapist/patients/${consultante.id}/solar-arc/?target_date=${solarArcDate}`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        setSolarArcData(data.solar_arc);
      } catch (error: any) {
        console.error('Solar Arc fetch error:', error);
        setSolarArcError(error?.message || 'Error al obtener datos de Arco Solar');
        setSolarArcData(null);
      } finally {
        setSolarArcLoading(false);
      }
    };

    fetchSolarArcData();
  }, [activeLayers, consultante?.id, hasChart, solarArcDate]);

  // Fetch Lunar Return data when layer is active (Real mode only)
  useEffect(() => {
    const isLunarReturnActive = activeLayers.has('return_lunar');

    if (!isLunarReturnActive || !consultante?.id || !hasChart) {
      // Clear data when layer is deactivated
      if (!isLunarReturnActive) {
        setLunarReturnData(null);
        setLunarReturnError(null);
      }
      return;
    }

    const fetchLunarReturnData = async () => {
      setLunarReturnLoading(true);
      setLunarReturnError(null);

      try {
        const token = getAuthToken();
        if (!token) throw new Error('No auth token');

        const apiUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiUrl}/therapist/patients/${consultante.id}/lunar-return/?target_month=${lunarReturnMonth}`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        setLunarReturnData(data.lunar_return);
      } catch (error: any) {
        console.error('Lunar Return fetch error:', error);
        setLunarReturnError(error?.message || 'Error al obtener Retorno Lunar');
        setLunarReturnData(null);
      } finally {
        setLunarReturnLoading(false);
      }
    };

    fetchLunarReturnData();
  }, [activeLayers, consultante?.id, hasChart, lunarReturnMonth]);

  // Fetch Composite Chart when enabled and person2 data is provided
  const fetchCompositeChart = async () => {
    if (!compositeEnabled || !consultante?.id || !hasChart) {
      return;
    }

    if (!person2Data.birth_date || !person2Data.latitude || !person2Data.longitude) {
      setCompositeError('Se requieren datos completos de la segunda persona');
      return;
    }

    setCompositeLoading(true);
    setCompositeError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const apiUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiUrl}/therapist/patients/${consultante.id}/composite-chart/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            person2_birth_date: person2Data.birth_date,
            person2_birth_time: person2Data.birth_time,
            person2_latitude: person2Data.latitude,
            person2_longitude: person2Data.longitude,
            person2_name: person2Data.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setCompositeData(data.composite_chart);
      setShowPerson2Modal(false);
    } catch (error: any) {
      console.error('Composite Chart fetch error:', error);
      setCompositeError(error?.message || 'Error al calcular Carta Compuesta');
      setCompositeData(null);
    } finally {
      setCompositeLoading(false);
    }
  };

  // Clear composite data when disabled
  useEffect(() => {
    if (!compositeEnabled) {
      setCompositeData(null);
      setCompositeError(null);
    }
  }, [compositeEnabled]);

  // Fetch Davison Chart data when enabled
  const fetchDavisonChart = async () => {
    if (!consultante?.id || !person2Data.birth_date || !person2Data.latitude || !person2Data.longitude) {
      return;
    }

    setDavisonLoading(true);
    setDavisonError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const apiUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiUrl}/therapist/patients/${consultante.id}/davison-chart/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            person2_birth_date: person2Data.birth_date,
            person2_birth_time: person2Data.birth_time,
            person2_latitude: person2Data.latitude,
            person2_longitude: person2Data.longitude,
            person2_name: person2Data.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setDavisonData(data.davison_chart);
    } catch (error: any) {
      console.error('Davison Chart fetch error:', error);
      setDavisonError(error?.message || 'Error al calcular Carta Davison');
      setDavisonData(null);
    } finally {
      setDavisonLoading(false);
    }
  };

  // Clear davison data when disabled
  useEffect(() => {
    if (!davisonEnabled) {
      setDavisonData(null);
      setDavisonError(null);
    }
  }, [davisonEnabled]);

  useEffect(() => {
    // Harmonics are symbolic-only and require identity; keep activeLayers in sync
    if (!hasIdentity) {
      setHarmonicMode('off');
      setActiveLayers((prev) => {
        if (!prev.has('harmonics')) return prev;
        const next = new Set(prev);
        next.delete('harmonics');
        return next;
      });
      return;
    }

    setActiveLayers((prev) => {
      const want = harmonicMode !== 'off';
      const has = prev.has('harmonics');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('harmonics');
      else next.delete('harmonics');
      return next;
    });
  }, [harmonicMode, hasIdentity]);

  useEffect(() => {
    // Persona is symbolic-only and requires identity; keep activeLayers in sync
    if (!hasIdentity) {
      setPersonaMode('off');
      setActiveLayers((prev) => {
        if (!prev.has('persona')) return prev;
        const next = new Set(prev);
        next.delete('persona');
        return next;
      });
      return;
    }

    setActiveLayers((prev) => {
      const want = personaMode !== 'off';
      const has = prev.has('persona');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('persona');
      else next.delete('persona');
      return next;
    });
  }, [personaMode, hasIdentity]);

  useEffect(() => {
    // Relocation is symbolic-only and requires identity; keep activeLayers in sync
    if (!hasIdentity) {
      setRelocationMode('off');
      setActiveLayers((prev) => {
        if (!prev.has('relocation')) return prev;
        const next = new Set(prev);
        next.delete('relocation');
        return next;
      });
      return;
    }

    setActiveLayers((prev) => {
      const want = relocationMode !== 'off';
      const has = prev.has('relocation');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('relocation');
      else next.delete('relocation');
      return next;
    });
  }, [relocationMode, hasIdentity]);

  useEffect(() => {
    // Advanced objects are symbolic-only and require identity; keep activeLayers in sync
    if (!hasIdentity) {
      setAdvancedObjects({ nodes: false, fortune: false, symbolicPoints: false });
      setActiveLayers((prev) => {
        if (!prev.has('mathPoints')) return prev;
        const next = new Set(prev);
        next.delete('mathPoints');
        return next;
      });
      return;
    }

    const want = Boolean(advancedObjects.nodes || advancedObjects.fortune || advancedObjects.symbolicPoints);
    setActiveLayers((prev) => {
      const has = prev.has('mathPoints');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('mathPoints');
      else next.delete('mathPoints');
      return next;
    });
  }, [advancedObjects, hasIdentity]);

  useEffect(() => {
    // Fixed stars are symbolic-only and require identity; keep activeLayers in sync
    if (!hasIdentity) {
      if (fixedStars.primary || fixedStars.secondary) {
        setFixedStars({ primary: false, secondary: false });
      }
      setActiveLayers((prev) => {
        if (!prev.has('fixedStars')) return prev;
        const next = new Set(prev);
        next.delete('fixedStars');
        return next;
      });
      return;
    }

    const want = Boolean(fixedStars.primary || fixedStars.secondary);
    setActiveLayers((prev) => {
      const has = prev.has('fixedStars');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('fixedStars');
      else next.delete('fixedStars');
      return next;
    });
  }, [fixedStars, hasIdentity]);

  useEffect(() => {
    // Relationships are symbolic-only and require identity; keep activeLayers in sync
    if (!hasIdentity) {
      if (relationshipMode !== 'off') setRelationshipMode('off');
      setActiveLayers((prev) => {
        if (!prev.has('relationships')) return prev;
        const next = new Set(prev);
        next.delete('relationships');
        return next;
      });
      return;
    }

    setActiveLayers((prev) => {
      const want = relationshipMode !== 'off';
      const has = prev.has('relationships');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('relationships');
      else next.delete('relationships');
      return next;
    });
  }, [relationshipMode, hasIdentity]);

  useEffect(() => {
    // Development stages are symbolic-only and require identity; keep activeLayers in sync
    if (!hasIdentity) {
      if (developmentStage !== 'off') setDevelopmentStage('off');
      setActiveLayers((prev) => {
        if (!prev.has('development')) return prev;
        const next = new Set(prev);
        next.delete('development');
        return next;
      });
      return;
    }

    setActiveLayers((prev) => {
      const want = developmentStage !== 'off';
      const has = prev.has('development');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('development');
      else next.delete('development');
      return next;
    });
  }, [developmentStage, hasIdentity]);

  const apiURL = getApiBaseUrl();

  const [showRecalcModal, setShowRecalcModal] = useState(false);
  const [recalcMethod, setRecalcMethod] = useState<{ houses: string; zodiac: string }>({ houses: houseSystem, zodiac: zodiacType });

  // simple frontend audit log
  const pushLog = (entry: Record<string, any>) => {
    // keep log in console for now
    // In future could push to an internal UI list
    // eslint-disable-next-line no-console
    console.info('ASTRO_LOG', entry);
  };

  // PDF export intentionally disabled in this phase.
  const exportComparativeAsPDF = async (_elementId: string, _filename = 'comparativa.pdf') => { };

  // open modal via global event from sidebar button
  React.useEffect(() => {
    const handler = () => {
      if (!hasChart) return;
      setShowRecalcModal(true);
    };
    window.addEventListener('open-recalc-modal', handler as EventListener);
    return () => window.removeEventListener('open-recalc-modal', handler as EventListener);
  }, [hasChart]);


  const meta = (natal?.metadatos as any) || {};

  // Prepare filtered data
  const planetsFiltered = (natal?.planetas || []).filter((p) => (visiblePlanets[String(p.nombre).toLowerCase().trim()] ?? true));
  const aspectosWithKey = (natal?.aspectos || []).map((a, idx) => ({ ...a, _key: `${String(a.planeta1).toLowerCase().trim()}-${String(a.planeta2).toLowerCase().trim()}-${a.tipo}-${idx}` }));
  const aspectosFiltered = aspectosWithKey.filter((a: any) => (visibleAspects[a._key] ?? true) && Math.abs(a.orbe || 0) <= orb);

  // Format snapshot ID
  const formatSnapshotId = (snapshot: any) => {
    if (!snapshot) return null;
    if (typeof snapshot === 'string') return snapshot.slice(0, 16);
    if (typeof snapshot === 'object' && snapshot.id) return String(snapshot.id).slice(0, 16);
    return JSON.stringify(snapshot).slice(0, 16);
  };

  const renderLayerStateBadge = (state: 'pendiente' | 'no_calculado' | 'solo_lectura' | 'calculando') => {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border';
    if (state === 'pendiente') return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>pendiente</span>;
    if (state === 'no_calculado') return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>no calculado</span>;
    if (state === 'calculando') return <span className={`${base} bg-blue-50 text-blue-800 border-blue-200 animate-pulse`}>calculando...</span>;
    return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>solo lectura</span>;
  };

  const temporalLayers = useMemo(() => {
    const layers: Array<{ key: 'transits' | 'progressions' | 'solarArc'; label?: string }> = [];
    if (activeLayers.has('transits')) {
      const stamp = analysis_result?.transits?.metadatos?.calculated_at;
      layers.push({ key: 'transits', label: stamp ? `Tránsitos · ${String(stamp).slice(0, 10)}` : 'Tránsitos' });
    }
    if (activeLayers.has('progressions')) {
      const ref = analysis_result?.progressions?.reference_date;
      layers.push({ key: 'progressions', label: ref ? `Progresiones · ${String(ref).slice(0, 10)}` : 'Progresiones' });
    }
    if (activeLayers.has('solarArc') && solarArcData) {
      layers.push({ key: 'solarArc', label: `Arco Solar · ${solarArcData.arc_degrees.toFixed(2)}° (${solarArcData.target_date})` });
    }
    return layers;
  }, [activeLayers, analysis_result, solarArcData]);

  const annualLayers = useMemo(() => {
    const layers: Array<{ key: 'solarReturn'; label?: string }> = [];
    if (activeLayers.has('return_solar')) {
      const ref = analysis_result?.solarReturn?.reference_date;
      layers.push({ key: 'solarReturn', label: ref ? `Retorno Solar · ${String(ref).slice(0, 10)}` : 'Retorno Solar' });
    }
    return layers;
  }, [activeLayers, analysis_result]);

  useEffect(() => {
    if (!solarReturnCompareEnabled) {
      setSolarReturnCompareYearB(null);
      return;
    }
    // Comparison by year requires backend support for targeting a specific return year (not enabled in this phase).
    setSolarReturnCompareYearB(null);
  }, [solarReturnCompareEnabled]);

  const secondaryLayer = useMemo(() => {
    const order = ['transits', 'progressions', 'return_solar'] as const;
    for (const key of order) {
      if (activeLayers.has(key)) return key;
    }
    return null;
  }, [activeLayers]);

  const secondaryLayerLabel = useMemo(() => {
    if (!secondaryLayer) return null;
    if (secondaryLayer === 'transits') return 'Tránsitos (cálculo real)';
    if (secondaryLayer === 'progressions') return 'Progresiones (cálculo real)';
    return 'Retorno Solar (cálculo real)';
  }, [secondaryLayer]);

  const focusLabel = useMemo(() => {
    const parts: string[] = [];
    if (activeLayers.has('return_solar')) {
      const ref = analysis_result?.solarReturn?.reference_date;
      parts.push(ref ? `Retorno Solar ${String(ref).slice(0, 10)}` : 'Retorno Solar');
    }
    if (activeLayers.has('transits')) {
      const stamp = analysis_result?.transits?.metadatos?.calculated_at;
      parts.push(stamp ? `Tránsitos ${String(stamp).slice(0, 10)}` : 'Tránsitos');
    }
    if (activeLayers.has('progressions')) {
      const ref = analysis_result?.progressions?.reference_date;
      parts.push(ref ? `Progresiones ${String(ref).slice(0, 10)}` : 'Progresiones');
    }
    if (parts.length === 0) return null;
    return `Enfoque temporal (cálculo real): ${parts.join(' · ')}`;
  }, [activeLayers, analysis_result]);

  const lunarMonthIndex = useMemo(() => {
    if (!symbolicLunarReturnDate) return new Date().getMonth();
    const [, m] = symbolicLunarReturnDate.split('-');
    return Math.max(0, Math.min(11, (Number(m) || 1) - 1));
  }, [symbolicLunarReturnDate]);

  const setLunarMonthIndex = (idx: number) => {
    const monthIndex = Math.max(0, Math.min(11, idx));
    const base = symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10);
    const [y] = base.split('-');
    const year = y || String(new Date().getFullYear());
    const month = String(monthIndex + 1).padStart(2, '0');
    setSymbolicLunarReturnDate(`${year}-${month}-01`);
  };

  const secondaryPlanets = useMemo(() => {
    if (!secondaryLayer) return null;
    try {
      if (secondaryLayer === 'transits') {
        if (transitsSnapshot && transitBaseType === 'natal') return transitsSnapshot.planets ?? null;
        if (analysis_result?.transits) return normalizeNatalForWheel(analysis_result.transits as any).planets ?? null;
        return null;
      }
      if (secondaryLayer === 'progressions') {
        if (progressionsSnapshot) return progressionsSnapshot.planets ?? null;
        if (analysis_result?.progressions?.chart) return normalizeNatalForWheel(analysis_result.progressions.chart as any).planets ?? null;
        return null;
      }
      if (secondaryLayer === 'return_solar') {
        if (solarReturnSnapshot) return solarReturnSnapshot.planets ?? null;
        if (analysis_result?.solarReturn?.chart) return normalizeNatalForWheel(analysis_result.solarReturn.chart as any).planets ?? null;
        return null;
      }
      return null;
    } catch {
      return null;
    }
  }, [secondaryLayer, transitsSnapshot, transitBaseType, analysis_result, progressionsSnapshot, solarReturnSnapshot]);

  type CrossAspectKind = 'CONJ' | 'OPP' | 'SQR' | 'TRI' | 'SEXT';
  type CrossAspectHit = {
    id: string;
    natalKey: string;
    natalGlyph: string;
    layerKey: string;
    layerLabel: string;
    secondaryKey?: string;
    secondaryGlyph?: string;
    kind: CrossAspectKind;
    mode: 'computed' | 'symbolic-only';
  };

  const crossAspects = useMemo(() => {
    const empty = {
      mode: 'off' as const,
      hits: [] as CrossAspectHit[],
      natalKeys: new Set<string>(),
      secondaryKeys: new Set<string>(),
      kindLabel: {
        CONJ: 'Conjunción',
        OPP: 'Oposición',
        SQR: 'Cuadratura',
        TRI: 'Trígono',
        SEXT: 'Sextil',
      } as Record<CrossAspectKind, string>,
    };

    if (!showCrossAspects || !secondaryLayer || !secondaryLayerLabel || !natal) return empty;

    const personal = new Set(['sun', 'moon', 'mercury', 'venus', 'mars']);
    const natalCandidates = normalizeNatalForWheel(natal as any).planets.filter((p) => personal.has(String(p.key).toLowerCase()));

    if (secondaryPlanets && secondaryPlanets.length > 0) {
      const secondaryCandidates = secondaryPlanets.filter((p: any) => personal.has(String(p.key).toLowerCase()));
      const syn = computeSynastryAspects(natalCandidates, secondaryCandidates, 8, 6)
        .slice()
        .sort((a, b) => a.orb - b.orb)
        .slice(0, 15);

      const hits: CrossAspectHit[] = syn.map((a) => {
        const n = natalCandidates.find((p: any) => p.key === a.p1Key);
        const s = secondaryCandidates.find((p: any) => p.key === a.p2Key);
        return {
          id: `${a.p1Key}-${a.p2Key}-${a.kind}`,
          natalKey: a.p1Key,
          natalGlyph: n?.glyph ?? '•',
          layerKey: secondaryLayer,
          layerLabel: secondaryLayerLabel,
          secondaryKey: a.p2Key,
          secondaryGlyph: s?.glyph ?? '•',
          kind: a.kind as CrossAspectKind,
          mode: 'computed',
        };
      });

      return {
        mode: 'computed' as const,
        hits,
        natalKeys: new Set(hits.map((h) => h.natalKey)),
        secondaryKeys: new Set(hits.map((h) => h.secondaryKey).filter(Boolean) as string[]),
        kindLabel: empty.kindLabel,
      };
    }

    const symbolicTargetsByLayer: Record<string, Array<{ natal: string; kind: CrossAspectKind }>> = {
      transits: [
        { natal: 'sun', kind: 'SQR' },
        { natal: 'moon', kind: 'OPP' },
        { natal: 'mercury', kind: 'CONJ' },
        { natal: 'venus', kind: 'SEXT' },
        { natal: 'mars', kind: 'TRI' },
      ],
      progressions: [
        { natal: 'moon', kind: 'CONJ' },
        { natal: 'mercury', kind: 'SEXT' },
        { natal: 'venus', kind: 'TRI' },
      ],
      solarArc: [
        { natal: 'sun', kind: 'CONJ' },
        { natal: 'mars', kind: 'SQR' },
      ],
      return_solar: [
        { natal: 'sun', kind: 'CONJ' },
        { natal: 'moon', kind: 'SEXT' },
      ],
      return_lunar: [
        { natal: 'moon', kind: 'CONJ' },
        { natal: 'venus', kind: 'SEXT' },
      ],
    };

    const hits: CrossAspectHit[] = (symbolicTargetsByLayer[secondaryLayer] ?? [])
      .map((t) => {
        const n = natalCandidates.find((p) => String(p.key).toLowerCase() === t.natal);
        if (!n) return null;
        return {
          id: `${t.natal}-${secondaryLayer}-${t.kind}`,
          natalKey: n.key,
          natalGlyph: n.glyph,
          layerKey: secondaryLayer,
          layerLabel: secondaryLayerLabel,
          kind: t.kind,
          mode: 'symbolic-only',
        } as CrossAspectHit;
      })
      .filter(Boolean) as CrossAspectHit[];

    return {
      mode: 'symbolic-only' as const,
      hits: hits.slice(0, 15),
      natalKeys: new Set(hits.map((h) => h.natalKey)),
      secondaryKeys: new Set<string>(),
      kindLabel: empty.kindLabel,
    };
  }, [showCrossAspects, secondaryLayer, secondaryLayerLabel, secondaryPlanets, natal]);

  const solarReturnYearComparison = useMemo(() => {
    if (!showCrossAspects) return null;
    if (!solarReturnCompareEnabled || symbolicSolarReturnYear === null || solarReturnCompareYearB === null) return null;
    if (!natal) return null;

    const personal = new Set(['sun', 'moon', 'mercury', 'venus', 'mars']);
    const natalCandidates = normalizeNatalForWheel(natal as any).planets.filter((p) => personal.has(String(p.key).toLowerCase()));

    const kindLabel: Record<CrossAspectKind, string> = {
      CONJ: 'Conjunción',
      OPP: 'Oposición',
      SQR: 'Cuadratura',
      TRI: 'Trígono',
      SEXT: 'Sextil',
    };

    const targetsA: Array<{ natal: string; kind: CrossAspectKind }> = [
      { natal: 'sun', kind: 'CONJ' },
      { natal: 'moon', kind: 'SEXT' },
      { natal: 'mercury', kind: 'TRI' },
    ];
    const targetsB: Array<{ natal: string; kind: CrossAspectKind }> = [
      { natal: 'sun', kind: 'OPP' },
      { natal: 'moon', kind: 'TRI' },
      { natal: 'venus', kind: 'SEXT' },
    ];

    const mapTargets = (targets: Array<{ natal: string; kind: CrossAspectKind }>, yearLabel: string) =>
      targets
        .map((t) => {
          const n = natalCandidates.find((p: any) => String(p.key).toLowerCase() === t.natal);
          if (!n) return null;
          return {
            id: `${yearLabel}-${t.natal}-${t.kind}`,
            natalKey: n.key,
            natalGlyph: n.glyph,
            layerKey: 'return_solar',
            layerLabel: yearLabel,
            kind: t.kind,
            mode: 'symbolic-only',
          } as CrossAspectHit;
        })
        .filter(Boolean) as CrossAspectHit[];

    const labelA = `Retorno Solar (A) · ${symbolicSolarReturnYear}`;
    const labelB = `Retorno Solar (B) · ${solarReturnCompareYearB}`;
    const hitsA = mapTargets(targetsA, labelA);
    const hitsB = mapTargets(targetsB, labelB);
    const natalKeys = new Set<string>([...hitsA, ...hitsB].map((h) => h.natalKey));

    const textByYear = {
      A: 'Énfasis simbólico: consolidación y centrado identitario (no predictivo).',
      B: 'Énfasis simbólico: ajuste y reorientación de prioridades (no predictivo).',
    };

    return { labelA, labelB, hitsA, hitsB, natalKeys, kindLabel, textByYear };
  }, [showCrossAspects, solarReturnCompareEnabled, symbolicSolarReturnYear, solarReturnCompareYearB, natal]);

  const effectiveSecondaryLayer = useMemo(() => {
    const compareActive = solarReturnCompareEnabled && symbolicSolarReturnYear !== null && solarReturnCompareYearB !== null;
    if (compareActive && secondaryLayer === 'return_solar') return null;
    return secondaryLayer;
  }, [solarReturnCompareEnabled, symbolicSolarReturnYear, solarReturnCompareYearB, secondaryLayer]);

  const effectiveSecondaryLayerLabel = useMemo(() => {
    if (!effectiveSecondaryLayer) return null;
    return secondaryLayerLabel;
  }, [effectiveSecondaryLayer, secondaryLayerLabel]);

  const crossAspectNatalKeysToPass = showCrossAspects
    ? (solarReturnYearComparison ? solarReturnYearComparison.natalKeys : crossAspects.natalKeys)
    : undefined;

  const relocationParams = useMemo(() => {
    if (relocationMode === 'off') return null;
    const byMode: Record<Exclude<RelocationMode, 'off'>, { label: string; offsetDeg: number; rotationDeg: number }> = {
      home: { label: 'Hogar', offsetDeg: 2, rotationDeg: 2 },
      work: { label: 'Trabajo', offsetDeg: 4, rotationDeg: 4 },
      travel: { label: 'Viaje', offsetDeg: 6, rotationDeg: 6 },
      abroad: { label: 'Extranjero', offsetDeg: -3, rotationDeg: 3 },
    };
    return { mode: relocationMode, ...byMode[relocationMode] };
  }, [relocationMode]);

  const comparisonWheel = useMemo(() => {
    const enabled = Boolean(synastryEnabled);
    if (!enabled || !natal) return { enabled: false as const, planets: [], label: '' };

    const fromPartnerChart = () => {
      if (!partnerChart) return null;
      const wheel = normalizeNatalForWheel(partnerChart);
      if (!wheel || !wheel.planets || wheel.planets.length === 0) return null;
      const labelName = partnerList.find(p => String(p.id) === String(selectedPartnerId))?.full_name || 'pareja';
      return { planets: wheel.planets, label: `Carta comparada — ${labelName} (lectura simbólica)` };
    };

    const best = fromPartnerChart();
    if (best) return { enabled: true as const, planets: best.planets, label: best.label };

    // No secondary source selected: keep UI informative but avoid changing wheel geometry.
    return { enabled: false as const, planets: [], label: 'Sin carta secundaria: selecciona una pareja para comparar (solo visual).' };
  }, [synastryEnabled, partnerChart, natal, partnerList, selectedPartnerId]);

  // Note: In Phase 3, layer activation is driven ONLY by explicit user toggles (checkboxes),
  // never by inferred year/date inputs.

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar (left) */}
      <aside className="w-72 border-r border-gray-200 bg-white">
        <AstrologySidebar
          houseSystem={houseSystem}
          setHouseSystem={setHouseSystem}
          zodiacType={zodiacType}
          setZodiacType={setZodiacType}
          mode="real"
          layerAvailability={{ transits: overlays.transits, progressions: overlays.progressions, solarReturn: overlays.solarReturn, solarArc: hasChart, lunarReturn: hasChart, compositeChart: hasChart, davisonChart: hasChart }}
          showAsteroids={showAsteroids}
          setShowAsteroids={setShowAsteroids}
          synastryEnabled={hasChart ? synastryEnabled : false}
          setSynastryEnabled={(enabled) => {
            if (!hasChart) return;
            setSynastryEnabled(enabled);
          }}
          hasIdentity={hasIdentity}
          activeLayers={activeLayers}
          onToggleLayer={handleLayerToggle}
          symbolicDoubleWheel={symbolicDoubleWheel}
          setSymbolicDoubleWheel={setSymbolicDoubleWheel}
          symbolicSolarReturnYear={symbolicSolarReturnYear}
          setSymbolicSolarReturnYear={setSymbolicSolarReturnYear}
          symbolicLunarReturnDate={symbolicLunarReturnDate}
          setSymbolicLunarReturnDate={setSymbolicLunarReturnDate}
          showCrossAspects={showCrossAspects}
          setShowCrossAspects={setShowCrossAspects}
          harmonicMode={harmonicMode}
          setHarmonicMode={setHarmonicMode}
          personaMode={personaMode}
          setPersonaMode={setPersonaMode}
          relocationMode={relocationMode}
          setRelocationMode={setRelocationMode}
          advancedObjects={advancedObjects}
          setAdvancedObjects={setAdvancedObjects}
          fixedStars={fixedStars}
          setFixedStars={setFixedStars}
          relationshipMode={relationshipMode}
          setRelationshipMode={setRelationshipMode}
          relationshipRole={relationshipRole}
          setRelationshipRole={setRelationshipRole}
          developmentStage={developmentStage}
          setDevelopmentStage={setDevelopmentStage}
          visualStyle={visualStyle}
          setVisualStyle={setVisualStyle}
          lunarReturnMonth={lunarReturnMonth}
          setLunarReturnMonth={(m) => {
            setLunarReturnMonth(m);
            setLunarReturnData(null); // Force refetch
          }}
          compositeEnabled={compositeEnabled}
          setCompositeEnabled={(enabled) => {
            setCompositeEnabled(enabled);
            if (enabled && !compositeData) {
              setShowPerson2Modal(true);
            }
          }}
          davisonEnabled={davisonEnabled}
          setDavisonEnabled={(enabled) => {
            setDavisonEnabled(enabled);
            if (enabled && !davisonData && person2Data.birth_date) {
              fetchDavisonChart();
            } else if (enabled && !person2Data.birth_date) {
              setShowPerson2Modal(true);
            }
          }}
          patientId={consultante?.id}
          hasNatalChart={hasChart}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-semibold text-gray-900">Carta Natal — Astrología Profesional</h1>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                aria-label="Volver a la página anterior"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Swiss Ephemeris · Solo lectura</p>
            {hasActiveComputedLayers ? (
              <div className="mt-2 inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Capas calculadas activas (Swiss Ephemeris). No se recalcula automáticamente.
              </div>
            ) : null}
            {visualStyle === 'huber' ? (
              <div className="mt-2 inline-flex items-center rounded border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-900" title="Lectura psicológica simbólica (no astronómica).">
                🧠 Estilo HUBER activo · Lectura psicológica simbólica (no astronómica)
              </div>
            ) : null}
          </header>

          {!hasChart ? (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-4xl">🌟</div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-blue-900">Carta natal no calculada</div>
                  <div className="mt-2 text-sm text-blue-800">
                    {hasIdentity 
                      ? 'Los datos de nacimiento están completos. Pulsa el botón "Calcular carta natal" para generar la carta base con tránsitos, progresiones y retorno solar.'
                      : 'Completa fecha, hora y lugar de nacimiento en el perfil del consultante para poder generar la carta.'}
                  </div>
                  {hasIdentity && calculateChart && (
                    <button
                      type="button"
                      onClick={() => setShowRecalcModal(true)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✨ Calcular carta natal
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Hero: Carta Natal (Centrada y Controlada) */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Carta Natal</h2>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">
                  <span>{meta.sistema_casas || 'Placidus'}</span> · <span>{meta.zodiac_type || 'Tropical'}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowRecalcModal(true)}
                    className={`px-3 py-1 rounded text-sm font-medium ${consultante?.id && calculateChart ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                    aria-label={hasChart ? 'Recalcular carta' : 'Calcular carta natal'}
                    disabled={!consultante?.id || !calculateChart}
                    title={!hasChart ? 'No hay carta calculada. Pulsa para calcular por primera vez.' : 'Recalcular carta con nuevos parámetros'}
                  >
                    {hasChart ? '🔁 Recalcular carta' : '✨ Calcular carta natal'}
                  </button>
                </div>
              </div>
            </div>
            {/* Capas Profesionales: toggles + calculate buttons */}
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <h3 className="flex items-center gap-1 text-sm font-semibold mb-2">
                Capas Profesionales
                <InfoTooltip
                  title="Capas Profesionales"
                  description="Diferentes técnicas astrológicas que se pueden activar para enriquecer el análisis. Cada capa aporta una perspectiva diferente sobre la carta natal."
                  examples={[
                    "Natal: la carta base con posiciones al nacer",
                    "Tránsitos: planetas actuales sobre la carta natal",
                    "Progresiones: evolución interna día-por-año",
                    "Retorno Solar: temas del año astrológico"
                  ]}
                  position="bottom"
                />
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {/* Natal: locked on - show consultante snapshot details */}
                <div className="p-3 bg-white border rounded relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        Natal
                        <InfoTooltip
                          title="Carta Natal"
                          description="La carta base calculada para el momento exacto del nacimiento. Muestra las posiciones de todos los planetas, casas y aspectos fundamentales de la personalidad."
                          examples={[
                            "Sol: esencia, vitalidad, propósito de vida",
                            "Luna: emociones, necesidades, mundo interior",
                            "Ascendente: cómo nos presentamos al mundo"
                          ]}
                          position="bottom"
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {hasChart ? renderLayerStateBadge('solo_lectura') : renderLayerStateBadge('pendiente')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    {
                      (() => {
                        // Identity must come only from the provided consultante prop
                        const c = consultante;
                        const name = c.nombre_completo;
                        const birth = c.fecha_nacimiento;
                        const sun = (natal?.planetas || []).find((p: any) => String(p.nombre).toLowerCase() === 'sun' || String(p.nombre).toLowerCase() === 'sol');
                        const sign = sun?.signo ?? '-';
                        const coords = (typeof c.lat === 'number' || typeof c.long === 'number') ? `${c.lat ?? '-'} , ${c.long ?? '-'}` : '-';

                        return (
                          <div className="space-y-1 text-xs text-gray-700">
                            <div><strong>Nombre completo:</strong> {name}</div>
                            <div><strong>Fecha de nacimiento:</strong> {birth ? new Date(birth).toLocaleDateString('es-ES') : '-'}</div>
                            <div><strong>Signo (Sol):</strong> {sign}</div>
                            <div><strong>Coordenadas:</strong> {coords}</div>
                          </div>
                        );
                      })()
                    }
                  </div>
                </div>

                {/* Tránsitos */}
                <div className="p-2 bg-white border rounded relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        Tránsitos
                        <InfoTooltip
                          title="Tránsitos Planetarios"
                          description="Posiciones actuales de los planetas superpuestas sobre la carta natal. Muestran las energías cósmicas que están activando diferentes áreas de tu carta en este momento."
                          examples={[
                            "Saturno transitando tu Sol: período de maduración",
                            "Júpiter en tu casa 10: oportunidades profesionales",
                            "Urano sobre tu Luna: cambios emocionales súbitos"
                          ]}
                          position="bottom"
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasChart ? renderLayerStateBadge('pendiente') : (overlays.transits ? renderLayerStateBadge('solo_lectura') : renderLayerStateBadge('no_calculado'))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={activeLayers.has('transits')}
                        onChange={() => handleLayerToggle('transits')}
                        disabled={!hasChart || !overlays.transits}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : (!overlays.transits ? 'No disponible: el backend no devolvió transits en analysis_result' : 'Tránsitos (cálculo real): superposición de posiciones planetarias (no predictivo).')}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="text-[11px] text-gray-600">
                      {overlays.transits && analysis_result?.transits?.metadatos?.calculated_at
                        ? `Referencia (motor): ${String(analysis_result.transits.metadatos.calculated_at).slice(0, 16)}`
                        : 'Disponible cuando el backend provee transits en analysis_result.'}
                    </div>
                  </div>
                </div>

                {/* Progresiones (secundarias) */}
                <div className="p-2 bg-white border rounded relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        Progresiones (Secundarias)
                        <InfoTooltip
                          title="Progresiones Secundarias"
                          description="Técnica que equivale cada día después del nacimiento a un año de vida. Muestra el desarrollo interno y la evolución psicológica de la persona a lo largo del tiempo."
                          examples={[
                            "Sol progresado cambiando de signo: nueva fase vital",
                            "Luna progresada: ciclo emocional de ~28 años",
                            "Venus progresado directo: apertura en relaciones"
                          ]}
                          position="bottom"
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasChart ? renderLayerStateBadge('pendiente') : (overlays.progressions ? renderLayerStateBadge('solo_lectura') : renderLayerStateBadge('no_calculado'))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={activeLayers.has('progressions')}
                        onChange={() => handleLayerToggle('progressions')}
                        disabled={!hasChart || !overlays.progressions}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : (!overlays.progressions ? 'No disponible: el backend no devolvió progressions en analysis_result' : 'Progresiones secundarias (cálculo real): day-for-year (no predictivo).')}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="text-[11px] text-gray-600">
                      {overlays.progressions && analysis_result?.progressions?.reference_date
                        ? `Referencia (motor): ${String(analysis_result.progressions.reference_date).slice(0, 16)}`
                        : 'Disponible cuando el backend provee progressions en analysis_result.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {/* Retorno Solar */}
                <div className="p-2 bg-white border rounded relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        Retorno Solar
                        <InfoTooltip
                          title="Retorno Solar"
                          description="Carta calculada para el momento exacto en que el Sol regresa a la posición que tenía al nacimiento, cada año. Define los temas principales del año astrológico personal."
                          examples={[
                            "Ascendente del RS: el enfoque principal del año",
                            "Casa donde cae el Sol RS: área de desarrollo",
                            "Planetas en casa 1: protagonismo personal"
                          ]}
                          position="bottom"
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasChart ? renderLayerStateBadge('pendiente') : (overlays.solarReturn ? renderLayerStateBadge('solo_lectura') : renderLayerStateBadge('no_calculado'))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={activeLayers.has('return_solar')}
                        onChange={() => handleLayerToggle('return_solar')}
                        disabled={!hasChart || !overlays.solarReturn}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : (!overlays.solarReturn ? 'No disponible: el backend no devolvió solarReturn en analysis_result' : 'Retorno Solar (cálculo real): calculado por el motor a partir de la carta base (no predictivo).')}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Año</label>
                    <div className="text-[11px] text-gray-600">
                      {analysis_result?.solarReturn?.reference_date
                        ? `Instante (motor): ${String(analysis_result.solarReturn.reference_date).slice(0, 16)}`
                        : 'Disponible cuando el backend provee solarReturn en analysis_result.'}
                    </div>
                  </div>
                </div>

                {/* Arco Solar (cálculo real) */}
                <div className={`p-2 border rounded relative ${solarArcData ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        Arco Solar
                        <InfoTooltip
                          title="Arco Solar (Direcciones)"
                          description="Técnica predictiva que avanza todos los planetas el mismo número de grados que el Sol ha progresado desde el nacimiento. Muestra activaciones de potencial natal."
                          examples={[
                            "Arco Solar a la Luna: eventos emocionales significativos",
                            "Arco Solar al MC: logros profesionales",
                            "Arco Solar a Venus: cambios en relaciones"
                          ]}
                          position="bottom"
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasChart ? renderLayerStateBadge('pendiente') : (solarArcData ? renderLayerStateBadge('solo_lectura') : (solarArcLoading ? renderLayerStateBadge('calculando') : renderLayerStateBadge('no_calculado')))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={activeLayers.has('solarArc')}
                        onChange={() => handleLayerToggle('solarArc')}
                        disabled={!hasChart}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : 'Arco Solar (cálculo real): desplazamiento uniforme basado en el movimiento del Sol.'}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    {solarArcLoading ? (
                      <div className="text-[11px] text-blue-600 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Calculando Arco Solar...
                      </div>
                    ) : solarArcError ? (
                      <div className="text-[11px] text-red-600">{solarArcError}</div>
                    ) : solarArcData ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-blue-800 font-semibold">
                          Arco: {solarArcData.arc_degrees.toFixed(2)}°
                          ({Math.floor(solarArcData.arc_degrees / 30)} signos, {(solarArcData.arc_degrees % 30).toFixed(2)}°)
                        </div>
                        <div className="text-[11px] text-blue-700">
                          Fecha objetivo: {solarArcData.target_date}
                        </div>
                        <div className="mt-2">
                          <label className="text-[11px] text-gray-600 block mb-1">Cambiar fecha:</label>
                          <input
                            type="date"
                            value={solarArcDate}
                            onChange={(e) => {
                              setSolarArcDate(e.target.value);
                              setSolarArcData(null); // Force refetch
                            }}
                            className="text-[11px] border border-blue-300 rounded px-2 py-1 w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-600">Activa la capa para calcular el Arco Solar.</div>
                    )}
                  </div>
                </div>

                {/* Lunar Return Panel */}
                <div className="mt-4 border-t border-gray-100 pt-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[13px] font-medium text-purple-900">
                      🌙 Retorno Lunar
                      <span className="text-[10px] text-purple-600 font-normal">(Swiss Ephemeris)</span>
                      <InfoTooltip
                        title="Retorno Lunar"
                        description="Carta calculada para el momento exacto en que la Luna regresa a su posición natal, aproximadamente cada 28 días. Indica el tono emocional y los temas del mes lunar personal."
                        examples={[
                          "Luna del RL en casa 10: foco en carrera",
                          "Aspectos difíciles: mes de desafíos emocionales",
                          "Júpiter angular: mes de optimismo y expansión"
                        ]}
                        position="bottom"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeLayers.has('return_lunar')}
                        onChange={() => handleLayerToggle('return_lunar')}
                        disabled={!hasChart}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : 'Retorno Lunar: momento exacto cuando la Luna regresa a su posición natal.'}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    {lunarReturnLoading ? (
                      <div className="text-[11px] text-purple-600 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Calculando Retorno Lunar...
                      </div>
                    ) : lunarReturnError ? (
                      <div className="text-[11px] text-red-600">{lunarReturnError}</div>
                    ) : lunarReturnData ? (
                      <div className="space-y-2 bg-purple-50 border border-purple-200 rounded p-3">
                        <div className="text-[11px] text-purple-900 font-semibold">
                          Momento exacto: {new Date(lunarReturnData.return_datetime).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-[11px] text-purple-700">
                          Posición lunar natal: {lunarReturnData.lunar_position.toFixed(4)}°
                        </div>
                        <div className="text-[11px] text-purple-600">
                          Posición retorno: {lunarReturnData.return_lunar_position.toFixed(4)}°
                        </div>
                        <div className="text-[11px] text-purple-500">
                          Precisión: {(lunarReturnData.precision * 3600).toFixed(1)} arcosegundos
                        </div>
                        <div className="mt-2">
                          <label className="text-[11px] text-gray-600 block mb-1">Mes objetivo:</label>
                          <input
                            type="month"
                            value={lunarReturnMonth}
                            onChange={(e) => {
                              setLunarReturnMonth(e.target.value);
                              setLunarReturnData(null); // Force refetch
                            }}
                            className="text-[11px] border border-purple-300 rounded px-2 py-1 w-full"
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-purple-600 bg-purple-100 rounded p-2">
                          ℹ️ El Retorno Lunar ocurre cada ~27.3 días cuando la Luna regresa a su posición natal exacta.
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-600">Activa la capa para calcular el Retorno Lunar.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interpretation Panel */}
            <div className="mb-6">
              <AIInterpretationPanel
                patientId={consultante?.id ?? null}
                hasChart={hasChart}
                hasTransits={overlays.transits}
                hasProgressions={overlays.progressions}
                hasSolarReturn={overlays.solarReturn}
              />
            </div>

            {/* AI Situation Chat */}
            <div className="mb-6">
              <AISituationChat
                patientId={consultante?.id ?? null}
                hasChart={hasChart}
                patientName={consultante?.nombre_completo ?? undefined}
              />
            </div>

            {temporalLayers.length > 0 ? (
              <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Lectura simbólica — capas temporales</div>
                    <div className="mt-1 text-xs text-gray-600">Estas capas no predicen eventos; ayudan a observar dinámicas simbólicas en el tiempo.</div>
                  </div>
                  <div className="text-xs text-gray-500">{renderLayerStateBadge('solo_lectura')}</div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {temporalLayers.map((l) => (
                    <div key={`temporal-${l.key}`} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-900">{l.label || l.key}</div>
                      <div className="mt-1 text-[11px] text-gray-600">
                        {l.key === 'transits' ? 'Activaciones externas en relación a la carta base.' : null}
                        {l.key === 'progressions' ? 'Desarrollo interno observado a lo largo del tiempo.' : null}
                        {l.key === 'solarArc' ? 'Referencia estructural con desplazamiento simbólico uniforme.' : null}
                      </div>
                      <div className="mt-2 text-[11px] text-gray-500">No representa certezas ni resultados futuros.</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Phase 3: timeline UI remains disabled until backend supports targeting specific years/months for returns. */}
            {false ? (
              <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Timeline temporal (lectura simbólica)</div>
                    <div className="mt-1 text-xs text-gray-600">El timeline no cambia la carta; solo ajusta el enfoque temporal simbólico.</div>
                  </div>
                  <div className="text-xs text-gray-500">{renderLayerStateBadge('solo_lectura')}</div>
                </div>

                {focusLabel ? (
                  <div className="mt-2 text-[12px] text-gray-700">{focusLabel}</div>
                ) : null}

                {symbolicSolarReturnYear !== null ? (
                  <div className="mt-3 p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium text-gray-900">Timeline anual — Retorno Solar</div>
                      <div className="text-xs text-gray-600">Año {symbolicSolarReturnYear}</div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-[12px] text-gray-700">
                        <input
                          type="checkbox"
                          checked={Boolean(solarReturnCompareEnabled)}
                          onChange={(e) => setSolarReturnCompareEnabled(e.target.checked)}
                        />
                        Comparar con otro año
                      </label>
                      {solarReturnCompareEnabled && solarReturnCompareYearB !== null ? (
                        <div className="text-[12px] text-gray-600">Comparación anual simbólica</div>
                      ) : null}
                    </div>
                    <input
                      type="range"
                      className="mt-2 w-full"
                      min={symbolicSolarReturnYear! - 5}
                      max={symbolicSolarReturnYear! + 5}
                      value={symbolicSolarReturnYear!}
                      onChange={(e) => setSymbolicSolarReturnYear(Number(e.target.value))}
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                      <span>{symbolicSolarReturnYear! - 5}</span>
                      <span>{symbolicSolarReturnYear!}</span>
                      <span>{symbolicSolarReturnYear! + 5}</span>
                    </div>

                    {solarReturnCompareEnabled && solarReturnCompareYearB !== null ? (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[13px] font-medium text-gray-900">Año B (comparación)</div>
                          <div className="text-xs text-gray-600">Año {solarReturnCompareYearB}</div>
                        </div>
                        <input
                          type="range"
                          className="mt-2 w-full"
                          min={solarReturnCompareYearB! - 5}
                          max={solarReturnCompareYearB! + 5}
                          value={solarReturnCompareYearB!}
                          onChange={(e) => setSolarReturnCompareYearB(Number(e.target.value))}
                        />
                        <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                          <span>{solarReturnCompareYearB! - 5}</span>
                          <span>{solarReturnCompareYearB!}</span>
                          <span>{solarReturnCompareYearB! + 5}</span>
                        </div>
                        <div className="mt-3 rounded border border-gray-200 bg-white p-3">
                          <div className="text-[13px] font-semibold text-gray-900">Comparación anual simbólica</div>
                          <div className="mt-1 text-[12px] text-gray-600">Compara climas simbólicos anuales; no compara eventos ni predice resultados.</div>
                          <ul className="mt-2 space-y-1 text-[12px] text-gray-700">
                            <li title="Texto descriptivo y no predictivo.">Año A — énfasis simbólico: consolidación y centrado identitario.</li>
                            <li title="Texto descriptivo y no predictivo.">Año B — énfasis simbólico: ajuste y reorientación de prioridades.</li>
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {symbolicLunarReturnDate ? (
                  <div className="mt-3 p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium text-gray-900">Timeline mensual — Retorno Lunar</div>
                      <div className="text-xs text-gray-600">{symbolicLunarReturnDate!.slice(0, 7)}</div>
                    </div>
                    <input
                      type="range"
                      className="mt-2 w-full"
                      min={0}
                      max={11}
                      step={1}
                      value={lunarMonthIndex}
                      onChange={(e) => setLunarMonthIndex(Number(e.target.value))}
                    />
                    <div className="mt-1 grid grid-cols-6 gap-1 text-[10px] text-gray-500">
                      {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, idx) => (
                        <div key={`m-${idx}`} className={`text-center ${idx === lunarMonthIndex ? 'text-gray-900 font-semibold' : ''}`}>{m}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Tabs: Visual / Psicológico */}
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <button className={`px-3 py-1 rounded text-sm ${activeTab === 'visual' ? 'bg-gray-100' : 'bg-white'}`} onClick={() => setActiveTab('visual')}>Visual</button>
                  <button className={`px-3 py-1 rounded text-sm ${activeTab === 'psych' ? 'bg-gray-100' : 'bg-white'}`} onClick={() => setActiveTab('psych')}>Psicológico</button>
                </div>
              </div>

              {/* Synastry partner selector if enabled */}
              {synastryEnabled ? (
                <div className="mb-4 p-3 border rounded-md bg-amber-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Sinastría — Doble Rueda</div>
                      <div className="text-xs text-gray-600">Seleccione la pareja para comparar</div>
                    </div>
                    <div className="text-xs text-gray-500">{partnerChart ? 'Pareja cargada' : 'Sin pareja'}</div>
                  </div>
                  <div className="mt-3">
                    <button className="px-2 py-1 text-sm rounded border mr-2" onClick={async () => {
                      try {
                        setPartnerLoading(true);
                        setPartnerLoadError(null);
                        const list = await getTherapistPatients();
                        setPartnerList(list || []);
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Could not fetch patients', e);
                        setPartnerList([]);
                        setPartnerLoadError(String((e as any)?.message || e));
                      } finally {
                        setPartnerLoading(false);
                      }
                    }}>Cargar lista de pacientes</button>
                    {partnerLoading ? <span className="ml-2 text-xs text-gray-500">Cargando...</span> : null}
                    {partnerLoadError ? <span className="ml-2 text-xs text-red-500">{partnerLoadError}</span> : null}
                    <select value={selectedPartnerId ?? ''} onChange={async (e) => {
                      const v = e.target.value || null; setSelectedPartnerId(v);
                      if (!v) { setPartnerChart(null); setSynastryAspects([]); return; }
                      try {
                        const token = getAuthToken();
                        if (!token) throw new Error('No auth');
                        const resp = await fetch(`${apiURL}/therapist/patients/${v}/astrology-kerykeion/`, { method: 'GET', headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } });
                        if (!resp.ok) { setPartnerChart(null); setSynastryAspects([]); return; }
                        const pdata = await resp.json();
                        // Normalize similar to useNatalChart behavior: prefer data.chart or chart_payload
                        const payload = pdata.chart || pdata.chart_payload || pdata;
                        setPartnerChart(payload || null);
                        // compute synastry aspects using normalized wheel data
                        const baseWheel = normalizeNatalForWheel(natal as any);
                        const otherWheel = normalizeNatalForWheel(payload);
                        const syn = computeSynastryAspects(baseWheel.planets || [], otherWheel.planets || []);
                        setSynastryAspects(syn);
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('Load partner failed', err);
                        setPartnerChart(null);
                        setSynastryAspects([]);
                      }
                    }} className="ml-2 rounded border px-2 py-1">
                      <option value="">-- seleccionar pareja --</option>
                      {partnerList.map((p: any) => (
                        <option key={String(p.id)} value={String(p.id)}>{p.full_name || p.first_name || p.full_name}</option>
                      ))}
                    </select>
                  </div>
                  {false && (
                    <>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="px-2 py-1 rounded border bg-white text-sm" onClick={() => {
                          // compute composite from loaded partnerChart
                          if (!partnerChart) return;
                          // const cmp = computeCompositeFromTwoNatal(natal, partnerChart);
                          // setCompositeChart(cmp);
                        }}>Generar Carta Compuesta</button>
                        <button className="px-2 py-1 rounded border bg-white text-sm" onClick={async () => {
                          // Generate Carta Davison using midpoint of time & space and Swiss Ephemeris via existing endpoint
                          // Only allow when a persisted partner is selected/loaded from therapist patients
                          if (!partnerChart) { setDavisonError('Seleccione una pareja válida de la lista.'); return; }
                          try {
                            setDavisonGenerating(true);
                            setDavisonError(null);
                            const token = getAuthToken();
                            if (!token) throw new Error('No auth');

                            // Build participant snapshot helper
                            const buildSnapshot = (payload: any, consultanteObj: any) => {
                              const snap = (payload && payload.metadatos && payload.metadatos.input_snapshot) || null;
                              if (snap) return snap;
                              // Fallback to consultante object if provided
                              if (!consultanteObj) return null;
                              return {
                                id: consultanteObj.id ?? null,
                                full_name: consultanteObj.nombre_completo ?? consultanteObj.full_name ?? null,
                                birth_date: consultanteObj.fecha_nacimiento ?? consultanteObj.birth_date ?? null,
                                birth_time: consultanteObj.hora_nacimiento ?? consultanteObj.birth_time ?? null,
                                birth_timezone: consultanteObj.timezone ?? consultanteObj.birth_timezone ?? null,
                                birth_city: consultanteObj.ciudad ?? consultanteObj.city ?? null,
                                birth_country: consultanteObj.pais ?? consultanteObj.country ?? null,
                                birth_latitude: Number(consultanteObj.lat ?? consultanteObj.birth_latitude ?? consultanteObj.latitude ?? null),
                                birth_longitude: Number(consultanteObj.long ?? consultanteObj.lon ?? consultanteObj.birth_longitude ?? consultanteObj.longitude ?? null),
                                snapshot_id: consultanteObj.snapshot_id ?? null,
                              };
                            };

                            const snapA = buildSnapshot(natal, consultante);
                            // determine partner consultante object candidate: prefer selected partner id -> partnerChart
                            const partnerConsultanteObj = partnerList.find(p => String(p.id) === String(selectedPartnerId)) || partnerChart;
                            const snapB = buildSnapshot(partnerChart, partnerConsultanteObj);

                            if (!snapA || !snapB) {
                              throw new Error('Datos insuficientes para calcular Carta Davison (faltan fecha/hora/coords).');
                            }

                            // Request davison calculation via existing endpoint (backend will compute midpoint and use Swiss Ephemeris)
                            const body: any = {
                              method: 'davison',
                              participants: [snapA, snapB],
                              house_system: houseSystem,
                              zodiac_type: zodiacType,
                              meta: {
                                type: 'davison',
                                source: `${snapA.id || snapA.full_name || 'A'}+${snapB.id || snapB.full_name || 'B'}`,
                                event_basis: 'midpoint_time_space',
                              },
                            };

                            const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                              body: JSON.stringify(body),
                            });

                            if (!resp.ok) {
                              const txt = await resp.text().catch(() => 'error');
                              throw new Error(txt);
                            }

                            const data = await resp.json();
                            const payload = data.chart || data.chart_payload || data;
                            // store as davison chart snapshot
                            setDavisonChart(payload || null);
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Davison generation failed', err);
                            setDavisonChart(null);
                            setDavisonError((err as any)?.message || 'Error generando Carta Davison');
                          } finally {
                            setDavisonGenerating(false);
                          }
                        }}>Generar Carta Davison</button>
                        <button className="px-2 py-1 rounded border bg-white text-sm" onClick={() => { setCompositeChart(null); }}>Cerrar Compuesta</button>
                      </div>

                      {davisonError ? (
                        <div className="mt-3 text-sm text-red-600">{davisonError}</div>
                      ) : null}

                      {compositeChart ? (
                        <div className="mt-3">
                          <div className="mb-2 text-sm font-semibold">Carta Compuesta · Observación Relacional</div>
                          {(() => {
                            const cw = normalizeNatalForWheel(compositeChart);
                            return (
                              <AstroWheelAdvanced
                                size={720}
                                ascendantDeg={cw.ascendantDeg ?? 0}
                                houses={cw.houses}
                                planets={cw.planets}
                                asteroids={[] as any}
                                showAspects={true}
                                orbDeg={orb}
                                titleRight={`Compuesta · Observación Relacional`}
                                transitPlanets={transitsSnapshot && transitBaseType === 'composite_chart' ? transitsSnapshot.planets : undefined}
                              />
                            );
                          })()}
                        </div>
                      ) : null}

                      {davisonChart ? (
                        <div className="mt-4 bg-white border rounded p-3">
                          <div className="mb-2 text-sm font-semibold">Carta Davison</div>
                          <div className="text-xs text-gray-700 mb-2">La Carta Davison representa el evento relacional calculado a partir del punto medio real de tiempo y espacio.</div>
                          {(() => {
                            const dw = normalizeNatalForWheel(davisonChart);
                            return (
                              <AstroWheelAdvanced
                                size={720}
                                ascendantDeg={dw.ascendantDeg ?? 0}
                                houses={dw.houses}
                                planets={dw.planets}
                                asteroids={[] as any}
                                showAspects={true}
                                orbDeg={orb}
                                titleRight={`Carta Davison`}
                                transitPlanets={transitsSnapshot && transitBaseType === 'davison_chart' ? transitsSnapshot.planets : undefined}
                              />
                            );
                          })()}
                        </div>
                      ) : null}
                    </>
                  )}

                  {/* Secondary Progressions Panel (A17.1) */}
                  {showSecondaryProgressions ? (
                    <div className="mt-4 bg-white border rounded p-3">
                      <div className="mb-2 text-sm font-semibold">Progresiones Secundarias (Observación)</div>
                      <div className="text-xs text-gray-700 mb-2">Superposición de posiciones progresadas para una fecha objetivo. No es predictivo.</div>

                      <div className="mb-2">
                        <label className="block text-xs text-gray-600">Fecha objetivo</label>
                        <input type="date" value={progressedTargetDate} onChange={(e) => setProgressedTargetDate(e.target.value)} className="mt-1 rounded border px-2 py-1 text-sm" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={async () => {
                          if (!consultante?.id) return;
                          if (!consultante?.fecha_nacimiento) { setProgressionsError('Se requiere una carta natal válida para observar progresiones.'); return; }
                          try {
                            setProgressionsLoading(true);
                            setProgressionsError(null);
                            const token = getAuthToken(); if (!token) throw new Error('No auth');

                            // Use existing backend contract for progressions: layer 'progressions' with method 'secondary' and reference_date
                            const body: any = { layer: 'progressions', method: 'secondary', reference_date: progressedTargetDate };
                            const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }, body: JSON.stringify(body)
                            });
                            if (!resp.ok) { const txt = await resp.text().catch(() => 'error'); throw new Error(txt); }
                            const data = await resp.json();
                            const payload = data.chart || data.chart_payload || data;
                            const pw = normalizeNatalForWheel(payload);
                            setProgressionsSnapshot({ observed_target_date: progressedTargetDate, progressed_datetime: progressedTargetDate, planets: pw.planets });
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Progressions generation failed', err);
                            setProgressionsError((err as any)?.message || 'Error calculando progresiones');
                            setProgressionsSnapshot(null);
                          } finally { setProgressionsLoading(false); }
                        }}>{progressionsLoading ? 'Calculando...' : 'Recalcular'}</button>

                        <button className="px-3 py-1 rounded border bg-white text-sm" onClick={() => { setProgressionsSnapshot(null); setProgressionsError(null); }}>Limpiar</button>
                      </div>

                      {progressionsError ? <div className="mt-2 text-xs text-red-600">{progressionsError}</div> : null}
                      {progressionsSnapshot ? <div className="mt-2 text-xs text-gray-600">Progresada: {progressionsSnapshot.progressed_datetime}</div> : null}
                    </div>
                  ) : null}

                  {/* Solar Return Panel (A17.2) */}
                  {showSolarReturn ? (
                    <div className="mt-4 bg-white border rounded p-3">
                      <div className="mb-2 text-sm font-semibold">Retorno Solar (Observación anual)</div>
                      <div className="text-xs text-gray-700 mb-2">Carta calculada para el instante exacto de retorno del Sol a su posición natal. No es predictivo.</div>

                      <div className="mb-2">
                        <label className="block text-xs text-gray-600">Año objetivo</label>
                        <input type="number" value={solarReturnYear} onChange={(e) => setSolarReturnYear(Number(e.target.value))} className="mt-1 rounded border px-2 py-1 text-sm" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={async () => {
                          if (!consultante?.id) return;
                          if (!consultante?.fecha_nacimiento) { setSolarReturnError('Se requiere una carta natal válida para observar retornos.'); return; }
                          try {
                            setSolarReturnLoading(true); setSolarReturnError(null);
                            const token = getAuthToken(); if (!token) throw new Error('No auth');

                            // Reuse existing contract: method 'solar_return' with target year
                            const body: any = { method: 'solar_return', year: solarReturnYear };
                            const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }, body: JSON.stringify(body)
                            });
                            if (!resp.ok) { const txt = await resp.text().catch(() => 'error'); throw new Error(txt); }
                            const data = await resp.json();
                            const payload = data.chart || data.chart_payload || data;
                            const rw = normalizeNatalForWheel(payload);
                            setSolarReturnSnapshot({ target_year: solarReturnYear, return_datetime_exact: payload?.metadatos?.calculated_at || new Date().toISOString(), planets: rw.planets, houses: rw.houses });
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Solar return failed', err);
                            setSolarReturnError((err as any)?.message || 'No se pudo calcular el retorno para el año seleccionado.');
                            setSolarReturnSnapshot(null);
                          } finally { setSolarReturnLoading(false); }
                        }}>{solarReturnLoading ? 'Calculando...' : 'Calcular Retorno'}</button>

                        <button className="px-3 py-1 rounded border bg-white text-sm" onClick={() => { setSolarReturnSnapshot(null); setSolarReturnError(null); }}>Limpiar</button>
                      </div>

                      {solarReturnError ? <div className="mt-2 text-xs text-red-600">{solarReturnError}</div> : null}
                      {solarReturnSnapshot ? (
                        <>
                          <div className="mt-2 text-xs text-gray-600">Instante: {solarReturnSnapshot.return_datetime_exact}</div>
                          {/* Preview del Retorno Solar */}
                          <div className="mt-4 border rounded bg-gray-50 p-2">
                            <div className="text-xs text-gray-500 mb-2 text-center">Vista previa — Retorno Solar {solarReturnYear}</div>
                            <div className="flex justify-center">
                              <AstroWheelAdvanced
                                size={400}
                                ascendantDeg={solarReturnSnapshot.houses?.[0]?.degree ?? 0}
                                houses={solarReturnSnapshot.houses ?? []}
                                planets={solarReturnSnapshot.planets ?? []}
                                asteroids={[]}
                                showAspects={true}
                                orbDeg={orb}
                                visualStyle="classic"
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Advanced Transits Panel (A16.3) */}
                  {showAdvancedTransits ? (
                    <div className="mt-4 bg-white border rounded p-3">
                      <div className="mb-2 text-sm font-semibold">Tránsitos Avanzados (Observación temporal)</div>
                      <div className="text-xs text-gray-700 mb-2">Superposición de posiciones planetarias en una fecha concreta sobre una carta base. No es predictivo.</div>

                      {/* Base selector */}
                      <div className="mb-2 text-sm">
                        <label className="block text-xs text-gray-600">Carta base</label>
                        <select value={transitBaseType} disabled className="mt-1 rounded border px-2 py-1 text-sm">
                          <option value="natal">Natal</option>
                          <option value="composite_chart" disabled={!compositeChart}>Compuesta</option>
                          <option value="davison_chart" disabled={!davisonChart}>Davison</option>
                        </select>
                        {(!compositeChart && transitBaseType === 'composite_chart') || (!davisonChart && transitBaseType === 'davison_chart') ? (
                          <div className="mt-1 text-xs text-red-600">Selecciona una carta base (Natal, Compuesta o Davison) para observar tránsitos.</div>
                        ) : null}
                      </div>

                      {/* Date selector */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600">Fecha de observación</label>
                        <input type="date" value={advancedTransitDate} onChange={(e) => setAdvancedTransitDate(e.target.value)} className="mt-1 rounded border px-2 py-1 text-sm" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={async () => {
                          // Recalculate transits overlay using existing backend endpoint
                          if (!consultante?.id) return;
                          // validate base availability
                          if (transitBaseType === 'composite_chart' && !compositeChart) { setTransitError('Selecciona una carta base válida.'); return; }
                          if (transitBaseType === 'davison_chart' && !davisonChart) { setTransitError('Selecciona una carta base válida.'); return; }

                          try {
                            setTransitLoading(true);
                            setTransitError(null);
                            const token = getAuthToken();
                            if (!token) throw new Error('No auth');

                            let body: any = { reference_date: advancedTransitDate };
                            if (transitBaseType === 'natal') {
                              body.layer = 'transits';
                            } else {
                              // Send a method request reusing backend flexible API: method 'transits' with base chart payload
                              body.method = 'transits';
                              body.base_chart = transitBaseType === 'composite_chart' ? (compositeChart) : (davisonChart);
                            }

                            const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                              body: JSON.stringify(body),
                            });

                            if (!resp.ok) {
                              const txt = await resp.text().catch(() => 'error');
                              throw new Error(txt);
                            }

                            const data = await resp.json();
                            const payload = data.chart || data.chart_payload || data;
                            // Normalize to wheel data and keep only planets for overlay
                            const tw = normalizeNatalForWheel(payload);
                            setTransitsSnapshot({ observed_datetime: advancedTransitDate, base_type: transitBaseType, planets: tw.planets });
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Transits generation failed', err);
                            setTransitError((err as any)?.message || 'Error calculando tránsitos');
                            setTransitsSnapshot(null);
                          } finally {
                            setTransitLoading(false);
                          }
                        }} disabled={transitLoading || (transitBaseType !== 'natal' && transitBaseType === 'composite_chart' && !compositeChart) || (transitBaseType !== 'natal' && transitBaseType === 'davison_chart' && !davisonChart)}>
                          {transitLoading ? 'Calculando...' : 'Recalcular'}
                        </button>

                        <button className="px-3 py-1 rounded border bg-white text-sm" onClick={() => { setTransitsSnapshot(null); setTransitError(null); }}>Limpiar</button>
                      </div>

                      {transitError ? <div className="mt-2 text-xs text-red-600">{transitError}</div> : null}
                      {transitsSnapshot ? <div className="mt-2 text-xs text-gray-600">Observación: {transitsSnapshot.observed_datetime}</div> : null}
                    </div>
                  ) : null}

                  {/* A18: Comparative Panels */}
                  {showCompareSolarReturn ? (
                    <div id="compare-solar-return" className="mt-4 bg-white border rounded p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">Comparativa — Natal ↔ Retorno Solar</div>
                          <div className="text-xs text-gray-600">Doble rueda comparativa (observación). No es predictiva.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 rounded border bg-white text-sm" onClick={() => setShowCompareSolarReturn(false)}>Cerrar</button>
                          <button className="px-2 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => exportComparativeAsPDF('compare-solar-return', `comparativa_solar_${consultante?.id || 'x'}.pdf`)}>Exportar PDF</button>
                        </div>
                      </div>
                      <div>
                        {(() => {
                          const compared = solarReturnSnapshot ? { planets: solarReturnSnapshot.planets, houses: solarReturnSnapshot.houses } : (analysis_result?.solarReturn?.chart ? normalizeNatalForWheel(analysis_result.solarReturn.chart) : null);
                          if (!compared) return <div className="text-xs text-gray-600">No hay Retorno Solar calculado. Calcula uno desde el panel de Retorno Solar.</div>;
                          const baseWheel = normalizeNatalForWheel(natal as any);
                          const compWheel = (compared.planets ? { ascendantDeg: (compared as any).ascendantDeg ?? 0, houses: (compared as any).houses ?? (compared as any).houses, planets: (compared as any).planets } : compared) as any;
                          return (
                            <AstroDoubleWheelAdvanced
                              size={920}
                              baseAscDeg={baseWheel.ascendantDeg ?? 0}
                              baseHouses={baseWheel.houses}
                              basePlanets={baseWheel.planets}
                              comparedAscDeg={compWheel.ascendantDeg ?? 0}
                              comparedPlanets={compWheel.planets ?? []}
                              showAsteroids={false}
                              asteroidsBase={baseWheel.asteroids ?? []}
                              asteroidsCompared={compWheel.asteroids ?? []}
                              orbDeg={orb}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  ) : null}

                  {showCompareProgressions ? (
                    <div id="compare-progressions" className="mt-4 bg-white border rounded p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">Comparativa — Natal ↔ Progresiones (overlay)</div>
                          <div className="text-xs text-gray-600">Natal con superposición de posiciones progresadas. Observación únicamente.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 rounded border bg-white text-sm" onClick={() => setShowCompareProgressions(false)}>Cerrar</button>
                          <button className="px-2 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => exportComparativeAsPDF('compare-progressions', `comparativa_progresiones_${consultante?.id || 'x'}.pdf`)}>Exportar PDF</button>
                        </div>
                      </div>
                      <div>
                        {progressionsSnapshot ? (
                          (() => {
                            const baseWheel = normalizeNatalForWheel(natal as any);
                            return (
                              <AstroWheelAdvanced
                                size={920}
                                ascendantDeg={baseWheel.ascendantDeg ?? 0}
                                houses={baseWheel.houses}
                                planets={baseWheel.planets}
                                asteroids={[]}
                                showAspects={true}
                                orbDeg={orb}
                                transitPlanets={progressionsSnapshot.planets}
                              />
                            );
                          })()
                        ) : (
                          <div className="text-xs text-gray-600">No hay progresiones calculadas. Calcula una progresión desde el panel de Progresiones.</div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {synastryAspects.length > 0 ? (
                    <div className="mt-3 text-xs">
                      <strong>Aspectos de sinastría:</strong> {synastryAspects.length}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === 'visual' ? (
                <>
                  {/* Calculation status panel - UI only, read-only */}
                  <CalculationStatusPanel
                    mode="real"
                    overlays={overlays}
                    activeLayers={activeLayers}
                    harmonicMode={harmonicMode}
                    personaMode={personaMode}
                    relocationMode={relocationMode}
                    advancedObjects={advancedObjects}
                    fixedStars={fixedStars}
                    relationshipMode={relationshipMode}
                    relationshipRole={relationshipRole}
                    developmentStage={developmentStage}
                    secondaryLayerKey={secondaryLayer}
                    comparisonEnabled={Boolean(synastryEnabled)}
                    comparisonAspectsEnabled={Boolean(synastryEnabled)}
                    houseSystem={houseSystem}
                    zodiacType={zodiacType}
                    canRecalculate={Boolean(calculateChart)}
                  />
                  {/* Recalculation modal (confirmation) */}
                  {showRecalcModal ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowRecalcModal(false)} />
                      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-lg">
                        <h3 className="text-lg font-semibold">{hasChart ? 'Recalcular carta astrológica' : '✨ Calcular carta natal'}</h3>
                        <p className="mt-3 text-sm text-gray-700">
                          {hasChart 
                            ? 'Estás a punto de recalcular la carta usando un método distinto.'
                            : 'Se calculará la carta natal por primera vez. Este cálculo incluirá automáticamente las capas de tránsitos, progresiones y retorno solar.'}
                        </p>
                        <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                          {hasChart ? (
                            <>
                              <li>✔ La carta natal original se conservará</li>
                              <li>✔ Se creará una nueva sesión de cálculo</li>
                              <li>✖ Esto no es reversible</li>
                            </>
                          ) : (
                            <>
                              <li>✔ Carta natal (base)</li>
                              <li>✔ Tránsitos actuales</li>
                              <li>✔ Progresiones secundarias</li>
                              <li>✔ Retorno solar actual</li>
                            </>
                          )}
                        </ul>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600">Sistema de casas</label>
                            <select value={recalcMethod.houses} onChange={(e) => setRecalcMethod((r) => ({ ...r, houses: e.target.value }))} className="mt-1 w-full rounded border px-2 py-2">
                              <option value="P">Placidus (P)</option>
                              <option value="K">Koch (K)</option>
                              <option value="W">Whole Sign (W)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600">Zodiaco</label>
                            <select value={recalcMethod.zodiac} onChange={(e) => setRecalcMethod((r) => ({ ...r, zodiac: e.target.value }))} className="mt-1 w-full rounded border px-2 py-2">
                              <option value="tropical">Tropical</option>
                              <option value="sidereal">Sidéreo (Lahiri)</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <button className="px-3 py-2 rounded border" onClick={() => setShowRecalcModal(false)}>❌ Cancelar</button>
                          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={async () => {
                            // Confirm and perform recalculation (real, persisted in backend)
                            try {
                              if (calculateChart) {
                                await calculateChart(recalcMethod.houses, recalcMethod.zodiac);
                              } else if (refetch) {
                                await refetch();
                              }
                            } finally {
                              setShowRecalcModal(false);
                            }
                          }}>{hasChart ? '✅ Recalcular' : '✨ Calcular carta'}</button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {!synastryEnabled && hasChart && activeLayers.has('transits') && analysis_result?.transits ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.transits} overlayLabel="Tránsitos" orbDegrees={orb} consultante={consultante} />
                  ) : !synastryEnabled && hasChart && activeLayers.has('progressions') && analysis_result?.progressions?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.progressions.chart} overlayLabel="Progresiones (Secundarias)" orbDegrees={orb} consultante={consultante} />
                  ) : !synastryEnabled && hasChart && activeLayers.has('return_solar') && analysis_result?.solarReturn?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.solarReturn.chart} overlayLabel="Retorno Solar" orbDegrees={orb} consultante={consultante} />
                  ) : hasChart && synastryEnabled && partnerChart ? (
                    <div>
                      {/* Hero info for sinastry */}
                      <div className="mb-3 p-3 bg-white border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">Sinastría — Doble Rueda</div>
                            <div className="text-xs text-gray-600">Consultante base: {consultante.nombre_completo}</div>
                            <div className="text-xs text-gray-600">Consultante comparado: {partnerList.find(p => String(p.id) === String(selectedPartnerId))?.full_name || '-'}</div>
                            <div className="text-xs text-gray-600">Sistema: {meta.zodiac_type || 'Tropical'} · {meta.sistema_casas || 'Placidus'}</div>
                            <div className="text-xs text-gray-600">Motor: Swiss Ephemeris</div>
                          </div>
                          <div className="text-xs text-right space-y-1">
                            <div className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-[12px]">Lectura simbólica relacional</div>
                            <div className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-[12px]">Uso holístico profesional</div>
                          </div>
                        </div>
                        <div className="mt-2 text-[12px] text-gray-500">Lectura simbólica basada en astrología psicológica de inspiración junguiana. No constituye diagnóstico ni evaluación clínica.</div>
                      </div>

                      {/* Double wheel advanced */}
                      {(() => {
                        const baseWheel = normalizeNatalForWheel(natal as any);
                        const otherWheel = normalizeNatalForWheel(partnerChart);
                        return (
                          <AstroDoubleWheelAdvanced
                            size={920}
                            baseAscDeg={baseWheel.ascendantDeg ?? 0}
                            baseHouses={baseWheel.houses}
                            basePlanets={baseWheel.planets}
                            comparedAscDeg={otherWheel.ascendantDeg ?? 0}
                            comparedPlanets={otherWheel.planets}
                            showAsteroids={showAsteroids}
                            asteroidsBase={baseWheel.asteroids ?? []}
                            asteroidsCompared={otherWheel.asteroids ?? []}
                            orbDeg={orb}
                          />
                        );
                      })()}

                      {synastryAspects.length > 0 ? (
                        <div className="mt-3 bg-white border border-gray-100 rounded p-3 text-xs">
                          <strong>Aspectos de sinastría ({synastryAspects.length}):</strong>
                          <ul className="mt-2 space-y-1">
                            {synastryAspects.map((s, idx) => (
                              <li key={`syn-${idx}`} className="text-[13px]">{s.p1Key} — {s.p2Key} · {s.kind} · orbe {s.orb.toFixed(2)}°</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-gray-600">No se encontraron aspectos relacionales dentro de los orbes.</div>
                      )}
                    </div>
                  ) : hasChart && synastryEnabled ? (
                    <div className="mb-3 p-3 bg-white border rounded">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Doble Rueda — Comparación simbólica</div>
                          <div className="text-xs text-gray-600">Interior: carta base · Exterior: carta comparada (lectura simbólica)</div>
                        </div>
                        <div className="text-xs text-gray-500">Sin cálculo · Solo visual</div>
                      </div>
                      <div className="mt-2 text-[12px] text-gray-500">{comparisonWheel.label}</div>
                    </div>
                  ) : (
                    (hasChart && natal ? (
                      // Normalize natal payload into wheel data
                      (() => {
                        const wheel = normalizeNatalForWheel(natal as any);
                        const housesOk = Array.isArray(wheel.houses) && wheel.houses.length === 12;
                        const planetsOk = Array.isArray(wheel.planets) && wheel.planets.length > 0;

                        if (!hasIdentity) {
                          return <div className="p-6 text-center text-sm text-gray-600">Identidad no disponible — no se puede renderizar la rueda hasta que la identidad canónica tenga fecha de nacimiento válida.</div>;
                        }

                        if (!housesOk || !planetsOk || wheel.ascendantDeg === null) {
                          // If normalization failed, keep legacy simple renderer as a fallback to avoid breaking visuals
                          return <NatalChartSVGPro chart={natal} maxHeight={560} />;
                        }

                        return (
                          <div>
                            {secondaryLayer && secondaryLayerLabel ? (
                              <div className="mb-2 text-xs text-gray-700">
                                <span className="inline-block bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded">
                                  Modo Doble Rueda activo · Natal + {secondaryLayerLabel}
                                </span>
                              </div>
                            ) : null}
                            {showCrossAspects && secondaryLayer && secondaryLayerLabel ? (
                              <div className="mb-3 bg-white border border-gray-200 rounded p-3 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold">Aspectos cruzados (simbólicos)</div>
                                    <div className="text-[12px] text-gray-500">
                                      {solarReturnYearComparison ? 'Modo: comparación anual (A/B) · aproximación simbólica' : (crossAspects.mode === 'symbolic-only' ? 'Modo: aproximación simbólica (sin grados)' : 'Modo: basado en geometría disponible')}
                                    </div>
                                  </div>
                                  <div className="text-[12px] text-gray-500" title="Esto representa ejes simbólicos de tensión/integración. No predice eventos.">
                                    Lectura no predictiva
                                  </div>
                                </div>
                                {solarReturnYearComparison ? (
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded border border-gray-200 bg-gray-50 p-2">
                                      <div className="text-[12px] font-semibold text-gray-900">{solarReturnYearComparison.labelA}</div>
                                      <div className="mt-1 text-[11px] text-gray-600">{solarReturnYearComparison.textByYear.A}</div>
                                      <ul className="mt-2 space-y-1">
                                        {solarReturnYearComparison.hitsA.slice(0, 10).map((h) => (
                                          <li key={h.id} className="text-[12px] text-gray-700" title="Esto representa un eje de tensión/integración simbólica. No predice eventos.">
                                            Natal: {h.natalGlyph} ↔ {solarReturnYearComparison.kindLabel[h.kind]} · Activación simbólica
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-2">
                                      <div className="text-[12px] font-semibold text-gray-900">{solarReturnYearComparison.labelB}</div>
                                      <div className="mt-1 text-[11px] text-gray-600">{solarReturnYearComparison.textByYear.B}</div>
                                      <ul className="mt-2 space-y-1">
                                        {solarReturnYearComparison.hitsB.slice(0, 10).map((h) => (
                                          <li key={h.id} className="text-[12px] text-gray-700" title="Esto representa un eje de tensión/integración simbólica. No predice eventos.">
                                            Natal: {h.natalGlyph} ↔ {solarReturnYearComparison.kindLabel[h.kind]} · Activación simbólica
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                ) : crossAspects.hits.length > 0 ? (
                                  <ul className="mt-2 space-y-1">
                                    {crossAspects.hits.slice(0, 15).map((h) => (
                                      <li
                                        key={h.id}
                                        className="text-[13px] text-gray-700"
                                        title="Esto representa un eje de tensión/integración simbólica. No predice eventos."
                                      >
                                        Natal: {h.natalGlyph} ↔ Capa: {h.secondaryGlyph ? `${h.secondaryGlyph} ` : ''}{h.layerLabel} — {crossAspects.kindLabel[h.kind]} · Activación simbólica
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="mt-2 text-[12px] text-gray-600">No hay hits simbólicos disponibles para la capa activa.</div>
                                )}
                              </div>
                            ) : null}
                            <AstroWheelAdvanced
                              size={920}
                              ascendantDeg={wheel.ascendantDeg}
                              houses={wheel.houses}
                              planets={wheel.planets}
                              asteroids={showAsteroids ? (wheel.asteroids ?? []) : []}
                              showAspects={true}
                              orbDeg={orb}
                              visualStyle={visualStyle}
                              temporalLayers={temporalLayers}
                              annualLayers={annualLayers}
                              symbolicDoubleWheel={symbolicDoubleWheel}
                              secondaryLayer={effectiveSecondaryLayer && effectiveSecondaryLayerLabel ? { key: effectiveSecondaryLayer, label: effectiveSecondaryLayerLabel, mode: 'symbolic' } : null}
                              secondaryPlanets={secondaryPlanets ?? undefined}
                              crossAspectNatalKeys={crossAspectNatalKeysToPass}
                              crossAspectSecondaryKeys={showCrossAspects ? crossAspects.secondaryKeys : undefined}
                              comparisonWheel={comparisonWheel}
                              showComparisonAspects={false}
                              symbolicPlanetaryLayer={activeLayers.has('planetary')}
                              harmonicOrder={harmonicOrder}
                              personaMode={personaMode}
                              relocation={relocationParams ? { city: relocationParams.label, offsetDeg: relocationParams.offsetDeg, mode: relocationParams.mode, rotationDeg: relocationParams.rotationDeg } : undefined}
                              showMathPoints={activeLayers.has('mathPoints')}
                              advancedObjects={advancedObjects}
                              fixedStars={fixedStars}
                              relationshipMode={relationshipMode}
                              relationshipRole={relationshipRole}
                              developmentStage={developmentStage}
                              titleRight={`${meta.sistema_casas || 'placidus'} · ${meta.zodiac_type || 'tropical'}`}
                              transitPlanets={transitsSnapshot && transitBaseType === 'natal' ? transitsSnapshot.planets : undefined}
                            />
                          </div>
                        );
                      })()
                    ) : (
                      !hasIdentity ? (
                        <div className="p-6 text-center text-sm text-gray-600">
                          Identidad no disponible — no se puede renderizar la rueda hasta que la identidad canónica tenga fecha de nacimiento válida.
                        </div>
                      ) : (
                        <AstroWheelAdvanced
                          size={920}
                          ascendantDeg={0}
                          houses={Array.from({ length: 12 }, (_, i) => i * 30)}
                          planets={[]}
                          asteroids={[]}
                          showAspects={false}
                          orbDeg={orb}
                          visualMode="placeholder"
                          visualStyle={visualStyle}
                          temporalLayers={temporalLayers}
                          annualLayers={annualLayers}
                          symbolicDoubleWheel={symbolicDoubleWheel}
                          secondaryLayer={secondaryLayer && secondaryLayerLabel ? { key: secondaryLayer, label: secondaryLayerLabel, mode: 'symbolic' } : null}
                          crossAspectNatalKeys={showCrossAspects ? crossAspects.natalKeys : undefined}
                          crossAspectSecondaryKeys={showCrossAspects ? crossAspects.secondaryKeys : undefined}
                          comparisonWheel={comparisonWheel}
                          showComparisonAspects={false}
                          symbolicPlanetaryLayer={activeLayers.has('planetary')}
                          harmonicOrder={harmonicOrder}
                          personaMode={personaMode}
                          relocation={relocationParams ? { city: relocationParams.label, offsetDeg: relocationParams.offsetDeg, mode: relocationParams.mode, rotationDeg: relocationParams.rotationDeg } : undefined}
                          showMathPoints={activeLayers.has('mathPoints')}
                          advancedObjects={advancedObjects}
                          fixedStars={fixedStars}
                          relationshipMode={relationshipMode}
                          relationshipRole={relationshipRole}
                          developmentStage={developmentStage}
                          titleRight="Pendiente · solo lectura"
                        />
                      )
                    ))
                  )}
                </>
              ) : (
                // Advanced psychological panel uses deterministic psychEngine
                (hasChart && natal ? (
                  <PsychologicalHoroscopeAdvanced 
                    advanced={buildAdvancedInputFromPayload(natal)!} 
                    patientId={consultante?.id}
                  />
                ) : (
                  <div className="p-6 text-center text-sm text-gray-600">
                    Datos psicológicos pendientes — completa los datos de nacimiento para generar la lectura.
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Datos Reales: Posiciones, Aspectos y Casas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tabla de Posiciones Planetarias */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Posiciones Planetarias</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium">Planeta</th>
                      <th className="text-left p-2 font-medium">Signo</th>
                      <th className="text-right p-2 font-medium">Grados</th>
                      <th className="text-center p-2 font-medium">Casa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!hasChart ? (
                      <tr className="border-t border-gray-100">
                        <td colSpan={4} className="p-3 text-center text-gray-600">
                          Carta pendiente — posiciones planetarias no disponibles.
                        </td>
                      </tr>
                    ) : null}
                    {(natal?.planetas || []).map((p, idx) => (
                      <tr key={`planet-row-${idx}`} className="border-t border-gray-100">
                        <td className="p-2 font-medium">{String(p.nombre)}</td>
                        <td className="p-2">{p.signo}</td>
                        <td className="p-2 text-right">{p.grados?.toFixed(2)}°</td>
                        <td className="p-2 text-center">{p.casa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista de Aspectos */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Aspectos (orbe ≤ {orb.toFixed(1)}°)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {!hasChart ? (
                  <div className="p-3 text-center text-sm text-gray-600">Carta pendiente — aspectos no disponibles.</div>
                ) : aspectosFiltered.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-600">No hay aspectos dentro del orbe configurado.</div>
                ) : null}
                {hasChart && aspectosFiltered.map((a, idx) => (
                  <div key={`aspect-row-${idx}`} className="text-xs border-b border-gray-100 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.planeta1} — {a.planeta2}</span>
                      <span className="text-gray-600">{a.tipo}</span>
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      Orbe: {Math.abs(a.orbe || 0).toFixed(2)}° {a.es_aplicativo ? '(aplicativo)' : '(separativo)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Casas Astrológicas */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3">Casas Astrológicas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 font-medium">Casa</th>
                    <th className="text-left p-2 font-medium">Signo</th>
                    <th className="text-right p-2 font-medium">Grado cúspide</th>
                    <th className="text-left p-2 font-medium">Regente</th>
                    <th className="text-left p-2 font-medium">Sefirá</th>
                    <th className="text-left p-2 font-medium">Nombre hebreo</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasChart ? (
                    <tr className="border-t border-gray-100">
                      <td colSpan={6} className="p-3 text-center text-gray-600">
                        Carta pendiente — casas astrológicas no disponibles.
                      </td>
                    </tr>
                  ) : null}
                  {(natal?.casas || []).map((c: any, idx: number) => {
                    const houseNumber = c.numero ?? (idx + 1);
                    // Try to read mapping from cabalistic data if present
                    const cab = (natal?.cabalistic_data && (natal?.cabalistic_data as any).houses && (natal?.cabalistic_data as any).houses[String(houseNumber)]) || null;
                    // Fallback mapping (stable, non-interpretative)
                    const fallbackMap: Record<number, { sefira: string; hebrew: string }> = {
                      1: { sefira: 'Keter', hebrew: 'כתר' },
                      2: { sefira: 'Chokmah', hebrew: 'חכמה' },
                      3: { sefira: 'Binah', hebrew: 'בינה' },
                      4: { sefira: 'Chesed', hebrew: 'חסד' },
                      5: { sefira: 'Gevurah', hebrew: 'גבורה' },
                      6: { sefira: 'Tiferet', hebrew: 'תפארת' },
                      7: { sefira: 'Netzach', hebrew: 'נצח' },
                      8: { sefira: 'Hod', hebrew: 'הוד' },
                      9: { sefira: 'Yesod', hebrew: 'יסוד' },
                      10: { sefira: 'Malkuth', hebrew: 'מלכות' },
                      11: { sefira: 'Daath', hebrew: 'דעת' },
                      12: { sefira: 'Binah II', hebrew: 'בינה' },
                    };

                    const mapEntry = cab ? { sefira: cab.sefira_name || cab.sefira || fallbackMap[houseNumber]?.sefira, hebrew: cab.sefira_name || fallbackMap[houseNumber]?.hebrew } : fallbackMap[houseNumber] || { sefira: '-', hebrew: '-' };

                    const sign = c.signo || '-';
                    const cusp = typeof c.cuspide_grados === 'number' ? c.cuspide_grados.toFixed(2) : (c.cuspide_grados || '-');
                    const ruler = c.ruler || (c.regente || '-');

                    return (
                      <tr key={`house-row-${houseNumber}`} className="border-t border-gray-100">
                        <td className="p-2 font-medium">{houseNumber}</td>
                        <td className="p-2">{sign}</td>
                        <td className="p-2 text-right">{cusp}°</td>
                        <td className="p-2">{ruler}</td>
                        <td className="p-2">{mapEntry.sefira}</td>
                        <td className="p-2" dir="rtl">{mapEntry.hebrew}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controles Visuales (Compactos) */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3">Controles de Visualización</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Orbe */}
              <div>
                <label className="block text-xs font-medium mb-2">Orbe Máximo</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={10} step={0.5} value={orb} onChange={(e) => setOrb(Number(e.target.value))} className="flex-1" />
                  <span className="text-xs text-gray-800 w-10 text-right">{orb.toFixed(1)}°</span>
                </div>
              </div>

              {/* Planetas Visibles */}
              <div>
                <label className="block text-xs font-medium mb-2">Planetas Visibles</label>
                <div className="text-xs text-gray-600">
                  {(natal?.planetas || []).filter((p) => (visiblePlanets[String(p.nombre).toLowerCase().trim()] ?? true)).length} de {(natal?.planetas || []).length}
                </div>
              </div>

              {/* Aspectos Visibles */}
              <div>
                <label className="block text-xs font-medium mb-2">Aspectos Visibles</label>
                <div className="text-xs text-gray-600">
                  {aspectosFiltered.length} de {(natal?.aspectos || []).length}
                </div>
              </div>
            </div>
          </div>

          {/* Auditoría Técnica (Compacta) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><strong>Fuente:</strong> {meta.fuente || 'Swiss Ephemeris'}</div>
              <div><strong>Casas:</strong> {meta.sistema_casas || '-'}</div>
              <div><strong>Zodíaco:</strong> {meta.zodiac_type || '-'}</div>
              <div><strong>Calculada:</strong> {meta.calculated_at ? new Date(meta.calculated_at).toLocaleDateString('es-ES') : '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para datos de Persona 2 (Carta Compuesta) */}
      {showPerson2Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => { setShowPerson2Modal(false); setCompositeEnabled(false); }} />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-lg">
            <h3 className="text-lg font-semibold">Datos de la Segunda Persona</h3>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa los datos de nacimiento de la segunda persona para calcular la Carta Compuesta (puntos medios entre ambas cartas natales).
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-600 font-medium">Nombre</label>
                <input
                  type="text"
                  value={person2Data.name}
                  onChange={(e) => setPerson2Data(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  placeholder="Nombre de la persona"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 font-medium">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={person2Data.birth_date}
                    onChange={(e) => setPerson2Data(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-medium">Hora de nacimiento</label>
                  <input
                    type="time"
                    value={person2Data.birth_time}
                    onChange={(e) => setPerson2Data(prev => ({ ...prev, birth_time: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 font-medium">Latitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={person2Data.latitude || ''}
                    onChange={(e) => setPerson2Data(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    placeholder="ej: 40.4168"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-medium">Longitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={person2Data.longitude || ''}
                    onChange={(e) => setPerson2Data(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    placeholder="ej: -3.7038"
                  />
                </div>
              </div>

              {compositeError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {compositeError}
                </div>
              )}
              {davisonError && !compositeError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {davisonError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border text-sm"
                onClick={() => { setShowPerson2Modal(false); setCompositeEnabled(false); setDavisonEnabled(false); }}
              >
                Cancelar
              </button>
              {compositeEnabled && (
                <button
                  className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
                  onClick={fetchCompositeChart}
                  disabled={compositeLoading || !person2Data.birth_date || !person2Data.latitude || !person2Data.longitude}
                >
                  {compositeLoading ? 'Calculando...' : 'Calcular Carta Compuesta'}
                </button>
              )}
              {davisonEnabled && (
                <button
                  className="px-4 py-2 rounded bg-teal-600 text-white text-sm disabled:opacity-50"
                  onClick={fetchDavisonChart}
                  disabled={davisonLoading || !person2Data.birth_date || !person2Data.latitude || !person2Data.longitude}
                >
                  {davisonLoading ? 'Calculando...' : 'Calcular Carta Davison'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel de Carta Compuesta (si está habilitada y hay datos) */}
      {compositeEnabled && compositeData && (
        <div className="fixed bottom-4 right-4 z-40 bg-white border border-indigo-200 rounded-lg shadow-lg p-4 w-96 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-indigo-900">Carta Compuesta</h4>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => { setCompositeEnabled(false); setCompositeData(null); }}
            >
              ✕
            </button>
          </div>

          <div className="text-xs space-y-2">
            <div className="bg-indigo-50 rounded p-2">
              <div><strong>{compositeData.person1.name}</strong> + <strong>{compositeData.person2.name}</strong></div>
              <div className="text-gray-600 mt-1">
                Punto medio calculado: {compositeData.composite_datetime ? new Date(compositeData.composite_datetime).toLocaleDateString('es-ES') : '-'}
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="font-medium mb-1">Planetas Compuestos:</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(compositeData.planets || {}).map(([planet, data]: [string, any]) => (
                  <div key={planet} className="flex justify-between">
                    <span className="capitalize">{planet}:</span>
                    <span className="text-gray-700">{data.sign} {data.sign_degree?.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="font-medium mb-1">Ángulos:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>ASC: {compositeData.angles?.asc?.toFixed(2)}°</div>
                <div>MC: {compositeData.angles?.mc?.toFixed(2)}°</div>
                <div>DSC: {compositeData.angles?.dsc?.toFixed(2)}°</div>
                <div>IC: {compositeData.angles?.ic?.toFixed(2)}°</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Carta Davison (si está habilitada y hay datos) */}
      {davisonEnabled && davisonData && (
        <div className="fixed bottom-4 left-4 z-40 bg-white border border-teal-200 rounded-lg shadow-lg p-4 w-96 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-teal-900">Carta Davison</h4>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => { setDavisonEnabled(false); setDavisonData(null); }}
            >
              ✕
            </button>
          </div>

          <div className="text-xs space-y-2">
            <div className="bg-teal-50 border border-teal-200 rounded p-2">
              <div className="text-teal-900 font-medium">Momento medio</div>
              <div className="text-teal-700 mt-1">
                {davisonData.davison_datetime ? new Date(davisonData.davison_datetime).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded p-2">
              <div className="text-teal-900 font-medium">Lugar medio</div>
              <div className="text-teal-700 mt-1">
                Lat: {davisonData.davison_location?.latitude?.toFixed(4)}° ·
                Lon: {davisonData.davison_location?.longitude?.toFixed(4)}°
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="font-medium mb-1">Planetas Davison:</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(davisonData.planets || {}).map(([planet, data]: [string, any]) => (
                  <div key={planet} className="flex justify-between">
                    <span className="capitalize">{planet}:</span>
                    <span className="text-gray-700">{data.sign} {data.sign_degree?.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="font-medium mb-1">Ángulos:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>ASC: {davisonData.ascendant?.toFixed(2)}°</div>
                <div>MC: {davisonData.midheaven?.toFixed(2)}°</div>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-teal-600 bg-teal-100 rounded p-2">
              ℹ️ La Carta Davison representa la relación como una entidad única,
              calculada para el momento y lugar medio entre ambas personas.
              Diferente de la Compuesta que usa puntos medios de planetas individuales.
            </div>
          </div>
        </div>
      )}

      {/* Loading state for Davison */}
      {davisonEnabled && davisonLoading && (
        <div className="fixed bottom-4 left-4 z-40 bg-white border border-teal-200 rounded-lg shadow-lg p-4 w-96">
          <div className="flex items-center gap-2 text-teal-700">
            <span className="animate-spin">⏳</span>
            <span>Calculando Carta Davison...</span>
          </div>
        </div>
      )}

      {/* Error state for Davison */}
      {davisonEnabled && davisonError && !davisonLoading && (
        <div className="fixed bottom-4 left-4 z-40 bg-white border border-red-200 rounded-lg shadow-lg p-4 w-96">
          <div className="text-red-700 text-sm">{davisonError}</div>
          <button
            className="mt-2 text-xs text-teal-600 underline"
            onClick={() => setShowPerson2Modal(true)}
          >
            Configurar datos de Persona 2
          </button>
        </div>
      )}
    </div>
  );
}
