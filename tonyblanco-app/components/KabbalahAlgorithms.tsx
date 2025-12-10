'use client';

import React, { useState } from 'react';
import { Shuffle, Code, BookText, Info, Sparkles, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemurahResult {
  original: string;
  transformed: string;
  method: string;
  originalValue: number;
  transformedValue: number;
  explanation: string;
  knownWords?: Array<{ word: string; meaning: string }>;
}

interface NotarikonResult {
  original: string;
  acronym: string;
  expansion: string[];
  finalLetters: string;
  acronymValue: number;
  explanation: string;
}

const KabbalahAlgorithms = () => {
  const [activeTab, setActiveTab] = useState<'temurah' | 'atbash' | 'notarikon'>('temurah');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TemurahResult | NotarikonResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('albam');

  // Alfabeto hebreo
  const hebrewAlphabet = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 
    'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
  ];

  // Valores Gematría
  const gematriaValues: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100,
    'ר': 200, 'ש': 300, 'ת': 400
  };

  // ========== TEMURAH ==========
  const temurahMethods: Record<string, (letter: string) => string> = {
    // Albam: Primera mitad ↔ Segunda mitad
    albam: (letter: string) => {
      const index = hebrewAlphabet.indexOf(letter);
      if (index === -1) return letter;
      if (index < 11) {
        return hebrewAlphabet[index + 11];
      } else {
        return hebrewAlphabet[index - 11];
      }
    },

    // Atbah: א↔ת, ב↔ש, etc.
    atbah: (letter: string) => {
      const index = hebrewAlphabet.indexOf(letter);
      if (index === -1) return letter;
      return hebrewAlphabet[21 - index];
    },

    // Avgad: Cada letra avanza una posición
    avgad: (letter: string) => {
      const index = hebrewAlphabet.indexOf(letter);
      if (index === -1) return letter;
      return hebrewAlphabet[(index + 1) % 22];
    },

    // Reverse Avgad: Cada letra retrocede una posición
    reverse_avgad: (letter: string) => {
      const index = hebrewAlphabet.indexOf(letter);
      if (index === -1) return letter;
      return hebrewAlphabet[(index - 1 + 22) % 22];
    },

    // Ayak Bakar: Grupos de 9 letras
    ayak_bakar: (letter: string) => {
      const groups = [
        ['א', 'י', 'ק'],
        ['ב', 'כ', 'ר'],
        ['ג', 'ל', 'ש'],
        ['ד', 'מ', 'ת'],
        ['ה', 'נ'],
        ['ו', 'ס'],
        ['ז', 'ע'],
        ['ח', 'פ'],
        ['ט', 'צ']
      ];
      
      for (let group of groups) {
        const index = group.indexOf(letter);
        if (index !== -1) {
          return group[(index + 1) % group.length];
        }
      }
      return letter;
    }
  };

  const applyTemurah = () => {
    if (!inputText) return;
    
    const transformed = inputText.split('').map(char => {
      if (temurahMethods[selectedMethod]) {
        return temurahMethods[selectedMethod](char);
      }
      return char;
    }).join('');

    const originalValue = calculateGematria(inputText);
    const transformedValue = calculateGematria(transformed);

    setResult({
      original: inputText,
      transformed: transformed,
      method: selectedMethod,
      originalValue,
      transformedValue,
      explanation: getTemurahExplanation(selectedMethod)
    });
  };

  // ========== ATBASH ==========
  const applyAtbash = () => {
    if (!inputText) return;
    
    const transformed = inputText.split('').map(char => {
      const index = hebrewAlphabet.indexOf(char);
      if (index === -1) return char;
      return hebrewAlphabet[21 - index];
    }).join('');

    const originalValue = calculateGematria(inputText);
    const transformedValue = calculateGematria(transformed);

    // Buscar palabras conocidas
    const knownWords = findKnownWords(transformed);

    setResult({
      original: inputText,
      transformed: transformed,
      method: 'atbash',
      originalValue,
      transformedValue,
      knownWords,
      explanation: 'Atbash invierte el alfabeto: א↔ת, ב↔ש, ג↔ר... Es la técnica más famosa, mencionada en la Biblia (Jeremías 25:26, 51:41).'
    });
  };

  // ========== NOTARIKON ==========
  const applyNotarikon = () => {
    if (!inputText) return;

    // Tipo 1: Acrónimo (primeras letras)
    const acronym = inputText.split(' ')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('');

    // Tipo 2: Expansión (cada letra es inicio de palabra)
    const expansion = inputText.split('').map(letter => {
      return expandLetter(letter);
    });

    // Tipo 3: Últimas letras
    const finalLetters = inputText.split(' ')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .map(word => word[word.length - 1])
      .join('');

    setResult({
      original: inputText,
      acronym,
      expansion,
      finalLetters,
      acronymValue: calculateGematria(acronym),
      explanation: 'Notarikon crea nuevas palabras tomando las primeras, últimas o medias letras, o expandiendo cada letra en una palabra completa.'
    });
  };

  // ========== FUNCIONES AUXILIARES ==========
  const calculateGematria = (text: string): number => {
    return text.split('').reduce((sum, char) => {
      return sum + (gematriaValues[char] || 0);
    }, 0);
  };

  const expandLetter = (letter: string): string => {
    const expansions: Record<string, string> = {
      'א': 'אלף', 'ב': 'בית', 'ג': 'גימל', 'ד': 'דלת', 'ה': 'הא',
      'ו': 'ואו', 'ז': 'זין', 'ח': 'חית', 'ט': 'טית', 'י': 'יוד',
      'כ': 'כף', 'ל': 'למד', 'מ': 'מם', 'נ': 'נון', 'ס': 'סמך',
      'ע': 'עין', 'פ': 'פא', 'צ': 'צדי', 'ק': 'קוף', 'ר': 'ריש',
      'ש': 'שין', 'ת': 'תו'
    };
    return expansions[letter] || letter;
  };

  const findKnownWords = (text: string): Array<{ word: string; meaning: string }> => {
    const knownHebrewWords: Record<string, string> = {
      'משיח': 'Mesías',
      'שטן': 'Satán',
      'אדם': 'Adán/Humanidad',
      'חוה': 'Eva',
      'אלהים': 'Dios',
      'יהוה': 'YHVH (Nombre Divino)',
      'אהבה': 'Amor',
      'שלום': 'Paz',
      'חיים': 'Vida',
      'תורה': 'Torá',
      'ברית': 'Pacto',
      'גן': 'Jardín',
      'עדן': 'Edén'
    };

    const found: Array<{ word: string; meaning: string }> = [];
    for (let word in knownHebrewWords) {
      if (text.includes(word)) {
        found.push({ word, meaning: knownHebrewWords[word] });
      }
    }
    return found;
  };

  const getTemurahExplanation = (method: string): string => {
    const explanations: Record<string, string> = {
      albam: 'AlBaM divide el alfabeto en dos mitades de 11 letras. Primera mitad ↔ Segunda mitad.',
      atbah: 'AtBaH invierte el alfabeto completamente: primera con última, segunda con penúltima, etc.',
      avgad: 'AvGaD avanza cada letra una posición en el alfabeto (א→ב, ב→ג, etc.).',
      reverse_avgad: 'AvGaD Inverso retrocede cada letra una posición (ב→א, ג→ב, etc.).',
      ayak_bakar: 'AYaK BaKaR agrupa letras por valor de decenas (1-10-100, 2-20-200, etc.).'
    };
    return explanations[method] || '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isTemurahResult = (res: any): res is TemurahResult => {
    return 'transformed' in res;
  };

  const isNotarikonResult = (res: any): res is NotarikonResult => {
    return 'acronym' in res;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Algoritmos Cabalísticos
            </h1>
          </div>
          <p className="text-purple-300 text-lg">Temurah • Atbash • Notarikon</p>
          <p className="text-purple-400 text-sm mt-2">Técnicas milenarias de transformación del texto hebreo</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          <Button
            onClick={() => setActiveTab('temurah')}
            className={`px-6 py-3 flex items-center gap-2 transition-all font-semibold ${
              activeTab === 'temurah' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50' 
                : 'bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            Temurah (Permutación)
          </Button>
          <Button
            onClick={() => setActiveTab('atbash')}
            className={`px-6 py-3 flex items-center gap-2 transition-all font-semibold ${
              activeTab === 'atbash' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/50' 
                : 'bg-cyan-900/50 hover:bg-cyan-800/50 border border-cyan-700'
            }`}
          >
            <Code className="w-5 h-5" />
            Atbash (Inversión)
          </Button>
          <Button
            onClick={() => setActiveTab('notarikon')}
            className={`px-6 py-3 flex items-center gap-2 transition-all font-semibold ${
              activeTab === 'notarikon' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/50' 
                : 'bg-green-900/50 hover:bg-green-800/50 border border-green-700'
            }`}
          >
            <BookText className="w-5 h-5" />
            Notarikon (Acrónimo)
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Entrada de Texto Hebreo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Escribe texto en hebreo
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-lg bg-black/30 border border-purple-500/50 focus:border-purple-400 focus:outline-none text-2xl text-center font-bold text-white"
                  placeholder="אהבה"
                  dir="rtl"
                />
                <p className="text-xs text-purple-400 mt-2">
                  Valor Gematría: {calculateGematria(inputText)}
                </p>
              </div>

              {/* Método Temurah */}
              {activeTab === 'temurah' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Selecciona método de Temurah
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-purple-500/50 focus:border-purple-400 focus:outline-none text-white"
                  >
                    <option value="albam">AlBaM (Mitades)</option>
                    <option value="atbah">AtBaH (Inversión)</option>
                    <option value="avgad">AvGaD (Avance +1)</option>
                    <option value="reverse_avgad">AvGaD Inverso (-1)</option>
                    <option value="ayak_bakar">AYaK BaKaR (Decenas)</option>
                  </select>
                </div>
              )}

              {/* Botón de acción */}
              <Button
                onClick={
                  activeTab === 'temurah' ? applyTemurah :
                  activeTab === 'atbash' ? applyAtbash :
                  applyNotarikon
                }
                disabled={!inputText}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar {activeTab === 'temurah' ? 'Temurah' : activeTab === 'atbash' ? 'Atbash' : 'Notarikon'}
              </Button>

              {/* Info panel */}
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      {activeTab === 'temurah' && (
                        <p><strong>Temurah</strong> permuta las letras según patrones sistemáticos. Cada método revela significados ocultos diferentes.</p>
                      )}
                      {activeTab === 'atbash' && (
                        <p><strong>Atbash</strong> es la técnica más antigua mencionada en la Biblia. Invierte completamente el alfabeto hebreo.</p>
                      )}
                      {activeTab === 'notarikon' && (
                        <p><strong>Notarikon</strong> crea acrónimos o expande letras en palabras completas, revelando mensajes ocultos en textos sagrados.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Results Panel */}
          {result ? (
            <Card className="bg-white/5 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Temurah/Atbash Results */}
                {isTemurahResult(result) && (
                  <>
                    <div className="bg-purple-900/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-300">Original:</p>
                        <Button onClick={() => copyToClipboard(result.original)} variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-3xl font-bold text-center mb-2" dir="rtl">{result.original}</p>
                      <p className="text-sm text-purple-400 text-center">Gematría: {result.originalValue}</p>
                    </div>

                    <div className="bg-cyan-900/30 p-4 rounded-lg border-2 border-cyan-500/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-cyan-300">Transformado:</p>
                        <Button onClick={() => copyToClipboard(result.transformed)} variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-3xl font-bold text-center mb-2 text-cyan-300" dir="rtl">{result.transformed}</p>
                      <p className="text-sm text-cyan-400 text-center">Gematría: {result.transformedValue}</p>
                    </div>

                    {result.knownWords && result.knownWords.length > 0 && (
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                        <p className="text-sm font-semibold text-green-300 mb-2">Palabras conocidas encontradas:</p>
                        {result.knownWords.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-green-700/30 last:border-0">
                            <span className="font-bold text-xl" dir="rtl">{item.word}</span>
                            <span className="text-green-300">{item.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-200">{result.explanation}</p>
                    </div>
                  </>
                )}

                {/* Notarikon Results */}
                {isNotarikonResult(result) && (
                  <>
                    <div className="bg-purple-900/30 p-4 rounded-lg">
                      <p className="text-sm text-purple-300 mb-2">Texto Original:</p>
                      <p className="text-2xl font-bold text-center" dir="rtl">{result.original}</p>
                    </div>

                    <div className="bg-green-900/30 p-4 rounded-lg border-2 border-green-500/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-green-300">Acrónimo (primeras letras):</p>
                        <Button onClick={() => copyToClipboard(result.acronym)} variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-3xl font-bold text-center text-green-300" dir="rtl">{result.acronym}</p>
                      <p className="text-sm text-green-400 text-center mt-2">Gematría: {result.acronymValue}</p>
                    </div>

                    <div className="bg-cyan-900/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-cyan-300 mb-3">Expansión (cada letra como palabra):</p>
                      <div className="space-y-2">
                        {result.expansion.map((word, idx) => (
                          <div key={idx} className="bg-black/30 p-2 rounded text-center">
                            <span className="text-lg font-bold" dir="rtl">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-pink-900/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-pink-300 mb-2">Últimas letras:</p>
                      <p className="text-2xl font-bold text-center text-pink-300" dir="rtl">{result.finalLetters}</p>
                    </div>

                    <div className="bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-200">{result.explanation}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 backdrop-blur-xl border-purple-500/30 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-purple-400">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Ingresa texto hebreo y aplica el algoritmo</p>
                <p className="text-sm mt-2">Los resultados aparecerán aquí</p>
              </div>
            </Card>
          )}
        </div>

        {/* Reference Section */}
        <Card className="mt-8 bg-white/5 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle>Referencia Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-purple-300">Temurah</h3>
                <p className="text-sm text-purple-200">Sistema de permutación de letras según patrones matemáticos. 5 métodos principales.</p>
                <p className="text-xs text-purple-400 mt-2">Usado en: Zohar, Sefer Yetzirah</p>
              </div>
              <div className="bg-cyan-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-cyan-300">Atbash</h3>
                <p className="text-sm text-cyan-200">Inversión alfabética completa. Mencionado en la Biblia (Jeremías).</p>
                <p className="text-xs text-cyan-400 mt-2">Ejemplo: בבל → ששך (Babel → Sheshach)</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-green-300">Notarikon</h3>
                <p className="text-sm text-green-200">Acrónimos y expansión de letras. Revela mensajes ocultos en textos sagrados.</p>
                <p className="text-xs text-green-400 mt-2">Ejemplo: תורה = תמים רזי הוד (Torá perfecta, secretos de gloria)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alfabeto Hebreo Reference */}
        <Card className="mt-8 bg-white/5 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle>Alfabeto Hebreo y Valores Gematría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-11 gap-3">
              {hebrewAlphabet.map(letter => (
                <div key={letter} className="bg-purple-900/30 p-3 rounded-lg text-center hover:bg-purple-800/50 transition-all">
                  <p className="text-2xl font-bold mb-1">{letter}</p>
                  <p className="text-xs text-purple-400">{gematriaValues[letter]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KabbalahAlgorithms;
