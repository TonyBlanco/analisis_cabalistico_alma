'use client';

import type { AdminSystemStatus } from '@/lib/contracts/adminWorkspace.v2';

function statusBadge(status: AdminSystemStatus) {
  if (status === 'ok') return { label: 'Sistema OK', className: 'border-green-200 bg-green-50 text-green-800' };
  if (status === 'degraded') return { label: 'Degradado', className: 'border-yellow-200 bg-yellow-50 text-yellow-800' };
  return { label: 'Desconocido', className: 'border-gray-200 bg-gray-50 text-gray-800' };
}

export function AdminProHeader(props: {
  title?: string;
  status: AdminSystemStatus;
  lastUpdated: string | null;
  onRefresh: () => void;
  refreshing: boolean;
  chips?: Array<{ label: string; status: AdminSystemStatus }>;
}) {
  const { title = 'Administración', status, lastUpdated, onRefresh, refreshing, chips } = props;
  const badge = statusBadge(status);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{title}</h1>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
            {badge.label}
          </span>
          {chips && chips.length ? (
            <div className="hidden items-center gap-1 sm:flex">
              {chips.map((c) => {
                const b = statusBadge(c.status);
                return (
                  <span
                    key={c.label}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.className}`}
                  >
                    {c.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-[11px] text-gray-600 sm:block">
            Última actualización: <span className="font-medium text-gray-900">{lastUpdated ?? '—'}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? 'Refrescando…' : 'Refrescar'}
          </button>
        </div>
      </div>
    </header>
  );
}
