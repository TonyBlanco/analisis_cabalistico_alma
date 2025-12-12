'use client';

import { useState } from 'react';
import { X, Hash, AlertTriangle, TreePine, BookOpen } from 'lucide-react';

interface InterpretationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'numbers' | 'karmas' | 'sefirot';

const MEANINGS = {
  numbers: {
    title: 'Números Base (1-9)',
    description: 'Cada número representa una energía arquetípica que influye en tu vida. Aquí están sus significados principales:',
    items: [
      {
        number: 1,
        positive: 'Liderazgo, independencia, iniciativa, originalidad',
        negative: 'Egoísmo, autoritarismo, falta de cooperación',
        energy: 'Energía de creación y comienzo'
      },
      {
        number: 2,
        positive: 'Cooperación, diplomacia, sensibilidad, equilibrio',
        negative: 'Dependencia, indecisión, pasividad excesiva',
        energy: 'Energía de unión y armonía'
      },
      {
        number: 3,
        positive: 'Creatividad, expresión, comunicación, optimismo',
        negative: 'Superficialidad, dispersión, falta de enfoque',
        energy: 'Energía de manifestación y expresión'
      },
      {
        number: 4,
        positive: 'Estabilidad, organización, trabajo, disciplina',
        negative: 'Rigidez, limitación, resistencia al cambio',
        energy: 'Energía de estructura y fundamento'
      },
      {
        number: 5,
        positive: 'Libertad, aventura, versatilidad, cambio',
        negative: 'Inestabilidad, impulsividad, falta de compromiso',
        energy: 'Energía de transformación y movimiento'
      },
      {
        number: 6,
        positive: 'Responsabilidad, servicio, amor, armonía familiar',
        negative: 'Sobreprotección, sacrificio excesivo, dependencia',
        energy: 'Energía de cuidado y servicio'
      },
      {
        number: 7,
        positive: 'Sabiduría, introspección, espiritualidad, análisis',
        negative: 'Aislamiento, escepticismo, desconexión emocional',
        energy: 'Energía de búsqueda interior y verdad'
      },
      {
        number: 8,
        positive: 'Poder, materialización, autoridad, logros',
        negative: 'Ambición desmedida, materialismo, control excesivo',
        energy: 'Energía de manifestación material'
      },
      {
        number: 9,
        positive: 'Compasión, generosidad, sabiduría, completitud',
        negative: 'Sacrificio excesivo, idealismo desmedido, dispersión',
        energy: 'Energía de servicio universal y completitud'
      }
    ]
  },
  karmas: {
    title: 'Karmas (Lecciones del Alma)',
    description: 'Los números ausentes en tu nombre representan lecciones kármicas que tu alma necesita aprender en esta encarnación. No son castigos, sino oportunidades de crecimiento:',
    concepts: [
      {
        concept: '¿Qué son los Karmas?',
        explanation: 'Los números kármicos son aquellos que NO aparecen en tu nombre completo. Representan energías que tu alma necesita desarrollar y equilibrar en esta vida.'
      },
      {
        concept: 'No son Castigos',
        explanation: 'Los karmas no son negativos. Son áreas de crecimiento donde tu alma ha elegido aprender y evolucionar. Son oportunidades de desarrollo espiritual.'
      },
      {
        concept: 'Cómo Trabajarlos',
        explanation: 'Para trabajar un karma, integra conscientemente las cualidades positivas de ese número en tu vida. Por ejemplo, si te falta el 2, trabaja en la cooperación y la sensibilidad.'
      },
      {
        concept: 'El Propósito',
        explanation: 'Cada karma ausente es una lección específica que tu alma necesita aprender para completar su evolución en esta encarnación.'
      }
    ]
  },
  sefirot: {
    title: 'Sefirot (Árbol de la Vida)',
    description: 'Los Sefirot son 10 emanaciones o canales de energía divina en la Cábala. Cada número se conecta con un Sefirá específico del Árbol de la Vida:',
    items: [
      {
        sefira: 'Keter (Corona)',
        number: null,
        meaning: 'La voluntad divina, el propósito superior, la conexión con lo infinito',
        color: 'Blanco puro'
      },
      {
        sefira: 'Chokmah (Sabiduría)',
        number: null,
        meaning: 'Sabiduría pura, el principio masculino, la fuerza creativa',
        color: 'Azul brillante'
      },
      {
        sefira: 'Binah (Entendimiento)',
        number: null,
        meaning: 'Comprensión profunda, el principio femenino, la forma y estructura',
        color: 'Negro'
      },
      {
        sefira: 'Chesed (Misericordia)',
        number: 4,
        meaning: 'Amor incondicional, generosidad, expansión, gracia divina',
        color: 'Azul'
      },
      {
        sefira: 'Gevurah (Rigor)',
        number: 5,
        meaning: 'Justicia, disciplina, límites necesarios, fuerza',
        color: 'Rojo'
      },
      {
        sefira: 'Tiferet (Belleza)',
        number: 6,
        meaning: 'Armonía, equilibrio, belleza, el corazón del Árbol',
        color: 'Amarillo'
      },
      {
        sefira: 'Netzach (Victoria)',
        number: 7,
        meaning: 'Perseverancia, victoria, naturaleza, instintos',
        color: 'Verde'
      },
      {
        sefira: 'Hod (Gloria)',
        number: 8,
        meaning: 'Gloria, esplendor, intelecto, comunicación',
        color: 'Naranja'
      },
      {
        sefira: 'Yesod (Fundamento)',
        number: 9,
        meaning: 'Fundamento, base, conexión entre lo espiritual y material',
        color: 'Violeta'
      },
      {
        sefira: 'Malkuth (Reino)',
        number: null,
        meaning: 'El mundo físico, la manifestación, la realidad material',
        color: 'Amarillo oscuro'
      }
    ]
  }
};

export default function InterpretationModal({ isOpen, onClose }: InterpretationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('numbers');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tabs = [
    { id: 'numbers' as TabType, label: 'Números Base', icon: Hash },
    { id: 'karmas' as TabType, label: 'Karmas', icon: AlertTriangle },
    { id: 'sefirot' as TabType, label: 'Sefirot', icon: TreePine },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-purple-500 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Guía de Interpretación</h2>
              <p className="text-sm text-slate-400">Aprende a entender tus números cabalísticos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-b-2 border-amber-500 bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'numbers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{MEANINGS.numbers.title}</h3>
                <p className="text-slate-300 mb-6">{MEANINGS.numbers.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEANINGS.numbers.items.map((item) => (
                  <div
                    key={item.number}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">{item.number}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Número {item.number}</h4>
                    </div>
                    <p className="text-xs text-amber-400 mb-2 font-medium">{item.energy}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-green-400 font-semibold mb-1">✓ Positivo:</p>
                        <p className="text-sm text-slate-300">{item.positive}</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 font-semibold mb-1">⚠ Negativo:</p>
                        <p className="text-sm text-slate-400">{item.negative}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'karmas' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{MEANINGS.karmas.title}</h3>
                <p className="text-slate-300 mb-6">{MEANINGS.karmas.description}</p>
              </div>
              <div className="space-y-4">
                {MEANINGS.karmas.concepts.map((concept, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border-l-4 border-purple-500 rounded-lg p-5"
                  >
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">
                      {concept.concept}
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{concept.explanation}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-amber-900/30 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-purple-200 italic">
                  💡 <strong>Recuerda:</strong> Los karmas son oportunidades de crecimiento, no limitaciones. 
                  Tu alma ha elegido estas lecciones para evolucionar espiritualmente.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sefirot' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{MEANINGS.sefirot.title}</h3>
                <p className="text-slate-300 mb-6">{MEANINGS.sefirot.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEANINGS.sefirot.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">{item.sefira}</h4>
                      {item.number && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold">
                          {item.number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{item.meaning}</p>
                    {item.color && (
                      <p className="text-xs text-slate-400">
                        Color: <span className="text-slate-300">{item.color}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-gradient-to-r from-amber-900/30 to-purple-900/30 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-200">
                  🌳 <strong>El Árbol de la Vida</strong> es un mapa de la conciencia que conecta 
                  lo divino con lo material. Cada Sefirá es un canal de energía que influye en 
                  diferentes aspectos de tu vida.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}


