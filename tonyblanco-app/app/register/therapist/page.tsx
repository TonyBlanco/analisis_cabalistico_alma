'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerTherapist, setAuthToken } from '@/lib/api';

export default function TherapistRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    profession: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.yearsOfExperience || parseInt(formData.yearsOfExperience) < 0) {
      setError('Por favor ingresa años de experiencia válidos');
      return;
    }

    setLoading(true);

    try {
      const response = await registerTherapist({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        profession: formData.profession,
        specialization: formData.specialization,
        license_number: formData.licenseNumber,
        years_of_experience: parseInt(formData.yearsOfExperience),
        phone: formData.phone
      });

      // Guardar el token
      setAuthToken(response.token);

      // Redirigir al dashboard con mensaje de éxito
      router.push('/login?registered=therapist&success=true');
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar. Intenta nuevamente.');
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Spartan:wght@300;400;500&display=swap');
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
        <div className="w-full max-w-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✨</div>
            <h1 className="text-4xl md:text-5xl font-light title-font mb-2" style={{ color: '#D4AF37' }}>
              Registro Profesional
            </h1>
            <p className="text-gray-400 body-font">Terapeutas y Profesionales del Alma</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/30 space-y-6">
            
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Nombre Completo *</label>
                <input 
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="Ej: Dr. María García"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Usuario *</label>
                <input 
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="Ej: mariagarcia"
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
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 body-font">Teléfono *</label>
                <input 
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="border-t border-slate-700/50 pt-6 mt-6">
              <h3 className="text-lg font-light title-font mb-4" style={{ color: '#D4AF37' }}>Información Profesional</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Profesión *</label>
                  <select
                    name="profession"
                    required
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                  >
                    <option value="">Selecciona...</option>
                    <option value="psychologist">Psicólogo/a</option>
                    <option value="therapist">Terapeuta</option>
                    <option value="coach">Coach</option>
                    <option value="counselor">Consejero/a</option>
                    <option value="spiritual_guide">Guía Espiritual</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Años de Experiencia *</label>
                  <input 
                    type="number"
                    name="yearsOfExperience"
                    required
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Especialización</label>
                  <input 
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="Ej: Terapia Transpersonal"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Número de Licencia</label>
                  <input 
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="Ej: PSI-12345"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
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
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
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
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
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

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-4 rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed body-font"
            >
              {loading ? '✨ Procesando...' : 'Crear Cuenta Profesional'}
            </button>

            <div className="text-center text-sm text-gray-400 body-font">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#D4AF37] hover:underline"
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
