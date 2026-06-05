'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPersonalTherapistInvitations,
  respondToTherapistInvitation,
  type PersonalTherapistInvitation,
} from '@/lib/patient-api';

export default function TherapistInvitationBanner() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<PersonalTherapistInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getPersonalTherapistInvitations();
      setInvitations(items);
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRespond = async (id: number, action: 'accept' | 'reject') => {
    setActingId(id);
    setError(null);
    try {
      const result = await respondToTherapistInvitation(id, action);
      if (action === 'accept') {
        localStorage.setItem('userRole', 'patient');
        router.push('/dashboard/patient');
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
    } finally {
      setActingId(null);
    }
  };

  if (loading || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">{error}</div>
      )}
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-amber-950">
            Invitación de {inv.therapist.full_name}
            {inv.therapist.profession ? ` · ${inv.therapist.profession}` : ''}
          </p>
          <p className="text-sm text-amber-900 mt-1">
            Quiere añadirte como consultante en su espacio terapéutico. Si aceptas, podrás acceder al panel de
            consultante con ese terapeuta.
          </p>
          {inv.message && (
            <p className="text-sm text-amber-800 mt-2 italic">&ldquo;{inv.message}&rdquo;</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              disabled={actingId === inv.id}
              onClick={() => handleRespond(inv.id, 'accept')}
              className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {actingId === inv.id ? 'Procesando…' : 'Aceptar vinculación'}
            </button>
            <button
              type="button"
              disabled={actingId === inv.id}
              onClick={() => handleRespond(inv.id, 'reject')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}