'use client';
import { useRouter } from 'next/navigation';
import { Sparkles, Users, BookOpen, Award, TrendingUp, Shield } from 'lucide-react';

export default function TherapistLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      <div className="relative z-10" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-6xl mb-6">✨</div>
            <h1 className="text-5xl md:text-7xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
              Potencia tu Práctica Terapéutica
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 body-font max-w-3xl mx-auto">
              Herramientas profesionales de análisis cabalístico para terapeutas, coaches y guías espirituales
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/register/therapist')}
                className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
              >
                Comenzar Prueba Gratuita (14 días)
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-slate-800/50 border border-[#D4AF37]/30 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
              >
                Ya tengo cuenta
              </button>
            </div>

            <p className="text-sm text-gray-500 body-font">
              ✓ Sin tarjeta de crédito  ✓ Cancela cuando quieras  ✓ Soporte profesional
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light title-font text-center mb-16" style={{ color: '#D4AF37' }}>
              Todo lo que necesitas para crecer profesionalmente
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Users className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Gestión de Pacientes</h3>
                <p className="text-gray-400 body-font">
                  Organiza fichas, historial de sesiones y análisis numerológicos de todos tus pacientes en un solo lugar.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <BookOpen className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Análisis Profundos</h3>
                <p className="text-gray-400 body-font">
                  Genera informes cabalísticos completos con Árbol de la Vida, números maestros y patrones kármicos.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Award className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Credibilidad Profesional</h3>
                <p className="text-gray-400 body-font">
                  Respaldo con metodología validada y reportes profesionales que elevan tu práctica.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <TrendingUp className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Seguimiento de Progreso</h3>
                <p className="text-gray-400 body-font">
                  Registra sesiones, notas privadas y evolución de cada paciente a lo largo del tiempo.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Shield className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Seguridad y Privacidad</h3>
                <p className="text-gray-400 body-font">
                  Datos cifrados y protegidos. Cumplimiento con estándares de confidencialidad profesional.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Sparkles className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Actualizaciones Continuas</h3>
                <p className="text-gray-400 body-font">
                  Nuevas funcionalidades, templates y recursos añadidos regularmente sin costo extra.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 bg-slate-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light title-font mb-8" style={{ color: '#D4AF37' }}>
              Planes Profesionales
            </h2>
            <p className="text-gray-400 body-font mb-12">
              Elige el plan que mejor se adapte a tu práctica
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/30">
                <h3 className="text-3xl font-semibold mb-4 title-font">Profesional</h3>
                <div className="text-5xl font-bold mb-6" style={{ color: '#D4AF37' }}>
                  $49<span className="text-2xl text-gray-400">/mes</span>
                </div>
                <ul className="text-left space-y-3 mb-8 body-font text-gray-300">
                  <li>✓ Hasta 30 pacientes activos</li>
                  <li>✓ Análisis ilimitados</li>
                  <li>✓ Historial completo de sesiones</li>
                  <li>✓ Exportación de reportes PDF</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
                <button
                  onClick={() => router.push('/register/therapist')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font"
                >
                  Comenzar Prueba Gratuita
                </button>
              </div>

              <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-md p-8 rounded-2xl border-2 border-[#D4AF37] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                <h3 className="text-3xl font-semibold mb-4 title-font">Premium</h3>
                <div className="text-5xl font-bold mb-6" style={{ color: '#D4AF37' }}>
                  $99<span className="text-2xl text-gray-400">/mes</span>
                </div>
                <ul className="text-left space-y-3 mb-8 body-font text-gray-300">
                  <li>✓ Pacientes ilimitados</li>
                  <li>✓ Análisis ilimitados</li>
                  <li>✓ Todas las funciones Pro</li>
                  <li>✓ API de integración</li>
                  <li>✓ Capacitación personalizada</li>
                  <li>✓ Soporte 24/7</li>
                </ul>
                <button
                  onClick={() => router.push('/register/therapist')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font"
                >
                  Comenzar Prueba Gratuita
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
              Únete a cientos de terapeutas profesionales
            </h2>
            <p className="text-xl text-gray-300 mb-8 body-font">
              Prueba gratis durante 14 días. Sin compromiso, sin tarjeta de crédito.
            </p>
            <button
              onClick={() => router.push('/register/therapist')}
              className="px-12 py-5 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 text-lg body-font"
            >
              Comenzar Ahora
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-gray-500 body-font text-sm">
            <button
              onClick={() => router.push('/')}
              className="text-[#D4AF37] hover:underline"
            >
              ← Volver al inicio
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
