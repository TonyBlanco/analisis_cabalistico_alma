'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Activity, HelpCircle } from 'lucide-react';
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

function InfoTooltip({
  id,
  label,
  openId,
  setOpenId,
  children,
}: {
  id: string;
  label: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = openId === id;

  return (
    <span className="relative inline-flex items-center" data-tooltip-root={id}>
      <button
        type="button"
        className="inline-flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={`tooltip-${id}`}
        onClick={() => setOpenId(isOpen ? null : id)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpenId(null);
          }
        }}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </button>

      <span
        id={`tooltip-${id}`}
        role="tooltip"
        className={[
          'absolute left-0 top-full z-20 mt-2 w-80 max-w-[85vw] rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-800 shadow-lg',
          isOpen ? 'block' : 'hidden',
        ].join(' ')}
      >
        {children}
      </span>
    </span>
  );
}

export default function ResonanciaAncestralWorkspace() {
  const consultante = useActiveConsultante();
  const [observations, setObservations] = useState<ResonanciaObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nowLabel = useMemo(() => new Date().toLocaleString('es-ES'), []);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!openTooltipId) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Element | null;
      if (!target) return;
      const root = target.closest(`[data-tooltip-root="${openTooltipId}"]`);
      if (!root) setOpenTooltipId(null);
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openTooltipId]);

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

  const descriptiveVisualizations = useMemo(() => {
    const byType: Record<ResonanciaObservationType, number> = {
      resonancia: 0,
      eje: 0,
      repeticion: 0,
      nota: 0,
    };

    const byContext: Record<ResonanciaObservationContext, number> = {
      familiar: 0,
      relacional: 0,
      sistemico: 0,
    };

    const byTypeAndContext: Record<ResonanciaObservationType, Record<ResonanciaObservationContext, number>> = {
      resonancia: { familiar: 0, relacional: 0, sistemico: 0 },
      eje: { familiar: 0, relacional: 0, sistemico: 0 },
      repeticion: { familiar: 0, relacional: 0, sistemico: 0 },
      nota: { familiar: 0, relacional: 0, sistemico: 0 },
    };

    const timeline = observations
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    for (const obs of observations) {
      byType[obs.type] += 1;
      byContext[obs.context] += 1;
      byTypeAndContext[obs.type][obs.context] += 1;
    }

    return { byType, byContext, byTypeAndContext, timeline };
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
          <div className="hidden md:block text-right">
            <div className="text-xs text-gray-500">Fecha/hora: {nowLabel}</div>
          </div>
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
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Mapa de resonancia</h3>
                  <InfoTooltip
                    id="t1_map"
                    label="Mapa de resonancia: ayuda"
                    openId={openTooltipId}
                    setOpenId={setOpenTooltipId}
                  >
                    <strong>Mapa de resonancia</strong>
                    <br />
                    <br />
                    Esta visualización muestra <strong>relaciones simbólicas registradas</strong> entre elementos
                    observados.
                    <br />
                    <br />
                    • Cada nodo representa un <em>anchor</em> (elemento mencionado en una observación).
                    <br />
                    • Cada enlace indica que dos o más anchors fueron registrados juntos.
                    <br />
                    <br />
                    ⚠️ El mapa <strong>no indica causas</strong>, <strong>no establece jerarquías</strong> y{' '}
                    <strong>no interpreta significados</strong>.
                    <br />
                    <br />
                    Su función es <strong>hacer visible lo que ha sido observado</strong>, no explicar por qué ocurre.
                  </InfoTooltip>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Visualización neutral basada en anchors registrados. No infiere significados ni jerarquías.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium text-gray-700">Anchors</div>
                      <InfoTooltip
                        id="t1_anchors"
                        label="Anchor (elemento simbólico): ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Anchor (elemento simbólico)</strong>
                        <br />
                        <br />
                        Un anchor es una palabra o referencia que el terapeuta utiliza para nombrar{' '}
                        <strong>algo observado</strong>
                        <br />
                        (por ejemplo: una emoción mencionada, una figura familiar, un tema recurrente).
                        <br />
                        <br />
                        • No es un diagnóstico
                        <br />
                        • No es una categoría clínica
                        <br />
                        • No tiene valor por sí mismo
                        <br />
                        <br />
                        Su sentido depende <strong>exclusivamente del contexto profesional del terapeuta</strong>.
                      </InfoTooltip>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium text-gray-700">Enlaces</div>
                      <InfoTooltip
                        id="t1_links"
                        label="Enlace simbólico: ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Enlace simbólico</strong>
                        <br />
                        <br />
                        Un enlace aparece cuando <strong>dos o más anchors</strong> han sido registrados juntos en una
                        observación.
                        <br />
                        <br />
                        El enlace <strong>solo indica coexistencia</strong>, no relación causal ni explicativa.
                      </InfoTooltip>
                    </div>
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
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Ejes ancestrales</h3>
                  <InfoTooltip
                    id="t2_axis"
                    label="Eje simbólico: ayuda"
                    openId={openTooltipId}
                    setOpenId={setOpenTooltipId}
                  >
                    <strong>Eje simbólico</strong>
                    <br />
                    <br />
                    Un eje representa una <strong>dirección de repetición observada</strong> dentro del registro.
                    <br />
                    <br />
                    No es una causa, no es una ley, no es una conclusión.
                    <br />
                    <br />
                    Sirve para <strong>organizar observaciones similares</strong> y facilitar su revisión profesional.
                  </InfoTooltip>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Visualización de ejes simbólicos recurrentes dentro del sistema relacional. Permite observar
                  direcciones de repetición o continuidad sin establecer conclusiones.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      Tipo
                      <InfoTooltip
                        id="t2_filter_type"
                        label="Tipo de observación: ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Tipo de observación</strong>
                        <br />
                        <br />
                        Filtra el registro según la forma en que fue clasificada la observación
                        <br />
                        (resonancia, eje, repetición o nota).
                        <br />
                        <br />
                        ⚠️ El filtro <strong>no crea datos nuevos</strong> ni modifica el contenido.
                      </InfoTooltip>
                    </span>
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
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      Contexto
                      <InfoTooltip
                        id="t2_filter_context"
                        label="Contexto simbólico: ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Contexto simbólico</strong>
                        <br />
                        <br />
                        Describe el ámbito desde el cual se realizó la observación
                        <br />
                        (familiar, relacional, sistémico, etc.).
                        <br />
                        <br />
                        El contexto <strong>no define significado</strong>, solo <strong>sitúa la observación</strong>.
                      </InfoTooltip>
                    </span>
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
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      Estado
                      <InfoTooltip
                        id="t2_filter_state"
                        label="Estado de la observación: ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Estado de la observación</strong>
                        <br />
                        <br />
                        Indica si la observación está activa o latente dentro del proceso.
                        <br />
                        <br />
                        No implica gravedad, relevancia ni prioridad.
                      </InfoTooltip>
                    </span>
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
                  <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                    📌 <strong>Aviso importante</strong>
                    <br />
                    Este listado muestra <strong>registros observacionales</strong> realizados por el terapeuta.
                    <br />
                    El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni{' '}
                    <strong>extrae conclusiones</strong> a partir de ellos.
                  </div>
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
                            <InfoTooltip
                              id={`t3_item_${obs.id}`}
                              label="Entrada: ayuda"
                              openId={openTooltipId}
                              setOpenId={setOpenTooltipId}
                            >
                              Esta entrada refleja <strong>exactamente lo que fue registrado</strong>, sin análisis automático.
                            </InfoTooltip>
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

                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-gray-900">Visualización descriptiva (observacional)</h4>
                      <InfoTooltip
                        id="viz_intro"
                        label="¿Qué estoy viendo?"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        Esta sección muestra visualizaciones descriptivas basadas exclusivamente en los registros existentes
                        (filtros aplicados).
                        <br />
                        <br />
                        El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni <strong>extrae conclusiones</strong>{' '}
                        a partir de ellos.
                      </InfoTooltip>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Conteos y distribuciones simples de lo ya registrado, sin inferencias ni recomendaciones.
                    </p>

                    {!observations.length ? (
                      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        Sin observaciones registradas: las visualizaciones aparecen cuando existe al menos un registro.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="text-xs uppercase tracking-wide text-gray-500">V1</div>
                              <div className="text-sm font-semibold text-gray-900">Densidad simbólica por tipo</div>
                              <InfoTooltip
                                id="viz_v1"
                                label="¿Qué estoy viendo?"
                                openId={openTooltipId}
                                setOpenId={setOpenTooltipId}
                              >
                                Conteo de observaciones por tipo en la vista actual (filtros aplicados).
                                <br />
                                <br />
                                El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni{' '}
                                <strong>extrae conclusiones</strong> a partir de ellos.
                              </InfoTooltip>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {(
                              [
                                { key: 'resonancia', label: 'Resonancia' },
                                { key: 'eje', label: 'Eje' },
                                { key: 'repeticion', label: 'Repetición' },
                                { key: 'nota', label: 'Nota' },
                              ] as const
                            ).map(({ key, label }) => {
                              const value = descriptiveVisualizations.byType[key];
                              const max = Math.max(
                                1,
                                ...Object.values(descriptiveVisualizations.byType).map((count) => Number(count) || 0),
                              );
                              const width = Math.max(4, Math.round((value / max) * 100));
                              return (
                                <div key={key} className="grid grid-cols-[110px_1fr_42px] items-center gap-3">
                                  <div className="text-sm text-gray-700">{label}</div>
                                  <div className="h-3 rounded-full bg-gray-100">
                                    <div
                                      className="h-3 rounded-full bg-gray-400"
                                      style={{ width: `${width}%` }}
                                      aria-label={`${label}: ${value}`}
                                    />
                                  </div>
                                  <div className="text-right text-sm tabular-nums text-gray-700">{value}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs uppercase tracking-wide text-gray-500">V2</div>
                            <div className="text-sm font-semibold text-gray-900">Distribución por contexto</div>
                            <InfoTooltip
                              id="viz_v2"
                              label="¿Qué estoy viendo?"
                              openId={openTooltipId}
                              setOpenId={setOpenTooltipId}
                            >
                              Conteo de observaciones por contexto en la vista actual (filtros aplicados).
                              <br />
                              <br />
                              El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni{' '}
                              <strong>extrae conclusiones</strong> a partir de ellos.
                            </InfoTooltip>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {(
                              [
                                { key: 'familiar', label: 'Familiar' },
                                { key: 'relacional', label: 'Relacional' },
                                { key: 'sistemico', label: 'Sistémico' },
                              ] as const
                            ).map(({ key, label }) => (
                              <div key={key} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                <div className="text-xs font-medium text-gray-700">{label}</div>
                                <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                                  {descriptiveVisualizations.byContext[key]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs uppercase tracking-wide text-gray-500">V3</div>
                            <div className="text-sm font-semibold text-gray-900">Línea temporal observacional</div>
                            <InfoTooltip
                              id="viz_v3"
                              label="¿Qué estoy viendo?"
                              openId={openTooltipId}
                              setOpenId={setOpenTooltipId}
                            >
                              Secuencia cronológica de registros observacionales en la vista actual (filtros aplicados).
                              <br />
                              <br />
                              El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni{' '}
                              <strong>extrae conclusiones</strong> a partir de ellos.
                            </InfoTooltip>
                          </div>

                          <div className="mt-3 space-y-2">
                            {descriptiveVisualizations.timeline.map((obs) => (
                              <div key={`timeline-${obs.id}`} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                  <span className="rounded-full bg-white px-2 py-1">
                                    {new Date(obs.created_at).toLocaleString('es-ES')}
                                  </span>
                                  <span className="rounded-full bg-white px-2 py-1">{obs.type}</span>
                                  <span className="rounded-full bg-white px-2 py-1">{obs.context}</span>
                                  <span className="rounded-full bg-white px-2 py-1">{obs.state}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-900">{obs.statement}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs uppercase tracking-wide text-gray-500">V4</div>
                            <div className="text-sm font-semibold text-gray-900">Matriz simbólica simple (tipo × contexto)</div>
                            <InfoTooltip
                              id="viz_v4"
                              label="¿Qué estoy viendo?"
                              openId={openTooltipId}
                              setOpenId={setOpenTooltipId}
                            >
                              Cruce simple de tipo y contexto, mostrando el número de observaciones por celda en la vista actual
                              (filtros aplicados).
                              <br />
                              <br />
                              El sistema <strong>no interpreta</strong>, <strong>no valida</strong> ni{' '}
                              <strong>extrae conclusiones</strong> a partir de ellos.
                            </InfoTooltip>
                          </div>

                          <div className="mt-3 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className="text-left text-xs text-gray-600">
                                  <th className="border-b border-gray-200 px-2 py-2 font-medium">Tipo</th>
                                  <th className="border-b border-gray-200 px-2 py-2 font-medium">Familiar</th>
                                  <th className="border-b border-gray-200 px-2 py-2 font-medium">Relacional</th>
                                  <th className="border-b border-gray-200 px-2 py-2 font-medium">Sistémico</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(
                                  [
                                    { key: 'resonancia', label: 'Resonancia' },
                                    { key: 'eje', label: 'Eje' },
                                    { key: 'repeticion', label: 'Repetición' },
                                    { key: 'nota', label: 'Nota' },
                                  ] as const
                                ).map(({ key, label }) => (
                                  <tr key={`matrix-${key}`} className="text-gray-800">
                                    <td className="border-b border-gray-100 px-2 py-2 font-medium text-gray-700">{label}</td>
                                    <td className="border-b border-gray-100 px-2 py-2 tabular-nums">
                                      {descriptiveVisualizations.byTypeAndContext[key].familiar}
                                    </td>
                                    <td className="border-b border-gray-100 px-2 py-2 tabular-nums">
                                      {descriptiveVisualizations.byTypeAndContext[key].relacional}
                                    </td>
                                    <td className="border-b border-gray-100 px-2 py-2 tabular-nums">
                                      {descriptiveVisualizations.byTypeAndContext[key].sistemico}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">T4</div>
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Registro</h3>
                  <InfoTooltip
                    id="t4_title"
                    label="Registro observacional: ayuda"
                    openId={openTooltipId}
                    setOpenId={setOpenTooltipId}
                  >
                    <strong>Registro observacional</strong>
                    <br />
                    <br />
                    Este espacio está destinado a <strong>describir lo observado</strong>, no a explicar causas ni generar conclusiones.
                    <br />
                    <br />
                    El lenguaje utilizado es responsabilidad profesional del terapeuta.
                  </InfoTooltip>
                </div>
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
                  <details className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                    <summary className="cursor-pointer select-none text-sm font-medium text-gray-900">
                      Ayuda de redacción (observacional)
                    </summary>
                    <div className="mt-2 text-sm text-gray-800">
                      <strong>Cómo redactar una observación</strong>
                      <br />
                      ✔️ Describa lo que aparece o se repite
                      <br />
                      ✔️ Use lenguaje descriptivo
                      <br />
                      ✔️ Mantenga la formulación abierta
                      <br />
                      <br />
                      ❌ Evite explicaciones causales
                      <br />
                      ❌ Evite diagnósticos
                      <br />
                      ❌ Evite conclusiones cerradas
                      <br />
                      <br />
                      <strong>❌ Ejemplo NO recomendado</strong>
                      <br />
                      “Hay una causa familiar que hace que todos fracasen económicamente.”
                      <br />
                      <br />
                      <strong>✅ Ejemplo recomendado</strong>
                      <br />
                      “Se repite la mención de dificultades económicas en varios miembros del sistema familiar.”
                    </div>
                  </details>
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
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      Observación
                      <InfoTooltip
                        id="t4_statement"
                        label="Cómo redactar una observación: ayuda"
                        openId={openTooltipId}
                        setOpenId={setOpenTooltipId}
                      >
                        <strong>Cómo redactar una observación</strong>
                        <br />
                        <br />
                        ✔️ Describa lo que aparece o se repite
                        <br />
                        ✔️ Use lenguaje descriptivo
                        <br />
                        ✔️ Mantenga la formulación abierta
                        <br />
                        <br />
                        ❌ Evite explicaciones causales
                        <br />
                        ❌ Evite diagnósticos
                        <br />
                        ❌ Evite conclusiones cerradas
                      </InfoTooltip>
                    </span>
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
