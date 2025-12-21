'use client';

import { useState } from 'react';
import BodySoulVisualization from '@/components/BodySoulVisualization';
import TarotCardGrid from './TarotCardGrid';
import TarotTreeOverlay from './TarotTreeOverlay';
import type { DrawnCard } from './types';
import type { PatientContext } from '@/components/BodySoulVisualization/types';

interface TarotLayerProps {
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
}

type ActiveModule = 'bodyTree' | 'tarot' | 'integrated';

export default function TarotLayer({ 
  patientId, 
  patientName,
  patientBirthDate 
}: TarotLayerProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>('bodyTree');
  const [highlightedSefirah, setHighlightedSefirah] = useState<string | null>(null);
  const [currentReading, setCurrentReading] = useState<DrawnCard[] | null>(null);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);

  const handleSefirahHighlight = (sefirahId: string | null) => {
    setHighlightedSefirah(sefirahId);
  };

  const handleReadingComplete = (reading: DrawnCard[]) => {
    setCurrentReading(reading);
    // Cambiar automáticamente a vista integrada cuando se completa una tirada
    setActiveModule('integrated');
  };

  const handleCardSelect = (card: DrawnCard) => {
    setSelectedCard(card);
    if (card.card.sefirah) {
      handleSefirahHighlight(card.card.sefirah);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Panel Visual Integrativo</h1>
                <p className="text-white/90 text-sm">
                  Sistema de correspondencias: Cuerpo • Cábala • Tarot • Astrología
                </p>
              </div>
            </div>
            
            {patientName && (
              <div className="text-right">
                <div className="text-xs text-white/70 uppercase tracking-wide">Paciente</div>
                <div className="text-lg font-semibold">{patientName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Module Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveModule('bodyTree')}
              className={`flex-1 group relative overflow-hidden rounded-xl px-6 py-4 font-medium transition-all duration-300 ${
                activeModule === 'bodyTree'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Cuerpo + Árbol de la Vida</span>
              </div>
              {activeModule === 'bodyTree' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
              )}
            </button>

            <button
              onClick={() => setActiveModule('tarot')}
              className={`flex-1 group relative overflow-hidden rounded-xl px-6 py-4 font-medium transition-all duration-300 ${
                activeModule === 'tarot'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Tarot Cabalístico</span>
              </div>
              {activeModule === 'tarot' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
              )}
            </button>

            <button
              onClick={() => setActiveModule('integrated')}
              disabled={!currentReading}
              className={`flex-1 group relative overflow-hidden rounded-xl px-6 py-4 font-medium transition-all duration-300 ${
                activeModule === 'integrated'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
                  : currentReading
                  ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                <span>Vista Integrada</span>
                {!currentReading && (
                  <span className="text-xs opacity-70">(Requiere tirada)</span>
                )}
              </div>
              {activeModule === 'integrated' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* MODULE: Body + Tree of Life */}
        {activeModule === 'bodyTree' && (
          <div className="space-y-6">
            <BodySoulVisualization
              patientId={patientId}
              patientBirthDate={patientBirthDate}
              onSefirahHighlight={handleSefirahHighlight}
            />
          </div>
        )}

        {/* MODULE: Tarot */}
        {activeModule === 'tarot' && (
          <div className="space-y-6">
            <TarotCardGrid
              patientId={patientId}
              patientBirthDate={patientBirthDate}
              onSefirahHighlight={handleSefirahHighlight}
              onReadingComplete={handleReadingComplete}
              onCardSelect={handleCardSelect}
            />
          </div>
        )}

        {/* MODULE: Integrated View */}
        {activeModule === 'integrated' && (
          <div className="space-y-6">
            {currentReading ? (
              <>
                {/* Main Integrated View */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left: Tree with Cards */}
                  <div className="space-y-4">
                    <TarotTreeOverlay
                      reading={currentReading}
                      onCardSelect={handleCardSelect}
                      selectedCard={selectedCard}
                    />
                  </div>

                  {/* Right: Body + Sefirot Highlight */}
                  <div className="space-y-4">
                    <BodySoulVisualization
                      patientId={patientId}
                      patientBirthDate={patientBirthDate}
                      highlightedSefirah={highlightedSefirah}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Selected Card Details */}
                {selectedCard && (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                    <div className="flex items-start gap-6">
                      {/* Card Visual Representation */}
                      <div className="flex-shrink-0">
                        <div className={`w-40 h-60 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border-4 flex items-center justify-center shadow-xl ${
                          selectedCard.reversed ? 'rotate-180' : ''
                        }`} style={{ borderColor: selectedCard.card.element === 'fuego' ? '#ef4444' :
                                                     selectedCard.card.element === 'agua' ? '#3b82f6' :
                                                     selectedCard.card.element === 'aire' ? '#0ea5e9' : '#22c55e' }}>
                          <div className={`text-center ${selectedCard.reversed ? 'rotate-180' : ''}`}>
                            <div className="text-5xl mb-2">
                              {selectedCard.card.hebrewLetter?.split(' ')[0] || '🃏'}
                            </div>
                            <div className="text-sm font-bold text-purple-800 px-4">
                              {selectedCard.card.spanishName}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Information */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-3xl font-bold text-slate-800">
                              {selectedCard.card.spanishName}
                            </h3>
                            {selectedCard.card.hebrewLetter && (
                              <span className="text-2xl text-purple-600">
                                {selectedCard.card.hebrewLetter}
                              </span>
                            )}
                            {selectedCard.reversed && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                                ↓ Invertida
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600">
                            <strong>Posición:</strong> {selectedCard.positionMeaning}
                          </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedCard.card.sefirah && (
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <div className="text-xs text-purple-600 font-semibold mb-1">SEFIRÁ</div>
                              <div className="text-sm font-bold text-purple-800 capitalize">
                                {selectedCard.card.sefirah}
                              </div>
                            </div>
                          )}
                          {selectedCard.card.element && (
                            <div className={`rounded-lg p-3 border ${
                              selectedCard.card.element === 'fuego' ? 'bg-red-50 border-red-200' :
                              selectedCard.card.element === 'agua' ? 'bg-blue-50 border-blue-200' :
                              selectedCard.card.element === 'aire' ? 'bg-sky-50 border-sky-200' :
                              'bg-green-50 border-green-200'
                            }`}>
                              <div className="text-xs font-semibold mb-1" style={{color: 
                                selectedCard.card.element === 'fuego' ? '#991b1b' :
                                selectedCard.card.element === 'agua' ? '#1e40af' :
                                selectedCard.card.element === 'aire' ? '#075985' : '#166534'
                              }}>ELEMENTO</div>
                              <div className="text-sm font-bold capitalize" style={{color: 
                                selectedCard.card.element === 'fuego' ? '#991b1b' :
                                selectedCard.card.element === 'agua' ? '#1e40af' :
                                selectedCard.card.element === 'aire' ? '#075985' : '#166534'
                              }}>
                                {selectedCard.card.element}
                              </div>
                            </div>
                          )}
                          {selectedCard.card.planet && (
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                              <div className="text-xs text-amber-600 font-semibold mb-1">PLANETA</div>
                              <div className="text-sm font-bold text-amber-800">
                                {selectedCard.card.planet}
                              </div>
                            </div>
                          )}
                          {selectedCard.card.zodiacSign && (
                            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                              <div className="text-xs text-indigo-600 font-semibold mb-1">SIGNO</div>
                              <div className="text-sm font-bold text-indigo-800 capitalize">
                                {selectedCard.card.zodiacSign}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Meanings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div className="text-xs font-bold text-green-800 uppercase">Derecho</div>
                            </div>
                            <p className="text-sm text-green-900">{selectedCard.card.upright}</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <div className="text-xs font-bold text-red-800 uppercase">Invertido</div>
                            </div>
                            <p className="text-sm text-red-900">{selectedCard.card.reversed}</p>
                          </div>
                        </div>

                        {/* Therapeutic Theme */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <h4 className="font-bold text-purple-900">Tema Terapéutico</h4>
                          </div>
                          <p className="text-purple-800 leading-relaxed">
                            {selectedCard.card.therapeuticTheme}
                          </p>
                        </div>

                        {/* Keywords */}
                        <div>
                          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Palabras Clave</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedCard.card.keywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    No hay tirada activa
                  </h3>
                  <p className="text-slate-600">
                    Ve al módulo de <strong>Tarot Cabalístico</strong> y realiza una tirada 
                    del Árbol de la Vida para ver la visualización integrada.
                  </p>
                  <button
                    onClick={() => setActiveModule('tarot')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Ir a Tarot Cabalístico
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 mb-1">Sistema Consultivo Integrativo</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Esta herramienta integra múltiples sistemas simbólicos (Cábala, Tarot, Astrología) 
              para exploración terapéutica. No sustituye diagnóstico médico ni psicológico profesional. 
              Todas las interpretaciones deben ser realizadas por un terapeuta cualificado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
