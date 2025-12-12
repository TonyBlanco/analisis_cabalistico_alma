'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Circle, Sparkles, Brain, Heart, Shield, ArrowRight, Check, Star, Quote } from 'lucide-react';

export default function KabbalistLanding() {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; size: number; duration: number; delay: number}>>([]);
  const [hoveredSefirah, setHoveredSefirah] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 40 + 30,
      delay: Math.random() * 15
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

  const benefits = [
    {
      icon: Brain,
      title: 'Diagnóstico Clínico',
      description: 'Tests psicológicos estandarizados con baremos clínicos validados. Análisis preciso basado en DSM-5 y estándares internacionales.',
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: '#A8DADC'
    },
    {
      icon: Sparkles,
      title: 'Análisis del Alma',
      description: 'Interpretación cabalística profunda que conecta síntomas con Sefirot, órganos energéticos y conceptos místicos ancestrales.',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: '#D4AF37'
    },
    {
      icon: Heart,
      title: 'Terapia Angelical',
      description: 'Guía espiritual personalizada a través de los 72 Ángeles del Shem ha-Mephorash. Meditaciones e invocaciones para sanación.',
      color: 'from-amber-500/20 to-yellow-500/20',
      borderColor: 'border-amber-500/30',
      iconColor: '#D4AF37'
    }
  ];

  const testimonials = [
    { 
      name: 'Sarah L.', 
      sefirah: 'Tiferet', 
      text: 'La integración de Kabbalah en mi práctica terapéutica ha transformado completamente cómo entiendo y trato a mis pacientes. Los resultados son extraordinarios.', 
      role: 'Psicoterapeuta Clínica',
      rating: 5
    },
    { 
      name: 'David R.', 
      sefirah: 'Chokhmah', 
      text: 'Encontré respuestas que había buscado durante años. El análisis del alma me dio claridad sobre patrones que no entendía desde una perspectiva puramente clínica.', 
      role: 'Buscador Espiritual',
      rating: 5
    },
    { 
      name: 'Miriam K.', 
      sefirah: 'Binah', 
      text: 'Un camino profundo hacia el autoconocimiento real. La combinación de ciencia y sabiduría ancestral es única y poderosa.', 
      role: 'Coach de Vida',
      rating: 5
    }
  ];

  const isConnected = (from: number, to: number) => {
    if (hoveredSefirah === null) return false;
    return hoveredSefirah === from && sefirot[from].connections.includes(to);
  };

  const handleTherapistClick = () => {
    router.push('/landing/therapist');
  };

  const handlePatientClick = () => {
    router.push('/register/personal');
  };

  const handleDemoClick = () => {
    router.push('/demo');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleTestsClick = () => {
    router.push('/tests');
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#050505' }}>
      {/* Background Gradients */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(10, 10, 31, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(10, 10, 31, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(10, 10, 31, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(10, 10, 31, 0.3) 0%, transparent 50%),
            #050505
          `
        }}
      />

      {/* Subtle Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'rgba(212, 175, 55, 0.08)',
              boxShadow: '0 0 6px rgba(212, 175, 55, 0.3)',
              animation: `floatSlow ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.05; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.15; }
        }

        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.6; 
            filter: drop-shadow(0 0 8px #D4AF37) drop-shadow(0 0 16px rgba(212, 175, 55, 0.4));
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            filter: drop-shadow(0 0 16px #D4AF37) drop-shadow(0 0 32px rgba(212, 175, 55, 0.6));
            transform: scale(1.05);
          }
        }

        @keyframes orbPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.1);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.6), 0 0 60px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.2);
            transform: scale(1.1);
          }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInUp { 
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        .animate-fadeInUp-delay-1 { 
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; 
          opacity: 0; 
        }
        .animate-fadeInUp-delay-2 { 
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; 
          opacity: 0; 
        }
        .animate-fadeInUp-delay-3 { 
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; 
          opacity: 0; 
        }

        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }

        .line-active {
          stroke: #D4AF37;
          stroke-width: 2.5;
          filter: drop-shadow(0 0 8px #D4AF37) drop-shadow(0 0 16px rgba(212, 175, 55, 0.5));
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .line-inactive {
          stroke: #D4AF37;
          stroke-width: 1;
          opacity: 0.25;
          stroke-dasharray: 4, 4;
          animation: dash 25s linear infinite;
        }

        .orb-pulse {
          animation: orbPulse 3s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(10, 10, 31, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.1);
        }

        .glass-card-hover {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-card-hover:hover {
          background: rgba(10, 10, 31, 0.6);
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.1);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          {/* Main Title */}
          <div className="space-y-6 animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] title-font" style={{ color: '#E2E8F0' }}>
              Donde la Ciencia Clínica
              <br />
              <span style={{ color: '#D4AF37' }}>encuentra la Sabiduría Ancestral</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide animate-fadeInUp-delay-1 body-font max-w-4xl mx-auto" style={{ color: '#E2E8F0', opacity: 0.8 }}>
            Plataforma integrada de análisis psicológico y cabalístico
            <br />
            <span className="text-lg sm:text-xl md:text-2xl" style={{ color: '#A8DADC', opacity: 0.7 }}>
              Para terapeutas profesionales y buscadores del crecimiento personal
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-8 animate-fadeInUp-delay-2">
            <button 
              onClick={handleTherapistClick}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-lg body-font transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: '#050505',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Soy Terapeuta
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button 
              onClick={handlePatientClick}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-lg body-font transition-all duration-300 hover:scale-105 glass-card glass-card-hover"
              style={{ color: '#E2E8F0' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Soy Paciente
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: '#A8DADC' }} />
              </span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4 animate-fadeInUp-delay-3">
            <button
              onClick={handleTestsClick}
              className="px-6 py-3 rounded-lg glass-card glass-card-hover body-font text-sm"
              style={{ color: '#E2E8F0' }}
            >
              Ver Tests Disponibles
            </button>
            <button
              onClick={handleDemoClick}
              className="px-6 py-3 rounded-lg glass-card glass-card-hover body-font text-sm"
              style={{ color: '#E2E8F0' }}
            >
              Probar Demo
            </button>
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 rounded-lg glass-card glass-card-hover body-font text-sm"
              style={{ color: '#E2E8F0' }}
            >
              Ya soy miembro
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light title-font mb-4" style={{ color: '#E2E8F0' }}>
              Tres Pilares de
              <span style={{ color: '#D4AF37' }}> Transformación</span>
            </h2>
            <p className="text-lg sm:text-xl body-font max-w-2xl mx-auto" style={{ color: '#E2E8F0', opacity: 0.7 }}>
              Una integración única que combina rigor científico con sabiduría milenaria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className={`glass-card glass-card-hover rounded-2xl p-8 sm:p-10 ${benefit.color} ${benefit.borderColor} border`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-6">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: `linear-gradient(135deg, ${benefit.iconColor}20, ${benefit.iconColor}10)`,
                        border: `1px solid ${benefit.iconColor}30`
                      }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: benefit.iconColor }} />
                    </div>
                    <h3 className="text-2xl font-light title-font mb-3" style={{ color: '#E2E8F0' }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-base body-font leading-relaxed" style={{ color: '#E2E8F0', opacity: 0.8 }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tree of Life Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, transparent, rgba(10, 10, 31, 0.3), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light title-font mb-4" style={{ color: '#E2E8F0' }}>
              El <span style={{ color: '#D4AF37' }}>Árbol de la Vida</span>
            </h2>
            <p className="text-lg sm:text-xl body-font max-w-2xl mx-auto" style={{ color: '#E2E8F0', opacity: 0.7 }}>
              Explora las 10 Sefirot y descubre cómo se conectan con tu bienestar
            </p>
          </div>
          
          <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '1 / 1.2' }}>
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

            {/* Sefirot Orbs */}
            {sefirot.map((sefirah, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${sefirah.x}%`, top: `${sefirah.y}%` }}
                onMouseEnter={() => setHoveredSefirah(i)}
                onMouseLeave={() => setHoveredSefirah(null)}
              >
                <div 
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-125 orb-pulse`}
                  style={{ 
                    borderColor: hoveredSefirah === i ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)',
                    background: hoveredSefirah === i 
                      ? 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.1) 100%)' 
                      : 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(10, 10, 31, 0.8) 100%)',
                  }}
                >
                  <Circle 
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${hoveredSefirah === i ? 'scale-150' : ''}`}
                    style={{ color: '#D4AF37' }}
                    fill={hoveredSefirah === i ? '#D4AF37' : 'transparent'}
                  />
                </div>
                <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap body-font">
                  <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: hoveredSefirah === i ? '#D4AF37' : '#E2E8F0', opacity: hoveredSefirah === i ? 1 : 0.6 }}>
                    {sefirah.name}
                  </p>
                  {hoveredSefirah === i && (
                    <p className="text-xs text-center max-w-[180px] animate-fadeInUp mt-2 px-2 py-1 rounded glass-card" style={{ color: '#E2E8F0', opacity: 0.9 }}>
                      {sefirah.benefit}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light title-font mb-4" style={{ color: '#E2E8F0' }}>
              Experiencias <span style={{ color: '#A8DADC' }}>Transformadoras</span>
            </h2>
            <p className="text-lg sm:text-xl body-font max-w-2xl mx-auto" style={{ color: '#E2E8F0', opacity: 0.7 }}>
              Lo que dicen profesionales y buscadores que han integrado esta sabiduría
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((test, i) => (
              <div 
                key={i} 
                className="glass-card glass-card-hover rounded-2xl p-8 sm:p-10 relative group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Quote 
                  className="absolute top-6 right-6 w-12 h-12 opacity-10" 
                  style={{ color: '#D4AF37' }}
                />
                <div className="relative z-10 space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: test.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" style={{ color: '#D4AF37' }} />
                    ))}
                  </div>
                  
                  {/* Testimonial Text */}
                  <p className="text-base sm:text-lg body-font leading-relaxed italic" style={{ color: '#E2E8F0', opacity: 0.9 }}>
                    &quot;{test.text}&quot;
                  </p>
                  
                  {/* Author Info */}
                  <div className="pt-4 border-t" style={{ borderColor: 'rgba(226, 232, 240, 0.1)' }}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(168, 218, 220, 0.3))',
                          border: '1px solid rgba(212, 175, 55, 0.4)'
                        }}
                      >
                        <span className="text-xl">{test.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold body-font" style={{ color: '#E2E8F0' }}>
                          {test.name}
                        </p>
                        <p className="text-xs body-font" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                          {test.role}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#D4AF37', opacity: 0.8 }}>
                          {test.sefirah}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card glass-card-hover rounded-3xl p-12 sm:p-16 space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light title-font" style={{ color: '#E2E8F0' }}>
              Comienza tu <span style={{ color: '#D4AF37' }}>Camino</span>
            </h2>
            <p className="text-lg sm:text-xl body-font max-w-2xl mx-auto" style={{ color: '#E2E8F0', opacity: 0.8 }}>
              Únete a terapeutas y buscadores que están transformando vidas a través de la integración de ciencia y sabiduría ancestral
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <button 
                onClick={handleTherapistClick}
                className="px-8 py-4 rounded-xl font-semibold text-lg body-font transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                  color: '#050505',
                  boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
                }}
              >
                Registro Terapeuta
              </button>
              <button 
                onClick={handlePatientClick}
                className="px-8 py-4 rounded-xl font-semibold text-lg body-font transition-all duration-300 hover:scale-105 glass-card glass-card-hover"
                style={{ color: '#E2E8F0' }}
              >
                Registro Personal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 border-t body-font" style={{ borderColor: 'rgba(226, 232, 240, 0.1)', background: 'rgba(5, 5, 5, 0.8)' }}>
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-8 text-3xl sm:text-4xl mb-4">
            <span style={{ color: '#D4AF37', opacity: 0.8 }}>☿</span>
            <span style={{ color: '#A8DADC', opacity: 0.8 }}>♄</span>
            <span style={{ color: '#D4AF37', opacity: 0.8 }}>♃</span>
          </div>
          <p className="text-2xl sm:text-3xl mb-2 title-font" style={{ color: '#D4AF37', direction: 'rtl' }}>
            לְתַקֵּן עוֹלָם
          </p>
          <p className="text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.6 }}>
            Tikkun Olam · Reparar el Mundo
          </p>
          <p className="text-xs body-font pt-4" style={{ color: '#E2E8F0', opacity: 0.5 }}>
            © 2024 Tony Blanco · app.tonyblanco.com
          </p>
        </div>
      </footer>
    </div>
  );
}
