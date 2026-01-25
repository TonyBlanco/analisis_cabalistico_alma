'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Wind, Droplets, Flame, Book } from 'lucide-react';

interface LetraInfo {
  nombre: string;
  hebreo: string;
  significado: string;
  elemento: string;
  tipo: 'Madre' | 'Simple' | 'Doble';
  descripcion: string;
  meditacion: string;
  cualidad: string;
  color: string;
  icono: React.ElementType<{ className?: string }>;
}

// Sample sacred letters (subset from legacy)
const LETRAS_SAGRADAS: Record<string, LetraInfo> = {
  'א': {
    nombre: 'Alef',
    hebreo: 'א',
    significado: 'Unidad divina',
    elemento: 'Aire',
    tipo: 'Madre',
    descripcion: 'La letra madre. No tiene sonido propio: es el silencio del principio.',
    meditacion: 'Visualizo una luz blanca entrando por mi coronilla.',
    cualidad: 'Unidad • Principio • Silencio',
    color: '#E0E7FF',
    icono: Wind
  },
  'מ': {
    nombre: 'Mem',
    hebreo: 'מ',
    significado: 'Agua, fluidez emocional',
    elemento: 'Agua',
    tipo: 'Madre',
    descripcion: 'Esta letra representa el mar, el vientre, la memoria emocional.',
    meditacion: 'Imagino un océano azul profundo dentro de mí.',
    cualidad: 'Fluidez • Emoción • Memoria',
    color: '#DBEAFE',
    icono: Droplets
  },
  'ש': {
    nombre: 'Shin',
    hebreo: 'ש',
    significado: 'Fuego transformador',
    elemento: 'Fuego',
    tipo: 'Madre',
    descripcion: 'Shin es el fuego divino, la chispa que purifica.',
    meditacion: 'Visualizo una llama violeta en mi corazón.',
    cualidad: 'Transformación • Purificación • Fuego Divino',
    color: '#FEE2E2',
    icono: Flame
  },
  'ל': {
    nombre: 'Lamed',
    hebreo: 'ל',
    significado: 'Aprendizaje del alma',
    elemento: 'Libra',
    tipo: 'Simple',
    descripcion: 'Es la única letra que se eleva por encima de la línea.',
    meditacion: 'Me veo estudiando bajo un maestro invisible.',
    cualidad: 'Aprendizaje • Guía • Disciplina',
    color: '#FEF3C7',
    icono: Book
  }
};

interface LetrasDelAlmaProps {
  nombre: string;
}

export default function LetrasDelAlma({ nombre }: LetrasDelAlmaProps) {
  const [selectedLetra, setSelectedLetra] = useState<string | null>(null);

  // Extract unique letters from name (simplified)
  const extractLetters = (name: string): LetraInfo[] => {
    const letters: LetraInfo[] = [];
    // For demo, just return the mother letters
    Object.values(LETRAS_SAGRADAS).forEach(letra => {
      if (letra.tipo === 'Madre') {
        letters.push(letra);
      }
    });
    return letters;
  };

  const letras = extractLetters(nombre);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          ✡️ Letras del Alma
        </h2>
        <p className="text-purple-300">
          Las letras hebreas que resuenan en tu nombre: {nombre}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {letras.map((letra, index) => {
          const Icon = letra.icono;
          return (
            <motion.div
              key={letra.hebreo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 cursor-pointer hover:border-purple-500/50 transition-all"
              onClick={() => setSelectedLetra(letra.hebreo)}
              style={{ backgroundColor: `${letra.color}10` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: letra.color }}
                  >
                    {letra.hebreo}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {letra.nombre}
                  </h3>
                  <p className="text-sm text-purple-300 mb-2">
                    {letra.significado}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-gray-400">
                      {letra.elemento} • {letra.tipo}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300 mt-3">
                {letra.descripcion}
              </p>

              {selectedLetra === letra.hebreo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <h4 className="text-sm font-bold text-purple-300 mb-2">
                    Meditación
                  </h4>
                  <p className="text-xs text-gray-400 italic">
                    {letra.meditacion}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
