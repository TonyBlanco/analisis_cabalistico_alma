'use client';

import type { AdminSystemStatus } from '../../lib/contracts/adminWorkspace.v1';

export function AdminHeader(props: { status: AdminSystemStatus; lastUpdated: string | null }) {
  const { status, lastUpdated } = props;

  const badge =
    status === 'ok'
      ? { label: 'Sistema OK', className: 'bg-green-100 text-green-800' }
      : status === 'degraded'
        ? { label: 'Degradado', className: 'bg-yellow-100 text-yellow-800' }
        : { label: 'Conectado', className: 'bg-gray-100 text-gray-800' };

  return (
    <div className="sticky top-0 z-20 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Administración</h1>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
        </div>
        <div className="text-xs text-gray-600">
          Última actualización:{' '}
          <span className="font-medium text-gray-900">{lastUpdated ? lastUpdated : '—'}</span>
        </div>
      </div>
    </div>
  );
}
