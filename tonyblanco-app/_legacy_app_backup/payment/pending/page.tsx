'use client';
import { useRouter } from 'next/navigation';

export default function PaymentPending() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center">
        
        {/* Pending Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 rounded-full mb-6">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4 text-[#D4AF37]">
            Pago Pendiente de Confirmación
          </h1>
          
          <p className="text-xl text-gray-300 body-font mb-8">
            Estamos verificando tu pago
          </p>
        </div>

        {/* Details */}
        <div className="bg-slate-900/50 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold mb-4 text-white body-font">¿Qué sigue?</h3>
          <ul className="space-y-4 text-gray-300 body-font">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⏱</span>
              <div>
                <p className="font-semibold">Verificación en proceso</p>
                <p className="text-sm text-gray-400">Confirmaremos tu pago en las próximas 2-4 horas</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">📧</span>
              <div>
                <p className="font-semibold">Te enviaremos un email</p>
                <p className="text-sm text-gray-400">Recibirás confirmación cuando activemos tu cuenta</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">✓</span>
              <div>
                <p className="font-semibold">Acceso inmediato</p>
                <p className="text-sm text-gray-400">Una vez confirmado, podrás acceder a todas las funciones</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-[#A8DADC]/10 border border-[#A8DADC]/30 rounded-lg p-6 mb-8">
          <p className="text-gray-300 body-font mb-2">
            <strong className="text-[#A8DADC]">Horario de verificación:</strong>
          </p>
          <p className="text-gray-400 body-font text-sm">
            Lunes a Viernes: 9:00 - 20:00 (CET)
          </p>
          <p className="text-gray-400 body-font text-sm">
            Sábados: 10:00 - 14:00 (CET)
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
          >
            Ir al Login
          </button>
        </div>

        {/* Support */}
        <div className="pt-8 border-t border-slate-700">
          <p className="text-gray-400 body-font text-sm mb-2">
            ¿Necesitas ayuda o tienes dudas?
          </p>
          <a 
            href="mailto:membresia@tonyblanco.es"
            className="text-[#D4AF37] hover:text-[#B8941F] transition-colors body-font font-semibold"
          >
            membresia@tonyblanco.es
          </a>
        </div>
      </div>
    </div>
  );
}
