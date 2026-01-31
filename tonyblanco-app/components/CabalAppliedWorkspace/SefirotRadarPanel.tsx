'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  computeSefirotRadar,
  createPitagorasSource,
  SEFIROT_DATA,
  PILLARS_DATA,
  getEnergyStateLabel,
  getEnergyStateColor,
  type DataSource,
  type SefirotRadarResult,
  type SefiraScore,
  type PillarAnalysis,
  type Imbalance,
  type WorkRecommendation,
  type SefiraId,
  type ClinicalTestData,
  type BiographyData,
  type CabalisticCalcData,
} from '@holistica/symbolic/sefirot-radar';

// ============================================================================
// TYPES
// ============================================================================

interface SefirotRadarPanelProps {
  /** ID del consultante */
  consultantId?: number;
  /** Datos de Pitágoras pre-cargados (ausencias, dominantes) */
  pitagorasData?: {
    ausencias: number[];
    dominantes: number[];
    caminoVida?: number;
  };
  /** Fuentes de datos externas */
  externalSources?: DataSource[];
  /** Callback cuando se genera un nuevo radar */
  onRadarGenerated?: (result: SefirotRadarResult) => void;
}

// ============================================================================
// RADAR SVG VISUALIZATION
// ============================================================================

function SefirotRadarSVG({ sefirot }: { sefirot: SefiraScore[] }) {
  const size = 400;
  const center = size / 2;
  const maxRadius = (size / 2) - 50;
  
  // Arrange 10 sefirot around the circle
  // Traditional Tree of Life positions adapted to radar
  const sefirotOrder: SefiraId[] = [
    'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
    'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'
  ];
  
  const angleStep = (2 * Math.PI) / 10;
  
  // Calculate points for the radar polygon
  const points = sefirotOrder.map((sefiraId, i) => {
    const sefira = sefirot.find(s => s.id === sefiraId)!;
    const radius = (sefira.level / 100) * maxRadius;
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, sefira, angle };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';
  
  // Grid circles
  const gridLevels = [20, 40, 60, 80, 100];
  
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-lg mx-auto">
      {/* Background gradient */}
      <defs>
        <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
          <stop offset="100%" stopColor="rgba(17, 24, 39, 0.3)" />
        </radialGradient>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.6)" />
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0.6)" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx={center} cy={center} r={maxRadius + 10} fill="url(#radarBg)" />
      
      {/* Grid circles */}
      {gridLevels.map((level, i) => (
        <g key={level}>
          <circle
            cx={center}
            cy={center}
            r={(level / 100) * maxRadius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="1"
            strokeDasharray={i === 2 ? "4,4" : "none"}
          />
          <text
            x={center + 5}
            y={center - (level / 100) * maxRadius + 4}
            className="text-[9px] fill-slate-500"
          >
            {level}%
          </text>
        </g>
      ))}
      
      {/* Axis lines */}
      {sefirotOrder.map((_, i) => {
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
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="1"
          />
        );
      })}
      
      {/* Balanced zone highlight */}
      <circle
        cx={center}
        cy={center}
        r={(65 / 100) * maxRadius}
        fill="none"
        stroke="rgba(16, 185, 129, 0.3)"
        strokeWidth="25"
        opacity="0.3"
      />
      
      {/* Main radar polygon */}
      <motion.path
        d={pathD}
        fill="url(#radarFill)"
        stroke="rgba(99, 102, 241, 0.8)"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Data points */}
      {points.map((point, i) => (
        <g key={sefirotOrder[i]}>
          {/* Point circle */}
          <motion.circle
            cx={point.x}
            cy={point.y}
            r="8"
            fill={point.sefira.color}
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="cursor-pointer"
          />
          
          {/* Level text on point */}
          <text
            x={point.x}
            y={point.y + 3}
            textAnchor="middle"
            className="text-[8px] fill-white font-bold pointer-events-none"
          >
            {point.sefira.level}
          </text>
          
          {/* Sefira label */}
          {(() => {
            const labelRadius = maxRadius + 30;
            const lx = center + labelRadius * Math.cos(point.angle);
            const ly = center + labelRadius * Math.sin(point.angle);
            return (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] fill-slate-300 font-medium"
              >
                {point.sefira.name}
              </text>
            );
          })()}
        </g>
      ))}
      
      {/* Center label */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-slate-400"
      >
        Radar
      </text>
    </svg>
  );
}

// ============================================================================
// PILLAR BARS VISUALIZATION
// ============================================================================

function PillarBars({ pillars }: { pillars: PillarAnalysis[] }) {
  const pillarColors = {
    right: 'bg-blue-500',
    center: 'bg-yellow-500',
    left: 'bg-red-500',
  };
  
  return (
    <div className="space-y-4">
      {pillars.map(pillar => (
        <div key={pillar.pillar} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-200">{pillar.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              pillar.state === 'balanced' ? 'bg-emerald-500/20 text-emerald-300' :
              pillar.state === 'overload' || pillar.state === 'critical-high' ? 'bg-orange-500/20 text-orange-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {pillar.averageLevel}%
            </span>
          </div>
          
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${pillarColors[pillar.pillar]} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${pillar.averageLevel}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          
          <p className="text-xs text-slate-400">{pillar.insight}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SEFIRA DETAIL CARD
// ============================================================================

function SefiraDetailCard({ sefira, expanded, onToggle }: { 
  sefira: SefiraScore; 
  expanded: boolean;
  onToggle: () => void;
}) {
  const def = SEFIROT_DATA[sefira.id];
  
  return (
    <motion.div
      layout
      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
        sefira.state === 'balanced' ? 'border-emerald-500/30 bg-emerald-950/20' :
        sefira.state === 'overload' || sefira.state === 'critical-high' ? 'border-orange-500/30 bg-orange-950/20' :
        'border-amber-500/30 bg-amber-950/20'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: sefira.color }}
          />
          <span className="font-medium text-slate-200">{sefira.name}</span>
          <span className="text-xs text-slate-500">{sefira.hebrewName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${
            sefira.state === 'balanced' ? 'text-emerald-400' :
            sefira.state === 'overload' || sefira.state === 'critical-high' ? 'text-orange-400' :
            'text-amber-400'
          }`}>
            {sefira.level}%
          </span>
          <span className="text-slate-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-slate-700/50"
          >
            <p className="text-sm text-slate-300 mb-2">{sefira.stateDescription}</p>
            
            {/* Contributors */}
            {sefira.contributors.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-400 mb-1">Fuentes:</p>
                <div className="space-y-1">
                  {sefira.contributors.map((contrib, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={contrib.direction === 'up' ? 'text-orange-400' : 'text-blue-400'}>
                        {contrib.direction === 'up' ? '↑' : '↓'}
                      </span>
                      <span className="text-slate-400">{contrib.name}</span>
                      <span className="text-slate-500">({contrib.contribution}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Practices */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Prácticas sugeridas:</p>
              <ul className="text-xs text-slate-400 space-y-0.5">
                {def.balancingPractices.map((practice, i) => (
                  <li key={i}>• {practice}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// IMBALANCE ALERT
// ============================================================================

function ImbalanceAlert({ imbalance }: { imbalance: Imbalance }) {
  const severityColors = {
    low: 'bg-blue-900/30 border-blue-500/30 text-blue-200',
    medium: 'bg-amber-900/30 border-amber-500/30 text-amber-200',
    high: 'bg-orange-900/30 border-orange-500/30 text-orange-200',
    critical: 'bg-red-900/30 border-red-500/30 text-red-200',
  };
  
  const severityIcons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨',
  };
  
  return (
    <div className={`rounded-lg border p-3 ${severityColors[imbalance.severity]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{severityIcons[imbalance.severity]}</span>
        <div className="flex-1">
          <p className="font-medium">{imbalance.description}</p>
          <p className="text-sm opacity-80 mt-1">
            💡 {imbalance.workRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DATA INPUT FORMS
// ============================================================================

function DataInputSection({
  sources,
  onAddSource,
  onRemoveSource,
}: {
  sources: DataSource[];
  onAddSource: (source: DataSource) => void;
  onRemoveSource: (index: number) => void;
}) {
  const [inputType, setInputType] = useState<'clinical' | 'biography' | 'cabalistic' | null>(null);
  
  return (
    <div className="space-y-4">
      {/* Current sources */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Fuentes cargadas:</h4>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <div key={i} className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-3 py-1 text-sm">
                <span className="text-slate-300">
                  {source.source === 'clinical-test' ? '🏥' : 
                   source.source === 'biography' ? '📖' : 
                   source.source === 'cabalistic-calc' ? '🔯' : '🔮'}
                </span>
                <span className="text-slate-200">
                  {source.source === 'clinical-test' ? (source as ClinicalTestData).testName :
                   source.source === 'biography' ? (source as BiographyData).category :
                   source.source === 'cabalistic-calc' ? (source as CabalisticCalcData).method : 
                   'Sistema'}
                </span>
                <button
                  onClick={() => onRemoveSource(i)}
                  className="ml-1 text-slate-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add source buttons */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">Agregar fuente:</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInputType(inputType === 'clinical' ? null : 'clinical')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              inputType === 'clinical'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏥 Test Clínico
          </button>
          <button
            onClick={() => setInputType(inputType === 'biography' ? null : 'biography')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              inputType === 'biography'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📖 Biografía
          </button>
          <button
            onClick={() => setInputType(inputType === 'cabalistic' ? null : 'cabalistic')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              inputType === 'cabalistic'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔯 Cálculo Cabalístico
          </button>
        </div>
      </div>
      
      {/* Input forms */}
      <AnimatePresence>
        {inputType === 'clinical' && (
          <ClinicalTestForm 
            onSubmit={(data) => { onAddSource(data); setInputType(null); }}
            onCancel={() => setInputType(null)}
          />
        )}
        {inputType === 'biography' && (
          <BiographyForm
            onSubmit={(data) => { onAddSource(data); setInputType(null); }}
            onCancel={() => setInputType(null)}
          />
        )}
        {inputType === 'cabalistic' && (
          <CabalisticForm
            onSubmit={(data) => { onAddSource(data); setInputType(null); }}
            onCancel={() => setInputType(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClinicalTestForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: ClinicalTestData) => void;
  onCancel: () => void;
}) {
  const [testType, setTestType] = useState('');
  const [scores, setScores] = useState<Record<SefiraId, string>>({} as any);
  
  const testOptions = [
    { value: 'bdi2', label: 'BDI-2 (Depresión)' },
    { value: 'gad7', label: 'GAD-7 (Ansiedad)' },
    { value: 'phq9', label: 'PHQ-9 (Depresión)' },
    { value: 'aq-kabbalah', label: 'AQ-Kabbalah (Auditoría del Alma)' },
    { value: 'mcmi4', label: 'MCMI-4 (Personalidad)' },
  ];
  
  const handleSubmit = () => {
    const sefirotScores: Partial<Record<SefiraId, number>> = {};
    
    for (const [key, value] of Object.entries(scores)) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        sefirotScores[key as SefiraId] = Math.max(0, Math.min(100, num));
      }
    }
    
    const data: ClinicalTestData = {
      source: 'clinical-test',
      testType,
      testName: testOptions.find(t => t.value === testType)?.label || testType,
      sefirotScores,
      timestamp: new Date().toISOString(),
    };
    
    onSubmit(data);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
    >
      <h5 className="font-medium text-slate-200 mb-3">Agregar Test Clínico</h5>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-400">Tipo de test:</label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
          >
            <option value="">Seleccionar...</option>
            {testOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        {testType === 'aq-kabbalah' && (
          <div className="grid grid-cols-2 gap-2">
            {(['keter', 'chokmah', 'binah', 'chesed', 'gevurah', 'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'] as SefiraId[]).map(sefira => (
              <div key={sefira}>
                <label className="text-xs text-slate-400 capitalize">{sefira}:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores[sefira] || ''}
                  onChange={(e) => setScores({ ...scores, [sefira]: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
                  placeholder="0-100"
                />
              </div>
            ))}
          </div>
        )}
        
        {testType && testType !== 'aq-kabbalah' && (
          <div>
            <label className="text-sm text-slate-400">Score total (0-100):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={scores['total' as SefiraId] || ''}
              onChange={(e) => setScores({ ...scores, total: e.target.value } as any)}
              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
              placeholder="Score normalizado 0-100"
            />
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!testType}
            className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Agregar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BiographyForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: BiographyData) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [impacts, setImpacts] = useState<BiographyData['impacts']>([]);
  
  const categories = ['trauma', 'familia', 'relaciones', 'carrera', 'salud', 'otro'];
  
  const addImpact = () => {
    setImpacts([...impacts, { sefira: 'chesed', direction: 'empty', intensity: 50 }]);
  };
  
  const handleSubmit = () => {
    const data: BiographyData = {
      source: 'biography',
      category,
      description,
      impacts,
    };
    onSubmit(data);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
    >
      <h5 className="font-medium text-slate-200 mb-3">Agregar Evento Biográfico</h5>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-400">Categoría:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
          >
            <option value="">Seleccionar...</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
            rows={2}
            placeholder="Describe brevemente el evento..."
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Impactos en Sefirot:</label>
            <button 
              onClick={addImpact}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              + Agregar impacto
            </button>
          </div>
          
          {impacts.map((impact, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                value={impact.sefira}
                onChange={(e) => {
                  const updated = [...impacts];
                  updated[i].sefira = e.target.value as SefiraId;
                  setImpacts(updated);
                }}
                className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                {(['keter', 'chokmah', 'binah', 'chesed', 'gevurah', 'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'] as SefiraId[]).map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
              <select
                value={impact.direction}
                onChange={(e) => {
                  const updated = [...impacts];
                  updated[i].direction = e.target.value as 'overload' | 'empty';
                  setImpacts(updated);
                }}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="overload">↑ Sobrecarga</option>
                <option value="empty">↓ Vacío</option>
              </select>
              <input
                type="number"
                min="0"
                max="100"
                value={impact.intensity}
                onChange={(e) => {
                  const updated = [...impacts];
                  updated[i].intensity = parseInt(e.target.value) || 0;
                  setImpacts(updated);
                }}
                className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              />
              <button
                onClick={() => setImpacts(impacts.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!category || !description}
            className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Agregar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CabalisticForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: CabalisticCalcData) => void;
  onCancel: () => void;
}) {
  const [ausencias, setAusencias] = useState('');
  const [dominantes, setDominantes] = useState('');
  const [caminoVida, setCaminoVida] = useState('');
  
  const handleSubmit = () => {
    const data = createPitagorasSource(
      ausencias.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
      dominantes.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
      caminoVida ? parseInt(caminoVida) : undefined
    );
    onSubmit(data);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
    >
      <h5 className="font-medium text-slate-200 mb-3">Agregar Cálculo Cabalístico (Pitágoras)</h5>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-400">Números ausentes (separados por coma):</label>
          <input
            type="text"
            value={ausencias}
            onChange={(e) => setAusencias(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
            placeholder="ej: 2, 5, 8"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Números dominantes (separados por coma):</label>
          <input
            type="text"
            value={dominantes}
            onChange={(e) => setDominantes(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
            placeholder="ej: 1, 4"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Camino de Vida (opcional):</label>
          <input
            type="number"
            min="1"
            max="9"
            value={caminoVida}
            onChange={(e) => setCaminoVida(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200"
            placeholder="1-9"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!ausencias && !dominantes}
            className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Agregar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SefirotRadarPanel({
  consultantId,
  pitagorasData,
  externalSources = [],
  onRadarGenerated,
}: SefirotRadarPanelProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>(() => {
    const initial: DataSource[] = [...externalSources];
    
    // Auto-add Pitagoras if provided
    if (pitagorasData) {
      initial.push(createPitagorasSource(
        pitagorasData.ausencias,
        pitagorasData.dominantes,
        pitagorasData.caminoVida
      ));
    }
    
    return initial;
  });
  
  const [activeTab, setActiveTab] = useState<'input' | 'radar' | 'analysis'>('input');
  const [expandedSefira, setExpandedSefira] = useState<SefiraId | null>(null);
  
  // Compute radar when we have data
  const radarResult = useMemo(() => {
    if (dataSources.length === 0) return null;
    return computeSefirotRadar(dataSources);
  }, [dataSources]);
  
  const handleAddSource = useCallback((source: DataSource) => {
    setDataSources(prev => [...prev, source]);
  }, []);
  
  const handleRemoveSource = useCallback((index: number) => {
    setDataSources(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleGenerateRadar = useCallback(() => {
    if (radarResult && onRadarGenerated) {
      onRadarGenerated(radarResult);
    }
    setActiveTab('radar');
  }, [radarResult, onRadarGenerated]);
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 rounded-xl border border-slate-700/50 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Radar de Desequilibrios Sefiróticos</h2>
              <p className="text-slate-400 text-sm">
                Visualización integrando tests clínicos + biografía + cálculos cabalísticos
              </p>
            </div>
          </div>
          <div className="group relative">
            <Info className="h-5 w-5 text-slate-400 hover:text-slate-200 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-80 shadow-lg z-10">
              <p className="font-medium mb-1">Radar Multidimensional de Desequilibrios</p>
              <p>• Integra tests clínicos (MCMI4, BDI, GAD7, etc.)</p>
              <p>• Cruza biografía y eventos vitales</p>
              <p>• Aplica cálculos numerológicos cabalísticos</p>
              <p>• Visualiza fortalezas/desequilibrios por Sefirá</p>
              <p>• Sugiere plan de trabajo terapéutico específico</p>
              <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>
        
        {/* Innovation badge */}
        <div className="mt-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-200/80 text-sm flex items-center gap-2">
            <span>🚀</span>
            <span>
              <strong>Innovación única:</strong> Cruce de múltiples fuentes de datos en una sola visualización
              para identificar qué Sefirot trabajar primero.
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        {[
          { id: 'input' as const, label: '📥 Datos', desc: 'Agregar fuentes' },
          { id: 'radar' as const, label: '📊 Radar', desc: 'Visualización', disabled: !radarResult },
          { id: 'analysis' as const, label: '🔍 Análisis', desc: 'Desequilibrios', disabled: !radarResult },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`flex-1 py-3 px-4 text-center transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800/50 border-b-2 border-indigo-400 text-slate-100'
                : tab.disabled
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
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
                sources={dataSources}
                onAddSource={handleAddSource}
                onRemoveSource={handleRemoveSource}
              />
              
              {dataSources.length > 0 && (
                <div className="pt-4 border-t border-slate-700/50">
                  <button
                    onClick={handleGenerateRadar}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg px-6 py-3 font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    📊 Generar Radar de Desequilibrios
                  </button>
                  <p className="text-center text-slate-500 text-xs mt-2">
                    {dataSources.length} fuente(s) de datos cargada(s)
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Radar */}
          {activeTab === 'radar' && radarResult && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Main Insight */}
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-5 border border-indigo-500/30">
                <h3 className="text-lg font-bold text-indigo-100 mb-2">💡 Insight Principal</h3>
                <p className="text-indigo-200/80 text-lg">{radarResult.mainInsight}</p>
              </div>
              
              {/* Radar Visualization */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <SefirotRadarSVG sefirot={radarResult.sefirot} />
              </div>
              
              {/* Pillar Analysis */}
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <h4 className="font-semibold text-slate-200 mb-4">⚖️ Estado de Pilares</h4>
                <PillarBars pillars={radarResult.pillars} />
              </div>
            </motion.div>
          )}

          {/* Tab: Analysis */}
          {activeTab === 'analysis' && radarResult && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Imbalances */}
              {radarResult.imbalances.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-200 mb-3">
                    ⚠️ Desequilibrios Detectados ({radarResult.imbalances.length})
                  </h4>
                  <div className="space-y-3">
                    {radarResult.imbalances.map((imb, i) => (
                      <ImbalanceAlert key={i} imbalance={imb} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sefirot Details */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-3">🔯 Detalle por Sefirá</h4>
                <div className="grid gap-2">
                  {radarResult.sefirot
                    .sort((a, b) => {
                      // Critical first, then by level extremes
                      const aExtreme = Math.abs(a.level - 50);
                      const bExtreme = Math.abs(b.level - 50);
                      return bExtreme - aExtreme;
                    })
                    .map(sefira => (
                      <SefiraDetailCard
                        key={sefira.id}
                        sefira={sefira}
                        expanded={expandedSefira === sefira.id}
                        onToggle={() => setExpandedSefira(
                          expandedSefira === sefira.id ? null : sefira.id
                        )}
                      />
                    ))
                  }
                </div>
              </div>
              
              {/* Recommendations */}
              {radarResult.recommendations.length > 0 && (
                <div className="bg-emerald-950/30 rounded-xl p-5 border border-emerald-500/30">
                  <h4 className="font-semibold text-emerald-200 mb-3">
                    ✨ Plan de Trabajo Sugerido
                  </h4>
                  <div className="space-y-3">
                    {radarResult.recommendations.slice(0, 5).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-emerald-100 font-medium">
                            {rec.action === 'strengthen' ? 'Fortalecer' : rec.action === 'release' ? 'Soltar' : 'Equilibrar'} {SEFIROT_DATA[rec.sefira].name}
                          </p>
                          <p className="text-emerald-200/70 text-sm">{rec.reason}</p>
                          <p className="text-emerald-300/60 text-xs mt-1">
                            💡 {rec.practices[0]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <h4 className="font-semibold text-slate-200 mb-3">📋 Resumen</h4>
                <div className="prose prose-sm prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-300 text-sm bg-transparent p-0">
                    {radarResult.summary}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SefirotRadarPanel;
