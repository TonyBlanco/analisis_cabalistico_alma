'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function MainFooter() {
  const router = useRouter();
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Check if user has accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

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
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
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
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
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
      <footer className="bg-slate-950 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
                ✨ Mi Camino del Alma
              </h3>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                Plataforma profesional de análisis cabalístico y numerología. 
                Descubre tu propósito de vida a través de la sabiduría ancestral 
                combinada con herramientas de psicoterapia moderna.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@micaminodelalma.com" className="hover:text-[#D4AF37] transition-colors">
                  info@micaminodelalma.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+34600000000" className="hover:text-[#D4AF37] transition-colors">
                  +34 600 000 000
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Madrid, España</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => router.push('/dashboard/personal')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Mi Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/tests')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Tests Disponibles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/tests/results')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Mis Resultados
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Planes y Precios
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/about')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Sobre Nosotros
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal y Soporte</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => router.push('/privacy')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/terms')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Términos y Condiciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/cookies')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Política de Cookies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/legal')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Aviso Legal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/contact')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Contacto
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/faq')}
                    className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    Preguntas Frecuentes
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-800 mb-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#D4AF37] flex items-center justify-center transition-colors group"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </a>
          </div>

          {/* Copyright & Compliance */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>© {currentYear} Mi Camino del Alma.</span>
                <span className="hidden md:inline">Todos los derechos reservados.</span>
                <Heart className="w-4 h-4 text-red-500 inline" />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCookieBanner(true)}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Configurar Cookies
                </button>
                <span className="text-gray-600">|</span>
                <span className="text-xs">
                  Cumplimiento RGPD (EU) y LOPD
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-4">
              Esta plataforma está destinada únicamente para fines informativos y de autoconocimiento. 
              No sustituye el consejo médico, psicológico o terapéutico profesional.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        
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
