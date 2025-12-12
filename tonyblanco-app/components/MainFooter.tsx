'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin, TestTube, LogIn, FileText, Shield, Scale } from 'lucide-react';

export default function MainFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Check if user has accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

  // Don't show footer on dashboard, therapist, or personal pages
  const isDashboard = pathname?.startsWith('/dashboard');
  const isTherapist = pathname?.startsWith('/therapist');
  const isPersonal = pathname?.startsWith('/personal') || pathname?.startsWith('/account');
  const isTest = pathname?.startsWith('/tests');
  
  if (isDashboard || isTherapist || isPersonal || isTest) {
    return null;
  }

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'essential');
    setShowCookieBanner(false);
  };

  return (
    <>
      {/* Cookie Consent Banner (EU GDPR Compliance) */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">🍪 Uso de Cookies</h3>
                <p className="text-sm text-gray-300">
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
                  Al hacer clic en "Aceptar", aceptas nuestro uso de cookies.{' '}
                  <button
                    onClick={() => router.push('/privacy')}
                    className="text-[#D4AF37] hover:underline"
                  >
                    Más información
                  </button>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRejectCookies}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                >
                  Solo Esenciales
                </button>
                <button
                  onClick={handleAcceptCookies}
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black rounded-lg transition-colors text-sm font-bold"
                >
                  Aceptar Todas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <footer className="bg-[#050505] border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8">
            {/* Logo & Mission */}
            <div className="col-span-1">
              <h3 className="text-2xl sm:text-3xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
                ✨ Mi Camino del Alma
              </h3>
              <p className="text-sm sm:text-base body-font mb-6 max-w-md" style={{ color: '#E2E8F0', opacity: 0.7 }}>
                Plataforma profesional de análisis cabalístico y numerología. 
                Donde la ciencia clínica encuentra la sabiduría ancestral para 
                transformar vidas y sanar almas.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                  <Mail className="w-4 h-4" />
                  <a 
                    href="mailto:info@micaminodelalma.com" 
                    className="hover:opacity-100 hover:text-[#D4AF37] transition-colors"
                  >
                    info@micaminodelalma.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                  <Phone className="w-4 h-4" />
                  <a 
                    href="tel:+34600000000" 
                    className="hover:opacity-100 hover:text-[#D4AF37] transition-colors"
                  >
                    +34 600 000 000
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                  <MapPin className="w-4 h-4" />
                  <span>Madrid, España</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 body-font">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => router.push('/tests')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <TestTube className="w-4 h-4" />
                    Tests Disponibles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/register/personal')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <LogIn className="w-4 h-4" />
                    Registrarse
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/landing/therapist')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <FileText className="w-4 h-4" />
                    Para Terapeutas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <FileText className="w-4 h-4" />
                    Planes y Precios
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 body-font">Legal y Soporte</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => router.push('/privacy')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <Shield className="w-4 h-4" />
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/terms')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <Scale className="w-4 h-4" />
                    Términos y Condiciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/cookies')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <FileText className="w-4 h-4" />
                    Política de Cookies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/legal')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <FileText className="w-4 h-4" />
                    Aviso Legal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/contact')}
                    className="flex items-center gap-2 text-sm body-font hover:text-[#D4AF37] transition-colors"
                    style={{ color: '#E2E8F0', opacity: 0.7 }}
                  >
                    <Mail className="w-4 h-4" />
                    Contacto
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-4 py-6 border-t border-white/10 mb-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group border border-white/10"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group border border-white/10"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group border border-white/10"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group border border-white/10"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
          </div>

          {/* Copyright & Compliance */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.5 }}>
              <div className="flex items-center gap-1">
                <span>© {currentYear} Mi Camino del Alma.</span>
                <span className="hidden md:inline">Todos los derechos reservados.</span>
                <Heart className="w-4 h-4 text-red-500 inline" />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCookieBanner(true)}
                  className="hover:text-[#D4AF37] hover:opacity-100 transition-colors"
                >
                  Configurar Cookies
                </button>
                <span style={{ opacity: 0.3 }}>|</span>
                <span className="text-xs">
                  Cumplimiento RGPD (EU) y LOPD
                </span>
              </div>
            </div>
            <p className="text-xs text-center mt-4 body-font" style={{ color: '#E2E8F0', opacity: 0.4 }}>
              Esta plataforma está destinada únicamente para fines informativos y de autoconocimiento. 
              No sustituye el consejo médico, psicológico o terapéutico profesional.
            </p>
            <div className="flex justify-center gap-4 mt-4 text-2xl">
              <span style={{ color: '#D4AF37', opacity: 0.6 }}>☿</span>
              <span style={{ color: '#A8DADC', opacity: 0.6 }}>♄</span>
              <span style={{ color: '#D4AF37', opacity: 0.6 }}>♃</span>
            </div>
            <p className="text-lg sm:text-xl text-center mt-4 title-font" style={{ color: '#D4AF37', direction: 'rtl', opacity: 0.8 }}>
              לְתַקֵּן עוֹלָם
            </p>
            <p className="text-xs text-center mt-2 body-font" style={{ color: '#E2E8F0', opacity: 0.5 }}>
              Tikkun Olam · Reparar el Mundo
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
        
        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-in.slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
