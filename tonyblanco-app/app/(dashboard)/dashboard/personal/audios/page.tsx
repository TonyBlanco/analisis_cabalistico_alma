'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { Music, Lock, Play } from 'lucide-react';

/**
 * Personal Audios Page
 * 
 * Shows available audio resources for personal users.
 */
export default function PersonalAudiosPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/login');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'personal' && role !== 'admin') {
    return null;
  }

  // Placeholder audio resources
  const audioResources = [
    {
      id: 1,
      title: 'Meditación guiada: Conexión con tu esencia',
      description: 'Meditación de 15 minutos para conectar con tu ser interior',
      duration: '15 min',
      isFree: true,
    },
    {
      id: 2,
      title: 'Afirmaciones cabalísticas matutinas',
      description: 'Comienza tu día con energía positiva y propósito',
      duration: '10 min',
      isFree: true,
    },
    {
      id: 3,
      title: 'Sonidos curativos: Frecuencias del alma',
      description: 'Frecuencias específicas para armonizar tu energía',
      duration: '30 min',
      isFree: false,
    },
    {
      id: 4,
      title: 'Historia de los 72 ángeles',
      description: 'Narración sobre la sabiduría de los ángeles cabalísticos',
      duration: '45 min',
      isFree: false,
    },
  ];

  const handleAudioClick = (audio: typeof audioResources[0]) => {
    if (audio.isFree) {
      // TODO: Implement audio playback
      alert(`Reproduciendo: ${audio.title}`);
    } else {
      alert('Disponible con acompañamiento profesional');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Audios
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Meditaciones, afirmaciones y contenido de audio para tu crecimiento personal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {audioResources.map((audio) => (
          <div
            key={audio.id}
            className={`border rounded-lg p-5 transition-all ${
              audio.isFree
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer bg-white'
                : 'border-gray-300 bg-gray-50 opacity-75'
            }`}
            onClick={() => handleAudioClick(audio)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Music className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{audio.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{audio.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Play className="w-3 h-3" />
                  <span>{audio.duration}</span>
                </div>
              </div>
            </div>
            {!audio.isFree && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Disponible con acompañamiento profesional</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

