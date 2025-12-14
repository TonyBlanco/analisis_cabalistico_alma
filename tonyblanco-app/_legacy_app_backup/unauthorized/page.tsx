'use client';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      <div className="max-w-2xl w-full">
        <div className="bg-slate-900/50 backdrop-blur-md p-12 rounded-2xl border-2 border-yellow-500/30 text-center">
          <ShieldAlert className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
          
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            Acceso No Autorizado
          </h1>
          
          <p className="text-xl text-gray-300 body-font mb-8">
            No tienes permiso para acceder a esta sección.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font text-lg"
            >
              Ir a Mi Dashboard
            </button>

            <button
              onClick={() => router.push('/')}
              className="block w-full px-8 py-3 text-gray-400 hover:text-[#D4AF37] transition-colors body-font"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
