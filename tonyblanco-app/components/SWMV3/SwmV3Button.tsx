"use client";

import { useEffect, useState } from 'react';
import ConsentModal, { type SwmV3ConsentMode } from './ConsentModal';
import ResultPanel from './ResultPanel';
import runMockInterpretation, { type SwmV3Reading } from './MockEngine';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

type ConsentState = {
  mode: SwmV3ConsentMode;
  acceptedAt: string;
  version: string;
};

export type SwmV3SaveStatus =
  | { state: 'idle' }
  | { state: 'not_saved'; mode: SwmV3ConsentMode }
  | { state: 'saving'; mode: SwmV3ConsentMode }
  | { state: 'saved'; mode: SwmV3ConsentMode; id: string }
  | { state: 'failed'; mode: SwmV3ConsentMode };

type Props = {
  consultantId?: string;
};

function isFlagEnabled(): boolean {
  try {
    if (typeof window !== 'undefined' && (window as any).__SWM_V3_ENABLED !== undefined) {
      return Boolean((window as any).__SWM_V3_ENABLED);
    }
    return process.env.NEXT_PUBLIC_SWM_V3_ENABLED === 'true';
  } catch {
    return false;
  }
}

export default function SwmV3Button({ consultantId }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [reading, setReading] = useState<SwmV3Reading | null>(null);
  const [saveStatus, setSaveStatus] = useState<SwmV3SaveStatus>({ state: 'idle' });

  useEffect(() => setEnabled(isFlagEnabled()), []);

  if (!enabled) return null;

  const handleConfirm = (payload: ConsentState) => {
    setConsent(payload);
    setShowModal(false);
  };

  const persistReading = async (payload: {
    consent: ConsentState;
    reading: SwmV3Reading;
    consultantId?: string;
  }) => {
    const { consent, reading } = payload;

    if (consent.mode === 'no_store') {
      setSaveStatus({ state: 'not_saved', mode: consent.mode });
      return;
    }

    setSaveStatus({ state: 'saving', mode: consent.mode });

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/swm-v3/symbolic-readings/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          system_id: 'thoth',
          reading_type: 'educational',
          content: reading,
          consent_mode: consent.mode,
          consultant_id:
            consent.mode === 'store_with_consent' ? payload.consultantId ?? null : null,
          consent: {
            explicit_opt_in: true,
            version: consent.version,
            accepted_at: consent.acceptedAt,
          },
        }),
      });

      if (!response.ok) {
        setSaveStatus({ state: 'failed', mode: consent.mode });
        return;
      }

      const data = (await response.json()) as { id?: string; saved?: boolean };
      if (data?.saved === false) {
        setSaveStatus({ state: 'not_saved', mode: consent.mode });
        return;
      }

      setSaveStatus({ state: 'saved', mode: consent.mode, id: data?.id ?? 'unknown' });
    } catch {
      setSaveStatus({ state: 'failed', mode: consent.mode });
    }
  };

  const handleInterpret = async () => {
    if (!consent) {
      setShowModal(true);
      return;
    }

    const r = runMockInterpretation();
    setReading(r);
    await persistReading({ consent, reading: r, consultantId });
  };

  return (
    <div className="mt-4 px-3">
      <button
        type="button"
        onClick={handleInterpret}
        className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          consent ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {consent ? 'Interpretar tirada (educativo)' : 'Configurar consentimiento'}
      </button>

      <ConsentModal open={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirm} />

      {reading && (
        <ResultPanel
          reading={reading}
          saveStatus={saveStatus}
          onClose={() => {
            setReading(null);
            setSaveStatus({ state: 'idle' });
          }}
        />
      )}
    </div>
  );
}

