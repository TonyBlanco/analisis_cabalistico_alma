'use client';

import { useRouter } from 'next/navigation';
import type { AdminSystemStatus } from '@/lib/contracts/adminWorkspace.v2_1';
import ProfileMenu from '@/components/ProfileMenu';
import { clearAuthState } from '@/lib/auth-state';

function statusBadge(status: AdminSystemStatus) {
  if (status === 'ok') return { label: 'Sistema OK', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (status === 'degraded') return { label: 'Degradado', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { label: 'Desconocido', className: 'bg-slate-50 text-slate-500 border-slate-300' };
}

export function AdminProHeader(props: {
  title?: string;
  status: AdminSystemStatus;
  lastUpdated: string | null;
  onRefresh: () => void;
  refreshing: boolean;
  chips?: Array<{ label: string; status: AdminSystemStatus }>;
}) {
  const router = useRouter();
  const { title = 'Administración', status, lastUpdated, onRefresh, refreshing, chips } = props;
  const badge = statusBadge(status);

  const handleLogout = () => {
    clearAuthState();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-0 w-full">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge.className}`}>
            {badge.label}
          </span>
          {chips && chips.length ? (
            <div className="hidden items-center gap-1 sm:flex">
              {chips.map((c) => {
                const b = statusBadge(c.status);
                return (
                  <span
                    key={c.label}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${b.className}`}
                  >
                    {c.label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-[11px] text-slate-600 sm:block">
            Última actualización: <span className="font-medium text-slate-900">{lastUpdated ?? '—'}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? 'Refrescando…' : 'Refrescar'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
