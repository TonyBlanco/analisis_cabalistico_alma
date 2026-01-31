/**
 * ArbolVivoPanel.tsx - INNOVACIÓN 13: Árbol Vivo (Gamificación Terapéutica)
 * 
 * Visualización del Árbol que "crece" conforme el consultante:
 * - Completa prácticas
 * - Integra Sefirot trabajadas
 * - Avanza en su proceso
 * - Logra objetivos terapéuticos
 * 
 * Valor terapéutico: Motivación tangible, sentido de logro,
 * visualización del crecimiento personal.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TreeDeciduous,
  Sparkles,
  Trophy,
  Star,
  Heart,
  Flame,
  Target,
  ChevronRight,
  Loader2,
  Info,
  RefreshCw,
  Plus,
  Check
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ==============================================================================
// TYPES
// ==============================================================================

type SefiraName = 'keter' | 'chokmah' | 'binah' | 'chesed' | 'gevurah' | 'tiferet' | 'netzach' | 'hod' | 'yesod' | 'malkuth';

interface SefiraProgress {
  sefira: SefiraName;
  level: number; // 0-100
  practices_completed: number;
  insights_gained: number;
  is_illuminated: boolean;
  last_activity?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  category: 'exploration' | 'practice' | 'integration' | 'mastery';
}

interface TherapeuticMilestone {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  sefira_association?: SefiraName;
}

interface ArbolVivoState {
  overall_growth: number; // 0-100 percentage
  sefirot_progress: SefiraProgress[];
  achievements: Achievement[];
  milestones: TherapeuticMilestone[];
  total_practices: number;
  total_sessions: number;
  days_active: number;
  current_streak: number;
  tree_stage: 'seed' | 'sprout' | 'sapling' | 'growing' | 'flourishing' | 'majestic';
}

interface ArbolVivoPanelProps {
  consultantUuid?: string;
  consultantName?: string;
  onProgressUpdate?: (state: ArbolVivoState) => void;
}

// ==============================================================================
// CONSTANTS
// ==============================================================================

const SEFIROT_POSITIONS: Record<SefiraName, { x: number; y: number }> = {
  keter: { x: 50, y: 5 },
  chokmah: { x: 75, y: 15 },
  binah: { x: 25, y: 15 },
  chesed: { x: 75, y: 35 },
  gevurah: { x: 25, y: 35 },
  tiferet: { x: 50, y: 45 },
  netzach: { x: 75, y: 60 },
  hod: { x: 25, y: 60 },
  yesod: { x: 50, y: 75 },
  malkuth: { x: 50, y: 92 }
};

const SEFIROT_INFO: Record<SefiraName, { name: string; color: string; glowColor: string }> = {
  keter: { name: 'Kéter', color: '#FFFFFF', glowColor: 'rgba(255,255,255,0.8)' },
  chokmah: { name: 'Jojmá', color: '#A0A0A0', glowColor: 'rgba(160,160,160,0.8)' },
  binah: { name: 'Biná', color: '#1a1a2e', glowColor: 'rgba(26,26,46,0.8)' },
  chesed: { name: 'Jésed', color: '#3B82F6', glowColor: 'rgba(59,130,246,0.8)' },
  gevurah: { name: 'Gevurá', color: '#EF4444', glowColor: 'rgba(239,68,68,0.8)' },
  tiferet: { name: 'Tiféret', color: '#F59E0B', glowColor: 'rgba(245,158,11,0.8)' },
  netzach: { name: 'Nétzaj', color: '#10B981', glowColor: 'rgba(16,185,129,0.8)' },
  hod: { name: 'Hod', color: '#F97316', glowColor: 'rgba(249,115,22,0.8)' },
  yesod: { name: 'Yesod', color: '#8B5CF6', glowColor: 'rgba(139,92,246,0.8)' },
  malkuth: { name: 'Maljut', color: '#92400E', glowColor: 'rgba(146,64,14,0.8)' }
};

const TREE_STAGES: Record<ArbolVivoState['tree_stage'], { label: string; emoji: string; description: string }> = {
  seed: { label: 'Semilla', emoji: '🌱', description: 'Tu viaje está comenzando' },
  sprout: { label: 'Brote', emoji: '🌿', description: 'Los primeros pasos de crecimiento' },
  sapling: { label: 'Arbolito', emoji: '🌳', description: 'Echando raíces profundas' },
  growing: { label: 'En Crecimiento', emoji: '🌲', description: 'Expandiéndote con fuerza' },
  flourishing: { label: 'Floreciendo', emoji: '🌸', description: 'Manifestando tu potencial' },
  majestic: { label: 'Majestuoso', emoji: '✨🌳✨', description: 'Plenitud del Árbol de la Vida' }
};

const ACHIEVEMENT_CATEGORIES: Record<Achievement['category'], { label: string; color: string }> = {
  exploration: { label: 'Exploración', color: 'bg-blue-100 text-blue-700' },
  practice: { label: 'Práctica', color: 'bg-green-100 text-green-700' },
  integration: { label: 'Integración', color: 'bg-purple-100 text-purple-700' },
  mastery: { label: 'Maestría', color: 'bg-amber-100 text-amber-700' }
};

// ==============================================================================
// COMPONENT
// ==============================================================================

export default function ArbolVivoPanel({
  consultantUuid,
  consultantName = 'Consultante',
  onProgressUpdate
}: ArbolVivoPanelProps) {
  // State
  const [state, setState] = useState<ArbolVivoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tree' | 'achievements' | 'milestones'>('tree');
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Load state
  const loadState = useCallback(async () => {
    if (!consultantUuid) {
      // Generate demo state if no UUID
      setState(generateDemoState());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cabala/arbol-vivo/${consultantUuid}/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar estado del árbol');
      }

      const data = await response.json();
      if (data.success && data.state) {
        setState(data.state);
        onProgressUpdate?.(data.state);
      } else {
        // Use demo state as fallback
        setState(generateDemoState());
      }
    } catch (err) {
      console.error('[ArbolVivo] Error:', err);
      // Use demo state on error
      setState(generateDemoState());
    } finally {
      setLoading(false);
    }
  }, [consultantUuid, onProgressUpdate]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Add milestone
  const addMilestone = useCallback(async () => {
    if (!newMilestone.trim()) return;
    
    setAddingMilestone(true);
    try {
      // In a real implementation, this would call the API
      // For now, add locally
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: [
            ...prev.milestones,
            {
              id: String(Date.now()),
              title: newMilestone.trim(),
              completed: false
            }
          ]
        };
      });
      setNewMilestone('');
    } finally {
      setAddingMilestone(false);
    }
  }, [newMilestone]);

  // Toggle milestone completion
  const toggleMilestone = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        milestones: prev.milestones.map(m => 
          m.id === id 
            ? { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : undefined }
            : m
        ),
        overall_growth: prev.overall_growth + (prev.milestones.find(m => m.id === id)?.completed ? -2 : 2)
      };
    });
  }, []);

  // ==============================================================================
  // RENDER HELPERS
  // ==============================================================================

  const renderTreeVisualization = () => {
    if (!state) return null;

    const stageInfo = TREE_STAGES[state.tree_stage];

    return (
      <div className="relative">
        {/* Tree Stage Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-green-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stageInfo.emoji}</span>
            <div className="text-center">
              <p className="font-bold text-green-800">{stageInfo.label}</p>
              <p className="text-xs text-green-600">{stageInfo.description}</p>
            </div>
          </div>
        </div>

        {/* SVG Tree */}
        <svg viewBox="0 0 100 100" className="w-full h-96 mx-auto">
          {/* Background gradient */}
          <defs>
            <radialGradient id="treeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16,185,129,0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <circle cx="50" cy="50" r="45" fill="url(#treeGlow)" />

          {/* Paths between sefirot */}
          <g stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" fill="none">
            {/* Pillar paths */}
            <line x1="50" y1="5" x2="50" y2="92" strokeDasharray="2,2" />
            <line x1="25" y1="15" x2="25" y2="60" strokeDasharray="2,2" />
            <line x1="75" y1="15" x2="75" y2="60" strokeDasharray="2,2" />
            {/* Cross paths */}
            <line x1="25" y1="15" x2="75" y2="15" strokeDasharray="2,2" />
            <line x1="25" y1="35" x2="75" y2="35" strokeDasharray="2,2" />
            <line x1="25" y1="60" x2="75" y2="60" strokeDasharray="2,2" />
          </g>

          {/* Sefirot */}
          {state.sefirot_progress.map((sp) => {
            const pos = SEFIROT_POSITIONS[sp.sefira];
            const info = SEFIROT_INFO[sp.sefira];
            const radius = 4 + (sp.level / 100) * 3; // Size grows with level
            const opacity = sp.is_illuminated ? 1 : 0.3 + (sp.level / 100) * 0.7;

            return (
              <g key={sp.sefira}>
                {/* Glow effect for illuminated sefirot */}
                {sp.is_illuminated && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 2}
                    fill={info.glowColor}
                    filter="url(#glow)"
                    className="animate-pulse"
                  />
                )}
                
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={info.color}
                  stroke={sp.is_illuminated ? '#FFD700' : '#666'}
                  strokeWidth={sp.is_illuminated ? 0.8 : 0.3}
                  opacity={opacity}
                />

                {/* Level indicator */}
                {sp.level > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 0.5}
                    fontSize="2.5"
                    fontWeight="bold"
                    fill={sp.sefira === 'binah' || sp.sefira === 'keter' ? '#333' : '#fff'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {Math.round(sp.level)}
                  </text>
                )}

                {/* Name label */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 4}
                  fontSize="2.5"
                  fill="#666"
                  textAnchor="middle"
                >
                  {info.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Progress Bar */}
        <div className="mt-4 px-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Crecimiento Total</span>
            <span className="font-bold text-green-700">{Math.round(state.overall_growth)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${state.overall_growth}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2 px-6">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-700">{state.total_practices}</div>
            <div className="text-xs text-blue-600">Prácticas</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-700">{state.total_sessions}</div>
            <div className="text-xs text-purple-600">Sesiones</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-700">{state.days_active}</div>
            <div className="text-xs text-green-600">Días Activo</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-amber-700">{state.current_streak}🔥</div>
            <div className="text-xs text-amber-600">Racha</div>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!state) return null;

    const unlockedCount = state.achievements.filter(a => a.unlocked_at).length;

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Logros Desbloqueados</h3>
          <span className="text-sm text-gray-500">
            {unlockedCount} / {state.achievements.length}
          </span>
        </div>
        
        <div className="grid gap-3">
          {state.achievements.map((achievement) => {
            const isUnlocked = !!achievement.unlocked_at;
            const catInfo = ACHIEVEMENT_CATEGORIES[achievement.category];
            
            return (
              <div 
                key={achievement.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${isUnlocked 
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}
              >
                <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
                {isUnlocked && (
                  <Trophy className="h-5 w-5 text-amber-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMilestones = () => {
    if (!state) return null;

    const completedCount = state.milestones.filter(m => m.completed).length;

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Hitos Terapéuticos</h3>
          <span className="text-sm text-gray-500">
            {completedCount} / {state.milestones.length} completados
          </span>
        </div>

        {/* Add new milestone */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            placeholder="Nuevo hito terapéutico..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
          />
          <button
            onClick={addMilestone}
            disabled={!newMilestone.trim() || addingMilestone}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Milestones list */}
        <div className="space-y-2">
          {state.milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${milestone.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => toggleMilestone(milestone.id)}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${milestone.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
                }
              `}>
                {milestone.completed && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className={`flex-1 ${milestone.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                {milestone.title}
              </span>
              {milestone.sefira_association && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  {SEFIROT_INFO[milestone.sefira_association].name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==============================================================================
  // MAIN RENDER
  // ==============================================================================

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Cargando tu Árbol de la Vida...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-xl border border-green-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TreeDeciduous className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tu Árbol Vivo</h2>
              <p className="text-green-100 text-sm">Visualiza tu crecimiento personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadState}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </button>
            <div className="group relative">
              <Info className="h-5 w-5 text-white/70 cursor-help" />
              <div className="absolute right-0 top-8 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
                <p className="font-medium mb-1">Gamificación Terapéutica</p>
                <p>• Tu Árbol crece con cada práctica</p>
                <p>• Las Sefirot se iluminan al trabajarlas</p>
                <p>• Desbloquea logros y alcanza hitos</p>
                <p className="mt-2 text-gray-300 italic">
                  Visualizar el progreso aumenta la motivación y el compromiso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id: 'tree' as const, label: 'Árbol', icon: TreeDeciduous },
          { id: 'achievements' as const, label: 'Logros', icon: Trophy },
          { id: 'milestones' as const, label: 'Hitos', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id 
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white">
        {activeTab === 'tree' && renderTreeVisualization()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'milestones' && renderMilestones()}
      </div>

      {/* Footer disclaimer */}
      <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-800">
          <strong>Nota:</strong> El Árbol Vivo es una herramienta de motivación. 
          El progreso real se mide en bienestar y no en puntos.
        </p>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

function generateDemoState(): ArbolVivoState {
  return {
    overall_growth: 45,
    sefirot_progress: [
      { sefira: 'keter', level: 10, practices_completed: 2, insights_gained: 1, is_illuminated: false },
      { sefira: 'chokmah', level: 25, practices_completed: 5, insights_gained: 3, is_illuminated: false },
      { sefira: 'binah', level: 40, practices_completed: 8, insights_gained: 5, is_illuminated: true },
      { sefira: 'chesed', level: 65, practices_completed: 12, insights_gained: 8, is_illuminated: true },
      { sefira: 'gevurah', level: 30, practices_completed: 6, insights_gained: 4, is_illuminated: false },
      { sefira: 'tiferet', level: 55, practices_completed: 10, insights_gained: 7, is_illuminated: true },
      { sefira: 'netzach', level: 70, practices_completed: 14, insights_gained: 10, is_illuminated: true },
      { sefira: 'hod', level: 45, practices_completed: 9, insights_gained: 6, is_illuminated: true },
      { sefira: 'yesod', level: 60, practices_completed: 11, insights_gained: 8, is_illuminated: true },
      { sefira: 'malkuth', level: 80, practices_completed: 16, insights_gained: 12, is_illuminated: true }
    ],
    achievements: [
      { id: '1', title: 'Primer Paso', description: 'Completaste tu primera práctica', icon: '🌱', unlocked_at: '2026-01-15', category: 'exploration' },
      { id: '2', title: 'Explorador del Árbol', description: 'Visitaste todas las Sefirot', icon: '🗺️', unlocked_at: '2026-01-20', category: 'exploration' },
      { id: '3', title: 'Meditador Constante', description: '7 días seguidos de práctica', icon: '🧘', unlocked_at: '2026-01-25', category: 'practice' },
      { id: '4', title: 'Integrador', description: 'Conectaste insights de 3 Sefirot', icon: '🔮', unlocked_at: '2026-01-28', category: 'integration' },
      { id: '5', title: 'Maestro de Chesed', description: 'Nivel 50+ en Chesed', icon: '💙', unlocked_at: '2026-01-30', category: 'mastery' },
      { id: '6', title: 'Equilibrio Perfecto', description: 'Balance entre Chesed y Gevurah', icon: '⚖️', category: 'mastery' },
      { id: '7', title: 'Iluminación Total', description: 'Todas las Sefirot iluminadas', icon: '✨', category: 'mastery' }
    ],
    milestones: [
      { id: 'm1', title: 'Establecer límites con mi familia', completed: true, completed_at: '2026-01-20', sefira_association: 'gevurah' },
      { id: 'm2', title: 'Practicar autocompasión diaria', completed: true, completed_at: '2026-01-25', sefira_association: 'chesed' },
      { id: 'm3', title: 'Expresar mi creatividad sin juicio', completed: false, sefira_association: 'netzach' },
      { id: 'm4', title: 'Conectar con mi intuición antes de decidir', completed: false, sefira_association: 'chokmah' }
    ],
    total_practices: 93,
    total_sessions: 12,
    days_active: 45,
    current_streak: 7,
    tree_stage: 'growing'
  };
}
