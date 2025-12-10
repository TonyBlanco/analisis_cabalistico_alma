'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Heart, Eye } from 'lucide-react';
import { getAngelMeditation, getAngelInvocation, ANGELS_SPANISH } from '@/data/angels-translations';
import type { Angel } from '@/lib/angels-system';

interface AngelMeditationProps {
  angel: Angel;
  autoPlay?: boolean;
}

export default function AngelMeditation({ angel, autoPlay = false }: AngelMeditationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'preparation' | 'invocation' | 'meditation' | 'closing'>('preparation');
  const [isMuted, setIsMuted] = useState(false);

  const angelData = ANGELS_SPANISH[angel.name.en];
  
  if (!angelData) {
    return <div className="text-gray-400">Meditación no disponible para este ángel.</div>;
  }

  const phases = {
    preparation: {
      title: 'Preparación',
      duration: 60, // segundos
      icon: Heart,
      text: 'Siéntate en un lugar tranquilo. Cierra tus ojos suavemente. Respira profundamente tres veces, inhalando luz y exhalando tensión.',
      color: 'blue'
    },
    invocation: {
      title: 'Invocación',
      duration: 90,
      icon: Sparkles,
      text: angelData.invocation.es,
      color: 'purple'
    },
    meditation: {
      title: 'Meditación',
      duration: 300, // 5 minutos
      icon: Eye,
      text: angelData.meditation.es,
      color: 'indigo'
    },
    closing: {
      title: 'Cierre',
      duration: 60,
      icon: Heart,
      text: 'Agradece al ángel su presencia. Respira profundamente tres veces. Cuando estés listo, abre los ojos lentamente. Lleva contigo la luz del ángel durante todo el día.',
      color: 'pink'
    }
  };

  const currentPhase = phases[phase];
  const totalDuration = Object.values(phases).reduce((sum, p) => sum + p.duration, 0);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / totalDuration);
        
        // Cambiar de fase según el progreso
        if (newProgress >= 100) {
          setIsPlaying(false);
          return 100;
        }
        
        const elapsed = (newProgress / 100) * totalDuration;
        if (elapsed < phases.preparation.duration) {
          setPhase('preparation');
        } else if (elapsed < phases.preparation.duration + phases.invocation.duration) {
          setPhase('invocation');
        } else if (elapsed < phases.preparation.duration + phases.invocation.duration + phases.meditation.duration) {
          setPhase('meditation');
        } else {
          setPhase('closing');
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
      setPhase('preparation');
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setPhase('preparation');
  };

  const Icon = currentPhase.icon;

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-6 border-b border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Meditación Guiada</h3>
            <p className="text-purple-300">con el Ángel {angel.name.en}</p>
            <p className="text-purple-200 font-hebrew text-sm">{angel.name.he}</p>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span className="capitalize">{currentPhase.title}</span>
            <span>{Math.floor((progress / 100) * totalDuration / 60)}:{String(Math.floor(((progress / 100) * totalDuration) % 60)).padStart(2, '0')} / {Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-${currentPhase.color}-500 to-${currentPhase.color}-400 transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido de la fase actual */}
      <div className="p-8">
        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 min-h-[200px] flex items-center justify-center">
          <p className="text-gray-200 text-center leading-relaxed text-lg">
            {currentPhase.text}
          </p>
        </div>

        {/* Indicadores de fase */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(phases).map(([key, phaseData]) => (
            <div
              key={key}
              className={`text-center p-3 rounded-lg transition-all ${
                phase === key
                  ? `bg-${phaseData.color}-900/30 border-2 border-${phaseData.color}-500`
                  : 'bg-slate-800/30 border border-slate-700'
              }`}
            >
              <phaseData.icon className={`w-5 h-5 mx-auto mb-1 ${
                phase === key ? `text-${phaseData.color}-400` : 'text-gray-500'
              }`} />
              <p className={`text-xs ${
                phase === key ? `text-${phaseData.color}-300` : 'text-gray-500'
              }`}>
                {phaseData.title}
              </p>
            </div>
          ))}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            Reiniciar
          </button>
          
          <button
            onClick={handlePlayPause}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-3"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                {progress > 0 ? 'Continuar' : 'Comenzar'}
              </>
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Audio de pronunciación */}
        {angelData.audioUrl && (
          <div className="mt-6 bg-purple-950/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-semibold mb-1">Pronunciación del nombre sagrado</p>
                <p className="text-gray-400 text-xs">Escucha cómo se pronuncia {angel.name.en} ({angel.name.he}) en hebreo</p>
              </div>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  const audio = new Audio(angelData.audioUrl);
                  audio.play();
                }}
              >
                <Volume2 className="w-4 h-4" />
                Escuchar
              </button>
            </div>
          </div>
        )}

        {/* Cualidades del ángel */}
        <div className="mt-6 bg-indigo-950/30 rounded-lg p-4">
          <p className="text-indigo-300 text-sm font-semibold mb-3">Cualidades que despierta esta meditación:</p>
          <div className="flex flex-wrap gap-2">
            {angelData.qualities.map((quality, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-900/30 text-indigo-200 text-sm rounded-full border border-indigo-500/30"
              >
                {quality}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
