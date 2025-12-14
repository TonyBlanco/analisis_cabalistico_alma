'use client';
import { useRouter } from 'next/navigation';
import { Heart, Compass, Star, Moon, Sun, Sparkles } from 'lucide-react';

export default function PersonalLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      <div className="relative z-10" style={{ background: 'linear-gradient(to bottom, #0A0A1F, #1A0A2E)' }}>
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-5xl md:text-7xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
              Descubre tu Camino del Alma
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 body-font max-w-3xl mx-auto">
              Análisis cabalístico personalizado para tu crecimiento espiritual y autoconocimiento profundo
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/register/user')}
                className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
              >
                Comenzar mi Análisis
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-slate-800/50 border border-[#D4AF37]/30 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
              >
                Ya tengo cuenta
              </button>
            </div>

            <p className="text-sm text-gray-500 body-font">
              ✓ Análisis instantáneo  ✓ Guía paso a paso  ✓ Actualizaciones incluidas
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light title-font text-center mb-16" style={{ color: '#D4AF37' }}>
              ¿Qué descubrirás en tu análisis?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Heart className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Tu Propósito de Vida</h3>
                <p className="text-gray-400 body-font">
                  Descubre la misión de tu alma y el camino que viniste a recorrer en esta encarnación.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Compass className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Tu Árbol de la Vida</h3>
                <p className="text-gray-400 body-font">
                  Mapeo completo de tus números cabalísticos y su significado en cada sephirah.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Star className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Números Maestros</h3>
                <p className="text-gray-400 body-font">
                  Identifica tus números maestros (11, 22, 33) y su influencia en tu destino.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Moon className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Patrones Kármicos</h3>
                <p className="text-gray-400 body-font">
                  Comprende las lecciones del alma que vienes a aprender y superar.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Sun className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Dones y Talentos</h3>
                <p className="text-gray-400 body-font">
                  Reconoce tus fortalezas naturales y cómo expresarlas en el mundo.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <Sparkles className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <h3 className="text-2xl font-semibold mb-4 title-font">Guía Personalizada</h3>
                <p className="text-gray-400 body-font">
                  Recomendaciones específicas para tu evolución espiritual y crecimiento personal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4 bg-slate-900/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light title-font text-center mb-16" style={{ color: '#D4AF37' }}>
              ¿Cómo funciona?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B6914] flex items-center justify-center text-2xl font-bold text-black mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 title-font">Completa tu perfil</h3>
                <p className="text-gray-400 body-font">
                  Ingresa tu nombre completo y fecha de nacimiento para generar tu mapa numerológico único.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B6914] flex items-center justify-center text-2xl font-bold text-black mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 title-font">Recibe tu análisis</h3>
                <p className="text-gray-400 body-font">
                  Obtén instantáneamente tu Árbol de la Vida completo con todos los cálculos cabalísticos.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B6914] flex items-center justify-center text-2xl font-bold text-black mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 title-font">Explora y crece</h3>
                <p className="text-gray-400 body-font">
                  Accede a tu análisis cuando quieras y profundiza en tu camino de autoconocimiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light title-font mb-8" style={{ color: '#D4AF37' }}>
              Inversión en ti mismo
            </h2>
            
            <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-md p-10 rounded-2xl border-2 border-[#D4AF37]">
              <h3 className="text-3xl font-semibold mb-4 title-font">Análisis Completo</h3>
              <div className="text-6xl font-bold mb-6" style={{ color: '#D4AF37' }}>
                $29
              </div>
              <p className="text-gray-400 body-font mb-8">Pago único - Acceso de por vida</p>
              
              <ul className="text-left space-y-3 mb-8 body-font text-gray-300">
                <li>✓ Árbol de la Vida completo</li>
                <li>✓ Análisis de todos los números</li>
                <li>✓ Interpretación detallada</li>
                <li>✓ Guía de evolución personal</li>
                <li>✓ Actualizaciones incluidas</li>
                <li>✓ Acceso ilimitado</li>
              </ul>
              
              <button
                onClick={() => router.push('/register/user')}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all text-lg body-font"
              >
                Obtener mi Análisis
              </button>
            </div>

            <p className="text-sm text-gray-500 body-font mt-6">
              💳 Pago seguro  •  🔒 Datos protegidos  •  ✓ Garantía de satisfacción
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light title-font text-center mb-16" style={{ color: '#D4AF37' }}>
              Historias de transformación
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
                <p className="text-gray-300 body-font mb-4 italic">
                  "Descubrir mi número de propósito cambió completamente mi perspectiva. Ahora entiendo por qué ciertas situaciones se repiten en mi vida."
                </p>
                <p className="text-[#D4AF37] font-semibold">- María G.</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
                <p className="text-gray-300 body-font mb-4 italic">
                  "El análisis fue increíblemente preciso. Me ayudó a tomar decisiones importantes alineadas con mi camino del alma."
                </p>
                <p className="text-[#D4AF37] font-semibold">- Carlos R.</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
                <p className="text-gray-300 body-font mb-4 italic">
                  "Finalmente comprendo mis patrones kármicos. Esta información es oro para mi crecimiento personal."
                </p>
                <p className="text-[#D4AF37] font-semibold">- Ana L.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
              Tu viaje comienza aquí
            </h2>
            <p className="text-xl text-gray-300 mb-8 body-font">
              Descubre las respuestas que tu alma ha estado buscando
            </p>
            <button
                onClick={() => router.push('/register/user')}
              className="px-12 py-5 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 text-lg body-font"
            >
              Comenzar mi Análisis
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
