'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  QLIPHOTH,
  getQliphoticTree,
  NUMBER_POLARITIES,
  getNumberPolarity,
  generateShadowReport,
  getShadowAnalysisForMissingNumbers,
  type Qliphah,
} from '@holistica/symbolic/shadow';

interface ShadowWorkPanelProps {
  activeSefirot?: string[];
  missingNumbers?: number[];
  dominantNumber?: number;
  ausencias?: number[];
  sobrantes?: number[];
  onSave?: (shadowData: ShadowWorkData) => void;
}

interface ShadowWorkData {
  selectedQliphah: string | null;
  personalReflection: string;
  integrationCommitment: string;
  shadowInsights: string[];
}

const SEFIRA_NAMES: Record<string, string> = {
  keter: 'Keter (Corona)',
  chokmah: 'Chokmah (Sabiduría)',
  binah: 'Binah (Entendimiento)',
  chesed: 'Chesed (Misericordia)',
  gevurah: 'Gevurah (Juicio)',
  tiferet: 'Tiferet (Belleza)',
  netzach: 'Netzach (Victoria)',
  hod: 'Hod (Gloria)',
  yesod: 'Yesod (Fundación)',
  malkuth: 'Malkuth (Reino)',
};

export function ShadowWorkPanel({
  activeSefirot = [],
  missingNumbers = [],
  dominantNumber,
  ausencias = [],
  sobrantes = [],
}: ShadowWorkPanelProps) {
  const [activeTab, setActiveTab] = useState<'qliphoth' | 'polarities' | 'report'>('qliphoth');
  const [selectedQliphah, setSelectedQliphah] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [personalNotes, setPersonalNotes] = useState<string>('');

  // Merge ausencias into missingNumbers if provided
  const allMissingNumbers = useMemo(() => {
    const combined = [...new Set([...missingNumbers, ...ausencias])];
    return combined.sort((a, b) => a - b);
  }, [missingNumbers, ausencias]);

  // Generate shadow report
  const shadowReport = useMemo(() => {
    return generateShadowReport({
      activeSefirot,
      missingNumbers: allMissingNumbers,
      dominantNumber,
    });
  }, [activeSefirot, allMissingNumbers, dominantNumber]);

  // Get Qliphotic Tree data
  const qliphoticTree = useMemo(() => getQliphoticTree(), []);

  const selectedQliphahData = selectedQliphah ? QLIPHOTH[selectedQliphah] : null;
  const selectedNumberPolarity = selectedNumber ? getNumberPolarity(selectedNumber) : null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 rounded-xl border border-purple-500/30 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-900 to-red-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌑</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-100">Trabajo de Sombras</h2>
              <p className="text-purple-300/70 text-sm">
                Integración de las Qliphoth y polaridades numéricas
              </p>
            </div>
          </div>
          <div className="group relative">
            <Info className="h-5 w-5 text-purple-300/70 hover:text-purple-200 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Integración de Aspectos Sombra</p>
              <p>• Exploración de las Qliphoth (aspectos no desarrollados)</p>
              <p>• Polaridades numéricas y desequilibrios energéticos</p>
              <p>• Trabajo simbólico de autoconocimiento profundo</p>
              <p>• Enfoque educativo, NO terapia clínica</p>
              <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-4 bg-amber-900/30 border border-amber-500/30 rounded-lg p-3">
          <p className="text-amber-200/80 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Este módulo es <strong>educativo y simbólico</strong>. Las sombras son aspectos a integrar, no "defectos" a eliminar. 
              No constituye diagnóstico ni tratamiento clínico.
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-500/20">
        {[
          { id: 'qliphoth' as const, label: '🌑 Qliphoth', desc: 'Árbol Inverso' },
          { id: 'polarities' as const, label: '⚖️ Polaridades', desc: 'Luz/Sombra' },
          { id: 'report' as const, label: '📋 Informe', desc: 'Tu Análisis' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-center transition-all ${
              activeTab === tab.id
                ? 'bg-purple-900/40 border-b-2 border-purple-400 text-purple-100'
                : 'text-purple-300/60 hover:bg-purple-900/20 hover:text-purple-200'
            }`}
          >
            <div className="font-medium">{tab.label}</div>
            <div className="text-xs opacity-70">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Tab 1: Qliphoth Tree */}
          {activeTab === 'qliphoth' && (
            <motion.div
              key="qliphoth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Qliphotic Tree Visualization */}
                <div className="relative bg-gradient-to-b from-red-950/30 to-purple-950/30 rounded-xl p-4 min-h-[500px] border border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-200 mb-4 text-center">
                    {qliphoticTree.name}
                  </h3>
                  
                  {/* SVG Tree */}
                  <svg viewBox="0 0 100 100" className="w-full h-80">
                    {/* Paths */}
                    {qliphoticTree.paths.map((path, i) => {
                      const from = qliphoticTree.qliphoth.find(q => q.id === path.from);
                      const to = qliphoticTree.qliphoth.find(q => q.id === path.to);
                      if (!from || !to) return null;
                      return (
                        <line
                          key={i}
                          x1={from.position.x}
                          y1={from.position.y}
                          x2={to.position.x}
                          y2={to.position.y}
                          stroke="rgba(255, 100, 100, 0.3)"
                          strokeWidth="0.5"
                        />
                      );
                    })}

                    {/* Nodes */}
                    {qliphoticTree.qliphoth.map(({ id, qliphah, position }) => {
                      const isActive = activeSefirot.includes(qliphah.correspondingSefira);
                      const isSelected = selectedQliphah === id;
                      return (
                        <g key={id}>
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r={isSelected ? 5 : 4}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? 'fill-red-500'
                                : isActive
                                ? 'fill-purple-500'
                                : 'fill-red-900'
                            }`}
                            stroke={isActive ? '#a855f7' : '#7f1d1d'}
                            strokeWidth={isSelected ? 1.5 : 0.5}
                            onClick={() => setSelectedQliphah(id)}
                          />
                          <text
                            x={position.x}
                            y={position.y + 8}
                            textAnchor="middle"
                            className="fill-red-200/70 text-[3px]"
                          >
                            {qliphah.englishName}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="mt-4 flex justify-center gap-4 text-xs text-purple-200/60">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-purple-500" /> Activa en tu carta
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-900" /> Inactiva
                    </span>
                  </div>
                </div>

                {/* Qliphah Detail */}
                <div className="space-y-4">
                  {selectedQliphahData ? (
                    <div className="bg-red-950/30 rounded-xl p-5 border border-red-500/30">
                      <h3 className="text-xl font-bold text-red-200 flex items-center gap-2">
                        <span>🔮</span>
                        {selectedQliphahData.spanishName}
                        <span className="text-sm font-normal text-red-300/60 ml-2">
                          ({selectedQliphahData.hebrewName})
                        </span>
                      </h3>
                      <p className="text-red-200/70 mt-1 text-sm italic">
                        "{selectedQliphahData.meaning}"
                      </p>

                      <div className="mt-4 space-y-3">
                        <div>
                          <h4 className="text-red-300 font-medium text-sm">⚫ Sefirá Correspondiente</h4>
                          <p className="text-purple-200 mt-1">
                            {SEFIRA_NAMES[selectedQliphahData.correspondingSefira] || selectedQliphahData.correspondingSefira}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-red-300 font-medium text-sm">🎭 Arquetipo de Sombra</h4>
                          <p className="text-red-100 mt-1">{selectedQliphahData.archetype}</p>
                        </div>

                        <div>
                          <h4 className="text-red-300 font-medium text-sm">⚠️ Expresión Sombría</h4>
                          <p className="text-red-100/80 mt-1 text-sm">{selectedQliphahData.shadowExpression}</p>
                        </div>

                        <div className="bg-green-950/30 rounded-lg p-3 border border-green-500/20">
                          <h4 className="text-green-300 font-medium text-sm">✨ Camino de Integración</h4>
                          <p className="text-green-100/80 mt-1 text-sm">{selectedQliphahData.integrationPath}</p>
                        </div>

                        <div>
                          <h4 className="text-red-300 font-medium text-sm mb-2">🏷️ Palabras Clave</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedQliphahData.keywords.map(kw => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 bg-red-900/50 rounded text-xs text-red-200"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-950/20 rounded-xl p-8 text-center border border-purple-500/20">
                      <span className="text-4xl">🌑</span>
                      <p className="text-purple-300/60 mt-3">
                        Haz clic en una Qliphah del árbol para ver sus detalles
                      </p>
                    </div>
                  )}

                  {/* Quick List */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <h4 className="text-purple-200 font-medium mb-3">Lista de Qliphoth</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(QLIPHOTH).map(q => (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQliphah(q.id)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedQliphah === q.id
                              ? 'bg-red-900/50 text-red-100 border border-red-500/50'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="font-medium">{q.spanishName}</div>
                          <div className="text-xs opacity-60">↔ {SEFIRA_NAMES[q.correspondingSefira]?.split(' ')[0]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Number Polarities */}
          {activeTab === 'polarities' && (
            <motion.div
              key="polarities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Number Selector */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-200">Selecciona un Número</h3>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {NUMBER_POLARITIES.map(p => {
                      const isMissing = allMissingNumbers.includes(p.number);
                      const isSobrante = sobrantes.includes(p.number);
                      const isDominant = dominantNumber === p.number;
                      return (
                        <button
                          key={p.number}
                          onClick={() => setSelectedNumber(p.number)}
                          className={`relative p-3 rounded-lg text-center transition-all ${
                            selectedNumber === p.number
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                              : isMissing
                              ? 'bg-red-900/30 text-red-300 border border-red-500/30 hover:bg-red-900/50'
                              : isSobrante
                              ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          <span className="text-xl font-bold">{p.number}</span>
                          {isDominant && (
                            <span className="absolute -top-1 -right-1 text-xs">👑</span>
                          )}
                          {isMissing && (
                            <span className="absolute -bottom-1 right-1 text-[10px]">ausente</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 text-xs text-purple-200/60">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-red-900/50 border border-red-500/30" /> Ausente
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-amber-900/50 border border-amber-500/30" /> Sobrante
                    </span>
                    <span className="flex items-center gap-1">
                      👑 Dominante
                    </span>
                  </div>

                  {/* Missing Numbers Summary */}
                  {allMissingNumbers.length > 0 && (
                    <div className="bg-red-950/30 rounded-xl p-4 border border-red-500/20">
                      <h4 className="text-red-200 font-medium mb-2">🕳️ Números Ausentes (Sombras)</h4>
                      <p className="text-red-100/70 text-sm mb-3">
                        Los números ausentes indican energías que pueden estar en tu sombra—áreas inconscientes a integrar.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {allMissingNumbers.map(num => (
                          <button
                            key={num}
                            onClick={() => setSelectedNumber(num)}
                            className="px-3 py-1 bg-red-900/50 rounded text-red-200 text-sm hover:bg-red-800/50"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Polarity Detail */}
                <div>
                  {selectedNumberPolarity ? (
                    <div className="space-y-4">
                      {/* Light Expression */}
                      <div className="bg-gradient-to-br from-yellow-950/30 to-amber-950/20 rounded-xl p-5 border border-yellow-500/30">
                        <h3 className="text-xl font-bold text-yellow-200 flex items-center gap-2">
                          <span>☀️</span>
                          Expresión de Luz
                        </h3>
                        <h4 className="text-yellow-100 text-lg mt-2">
                          {selectedNumberPolarity.lightExpression.title}
                        </h4>
                        <p className="text-yellow-100/70 mt-2 text-sm">
                          {selectedNumberPolarity.lightExpression.description}
                        </p>
                        
                        <div className="mt-3">
                          <h5 className="text-yellow-200/80 text-sm font-medium">Dones:</h5>
                          <ul className="mt-1 text-sm text-yellow-100/60 list-disc list-inside">
                            {selectedNumberPolarity.lightExpression.gifts.map((gift, i) => (
                              <li key={i}>{gift}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {selectedNumberPolarity.lightExpression.keywords.map(kw => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 bg-yellow-900/50 rounded text-xs text-yellow-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Shadow Expression */}
                      <div className="bg-gradient-to-br from-red-950/30 to-purple-950/20 rounded-xl p-5 border border-red-500/30">
                        <h3 className="text-xl font-bold text-red-200 flex items-center gap-2">
                          <span>🌑</span>
                          Expresión de Sombra
                        </h3>
                        <h4 className="text-red-100 text-lg mt-2">
                          {selectedNumberPolarity.shadowExpression.title}
                        </h4>
                        <p className="text-red-100/70 mt-2 text-sm">
                          {selectedNumberPolarity.shadowExpression.description}
                        </p>

                        {selectedNumberPolarity.shadowExpression.originWound && (
                          <div className="mt-3 bg-red-900/30 rounded-lg p-3">
                            <h5 className="text-red-200/80 text-sm font-medium">💔 Herida Raíz:</h5>
                            <p className="text-red-100/70 text-sm mt-1">
                              {selectedNumberPolarity.shadowExpression.originWound}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <h5 className="text-red-200/80 text-sm font-medium">Desafíos:</h5>
                          <ul className="mt-1 text-sm text-red-100/60 list-disc list-inside">
                            {selectedNumberPolarity.shadowExpression.challenges.map((ch, i) => (
                              <li key={i}>{ch}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {selectedNumberPolarity.shadowExpression.keywords.map(kw => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 bg-red-900/50 rounded text-xs text-red-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Integration Path */}
                      <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/20 rounded-xl p-5 border border-green-500/30">
                        <h3 className="text-lg font-bold text-green-200 flex items-center gap-2">
                          <span>🌿</span>
                          Camino de Integración
                        </h3>
                        <p className="text-green-100/80 mt-2">
                          {selectedNumberPolarity.integrationPath}
                        </p>
                        
                        <div className="mt-4 bg-green-900/30 rounded-lg p-3 text-center">
                          <h5 className="text-green-200/80 text-sm font-medium mb-1">Afirmación</h5>
                          <p className="text-green-100 italic">
                            "{selectedNumberPolarity.affirmation}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-950/20 rounded-xl p-8 text-center border border-purple-500/20 h-full flex flex-col items-center justify-center">
                      <span className="text-4xl">⚖️</span>
                      <p className="text-purple-300/60 mt-3">
                        Selecciona un número para ver sus polaridades de Luz y Sombra
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Personal Report */}
          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overall Theme */}
              <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-purple-100 flex items-center gap-2">
                  <span>🔮</span>
                  Tema General de Sombra
                </h3>
                <p className="text-purple-200/80 mt-3 leading-relaxed">
                  {shadowReport.overallShadowTheme}
                </p>
              </div>

              {/* Dominant Number Shadow */}
              {shadowReport.dominantNumberShadow && (
                <div className="bg-amber-950/30 rounded-xl p-5 border border-amber-500/30">
                  <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                    <span>👑</span>
                    Sombra del Número Dominante ({shadowReport.dominantNumberShadow.number})
                  </h3>
                  <p className="text-amber-200/80 mt-3">
                    {shadowReport.dominantNumberShadow.balanceAdvice}
                  </p>
                </div>
              )}

              {/* Qliphoth Analysis */}
              {shadowReport.qliphothAnalysis.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-red-200 mb-4">
                    🌑 Qliphoth Activas en Tu Carta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shadowReport.qliphothAnalysis.map((analysis, i) => (
                      <div
                        key={i}
                        className="bg-red-950/30 rounded-lg p-4 border border-red-500/20"
                      >
                        <h4 className="font-medium text-red-100">
                          {SEFIRA_NAMES[analysis.activeSefira] || analysis.activeSefira}
                        </h4>
                        {analysis.correspondingQliphah && (
                          <p className="text-red-200/60 text-sm">
                            ↔ {analysis.correspondingQliphah.spanishName}
                          </p>
                        )}
                        <p className="text-red-100/70 text-sm mt-2">{analysis.shadowWarning}</p>
                        <p className="text-green-200/70 text-sm mt-2">
                          <span className="text-green-300">✨</span> {analysis.integrationGuidance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Numbers Shadow Work */}
              {shadowReport.missingNumbersShadows.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-purple-200 mb-4">
                    🕳️ Trabajo de Sombra por Números Ausentes
                  </h3>
                  <div className="space-y-3">
                    {shadowReport.missingNumbersShadows.map((shadow, i) => (
                      <div
                        key={i}
                        className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-purple-300">
                            {shadow.number}
                          </span>
                          <div className="flex-1">
                            <p className="text-purple-100/80 text-sm">{shadow.shadowWork}</p>
                            <p className="text-green-200/70 text-sm mt-1">
                              <span className="text-green-300">🌿</span> {shadow.integrationPath}
                            </p>
                            <p className="text-amber-200/80 text-sm mt-2 italic">
                              "{shadow.affirmation}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Notes */}
              <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-200 mb-3">
                  📝 Notas Personales de Integración
                </h3>
                <textarea
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                  placeholder="Escribe tus reflexiones sobre las sombras identificadas, compromisos de integración, y insights personales..."
                  className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* No Data Message */}
              {activeSefirot.length === 0 && allMissingNumbers.length === 0 && !dominantNumber && (
                <div className="bg-slate-900/50 rounded-xl p-8 text-center border border-slate-700/50">
                  <span className="text-4xl">📊</span>
                  <p className="text-slate-400 mt-3">
                    Aún no hay datos para generar el informe de sombras.
                    <br />
                    Completa un mapa numerológico o selecciona las sefirot activas.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ShadowWorkPanel;
