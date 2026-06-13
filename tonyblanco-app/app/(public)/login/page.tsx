'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGoogleSection } from '@/components/AuthGoogleSection';
import { login, loginWithGoogle } from '@/lib/api';
import { LoginAdvancedMethods, type AuthMethod } from '@/components/auth/LoginAdvancedMethods';
import { clearAuthState } from '@/lib/auth-state';
import { completeAuthFromToken } from '@/lib/finishAuthSession';
import { TurnstileField, type TurnstileFieldHandle } from '@/components/TurnstileField';
import { turnstileApiErrorMessage } from '@/lib/turnstile-messages';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Sparkles, Heart, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/marketing/brand';

type ErrorType =
  | 'user_not_found'
  | 'invalid_password'
  | 'account_inactive'
  | 'validation'
  | 'turnstile'
  | 'network'
  | 'other';

interface LoginError {
  type: ErrorType;
  message: string;
  email?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const [googleSignInKey, setGoogleSignInKey] = useState(0);

  // ========== CRITICAL: Limpiar token al entrar a login ==========
  useEffect(() => {
    clearAuthState();
    setGoogleSignInKey((k) => k + 1);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validación básica
    if (!email.trim()) {
      setError({ type: 'validation', message: 'Ingresa tu email o nombre de usuario' });
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError({ type: 'validation', message: 'Ingresa tu contraseña' });
      setLoading(false);
      return;
    }
    
    try {
      const ts = turnstileRef.current;
      if (ts?.isEnforced() && !ts.getToken()) {
        setError({
          type: 'turnstile',
          message: 'Completa la verificación de seguridad antes de continuar.',
        });
        setLoading(false);
        return;
      }

      const loginResponse = await login(email.trim(), password, ts?.getToken() ?? undefined);
      await finishLoginWithToken(loginResponse.token, loginResponse.role);
    } catch (err: any) {
      console.error('Login error:', err);
      console.log('Error details:', { 
        status: err?.status, 
        response: err?.response,
        message: err?.message 
      });
      setLoading(false);
      
      // Parsear error del backend
      const response = err?.response || {};
      const errorCode = response.error || '';
      const errorMessage = response.message || err.message || 'Error al iniciar sesión';
      
      console.log('Parsed error:', { errorCode, errorMessage });
      
      // Determinar tipo de error
      let errorType: ErrorType = 'other';
      let displayMessage = errorMessage;
      
      if (err.status === 0 || err.message?.includes('conectar')) {
        errorType = 'network';
        displayMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (errorCode === 'user_not_found') {
        errorType = 'user_not_found';
        displayMessage = 'No existe una cuenta con ese email o usuario';
      } else if (errorCode === 'invalid_password') {
        errorType = 'invalid_password';
        displayMessage = 'La contraseña es incorrecta';
        if (response.email || email.includes('@')) {
          setEmail(response.email || email);
        }
        setAuthMethod('reset');
      } else if (errorCode === 'account_inactive') {
        errorType = 'account_inactive';
        displayMessage = 'Esta cuenta ha sido desactivada. Contacta soporte.';
      } else if (errorCode === 'validation') {
        errorType = 'validation';
      } else if (
        errorCode === 'turnstile_required' ||
        errorCode === 'turnstile_invalid' ||
        errorCode === 'turnstile_verify_failed'
      ) {
        errorType = 'turnstile';
        displayMessage = turnstileApiErrorMessage(errorCode, displayMessage);
        turnstileRef.current?.reset();
      }

      setError({
        type: errorType,
        message: displayMessage,
        email: response.email
      });
    }
  };

  const finishLoginWithToken = async (token: string, loginRole?: string) => {
    const path = await completeAuthFromToken(token, loginRole);
    router.push(path);
  };

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(credential);
      const role = res.user?.user_type ?? res.role;
      await finishLoginWithToken(res.token, role);
    } catch (err: any) {
      const response = err?.response || {};
      const msg =
        response.message ||
        (response.error === 'google_auth_disabled'
          ? 'Inicio con Google aún no está configurado en el servidor'
          : 'No se pudo iniciar sesión con Google');
      setError({ type: 'other', message: msg });
      setLoading(false);
    }
  };

  const handleAdvancedAuthSuccess = async (token: string, role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const path = await completeAuthFromToken(token, role);
      router.push(path);
    } catch {
      setError({ type: 'other', message: 'No se pudo completar el inicio de sesión.' });
      setLoading(false);
    }
  };

  const getErrorStyles = (type: ErrorType) => {
    switch (type) {
      case 'user_not_found':
        return 'bg-[rgba(251,191,36,0.10)] border-[rgba(251,191,36,0.40)] text-[#F3C14B]';
      case 'invalid_password':
        return 'bg-[rgba(251,146,60,0.10)] border-[rgba(251,146,60,0.40)] text-[#FB923C]';
      case 'account_inactive':
        return 'bg-[rgba(248,113,113,0.10)] border-[rgba(248,113,113,0.40)] text-[#F87171]';
      case 'network':
        return 'bg-white/[0.04] border-[var(--ha-line-soft)] text-[var(--ha-ink-2)]';
      case 'turnstile':
        return 'bg-[rgba(56,130,246,0.08)] border-[rgba(96,165,250,0.35)] text-[#93C5FD]';
      default:
        return 'bg-[rgba(248,113,113,0.10)] border-[rgba(248,113,113,0.40)] text-[#F87171]';
    }
  };

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case 'user_not_found':
        return <User className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'invalid_password':
        return <Lock className="w-5 h-5 text-orange-500 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    }
  };

  const inputClassName =
    'ha-input w-full rounded-xl border px-4 py-3 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,background-color] focus:outline-none focus:ring-4 focus:ring-[var(--ha-ring)]';

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between gap-10 overflow-hidden p-12 lg:flex"
        style={{ background: 'var(--ha-panel-bg)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-9">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo variant="on-dark" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver al landing
            </Link>
          </div>
          <h1 className="max-w-[420px] font-[family-name:var(--font-cormorant)] text-[40px] font-semibold leading-[1.12] text-balance text-white">
            El espacio de trabajo de tu práctica
          </h1>
        </div>

        <div className="relative flex max-w-[420px] flex-col gap-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <h2 className="mb-1 text-[15px] font-bold text-white">Análisis simbólico profundo</h2>
              <p className="text-[13.5px] leading-[1.55] text-white/65">
                Informes completos con Árbol de la Vida, números maestros y patrones, generados en minutos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Heart className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <h2 className="mb-1 text-[15px] font-bold text-white">Acompañamiento con estructura</h2>
              <p className="text-[13.5px] leading-[1.55] text-white/65">
                Fichas, historial de sesiones y seguimiento de la evolución de cada persona, en un solo lugar.
              </p>
            </div>
          </div>
          <figure className="flex flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/[0.07] p-5">
            <blockquote className="font-[family-name:var(--font-cormorant)] text-[19px] italic leading-[1.4] text-white">
              &ldquo;Preparo cada sesión en minutos, no en horas.&rdquo;
            </blockquote>
            <figcaption className="text-[12.5px] text-white/60">
              Laura G. · Terapeuta gestalt — testimonio de ejemplo
            </figcaption>
          </figure>
        </div>

        <p className="relative text-[12.5px] text-white/45">
          © {new Date().getFullYear()} Tony Blanco. Todos los derechos reservados.
        </p>
      </div>

      <div className="flex items-center justify-center bg-[var(--ha-bg)] p-8 sm:p-10 lg:p-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex flex-col gap-3 lg:hidden">
            <BrandLogo />
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--ha-acc)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver al landing
            </Link>
          </div>

          <div className="rounded-[20px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] p-9 shadow-[var(--ha-shadow)]">
            <div className="mb-5 text-center">
              <h2 className="font-[family-name:var(--font-cormorant)] text-[30px] font-semibold text-[var(--ha-ink)]">
                Bienvenido
              </h2>
              <p className="mt-1 text-sm text-[var(--ha-ink-3)]">Inicia sesión en tu cuenta</p>
            </div>

            <LoginAdvancedMethods
              email={email}
              onEmailChange={setEmail}
              method={authMethod}
              onMethodChange={setAuthMethod}
              onAuthSuccess={handleAdvancedAuthSuccess}
              onError={(message) => setError({ type: 'other', message })}
            />

            {authMethod === 'password' && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--ha-ink-2)]"
                >
                  Email o usuario
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-[var(--ha-ink-3)]" aria-hidden />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="username"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--ha-ink-2)]"
                >
                  Contraseña
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputClassName} pl-10 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--ha-ink-3)] transition-colors hover:text-[var(--ha-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${getErrorStyles(error.type)}`}
                >
                  {getErrorIcon(error.type)}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{error.message}</p>
                    {error.type === 'user_not_found' && (
                      <div className="mt-2 space-y-2 text-xs opacity-90">
                        <p>Verifica que el email o usuario sea correcto.</p>
                        <p>
                          Si olvidaste tu usuario, prueba con el email con el que te registraste o usa
                          recuperación de contraseña.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAuthMethod('reset')}
                          className="font-semibold text-[var(--ha-acc)] underline-offset-2 hover:underline"
                        >
                          Recuperar acceso con código OTP
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <TurnstileField
                ref={turnstileRef}
                theme="dark"
                onReadyChange={setTurnstileReady}
                onError={(msg) => setError({ type: 'turnstile', message: msg })}
              />

              <button
                type="submit"
                disabled={loading || (Boolean(turnstileRef.current?.isEnforced()) && !turnstileReady)}
                className="w-full rounded-xl border-0 bg-[image:var(--ha-grad)] px-4 py-3.5 text-[15px] font-bold text-[var(--ha-acc-ink)] shadow-[0_8px_24px_var(--ha-btn-glow)] transition-[transform,opacity] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
            )}

            {error && authMethod !== 'password' && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${getErrorStyles(error.type)}`}
              >
                {getErrorIcon(error.type)}
                <p className="text-sm font-semibold">{error.message}</p>
              </div>
            )}

            <AuthGoogleSection
              googleKey={googleSignInKey}
              disabled={loading}
              tone="marketing"
              onCredential={handleGoogleCredential}
              onError={(msg) => setError({ type: 'other', message: msg })}
            />

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMethod((m) => (m === 'reset' ? 'password' : 'reset'))}
                className="text-[13.5px] font-medium text-[var(--ha-acc)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="my-8 flex items-center gap-3.5">
              <span className="h-px flex-1 bg-[var(--ha-line-soft)]" aria-hidden />
              <span className="text-[12.5px] text-[var(--ha-ink-3)]">¿No tienes cuenta?</span>
              <span className="h-px flex-1 bg-[var(--ha-line-soft)]" aria-hidden />
            </div>

            <div className="space-y-2.5">
              <Link
                href="/register/therapist"
                className="flex w-full items-center justify-center rounded-xl border border-[var(--ha-line)] bg-[var(--ha-bg-2)] px-4 py-3 text-sm font-semibold text-[var(--ha-ink)] transition-colors hover:border-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
              >
                Crear cuenta profesional
              </Link>
              <Link
                href="/register/personal"
                className="flex w-full items-center justify-center rounded-xl border border-[var(--ha-line-soft)] px-4 py-3 text-sm font-semibold text-[var(--ha-ink-2)] transition-colors hover:border-[var(--ha-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)]"
              >
                Crear cuenta personal
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[12.5px] text-[var(--ha-ink-3)]">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-[var(--ha-acc)] hover:underline">
              términos
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-[var(--ha-acc)] hover:underline">
              privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
