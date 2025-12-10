"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Circle } from 'lucide-react';

export default function KabbalistLanding() {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; size: number; duration: number; delay: number}>>([]);
  const [hoveredSefirah, setHoveredSefirah] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10
    }));
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const sefirot = [
    { name: 'Keter', benefit: 'Conexión con el propósito divino', x: 50, y: 10, connections: [1, 2] },
    { name: 'Chokhmah', benefit: 'Sabiduría profunda', x: 30, y: 25, connections: [0, 3, 5] },
    { name: 'Binah', benefit: 'Comprensión intuitiva', x: 70, y: 25, connections: [0, 4, 5] },
    { name: 'Chesed', benefit: 'Amor incondicional', x: 30, y: 45, connections: [1, 5, 6] },
    { name: 'Gevurah', benefit: 'Fortaleza interior', x: 70, y: 45, connections: [2, 5, 7] },
    { name: 'Tiferet', benefit: 'Balance y belleza', x: 50, y: 50, connections: [1, 2, 3, 4, 6, 7, 8] },
    { name: 'Netzach', benefit: 'Victoria y eternidad', x: 30, y: 70, connections: [3, 5, 8] },
    { name: 'Hod', benefit: 'Gloria y esplendor', x: 70, y: 70, connections: [4, 5, 8] },
    { name: 'Yesod', benefit: 'Fundamento espiritual', x: 50, y: 85, connections: [5, 6, 7, 9] },
    { name: 'Malkhut', benefit: 'Manifestación material', x: 50, y: 95, connections: [8] }
  ];

  const testimonials = [
    { name: 'Sarah L.', sefirah: 'Tiferet', text: 'La Kabbalah transformó mi práctica terapéutica completamente.', role: 'Psicoterapeuta' },
    { name: 'David R.', sefirah: 'Chokhmah', text: 'Encontré respuestas que buscaba durante años.', role: 'Buscador' },
    { name: 'Miriam K.', sefirah: 'Binah', text: 'Un camino profundo hacia el autoconocimiento real.', role: 'Coach' }
  ];

  const isConnected = (from: number, to: number) => {
    if (hoveredSefirah === null) return false;
    return hoveredSefirah === from && sefirot[from].connections.includes(to);
  };

  const handleTherapistClick = () => {
    router.push('/landing/therapist');
  };

  const handlePersonalClick = () => {
    router.push('/landing/personal');
  };

  const handleDemoClick = () => {
    router.push('/demo');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden cursor-none">
      {/* Custom Cursor */}
      <div 
        className="fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-screen transition-transform duration-150"
        style={{
          left: mousePos.x - 12,
          top: mousePos.y - 12,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          transform: 'scale(1)'
        }}
      />

      {/* Animated Particles Background */}
      <div className="fixed inset-0 z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: 0.15,
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
              animation: `floatSlow ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style>{`
        /* Fonts loaded in layout */

        * { cursor: none; }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.25; }
        }

        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 8px #D4AF37); }
          50% { opacity: 1; filter: drop-shadow(0 0 20px #D4AF37); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }

        .animate-fadeInUp { 
          animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        .animate-fadeInUp-delay-1 { 
          animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; 
          opacity: 0; 
        }
        .animate-fadeInUp-delay-2 { 
          animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; 
          opacity: 0; 
        }

        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .cta-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .line-active {
          stroke: #D4AF37;
          stroke-width: 2;
          filter: drop-shadow(0 0 6px #D4AF37);
          animation: glow 2s ease-in-out infinite;
        }

        .line-inactive {
          stroke: #D4AF37;
          stroke-width: 1;
          opacity: 0.3;
          stroke-dasharray: 5, 5;
          animation: dash 20s linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center space-y-8 sm:space-y-12">
          
          {/* Main Title */}
          <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tight leading-tight title-font">
              <span className="font-normal">Kabbalah Aplicada</span>
              <br />
              <span className="text-4xl sm:text-5xl md:text-7xl" style={{ color: '#D4AF37' }}>& Psicoterapias del Alma</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light tracking-wide animate-fadeInUp-delay-1 body-font">
            Para profesionales y buscadores individuales
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto pt-4 sm:pt-8 animate-fadeInUp-delay-2">
            <button 
              onClick={handleTherapistClick}
              className="cta-button group relative px-8 sm:px-10 py-10 sm:py-12 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 border border-transparent hover:border-[#D4AF37]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#B8941F] to-[#8B6914] opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative z-10 space-y-3 body-font">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-2xl sm:text-3xl font-light title-font" style={{ color: '#D4AF37' }}>Soy Terapeuta</h3>
                <p className="text-sm text-gray-400">Profesionales del Alma</p>
              </div>
            </button>

            <button 
              onClick={handlePersonalClick}
              className="cta-button group relative px-8 sm:px-10 py-10 sm:py-12 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 border border-transparent hover:border-[#A8DADC]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#A8DADC] via-[#7BA8AA] to-[#4A7678] opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative z-10 space-y-3 body-font">
                <div className="text-4xl mb-3">🌙</div>
                <h3 className="text-2xl sm:text-3xl font-light title-font" style={{ color: '#A8DADC' }}>Busco Crecimiento</h3>
                <p className="text-sm text-gray-400">Camino Personal</p>
              </div>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 animate-fadeInUp-delay-2">
            <button
              onClick={handleDemoClick}
              className="px-6 py-3 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all body-font"
            >
              🎯 Probar Demo
            </button>
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:border-[#D4AF37]/30 transition-all body-font"
            >
              Ya soy miembro →
            </button>
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-3 rounded-lg border border-slate-700 text-gray-400 hover:bg-slate-800/30 transition-all body-font"
            >
              Ver servicios
            </button>
          </div>
        </div>
      </div>

      {/* Tree of Life Section */}
      <div className="relative z-10 py-20 sm:py-32 px-4 sm:px-6" style={{ background: 'linear-gradient(to bottom, #000000, #0A0A1F)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-center mb-12 sm:mb-16 title-font" style={{ color: '#D4AF37' }}>
            Árbol de la Vida
          </h2>
          
          <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: '1 / 1.2' }}>
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {sefirot.map((sefirah, i) => 
                sefirah.connections.map(connIdx => (
                  <line
                    key={`${i}-${connIdx}`}
                    x1={sefirot[i].x}
                    y1={sefirot[i].y}
                    x2={sefirot[connIdx].x}
                    y2={sefirot[connIdx].y}
                    className={isConnected(i, connIdx) || isConnected(connIdx, i) ? 'line-active' : 'line-inactive'}
                  />
                ))
              )}
            </svg>

            {/* Sefirot */}
            {sefirot.map((sefirah, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${sefirah.x}%`, top: `${sefirah.y}%` }}
                onMouseEnter={() => setHoveredSefirah(i)}
                onMouseLeave={() => setHoveredSefirah(null)}
              >
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-125"
                  style={{ 
                    borderColor: '#D4AF37',
                    background: hoveredSefirah === i ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 10, 31, 0.9)',
                    boxShadow: hoveredSefirah === i ? '0 0 40px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.5)' : '0 0 10px rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <Circle className="w-2 h-2 sm:w-3 sm:h-3" style={{ color: '#D4AF37' }} />
                </div>
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap body-font">
                  <p className="text-xs sm:text-sm font-light" style={{ color: '#D4AF37' }}>{sefirah.name}</p>
                  {hoveredSefirah === i && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px] text-center animate-fadeInUp">{sefirah.benefit}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-center mb-16 sm:mb-20 title-font" style={{ color: '#A8DADC' }}>
            Experiencias
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {testimonials.map((test, i) => (
              <div key={i} className="text-center space-y-4 group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8DADC] p-1 group-hover:scale-110 transition-all duration-500" style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}>
                  <div className="w-full h-full rounded-full bg-[#0A0A1F] flex items-center justify-center">
                    <span className="text-2xl">⚛</span>
                  </div>
                </div>
                <p className="text-xs tracking-widest body-font" style={{ color: '#D4AF37' }}>{test.sefirah}</p>
                <p className="text-gray-300 italic leading-relaxed text-sm body-font px-2">&quot;{test.text}&quot;</p>
                <div className="space-y-1 body-font">
                  <p className="font-light">{test.name}</p>
                  <p className="text-xs text-gray-500">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 border-t body-font" style={{ borderColor: '#0A0A1F', background: '#000000' }}>
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex justify-center gap-6 text-2xl sm:text-3xl mb-4">
            <span style={{ color: '#D4AF37' }}>☿</span>
            <span style={{ color: '#A8DADC' }}>♄</span>
            <span style={{ color: '#D4AF37' }}>♃</span>
          </div>
          <p className="text-2xl sm:text-3xl mb-2 title-font" style={{ color: '#D4AF37', direction: 'rtl' }}>לְתַקֵּן עוֹלָם</p>
          <p className="text-sm text-gray-500">Tikkun Olam · Reparar el Mundo</p>
          <p className="text-xs text-gray-600 pt-4">© 2024 Tony Blanco · app.tonyblanco.com</p>
        </div>
      </footer>
    </div>
  );
}