'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  cancelTherapistInvitation,
  getTherapistSentInvitations,
  type TherapistPatientInvitationItem,
} from '@/lib/patient-api';

export default function TherapistPendingInvitations() {
  const [invitations, setInvitations] = useState<TherapistPatientInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getTherapistSentInvitations('pending');
      setInvitations(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar invitaciones');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await cancelTherapistInvitation(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Cargando invitaciones pendientes…</p>
      </div>
    );
  }

  if (invitations.length === 0 && !error) {
    return null;
  }

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Invitaciones pendientes</h2>
      <p className="text-sm text-gray-600 mb-4">
        Usuarios con cuenta existente (email o Google) que aún no han aceptado la vinculación.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
          {error}
          <button type="button" onClick={load} className="ml-2 underline">
            Reintentar
          </button>
        </div>
      )}

      {invitations.length === 0 ? (
        <p className="text-sm text-gray-500">No hay invitaciones pendientes.</p>
      ) : (
        <ul className="space-y-3">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-200 rounded-md p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{inv.email}</p>
                {inv.display_hint && (
                  <p className="text-sm text-gray-600">{inv.display_hint}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enviada {new Date(inv.created_at).toLocaleString('es-ES')}
                </p>
                {inv.message && (
                  <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{inv.message}&rdquo;</p>
                )}
              </div>
              <button
                type="button"
                disabled={cancellingId === inv.id}
                onClick={() => handleCancel(inv.id)}
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 shrink-0"
              >
                {cancellingId === inv.id ? 'Cancelando…' : 'Cancelar invitación'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}