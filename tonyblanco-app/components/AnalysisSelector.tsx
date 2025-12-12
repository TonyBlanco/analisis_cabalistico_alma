'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Scroll, 
  Sparkles, 
  Star, 
  Hexagon,
  Hash,
  X
} from 'lucide-react';

interface AnalysisSelectorProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

const AVAILABLE_ANALYSES = [
  {
    id: 'gematria',
    name: 'Gematria',
    description: 'Cálculo de valores numéricos hebreos (Ragil, Katan, Gadol, Atbash)',
    icon: Scroll,
    color: 'from-blue-500 to-cyan-500',
    path: '/dashboard/tools/gematria',
  },
  {
    id: 'shekinah',
    name: 'Análisis Shejinah',
    description: 'Método Moderno Pitagórico (Atlantis) - OTD y PIN',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-500',
    path: '/dashboard/tools/shekinah',
  },
  {
    id: 'tarot',
    name: 'Tarot Terapéutico',
    description: 'Diagnóstico cruzado: Arcano de Vida + Tests Clínicos',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    path: '/dashboard/tools/tarot',
  },
  {
    id: 'complete-numerology',
    name: 'Numerología Completa',
    description: 'Análisis profundo: destino, alma, personalidad, karmas',
    icon: Hash,
    color: 'from-rose-500 to-pink-500',
    path: '/tests/complete-numerology',
  },
  {
    id: 'astrology',
    name: 'Carta Astral Cabalística',
    description: 'Astrología integrada con Cábala y 72 Ángeles',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    path: '/dashboard/tools/astrology',
  },
  {
    id: 'astrology-kerykeion',
    name: 'Astrología Técnica (Kerykeion)',
    description: 'Carta Precisa - Mapa Exacto sin Interpretación',
    icon: Star,
    color: 'from-indigo-500 to-blue-500',
    path: '/dashboard/tools/astrology-kerykeion',
  },
  {
    id: 'soul-map',
    name: 'Mapa del Alma',
    description: 'Análisis de Sefirot y diseño energético',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    path: '/dashboard/tools/soul-map',
  },
  {
    id: 'tikun',
    name: 'Análisis de Tikún',
    description: 'Corrección del alma y misión de vida',
    icon: Hexagon,
    color: 'from-emerald-500 to-teal-500',
    path: '/dashboard/tools/tikun',
  },
];

export default function AnalysisSelector({ patientId, patientName, onClose }: AnalysisSelectorProps) {
  const router = useRouter();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  const handleStartAnalysis = () => {
    if (!selectedAnalysis) return;
    
    const analysis = AVAILABLE_ANALYSES.find(a => a.id === selectedAnalysis);
    if (analysis) {
      router.push(`${analysis.path}?patientId=${patientId}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Asignar Análisis Cabalístico
              </h2>
              <p className="text-gray-400 text-sm">
                Selecciona un análisis para {patientName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {AVAILABLE_ANALYSES.map((analysis) => {
              const Icon = analysis.icon;
              const isSelected = selectedAnalysis === analysis.id;
              
              return (
                <button
                  key={analysis.id}
                  onClick={() => setSelectedAnalysis(analysis.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${analysis.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{analysis.name}</h3>
                      <p className="text-gray-400 text-sm">{analysis.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStartAnalysis}
              disabled={!selectedAnalysis}
              className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              Iniciar Análisis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

