'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, setAuthToken, requestPasswordReset } from '@/lib/api';
import { clearAuthState } from '@/lib/auth-state';
import { fetchSession } from '@/lib/session';

interface LoginError {
  error?: string;
  message?: string;
  email?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'user_not_found' | 'invalid_password' | 'validation' | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorType(null);
    setShowPasswordReset(false);
    setResetMessage(null);

    try {
      // 1) Reset cualquier estado previo (tokens, storage, cookies)
      clearAuthState();

      // 2) Login contra backend usando solo las credenciales actuales
      const response = await apiLogin(username, password);

      if (!response?.token) {
        throw new Error('Respuesta de login inválida: falta token');
      }

      // 3) Guardar SOLO el nuevo token en localStorage
      setAuthToken(response.token);

      // 4) Forzar fetch fresco de /api/me para poblar sesión y rol
      const session = await fetchSession();
      if (!session.isAuthenticated || !session.user) {
        throw new Error('No se pudo obtener la sesión del usuario después de iniciar sesión');
      }

      // 5) Redirigir al root del dashboard; allí se hará redirect por rol usando /api/me
      router.push('/dashboard');
    } catch (err: any) {
      // Manejar errores específicos del backend
      const errorData: LoginError = err.errorData || {};
      
      if (errorData.error === 'user_not_found') {
        setErrorType('user_not_found');
        setError(errorData.message || 'El usuario o email no está registrado.');
      } else if (errorData.error === 'invalid_password') {
        setErrorType('invalid_password');
        setError(errorData.message || 'La contraseña es incorrecta.');
        setResetEmail(errorData.email || username);
        setShowPasswordReset(true);
      } else if (errorData.error === 'validation') {
        setErrorType('validation');
        setError(errorData.message || 'Por favor completa todos los campos.');
      } else {
        // Error genérico o de red
        const message = errorData.message || err.message || 'Error al iniciar sesión';
        setError(message);
      }
      
      console.error('Login error:', err);
      // En caso de error, asegurarse de que no quede estado parcial
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);

    try {
      const response = await requestPasswordReset(resetEmail);
      setResetMessage(response.message || 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al solicitar cambio de contraseña';
      setResetMessage(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Iniciar Sesión
        </h1>
        {error && (
          <div className={`mb-4 rounded-md p-3 ${
            errorType === 'user_not_found' 
              ? 'bg-yellow-50 border border-yellow-200' 
              : errorType === 'invalid_password'
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              errorType === 'user_not_found' 
                ? 'text-yellow-800' 
                : errorType === 'invalid_password'
                ? 'text-orange-800'
                : 'text-red-800'
            }`}>{error}</p>
          </div>
        )}
        
        {showPasswordReset && errorType === 'invalid_password' && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              ¿Olvidaste tu contraseña?
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-2 bg-white border border-blue-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
            {resetMessage && (
              <p className={`text-sm mt-3 ${
                resetMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}>
                {resetMessage}
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario o email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !loading ? 'var(--accent-color)' : undefined,
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Acceder a la plataforma'}
          </button>
        </form>

        {/* Registration CTAs */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">
            ¿No tienes cuenta?
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/register/therapist')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Crear cuenta profesional
            </button>
            <button
              type="button"
              onClick={() => router.push('/register/personal')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Crear cuenta personal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
