'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 md:p-12 text-center">
        
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4 text-[#D4AF37]">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-xl text-gray-300 body-font mb-8">
            Tu membresía ha sido activada correctamente
          </p>
        </div>

        {/* Details */}
        <div className="bg-slate-900/50 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold mb-4 text-white body-font">Próximos pasos:</h3>
          <ul className="space-y-3 text-gray-300 body-font">
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF37]">✓</span>
              <span>Recibirás un email de confirmación en unos minutos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF37]">✓</span>
              <span>Tu dashboard ya está disponible con todas las funciones</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF37]">✓</span>
              <span>Puedes comenzar a usar el sistema inmediatamente</span>
            </li>
          </ul>
        </div>

        {sessionId && (
          <p className="text-sm text-gray-500 body-font mb-6">
            ID de sesión: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Countdown */}
        <div className="mb-8">
          <p className="text-gray-400 body-font mb-4">
            Serás redirigido a tu dashboard en {countdown} segundos...
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-[#D4AF37] h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(5 - countdown) * 20}%` }}
            />
          </div>
        </div>

        {/* Manual Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font"
        >
          Ir al Dashboard Ahora
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Cargando...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}
