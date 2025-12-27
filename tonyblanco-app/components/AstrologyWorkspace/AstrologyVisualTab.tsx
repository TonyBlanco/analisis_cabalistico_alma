'use client';

import { useNatalChart } from '@/hooks/useNatalChart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPatientProfileSummary } from '@/lib/patient-api';
import NatalChartWheel from './NatalChartWheel';
import PlanetsTable from './PlanetsTable';
import HousesTable from './HousesTable';
import AspectsTable from './AspectsTable';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { getHebrewLetterForSign } from '@/lib/kabbalah-sign-letters';
import AstrologyVisualPro from './AstrologyVisualPro';

interface AstrologyVisualTabProps {
  patientId: string | undefined;
  houseSystem?: string;
  zodiacType?: string;
}

/**
 * Tab Visual del workspace de Astrología.
 * 
 * ESTADOS:
 * 1. LOADING: Cargando datos
 * 2. EMPTY: Sin carta calculada (404)
 * 3. READY: Carta disponible con visualización
 * 4. ERROR: Error al cargar o calcular
 * 
 * COMPORTAMIENTO:
 * - GET automático al montar
 * - Botón para calcular (POST) si no hay carta
 * - Validación de campos faltantes con mensaje claro
 */
export default function AstrologyVisualTab({ patientId, houseSystem, zodiacType }: AstrologyVisualTabProps) {
  const { chart, analysisResult, loading, error, missingFields, calculateChart } = useNatalChart(patientId);
  // When an explicit houseSystem is passed prop, prefer it when calculating
  const handleCalculate = async () => {
    await calculateChart(houseSystem, zodiacType);
  };

  const normalizeHouseSystemCode = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    const trimmed = String(value).trim();
    const upper = trimmed.toUpperCase();
    if (['P', 'K', 'E', 'W', 'R'].includes(upper)) return upper;
    const lower = trimmed.toLowerCase();
    if (lower.includes('placid')) return 'P';
    if (lower.includes('koch')) return 'K';
    if (lower.includes('equal')) return 'E';
    if (lower.includes('whole')) return 'W';
    if (lower.includes('regio')) return 'R';
    return upper;
  };

  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!patientId) {
        setPatientProfile(null);
        return;
      }
      setPatientLoading(true);
      try {
        const profile = await getPatientProfileSummary(Number(patientId));
        if (!mounted) return;
        setPatientProfile(profile);
      } catch (err) {
        console.warn('Could not load patient profile for natal header:', err);
        if (mounted) setPatientProfile(null);
      } finally {
        if (mounted) setPatientLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  // Determine if profile has all required fields to compute natal chart
  const hasCompleteProfile = Boolean(
    patientProfile &&
      patientProfile.birth_date &&
      patientProfile.birth_time &&
      patientProfile.birth_latitude != null &&
      patientProfile.birth_longitude != null &&
      patientProfile.birth_timezone
  );

  // ESTADO 1: LOADING
  if (loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-600">Cargando carta natal…</p>
        </div>
      </section>
    );
  }

  // ESTADO 4: ERROR
  if (error && !missingFields) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Error al cargar carta natal</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // ESTADO 2: EMPTY (sin carta calculada)
  if (!chart && !loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Astrología (Visual)</h3>
            <p className="text-xs text-gray-500">
              Evaluación holística astrológica. Lectura simbólica para orientación personal.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          {missingFields && missingFields.length > 0 ? (
            // Error de campos faltantes
            <>
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <div className="text-center max-w-md">
                <p className="text-gray-900 font-medium mb-2">
                  Faltan datos en el perfil del consultante
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Los siguientes campos son requeridos para calcular la carta natal:
                </p>
                <ul className="text-sm text-left space-y-1 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  {missingFields.map((field) => (
                    <li key={field} className="text-amber-800">
                      • {field}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                  Completa el perfil del consultante antes de calcular la carta natal
                </p>
              </div>
            </>
          ) : (
            // Estado inicial sin carta
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">
                  Este consultante aún no tiene una carta natal calculada
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Calcula la carta natal a partir de los datos del perfil del consultante
                </p>
              </div>
              
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Calculando…' : 'Calcular carta natal'}
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // ESTADO 3: READY (carta disponible)
  if (!chart) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <div className="text-center">
            <p className="text-amber-700 font-medium mb-2">No hay datos de carta natal para mostrar</p>
            <p className="text-sm text-gray-600">Intenta recalcular la carta natal o recargar la página.</p>
          </div>
          <button
            onClick={handleCalculate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Recalcular
          </button>
        </div>
      </section>
    );
  }

  const isEmptyPayload =
    (!chart.planetas || chart.planetas.length === 0) &&
    (!chart.casas || chart.casas.length === 0) &&
    (!chart.aspectos || chart.aspectos.length === 0);

  const selectedHouse = normalizeHouseSystemCode(houseSystem);
  const selectedZodiac = zodiacType;
  const appliedHouse = normalizeHouseSystemCode(chart.metadatos?.sistema_casas);
  const appliedZodiac = chart.metadatos?.zodiac_type;
  const hasPendingSelectionChanges = Boolean(
    (selectedHouse && appliedHouse && selectedHouse !== appliedHouse) ||
      (selectedZodiac && appliedZodiac && selectedZodiac !== appliedZodiac)
  );

  const wheelAccent: 'blue' | 'amber' | 'emerald' | 'slate' =
    selectedHouse === 'W' ? 'amber' : selectedHouse === 'E' ? 'emerald' : selectedHouse === 'P' || selectedHouse === 'K' ? 'blue' : 'slate';

  const describeHouseSystem = (code: string | undefined) => {
    switch (code) {
      case 'P':
        return 'Placidus: cúspides variables (enfoque moderno).';
      case 'K':
        return 'Koch: variación topocéntrica; sensibilidad a latitud/tiempo.';
      case 'E':
        return 'Equal: casas de 30° desde el Ascendente.';
      case 'W':
        return 'Whole Sign: cada casa = un signo completo (muy estable para lectura simbólica).';
      case 'R':
        return 'Regiomontanus: tradicional/horaria.';
      default:
        return '—';
    }
  };

  const describeZodiac = (z: string | undefined) => {
    switch (z) {
      case 'tropical':
        return 'Tropical: referencia estacional (occidental).';
      case 'sidereal':
        return 'Sideral: referencia estelar (usa ayanamsha en backend).';
      case 'draconic':
        return 'Dracónico: longitudes rotadas por Nodo Norte (lectura simbólica).';
      default:
        return '—';
    }
  };

  const planetLabelEs: Record<string, string> = {
    sun: 'Sol',
    moon: 'Luna',
    saturn: 'Saturno',
  };

  const planetFocusHint: Record<string, string> = {
    sun: 'Identidad/centro (Tiféret) — observar cómo se expresa y se integra.',
    moon: 'Mundo emocional/ritmos (Yesod) — observar necesidades y regulación.',
    saturn: 'Límites/estructura (Biná) — observar responsabilidad, miedos y contención.',
  };

  const buildExportSummary = () => {
    const lines: string[] = [];

    lines.push('Astrología (Clave Cabalística) — Resumen observacional');
    lines.push(`Sistema de casas (selección): ${selectedHouse || '—'}`);
    lines.push(`- ${describeHouseSystem(selectedHouse)}`);
    lines.push(`Zodiaco (selección): ${selectedZodiac || '—'}`);
    lines.push(`- ${describeZodiac(selectedZodiac)}`);
    lines.push('');

    const keyPlanets = ['sun', 'moon', 'saturn'] as const;
    keyPlanets.forEach((key) => {
      const p = chart.planetas?.find((x) => x.nombre === key);
      if (!p) return;

      const letter = getHebrewLetterForSign(p.signo);
      const sefira = chart.cabalistic_data?.planets?.[key]?.sefira?.sefira_name;
      const headerParts: string[] = [];
      if (letter?.hebrewLetter) headerParts.push(`Letra ${letter.hebrewLetter}`);
      if (sefira) headerParts.push(sefira);
      const headerSuffix = headerParts.length > 0 ? ` (${headerParts.join(' - ')})` : '';

      lines.push(`${planetLabelEs[key]} en ${p.signo}${headerSuffix}:`);
      lines.push(`Enfoque: ${planetFocusHint[key]}`);

      const refs = chart.cabalistic_data?.planets?.[key]?.planet_info?.sefaria_refs;
      if (refs && refs.length > 0) {
        const firstSnippet = refs.find((r) => Boolean(r.snippet))?.snippet;
        if (firstSnippet) {
          lines.push('');
          lines.push(firstSnippet);
        }
        lines.push('Fuente: Sefaria (enlace externo):');
        refs.slice(0, 3).forEach((r) => {
          lines.push(`- ${r.title}: ${r.url}`);
        });
      }
      lines.push('');
    });

    lines.push('Aviso importante: análisis holístico y simbólico con fines de orientación personal.');
    lines.push('No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.');
    return lines.join('\n');
  };

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Astrología (Visual)</h3>
          <p className="text-xs text-gray-500">
            Evaluación holística astrológica. Lectura simbólica para orientación personal.
          </p>
          <p className="mt-2 text-[11px] text-blue-700">
            <a href="/dashboard/astrology-study" className="underline font-semibold">
              Abrir Astrology Study / Lab (modo académico, sin consultantes reales)
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-xs text-gray-500">
            <p>Calculada: {chart.metadatos?.calculated_at ? new Date(chart.metadatos.calculated_at).toLocaleString('es-ES') : '—'}</p>
            <p>Sistema: {chart.metadatos?.sistema_casas || '—'}</p>
            <p>Zodiaco: {chart.metadatos?.zodiac_type || zodiacType || '—'}</p>
            <p>
              Cábala:{' '}
              {chart.cabalistic_data?.hebrew_letters && chart.cabalistic_data.hebrew_letters.length > 0
                ? chart.cabalistic_data.hebrew_letters.join(', ')
                : '—'}
            </p>
          </div>
          <div
            className={
              hasPendingSelectionChanges
                ? 'text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2'
                : 'text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2'
            }
          >
            <p className="font-medium">Selección actual</p>
            <p className="text-[11px] text-gray-600">Sistema: {selectedHouse || '—'}</p>
            <p className="text-[11px] text-gray-600">Zodiaco: {selectedZodiac || '—'}</p>
            {hasPendingSelectionChanges ? (
              <p className="text-[11px] text-amber-800 mt-1">Cambios pendientes: recalcula para aplicar.</p>
            ) : (
              <p className="text-[11px] text-gray-500 mt-1">Aplicado en la carta actual.</p>
            )}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading || !hasCompleteProfile}
              className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              title={!hasCompleteProfile ? 'Completa el perfil del consultante para recalcular' : ''}
            >
              {loading ? 'Recalculando…' : 'Recalcular'}
            </button>
          </div>

          <div className={hasCompleteProfile ? "text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2" : "text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2"}>
            {patientLoading ? (
              <p className="text-sm text-gray-600">Cargando consultante…</p>
            ) : patientProfile ? (
              <div className="min-w-[220px]">
                <div className="font-medium text-sm text-gray-900">
                  {patientProfile.legal_full_name || 'Consultante'}
                  {hasCompleteProfile && (
                    <span className="ml-2 inline-flex items-center text-green-600" title="Perfil completo para cálculo">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Nacimiento: {patientProfile.birth_date || '—'}{patientProfile.birth_time ? ` ${patientProfile.birth_time}` : ''}</div>
                <div className={`text-xs ${hasCompleteProfile ? 'text-green-700' : 'text-gray-500'}`}>Coords: {patientProfile.birth_latitude != null && patientProfile.birth_longitude != null ? `${patientProfile.birth_latitude.toFixed(4)}, ${patientProfile.birth_longitude.toFixed(4)}` : 'Sin coordenadas'}</div>
                {!hasCompleteProfile && (
                  <button
                    onClick={() => {
                      const missing = !patientProfile.birth_time ? 'birth_time' : !patientProfile.birth_city ? 'birth_city' : 'birth_country';
                      try {
                        window.dispatchEvent(new CustomEvent('openPatientEditor', { detail: { focusField: missing, patientId } }));
                      } catch (e) {
                        router.push(`/dashboard/therapist/patients/${patientId}`);
                      }
                    }}
                    className="mt-2 text-xs text-amber-700 underline"
                  >
                    Completar perfil del consultante
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No hay consultante activo</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Guard: payload vacío (evitar pantalla "vacía" sin explicación) */}
        {isEmptyPayload && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-900 text-sm font-medium">La carta fue calculada pero el payload llegó vacío.</p>
            <p className="text-amber-800 text-xs mt-1">Intenta recalcular. Si persiste, revisa el backend o los datos del perfil.</p>
            <div className="mt-3">
              <button
                onClick={handleCalculate}
                className="px-3 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700"
              >
                Recalcular carta natal
              </button>
            </div>
          </div>
        )}

        {/* Rueda de carta natal */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Carta Natal</h4>

          {/* Detección de agrupamientos anómalos (varios planetas en la misma longitud)
              Si se detectan, sugerir recalculo (posible problema del motor astrológico). */}
          {chart.planetas && (() => {
            const counts: Record<string, number> = {};
            chart.planetas.forEach((p) => {
              const key = (Math.round((p.longitud_ecliptica || 0) * 100) / 100).toFixed(2);
              counts[key] = (counts[key] || 0) + 1;
            });
            const dupGroups = Object.values(counts).filter((c) => c > 1);
            if (dupGroups.length > 0) {
              const worst = Math.max(...dupGroups);
              if (worst > 2) {
                return (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800 text-sm font-medium">Se detectó que varios planetas comparten posiciones muy cercanas en la rueda.</p>
                    <p className="text-xs text-amber-700">Esto puede indicar un problema en el cálculo. Intenta recalcular la carta natal.</p>
                    <div className="mt-2">
                      <button
                        onClick={handleCalculate}
                        className="px-3 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700"
                      >
                        Recalcular carta natal
                      </button>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div>
              <NatalChartWheel chart={chart} accent={wheelAccent} pending={hasPendingSelectionChanges} />
              <div className="mt-3 text-[11px] text-gray-500">
                Color de casas = sistema seleccionado ({selectedHouse || '—'}).{hasPendingSelectionChanges ? ' (Cambios pendientes)' : ''}
              </div>
            </div>

            <aside className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Cambios y lectura</h5>

              <div className="text-xs text-gray-700 space-y-2">
                <div>
                  <p className="text-[11px] text-gray-500">Aplicado en carta</p>
                  <p><span className="font-medium">Sistema:</span> {appliedHouse || '—'}</p>
                  <p className="text-[11px] text-gray-600">{describeHouseSystem(appliedHouse)}</p>
                  <p className="mt-1"><span className="font-medium">Zodiaco:</span> {appliedZodiac || '—'}</p>
                  <p className="text-[11px] text-gray-600">{describeZodiac(appliedZodiac)}</p>
                </div>

                <div className={hasPendingSelectionChanges ? 'pt-2 border-t border-gray-100' : 'pt-2 border-t border-gray-100'}>
                  <p className="text-[11px] text-gray-500">Selección actual</p>
                  <p><span className="font-medium">Sistema:</span> {selectedHouse || '—'}</p>
                  <p className="text-[11px] text-gray-600">{describeHouseSystem(selectedHouse)}</p>
                  <p className="mt-1"><span className="font-medium">Zodiaco:</span> {selectedZodiac || '—'}</p>
                  <p className="text-[11px] text-gray-600">{describeZodiac(selectedZodiac)}</p>

                  {hasPendingSelectionChanges ? (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-amber-900 text-xs font-medium">Cambios pendientes</p>
                      <p className="text-amber-800 text-[11px] mt-1">La rueda y tablas siguen mostrando la carta aplicada. Pulsa “Recalcular” para aplicar la selección.</p>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-800 text-xs font-medium">Selección aplicada</p>
                      <p className="text-green-700 text-[11px] mt-1">Lo que ves corresponde al sistema/zodiaco seleccionados.</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500">Resumen exportable</p>
                    <button
                      type="button"
                      className="text-[11px] text-blue-700 underline"
                      onClick={async () => {
                        const text = buildExportSummary();
                        try {
                          await navigator.clipboard.writeText(text);
                        } catch {
                          // Best-effort fallback: do nothing; user can select and copy.
                        }
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                  <textarea
                    readOnly
                    className="mt-2 w-full h-44 resize-none rounded-md border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-700"
                    value={buildExportSummary()}
                  />
                  <p className="mt-2 text-[11px] text-gray-500">Incluye Sol/Luna/Saturno + letra por signo (Séfer Yetzirah).</p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <h6 className="text-xs font-semibold text-gray-900">Fuentes (Sefaria)</h6>
                  <p className="text-[11px] text-gray-500 mt-1">Fuente: Sefaria (enlace externo). Links curados por planeta. Si hay “síntesis AI”, es un resumen original (sin citas) para uso en sesión.</p>

                  {(['sun', 'moon', 'saturn'] as const).map((k) => {
                    const refs = chart.cabalistic_data?.planets?.[k]?.planet_info?.sefaria_refs;
                    if (!refs || refs.length === 0) return null;
                    return (
                      <div key={k} className="mt-3">
                        <div className="text-[11px] font-medium text-gray-800">{planetLabelEs[k] || k}</div>
                        <ul className="mt-1 space-y-1">
                          {refs.slice(0, 4).map((r) => (
                            <li key={r.url} className="text-[11px]">
                              <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                                {r.title}
                              </a>
                              {r.snippet ? (
                                <pre className="mt-1 whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-700">
                                  {r.snippet}
                                </pre>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Tabla de planetas */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Planetas ({chart.planetas.length})
            </h4>
          </div>
          <PlanetsTable planetas={chart.planetas} />
        </div>

        {/* Tabla de casas */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Casas ({chart.casas.length})
            </h4>
          </div>
          <HousesTable casas={chart.casas} />
        </div>

        {/* Tabla de aspectos */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Aspectos ({chart.aspectos.length})
            </h4>
          </div>
          <AspectsTable aspectos={chart.aspectos} />
        </div>

        {/* Visual Pro: overlays y filtros solo visuales (sin recálculo) */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <AstrologyVisualPro
            chart={chart}
            analysisResult={analysisResult ?? null}
            hasRealConsultante={Boolean(patientId)}
          />
        </div>
      </div>

      {/* Mensaje de gobernanza (obligatorio) */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 text-center">
          Aviso importante:<br />
          Este módulo ofrece análisis astrológico y simbólico con fines holísticos y de orientación personal.<br />
          No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.
        </p>
      </div>
    </section>
  );
}
