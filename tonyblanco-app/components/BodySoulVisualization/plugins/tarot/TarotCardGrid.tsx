'use client';

import { useState } from 'react';
import { TarotKabbalahCalculator, TarotEngine, ARCANOS_MAYORES } from './tarot.logic';
import type { DrawnCard } from './types';

interface TarotCardGridProps {
  patientId?: string;
  patientBirthDate?: Date;
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: DrawnCard[]) => void;
  onCardSelect?: (card: DrawnCard) => void;
}

type ViewMode = 'chart' | 'reading' | 'correspondence';

export default function TarotCardGrid({ 
  patientId, 
  patientBirthDate,
  onSefirahHighlight,
  onReadingComplete,
  onCardSelect 
}: TarotCardGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [birthDate, setBirthDate] = useState<Date | null>(patientBirthDate || null);
  const [birthChart, setBirthChart] = useState<any>(null);
  const [currentReading, setCurrentReading] = useState<DrawnCard[] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);

  const handleCalculateChart = () => {
    if (birthDate) {
      const chart = TarotKabbalahCalculator.generateBirthChart(birthDate);
      setBirthChart(chart);
    }
  };

  const handlePerformReading = async () => {
    setIsShuffling(true);
    setCurrentReading(null);
    
    // Simular barajado
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reading = TarotEngine.treeOfLifeReading();
    setCurrentReading(reading);
    if (onReadingComplete) {
      onReadingComplete(reading);
    }
    setIsShuffling(false);
  };

  const handleCardClick = (card: DrawnCard) => {
    setSelectedCard(card);
    // Highlight sefirah en el árbol
    if (card.card.sefirah && onSefirahHighlight) {
      onSefirahHighlight(card.card.sefirah);
    }
  };

  const getEnergyBalance = () => {
    if (!currentReading) return null;
    return TarotEngine.analyzeBalance(currentReading);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <div>
            <h2 className="text-2xl font-bold">Tarot Cabalístico</h2>
            <p className="text-purple-100 text-sm">Sistema integrado de correspondencias terapéuticas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 flex gap-2">
        <button
          onClick={() => setViewMode('chart')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'chart'
              ? 'bg-purple-100 text-purple-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📊 Carta Natal
        </button>
        <button
          onClick={() => setViewMode('reading')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'reading'
              ? 'bg-purple-100 text-purple-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          🃏 Tirada del Árbol
        </button>
        <button
          onClick={() => setViewMode('correspondence')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'correspondence'
              ? 'bg-purple-100 text-purple-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          🔮 Correspondencias
        </button>
      </div>

      {/* VISTA: CARTA NATAL */}
      {viewMode === 'chart' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Calcular Carta Natal</h3>
              <p className="text-sm text-gray-600">Cartas personales según fecha de nacimiento</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento del Paciente
              </label>
              <input
                type="date"
                value={
                  birthDate && !Number.isNaN(birthDate.getTime())
                    ? birthDate.toISOString().split('T')[0]
                    : ''
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setBirthDate(nextValue ? new Date(nextValue) : null);
                }}
              />
            </div>
            <button
              onClick={handleCalculateChart}
              disabled={!birthDate}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Calcular Cartas
            </button>
          </div>

          {birthChart && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Soul Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">
                      Carta del Alma
                    </div>
                    <div className="text-3xl font-bold text-purple-900 mb-2">
                      {birthChart.soulCard.spanishName}
                    </div>
                    <div className="text-xl text-purple-600 mb-3">
                      {birthChart.soulCard.hebrewLetter}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {birthChart.soulCard.therapeuticTheme}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {birthChart.soulCard.keywords.slice(0, 3).map((kw: string) => (
                        <span key={kw} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personality Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                      Carta de Personalidad
                    </div>
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {birthChart.personalityCard.spanishName}
                    </div>
                    <div className="text-xl text-blue-600 mb-3">
                      {birthChart.personalityCard.hebrewLetter}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      Cómo te muestras al mundo exterior
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {birthChart.personalityCard.keywords.slice(0, 3).map((kw: string) => (
                        <span key={kw} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Year Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 hover:shadow-lg transition-all cursor-pointer">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">
                      Carta del Año {new Date().getFullYear()}
                    </div>
                    <div className="text-3xl font-bold text-amber-900 mb-2">
                      {birthChart.yearCard.spanishName}
                    </div>
                    <div className="text-xl text-amber-600 mb-3">
                      {birthChart.yearCard.hebrewLetter}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      Energía dominante del ciclo presente
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {birthChart.yearCard.keywords.slice(0, 3).map((kw: string) => (
                        <span key={kw} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Astrological Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Perfil Astrológico-Cabalístico
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Signo Solar</div>
                    <div className="text-lg font-bold text-gray-800 capitalize">{birthChart.sunSign}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Elemento</div>
                    <div className="text-lg font-bold text-gray-800 capitalize">{birthChart.soulCard.element}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Sefirá Principal</div>
                    <div className="text-lg font-bold text-gray-800 capitalize">{birthChart.soulCard.sefirah || 'N/A'}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Planeta</div>
                    <div className="text-lg font-bold text-gray-800">{birthChart.soulCard.planet || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* VISTA: TIRADA */}
      {viewMode === 'reading' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Tirada del Árbol de la Vida</h3>
                <p className="text-sm text-gray-600">10 cartas mapeadas sobre las Sefirot</p>
              </div>
              <button
                onClick={handlePerformReading}
                disabled={isShuffling}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  isShuffling
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isShuffling ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Barajando...
                  </span>
                ) : '🎴 Realizar Tirada'}
              </button>
            </div>

            {/* Energy Balance */}
            {currentReading && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">Balance Energético de los Pilares</h4>
                {(() => {
                  const balance = getEnergyBalance();
                  if (!balance) return null;
                  return (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">Pilar de la Severidad</span>
                          <span className="font-semibold text-gray-900">{balance.pillarSeverity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full transition-all" style={{width: `${balance.pillarSeverity}%`}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">Pilar de la Misericordia</span>
                          <span className="font-semibold text-gray-900">{balance.pillarMercy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${balance.pillarMercy}%`}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">Pilar del Equilibrio</span>
                          <span className="font-semibold text-gray-900">{balance.pillarEquilibrium}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all" style={{width: `${balance.pillarEquilibrium}%`}} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {currentReading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {currentReading.map((drawn, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(drawn)}
                  className={`group cursor-pointer bg-white rounded-lg border-2 p-4 hover:shadow-xl transition-all ${
                    selectedCard?.card.id === drawn.card.id
                      ? 'border-purple-500 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  } ${drawn.reversed ? 'transform rotate-180' : ''}`}
                >
                  <div className={drawn.reversed ? 'transform rotate-180' : ''}>
                    <div className="text-xs text-purple-600 font-semibold mb-1">
                      Posición {drawn.position}
                    </div>
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      {drawn.card.spanishName}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {drawn.positionMeaning}
                    </div>
                    {drawn.card.sefirah && (
                      <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block capitalize">
                        {drawn.card.sefirah}
                      </div>
                    )}
                    {drawn.reversed && (
                      <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full inline-block mt-1">
                        Invertida
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Card Details */}
          {selectedCard && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-gray-800">
                      {selectedCard.card.spanishName}
                    </h4>
                    {selectedCard.card.hebrewLetter && (
                      <span className="text-xl text-purple-600">
                        {selectedCard.card.hebrewLetter}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Significado Derecho:</strong>
                      </div>
                      <p className="text-sm text-gray-700">{selectedCard.card.upright}</p>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Significado Invertido:</strong>
                      </div>
                      <p className="text-sm text-gray-700">{selectedCard.card.reversed}</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-900 mb-2">
                      Tema Terapéutico
                    </div>
                    <p className="text-sm text-purple-800">{selectedCard.card.therapeuticTheme}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedCard.card.keywords.map((kw) => (
                      <span key={kw} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA: CORRESPONDENCIAS */}
      {viewMode === 'correspondence' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tabla de Correspondencias Cabalísticas</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Arcano</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Letra Hebrea</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Sefirá</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Planeta/Signo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Elemento</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tema Terapéutico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ARCANOS_MAYORES.map((card) => (
                  <tr key={card.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{card.spanishName}</td>
                    <td className="px-4 py-3 text-gray-600">{card.hebrewLetter}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{card.sefirah || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{card.planet || card.zodiacSign || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        card.element === 'fuego' ? 'bg-red-100 text-red-700' :
                        card.element === 'agua' ? 'bg-blue-100 text-blue-700' :
                        card.element === 'aire' ? 'bg-sky-100 text-sky-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {card.element}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{card.therapeuticTheme}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-1">Herramienta Consultiva</h4>
            <p className="text-xs text-amber-800">
              Este sistema integra Tarot, Cábala y Astrología como herramienta de exploración terapéutica. 
              No sustituye diagnóstico médico ni psicológico profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
