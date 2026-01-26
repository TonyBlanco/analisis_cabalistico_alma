'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import the Tree component to avoid SSR issues
const TreeOfLifeVisualizer = dynamic(
  () => import('@/src/components/tree/tree_of_life_visualizer'),
  { ssr: false }
);

interface TreeWrapperProps {
  numeros_principales?: {
    esencia?: { numero?: number; valor?: number };
    expresion?: { numero?: number; valor?: number };
    herencia?: { numero?: number; valor?: number };
    destino?: { numero?: number; valor?: number };
    camino_vida?: { valor?: number };
  };
}

export default function TreeWrapper({ numeros_principales }: TreeWrapperProps) {
  if (!numeros_principales) {
    return null;
  }

  const { esencia, expresion, herencia, destino, camino_vida } = numeros_principales;

  // Convert numbers to strings for the tree component
  const treeNumbers = {
    esencia: String(esencia?.numero || esencia?.valor || ''),
    expresion: String(expresion?.numero || expresion?.valor || ''),
    herencia: String(herencia?.numero || herencia?.valor || ''),
    destino: String(destino?.numero || destino?.valor || ''),
    caminoVida: String(camino_vida?.valor || '')
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          🌳 Árbol de la Vida - Tu Mapa del Alma
        </h2>
        <p className="text-purple-300">
          Las esferas sagradas (Sefirot) iluminadas por tu esencia
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8"
      >
        <TreeOfLifeVisualizer initial={treeNumbers} />
      </motion.div>
    </div>
  );
}
