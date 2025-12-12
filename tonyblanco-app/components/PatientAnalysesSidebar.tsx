'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Scroll, 
  Sparkles, 
  Star, 
  Hexagon,
  Hash,
  CheckCircle,
  Circle,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';

interface AnalysisDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  path: string;
  category: 'gematria' | 'tarot' | 'numerology' | 'astrology' | 'soul-map' | 'tikun' | 'shekinah';
  order: number;
  requires?: string[]; // Prerequisitos
  related?: string[]; // Análisis relacionados
}

const ANALYSIS_DEFINITIONS: AnalysisDefinition[] = [
  {
    id: 'gematria',
    name: 'Gematria',
    description: 'Cálculo de valores numéricos hebreos (Ragil, Katan, Gadol, Atbash)',
    icon: Scroll,
    color: 'from-blue-500 to-cyan-500',
    path: '/dashboard/tools/gematria',
    category: 'gematria',
    order: 1,
  },
  {
    id: 'shekinah',
    name: 'Análisis Shejinah',
    description: 'Método Moderno Pitagórico (Atlantis) - OTD y PIN',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-500',
    path: '/dashboard/tools/shekinah',
    category: 'shekinah',
    order: 2,
  },
  {
    id: 'tarot',
    name: 'Tarot Terapéutico',
    description: 'Diagnóstico cruzado: Arcano de Vida + Tests Clínicos',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    path: '/dashboard/tools/tarot',
    category: 'tarot',
    order: 3,
    requires: ['gematria'], // Requiere tests clínicos
  },
  {
    id: 'complete-numerology',
    name: 'Numerología Completa',
    description: 'Análisis profundo: destino, alma, personalidad, karmas',
    icon: Hash,
    color: 'from-rose-500 to-pink-500',
    path: '/tests/complete-numerology',
    category: 'numerology',
    order: 4,
  },
  {
    id: 'astrology',
    name: 'Carta Astral Cabalística',
    description: 'Astrología integrada con Cábala y 72 Ángeles',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    path: '/dashboard/tools/astrology',
    category: 'astrology',
    order: 5,
    requires: ['complete-numerology'],
  },
  {
    id: 'astrology-kerykeion',
    name: 'Astrología Técnica (Kerykeion)',
    description: 'Carta Precisa - Mapa Exacto sin Interpretación',
    icon: Star,
    color: 'from-indigo-500 to-blue-500',
    path: '/dashboard/tools/astrology-kerykeion',
    category: 'astrology',
    order: 5.5,
    requires: ['astrology'], // Requiere la carta cabalística primero
  },
  {
    id: 'soul-map',
    name: 'Mapa del Alma',
    description: 'Análisis de Sefirot y diseño energético',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    path: '/dashboard/tools/soul-map',
    category: 'soul-map',
    order: 6,
    requires: ['complete-numerology'],
  },
  {
    id: 'tikun',
    name: 'Análisis de Tikún',
    description: 'Corrección del alma y misión de vida',
    icon: Hexagon,
    color: 'from-emerald-500 to-teal-500',
    path: '/dashboard/tools/tikun',
    category: 'tikun',
    order: 7,
    requires: ['soul-map'],
  },
];

interface PatientAnalysesSidebarProps {
  patientId: string;
  patientName: string;
  analyses?: any[]; // Análisis realizados
  onAnalysisSelect?: (analysisId: string) => void;
}

export default function PatientAnalysesSidebar({ 
  patientId, 
  patientName, 
  analyses = [],
  onAnalysisSelect 
}: PatientAnalysesSidebarProps) {
  const router = useRouter();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [highlightedAnalyses, setHighlightedAnalyses] = useState<string[]>([]);

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const hasAnalysisBeenDone = (analysisId: string): boolean => {
    return analyses.some(a => a.analysis_type === analysisId);
  };

  const isAnalysisAvailable = (analysisDef: AnalysisDefinition): boolean => {
    // Verificar prerequisitos
    if (analysisDef.requires) {
      return analysisDef.requires.every(req => hasAnalysisBeenDone(req));
    }
    return true;
  };

  const getRecommendedNextAnalyses = (analysisId: string): string[] => {
    const analysisDef = ANALYSIS_DEFINITIONS.find(a => a.id === analysisId);
    if (!analysisDef) return [];
    
    // Análisis relacionados que no se han hecho
    const related = (analysisDef.related || []).filter(id => !hasAnalysisBeenDone(id));
    
    // Análisis que tienen este como prerequisito
    const nextInOrder = ANALYSIS_DEFINITIONS
      .filter(a => 
        a.requires?.includes(analysisId) && 
        !hasAnalysisBeenDone(a.id) &&
        a.order > analysisDef.order
      )
      .map(a => a.id);
    
    return [...new Set([...related, ...nextInOrder])];
  };

  const handleAnalysisClick = (analysisId: string) => {
    setSelectedAnalysis(analysisId);
    const recommended = getRecommendedNextAnalyses(analysisId);
    setHighlightedAnalyses(recommended);
    
    if (onAnalysisSelect) {
      onAnalysisSelect(analysisId);
    }
    
    const analysisDef = ANALYSIS_DEFINITIONS.find(a => a.id === analysisId);
    if (!analysisDef) return;
    
    // Navegar al análisis con patientId
    router.push(`${analysisDef.path}?patientId=${patientId}`);
  };

  const getAnalysisStatus = (analysisId: string) => {
    const done = hasAnalysisBeenDone(analysisId);
    const analysisDef = ANALYSIS_DEFINITIONS.find(a => a.id === analysisId);
    const available = analysisDef ? isAnalysisAvailable(analysisDef) : true;
    const isHighlighted = highlightedAnalyses.includes(analysisId);
    const isSelected = selectedAnalysis === analysisId;
    
    return { done, available, isHighlighted, isSelected };
  };

  const sortedAnalyses = [...ANALYSIS_DEFINITIONS].sort((a, b) => a.order - b.order);
  const doneCount = sortedAnalyses.filter(a => hasAnalysisBeenDone(a.id)).length;

  return (
    <div className="w-72 bg-slate-900/50 border-r border-slate-700 h-screen sticky top-0 overflow-y-auto">
      {/* Patient Info Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {getInitials(patientName)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{patientName}</h2>
            <p className="text-gray-400 text-xs">Análisis Cabalísticos</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800/50 rounded px-2 py-1.5 text-center">
            <p className="text-gray-400 text-[10px] uppercase">Disponibles</p>
            <p className="text-white font-bold text-sm">{sortedAnalyses.length}</p>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded px-2 py-1.5 text-center">
            <p className="text-gray-400 text-[10px] uppercase">Realizados</p>
            <p className="text-white font-bold text-sm">{doneCount}</p>
          </div>
        </div>
      </div>

      {/* Analyses List */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider">
            Análisis
          </h3>
          <Badge variant="outline" className="bg-slate-800/50 text-gray-400 border-slate-700 text-[10px] px-1.5 py-0">
            {sortedAnalyses.filter(a => isAnalysisAvailable(a)).length}
          </Badge>
        </div>

        <div className="space-y-1.5">
          {sortedAnalyses.map((analysisDef) => {
            const Icon = analysisDef.icon;
            const { done, available, isHighlighted, isSelected } = getAnalysisStatus(analysisDef.id);
            const canDo = !done && available;
            
            return (
              <button
                key={analysisDef.id}
                onClick={() => canDo && handleAnalysisClick(analysisDef.id)}
                disabled={!canDo}
                className={`w-full text-left p-2 rounded-md border transition-all relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : isHighlighted
                    ? 'border-purple-500 bg-purple-500/10'
                    : done
                    ? 'border-green-700/50 bg-green-900/10 opacity-70'
                    : available
                    ? 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                    : 'border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : canDo ? (
                      <Circle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                  </div>

                  {/* Icon + Name */}
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${analysisDef.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>

                  {/* Analysis Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-xs truncate ${
                      done ? 'text-green-400' : 
                      isHighlighted ? 'text-purple-400' :
                      canDo ? 'text-white' : 'text-gray-500'
                    }`}>
                      {analysisDef.name}
                    </h4>
                  </div>

                  {/* Order number badge */}
                  {!done && (
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isHighlighted
                        ? 'bg-purple-500 text-white'
                        : canDo
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}>
                      {analysisDef.order}
                    </div>
                  )}
                </div>

                {/* Description on hover/selected */}
                {(isSelected || isHighlighted) && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700">
                    <p className="text-gray-400 text-[10px] line-clamp-2 mb-1">
                      {analysisDef.description}
                    </p>
                    {isHighlighted && (
                      <span className="text-purple-400 text-[10px] flex items-center gap-0.5">
                        <ArrowRight className="w-2.5 h-2.5" />
                        Recomendado
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        {selectedAnalysis && highlightedAnalyses.length > 0 && (
          <div className="mt-3 p-2 bg-purple-900/20 border border-purple-700/50 rounded-md">
            <div className="flex items-start gap-1.5">
              <Zap className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-purple-200">
                <p className="font-semibold mb-1">Siguiente:</p>
                <ul className="space-y-0.5">
                  {highlightedAnalyses.slice(0, 3).map(id => {
                    const analysis = ANALYSIS_DEFINITIONS.find(a => a.id === id);
                    return analysis ? (
                      <li key={id} className="flex items-center gap-1">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span className="truncate">{analysis.name}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

