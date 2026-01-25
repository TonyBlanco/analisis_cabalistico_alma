'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TransgenerationalSectionId } from './types';
import TreeOfLifeSVG from '@/components/Tree/TreeOfLifeSVG';
import type { TreePathId, TreeSefirahId } from '@/components/Tree/tree.types';
import { getActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, type PatientProfileSummary } from '@/lib/patient-api';
import { useTreeStructuralState } from '@/lib/tree-structural-state';

interface TransgenerationalVisualCoreProps {
  activeSection: TransgenerationalSectionId;
}

export default function TransgenerationalVisualCore({
  activeSection,
}: TransgenerationalVisualCoreProps) {
  const [patientProfile, setPatientProfile] = useState<PatientProfileSummary | null>(null);
  const [hoveredSefirah, setHoveredSefirah] = useState<TreeSefirahId | null>(null);
  const [hoveredPath, setHoveredPath] = useState<TreePathId | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPatient = async () => {
      const patientId = getActivePatientId();
      if (!isMounted) return;
      if (!patientId) {
        setPatientProfile(null);
        return;
      }
      try {
        const profile = await getPatientProfileSummary(patientId);
        if (isMounted) {
          setPatientProfile(profile);
        }
      } catch {
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Explicit memoization for documentation; Compiler may optimize
  const highlightedSefirot = useMemo(() => {
    if (!state?.sefirot_activas.length) return [];
    return state.sefirot_activas.map((item) => item.id_canonico);
  }, [state?.sefirot_activas]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Explicit memoization for documentation
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Explicit memoization for documentation
  const repeatedSefirot = useMemo(() => {
    if (!state?.repeticiones.length) return [];
    return state.repeticiones
      .map((item) => item.simbolo_id)
      .filter((id) => !id.includes('-'));
  }, [state?.repeticiones]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Explicit memoization for documentation
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

  const tooltipData = useMemo(() => {
    if (!state) return null;
    if (hoveredSefirah) {
      const repetition = state.repeticiones.find(
        (item) => item.simbolo_id === hoveredSefirah
      );
      const weight =
        state.pesos?.[hoveredSefirah] ??
        state.sefirot_activas.find((item) => item.id_canonico === hoveredSefirah)?.peso;
      return {
        type: 'sefira' as const,
        id: hoveredSefirah,
        weight,
        repetition: repetition?.conteo,
      };
    }
    if (hoveredPath) {
      const repetition = state.repeticiones.find(
        (item) => item.simbolo_id === hoveredPath
      );
      const weight =
        state.pesos?.[hoveredPath] ??
        state.senderos_activos.find((item) => {
          const from = item.endpoints.from_sefira;
          const to = item.endpoints.to_sefira;
          return from && to ? `${from}-${to}` === hoveredPath : false;
        })?.peso;
      return {
        type: 'sendero' as const,
        id: hoveredPath,
        weight,
        repetition: repetition?.conteo,
      };
    }
    return null;
  }, [hoveredPath, hoveredSefirah, state]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Explicit memoization for documentation
  const weightRanking = useMemo(() => {
    if (!state?.pesos) return [];
    return Object.entries(state.pesos).sort((a, b) => b[1] - a[1]);
  }, [state?.pesos]);

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arbol Genealogico</h3>
          <p className="text-xs text-gray-500">
            Observacional. Sin inferencia, sin generacion, sin diagnostico.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="relative w-full h-72">
            <TreeOfLifeSVG
              highlightedSefirot={[]}
              highlightedPaths={[]}
              emphasis="soft"
              size="responsive"
              className="absolute inset-0 h-full w-full opacity-40 pointer-events-none"
            />
            <TreeOfLifeSVG
              highlightedSefirot={highlightedSefirot as TreeSefirahId[]}
              highlightedPaths={highlightedPaths as TreePathId[]}
              highlightedSefirotOpacity={highlightedSefirotOpacity}
              highlightedPathOpacity={highlightedPathOpacity}
              repeatedSefirot={repeatedSefirot as TreeSefirahId[]}
              repeatedPaths={repeatedPaths as TreePathId[]}
              emphasis="strong"
              dimUnrelated={true}
              interactive={true}
              onSefirahHover={(id) => {
                setHoveredSefirah(id);
                if (id) {
                  setHoveredPath(null);
                }
              }}
              onPathHover={(id) => {
                setHoveredPath(id);
                if (id) {
                  setHoveredSefirah(null);
                }
              }}
              size="responsive"
              className="absolute inset-0 h-full w-full"
            />
            {tooltipData ? (
              <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] text-slate-700 shadow-sm">
                <div className="font-medium">ID: {tooltipData.id}</div>
                {tooltipData.weight !== undefined ? (
                  <div>Peso: {tooltipData.weight}</div>
                ) : null}
                {tooltipData.repetition !== undefined ? (
                  <div>Repeticion: {tooltipData.repetition}</div>
                ) : null}
              </div>
            ) : null}
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
          <div className="mt-4 text-xs uppercase tracking-wide text-gray-500">Pesos por simbolo</div>
          <div className="mt-2 text-xs">
            {loading ? (
              <span>Cargando...</span>
            ) : weightRanking.length ? (
              <span>
                {weightRanking
                  .map(([key, value]) => `${key} (${value})`)
                  .join(', ')}
              </span>
            ) : (
              <span>No disponible</span>
            )}
          </div>
        </div>
      </div>
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
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
        <span className="font-medium">Ejes:</span> No disponible ·{' '}
        <span className="font-medium">Polaridades:</span> No disponible ·{' '}
        <span className="font-medium">Fuentes:</span> No disponible
      </div>
    </section>
  );
}
