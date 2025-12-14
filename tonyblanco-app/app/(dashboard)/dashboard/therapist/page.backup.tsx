'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership, MembershipStatus } from '@/lib/auth';
import { Users, Calendar, FileText, BarChart, Settings } from 'lucide-react';

export default function TherapistDashboard() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const membershipData = await requireMembership(['therapist'], '/membership-expired');
      if (membershipData) {
        setMembership(membershipData);
      }
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>


      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-light title-font" style={{ color: '#D4AF37' }}>
            Panel de Terapeuta
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 body-font">
              Plan: <span className="text-[#D4AF37]">{membership.subscription_plan || 'Trial'}</span>
            </span>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
            <Users className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-gray-400 text-sm body-font">Pacientes Activos</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
            <Calendar className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-gray-400 text-sm body-font">Sesiones este mes</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
            <FileText className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">0</h3>
            <p className="text-gray-400 text-sm body-font">Fichas Creadas</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
            <BarChart className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">0%</h3>
            <p className="text-gray-400 text-sm body-font">Tasa de Retención</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20 mb-8">
          <h2 className="text-2xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
            Acciones Rápidas
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/tests')}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all body-font"
            >
              📊 Tests Modulares
            </button>
            <button
              onClick={() => router.push('/therapist/patients/new')}
              className="px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all body-font"
            >
              + Nuevo Paciente
            </button>
            <button
              onClick={() => router.push('/therapist/sessions/new')}
              className="px-6 py-4 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              + Registrar Sesión
            </button>
            <button
              onClick={() => router.push('/calcular')}
              className="px-6 py-4 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              + Nuevo Análisis
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20">
          <h2 className="text-2xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
            Actividad Reciente
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500 body-font">No hay actividad reciente</p>
            <p className="text-sm text-gray-600 mt-2 body-font">
              Comienza agregando tu primer paciente
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
