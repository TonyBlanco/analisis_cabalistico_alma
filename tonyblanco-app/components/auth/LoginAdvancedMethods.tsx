'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import {
  requestMagicLink,
  requestOtp,
  verifyOtpLogin,
  verifyOtpPasswordReset,
  passkeyLoginOptions,
  passkeyLoginVerify,
} from '@/lib/api/auth-advanced';
import { KeyRound, Link2, Shield, Sparkles } from 'lucide-react';

export type AuthMethod = 'password' | 'magic' | 'otp' | 'passkey' | 'reset';

type Props = {
  email: string;
  onEmailChange: (value: string) => void;
  method: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
  onAuthSuccess: (token: string, role?: string) => Promise<void>;
  onError: (message: string) => void;
};

const tabClass = (active: boolean) =>
  `rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
    active
      ? 'bg-[var(--ha-acc)] text-[var(--ha-acc-ink)]'
      : 'bg-[var(--ha-bg-2)] text-[var(--ha-ink-2)] hover:text-[var(--ha-ink)]'
  }`;

export function LoginAdvancedMethods({
  email,
  onEmailChange,
  method,
  onMethodChange,
  onAuthSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const inputClass =
    'ha-input w-full rounded-xl border px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:ring-4 focus:ring-[var(--ha-ring)]';

  const switchMethod = (next: AuthMethod) => {
    setInfo(null);
    setOtpSent(false);
    setOtpCode('');
    onMethodChange(next);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      onError('Ingresa tu email.');
      return;
    }
    setLoading(true);
    setInfo(null);
    try {
      await requestMagicLink(email);
      setInfo('Revisa tu bandeja de entrada. El enlace expira en 15 minutos.');
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      onError(response?.message || 'No se pudo enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (purpose: 'login_otp' | 'password_reset') => {
    if (!email.trim()) {
      onError('Ingresa tu email.');
      return;
    }
    setLoading(true);
    setInfo(null);
    try {
      await requestOtp(email, purpose);
      setOtpSent(true);
      setInfo('Te enviamos un código de 6 dígitos. Revisa tu email (y spam).');
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      onError(response?.message || 'No se pudo enviar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtpLogin(email, otpCode);
      await onAuthSuccess(res.token, res.role);
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      onError(response?.message || 'Código inválido o expirado.');
      setLoading(false);
    }
  };

  const handleOtpReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtpPasswordReset(email, otpCode, resetPassword, resetConfirm);
      setInfo('Contraseña actualizada. Ya puedes iniciar sesión con tu nueva clave.');
      switchMethod('password');
      setResetPassword('');
      setResetConfirm('');
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      onError(response?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      onError('Tu navegador no soporta passkeys.');
      return;
    }
    setLoading(true);
    setInfo(null);
    try {
      const { options, challenge } = await passkeyLoginOptions(email.trim() || undefined);
      const credential = await startAuthentication({ optionsJSON: options });
      const res = await passkeyLoginVerify(credential, challenge);
      await onAuthSuccess(res.token, res.role);
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      if ((err as Error)?.name === 'NotAllowedError') {
        onError('Operación cancelada o passkey no disponible.');
      } else {
        onError(response?.message || 'No se pudo iniciar sesión con passkey.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(method === 'password')} onClick={() => switchMethod('password')}>
          Contraseña
        </button>
        <button type="button" className={tabClass(method === 'magic')} onClick={() => switchMethod('magic')}>
          <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> Magic link</span>
        </button>
        <button type="button" className={tabClass(method === 'otp')} onClick={() => switchMethod('otp')}>
          <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Código OTP</span>
        </button>
        <button type="button" className={tabClass(method === 'passkey')} onClick={() => switchMethod('passkey')}>
          <span className="inline-flex items-center gap-1"><KeyRound className="h-3.5 w-3.5" /> Passkey</span>
        </button>
      </div>

      {method === 'magic' && (
        <form onSubmit={handleMagicLink} className="space-y-3 rounded-xl border border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] p-4">
          <p className="text-sm text-[var(--ha-ink-2)]">
            Te enviamos un enlace de un solo uso. Un clic y entras sin contraseña.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[image:var(--ha-grad)] px-4 py-3 text-sm font-bold text-[var(--ha-acc-ink)] disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar magic link'}
          </button>
        </form>
      )}

      {method === 'otp' && (
        <div className="space-y-3 rounded-xl border border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] p-4">
          <p className="text-sm text-[var(--ha-ink-2)]">Código de 6 dígitos válido 10 minutos.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className={inputClass}
          />
          {!otpSent ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOtpRequest('login_otp')}
              className="w-full rounded-xl bg-[image:var(--ha-grad)] px-4 py-3 text-sm font-bold text-[var(--ha-acc-ink)] disabled:opacity-60"
            >
              Enviar código para entrar
            </button>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className={`${inputClass} text-center text-lg tracking-[0.4em]`}
              />
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full rounded-xl bg-[image:var(--ha-grad)] px-4 py-3 text-sm font-bold text-[var(--ha-acc-ink)] disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Entrar con código'}
              </button>
            </form>
          )}
        </div>
      )}

      {method === 'reset' && (
        <form onSubmit={handleOtpReset} className="space-y-3 rounded-xl border border-[rgba(96,165,250,0.35)] bg-[rgba(56,130,246,0.08)] p-4">
          <p className="text-sm font-semibold text-[var(--ha-ink)]">Restablecer contraseña con código OTP</p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email de tu cuenta"
            autoComplete="email"
            className={inputClass}
          />
          {!otpSent ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOtpRequest('password_reset')}
              className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Enviar código al email
            </button>
          ) : (
            <>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Código 6 dígitos"
                className={`${inputClass} text-center tracking-[0.35em]`}
              />
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                className={inputClass}
              />
              <input
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Confirmar contraseña"
                autoComplete="new-password"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Guardar nueva contraseña
              </button>
            </>
          )}
        </form>
      )}

      {method === 'passkey' && (
        <div className="space-y-3 rounded-xl border border-[var(--ha-line-soft)] bg-[var(--ha-bg-2)] p-4">
          <p className="text-sm text-[var(--ha-ink-2)]">
            Usa Face ID, Touch ID o tu llave de seguridad. Regístrala desde tu cuenta una vez dentro.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email (opcional si ya registraste passkey)"
            autoComplete="email"
            className={inputClass}
          />
          <button
            type="button"
            disabled={loading}
            onClick={handlePasskeyLogin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--ha-grad)] px-4 py-3 text-sm font-bold text-[var(--ha-acc-ink)] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Esperando passkey...' : 'Iniciar con passkey'}
          </button>
        </div>
      )}

      {info && (
        <p className="rounded-xl border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)] px-4 py-3 text-sm text-[#4ADE80]">
          {info}
        </p>
      )}
    </div>
  );
}