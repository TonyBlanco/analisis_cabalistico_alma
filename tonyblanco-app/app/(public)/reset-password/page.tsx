'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from '@/lib/api';
import { BrandLogo } from '@/components/marketing/brand';
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClassName =
    'ha-input w-full rounded-xl border px-4 py-3 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,background-color] focus:outline-none focus:ring-4 focus:ring-[var(--ha-ring)]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!uid || !token) {
      setError('El enlace de recuperación no es válido. Solicita uno nuevo desde el login.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Ingresa y confirma tu nueva contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset({ uid, token, password, confirm_password: confirmPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const response = (err as { response?: { message?: string } })?.response;
      setError(response?.message || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ha-bg)] p-8">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex flex-col gap-3">
          <BrandLogo />
          <Link
            href="/login"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--ha-acc)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al login
          </Link>
        </div>

        <div className="rounded-[20px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-9 shadow-[var(--ha-shadow)]">
          <div className="mb-5 text-center">
            <h1 className="font-[family-name:var(--font-cormorant)] text-[30px] font-semibold text-[var(--ha-ink)]">
              Nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-[var(--ha-ink-3)]">
              Crea una contraseña segura para tu cuenta
            </p>
          </div>

          {success ? (
            <div className="rounded-xl border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)] px-4 py-3 text-sm text-[#4ADE80]">
              Contraseña actualizada. Redirigiendo al login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[rgba(248,113,113,0.40)] bg-[rgba(248,113,113,0.10)] px-4 py-3 text-[#F87171]"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--ha-ink-2)]">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-[var(--ha-ink-3)]" aria-hidden />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`${inputClassName} pl-10 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ha-ink-3)]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--ha-ink-2)]">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-[var(--ha-ink-3)]" aria-hidden />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-0 bg-[image:var(--ha-grad)] px-4 py-3.5 text-[15px] font-bold text-[var(--ha-acc-ink)] shadow-[0_8px_24px_var(--ha-btn-glow)] transition-[transform,opacity] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--ha-bg)]">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}