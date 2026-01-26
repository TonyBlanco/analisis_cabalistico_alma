'use client';

import { motion } from 'framer-motion';

interface Vibration {
  numero?: number;
  descripcion?: string;
  tipo?: string;
}

interface VibrationTableProps {
  vibraciones?: {
    secundarias?: Vibration[];
    activas?: Vibration[];
    pasivas?: Vibration[];
  };
}

export default function VibrationTable({ vibraciones }: VibrationTableProps) {
  if (!vibraciones) {
    return null;
  }

  const { secundarias = [], activas = [], pasivas = [] } = vibraciones;
  
  const allVibrations = [
    ...secundarias.map(v => ({ ...v, category: 'Secundaria' })),
    ...activas.map(v => ({ ...v, category: 'Activa' })),
    ...pasivas.map(v => ({ ...v, category: 'Pasiva' }))
  ];

  if (allVibrations.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Secundaria':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Activa':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Pasiva':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          🌊 Vibraciones del Alma
        </h2>
        <p className="text-purple-300">
          Energías secundarias que influyen en tu camino
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">
                  Categoría
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-300">
                  Número
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allVibrations.map((vibration, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        vibration.category
                      )}`}
                    >
                      {vibration.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl font-bold text-white">
                      {vibration.numero || vibration.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {vibration.descripcion || 'Vibración espiritual'}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {allVibrations.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-400">
            <p>No hay vibraciones secundarias registradas</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
