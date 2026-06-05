'use client';

import { useEffect, useState } from 'react';
import {
  lookupPatientByEmail,
  inviteExistingPatient,
  type PatientEmailLookupResult,
} from '@/lib/patient-api';

interface LinkExistingPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkExistingPatientModal({
  open,
  onClose,
  onSuccess,
}: LinkExistingPatientModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [lookup, setLookup] = useState<PatientEmailLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setMessage('');
      setBirthDate('');
      setLookup(null);
      setError(null);
      setSent(false);
    }
  }, [open]);

  const handleLookup = async () => {
    setError(null);
    setLookup(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Indica un email válido.');
      return;
    }
    setLookupLoading(true);
    try {
      const result = await lookupPatientByEmail(email.trim());
      setLookup(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleInvite = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: { email: string; message?: string; birth_date?: string } = {
        email: email.trim(),
        message: message.trim() || undefined,
      };
      if (birthDate) {
        payload.birth_date = birthDate;
      }
      await inviteExistingPatient(payload);
      setSent(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const needsBirthDate = lookup?.status === 'found_personal' && !lookup.has_birth_date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vincular consultante existente</h2>
              <p className="text-sm text-gray-600 mt-1">
                Para quien ya tiene cuenta (email o Google). Deberá aceptar la invitación.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
              Invitación enviada. Cuando el usuario la acepte desde su cuenta, aparecerá en tu lista.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-1">Email del consultante</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLookup(null);
                  }}
                  placeholder="ejemplo@gmail.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  {lookupLoading ? 'Buscando…' : 'Buscar'}
                </button>
              </div>

              {lookup && (
                <div
                  className={`mb-4 rounded-md p-4 text-sm border ${
                    lookup.can_invite
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-medium">{lookup.message}</p>
                  {lookup.display_hint && (
                    <p className="mt-1 text-xs opacity-80">Referencia: {lookup.display_hint}</p>
                  )}
                  {lookup.uses_google && lookup.can_invite && (
                    <p className="mt-2 text-xs">Cuenta con inicio de sesión Google.</p>
                  )}
                </div>
              )}

              {lookup?.can_invite && (
                <div className="space-y-4">
                  {needsBirthDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de nacimiento (requerida en su ficha)
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje opcional
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Te invito a vincularte como consultante en mi espacio terapéutico."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleInvite}
                      disabled={loading || (needsBirthDate && !birthDate)}
                      className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      {loading ? 'Enviando…' : 'Enviar invitación'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}