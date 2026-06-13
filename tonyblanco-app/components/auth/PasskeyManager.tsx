'use client';

import { useCallback, useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import {
  deletePasskey,
  listPasskeys,
  passkeyRegisterOptions,
  passkeyRegisterVerify,
  type PasskeySummary,
} from '@/lib/api/auth-advanced';
import { KeyRound, Trash2 } from 'lucide-react';

export function PasskeyManager() {
  const [items, setItems] = useState<PasskeySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPasskeys();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRegister = async () => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError('Tu navegador no soporta passkeys.');
      return;
    }
    setRegistering(true);
    setError(null);
    setMessage(null);
    try {
      const { options, challenge } = await passkeyRegisterOptions();
      const credential = await startRegistration({ optionsJSON: options });
      const deviceName =
        typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile')
          ? 'Móvil'
          : 'Este dispositivo';
      const res = await passkeyRegisterVerify(credential, challenge, deviceName);
      setMessage(res.message);
      await refresh();
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      setError(response?.message || 'No se pudo registrar la passkey.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await deletePasskey(id);
      await refresh();
      setMessage('Passkey eliminada.');
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      setError(response?.message || 'No se pudo eliminar la passkey.');
    }
  };

  return (
    <section className="rounded-xl border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-[var(--ha-acc)]" />
        <h3 className="text-base font-semibold text-[var(--ha-ink)]">Passkeys</h3>
      </div>
      <p className="mb-4 text-sm text-[var(--ha-ink-3)]">
        Inicia sesión con Face ID, Touch ID o llave de seguridad sin contraseña.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--ha-ink-3)]">Cargando...</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {items.length === 0 ? (
            <li className="text-sm text-[var(--ha-ink-3)]">Aún no tienes passkeys registradas.</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[var(--ha-line-soft)] px-3 py-2 text-sm"
              >
                <span>{item.device_name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-[var(--ha-ink-3)] hover:text-[#F87171]"
                  aria-label={`Eliminar ${item.device_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <button
        type="button"
        disabled={registering}
        onClick={handleRegister}
        className="rounded-lg bg-[image:var(--ha-grad)] px-4 py-2 text-sm font-semibold text-[var(--ha-acc-ink)] disabled:opacity-60"
      >
        {registering ? 'Registrando...' : 'Añadir passkey en este dispositivo'}
      </button>

      {message && <p className="mt-3 text-sm text-[#4ADE80]">{message}</p>}
      {error && <p className="mt-3 text-sm text-[#F87171]">{error}</p>}
    </section>
  );
}