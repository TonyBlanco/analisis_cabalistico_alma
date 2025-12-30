'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import useActiveConsultante from '@/hooks/useActiveConsultante';
import {
  createResonanciaObservation,
  listResonanciaObservations,
  type ResonanciaObservation,
  type ResonanciaObservationContext,
  type ResonanciaObservationState,
  type ResonanciaObservationType,
} from '@/lib/api/resonancia';

function parseCommaSeparatedList(raw: string, maxItems: number): string[] {
  const parts = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.slice(0, maxItems);
}

export default function ResonanciaAncestralWorkspace() {
  const consultante = useActiveConsultante();
  const [observations, setObservations] = useState<ResonanciaObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    type?: ResonanciaObservationType;
    context?: ResonanciaObservationContext;
    state?: ResonanciaObservationState;
  }>({});

  const [form, setForm] = useState<{
    type: ResonanciaObservationType;
    source: 'registro_manual';
    context: ResonanciaObservationContext;
    state: ResonanciaObservationState;
    statement: string;
    tagsRaw: string;
    anchorsRaw: string;
  }>({
    type: 'resonancia',
    source: 'registro_manual',
    context: 'relacional',
    state: 'activo',
    statement: '',
    tagsRaw: '',
    anchorsRaw: '',
  });

  const identityLabel = useMemo(() => {
    if (!consultante) return null;
    const birth = consultante.fecha_nacimiento
      ? new Date(consultante.fecha_nacimiento).toLocaleDateString('es-ES')
      : '-';
    return `ID ${consultante.id} · ${birth}`;
  }, [consultante]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!consultante?.id) return;
      setLoading(true);
      setError(null);
      try {
        const list = await listResonanciaObservations({
          subjectId: consultante.id,
          type: filters.type,
          context: filters.context,
          state: filters.state,
        });
        if (!isMounted) return;
        setObservations(list);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Error al cargar observaciones.';
        setError(message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [consultante, filters.context, filters.state, filters.type]);

  useEffect(() => {
    if (consultante?.id) return;
    setObservations([]);
    setError(null);
    setLoading(false);
  }, [consultante]);

  const neutralAnchorGraph = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();

    for (const obs of observations) {
      const anchors = Array.isArray(obs.anchors) ? obs.anchors.filter(Boolean) : [];
      for (const anchor of anchors) nodes.add(anchor);
      if (anchors.length < 2) continue;
      for (let i = 0; i < anchors.length; i += 1) {
        for (let j = i + 1; j < anchors.length; j += 1) {
          const a = anchors[i];
          const b = anchors[j];
          const key = [a, b].sort().join('::');
          edges.add(key);
        }
      }
    }

    return {
      nodes: Array.from(nodes).sort((a, b) => a.localeCompare(b, 'es-ES')),
      edges: Array.from(edges).sort((a, b) => a.localeCompare(b, 'es-ES')),
    };
  }, [observations]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Resonancia Ancestral</h1>
            <p className="text-sm text-gray-600">Cartografía simbólica — no clínica.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {consultante ? (
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">{consultante.nombre_completo}</div>
              <div className="text-xs text-gray-500">{identityLabel}</div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Imprimir
          </button>
          <Link
            href="/dashboard/therapist"
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver al espacio clínico
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!consultante ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Sin consultante activo</h2>
            <p className="mt-2 text-sm text-gray-600">
              Seleccione un consultante para visualizar la Resonancia Ancestral.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Este workspace es observacional y simbólico. No realiza inferencias ni cálculos automáticos.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700">
              Este espacio permite observar patrones simbólicos y relacionales del sistema. No realiza inferencias
              automáticas ni sustituye la lectura profesional del terapeuta.
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              Aviso: mantenga el lenguaje en modo observacional (descriptivo), evitando conclusiones automáticas o
              diagnósticos.
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T1</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">Mapa de resonancia</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Visualización neutral basada en anchors registrados. No infiere significados ni jerarquías.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-700">Anchors</div>
                    {neutralAnchorGraph.nodes.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {neutralAnchorGraph.nodes.map((node) => (
                          <span
                            key={node}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {node}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-600">Sin anchors registrados aún.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-700">Enlaces</div>
                    {neutralAnchorGraph.edges.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        {neutralAnchorGraph.edges.map((edge) => {
                          const [a, b] = edge.split('::');
                          return (
                            <li key={edge} className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1">
                              <span className="truncate">{a}</span>
                              <span className="px-2 text-gray-400">↔</span>
                              <span className="truncate">{b}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-gray-600">Sin enlaces aún (se requieren 2+ anchors en una observación).</div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T2</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">Ejes ancestrales</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Visualización de ejes simbólicos recurrentes dentro del sistema relacional. Permite observar
                  direcciones de repetición o continuidad sin establecer conclusiones.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Tipo</span>
                    <select
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                      value={filters.type ?? ''}
                      onChange={(e) => {
                        const next = (e.target.value || undefined) as ResonanciaObservationType | undefined;
                        setFilters((prev) => ({ ...prev, type: next }));
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="resonancia">Resonancia</option>
                      <option value="eje">Eje</option>
                      <option value="repeticion">Repetición</option>
                      <option value="nota">Nota</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Contexto</span>
                    <select
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                      value={filters.context ?? ''}
                      onChange={(e) => {
                        const next = (e.target.value || undefined) as ResonanciaObservationContext | undefined;
                        setFilters((prev) => ({ ...prev, context: next }));
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="familiar">Familiar</option>
                      <option value="relacional">Relacional</option>
                      <option value="sistemico">Sistémico</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Estado</span>
                    <select
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                      value={filters.state ?? ''}
                      onChange={(e) => {
                        const next = (e.target.value || undefined) as ResonanciaObservationState | undefined;
                        setFilters((prev) => ({ ...prev, state: next }));
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="activo">Activo</option>
                      <option value="latente">Latente</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T3</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">Resonancias</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Listado del registro observacional (filtros aplicados si corresponde).
                </p>

                <div className="mt-4 space-y-3">
                  {error ? (
                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">{error}</div>
                  ) : null}

                  {loading ? <div className="text-sm text-gray-600">Cargando observaciones…</div> : null}

                  {!loading && !observations.length ? (
                    <div className="text-sm text-gray-600">Aún no hay observaciones registradas para este consultante.</div>
                  ) : null}

                  {!loading && observations.length ? (
                    <ul className="space-y-3">
                      {observations.map((obs) => (
                        <li key={obs.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="rounded-full bg-white px-2 py-1">{new Date(obs.created_at).toLocaleString('es-ES')}</span>
                            <span className="rounded-full bg-white px-2 py-1">{obs.type}</span>
                            <span className="rounded-full bg-white px-2 py-1">{obs.context}</span>
                            <span className="rounded-full bg-white px-2 py-1">{obs.state}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-900">{obs.statement}</div>
                          {(obs.tags?.length || obs.anchors?.length) ? (
                            <div className="mt-3 space-y-2">
                              {obs.tags?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {obs.tags.map((tag) => (
                                    <span
                                      key={`${obs.id}-tag-${tag}`}
                                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {obs.anchors?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {obs.anchors.map((anchor) => (
                                    <span
                                      key={`${obs.id}-anchor-${anchor}`}
                                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                    >
                                      {anchor}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T4</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">Registro</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Espacio de registro manual para notas simbólicas del proceso. No genera conclusiones automáticas ni recomendaciones.
                </p>

                <form
                  className="mt-4 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!consultante) return;
                    setError(null);

                    const statement = form.statement.trim();
                    if (!statement) {
                      setError('El campo “Observación” es obligatorio.');
                      return;
                    }

                    const tags = parseCommaSeparatedList(form.tagsRaw, 30);
                    const anchors = parseCommaSeparatedList(form.anchorsRaw, 50);

                    setSaving(true);
                    try {
                      await createResonanciaObservation({
                        subjectId: consultante.id,
                        type: form.type,
                        source: 'registro_manual',
                        context: form.context,
                        state: form.state,
                        anchors,
                        tags,
                        statement,
                      });

                      setForm((prev) => ({
                        ...prev,
                        statement: '',
                        tagsRaw: '',
                        anchorsRaw: '',
                      }));

                      const list = await listResonanciaObservations({
                        subjectId: consultante.id,
                        type: filters.type,
                        context: filters.context,
                        state: filters.state,
                      });
                      setObservations(list);
                    } catch (err) {
                      const message = err instanceof Error ? err.message : 'No se pudo guardar la observación.';
                      setError(message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Tipo</span>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                        value={form.type}
                        onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ResonanciaObservationType }))}
                      >
                        <option value="resonancia">Resonancia</option>
                        <option value="eje">Eje</option>
                        <option value="repeticion">Repetición</option>
                        <option value="nota">Nota</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Contexto</span>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                        value={form.context}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, context: e.target.value as ResonanciaObservationContext }))
                        }
                      >
                        <option value="familiar">Familiar</option>
                        <option value="relacional">Relacional</option>
                        <option value="sistemico">Sistémico</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Estado</span>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900"
                        value={form.state}
                        onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value as ResonanciaObservationState }))}
                      >
                        <option value="activo">Activo</option>
                        <option value="latente">Latente</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Fuente</span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-2 text-sm text-gray-700"
                        value="Registro manual"
                        readOnly
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">Observación</span>
                    <textarea
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                      rows={4}
                      value={form.statement}
                      onChange={(e) => setForm((prev) => ({ ...prev, statement: e.target.value }))}
                      placeholder="Escriba una descripción observacional (sin conclusiones)."
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Tags (separados por comas)</span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                        value={form.tagsRaw}
                        onChange={(e) => setForm((prev) => ({ ...prev, tagsRaw: e.target.value }))}
                        placeholder="Ej: continuidad, espejo, umbral"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-gray-700">Anchors (separados por comas)</span>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                        value={form.anchorsRaw}
                        onChange={(e) => setForm((prev) => ({ ...prev, anchorsRaw: e.target.value }))}
                        placeholder="Ej: A1, A2, A3"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                  >
                    {saving ? 'Guardando…' : 'Guardar observación'}
                  </button>
                </form>
              </section>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              Cuando algunos datos del consultante no están disponibles, el workspace permanece accesible, aunque
              ciertas visualizaciones pueden mostrarse de forma limitada.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
