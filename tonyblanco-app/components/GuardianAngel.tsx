'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Star, Calendar, Book, Clock, Heart } from 'lucide-react';
import angelsData from '@/data/seventyTwoAngels.json';
import {
  calculateGuardianAngel,
  getAngelName,
  getAngelAttribute,
  formatPresidingDates,
  ANGELIC_ORDERS,
  extractInvocationInfo,
  translateGodName,
  type Angel
} from '@/lib/angels-system';

interface GuardianAngelProps {
  birthDate: Date | string;
  showDetails?: boolean;
}

export default function GuardianAngel({ birthDate, showDetails = true }: GuardianAngelProps) {
  const [angel, setAngel] = useState<Angel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const guardianAngel = calculateGuardianAngel(date, angelsData as Angel[]);
    setAngel(guardianAngel);
    setLoading(false);
  }, [birthDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-4xl">✨</div>
      </div>
    );
  }

  if (!angel) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
        <p className="text-gray-400 text-center">
          No se pudo determinar el ángel guardián para esta fecha.
        </p>
      </div>
    );
  }

  const angelicOrder = ANGELIC_ORDERS[angel.angelicOrderId];
  const dates = formatPresidingDates(angel.presidesOver);
  const invocationInfo = extractInvocationInfo(angel.text.en);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header con nombre del ángel */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-semibold">Tu Ángel Guardián</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {getAngelName(angel, 'en')}
            </h2>
            <p className="text-2xl text-purple-200 font-hebrew">
              {angel.name.he}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-4">
        {/* Atributo divino */}
        <div className="bg-purple-950/30 rounded-lg p-4">
          <p className="text-purple-300 text-sm mb-1">Atributo Divino</p>
          <p className="text-white text-lg font-semibold">
            {getAngelAttribute(angel, 'en')}
          </p>
        </div>

        {/* Información clave en grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de Dios */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Book className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 text-sm">Nombre de Dios</p>
            </div>
            <p className="text-white font-bold">{translateGodName(angel.godName)}</p>
          </div>

          {/* Orden Angélico */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 text-sm">Orden Angélico</p>
            </div>
            <p className="text-white font-bold">
              {angelicOrder?.name.es || angelicOrder?.name.en}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Coro {angelicOrder?.choir}
            </p>
          </div>
        </div>

        {/* Fechas de presidencia */}
        {showDetails && (
          <div className="bg-blue-950/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <p className="text-blue-300 text-sm font-semibold">Días de Presidencia</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dates.map((date, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-900/30 text-blue-200 text-xs rounded-full border border-blue-500/30"
                >
                  {date}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Información de invocación */}
        {showDetails && (invocationInfo.psalm || invocationInfo.hour) && (
          <div className="bg-purple-950/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 text-sm font-semibold">Invocación</p>
            </div>
            <div className="space-y-2 text-sm">
              {invocationInfo.psalm && (
                <p className="text-gray-300">
                  <span className="text-purple-400 font-semibold">Salmo:</span> {invocationInfo.psalm}
                </p>
              )}
              {invocationInfo.hour && (
                <p className="text-gray-300">
                  <span className="text-purple-400 font-semibold">Hora favorable:</span> {invocationInfo.hour}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cualidades y enseñanzas */}
        {showDetails && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 text-sm font-semibold">Influencia y Enseñanzas</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {angel.text.en.substring(0, 400)}...
            </p>
          </div>
        )}
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
