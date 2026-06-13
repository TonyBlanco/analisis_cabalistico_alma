'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import {
  getPatientFederationConsent,
  setPatientFederationConsent,
  type FederationConsentState,
} from '@lib/api/federation-consent';

export default function PatientFederationConsentCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FederationConsentState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientFederationConsent();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar tu preferencia');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async () => {
    if (!state || state.patient_id == null) return;
    setSaving(true);
    setError(null);
    try {
      const next = !state.consent_federation;
      const updated = await setPatientFederationConsent(next);
      setState(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu elección');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500">Cargando preferencias de lectura compartida…</p>
      </div>
    );
  }

  if (!state?.patient_id) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <p className="text-sm text-amber-800">
          Tu cuenta aún no está vinculada a una ficha de consultante. Cuando tu terapeuta complete
          la vinculación, podrás autorizar aquí la lectura federada de tus datos.
        </p>
      </div>
    );
  }

  const enabled = state.consent_federation;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lectura compartida con tu terapeuta</h2>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            Si lo autorizas, tu terapeuta podrá ver una síntesis unificada de tus exploraciones y
            avances (sin detalles reservados de cada sesión). Puedes revocar esta autorización cuando
            quieras desde esta misma pantalla.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            disabled={saving}
            onChange={handleToggle}
            className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm font-medium text-gray-900">
            Autorizo la lectura federada de mis datos para mi terapeuta
          </span>
        </label>

        {enabled ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Activo
              {state.consent_federation_date
                ? ` desde ${new Date(state.consent_federation_date).toLocaleDateString('es-ES')}`
                : ''}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Sin autorizar</span>
        )}
      </div>
    </div>
  );
}