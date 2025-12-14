'use client';
import { useRouter } from 'next/navigation';

export default function PaymentCanceled() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center">
        
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 rounded-full mb-6">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4 text-yellow-400">
            Pago Cancelado
          </h1>
          
          <p className="text-xl text-gray-300 body-font mb-8">
            No se realizó ningún cargo a tu tarjeta
          </p>
        </div>

        {/* Message */}
        <div className="bg-slate-900/50 rounded-lg p-6 mb-8">
          <p className="text-gray-300 body-font mb-4">
            Has cancelado el proceso de pago. No te preocupes, puedes intentarlo nuevamente cuando estés listo.
          </p>
          <p className="text-gray-400 body-font text-sm">
            Si tuviste algún problema durante el proceso, no dudes en contactarnos.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
          >
            Intentar de Nuevo
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-gray-400 body-font text-sm mb-2">
            ¿Necesitas ayuda?
          </p>
          <a 
            href="mailto:membresia@tonyblanco.es"
            className="text-[#D4AF37] hover:text-[#B8941F] transition-colors body-font"
          >
            membresia@tonyblanco.es
          </a>
        </div>
      </div>
    </div>
  );
}
