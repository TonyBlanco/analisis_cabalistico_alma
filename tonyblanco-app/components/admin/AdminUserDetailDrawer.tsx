'use client';

import { useEffect, useState } from 'react';
import type { AdminRole, AdminWorkspaceContractV1 } from '../../lib/contracts/adminWorkspace.v1';

type UserItem = NonNullable<AdminWorkspaceContractV1['users']>['items'][number];

export function AdminUserDetailDrawer(props: {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
  onSetActive: (id: number, nextActive: boolean) => Promise<void>;
  onUpdateEmail: (id: number, nextEmail: string) => Promise<void>;
  onSetRole: (id: number, role: AdminRole) => Promise<void>;
  onDeleteUser: (id: number) => Promise<void>;
  busy?: boolean;
  error?: string | null;
}) {
  const { open, user, onClose, onSetActive, onUpdateEmail, onSetRole, onDeleteUser, busy, error } = props;

  const [emailDraft, setEmailDraft] = useState('');
  useEffect(() => {
    if (user?.email) setEmailDraft(user.email);
  }, [user?.email]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Detalle de usuario</div>
            <div className="text-xs text-gray-600">ID: {user.id}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 p-4">
          {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <Field label="Email" value={user.email} />
          <Field label="Username" value={user.username || '—'} />
          <Field label="Rol" value={user.role || '—'} />
          <Field label="Activo" value={user.is_active === null ? '—' : user.is_active ? 'Sí' : 'No'} />
          <Field label="Creado" value={user.created_at || '—'} />

          <div className="rounded-md border p-3">
            <div className="text-sm font-medium text-gray-900">Acciones</div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-gray-600">Actualizar email</div>
                <div className="mt-1 flex gap-2">
                  <input
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    disabled={!!busy}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="email@dominio.com"
                  />
                  <button
                    type="button"
                    disabled={!!busy || !emailDraft.trim() || emailDraft.trim() === user.email}
                    onClick={() => onUpdateEmail(user.id, emailDraft.trim())}
                    className="shrink-0 rounded-md border px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => onSetActive(user.id, true)}
                  className="rounded-md border px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                >
                  Activar
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => onSetActive(user.id, false)}
                  className="rounded-md border px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                >
                  Desactivar
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => onDeleteUser(user.id)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Eliminar usuario
                </button>
              </div>

              <div>
                <div className="text-xs text-gray-600">Cambiar rol</div>
                <select
                  disabled={!!busy}
                  defaultValue={user.role || ''}
                  onChange={(e) => {
                    const next = e.target.value as AdminRole;
                    if (next) onSetRole(user.id, next);
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Selecciona…
                  </option>
                  <option value="admin">admin</option>
                  <option value="therapist">therapist</option>
                  <option value="personal">personal</option>
                  <option value="patient">patient</option>
                </select>
                <div className="mt-1 text-xs text-gray-500">Si el backend no lo permite, se mostrará error controlado.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-600">{props.label}</div>
      <div className="mt-0.5 text-sm text-gray-900">{props.value}</div>
    </div>
  );
}
