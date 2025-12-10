'use client';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CreditCard, Mail } from 'lucide-react';

export default function MembershipExpired() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      <div className="max-w-2xl w-full">
        <div className="bg-slate-900/50 backdrop-blur-md p-12 rounded-2xl border-2 border-red-500/30 text-center">
          <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-500" />
          
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            Membresía Inactiva
          </h1>
          
          <p className="text-xl text-gray-300 body-font mb-8">
            Tu acceso ha expirado. Para continuar usando nuestros servicios, necesitas activar tu membresía.
          </p>

          <div className="bg-slate-800/50 p-6 rounded-xl mb-8">
            <h3 className="text-lg font-semibold mb-4 title-font" style={{ color: '#D4AF37' }}>
              ¿Qué puedes hacer?
            </h3>
            <ul className="space-y-3 text-left text-gray-300 body-font">
              <li className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <span>Renovar tu suscripción y recuperar acceso inmediato</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <span>Contactarnos para planes personalizados</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/services')}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font text-lg"
            >
              Ver Planes y Renovar
            </button>
            
            <a
              href="mailto:membresia@tonyblanco.es"
              className="block w-full px-8 py-4 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              Contactar Soporte
            </a>

            <button
              onClick={() => router.push('/')}
              className="block w-full px-8 py-3 text-gray-400 hover:text-[#D4AF37] transition-colors body-font"
            >
              Volver al Inicio
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-sm text-gray-500 body-font">
              ¿Crees que es un error? Contacta a{' '}
              <a href="mailto:membresia@tonyblanco.es" className="text-[#D4AF37] hover:underline">
                membresia@tonyblanco.es
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
