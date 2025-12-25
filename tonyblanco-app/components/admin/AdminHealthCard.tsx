'use client';

import { useState } from 'react';
import type { AdminWorkspaceContractV1 } from '../../lib/contracts/adminWorkspace.v1';

export function AdminHealthCard(props: { system: AdminWorkspaceContractV1['system'] }) {
  const { system } = props;
  const [expanded, setExpanded] = useState(true);

  return (
    <section id="admin-panel-health" className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Salud operativa</h2>
          <p className="mt-1 text-sm text-gray-600">Estado derivado de verificaciones admin.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Check</span>
        </div>
      </div>

      {!expanded ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">Sección contraída.</div>
      ) : (
      <div className="mt-4 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">Estado del sistema</div>
          <StatusPill status={system.status} />
        </div>

        <div className="mt-3 space-y-2">
          {system.checks.map((c) => (
            <div key={c.name} className="flex items-start justify-between gap-3 rounded-md bg-gray-50 p-2">
              <div>
                <div className="text-sm font-medium text-gray-900">{c.name}</div>
                {c.detail ? <div className="mt-0.5 text-xs text-gray-600">{c.detail}</div> : null}
              </div>
              <StatusPill status={c.status} />
            </div>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}

function StatusPill(props: { status: 'ok' | 'degraded' | 'unknown' }) {
  const { status } = props;
  const style =
    status === 'ok'
      ? 'bg-green-100 text-green-800'
      : status === 'degraded'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';

  const label = status === 'ok' ? 'OK' : status === 'degraded' ? 'Degradado' : 'Desconocido';

  return <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${style}`}>{label}</span>;
}
