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
import PsychologicalAnalysisPanel from './PsychologicalAnalysisPanel';
import { getAuthToken } from '@/lib/auth';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';
import AstroWheelAdvanced from '@/components/astrology/AstroWheelAdvanced';
import { normalizeNatalForWheel } from '@/components/astrology/normalizer';
import CalculationStatusPanel from './CalculationStatusPanel';

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

  const [orb, setOrb] = useState<number>(6);
  const [visiblePlanets, setVisiblePlanets] = useState<Record<string, boolean>>(() => ({}));
  const [visibleAspects, setVisibleAspects] = useState<Record<string, boolean>>(() => ({}));
  const [showAsteroids, setShowAsteroids] = useState<boolean>(false);
  const [synastryEnabled, setSynastryEnabled] = useState<boolean>(false);
  const [partnerList, setPartnerList] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerChart, setPartnerChart] = useState<any | null>(null);
  const [synastryAspects, setSynastryAspects] = useState<any[]>([]);

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

  // open modal via global event from sidebar button
  React.useEffect(() => {
    const handler = () => setShowRecalcModal(true);
    window.addEventListener('open-recalc-modal', handler as EventListener);
    return () => window.removeEventListener('open-recalc-modal', handler as EventListener);
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error calculating layer:', e);
      // fallback: attempt a generic calculateChart refresh
      if (calculateChart) await calculateChart();
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
                          const list = await getTherapistPatients();
                          setPartnerList(list || []);
                        } catch (e) {
                          // eslint-disable-next-line no-console
                          console.error('Could not fetch patients', e);
                          setPartnerList([]);
                        }
                      }}>Cargar lista de pacientes</button>
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
                                <AstroWheelAdvanced size={920} ascendantDeg={baseWheel.ascendantDeg ?? 0} houses={baseWheel.houses} planets={baseWheel.planets} asteroids={baseWheel.asteroids ?? []} showAspects={true} orbDeg={orb} titleRight={`${meta.sistema_casas || 'placidus'} · ${meta.zodiac_type || 'tropical'}`} />
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
