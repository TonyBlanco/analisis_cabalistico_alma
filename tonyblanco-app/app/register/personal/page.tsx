'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerPersonal, setAuthToken } from '@/lib/api';

export default function PersonalRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await registerPersonal({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        birth_date: formData.birthDate || undefined,
        phone: formData.phone || undefined
      });

      // Guardar el token
      setAuthToken(response.token);

      // Redirigir al login con mensaje de éxito
      router.push('/login?registered=personal&success=true');
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar. Intenta nuevamente.');
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
        <div className="w-full max-w-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌙</div>
            <h1 className="text-4xl md:text-5xl font-light title-font mb-2" style={{ color: '#A8DADC' }}>
              Comienza tu Camino
            </h1>
            <p className="text-gray-400 body-font">Explora y Crece Personalmente</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#A8DADC]/30 space-y-6">
            
            <div>
              <label className="block text-sm text-gray-400 mb-2 body-font">Nombre Completo *</label>
              <input 
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                placeholder="Ej: María López"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Usuario *</label>
                <input 
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                  placeholder="Ej: marialopez"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Fecha de Nacimiento *</label>
                <input 
                  type="date"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Email *</label>
                <input 
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Teléfono</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-6 mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Contraseña *</label>
                  <input 
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Confirmar Contraseña *</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#A8DADC] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm body-font">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-[#A8DADC]/10 border border-[#A8DADC]/30 rounded-lg p-4 text-sm text-gray-300 body-font">
              <p className="mb-2">✨ <strong>Tu camino personal incluye:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Análisis numerológico completo</li>
                <li>• Interpretaciones cabalísticas</li>
                <li>• Guías de autoconocimiento</li>
                <li>• Acceso a recursos exclusivos</li>
              </ul>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A8DADC] via-[#7BA8AA] to-[#4A7678] hover:from-[#7BA8AA] hover:to-[#A8DADC] text-black font-bold py-4 rounded-lg transition-all duration-500 shadow-lg shadow-[#A8DADC]/20 disabled:opacity-50 disabled:cursor-not-allowed body-font"
            >
              {loading ? '🌙 Procesando...' : 'Comenzar mi Viaje'}
            </button>

            <div className="text-center text-sm text-gray-400 body-font">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#A8DADC] hover:underline"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
