'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TarotDrawPanel } from '@/components/tarot';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

const API_URL = getApiBaseUrl();

type PatientMeta = { id: number; name?: string | null; user?: number | null };

function TarotPageInner() {
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patient');
  const patientId = patientIdParam && /^\d+$/.test(patientIdParam) ? Number(patientIdParam) : null;
  const [patientMeta, setPatientMeta] = useState<PatientMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!patientId) {
        setPatientMeta(null);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setPatientMeta({ id: patientId, name: null, user: null });
        return;
      }

      try {
        const res = await fetch(`${API_URL}/therapist/patients/${patientId}/`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          if (!cancelled) setPatientMeta({ id: patientId, name: null, user: null });
          return;
        }
        const name = data.full_name || data.legal_full_name || data.name || null;
        const user = typeof data.user === 'number' ? data.user : null;
        if (!cancelled) setPatientMeta({ id: patientId, name, user });
      } catch {
        if (!cancelled) setPatientMeta({ id: patientId, name: null, user: null });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const consultantUserId = patientMeta?.user ? String(patientMeta.user) : null;
  const patientLabel = useMemo(() => {
    if (!patientMeta) return null;
    return patientMeta.name ? `${patientMeta.name} (ID ${patientMeta.id})` : `Consultante ID ${patientMeta.id}`;
  }, [patientMeta]);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workspace simbólico</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">Tarot (SWM v3)</div>
          {patientLabel ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {patientLabel}
              </span>
              <Link
                href={`/dashboard/therapist/patients/${patientMeta?.id}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Volver al consultante
              </Link>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-600">Modo independiente (no_store permitido).</div>
          )}
        </div>

        <TarotDrawPanel consultantId={consultantUserId} />
      </div>
    </div>
  );
}

export default function TarotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6" />}>
      <TarotPageInner />
    </Suspense>
  );
}
