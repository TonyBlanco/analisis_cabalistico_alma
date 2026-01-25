'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, Star, Target, Heart } from 'lucide-react';

interface TarotCard {
  valor: number | string;
  numero?: number;
  arbol?: {
    nombre_es?: string;
    nombre_tarot?: string;
    significado?: string;
  };
}

interface ArcanaGridProps {
  esencia?: TarotCard;
  expresion?: TarotCard;
  herencia?: TarotCard;
  destino?: TarotCard;
  caminoVida?: TarotCard;
}

interface CardDisplayProps {
  title: string;
  card: TarotCard;
  icon: React.ElementType<{ className?: string }>;
  gradient: string;
  delay: number;
}

function CardDisplay({ title, card, icon: Icon, gradient, delay }: CardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      className="perspective-1000"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative h-64 cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-2xl border border-white/20 backdrop-blur-sm`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white">
            <Icon className="h-12 w-12 mb-4 drop-shadow-lg" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="text-5xl font-bold mb-2">{card.valor}</div>
            {card.arbol && (
              <p className="text-sm text-center font-medium opacity-90">
                {card.arbol.nombre_es || card.arbol.nombre_tarot}
              </p>
            )}
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 rounded-xl bg-slate-900/95 backdrop-blur-sm p-6 shadow-2xl border border-white/20"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="flex flex-col h-full text-white">
            <h4 className="text-sm font-bold text-purple-300 mb-2">{title}</h4>
            <p className="text-xs text-gray-300 mb-3">
              {card.arbol?.nombre_es || card.arbol?.nombre_tarot}
            </p>
            <p className="text-sm text-gray-200 flex-1 overflow-y-auto">
              {card.arbol?.significado || 'Significado del arcano en tu vida espiritual'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ArcanaGrid({
  esencia,
  expresion,
  herencia,
  destino,
  caminoVida
}: ArcanaGridProps) {
  if (!esencia && !expresion && !herencia && !destino) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          🎴 Cartas del Alma (Tarot)
        </h2>
        <p className="text-purple-300">
          Los arcanos que definen tu esencia y camino espiritual
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {esencia && (
          <CardDisplay
            title="✨ Esencia del Alma"
            card={esencia}
            icon={Sparkles}
            gradient="from-purple-600 to-purple-800"
            delay={0.1}
          />
        )}

        {expresion && (
          <CardDisplay
            title="🗣️ Expresión"
            card={expresion}
            icon={Star}
            gradient="from-blue-600 to-blue-800"
            delay={0.2}
          />
        )}

        {herencia && (
          <CardDisplay
            title="🧬 Herencia"
            card={herencia}
            icon={Heart}
            gradient="from-green-600 to-green-800"
            delay={0.3}
          />
        )}

        {destino && (
          <CardDisplay
            title="🎯 Destino"
            card={destino}
            icon={Target}
            gradient="from-yellow-600 to-yellow-800"
            delay={0.4}
          />
        )}

        {caminoVida && (
          <CardDisplay
            title="⏳ Edad de Transformación"
            card={caminoVida}
            icon={Target}
            gradient="from-red-600 to-red-800"
            delay={0.5}
          />
        )}
      </div>
    </div>
  );
}
