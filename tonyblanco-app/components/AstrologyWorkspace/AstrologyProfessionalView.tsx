"use client";

import React, { useEffect, useMemo, useState } from 'react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';
import NatalChartSVGPro from './chart/NatalChartSVGAdvanced';
import { buildAdvancedInputFromPayload } from './chart/chartLayoutEngine';
import PsychologicalHoroscopeAdvanced from './psychological/PsychologicalHoroscopeAdvanced';
import AstrologyDoubleWheelSVG from './AstrologyDoubleWheelSVG';
import AstroDoubleWheelAdvanced from '@/components/astrology/AstroDoubleWheelAdvanced';
import AstrologySidebar from './AstrologySidebar';
import { getTherapistPatients } from '@/lib/patient-api';
import { computeSynastryAspects } from '@/components/astrology/astro-geometry';
//import { computeCompositeFromTwoNatal } from '@/components/astrology/composite';
import { getAuthToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';
import AstroWheelAdvanced from '@/components/astrology/AstroWheelAdvanced';
import { normalizeNatalForWheel } from '@/components/astrology/normalizer';
import CalculationStatusPanel from './CalculationStatusPanel';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  consultante: ActiveConsultante;
  chart: NatalChartPayload | null;
  analysis_result?: MultiTechAnalysisResult | null;
  calculateChart?: (houseSystem?: string, zodiacType?: string) => Promise<void> | undefined;
  refetch?: () => Promise<void>;
}

export default function AstrologyProfessionalView({ consultante, chart, analysis_result, calculateChart, refetch }: Props) {
  // Audit log (controlled, local-only): helps verify incoming data shapes
  if (typeof window !== 'undefined') {
    // Keep log minimal and non-sensitive
    // eslint-disable-next-line no-console
    console.debug('AstrologyProfessionalView - analysis_result', { hasAnalysis: Boolean(analysis_result), layers: {
      natal: Boolean(analysis_result?.natal || chart),
      transits: Boolean(analysis_result?.transits),
      solarReturn: Boolean(analysis_result?.solarReturn),
      progressions: Boolean(analysis_result?.progressions),
    }});
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

  // When the user changes house system or zodiac type, trigger real recalculation via provided hook
  React.useEffect(() => {
    const fn = calculateChart;
    if (!hasChart || !consultante?.id || !fn) return;
    // Debounce-like behavior: call recalculation immediately on change
    Promise.resolve(fn(houseSystem, zodiacType)).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Error recalculating chart:', e);
    });
  }, [hasChart, houseSystem, zodiacType, consultante?.id, calculateChart]);

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
  const [davisonError, setDavisonError] = useState<string | null>(null);

  // Advanced Transits (A16.3)
  const [showAdvancedTransits, setShowAdvancedTransits] = useState<boolean>(false);
  const [transitBaseType, setTransitBaseType] = useState<'natal' | 'composite_chart' | 'davison_chart'>('natal');
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

  const togglePlanet = (key: string) => setVisiblePlanets((p) => ({ ...p, [key]: !p[key] }));
  const toggleAspect = (key: string) => setVisibleAspects((a) => ({ ...a, [key]: !a[key] }));

  // Controlled active layers set (natal always available if present)
  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (overlays.natal) s.add('natal');
    if (overlays.transits) s.add('transits');
    if (overlays.solarReturn) s.add('solarReturn');
    if (overlays.progressions) s.add('progressions');
    return s;
  });
  const [symbolicDoubleWheel, setSymbolicDoubleWheel] = useState<boolean>(false);
  const [symbolicSolarReturnYear, setSymbolicSolarReturnYear] = useState<number | null>(null);
  const [symbolicLunarReturnDate, setSymbolicLunarReturnDate] = useState<string | null>(null);
  const [showCrossAspects, setShowCrossAspects] = useState<boolean>(false);
  const [harmonicOrder, setHarmonicOrder] = useState<5 | 7 | 9>(5);
  const [relocationCity, setRelocationCity] = useState<string>('Madrid (placeholder)');
  const [solarReturnCompareEnabled, setSolarReturnCompareEnabled] = useState<boolean>(false);
  const [solarReturnCompareYearB, setSolarReturnCompareYearB] = useState<number | null>(null);

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

  // Layer inputs
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [progressionDate, setProgressionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [solarYear, setSolarYear] = useState<number>(new Date().getFullYear());
  const [solarArcDate, setSolarArcDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const apiURL = getApiBaseUrl();

  // Calculation sessions (frontend-only) for preview/comparison
  type CalculationSession = {
    id: string;
    base_snapshot_id: string | null;
    method: { houses: string; zodiac: string; ayanamsha?: string | null };
    mode: 'preview' | 'applied';
    created_at: string;
    chartPayload?: any; // returned payload from POST (not applied to base)
  };

  const [sessions, setSessions] = useState<CalculationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [showRecalcModal, setShowRecalcModal] = useState(false);
  const [recalcMethod, setRecalcMethod] = useState<{ houses: string; zodiac: string }>({ houses: houseSystem, zodiac: zodiacType });

  // simple frontend audit log
  const pushLog = (entry: Record<string, any>) => {
    // keep log in console for now
    // In future could push to an internal UI list
    // eslint-disable-next-line no-console
    console.info('ASTRO_LOG', entry);
  };

  // Export helper for comparative views (A18)
  const exportComparativeAsPDF = async (elementId: string, filename = 'comparativa.pdf') => {
    try {
      const el = document.getElementById(elementId);
      if (!el) throw new Error('Elemento no encontrado para exportar');
      const canvas = await html2canvas(el, { useCORS: true, backgroundColor: '#ffffff', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      // Small permitted holistic notice at top
      pdf.setFontSize(10);
      pdf.text('Observación holística — Propósito profesional', 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 14, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      // Minimal user feedback
      // eslint-disable-next-line no-alert
      alert('Error exportando comparativa: ' + (err?.message || err));
    }
  };

  // open modal via global event from sidebar button
  React.useEffect(() => {
    const handler = () => {
      if (!hasChart) return;
      setShowRecalcModal(true);
    };
    window.addEventListener('open-recalc-modal', handler as EventListener);
    return () => window.removeEventListener('open-recalc-modal', handler as EventListener);
  }, [hasChart]);

  // Listen for sidebar event to open Advanced Transits panel
  React.useEffect(() => {
    const h = () => {
      if (!hasChart) return;
      setShowAdvancedTransits(true);
    };
    window.addEventListener('open-advanced-transits', h as EventListener);
    return () => window.removeEventListener('open-advanced-transits', h as EventListener);
  }, [hasChart]);

  // Listen for events to open A17 panels
  React.useEffect(() => {
    const p = () => {
      if (!hasChart) return;
      setShowSecondaryProgressions(true);
    };
    const s = () => {
      if (!hasChart) return;
      setShowSolarReturn(true);
    };
    window.addEventListener('open-secondary-progressions', p as EventListener);
    window.addEventListener('open-solar-return', s as EventListener);
    // A18 events
    const cs = () => {
      if (!hasChart) return;
      setShowCompareSolarReturn(true);
    };
    const cp = () => {
      if (!hasChart) return;
      setShowCompareProgressions(true);
    };
    window.addEventListener('open-compare-natal-solar-return', cs as EventListener);
    window.addEventListener('open-compare-natal-progressions', cp as EventListener);
    return () => {
      window.removeEventListener('open-secondary-progressions', p as EventListener);
      window.removeEventListener('open-solar-return', s as EventListener);
      window.removeEventListener('open-compare-natal-solar-return', cs as EventListener);
      window.removeEventListener('open-compare-natal-progressions', cp as EventListener);
    };
  }, [hasChart]);

  const performRecalculation = async (housesCode: string, zodiacCode: string) => {
    if (!hasChart || !consultante?.id) return null;
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth');

      const body: any = { house_system: housesCode, zodiac_type: zodiacCode };
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

      const session: CalculationSession = {
        id: `sess-${Date.now()}`,
        base_snapshot_id: (natal?.metadatos && natal?.metadatos.input_snapshot && natal?.metadatos.input_snapshot.id) ? String(natal?.metadatos?.input_snapshot?.id) : null,
        method: { houses: housesCode, zodiac: zodiacCode },
        mode: 'preview',
        created_at: new Date().toISOString(),
        chartPayload: data.chart || data.chart_payload || data,
      };

      setSessions((s) => [session, ...s]);
      setActiveSessionId(session.id);
      setCompareMode(true);

      pushLog({ type: 'astrology_recalculation', consultante_id: consultante.id, method: session.method, timestamp: session.created_at, mode: session.mode });

      return session;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Recalc failed', e);
      return null;
    }
  };

  const calculateLayer = async (layer: 'transits' | 'progressions' | 'solarReturn') => {
    if (!hasChart || !consultante?.id) return;
    try {
      const body: any = { layer };
      if (layer === 'transits') body.reference_date = transitDate;
      if (layer === 'progressions') { body.reference_date = progressionDate; body.method = 'secondary'; }
      if (layer === 'solarReturn') { body.year = solarYear; body.method = 'solar_return'; }

      const token = getAuthToken();
      if (!token) {
        console.error('calculateLayer: no auth token available');
        throw new Error('Authentication credentials were not provided.');
      }

      const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const err = await resp.text().catch(() => 'error');
        throw new Error(String(err));
      }
      if (refetch) await refetch();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error calculating layer:', e);
      // fallback: attempt a generic calculateChart refresh
      if (calculateChart) await calculateChart();
    }
  };

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

  const renderLayerStateBadge = (state: 'pendiente' | 'no_calculado' | 'solo_lectura') => {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border';
    if (state === 'pendiente') return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>pendiente</span>;
    if (state === 'no_calculado') return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>no calculado</span>;
    return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>solo lectura</span>;
  };

  const temporalLayers = useMemo(() => {
    const layers: Array<{ key: 'transits' | 'progressions' | 'solarArc'; label?: string }> = [];
    if (activeLayers.has('transits')) layers.push({ key: 'transits', label: `Tránsitos · ${transitDate}` });
    if (activeLayers.has('progressions')) layers.push({ key: 'progressions', label: `Progresiones · ${progressionDate}` });
    if (activeLayers.has('solarArc')) layers.push({ key: 'solarArc', label: `Arco Solar · ${solarArcDate}` });
    return layers;
  }, [activeLayers, transitDate, progressionDate, solarArcDate]);

  const annualLayers = useMemo(() => {
    const layers: Array<{ key: 'solarReturn' | 'solarReturnA' | 'solarReturnB' | 'lunarReturn'; label?: string }> = [];
    if (symbolicSolarReturnYear !== null) {
      if (solarReturnCompareEnabled && solarReturnCompareYearB !== null) {
        layers.push({ key: 'solarReturnA', label: `Retorno Solar (A) · ${symbolicSolarReturnYear}` });
        layers.push({ key: 'solarReturnB', label: `Retorno Solar (B) · ${solarReturnCompareYearB}` });
      } else {
        layers.push({ key: 'solarReturn', label: `Retorno Solar · ${symbolicSolarReturnYear}` });
      }
    }
    if (symbolicLunarReturnDate) layers.push({ key: 'lunarReturn', label: `Retorno Lunar · ${symbolicLunarReturnDate}` });
    return layers;
  }, [symbolicSolarReturnYear, solarReturnCompareEnabled, solarReturnCompareYearB, symbolicLunarReturnDate]);

  useEffect(() => {
    if (!solarReturnCompareEnabled) {
      setSolarReturnCompareYearB(null);
      return;
    }
    if (symbolicSolarReturnYear === null) return;
    setSolarReturnCompareYearB((prev) => (prev === null ? symbolicSolarReturnYear - 1 : prev));
  }, [solarReturnCompareEnabled, symbolicSolarReturnYear]);

  const secondaryLayer = useMemo(() => {
    const order = ['transits', 'progressions', 'solarArc', 'return_solar', 'return_lunar'] as const;
    for (const key of order) {
      if (activeLayers.has(key)) return key;
    }
    return null;
  }, [activeLayers]);

  const secondaryLayerLabel = useMemo(() => {
    if (!secondaryLayer) return null;
    if (secondaryLayer === 'transits') return 'Tránsitos (lectura simbólica)';
    if (secondaryLayer === 'progressions') return 'Progresiones (lectura simbólica)';
    if (secondaryLayer === 'solarArc') return 'Arco Solar (lectura simbólica)';
    if (secondaryLayer === 'return_solar') return `Retorno Solar · ${symbolicSolarReturnYear ?? new Date().getFullYear()} (lectura simbólica)`;
    return `Retorno Lunar · ${(symbolicLunarReturnDate ?? new Date().toISOString().slice(0, 10)).slice(0, 7)} (lectura simbólica)`;
  }, [secondaryLayer, symbolicSolarReturnYear, symbolicLunarReturnDate]);

  const focusLabel = useMemo(() => {
    const parts: string[] = [];
    if (symbolicSolarReturnYear !== null) {
      if (solarReturnCompareEnabled && solarReturnCompareYearB !== null) parts.push(`Año A ${symbolicSolarReturnYear} · Año B ${solarReturnCompareYearB}`);
      else parts.push(`Año ${symbolicSolarReturnYear}`);
    }
    if (symbolicLunarReturnDate) {
      const [y, m] = symbolicLunarReturnDate.split('-');
      const monthIndex = Math.max(0, Math.min(11, (Number(m) || 1) - 1));
      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      parts.push(`Mes ${monthNames[monthIndex]} ${y || ''}`.trim());
    }
    if (parts.length === 0) return null;
    return `Enfoque temporal simbólico: ${parts.join(' · ')}`;
  }, [symbolicSolarReturnYear, solarReturnCompareEnabled, solarReturnCompareYearB, symbolicLunarReturnDate]);

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

  const relocationOffsetDeg = useMemo(() => {
    const s = relocationCity || '';
    let acc = 0;
    for (let i = 0; i < s.length; i++) acc = (acc + s.charCodeAt(i) * (i + 1)) % 360;
    // stable ±30° range, purely symbolic
    return ((acc % 61) - 30);
  }, [relocationCity]);

  // Bridge: year/date presence -> activeLayers (UI + engine)
  useEffect(() => {
    setActiveLayers((prev) => {
      const want = symbolicSolarReturnYear !== null;
      const has = prev.has('return_solar');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('return_solar');
      else next.delete('return_solar');
      pushLog({ event: 'LayerActivationEvent', layer: 'return_solar', mode: want ? 'symbolic' : 'off' });
      return next;
    });
  }, [symbolicSolarReturnYear]);

  useEffect(() => {
    setActiveLayers((prev) => {
      const want = Boolean(symbolicLunarReturnDate);
      const has = prev.has('return_lunar');
      if (want === has) return prev;
      const next = new Set(prev);
      if (want) next.add('return_lunar');
      else next.delete('return_lunar');
      pushLog({ event: 'LayerActivationEvent', layer: 'return_lunar', mode: want ? 'symbolic' : 'off' });
      return next;
    });
  }, [symbolicLunarReturnDate]);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar (left) */}
      <aside className="w-72 border-r border-gray-200 bg-white">
        <AstrologySidebar
          houseSystem={houseSystem}
          setHouseSystem={setHouseSystem}
          zodiacType={zodiacType}
          setZodiacType={setZodiacType}
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
          harmonicOrder={harmonicOrder}
          setHarmonicOrder={setHarmonicOrder}
          relocationCity={relocationCity}
          setRelocationCity={setRelocationCity}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Carta Natal — Astrología Profesional</h1>
            <p className="text-sm text-gray-600 mt-1">Swiss Ephemeris · Solo lectura</p>
          </header>

          {!hasChart ? (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900">Carta natal pendiente</div>
              <div className="mt-1 text-sm text-gray-600">
                Este consultante aún no tiene datos astrológicos calculados. Completa fecha, hora y lugar de nacimiento para generar la carta.
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
                    className={`px-3 py-1 rounded text-sm font-medium ${consultante?.id && calculateChart ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                    aria-label="Recalcular carta"
                    disabled={!consultante?.id || !calculateChart || !hasChart}
                    title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : undefined}
                  >
                    🔁 Recalcular carta
                  </button>
                </div>
              </div>
            </div>
            {/* Capas Profesionales: toggles + calculate buttons */}
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <h3 className="text-sm font-semibold mb-2">Capas Profesionales</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {/* Natal: locked on - show consultante snapshot details */}
                <div className="p-3 bg-white border rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">Natal</div>
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
                        const sun = (natal?.planetas || []).find((p:any) => String(p.nombre).toLowerCase() === 'sun' || String(p.nombre).toLowerCase() === 'sol');
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
                <div className="p-2 bg-white border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Tránsitos</div>
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
                        disabled={!hasIdentity}
                        title={!hasIdentity ? 'Requiere identidad válida (fecha de nacimiento)' : 'Capa temporal simbólica que muestra activaciones externas en relación a la carta base. No predice eventos.'}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Fecha de referencia</label>
                    <input type="date" value={transitDate} onChange={(e) => setTransitDate(e.target.value)} className="mt-1 w-full" disabled={!hasIdentity} />
                    {!overlays.transits && (
                      <button
                        onClick={() => calculateLayer('transits')}
                        disabled={!hasChart}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : undefined}
                        className={`mt-2 px-3 py-1 text-xs rounded ${hasChart ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                      >
                        Calcular capa
                      </button>
                    )}
                  </div>
                </div>

                {/* Progresiones (secundarias) */}
                <div className="p-2 bg-white border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Progresiones (Secundarias)</div>
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
                        disabled={!hasIdentity}
                        title={!hasIdentity ? 'Requiere identidad válida (fecha de nacimiento)' : 'Representación simbólica del desarrollo interno a lo largo del tiempo. No predice eventos.'}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Fecha objetivo</label>
                    <input type="date" value={progressionDate} onChange={(e) => setProgressionDate(e.target.value)} className="mt-1 w-full" disabled={!hasIdentity} />
                    {!overlays.progressions && (
                      <button
                        onClick={() => calculateLayer('progressions')}
                        disabled={!hasChart}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : undefined}
                        className={`mt-2 px-3 py-1 text-xs rounded ${hasChart ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                      >
                        Calcular capa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {/* Retorno Solar */}
                <div className="p-2 bg-white border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Retorno Solar</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasChart ? renderLayerStateBadge('pendiente') : (overlays.solarReturn ? renderLayerStateBadge('solo_lectura') : renderLayerStateBadge('no_calculado'))}
                      </div>
                    </div>
                    <div>
                      <input type="checkbox" checked={activeLayers.has('solarReturn')} onChange={() => handleLayerToggle('solarReturn')} disabled={!hasChart} title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : undefined} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Año</label>
                    <input type="number" value={solarYear} onChange={(e) => setSolarYear(Number(e.target.value))} className="mt-1 w-full" />
                    {!overlays.solarReturn && (
                      <button
                        onClick={() => calculateLayer('solarReturn')}
                        disabled={!hasChart}
                        title={!hasChart ? 'Carta pendiente: completa datos de nacimiento para habilitar acciones' : undefined}
                        className={`mt-2 px-3 py-1 text-xs rounded ${hasChart ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                      >
                        Calcular capa
                      </button>
                    )}
                  </div>
                </div>

                {/* Arco Solar (lectura simbólica, sin predicción) */}
                <div className="p-2 bg-white border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Arco Solar</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Estado:</span>
                        {!hasIdentity ? renderLayerStateBadge('pendiente') : renderLayerStateBadge('solo_lectura')}
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={activeLayers.has('solarArc')}
                        onChange={() => handleLayerToggle('solarArc')}
                        disabled={!hasIdentity}
                        title={!hasIdentity ? 'Requiere identidad válida (fecha de nacimiento)' : 'Desplazamiento simbólico uniforme usado como referencia estructural. No predice eventos.'}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Fecha de referencia</label>
                    <input type="date" value={solarArcDate} onChange={(e) => setSolarArcDate(e.target.value)} className="mt-1 w-full" disabled={!hasIdentity} />
                  </div>
                </div>
              </div>
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

            {(symbolicSolarReturnYear !== null || symbolicLunarReturnDate) ? (
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
                      min={symbolicSolarReturnYear - 5}
                      max={symbolicSolarReturnYear + 5}
                      value={symbolicSolarReturnYear}
                      onChange={(e) => setSymbolicSolarReturnYear(Number(e.target.value))}
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                      <span>{symbolicSolarReturnYear - 5}</span>
                      <span>{symbolicSolarReturnYear}</span>
                      <span>{symbolicSolarReturnYear + 5}</span>
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
                          min={solarReturnCompareYearB - 5}
                          max={solarReturnCompareYearB + 5}
                          value={solarReturnCompareYearB}
                          onChange={(e) => setSolarReturnCompareYearB(Number(e.target.value))}
                        />
                        <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                          <span>{solarReturnCompareYearB - 5}</span>
                          <span>{solarReturnCompareYearB}</span>
                          <span>{solarReturnCompareYearB + 5}</span>
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
                      <div className="text-xs text-gray-600">{symbolicLunarReturnDate.slice(0, 7)}</div>
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
                      {['E','F','M','A','M','J','J','A','S','O','N','D'].map((m, idx) => (
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
                        {partnerList.map((p:any) => (
                          <option key={String(p.id)} value={String(p.id)}>{p.full_name || p.first_name || p.full_name}</option>
                        ))}
                      </select>
                    </div>
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
                      {solarReturnSnapshot ? <div className="mt-2 text-xs text-gray-600">Instante: {solarReturnSnapshot.return_datetime_exact}</div> : null}
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
                      <select value={transitBaseType} onChange={(e) => setTransitBaseType(e.target.value as any)} className="mt-1 rounded border px-2 py-1 text-sm">
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
                   overlays={overlays}
                   activeLayers={activeLayers}
                   symbolicLayers={{
                     natal: hasIdentity,
                     transits: activeLayers.has('transits'),
                     progressions: activeLayers.has('progressions'),
                     solarArc: activeLayers.has('solarArc'),
                     solarReturn: activeLayers.has('return_solar'),
                     lunarReturn: activeLayers.has('return_lunar'),
                     planetary: activeLayers.has('planetary'),
                     harmonics: activeLayers.has('harmonics'),
                     persona: activeLayers.has('persona'),
                     relocation: activeLayers.has('relocation'),
                     mathPoints: activeLayers.has('mathPoints'),
                   }}
                   secondaryLayerKey={secondaryLayer}
                   houseSystem={houseSystem}
                   zodiacType={zodiacType}
                   canRecalculate={Boolean(calculateChart)}
                 />
                     {/* Recalculation modal (confirmation) */}
                     {showRecalcModal ? (
                       <div className="fixed inset-0 z-50 flex items-center justify-center">
                         <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowRecalcModal(false)} />
                         <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-lg">
                           <h3 className="text-lg font-semibold">Recalcular carta astrológica</h3>
                           <p className="mt-3 text-sm text-gray-700">Estás a punto de recalcular la carta usando un método distinto.</p>
                           <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                             <li>✔ La carta natal original se conservará</li>
                             <li>✔ Se creará una nueva sesión de cálculo</li>
                             <li>✖ Esto no es reversible</li>
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
                               // Confirm and perform recalculation (preview session)
                               const sess = await performRecalculation(recalcMethod.houses, recalcMethod.zodiac);
                               setShowRecalcModal(false);
                               if (sess) {
                                 // show indicator handled by compareMode / sessions state
                               }
                             }}>✅ Recalcular</button>
                           </div>
                         </div>
                       </div>
                     ) : null}

                    

                     {/* Comparison controls */}
                     <div className="mb-3 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <label className="inline-flex items-center gap-2 text-sm">
                           <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />
                           <span className="text-sm">🔍 Comparar métodos</span>
                         </label>
                         {compareMode ? (
                           <div className="text-sm text-gray-600">{activeSessionId ? `Comparando con sesión ${activeSessionId}` : 'Seleccione una sesión para comparar'}</div>
                         ) : null}
                       </div>
                       {compareMode && sessions.length > 0 ? (
                         <div className="flex items-center gap-2">
                           <select value={activeSessionId ?? ''} onChange={(e) => setActiveSessionId(e.target.value || null)} className="rounded border px-2 py-1 text-sm">
                             <option value="">-- seleccionar sesión --</option>
                             {sessions.map(s => (
                               <option key={s.id} value={s.id}>{`${s.id} · ${s.method.houses} · ${s.method.zodiac}`}</option>
                             ))}
                           </select>
                           <button className="px-2 py-1 text-sm rounded border" onClick={() => { setCompareMode(false); setActiveSessionId(null); }}>❌ Cerrar comparación</button>
                         </div>
                       ) : null}
                     </div>
                  {hasChart && activeLayers.has('transits') && analysis_result?.transits ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.transits} overlayLabel="Tránsitos" orbDegrees={orb} consultante={consultante} />
                  ) : hasChart && activeLayers.has('progressions') && analysis_result?.progressions?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.progressions.chart} overlayLabel="Progresiones (Secundarias)" orbDegrees={orb} consultante={consultante} />
                  ) : hasChart && activeLayers.has('solarReturn') && analysis_result?.solarReturn?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal!} overlay={analysis_result.solarReturn.chart} overlayLabel="Retorno Solar" orbDegrees={orb} consultante={consultante} />
                  ) : hasChart && synastryEnabled && partnerChart ? (
                    <div>
                      {/* Hero info for sinastry */}
                      <div className="mb-3 p-3 bg-white border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">Sinastría — Doble Rueda</div>
                            <div className="text-xs text-gray-600">Consultante base: {consultante.nombre_completo}</div>
                            <div className="text-xs text-gray-600">Consultante comparado: {partnerList.find(p=>String(p.id)===String(selectedPartnerId))?.full_name || '-'}</div>
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

                        // If comparison mode with active session, render stacked wheels
                        if (compareMode && activeSessionId) {
                          const sess = sessions.find(x => x.id === activeSessionId);
                          const sessWheel = sess?.chartPayload ? normalizeNatalForWheel(sess.chartPayload) : null;
                          const baseWheel = wheel;
                          return (
                            <div className="relative w-full" style={{ height: 920 }}>
                              {/* compared (behind) */}
                              {sessWheel ? (
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
                                  <AstroWheelAdvanced size={920} ascendantDeg={sessWheel.ascendantDeg ?? baseWheel.ascendantDeg ?? 0} houses={sessWheel.houses} planets={sessWheel.planets} asteroids={sessWheel.asteroids ?? []} showAspects={false} orbDeg={orb} titleRight={`Comparada: ${sess?.method?.houses ?? ''} · ${sess?.method?.zodiac ?? ''}`} />
                                </div>
                              ) : null}
                              {/* base (front) */}
                              <div style={{ position: 'absolute', inset: 0 }}>
                                  <AstroWheelAdvanced
                                    size={920}
                                    ascendantDeg={baseWheel.ascendantDeg ?? 0}
                                    houses={baseWheel.houses}
                                    planets={baseWheel.planets}
                                    asteroids={baseWheel.asteroids ?? []}
                                    showAspects={true}
                                     orbDeg={orb}
                                     temporalLayers={temporalLayers}
                                     annualLayers={annualLayers}
                                     symbolicDoubleWheel={symbolicDoubleWheel}
                                    secondaryLayer={secondaryLayer && secondaryLayerLabel ? { key: secondaryLayer, label: secondaryLayerLabel, mode: 'symbolic' } : null}
                                    secondaryPlanets={secondaryPlanets ?? undefined}
                                    symbolicPlanetaryLayer={activeLayers.has('planetary')}
                                    harmonicOrder={activeLayers.has('harmonics') ? harmonicOrder : undefined}
                                    personaMode={activeLayers.has('persona')}
                                    relocation={activeLayers.has('relocation') ? { city: relocationCity, offsetDeg: relocationOffsetDeg } : undefined}
                                    showMathPoints={activeLayers.has('mathPoints')}
                                    titleRight={`${meta.sistema_casas || 'placidus'} · ${meta.zodiac_type || 'tropical'}`}
                                    transitPlanets={
                                      progressionsSnapshot ? progressionsSnapshot.planets : (transitsSnapshot && transitBaseType === 'natal' ? transitsSnapshot.planets : undefined)
                                    }
                                  />
                              </div>
                            </div>
                          );
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
                               temporalLayers={temporalLayers}
                               annualLayers={annualLayers}
                               symbolicDoubleWheel={symbolicDoubleWheel}
                               secondaryLayer={effectiveSecondaryLayer && effectiveSecondaryLayerLabel ? { key: effectiveSecondaryLayer, label: effectiveSecondaryLayerLabel, mode: 'symbolic' } : null}
                               secondaryPlanets={secondaryPlanets ?? undefined}
                               crossAspectNatalKeys={crossAspectNatalKeysToPass}
                               crossAspectSecondaryKeys={showCrossAspects ? crossAspects.secondaryKeys : undefined}
                               symbolicPlanetaryLayer={activeLayers.has('planetary')}
                               harmonicOrder={activeLayers.has('harmonics') ? harmonicOrder : undefined}
                               personaMode={activeLayers.has('persona')}
                               relocation={activeLayers.has('relocation') ? { city: relocationCity, offsetDeg: relocationOffsetDeg } : undefined}
                               showMathPoints={activeLayers.has('mathPoints')}
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
                           temporalLayers={temporalLayers}
                           annualLayers={annualLayers}
                           symbolicDoubleWheel={symbolicDoubleWheel}
                           secondaryLayer={secondaryLayer && secondaryLayerLabel ? { key: secondaryLayer, label: secondaryLayerLabel, mode: 'symbolic' } : null}
                           crossAspectNatalKeys={showCrossAspects ? crossAspects.natalKeys : undefined}
                           crossAspectSecondaryKeys={showCrossAspects ? crossAspects.secondaryKeys : undefined}
                           symbolicPlanetaryLayer={activeLayers.has('planetary')}
                           harmonicOrder={activeLayers.has('harmonics') ? harmonicOrder : undefined}
                           personaMode={activeLayers.has('persona')}
                           relocation={activeLayers.has('relocation') ? { city: relocationCity, offsetDeg: relocationOffsetDeg } : undefined}
                           showMathPoints={activeLayers.has('mathPoints')}
                           titleRight="Pendiente · solo lectura"
                        />
                      )
                    ))
                  )}
                </>
              ) : (
                  // Advanced psychological panel uses deterministic psychEngine
                  (hasChart && natal ? (
                    <PsychologicalHoroscopeAdvanced advanced={buildAdvancedInputFromPayload(natal)!} />
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
    </div>
  );
}
