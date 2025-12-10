'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken, setAuthToken, checkMembership } from '@/lib/auth';
import { AlertCircle, Mail } from 'lucide-react';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = getAuthToken();
    if (token) router.replace('/dashboard');

    // Check for registration success message
    const registered = searchParams.get('registered');
    if (registered === 'therapist') {
      setSuccessMessage('¡Registro exitoso! Por favor inicia sesión con tus credenciales.');
    } else if (registered === 'personal') {
      setSuccessMessage('¡Bienvenido! Por favor inicia sesión para comenzar tu camino.');
    }
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('🔍 Intentando login en:', `${API_BASE_URL}/login/`);
      console.log('📝 Usuario:', username);
      
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('📡 Respuesta HTTP:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Error del servidor:', errorData);
        
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        // Mostrar mensaje específico del servidor si existe
        let errorMessage = errorData.detail || errorData.error || 'Credenciales incorrectas';
        
        if (res.status === 400) {
          errorMessage = `❌ ${errorMessage}. Verifica tu usuario y contraseña.`;
        } else if (res.status === 401) {
          errorMessage = '❌ Usuario o contraseña incorrectos.';
        } else if (res.status === 403) {
          errorMessage = '❌ Acceso denegado. Contacta al administrador.';
        } else if (res.status === 500) {
          errorMessage = '❌ Error del servidor. Intenta de nuevo en unos momentos.';
        } else if (res.status === 0 || res.status >= 500) {
          errorMessage = '❌ No se puede conectar al servidor. Verifica tu conexión.';
        }
        
        if (newFailedAttempts >= 3) {
          setError(`${errorMessage}\n\nHas intentado ${newFailedAttempts} veces.`);
          setShowPasswordRecovery(true);
        } else {
          setError(`${errorMessage}\n\nIntento ${newFailedAttempts} de 3.`);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('✅ Login exitoso, token recibido');
      const token = data.token;

      setAuthToken(token);

      // Verificar membresía para dirigir al tablero correcto sin parpadeos
      const membership = await checkMembership(token);

      if (!membership || !membership.can_access_dashboard) {
        router.replace('/membership-expired');
        return;
      }

      if (membership.user_type === 'therapist') {
        router.replace('/dashboard/therapist');
      } else if (membership.user_type === 'personal') {
        router.replace('/dashboard/personal');
      } else {
        router.replace('/dashboard');
      }
      
    } catch (err) {
      console.error('🚨 Error en handleLogin:', err);
      if (!error) {
        setError('❌ Error inesperado. Verifica tu conexión y vuelve a intentar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage('');
    setIsRecovering(true);

    try {
      const res = await fetch(`${API_BASE_URL}/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });

      if (res.ok) {
        setRecoveryMessage('✅ Te hemos enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.');
        setRecoveryEmail('');
        setTimeout(() => {
          setShowPasswordRecovery(false);
          setFailedAttempts(0);
        }, 5000);
      } else {
        setRecoveryMessage('⚠️ No encontramos una cuenta con ese correo. Verifica e intenta nuevamente.');
      }
    } catch (err) {
      setRecoveryMessage('❌ Error al procesar la solicitud. Intenta más tarde.');
      console.error(err);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light title-font mb-2" style={{ color: '#D4AF37' }}>
            Bienvenido de Nuevo
          </h1>
          <p className="text-gray-400 body-font">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/30 shadow-2xl">
          
          {successMessage && (
            <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-4 text-green-300 text-sm body-font">
              {successMessage}
            </div>
          )}

          {showPasswordRecovery && (
            <div className="mb-6 bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-blue-300 font-semibold mb-1">¿Olvidaste tu contraseña?</h3>
                  <p className="text-sm text-gray-400">
                    No te preocupes. Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handlePasswordRecovery} className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isRecovering}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isRecovering ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                
                {recoveryMessage && (
                  <div className={`text-sm p-2 rounded ${recoveryMessage.includes('✅') ? 'text-green-300' : 'text-yellow-300'}`}>
                    {recoveryMessage}
                  </div>
                )}
              </form>
              
              <button
                onClick={() => {
                  setShowPasswordRecovery(false);
                  setFailedAttempts(0);
                  setError('');
                }}
                className="mt-3 text-xs text-gray-400 hover:text-gray-300"
              >
                Cancelar y volver a intentar
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2 text-sm body-font">Usuario o Email</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                placeholder="Ej: tony o correo"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2 text-sm body-font">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2 text-red-300 text-sm body-font">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="whitespace-pre-line">{error}</p>
                    {failedAttempts >= 3 && !showPasswordRecovery && (
                      <button
                        onClick={() => setShowPasswordRecovery(true)}
                        className="mt-2 text-blue-400 hover:text-blue-300 underline text-xs"
                      >
                        ¿Necesitas recuperar tu contraseña?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-3 rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Validando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-sm text-gray-400 body-font">
            <p className="mb-3">¿No tienes cuenta?</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/register/personal')}
                className="flex-1 py-2 rounded-lg border border-[#A8DADC]/50 text-[#A8DADC] hover:bg-[#A8DADC]/10 transition-all"
              >
                Usuario
              </button>
              <button
                onClick={() => router.push('/register/therapist')}
                className="flex-1 py-2 rounded-lg border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
              >
                Terapeuta
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-300 text-sm body-font"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
