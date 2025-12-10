'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, User } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [demoData, setDemoData] = useState({
    fullName: 'Ana María García López',
    birthDate: '1985-07-15'
  });
  const [showResults, setShowResults] = useState(false);

  // Mock data para demo
  const demoResults = {
    numeroAlma: 7,
    numeroPersonalidad: 3,
    numeroCamino: 1,
    numeroDestino: 11,
    numeroActivo: 5,
    numeroHereditario: 6,
    numeroVocacion: 9,
    numeroRespuesta: 4,
    numeroEquilibrio: 2,
    numeroPlanoDivino: 8,
    numeroManifiesto: 22,
    numeroTriunfos: 3,
    numeroBase: 6
  };

  const handleDemo = () => {
    setShowResults(true);
  };

  const handleRegister = () => {
    router.push('/register/personal');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      <div className="relative z-10" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
        
        {/* Header */}
        <header className="py-6 px-4 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-light title-font" style={{ color: '#D4AF37' }}>
              Prueba Demo
            </h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-[#D4AF37] body-font"
            >
              ← Volver al inicio
            </button>
          </div>
        </header>

        {/* Demo Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4AF37' }} />
              <h2 className="text-4xl md:text-5xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
                Prueba el Análisis Cabalístico
              </h2>
              <p className="text-xl text-gray-300 body-font">
                Experimenta con datos de ejemplo cómo funciona nuestro análisis completo
              </p>
            </div>

            {!showResults ? (
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                <h3 className="text-2xl font-semibold mb-6 title-font text-center">
                  Datos de Ejemplo
                </h3>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 body-font flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={demoData.fullName}
                      onChange={(e) => setDemoData({ ...demoData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-[#D4AF37] body-font"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 body-font flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={demoData.birthDate}
                      onChange={(e) => setDemoData({ ...demoData, birthDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-[#D4AF37] body-font"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDemo}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all text-lg body-font"
                >
                  Ver Análisis Demo
                </button>

                <p className="text-center text-sm text-gray-500 mt-4 body-font">
                  Los cálculos mostrados son ejemplos ilustrativos
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                  <h3 className="text-3xl font-semibold mb-2 title-font text-center" style={{ color: '#D4AF37' }}>
                    Árbol de la Vida de {demoData.fullName}
                  </h3>
                  <p className="text-center text-gray-400 body-font mb-8">
                    Fecha de Nacimiento: {new Date(demoData.birthDate).toLocaleDateString('es-ES', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>

                  {/* Árbol visual simplificado */}
                  <div className="relative max-w-2xl mx-auto mb-8">
                    <svg viewBox="0 0 400 600" className="w-full">
                      {/* Líneas de conexión */}
                      <line x1="200" y1="50" x2="120" y2="150" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
                      <line x1="200" y1="50" x2="280" y2="150" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
                      <line x1="120" y1="150" x2="200" y2="250" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
                      <line x1="280" y1="150" x2="200" y2="250" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
                      
                      {/* Sephiroth */}
                      <g>
                        {/* Kether */}
                        <circle cx="200" cy="50" r="30" fill="#1a1a2e" stroke="#D4AF37" strokeWidth="2" />
                        <text x="200" y="55" textAnchor="middle" fill="#D4AF37" fontSize="20" fontWeight="bold">{demoResults.numeroPlanoDivino}</text>
                        <text x="200" y="100" textAnchor="middle" fill="#D4AF37" fontSize="12">Plano Divino</text>
                      </g>

                      <g>
                        {/* Chokmah */}
                        <circle cx="120" cy="150" r="30" fill="#1a1a2e" stroke="#D4AF37" strokeWidth="2" />
                        <text x="120" y="155" textAnchor="middle" fill="#D4AF37" fontSize="20" fontWeight="bold">{demoResults.numeroActivo}</text>
                        <text x="120" y="200" textAnchor="middle" fill="#D4AF37" fontSize="12">Activo</text>
                      </g>

                      <g>
                        {/* Binah */}
                        <circle cx="280" cy="150" r="30" fill="#1a1a2e" stroke="#D4AF37" strokeWidth="2" />
                        <text x="280" y="155" textAnchor="middle" fill="#D4AF37" fontSize="20" fontWeight="bold">{demoResults.numeroHereditario}</text>
                        <text x="280" y="200" textAnchor="middle" fill="#D4AF37" fontSize="12">Hereditario</text>
                      </g>

                      <g>
                        {/* Tiphereth - Central */}
                        <circle cx="200" cy="250" r="35" fill="#1a1a2e" stroke="#D4AF37" strokeWidth="3" />
                        <text x="200" y="257" textAnchor="middle" fill="#D4AF37" fontSize="24" fontWeight="bold">{demoResults.numeroAlma}</text>
                        <text x="200" y="310" textAnchor="middle" fill="#D4AF37" fontSize="14" fontWeight="bold">ALMA</text>
                      </g>
                    </svg>
                  </div>

                  {/* Grid de números */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroCamino}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Camino de Vida</div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroDestino}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Número Maestro</div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroPersonalidad}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Personalidad</div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroVocacion}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Vocación</div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroRespuesta}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Respuesta</div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-[#D4AF37]/20">
                      <div className="text-3xl font-bold text-center mb-2" style={{ color: '#D4AF37' }}>
                        {demoResults.numeroEquilibrio}
                      </div>
                      <div className="text-sm text-center text-gray-400 body-font">Equilibrio</div>
                    </div>
                  </div>
                </div>

                {/* Sample interpretations */}
                <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-[#D4AF37]/20">
                  <h4 className="text-2xl font-semibold mb-4 title-font" style={{ color: '#D4AF37' }}>
                    Interpretación de Ejemplo
                  </h4>
                  <div className="space-y-4 text-gray-300 body-font">
                    <p>
                      <strong className="text-[#D4AF37]">Tu Número de Alma ({demoResults.numeroAlma}):</strong> Representa tu búsqueda de conocimiento espiritual y verdad interior. Eres una persona introspectiva que necesita tiempo a solas para conectar con tu esencia.
                    </p>
                    <p>
                      <strong className="text-[#D4AF37]">Tu Camino de Vida ({demoResults.numeroCamino}):</strong> Indica un camino de liderazgo y pionerismo. Viniste a iniciar proyectos, ser independiente y mostrar valentía.
                    </p>
                    <p>
                      <strong className="text-[#D4AF37]">Número Maestro ({demoResults.numeroDestino}):</strong> El 11 es un número maestro que trae intuición elevada y capacidad de inspirar a otros. Tu misión incluye ser un canal de luz.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-md p-8 rounded-2xl border-2 border-[#D4AF37] text-center">
                  <h4 className="text-2xl font-semibold mb-4 title-font" style={{ color: '#D4AF37' }}>
                    ¿Quieres tu análisis completo?
                  </h4>
                  <p className="text-gray-300 body-font mb-6">
                    Este es solo un ejemplo. Tu análisis real incluye interpretaciones profundas, guías personalizadas y acceso permanente a tu información.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleRegister}
                      className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font"
                    >
                      Obtener mi Análisis Real
                    </button>
                    <button
                      onClick={() => setShowResults(false)}
                      className="px-8 py-4 bg-slate-800/50 border border-[#D4AF37]/30 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
                    >
                      Ver otra demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 px-4 mt-20">
          <div className="max-w-6xl mx-auto text-center text-gray-500 body-font text-sm">
            <p>Esta es una demostración con datos de ejemplo</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
