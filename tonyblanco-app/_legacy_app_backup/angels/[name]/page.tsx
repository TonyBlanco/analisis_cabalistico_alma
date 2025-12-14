'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Calendar, Clock, Book, Sparkles, Crown } from 'lucide-react';
import angelsData from '@/data/seventyTwoAngels.json';
import { getAngelSpanish, getAngelDescription } from '@/data/angels-translations';
import { formatPresidingDates, extractInvocationInfo, ANGELIC_ORDERS, type Angel } from '@/lib/angels-system';
import { enableAngelNotifications, loadNotifications } from '@/lib/angel-notifications';
import AngelMeditation from '@/components/AngelMeditation';

interface PageProps {
  params: Promise<{ name: string }>;
}

// Función para calcular próximas fechas
function getUpcomingPresidingDates(angel: Angel, count: number = 5): Date[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const dates: Date[] = [];

  for (let year = currentYear; year <= currentYear + 2 && dates.length < count; year++) {
    for (const [month, day] of angel.presidesOver) {
      const date = new Date(year, month - 1, day);
      if (date > today) {
        dates.push(date);
        if (dates.length >= count) break;
      }
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime()).slice(0, count);
}

export default function AngelPage({ params }: PageProps) {
  const router = useRouter();
  const { name } = use(params);
  
  const [angel, setAngel] = useState<Angel | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Buscar el ángel por nombre
    const foundAngel = (angelsData as Angel[]).find(
      (a: Angel) => a.name.en.toLowerCase() === name.toLowerCase() ||
           a.name.he === name
    );

    if (foundAngel) {
      setAngel(foundAngel);
      
      // Verificar si tiene notificaciones activas
      const notifications = loadNotifications();
      const hasActive = notifications.some(
        n => n.angel.name.en.toLowerCase() === foundAngel.name.en.toLowerCase() && n.enabled
      );
      setNotificationsEnabled(hasActive);
    }
  }, [name]);

  const handleEnableNotifications = async () => {
    if (!angel) return;
    
    await enableAngelNotifications(angel, {
      enabled: true,
      time: '09:00',
      sound: true,
      vibration: true,
      showOnLockScreen: true
    });
    
    setNotificationsEnabled(true);
  };

  if (!angel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Ángel no encontrado</p>
          <button
            onClick={() => router.push('/angels')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Volver a los 72 Ángeles
          </button>
        </div>
      </div>
    );
  }

  const spanishData = getAngelSpanish(angel.name.en);
  const description = getAngelDescription(angel.name.en);
  const invocationInfo = extractInvocationInfo(angel.text.en);
  const upcomingDates = getUpcomingPresidingDates(angel, 5);
  
  // Calcular el número del ángel (order) basado en su posición en el array
  const angelOrder = (angelsData as Angel[]).findIndex(
    (a: Angel) => a.name.en === angel.name.en
  ) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón de regreso */}
        <button
          onClick={() => router.push('/angels')}
          className="mb-6 flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a los 72 Ángeles
        </button>

        {/* Header del ángel */}
        <div className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{angel.name.en}</h1>
                  <p className="text-3xl font-hebrew text-purple-300">{angel.name.he}</p>
                </div>
              </div>

              {spanishData && (
                <div className="space-y-2">
                  <p className="text-xl text-purple-200 font-semibold">
                    {spanishData.attribute.es}
                  </p>
                  <p className="text-gray-300">
                    {description}
                  </p>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Número</p>
              <p className="text-4xl font-bold text-white">#{angelOrder}</p>
            </div>
          </div>

          {/* Información del ángel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-sm">Nombre de Dios</p>
              </div>
              <p className="text-white font-semibold">{angel.godName}</p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-400" />
                <p className="text-gray-400 text-sm">Orden Angélico</p>
              </div>
              <p className="text-white font-semibold">
                {ANGELIC_ORDERS[angel.angelicOrderId]?.name.es || 'No especificado'}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-5 h-5 text-blue-400" />
                <p className="text-gray-400 text-sm">Invocación</p>
              </div>
              <p className="text-white font-semibold">
                {invocationInfo.psalm && `Salmo ${invocationInfo.psalm}`}
                {invocationInfo.hour && ` • ${invocationInfo.hour}`}
              </p>
            </div>
          </div>

          {/* Fechas de presidencia */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold">Días de Presidencia</h3>
              </div>
              
              {!notificationsEnabled ? (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Activar notificaciones
                </button>
              ) : (
                <span className="text-green-400 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Notificaciones activas
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {formatPresidingDates(angel.presidesOver).map((date, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded-lg p-3 text-center border border-purple-500/20"
                >
                  <p className="text-purple-300 text-sm font-semibold">{date}</p>
                </div>
              ))}
            </div>

            {upcomingDates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-gray-400 text-sm mb-2">Próximas fechas:</p>
                <div className="flex flex-wrap gap-2">
                  {upcomingDates.map((date: Date, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Componente de meditación */}
        <AngelMeditation angel={angel} />

        {/* Atributo original en inglés */}
        <div className="mt-6 bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-400" />
            Atributo (Inglés)
          </h3>
          <p className="text-purple-200 italic">{angel.attribute.en}</p>
        </div>
      </div>

      <style jsx global>{`
        .font-hebrew {
          font-family: 'David Libre', 'Times New Roman', serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
