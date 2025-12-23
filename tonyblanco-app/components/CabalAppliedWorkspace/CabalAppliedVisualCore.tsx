'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CabalSectionId } from './types';
import { getActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, type PatientProfileSummary } from '@/lib/patient-api';
import { useTreeStructuralState } from '@/lib/tree-structural-state';
import TreeOfLifeSVG from '@/components/Tree/TreeOfLifeSVG';
import TreeVisualPlaceholder from './TreeVisualPlaceholder';
import { ejecutarMetodoPitagorico } from '../../../src/symbolic/methods/pitagoras';
import type { PitagorasSymbolicState } from '../../../src/symbolic/methods/pitagoras/pitagoras.types';

interface CabalAppliedVisualCoreProps {
  activeSection: CabalSectionId;
}

export default function CabalAppliedVisualCore({ activeSection }: CabalAppliedVisualCoreProps) {
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfileSummary | null>(null);
  const [pitagorasState, setPitagorasState] = useState<PitagorasSymbolicState | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPatient = async () => {
      const patientId = getActivePatientId();
      if (!isMounted) return;
      setActivePatientId(patientId ?? null);
      if (!patientId) {
        setPatientProfile(null);
        return;
      }
      try {
        const profile = await getPatientProfileSummary(patientId);
        if (isMounted) {
          setPatientProfile(profile);
        }
      } catch (error) {
        if (isMounted) {
          setPatientProfile(null);
        }
      }
    };

    loadPatient();
    window.addEventListener('activePatientChanged', loadPatient);
    return () => {
      isMounted = false;
      window.removeEventListener('activePatientChanged', loadPatient);
    };
  }, []);

  const emptyTarotCards = useMemo(() => [], []);
  const treeInput = useMemo(
    () => ({
      fullName: patientProfile?.legal_full_name ?? null,
      birthDate: patientProfile?.birth_date ?? null,
      tarotCards: emptyTarotCards,
    }),
    [patientProfile?.legal_full_name, patientProfile?.birth_date, emptyTarotCards]
  );

  const { state, loading } = useTreeStructuralState(treeInput);

  const highlightedSefirot = useMemo(() => {
    if (!state?.sefirot_activas.length) return [];
    return state.sefirot_activas.map((item) => item.id_canonico);
  }, [state?.sefirot_activas]);

  const highlightedPaths = useMemo(() => {
    if (!state?.senderos_activos.length) return [];
    return state.senderos_activos
      .map((sendero) => {
        const from = sendero.endpoints.from_sefira;
        const to = sendero.endpoints.to_sefira;
        return from && to ? `${from}-${to}` : null;
      })
      .filter((value): value is string => Boolean(value));
  }, [state?.senderos_activos]);

  const repeatedSefirot = useMemo(() => {
    if (!state?.repeticiones.length) return [];
    return state.repeticiones
      .map((item) => item.simbolo_id)
      .filter((id) => !id.includes('-'));
  }, [state?.repeticiones]);

  const repeatedPaths = useMemo(() => {
    if (!state?.repeticiones.length) return [];
    return state.repeticiones
      .map((item) => item.simbolo_id)
      .filter((id) => id.includes('-'));
  }, [state?.repeticiones]);

  const mapWeightsToOpacity = (items: Array<{ id: string; weight: number }>) => {
    if (!items.length) {
      return {};
    }
    const weights = items.map((item) => item.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const minOpacity = 0.45;
    const maxOpacity = 1;
    return items.reduce<Record<string, number>>((acc, item) => {
      if (maxWeight === minWeight) {
        acc[item.id] = maxOpacity;
      } else {
        const ratio = (item.weight - minWeight) / (maxWeight - minWeight);
        acc[item.id] = minOpacity + ratio * (maxOpacity - minOpacity);
      }
      return acc;
    }, {});
  };

  const highlightedSefirotOpacity = useMemo(() => {
    const items =
      state?.sefirot_activas.map((item) => ({
        id: item.id_canonico,
        weight: item.peso,
      })) ?? [];
    return mapWeightsToOpacity(items);
  }, [state?.sefirot_activas]);

  const highlightedPathOpacity = useMemo(() => {
    const items =
      state?.senderos_activos
        .map((item) => {
          const from = item.endpoints.from_sefira;
          const to = item.endpoints.to_sefira;
          if (!from || !to) {
            return null;
          }
          return {
            id: `${from}-${to}`,
            weight: item.peso,
          };
        })
        .filter((value): value is { id: string; weight: number } => Boolean(value)) ?? [];
    return mapWeightsToOpacity(items);
  }, [state?.senderos_activos]);

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arbol de la Vida</h3>
          <p className="text-xs text-gray-500">
            Estado estructural observacional (v0.1).
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <TreeVisualPlaceholder />
      {!activePatientId ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Seleccione un paciente para ver el Arbol de la Vida.
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="relative w-full h-72">
              <TreeOfLifeSVG
                highlightedSefirot={[]}
                highlightedPaths={[]}
                emphasis="soft"
                size="responsive"
                className="absolute inset-0 h-full w-full opacity-40 pointer-events-none"
              />
              <TreeOfLifeSVG
                highlightedSefirot={highlightedSefirot}
                highlightedPaths={highlightedPaths}
                highlightedSefirotOpacity={highlightedSefirotOpacity}
                highlightedPathOpacity={highlightedPathOpacity}
                repeatedSefirot={repeatedSefirot}
                repeatedPaths={repeatedPaths}
                emphasis="strong"
                dimUnrelated={true}
                size="responsive"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
          {activePatientId && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                onClick={() => {
                  // Ejecutar método Pitágoras usando solo datos disponibles del paciente
                  if (!patientProfile?.legal_full_name || !patientProfile?.birth_date) return;
                  try {
                    const date = new Date(patientProfile.birth_date);
                    const input = {
                      nombreCompleto: patientProfile.legal_full_name,
                      fechaNacimiento: {
                        dia: date.getUTCDate(),
                        mes: date.getUTCMonth() + 1,
                        anio: date.getUTCFullYear(),
                      },
                    };
                    const estado = ejecutarMetodoPitagorico(input as any) as PitagorasSymbolicState;
                    setPitagorasState(estado);
                  } catch (err) {
                    // No persistir ni lanzar interpretaciones; solo silenciar fallos locales
                    console.error('Error ejecutando Pitágoras:', err);
                  }
                }}
              >
                Pitágoras
              </button>
              <span className="text-xs text-gray-500">Ejecutar manualmente el método Pitagórico (solo lectura)</span>
            </div>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Sefirot activas</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.sefirot_activas.length ? (
                  <span>
                    {state.sefirot_activas
                      .map((item) => `${item.id_canonico} (${item.indice ?? '-'}, ${item.peso})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Senderos activos</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.senderos_activos.length ? (
                  <span>
                    {state.senderos_activos
                      .map((item) => `${item.id_canonico} (${item.numero ?? '-'}, ${item.peso})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Repeticiones</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.repeticiones.length ? (
                  <span>
                    {state.repeticiones
                      .map((item) => `${item.simbolo_id} (${item.conteo})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Pesos</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state && Object.keys(state.pesos).length ? (
                  <span>
                    {Object.entries(state.pesos)
                      .map(([key, value]) => `${key} (${value})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            <span className="font-medium">Ejes:</span> No disponible -{' '}
            <span className="font-medium">Polaridades:</span> No disponible -{' '}
            <span className="font-medium">Fuentes:</span> No disponible
          </div>
          {/* Pitagoras result panel (solo UI, no persistencia) */}
          {pitagorasState ? (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Pitágoras (resultado simbólico)</div>
              <div className="mt-2 text-xs">
                {pitagorasState.primaryNumbers.map((n) => (
                  <div key={n.key} className="mb-1">
                    <strong>{n.label}:</strong> {n.value} — {n.meaning?.titulo ?? n.meaning?.descripcion ?? '—'}
                  </div>
                ))}
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-600">Inclusion (casas):</div>
                  <div className="mt-1 text-xs">
                    {Object.entries(pitagorasState.inclusionMap)
                      .map(([k, v]) => `${k}: ${v.frequency}${v.isAbsent ? ' (ausente)' : ''}${v.isDominant ? ' (dominante)' : ''}`)
                      .join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
