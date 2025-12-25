'use client';

import { useState } from 'react';
import type { AdminWorkspaceContractV1 } from '../../lib/contracts/adminWorkspace.v1';

export function AdminStatsCard(props: {
  enabled: boolean;
  stats?: AdminWorkspaceContractV1['stats'];
}) {
  const { enabled, stats } = props;
  const [expanded, setExpanded] = useState(true);

  return (
    <section id="admin-panel-stats" className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Resumen del sistema</h2>
          <p className="mt-1 text-sm text-gray-600">Métricas globales (si están disponibles).</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Stats</span>
        </div>
      </div>

      {!expanded ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">Sección contraída.</div>
      ) : !enabled ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          No disponible (el endpoint no respondió o devolvió error).
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Usuarios totales" value={stats?.users_total} />
          <Stat label="Admins" value={stats?.users_by_role?.admin} />
          <Stat label="Terapeutas" value={stats?.users_by_role?.therapist} />
          <Stat label="Personal" value={stats?.users_by_role?.personal} />
          <Stat label="Pacientes" value={stats?.users_by_role?.patient} />
        </div>
      )}
    </section>
  );
}

function Stat(props: { label: string; value: number | undefined }) {
  const { label, value } = props;
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{typeof value === 'number' ? value : '—'}</div>
    </div>
  );
}
