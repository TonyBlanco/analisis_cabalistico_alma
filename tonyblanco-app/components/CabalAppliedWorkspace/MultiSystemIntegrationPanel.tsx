'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  generateFullIntegrationReport,
  detectImbalances,
  type AnySystemReading,
  type IntegrationReport,
  type CrossSystemPattern,
  type TransgenerationalSynchrony,
  type GenerativeQuestion,
  type RadarLayer,
  type SymbolicSystem,
  type CabalaReading,
  type TarotReading,
  type AstrologyReading,
  type BioEmotionReading,
  type TransgenerationalReading,
} from '@holistica/symbolic/integration';

// ============================================================================
// TYPES
// ============================================================================

interface MultiSystemIntegrationPanelProps {
  consultantId?: number;
  consultantBirthDate?: Date;
  onSaveReport?: (report: IntegrationReport) => void;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const SYSTEM_LABELS: Record<SymbolicSystem, { icon: string; name: string; color: string }> = {
  cabala: { icon: '🔯', name: 'Cábala', color: 'purple' },
  tarot: { icon: '🃏', name: 'Tarot', color: 'yellow' },
  astrology: { icon: '⭐', name: 'Astrología', color: 'blue' },
  bioemotions: { icon: '💚', name: 'Bio-Emociones', color: 'green' },
  transgenerational: { icon: '🌳', name: 'Transgeneracional', color: 'orange' },
};

function SystemBadge({ system, size = 'sm' }: { system: SymbolicSystem; size?: 'sm' | 'md' }) {
  const info = SYSTEM_LABELS[system];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${colorClasses[info.color]}`}>
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  );
}

function PatternCard({ pattern }: { pattern: CrossSystemPattern }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-bold text-indigo-900">{pattern.theme}</h4>
            <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
              {Math.round(pattern.confidence * 100)}% confianza
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {pattern.systems.map(sys => (
              <SystemBadge key={sys} system={sys} />
            ))}
          </div>
          
          <p className="text-sm text-indigo-800/80 leading-relaxed">{pattern.insight}</p>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-indigo-200"
          >
            <h5 className="text-sm font-medium text-indigo-700 mb-2">Evidencia:</h5>
            <div className="space-y-2">
              {pattern.evidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <SystemBadge system={ev.system} />
                  <span className="text-indigo-700">{ev.detail}</span>
                </div>
              ))}
            </div>
            
            {pattern.recommendations && pattern.recommendations.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-green-700 mb-2">✨ Recomendaciones:</h5>
                <ul className="space-y-1">
                  {pattern.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SynchronyAlert({ synchrony }: { synchrony: TransgenerationalSynchrony }) {
  const alertColors = {
    urgent: 'bg-red-50 border-red-300 text-red-900',
    attention: 'bg-amber-50 border-amber-300 text-amber-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  };
  
  const alertIcons = {
    urgent: '🚨',
    attention: '⚠️',
    info: 'ℹ️',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${alertColors[synchrony.alertLevel]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{alertIcons[synchrony.alertLevel]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-semibold">Edad crítica: {synchrony.age} años</h5>
            {synchrony.cycle && (
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded">
                Ciclo {synchrony.cycle.number} ({synchrony.cycle.sefira})
              </span>
            )}
          </div>
          
          <div className="text-sm space-y-1 mb-2">
            {synchrony.ancestors.map((anc, i) => (
              <div key={i}>
                <strong>{anc.relation}:</strong> {anc.event} (a los {anc.age} años)
              </div>
            ))}
          </div>
          
          {synchrony.yearsToPattern > 0 ? (
            <p className="text-sm font-medium">
              📅 Faltan {synchrony.yearsToPattern} años para este ciclo
            </p>
          ) : (
            <p className="text-sm font-medium">
              ✓ Este ciclo ya pasó hace {Math.abs(synchrony.yearsToPattern)} años
            </p>
          )}
          
          <p className="text-sm mt-2 italic">{synchrony.workingSuggestion}</p>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: GenerativeQuestion; index: number }) {
  const depthColors = {
    surface: 'bg-sky-50 border-sky-200',
    medium: 'bg-violet-50 border-violet-200',
    deep: 'bg-rose-50 border-rose-200',
  };
  
  const depthLabels = {
    surface: '🌊 Superficial',
    medium: '🌀 Exploratoria',
    deep: '🔥 Profunda',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg border p-4 ${depthColors[question.depth]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium leading-relaxed">"{question.question}"</p>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-white/70 px-2 py-0.5 rounded">
              {depthLabels[question.depth]}
            </span>
            {question.sources.map((src, i) => (
              <SystemBadge key={i} system={src.system} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RadarVisualization({ layers }: { layers: RadarLayer[] }) {
  // Simple radar visualization using SVG
  const size = 300;
  const center = size / 2;
  const maxRadius = (size / 2) - 40;
  
  // Get all unique dimension labels across all layers
  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    layers.forEach(layer => {
      layer.dimensions.forEach(d => labels.add(d.label));
    });
    return Array.from(labels).slice(0, 8); // Max 8 dimensions for readability
  }, [layers]);
  
  const angleStep = (2 * Math.PI) / allLabels.length;
  
  // Calculate points for each layer
  const layerPaths = layers.map(layer => {
    const points = allLabels.map((label, i) => {
      const dim = layer.dimensions.find(d => d.label === label);
      const value = dim?.value ?? 0;
      const radius = (value / 100) * maxRadius;
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    });
    return points.join(' ');
  });
  
  // Grid circles
  const gridCircles = [20, 40, 60, 80, 100].map(percent => ({
    radius: (percent / 100) * maxRadius,
    label: `${percent}%`,
  }));
  
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
        {/* Grid circles */}
        {gridCircles.map((circle, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={circle.radius}
            fill="none"
            stroke="rgba(156, 163, 175, 0.3)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {allLabels.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + maxRadius * Math.cos(angle);
          const y2 = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(156, 163, 175, 0.3)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Layer polygons */}
        {layerPaths.map((path, i) => (
          <polygon
            key={i}
            points={path}
            fill={layers[i].color}
            stroke={layers[i].color.replace('0.6', '1')}
            strokeWidth="2"
          />
        ))}
        
        {/* Labels */}
        {allLabels.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-gray-600"
            >
              {label}
            </text>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {layers.map((layer, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: layer.color }}
            />
            <span>{SYSTEM_LABELS[layer.system].icon} {SYSTEM_LABELS[layer.system].name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DATA INPUT FORMS
// ============================================================================

function DataInputSection({
  readings,
  onAddReading,
  onRemoveReading,
}: {
  readings: AnySystemReading[];
  onAddReading: (reading: AnySystemReading) => void;
  onRemoveReading: (index: number) => void;
}) {
  const [activeInput, setActiveInput] = useState<SymbolicSystem | null>(null);
  
  // Simple forms for each system
  const renderInputForm = () => {
    switch (activeInput) {
      case 'cabala':
        return <CabalaInputForm onSubmit={(data) => { onAddReading(data); setActiveInput(null); }} />;
      case 'tarot':
        return <TarotInputForm onSubmit={(data) => { onAddReading(data); setActiveInput(null); }} />;
      case 'bioemotions':
        return <BioEmotionInputForm onSubmit={(data) => { onAddReading(data); setActiveInput(null); }} />;
      case 'transgenerational':
        return <TransgenerationalInputForm onSubmit={(data) => { onAddReading(data); setActiveInput(null); }} />;
      case 'astrology':
        return <AstrologyInputForm onSubmit={(data) => { onAddReading(data); setActiveInput(null); }} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Current readings */}
      {readings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Lecturas cargadas:</h4>
          <div className="flex flex-wrap gap-2">
            {readings.map((r, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1">
                <SystemBadge system={r.system} />
                <button
                  onClick={() => onRemoveReading(i)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add reading buttons */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Agregar lectura:</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SYSTEM_LABELS) as SymbolicSystem[]).map(sys => {
            const hasReading = readings.some(r => r.system === sys);
            return (
              <button
                key={sys}
                onClick={() => setActiveInput(activeInput === sys ? null : sys)}
                disabled={hasReading}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  hasReading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : activeInput === sys
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {SYSTEM_LABELS[sys].icon} {SYSTEM_LABELS[sys].name}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Active input form */}
      <AnimatePresence>
        {activeInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                {SYSTEM_LABELS[activeInput].icon} Agregar {SYSTEM_LABELS[activeInput].name}
              </h4>
              <button
                onClick={() => setActiveInput(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {renderInputForm()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple input forms for each system
function CabalaInputForm({ onSubmit }: { onSubmit: (data: CabalaReading) => void }) {
  const [formData, setFormData] = useState({
    currentSefira: '',
    dominantSefirot: '',
    weakSefirot: '',
    ausencias: '',
  });
  
  const sefirot = ['keter', 'chokmah', 'binah', 'chesed', 'gevurah', 'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'];
  
  const handleSubmit = () => {
    const reading: CabalaReading = {
      system: 'cabala',
      timestamp: new Date().toISOString(),
      source: 'entrada manual',
      data: {
        currentSefira: formData.currentSefira || undefined,
        dominantSefirot: formData.dominantSefirot.split(',').map(s => s.trim()).filter(Boolean),
        weakSefirot: formData.weakSefirot.split(',').map(s => s.trim()).filter(Boolean),
        ausencias: formData.ausencias.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      },
    };
    onSubmit(reading);
  };
  
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Sefirá actual (ciclo):</label>
        <select
          value={formData.currentSefira}
          onChange={(e) => setFormData({ ...formData, currentSefira: e.target.value })}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Seleccionar...</option>
          {sefirot.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-600">Sefirot dominantes (separar con coma):</label>
        <input
          type="text"
          value={formData.dominantSefirot}
          onChange={(e) => setFormData({ ...formData, dominantSefirot: e.target.value })}
          placeholder="ej: gevurah, hod"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Sefirot débiles (separar con coma):</label>
        <input
          type="text"
          value={formData.weakSefirot}
          onChange={(e) => setFormData({ ...formData, weakSefirot: e.target.value })}
          placeholder="ej: chesed, netzach"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Números ausentes (1-9, separar con coma):</label>
        <input
          type="text"
          value={formData.ausencias}
          onChange={(e) => setFormData({ ...formData, ausencias: e.target.value })}
          placeholder="ej: 2, 5, 8"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-purple-700"
      >
        Agregar Lectura Cábala
      </button>
    </div>
  );
}

function TarotInputForm({ onSubmit }: { onSubmit: (data: TarotReading) => void }) {
  const [formData, setFormData] = useState({
    cards: '',
    themes: '',
    dominantElement: '',
    dominantEnergy: '',
  });
  
  const handleSubmit = () => {
    const cardNames = formData.cards.split(',').map(c => c.trim()).filter(Boolean);
    const reading: TarotReading = {
      system: 'tarot',
      timestamp: new Date().toISOString(),
      source: 'entrada manual',
      data: {
        cards: cardNames.map(name => ({
          position: 'general',
          arcana: 'mayor',
          name,
          keywords: [name.toLowerCase()],
        })),
        themes: formData.themes.split(',').map(t => t.trim()).filter(Boolean),
        dominantElement: formData.dominantElement as any || undefined,
        dominantEnergy: formData.dominantEnergy as any || undefined,
      },
    };
    onSubmit(reading);
  };
  
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Cartas (separar con coma):</label>
        <input
          type="text"
          value={formData.cards}
          onChange={(e) => setFormData({ ...formData, cards: e.target.value })}
          placeholder="ej: El Emperador, La Torre, 3 de Espadas"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Temas principales:</label>
        <input
          type="text"
          value={formData.themes}
          onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
          placeholder="ej: control, autoridad, destrucción"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Elemento dominante:</label>
          <select
            value={formData.dominantElement}
            onChange={(e) => setFormData({ ...formData, dominantElement: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Ninguno</option>
            <option value="fire">Fuego</option>
            <option value="water">Agua</option>
            <option value="air">Aire</option>
            <option value="earth">Tierra</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Energía dominante:</label>
          <select
            value={formData.dominantEnergy}
            onChange={(e) => setFormData({ ...formData, dominantEnergy: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Ninguna</option>
            <option value="masculine">Masculina</option>
            <option value="feminine">Femenina</option>
            <option value="balanced">Equilibrada</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-yellow-700"
      >
        Agregar Lectura Tarot
      </button>
    </div>
  );
}

function BioEmotionInputForm({ onSubmit }: { onSubmit: (data: BioEmotionReading) => void }) {
  const [symptoms, setSymptoms] = useState<Array<{ organ: string; emotion: string; intensity: number }>>([
    { organ: '', emotion: '', intensity: 50 },
  ]);
  
  const addSymptom = () => {
    setSymptoms([...symptoms, { organ: '', emotion: '', intensity: 50 }]);
  };
  
  const updateSymptom = (index: number, field: string, value: any) => {
    const updated = [...symptoms];
    (updated[index] as any)[field] = value;
    setSymptoms(updated);
  };
  
  const handleSubmit = () => {
    const reading: BioEmotionReading = {
      system: 'bioemotions',
      timestamp: new Date().toISOString(),
      source: 'entrada manual',
      data: {
        symptoms: symptoms.filter(s => s.organ && s.emotion).map(s => ({
          organ: s.organ,
          description: `${s.emotion} en ${s.organ}`,
          intensity: s.intensity,
          emotion: s.emotion,
        })),
      },
    };
    onSubmit(reading);
  };
  
  return (
    <div className="space-y-3">
      {symptoms.map((symptom, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={symptom.organ}
            onChange={(e) => updateSymptom(i, 'organ', e.target.value)}
            placeholder="Órgano/zona"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            value={symptom.emotion}
            onChange={(e) => updateSymptom(i, 'emotion', e.target.value)}
            placeholder="Emoción"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="number"
            value={symptom.intensity}
            onChange={(e) => updateSymptom(i, 'intensity', parseInt(e.target.value))}
            min="0"
            max="100"
            placeholder="Intensidad"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSymptom}
        className="text-sm text-green-600 hover:text-green-700"
      >
        + Agregar síntoma
      </button>
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700"
      >
        Agregar Bio-Emociones
      </button>
    </div>
  );
}

function TransgenerationalInputForm({ onSubmit }: { onSubmit: (data: TransgenerationalReading) => void }) {
  const [formData, setFormData] = useState({
    paternalPatterns: '',
    maternalPatterns: '',
    inheritedPatterns: '',
    dominantLineage: '',
  });
  
  const handleSubmit = () => {
    const reading: TransgenerationalReading = {
      system: 'transgenerational',
      timestamp: new Date().toISOString(),
      source: 'entrada manual',
      data: {
        paternalLine: formData.paternalPatterns ? [{
          relation: 'línea paterna',
          patterns: formData.paternalPatterns.split(',').map(p => p.trim()),
        }] : [],
        maternalLine: formData.maternalPatterns ? [{
          relation: 'línea materna',
          patterns: formData.maternalPatterns.split(',').map(p => p.trim()),
        }] : [],
        inheritedPatterns: formData.inheritedPatterns.split(',').map(p => p.trim()).filter(Boolean),
        dominantLineage: formData.dominantLineage as any || undefined,
      },
    };
    onSubmit(reading);
  };
  
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Patrones línea paterna (separar con coma):</label>
        <input
          type="text"
          value={formData.paternalPatterns}
          onChange={(e) => setFormData({ ...formData, paternalPatterns: e.target.value })}
          placeholder="ej: militar, autoritario, controlador"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Patrones línea materna (separar con coma):</label>
        <input
          type="text"
          value={formData.maternalPatterns}
          onChange={(e) => setFormData({ ...formData, maternalPatterns: e.target.value })}
          placeholder="ej: sacrificio, silencio, cuidadora"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Patrones heredados generales:</label>
        <input
          type="text"
          value={formData.inheritedPatterns}
          onChange={(e) => setFormData({ ...formData, inheritedPatterns: e.target.value })}
          placeholder="ej: pérdida económica, secretos familiares"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Linaje dominante:</label>
        <select
          value={formData.dominantLineage}
          onChange={(e) => setFormData({ ...formData, dominantLineage: e.target.value })}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">No determinado</option>
          <option value="paternal">Paterno</option>
          <option value="maternal">Materno</option>
          <option value="balanced">Equilibrado</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-orange-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-orange-700"
      >
        Agregar Transgeneracional
      </button>
    </div>
  );
}

function AstrologyInputForm({ onSubmit }: { onSubmit: (data: AstrologyReading) => void }) {
  const [formData, setFormData] = useState({
    sunSign: '',
    moonSign: '',
    dominantPlanet: '',
    dominantElement: '',
    themes: '',
  });
  
  const signs = ['aries', 'tauro', 'géminis', 'cáncer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis'];
  const planets = ['sol', 'luna', 'mercurio', 'venus', 'marte', 'júpiter', 'saturno', 'urano', 'neptuno', 'plutón'];
  
  const handleSubmit = () => {
    const reading: AstrologyReading = {
      system: 'astrology',
      timestamp: new Date().toISOString(),
      source: 'entrada manual',
      data: {
        sunSign: formData.sunSign || undefined,
        moonSign: formData.moonSign || undefined,
        dominantPlanet: formData.dominantPlanet || undefined,
        dominantElement: formData.dominantElement as any || undefined,
        themes: formData.themes.split(',').map(t => t.trim()).filter(Boolean),
      },
    };
    onSubmit(reading);
  };
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Signo Solar:</label>
          <select
            value={formData.sunSign}
            onChange={(e) => setFormData({ ...formData, sunSign: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Seleccionar...</option>
            {signs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Signo Lunar:</label>
          <select
            value={formData.moonSign}
            onChange={(e) => setFormData({ ...formData, moonSign: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Seleccionar...</option>
            {signs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Planeta dominante:</label>
          <select
            value={formData.dominantPlanet}
            onChange={(e) => setFormData({ ...formData, dominantPlanet: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Ninguno</option>
            {planets.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Elemento dominante:</label>
          <select
            value={formData.dominantElement}
            onChange={(e) => setFormData({ ...formData, dominantElement: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Ninguno</option>
            <option value="fire">Fuego</option>
            <option value="water">Agua</option>
            <option value="air">Aire</option>
            <option value="earth">Tierra</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600">Temas/Aspectos destacados:</label>
        <input
          type="text"
          value={formData.themes}
          onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
          placeholder="ej: saturno dominante, agua ausente"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700"
      >
        Agregar Astrología
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MultiSystemIntegrationPanel({
  consultantId,
  consultantBirthDate,
  onSaveReport,
}: MultiSystemIntegrationPanelProps) {
  const [readings, setReadings] = useState<AnySystemReading[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'patterns' | 'synchrony' | 'questions' | 'radar'>('input');
  const [report, setReport] = useState<IntegrationReport | null>(null);
  
  const handleAddReading = useCallback((reading: AnySystemReading) => {
    setReadings(prev => [...prev, reading]);
    setReport(null); // Clear report when data changes
  }, []);
  
  const handleRemoveReading = useCallback((index: number) => {
    setReadings(prev => prev.filter((_, i) => i !== index));
    setReport(null);
  }, []);
  
  const handleGenerateReport = useCallback(() => {
    if (readings.length < 2) {
      alert('Necesitas al menos 2 lecturas de diferentes sistemas para generar un informe integrado.');
      return;
    }
    
    const newReport = generateFullIntegrationReport(
      consultantId || 0,
      readings,
      consultantBirthDate
    );
    setReport(newReport);
    setActiveTab('patterns');
  }, [readings, consultantId, consultantBirthDate]);
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 rounded-xl border border-indigo-500/30 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-indigo-100">Integración Multi-Sistema</h2>
              <p className="text-indigo-300/70 text-sm">
                Diálogo simbólico entre Cábala, Tarot, Astrología, Bio-Emociones y Transgeneracional
              </p>
            </div>
          </div>
          <div className="group relative">
            <Info className="h-5 w-5 text-indigo-300/70 hover:text-indigo-200 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-80 shadow-lg z-10">
              <p className="font-medium mb-1">Síntesis de Sistemas Simbólicos</p>
              <p>• Cruce de datos entre 5 sistemas: Cábala, Tarot, Astrología, Bio-Emociones, Transgeneracional</p>
              <p>• Detección de patrones transversales y sincronías</p>
              <p>• Generación de preguntas reflexivas integradoras</p>
              <p>• Radar multidimensional de coherencia simbólica</p>
              <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>
        
        {/* Safety Notice */}
        <div className="mt-4 bg-amber-900/30 border border-amber-500/30 rounded-lg p-3">
          <p className="text-amber-200/80 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Este módulo es <strong>educativo y simbólico</strong>. Las interpretaciones son exploratorias
              y no constituyen diagnóstico clínico. Gobernanza ética aplicada.
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-indigo-500/20 overflow-x-auto">
        {[
          { id: 'input' as const, label: '📥 Datos', desc: 'Ingresar lecturas' },
          { id: 'patterns' as const, label: '🔗 Patrones', desc: 'Cruce sistemas', disabled: !report },
          { id: 'synchrony' as const, label: '🌳 Sincronías', desc: 'Trans-generacional', disabled: !report },
          { id: 'questions' as const, label: '❓ Preguntas', desc: 'Generativas', disabled: !report },
          { id: 'radar' as const, label: '📊 Radar', desc: 'Visualización', disabled: !report },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`flex-shrink-0 py-3 px-4 text-center transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-900/40 border-b-2 border-indigo-400 text-indigo-100'
                : tab.disabled
                ? 'text-indigo-500/40 cursor-not-allowed'
                : 'text-indigo-300/60 hover:bg-indigo-900/20 hover:text-indigo-200'
            }`}
          >
            <div className="font-medium text-sm">{tab.label}</div>
            <div className="text-xs opacity-70">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Tab: Input */}
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <DataInputSection
                readings={readings}
                onAddReading={handleAddReading}
                onRemoveReading={handleRemoveReading}
              />
              
              {readings.length >= 2 && (
                <div className="pt-4 border-t border-indigo-500/20">
                  <button
                    onClick={handleGenerateReport}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg px-6 py-3 font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    🔮 Generar Informe de Integración
                  </button>
                  <p className="text-center text-indigo-300/60 text-xs mt-2">
                    {readings.length} lecturas cargadas • Mínimo 2 sistemas para detección de patrones
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Patterns */}
          {activeTab === 'patterns' && report && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overall Insight */}
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-5 border border-indigo-500/30">
                <h3 className="text-lg font-bold text-indigo-100 mb-2">💡 Insight General</h3>
                <p className="text-indigo-200/80 leading-relaxed">{report.overallInsight}</p>
              </div>
              
              {/* Patterns */}
              {report.patterns.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-200">
                    🔗 Patrones Detectados ({report.patterns.length})
                  </h3>
                  {report.patterns.map((pattern, i) => (
                    <PatternCard key={i} pattern={pattern} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-indigo-300/60">
                  No se detectaron patrones cruzados significativos.
                  Intenta agregar más datos o lecturas de diferentes sistemas.
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Synchrony */}
          {activeTab === 'synchrony' && report && (
            <motion.div
              key="synchrony"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-orange-950/30 rounded-xl p-5 border border-orange-500/30">
                <h3 className="text-lg font-bold text-orange-100 mb-2">
                  🌳 Sincronías Trans-Generacionales
                </h3>
                <p className="text-orange-200/70 text-sm">
                  Patrones cíclicos detectados que se repiten en el árbol familiar a edades similares.
                </p>
              </div>
              
              {report.synchronies.length > 0 ? (
                <div className="space-y-4">
                  {report.synchronies.map((sync, i) => (
                    <SynchronyAlert key={i} synchrony={sync} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-orange-300/60">
                  No se detectaron sincronías trans-generacionales.
                  <br />
                  Agrega datos del árbol familiar con edades de eventos significativos.
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Questions */}
          {activeTab === 'questions' && report && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-rose-950/30 rounded-xl p-5 border border-rose-500/30">
                <h3 className="text-lg font-bold text-rose-100 mb-2">
                  ❓ Preguntas Generativas
                </h3>
                <p className="text-rose-200/70 text-sm">
                  Preguntas terapéuticas generadas cruzando información de múltiples sistemas.
                  Son exploratorias, no directivas.
                </p>
              </div>
              
              {report.questions.length > 0 ? (
                <div className="space-y-3">
                  {report.questions.map((question, i) => (
                    <QuestionCard key={i} question={question} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-rose-300/60">
                  No se generaron preguntas.
                  <br />
                  Agrega más datos para habilitar la generación de preguntas.
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Radar */}
          {activeTab === 'radar' && report && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-blue-950/30 rounded-xl p-5 border border-blue-500/30">
                <h3 className="text-lg font-bold text-blue-100 mb-2">
                  📊 Radar de Desequilibrios
                </h3>
                <p className="text-blue-200/70 text-sm">
                  Visualización multi-capa de todos los sistemas integrados.
                </p>
              </div>
              
              {report.radar.length > 0 ? (
                <>
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <RadarVisualization layers={report.radar} />
                  </div>
                  
                  {/* Imbalance Report */}
                  {(() => {
                    const imbalanceReport = detectImbalances(report.radar);
                    return imbalanceReport.imbalances.length > 0 ? (
                      <div className="bg-amber-950/30 rounded-xl p-5 border border-amber-500/30">
                        <h4 className="font-bold text-amber-100 mb-3">⚖️ Desequilibrios Detectados</h4>
                        <p className="text-amber-200/80 mb-4">{imbalanceReport.overallTheme}</p>
                        
                        <div className="space-y-2 mb-4">
                          {imbalanceReport.imbalances.map((imb, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                imb.severity === 'high' ? 'bg-red-500/30 text-red-200' :
                                imb.severity === 'medium' ? 'bg-amber-500/30 text-amber-200' :
                                'bg-blue-500/30 text-blue-200'
                              }`}>
                                {imb.severity}
                              </span>
                              <div>
                                <span className="font-medium text-amber-100">{imb.axis}:</span>
                                <span className="text-amber-200/70 ml-1">{imb.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {imbalanceReport.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-300 mb-2">✨ Recomendaciones:</h5>
                            <ul className="space-y-1">
                              {imbalanceReport.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-green-200/70">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </>
              ) : (
                <div className="text-center py-8 text-blue-300/60">
                  No hay datos suficientes para generar el radar.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MultiSystemIntegrationPanel;
