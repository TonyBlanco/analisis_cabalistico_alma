"use client";

import React, { useMemo, useState } from 'react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';
import AstrologySymbolicReadingPanel from './AstrologySymbolicReadingPanel';
import NatalChartSVGPro from './chart/NatalChartSVGAdvanced';
import { buildAdvancedInputFromPayload } from './chart/chartLayoutEngine';
import PsychologicalHoroscopeAdvanced from './psychological/PsychologicalHoroscopeAdvanced';
import AstrologyDoubleWheelSVG from './AstrologyDoubleWheelSVG';
import AstroDoubleWheelAdvanced from '@/components/astrology/AstroDoubleWheelAdvanced';
import AstrologySidebar from './AstrologySidebar';
import { getTherapistPatients } from '@/lib/patient-api';
import { computeSynastryAspects } from '@/components/astrology/astro-geometry';
import { computeCompositeFromTwoNatal } from '@/components/astrology/composite';
import PsychologicalAnalysisPanel from './PsychologicalAnalysisPanel';
import { getAuthToken } from '@/lib/auth';
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
    if (!consultante?.id || !fn) return;
    // Debounce-like behavior: call recalculation immediately on change
    Promise.resolve(fn(houseSystem, zodiacType)).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Error recalculating chart:', e);
    });
  }, [houseSystem, zodiacType, consultante?.id, calculateChart]);

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

  const [activeTab, setActiveTab] = useState<'visual' | 'psych'>('visual');

  // Therapist-only UI state
  const isTherapist = Boolean((consultante as any)?.role === 'therapist' || (consultante as any)?.is_therapist);
  const [sharedSnapshotId, setSharedSnapshotId] = useState<string | null>(null);
  const [worksheetRefs, setWorksheetRefs] = useState<any[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [therapistNotes, setTherapistNotes] = useState<string>('');

  const handleLayerToggle = (layer: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      // natal is locked on
      if (layer === 'natal') return next;
      // Only one external layer active at a time
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        ['transits', 'progressions', 'solarReturn'].forEach((k) => next.delete(k));
        next.add(layer);
      }
      return next;
    });
  };

  // Layer inputs
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [progressionDate, setProgressionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [solarYear, setSolarYear] = useState<number>(new Date().getFullYear());

  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

  // Helper: format ISO date to dd/mm/yyyy for UI
  const fmtDate = (iso?: string | null) => {
    try {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('es-ES');
    } catch (e) { return iso || '-'; }
  };

  // Professional export: include ActionBar context (but strip interactive buttons)
  const exportProfessionalPDF = async (filename = `lectura_${consultante?.id || 'x'}.pdf`) => {
    try {
      const actionBar = document.querySelector('[data-professional-actionbar]') as HTMLElement | null;
      const chartArea = document.getElementById('professional-chart-area');
      if (!chartArea) throw new Error('Área de gráfico no encontrada');

      // Clone nodes to compose printable snapshot
      const container = document.createElement('div');
      container.style.width = '1200px';
      container.style.background = '#ffffff';
      container.style.padding = '12px';

      if (actionBar) {
        const abClone = actionBar.cloneNode(true) as HTMLElement;
        // remove interactive buttons
        abClone.querySelectorAll('button').forEach((b) => b.remove());
        container.appendChild(abClone);
      }

      const chartClone = chartArea.cloneNode(true) as HTMLElement;
      container.appendChild(chartClone);

      // Offscreen render target
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { useCORS: true, backgroundColor: '#ffffff', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Header: Title + Method + Comparative + Date
      pdf.setFontSize(14);
      pdf.text('Lectura Astrológica Holística', 10, 12);
      pdf.setFontSize(10);
      const methodText = activeLayers.has('solarReturn') ? 'Retorno Solar' : activeLayers.has('progressions') ? 'Progresiones (Secundarias)' : activeLayers.has('transits') ? 'Tránsitos' : 'Natal';
      const comparativaText = showCompareSolarReturn ? 'Natal ↔ Retorno Solar' : showCompareProgressions ? 'Natal ↔ Progresiones' : '-';
      const referenceIso = (showCompareSolarReturn && (solarReturnSnapshot?.return_datetime_exact || analysis_result?.solarReturn?.chart?.metadatos?.reference_date)) || (showCompareProgressions && (progressionsSnapshot?.progressed_datetime || analysis_result?.progressions?.chart?.metadatos?.reference_date)) || (activeLayers.has('transits') && (transitsSnapshot?.observed_datetime || analysis_result?.transits?.metadatos?.reference_date)) || meta.calculated_at || new Date().toISOString();
      pdf.text(`Método: ${methodText}`, 10, 20);
      pdf.text(`Comparativa: ${comparativaText}`, 10, 26);
      pdf.text(`Fecha de referencia: ${fmtDate(referenceIso)}`, 10, 32);
      pdf.setFontSize(9);
      pdf.text('Observación holística — Propósito profesional', 10, 38);

      pdf.addImage(imgData, 'PNG', 0, 42, pdfWidth, pdfHeight - 42);
      pdf.save(filename);

      // cleanup
      document.body.removeChild(container);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Export professional failed', err);
      alert('Error exportando PDF profesional: ' + (err?.message || err));
    }
  };

  // open modal via global event from sidebar button
  React.useEffect(() => {
    const handler = () => setShowRecalcModal(true);
    window.addEventListener('open-recalc-modal', handler as EventListener);
    return () => window.removeEventListener('open-recalc-modal', handler as EventListener);
  }, []);

  // Listen for sidebar event to open Advanced Transits panel
  React.useEffect(() => {
    const h = () => setShowAdvancedTransits(true);
    window.addEventListener('open-advanced-transits', h as EventListener);
    return () => window.removeEventListener('open-advanced-transits', h as EventListener);
  }, []);

  // Listen for events to open A17 panels
  React.useEffect(() => {
    const p = () => setShowSecondaryProgressions(true);
    const s = () => setShowSolarReturn(true);
    window.addEventListener('open-secondary-progressions', p as EventListener);
    window.addEventListener('open-solar-return', s as EventListener);
    // A18 events - only open compare panels if snapshots exist
    const cs = () => {
      if (solarReturnSnapshot || (analysis_result && analysis_result.solarReturn && analysis_result.solarReturn.chart)) setShowCompareSolarReturn(true);
    };
    const cp = () => {
      if (progressionsSnapshot || (analysis_result && analysis_result.progressions && analysis_result.progressions.chart)) setShowCompareProgressions(true);
    };
    window.addEventListener('open-compare-natal-solar-return', cs as EventListener);
    window.addEventListener('open-compare-natal-progressions', cp as EventListener);
    return () => {
      window.removeEventListener('open-secondary-progressions', p as EventListener);
      window.removeEventListener('open-solar-return', s as EventListener);
      window.removeEventListener('open-compare-natal-solar-return', cs as EventListener);
      window.removeEventListener('open-compare-natal-progressions', cp as EventListener);
    };
  }, []);

  const performRecalculation = async (housesCode: string, zodiacCode: string) => {
    if (!consultante?.id) return null;
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
        base_snapshot_id: (natal?.metadatos && natal?.metadatos.input_snapshot && natal?.metadatos.input_snapshot.id) ? String(natal.metadatos.input_snapshot.id) : null,
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
    if (!consultante?.id) return;
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
      // mark layer active for immediate UI feedback
      setActiveLayers((prev) => {
        const next = new Set(prev);
        next.add(layer);
        return next;
      });
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error calculating layer:', e);
      // fallback: attempt a generic calculateChart refresh
      if (calculateChart) await calculateChart();
      return false;
    }
  };

  // If no natal data at all, show an explanatory empty state (no backend calls)
  if (!natal) {
    return (
      <div className="min-h-[360px] bg-white border border-gray-200 rounded-xl p-6 text-center">
                <h2 className="text-xl font-semibold">Astrología Aplicada — Visualización profesional</h2>
        <p className="mt-3 text-sm text-gray-600">No hay datos astrológicos disponibles para la identidad proporcionada.</p>
      </div>
    );
  }

  const meta = natal.metadatos || {};

  // Prepare filtered data
  const planetsFiltered = (natal.planetas || []).filter((p) => (visiblePlanets[String(p.nombre).toLowerCase().trim()] ?? true));
  const aspectosWithKey = (natal.aspectos || []).map((a, idx) => ({ ...a, _key: `${String(a.planeta1).toLowerCase().trim()}-${String(a.planeta2).toLowerCase().trim()}-${a.tipo}-${idx}` }));
  const aspectosFiltered = aspectosWithKey.filter((a: any) => (visibleAspects[a._key] ?? true) && Math.abs(a.orbe || 0) <= orb);

  // Format snapshot ID
  const formatSnapshotId = (snapshot: any) => {
    if (!snapshot) return null;
    if (typeof snapshot === 'string') return snapshot.slice(0, 16);
    if (typeof snapshot === 'object' && snapshot.id) return String(snapshot.id).slice(0, 16);
    return JSON.stringify(snapshot).slice(0, 16);
  };

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
          synastryEnabled={synastryEnabled}
          setSynastryEnabled={setSynastryEnabled}
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
                    disabled={!consultante?.id}
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
                      <div className="text-xs text-gray-500">Estado: Disponible</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    {
                      (() => {
                        // Identity must come only from the provided consultante prop
                        const c = consultante;
                        const name = c.nombre_completo;
                        const birth = c.fecha_nacimiento;
                        const sun = (natal.planetas || []).find((p:any) => String(p.nombre).toLowerCase() === 'sun' || String(p.nombre).toLowerCase() === 'sol');
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
                      <div className="text-xs text-gray-500">Estado: {overlays.transits ? 'Disponible' : 'No calculado todavía'}</div>
                    </div>
                    <div>
                      <input type="checkbox" checked={activeLayers.has('transits')} onChange={() => handleLayerToggle('transits')} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Fecha de referencia</label>
                    <input type="date" value={transitDate} onChange={(e) => setTransitDate(e.target.value)} className="mt-1 w-full" />
                    {!overlays.transits && (
                      <button onClick={() => calculateLayer('transits')} className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">Calcular capa</button>
                    )}
                  </div>
                </div>

                {/* Progresiones (secundarias) */}
                <div className="p-2 bg-white border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Progresiones (Secundarias)</div>
                      <div className="text-xs text-gray-500">Estado: {overlays.progressions ? 'Disponible' : 'No calculado todavía'}</div>
                    </div>
                    <div>
                      <input type="checkbox" checked={activeLayers.has('progressions')} onChange={() => handleLayerToggle('progressions')} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Fecha objetivo</label>
                    <input type="date" value={progressionDate} onChange={(e) => setProgressionDate(e.target.value)} className="mt-1 w-full" />
                    {!overlays.progressions && (
                      <button onClick={() => calculateLayer('progressions')} className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">Calcular capa</button>
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
                      <div className="text-xs text-gray-500">Estado: {overlays.solarReturn ? 'Disponible' : 'No calculado todavía'}</div>
                    </div>
                    <div>
                      <input type="checkbox" checked={activeLayers.has('solarReturn')} onChange={() => handleLayerToggle('solarReturn')} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <label className="block">Año</label>
                    <input type="number" value={solarYear} onChange={(e) => setSolarYear(Number(e.target.value))} className="mt-1 w-full" />
                    {!overlays.solarReturn && (
                      <button onClick={() => calculateLayer('solarReturn')} className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">Calcular capa</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                        const cmp = computeCompositeFromTwoNatal(natal, partnerChart);
                        setCompositeChart(cmp);
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
                              // ensure UI layer toggles to show progressions
                              setActiveLayers((prev) => { const n = new Set(prev); n.add('progressions'); return n; });
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
                            // ensure UI layer toggles to show solar return immediately
                            setActiveLayers((prev) => { const n = new Set(prev); n.add('solarReturn'); return n; });
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
                          // ensure UI layer toggles to show transits immediately
                          setActiveLayers((prev) => { const n = new Set(prev); n.add('transits'); return n; });
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
                 <CalculationStatusPanel overlays={overlays} activeLayers={activeLayers} houseSystem={houseSystem} zodiacType={zodiacType} canRecalculate={Boolean(calculateChart)} />
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

                  {/* Professional ActionBar & Context (therapist-only) */}
                  {isTherapist ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between bg-white border rounded p-3">
                            <button className="px-3 py-1 rounded bg-gray-800 text-white text-sm" onClick={() => exportProfessionalPDF(`lectura_${consultante?.id || 'x'}.pdf`)}>Exportar PDF</button>
                          <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={async () => {
                            try {
                              const payload = (() => {
                                if (showCompareSolarReturn) return solarReturnSnapshot || (analysis_result && analysis_result.solarReturn && analysis_result.solarReturn.chart) || natal;
                                if (showCompareProgressions) return progressionsSnapshot || (analysis_result && analysis_result.progressions && analysis_result.progressions.chart) || natal;
                                if (activeLayers.has('transits')) return transitsSnapshot || analysis_result?.transits || natal;
                                if (activeLayers.has('progressions')) return progressionsSnapshot || analysis_result?.progressions?.chart || natal;
                                if (activeLayers.has('solarReturn')) return solarReturnSnapshot || analysis_result?.solarReturn?.chart || natal;
                                return natal;
                              })();
                              const token = getAuthToken(); if (!token) throw new Error('No auth');
                              const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                                body: JSON.stringify({ action: 'save_snapshot', snapshot: { type: 'comparative', shared: true, chart: payload } }),
                              });
                              if (!resp.ok) throw new Error(await resp.text().catch(() => 'error'));
                              const data = await resp.json();
                              const sid = data.snapshot_id || data.id || (data && data.chart && data.chart.metadatos && data.chart.metadatos.input_snapshot && data.chart.metadatos.input_snapshot.id) || null;
                              setSharedSnapshotId(sid ? String(sid) : null);
                              alert('Lectura preparada y marcada como compartida.');
                            } catch (err) {
                              // eslint-disable-next-line no-console
                              console.error('Send to client failed', err);
                              alert('No se pudo preparar la lectura para el consultante.');
                            }
                          }}>Enviar al consultante</button>

                          <button className="px-3 py-1 rounded bg-white border text-sm" onClick={async () => {
                            try {
                              const payload = { ref: (sharedSnapshotId || formatSnapshotId(natal) || `natal-${consultante?.id}`), added_at: new Date().toISOString(), patient_id: consultante?.id };
                              const token = getAuthToken(); if (!token) throw new Error('No auth');
                              const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                                body: JSON.stringify({ action: 'add_to_worksheet', reference: payload }),
                              });
                              if (!resp.ok) throw new Error(await resp.text().catch(() => 'error'));
                              const data = await resp.json();
                              setWorksheetRefs((w) => [{ id: data.id || data.ref || payload.ref, ...payload }, ...w]);
                              alert('Lectura añadida a hoja de trabajo.');
                            } catch (err) {
                              // eslint-disable-next-line no-console
                              console.error('Add to worksheet failed', err);
                              alert('No se pudo añadir a la hoja de trabajo.');
                            }
                          }}>Añadir a hoja de trabajo</button>

                          <button className="px-3 py-1 rounded border bg-white text-sm" onClick={() => setShowNotesModal(true)}>Notas del terapeuta</button>
                        </div>

                        <div className="text-sm text-gray-600 text-right">
                          <div><strong>Método:</strong> {activeLayers.has('solarReturn') ? 'Retorno Solar' : activeLayers.has('progressions') ? 'Progresiones (Secundarias)' : activeLayers.has('transits') ? 'Tránsitos' : 'Natal'}</div>
                          <div><strong>Comparativa:</strong> {showCompareSolarReturn ? 'Natal ↔ Retorno Solar' : showCompareProgressions ? 'Natal ↔ Progresiones' : '—'}</div>
                          <div><strong>Referencia:</strong> { (showCompareSolarReturn && (solarReturnSnapshot?.return_datetime_exact || analysis_result?.solarReturn?.chart?.metadatos?.reference_date)) || (showCompareProgressions && (progressionsSnapshot?.progressed_datetime || analysis_result?.progressions?.chart?.metadatos?.reference_date)) || (activeLayers.has('transits') && (transitsSnapshot?.observed_datetime || analysis_result?.transits?.metadatos?.reference_date)) || (meta.calculated_at ?? new Date().toISOString()) }</div>
                          <div><strong>Estado:</strong> { (showCompareSolarReturn && (solarReturnSnapshot || analysis_result?.solarReturn?.chart)) || (showCompareProgressions && (progressionsSnapshot || analysis_result?.progressions?.chart)) || (activeLayers.has('transits') && (transitsSnapshot || analysis_result?.transits)) ? 'Calculado' : 'En caché' }</div>
                        </div>
                      </div>

                      {/* Notes modal (simple) */}
                      {showNotesModal ? (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowNotesModal(false)} />
                          <div className="bg-white rounded-lg shadow-lg p-4 z-10 w-full max-w-xl">
                            <h3 className="font-semibold">Notas del terapeuta</h3>
                            <textarea className="w-full h-40 mt-2 p-2 border rounded" value={therapistNotes} onChange={(e) => setTherapistNotes(e.target.value)} />
                            <div className="mt-3 flex justify-end gap-2">
                              <button className="px-3 py-1 rounded border" onClick={() => setShowNotesModal(false)}>Cancelar</button>
                              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={async () => {
                                try {
                                  const token = getAuthToken(); if (!token) throw new Error('No auth');
                                  const resp = await fetch(`${apiURL}/therapist/patients/${consultante.id}/astrology-kerykeion/`, {
                                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                                    body: JSON.stringify({ action: 'save_note', note: therapistNotes, context: { snapshot_id: sharedSnapshotId } }),
                                  });
                                  if (!resp.ok) throw new Error(await resp.text().catch(() => 'error'));
                                  setShowNotesModal(false);
                                  alert('Nota guardada.');
                                } catch (err) {
                                  // eslint-disable-next-line no-console
                                  console.error('Save note failed', err);
                                  alert('No se pudo guardar la nota.');
                                }
                              }}>Guardar</button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div id="professional-chart-area">
                  {activeLayers.has('transits') && analysis_result?.transits ? (
                    <AstrologyDoubleWheelSVG natal={natal} overlay={analysis_result.transits} overlayLabel="Tránsitos" orbDegrees={orb} consultante={consultante} />
                  ) : activeLayers.has('progressions') && analysis_result?.progressions?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal} overlay={analysis_result.progressions.chart} overlayLabel="Progresiones (Secundarias)" orbDegrees={orb} consultante={consultante} />
                  ) : activeLayers.has('solarReturn') && analysis_result?.solarReturn?.chart ? (
                    <AstrologyDoubleWheelSVG natal={natal} overlay={analysis_result.solarReturn.chart} overlayLabel="Retorno Solar" orbDegrees={orb} consultante={consultante} />
                  ) : synastryEnabled && partnerChart ? (
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
                    (natal ? (
                      // Normalize natal payload into wheel data
                      (() => {
                        const wheel = normalizeNatalForWheel(natal as any);
                        const hasIdentity = consultante && consultante.fecha_nacimiento;
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
                                <AstroWheelAdvanced
                                  size={920}
                                  ascendantDeg={wheel.ascendantDeg}
                                  houses={wheel.houses}
                                  planets={wheel.planets}
                                  asteroids={showAsteroids ? (wheel.asteroids ?? []) : []}
                                  showAspects={true}
                                  orbDeg={orb}
                                  titleRight={`${meta.sistema_casas || 'placidus'} · ${meta.zodiac_type || 'tropical'}`}
                                  transitPlanets={transitsSnapshot && transitBaseType === 'natal' ? transitsSnapshot.planets : undefined}
                                />
                        );
                      })()
                    ) : null)
                  )}
                </>
              ) : (
                  // Advanced psychological panel uses deterministic psychEngine
                  (natal ? <PsychologicalHoroscopeAdvanced advanced={buildAdvancedInputFromPayload(natal)!} /> : <PsychologicalAnalysisPanel natal={natal} analysis_result={analysis_result} consultante={consultante} />)
              )}
            </div>
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
                    {(natal.planetas || []).map((p, idx) => (
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
                {aspectosFiltered.map((a, idx) => (
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
                  {(natal.casas || []).map((c: any, idx: number) => {
                    const houseNumber = c.numero ?? (idx + 1);
                    // Try to read mapping from cabalistic data if present
                    const cab = (natal.cabalistic_data && (natal.cabalistic_data as any).houses && (natal.cabalistic_data as any).houses[String(houseNumber)]) || null;
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
                  {(natal.planetas || []).filter((p) => (visiblePlanets[String(p.nombre).toLowerCase().trim()] ?? true)).length} de {(natal.planetas || []).length}
                </div>
              </div>

              {/* Aspectos Visibles */}
              <div>
                <label className="block text-xs font-medium mb-2">Aspectos Visibles</label>
                <div className="text-xs text-gray-600">
                  {aspectosFiltered.length} de {(natal.aspectos || []).length}
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
