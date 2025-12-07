'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
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

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) throw new Error('Credenciales incorrectas');

      const data = await res.json();
      const token = data.token;

      localStorage.setItem('userToken', token);
      router.push('/dashboard');
      
    } catch (err) {
      setError('Usuario o contraseña inválidos 🚫');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Spartan:wght@300;400;500&display=swap');
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>

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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2 text-sm body-font">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                placeholder="Ej: tony"
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
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm body-font">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-3 rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
            >
              Entrar
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

