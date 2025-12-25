'use client';

import type { AdminUserRow } from '@/lib/contracts/adminWorkspace.v2_1';

function Badge(props: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-800">
      {props.label}
    </span>
  );
}

export function AdminProUserDrawer(props: {
  open: boolean;
  user: AdminUserRow | null;
  onClose: () => void;
}) {
  const { open, user, onClose } = props;
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Detalle usuario</div>
            <div className="truncate text-sm font-semibold text-slate-900">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-900 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 p-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">ID</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.id}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Estado</div>
              <div className="mt-1">{user.is_active ? <Badge label="Activo" /> : <Badge label="Inactivo" />}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Usuario</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.username ?? '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Rol</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.role}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Creado</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.created_at ?? '—'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Último login</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.last_login ?? '—'}</div>
            </div>
          </div>

          {user.flags?.length ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Flags</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {user.flags.map((f) => (
                  <Badge key={f} label={f} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Este panel es read-only y no hace llamadas adicionales. Las acciones se ejecutan desde la tabla.
          </div>
        </div>
      </div>
    </div>
  );
}
