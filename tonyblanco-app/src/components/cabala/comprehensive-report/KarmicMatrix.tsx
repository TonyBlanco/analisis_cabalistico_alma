'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface InclusionBase {
  casas?: Record<string, number>;
  numeros_dominantes?: string[];
  numeros_ausentes?: string[];
  maestrias?: string[];
}

interface KarmicMatrixProps {
  inclusion?: InclusionBase;
}

export default function KarmicMatrix({ inclusion }: KarmicMatrixProps) {
  if (!inclusion || !inclusion.casas) {
    return null;
  }

  const { casas, numeros_dominantes = [], numeros_ausentes = [], maestrias = [] } = inclusion;

  const getCellColor = (freq: number, num: string) => {
    if (freq === 0) {
      return 'bg-red-900/30 border-red-500/50 shadow-red-500/20 shadow-lg animate-pulse';
    }
    if (freq >= 3) {
      return 'bg-green-900/30 border-green-500/50 shadow-green-500/20';
    }
    return 'bg-slate-800/50 border-slate-600/30';
  };

  const getTextColor = (freq: number) => {
    if (freq === 0) return 'text-red-300';
    if (freq >= 3) return 'text-green-300';
    return 'text-gray-300';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          🏠 Matriz Kármica (Inclusión 1-9)
        </h2>
        <p className="text-purple-300">
          La frecuencia de cada número en tu fecha de nacimiento revela lecciones y dones
        </p>
      </motion.div>

      {/* Grid of numbers */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
      >
        {Object.entries(casas)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([num, freq], index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative rounded-xl p-6 border-2 ${getCellColor(freq, num)} transition-all duration-300 hover:scale-105`}
            >
              <div className="text-center">
                <p className={`text-4xl font-bold mb-2 ${getTextColor(freq)}`}>
                  {num}
                </p>
                <p className="text-sm text-gray-400">
                  {freq === 0 ? 'Ausente' : `× ${freq}`}
                </p>
              </div>

              {/* Karma indicator */}
              {freq === 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Mastery indicator */}
              {freq >= 3 && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {numeros_ausentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl bg-red-900/20 border border-red-500/30 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-bold text-red-300">Karmas (Ausentes)</h3>
            </div>
            <p className="text-2xl font-bold text-red-200">
              {numeros_ausentes.join(', ')}
            </p>
            <p className="text-xs text-red-300/70 mt-1">
              Lecciones pendientes del alma
            </p>
          </motion.div>
        )}

        {numeros_dominantes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl bg-blue-900/20 border border-blue-500/30 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-blue-300">Números Dominantes</h3>
            </div>
            <p className="text-2xl font-bold text-blue-200">
              {numeros_dominantes.join(', ')}
            </p>
            <p className="text-xs text-blue-300/70 mt-1">
              Energías presentes en tu vida
            </p>
          </motion.div>
        )}

        {maestrias.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl bg-green-900/20 border border-green-500/30 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="font-bold text-green-300">Maestrías (3+)</h3>
            </div>
            <p className="text-2xl font-bold text-green-200">
              {maestrias.join(', ')}
            </p>
            <p className="text-xs text-green-300/70 mt-1">
              Dones y talentos naturales
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
