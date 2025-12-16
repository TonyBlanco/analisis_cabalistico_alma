'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Placeholder login logic
    // In real implementation, this would call the auth API
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? undefined : 'var(--accent-color)',
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

