'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, loginWithGoogle, getCurrentUser } from '@/lib/api';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { setAuthToken, setUserRole, type UserRole } from '@/lib/auth';
import { clearAuthState } from '@/lib/auth-state';
import { getUserRole } from '@/lib/getUserRole';
import { TurnstileField, type TurnstileFieldHandle } from '@/components/TurnstileField';
import { turnstileApiErrorMessage } from '@/lib/turnstile-messages';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Sparkles, Heart } from 'lucide-react';

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
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
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
    setShowResetForm(false);
    
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
      if (ts?.isEnforced() && !ts.isReady()) {
        setError({
          type: 'turnstile',
          message: 'La verificación de seguridad aún está cargando. Espera un momento.',
        });
        setLoading(false);
        return;
      }
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
        setResetEmail(response.email || email);
        setShowResetForm(true);
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
    setAuthToken(token);
    if (
      loginRole === 'therapist' ||
      loginRole === 'personal' ||
      loginRole === 'patient'
    ) {
      setUserRole(loginRole as UserRole);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
    }
    const role = await getUserRole();
    switch (role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'therapist':
        router.push('/dashboard/therapist');
        break;
      case 'personal':
        router.push('/dashboard/personal');
        break;
      case 'patient':
        router.push('/dashboard/patient');
        break;
      default:
        router.push('/dashboard');
    }
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

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) return;
    
    setResetLoading(true);
    try {
      // TODO: Implementar endpoint de reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResetSent(true);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const getErrorStyles = (type: ErrorType) => {
    switch (type) {
      case 'user_not_found':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'invalid_password':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'account_inactive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'network':
        return 'bg-gray-50 border-gray-300 text-gray-700';
      case 'turnstile':
        return 'bg-sky-50 border-sky-200 text-sky-800';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Holistica Aplicada
          </h1>
          <p className="text-violet-200 text-lg">
            Bienestar integral y desarrollo humano
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Analisis Holistico Personal</h3>
              <p className="text-violet-200 text-sm">
                Explora patrones simbolicos y energias de tu nombre y fecha de nacimiento
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Acompanamiento Holistico</h3>
              <p className="text-violet-200 text-sm">
                Conecta con acompanantes especializados en bienestar integral y desarrollo humano
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-violet-300 text-sm">
          © 2024 Tony Blanco. Todos los derechos reservados.
        </p>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Holistica Aplicada</h1>
            <p className="text-gray-600">Bienestar integral y desarrollo humano</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
              <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Username Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email o usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${getErrorStyles(error.type)}`}>
                  {getErrorIcon(error.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error.message}</p>
                    {error.type === 'user_not_found' && (
                      <p className="text-xs mt-1 opacity-80">
                        Verifica que el email o usuario sea correcto
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Password Reset Form */}
              {showResetForm && !resetSent && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-blue-800 font-medium">
                    ¿Olvidaste tu contraseña?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Email para recuperación"
                      className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetLoading || !resetEmail.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? '...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              )}
              
              {resetSent && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                  ✓ Si el email existe, recibirás un enlace para restablecer tu contraseña.
                </div>
              )}

              <TurnstileField
                ref={turnstileRef}
                theme="light"
                onError={(msg) => setError({ type: 'turnstile', message: msg })}
              />
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">o continúa con</span>
              </div>
            </div>

            <GoogleSignInButton
              key={googleSignInKey}
              disabled={loading}
              onCredential={handleGoogleCredential}
              onError={(msg) => setError({ type: 'other', message: msg })}
            />
            
            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(!showResetForm);
                  setResetSent(false);
                }}
                className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>
            
            {/* Registration Links */}
            <div className="space-y-3">
              <Link
                href="/register/therapist"
                className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Crear cuenta profesional
              </Link>
              <Link
                href="/register/personal"
                className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Crear cuenta personal
              </Link>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="text-violet-600 hover:underline">términos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="text-violet-600 hover:underline">privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
