'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Scroll, ArrowLeft, BookOpen, Search, 
  Info, Sparkles, Copy, CheckCircle, AlertCircle,
  Lightbulb, X, Wand2, Loader2
} from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import { getAuthToken } from '@/lib/auth';
import AnalysisGuide from '@/components/shared/AnalysisGuide';
import {
  getGematriaRagil,
  getGematriaKatan,
  getGematriaGadol,
  getAtbashString,
  getAtbashValue,
  isHebrew,
  decomposeGematria,
  findResonances,
  transliterateToHebrew
} from '@/lib/gematria-engine';
import { HEBREW_KEYWORDS, findWordsByValue, searchWords } from '@/data/gematria-dictionary';
import { GEMATRIA_GUIDE_SECTIONS } from '@/data/gematria-guide-sections';

export default function GematriaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams?.get('patient_id');
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{
    ragil: number;
    katan: number;
    gadol: number;
    atbash: string;
    atbashValue: number;
    resonances: typeof HEBREW_KEYWORDS;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof HEBREW_KEYWORDS>([]);
  const [generatingInterpretation, setGeneratingInterpretation] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<any>(null);
  const [transliteratedText, setTransliteratedText] = useState('');
  const [showTransliteration, setShowTransliteration] = useState(false);

  useEffect(() => {
    if (input.trim()) {
      // Si el input no es hebreo, transliterar automáticamente
      if (!isHebrew(input)) {
        const transliterated = transliterateToHebrew(input);
        if (transliterated && isHebrew(transliterated)) {
          // Mostrar transliteración y calcular con ella
          setTransliteratedText(transliterated);
          setShowTransliteration(true);
          calculateGematria(transliterated);
        } else if (transliterated) {
          // Si transliteró pero no es hebreo válido, mostrar de todas formas
          setTransliteratedText(transliterated);
          setShowTransliteration(true);
          // Intentar calcular (puede que tenga algunos caracteres hebreos)
          calculateGematria(transliterated);
        } else {
          // No se pudo transliterar
          setTransliteratedText('');
          setShowTransliteration(false);
          setResults(null);
        }
      } else {
        // Si ya es hebreo, calcular directamente
        setTransliteratedText('');
        setShowTransliteration(false);
        calculateGematria(input);
      }
    } else {
      setResults(null);
      setTransliteratedText('');
      setShowTransliteration(false);
    }
  }, [input]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchWords(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const calculateGematria = (text: string) => {
    // Usar el texto transliterado si está disponible, de lo contrario usar el texto original
    // Las funciones de cálculo transliteran automáticamente, pero preferimos usar el texto ya transliterado
    const textToCalculate = transliteratedText && isHebrew(transliteratedText) 
      ? transliteratedText 
      : (isHebrew(text) ? text : text);

    // Si no hay texto válido para calcular, limpiar resultados
    if (!textToCalculate || (!isHebrew(textToCalculate) && !transliteratedText)) {
      // Intentar calcular de todas formas (las funciones transliteran internamente)
      const ragil = getGematriaRagil(textToCalculate || text);
      if (ragil === 0 && !isHebrew(textToCalculate || text)) {
        setResults(null);
        return;
      }
    }

    // Calcular todos los valores usando el texto hebreo (transliterado o original)
    const ragil = getGematriaRagil(textToCalculate || text);
    const katan = getGematriaKatan(textToCalculate || text);
    const gadol = getGematriaGadol(textToCalculate || text);
    const atbash = getAtbashString(textToCalculate || text);
    const atbashValue = getAtbashValue(textToCalculate || text);
    const resonances = findResonances(ragil, HEBREW_KEYWORDS);

    setResults({
      ragil,
      katan,
      gadol,
      atbash,
      atbashValue,
      resonances
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveAnalysis = async () => {
    if (!results || !input || !patientId) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const summary = `Gematria de "${input}": Ragil=${results.ragil}, Katan=${results.katan}, Gadol=${results.gadol}`;
      
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/cabalistic-analysis/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          analysis_type: 'gematria',
          input_data: { word: input, transliterated: transliteratedText },
          result_data: { ...results, ai_interpretation: aiInterpretation },
          summary: summary
        })
      });

      if (response.ok) {
        alert('Análisis de Gematria guardado exitosamente en la ficha del paciente');
      }
    } catch (err: any) {
      console.error('Error al guardar:', err);
    }
  };

  const handleGenerateInterpretation = async () => {
    if (!results || !input) {
      alert('Primero ingresa una palabra en hebreo y calcula sus valores');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Debes estar autenticado para usar esta función');
      router.push('/login');
      return;
    }

    setGeneratingInterpretation(true);
    setAiInterpretation(null);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/gematria/interpret/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          word: input,
          ragil: results.ragil,
          katan: results.katan,
          gadol: results.gadol,
          atbash_value: results.atbashValue,
          resonances: results.resonances.map(r => ({
            word: r.word,
            transliteration: r.transliteration,
            meaning: r.meaning,
            value: r.value,
            category: r.category
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al generar la interpretación');
      }

      const data = await response.json();
      
      if (data.interpretation) {
        setAiInterpretation(data.interpretation);
      } else {
        throw new Error('No se recibió la interpretación en la respuesta');
      }
    } catch (err: any) {
      alert('Error al generar la interpretación: ' + err.message);
      console.error('Error:', err);
    } finally {
      setGeneratingInterpretation(false);
    }
  };

  const isInputHebrew = input ? isHebrew(input) : null;

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/therapist')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gematria Pro</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Calculadora y herramienta educativa de Gematria Cabalística
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                📖 Guía de Interpretación
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Main Content - Calculadora */}
            <div className={`${showGuide ? 'flex-1' : 'w-full'} space-y-8`}>
              {/* Input Principal - Grande y Centrado */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <div className="max-w-2xl mx-auto">
                  <label className="block text-center text-lg font-medium text-gray-700 mb-4">
                    Ingresa texto en Hebreo o Español
                  </label>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="אהבה שלום משיח... o escribe en español: amor, paz, etc."
                      className="w-full px-6 py-6 border-2 border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-gray-400 text-left text-2xl font-sans min-h-[120px]"
                      rows={3}
                      dir="ltr"
                    />
                    {input && (
                      <button
                        onClick={() => {
                          setInput('');
                          setTransliteratedText('');
                          setShowTransliteration(false);
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Transliteración en Tiempo Real - Mostrar siempre que haya input no hebreo */}
                  {input.trim() && !isHebrew(input) && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">
                            Traduciendo fonéticamente a Hebreo para cálculo...
                          </p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            El sistema translitera automáticamente tu texto en español/inglés a hebreo
                          </p>
                        </div>
                      </div>
                      
                      {transliteratedText ? (
                        <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-inner">
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Texto Original:</p>
                            <p className="text-lg font-semibold text-gray-800">{input}</p>
                          </div>
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">Transliteración en Hebreo:</p>
                            <p className="text-4xl font-serif text-right leading-relaxed" dir="rtl">
                              {transliteratedText}
                            </p>
                          </div>
                          {isHebrew(transliteratedText) && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <p className="text-xs text-green-700 font-medium">
                                  Texto hebreo válido - Los cálculos se realizarán con esta transliteración
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-900">
                                No se pudo transliterar automáticamente
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Escribe directamente en hebreo o usa caracteres del alfabeto español/inglés para transliteración automática.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Indicador cuando el texto ya es hebreo */}
                  {input.trim() && isHebrew(input) && (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">
                            Texto hebreo detectado correctamente
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">
                            Los cálculos se realizarán directamente con este texto
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de Resultados - 4 Tarjetas */}
              {results && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Tarjeta 1: Mispar Ragil */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-blue-900">Mispar Ragil</h3>
                        <button
                          onClick={() => copyToClipboard(results.ragil.toString(), 'ragil')}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded transition-colors"
                        >
                          {copied === 'ragil' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-5xl font-bold text-blue-900 mb-2">{results.ragil}</p>
                      <p className="text-xs text-blue-700 leading-relaxed">Valor estándar. Cada letra tiene su valor tradicional (Aleph=1, Bet=2, etc.)</p>
                    </div>

                    {/* Tarjeta 2: Mispar Katan */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-purple-900">Mispar Katan</h3>
                        <button
                          onClick={() => copyToClipboard(results.katan.toString(), 'katan')}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded transition-colors"
                        >
                          {copied === 'katan' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-5xl font-bold text-purple-900 mb-2">{results.katan}</p>
                      <p className="text-xs text-purple-700 leading-relaxed">Valor reducido a un solo dígito (1-9), excepto 11 y 22 que se mantienen</p>
                    </div>

                    {/* Tarjeta 3: Mispar Gadol */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-amber-900">Mispar Gadol</h3>
                        <button
                          onClick={() => copyToClipboard(results.gadol.toString(), 'gadol')}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded transition-colors"
                        >
                          {copied === 'gadol' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-5xl font-bold text-amber-900 mb-2">{results.gadol}</p>
                      <p className="text-xs text-amber-700 leading-relaxed">Valor completo usando letras finales (Sofit): Mem final=600, Nun final=600, etc.</p>
                    </div>

                    {/* Tarjeta 4: Atbash */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-indigo-900">Atbash</h3>
                        <button
                          onClick={() => copyToClipboard(results.atbashValue.toString(), 'atbash')}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded transition-colors"
                        >
                          {copied === 'atbash' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-5xl font-bold text-indigo-900 mb-2">{results.atbashValue}</p>
                      <p className="text-xs text-indigo-700 leading-relaxed">Transformación por inversión del alfabeto (Aleph ↔ Tav, Bet ↔ Shin)</p>
                    </div>
                  </div>

                  {/* Sección Resonancias Místicas */}
                  {results.resonances.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-purple-200 p-8 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Sparkles className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Resonancias Místicas</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Este valor ({results.ragil}) también vibra con:
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.resonances.map((word, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-center mb-3">
                              <p className="text-3xl font-serif mb-2" dir="rtl">{word.word}</p>
                              <p className="text-lg font-semibold text-purple-900">{word.transliteration}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-700 font-medium mb-2">({word.meaning})</p>
                              {word.category && (
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                  {word.category}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center">
                      <button
                        onClick={handleGenerateInterpretation}
                        disabled={generatingInterpretation}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {generatingInterpretation ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generando Interpretación...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5" />
                            ✨ Generar Interpretación con IA
                          </>
                        )}
                      </button>
                    </div>
                    
                    {patientId && results && (
                      <div className="flex justify-center">
                        <button
                          onClick={handleSaveAnalysis}
                          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          <CheckCircle className="h-5 w-5" />
                          💾 Guardar en Ficha del Paciente
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interpretación de IA */}
                  {aiInterpretation && (
                    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl border-2 border-purple-300/50 p-8 shadow-2xl text-white">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/30 rounded-full">
                          <Sparkles className="h-6 w-6 text-purple-300" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-purple-200">{aiInterpretation.titulo}</h3>
                          <p className="text-sm text-purple-300 mt-1">Interpretación Espiritual Generada por IA</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Análisis Ragil */}
                        {aiInterpretation.analisis_ragil && (
                          <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500/30">
                            <h4 className="text-lg font-semibold text-blue-200 mb-3 flex items-center gap-2">
                              <span className="text-blue-400">1.</span> Ragil - La Realidad
                            </h4>
                            <p className="text-gray-100 leading-relaxed mb-3">{aiInterpretation.analisis_ragil.significado}</p>
                            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
                              <p className="text-sm text-blue-200 mb-2"><strong>Manifestación:</strong> {aiInterpretation.analisis_ragil.manifestacion}</p>
                              <p className="text-sm text-blue-200"><strong>Mensaje del Alma:</strong> {aiInterpretation.analisis_ragil.mensaje}</p>
                            </div>
                          </div>
                        )}

                        {/* Análisis Katan */}
                        {aiInterpretation.analisis_katan && (
                          <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30">
                            <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                              <span className="text-purple-400">2.</span> Katan - La Esencia
                            </h4>
                            <p className="text-gray-100 leading-relaxed mb-3">{aiInterpretation.analisis_katan.significado}</p>
                            <div className="bg-purple-950/50 rounded p-4 border border-purple-700/30">
                              <p className="text-sm text-purple-200 mb-2"><strong>Lección Kármica:</strong> {aiInterpretation.analisis_katan.leccion}</p>
                              <p className="text-sm text-purple-200"><strong>Arquetipo:</strong> {aiInterpretation.analisis_katan.arquetipo}</p>
                            </div>
                          </div>
                        )}

                        {/* Análisis Gadol */}
                        {aiInterpretation.analisis_gadol && (
                          <div className="bg-amber-900/30 rounded-lg p-6 border border-amber-500/30">
                            <h4 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
                              <span className="text-amber-400">3.</span> Gadol - El Potencial
                            </h4>
                            <p className="text-gray-100 leading-relaxed mb-3">{aiInterpretation.analisis_gadol.significado}</p>
                            <div className="bg-amber-950/50 rounded p-4 border border-amber-700/30">
                              <p className="text-sm text-amber-200 mb-2"><strong>Tikún (Corrección):</strong> {aiInterpretation.analisis_gadol.tikun}</p>
                              <p className="text-sm text-amber-200"><strong>Evolución:</strong> {aiInterpretation.analisis_gadol.evolucion}</p>
                            </div>
                          </div>
                        )}

                        {/* Análisis Atbash */}
                        {aiInterpretation.analisis_atbash && (
                          <div className="bg-indigo-900/30 rounded-lg p-6 border border-indigo-500/30">
                            <h4 className="text-lg font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                              <span className="text-indigo-400">4.</span> Atbash - La Sombra
                            </h4>
                            <p className="text-gray-100 leading-relaxed mb-3">{aiInterpretation.analisis_atbash.significado}</p>
                            <div className="bg-indigo-950/50 rounded p-4 border border-indigo-700/30">
                              <p className="text-sm text-indigo-200 mb-2"><strong>Bloqueos:</strong> {aiInterpretation.analisis_atbash.bloqueos}</p>
                              <p className="text-sm text-indigo-200"><strong>La Sombra:</strong> {aiInterpretation.analisis_atbash.sombra}</p>
                            </div>
                          </div>
                        )}

                        {/* Síntesis */}
                        {aiInterpretation.sintesis && (
                          <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-lg p-6 border-2 border-emerald-500/30">
                            <h4 className="text-lg font-semibold text-emerald-200 mb-3 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5" />
                              Síntesis Integradora
                            </h4>
                            <p className="text-gray-100 leading-relaxed text-base">{aiInterpretation.sintesis}</p>
                          </div>
                        )}

                        {/* Meditación y Acción */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aiInterpretation.meditacion && (
                            <div className="bg-purple-900/40 rounded-lg p-5 border border-purple-500/30">
                              <h4 className="text-base font-semibold text-purple-200 mb-2">🧘 Meditación</h4>
                              <p className="text-sm text-gray-200 leading-relaxed italic">{aiInterpretation.meditacion}</p>
                            </div>
                          )}
                          {aiInterpretation.accion_espiritual && (
                            <div className="bg-indigo-900/40 rounded-lg p-5 border border-indigo-500/30">
                              <h4 className="text-base font-semibold text-indigo-200 mb-2">✨ Acción Espiritual</h4>
                              <p className="text-sm text-gray-200 leading-relaxed">{aiInterpretation.accion_espiritual}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descomposición */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Descomposición del Valor</h3>
                    <div className="flex flex-wrap gap-2">
                      {decomposeGematria(results.ragil).map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                          <span className="text-xl font-serif" dir="rtl">{comp.letter}</span>
                          <span className="text-sm text-gray-600">=</span>
                          <span className="font-semibold text-gray-900">{comp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Diccionario de Búsqueda */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-600" />
                  Buscar en Diccionario
                </h3>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por significado o transliteración..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-400"
                />
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((word, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-lg font-serif text-right mb-1" dir="rtl">{word.word}</p>
                            <p className="text-sm font-semibold text-gray-900">{word.transliteration}</p>
                            <p className="text-xs text-gray-600 mt-1">{word.meaning}</p>
                          </div>
                          <span className="text-lg font-bold text-amber-600 ml-3">{word.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Componente Universal AnalysisGuide */}
            <AnalysisGuide
              title="Protocolo de Análisis Gematria"
              subtitle="Manual de Interpretación para Terapeutas"
              content={GEMATRIA_GUIDE_SECTIONS}
              isOpen={showGuide}
              onClose={() => setShowGuide(false)}
              accentColor="amber"
              maxWidth="2xl"
            />
          </div>
        </div>
      </div>
    </TherapistRoute>
  );
}
