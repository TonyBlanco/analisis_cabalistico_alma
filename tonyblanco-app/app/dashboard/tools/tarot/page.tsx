'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Sparkles, BookOpen, Eye, Lightbulb } from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import AnalysisGuide from '@/components/shared/AnalysisGuide';
import { calculateLifeArcanaFromString } from '@/lib/tarot-calculator';
import { TAROT_ARCANA, getArcanaByNumber, type TarotArcana } from '@/data/tarot-arcana';
import TreeOfLifeTarot from '@/components/TreeOfLifeTarot';
import { TAROT_GUIDE_SECTIONS } from '@/data/tarot-guide-sections';

// Función para obtener el nombre del archivo de imagen del Tarot
const getTarotImageName = (number: number): string => {
  const tarotFileNames: Record<number, string> = {
    0: 'el-loco',
    1: 'el-mago',
    2: 'la-suma-sacerdotisa',
    3: 'la-emperatriz-luminosa',
    4: 'el-emperador',
    5: 'el-sumo-sacerdote',
    6: 'los-enamorados',
    7: 'el-carro',
    8: 'la-justicia',
    9: 'el-ermitano',
    10: 'la-rueda-de-la-fortuna',
    11: 'la-fuerza',
    12: 'el-colgado',
    13: 'la-muerte',
    14: 'la-templanza',
    15: 'el-diablo',
    16: 'la-torre',
    17: 'la-estrella',
    18: 'la-luna',
    19: 'el-sol',
    20: 'el-juicio-final',
    21: 'el-mundo'
  };
  return tarotFileNames[number] || '';
};

export default function TarotPage() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState('');
  const [lifeArcana, setLifeArcana] = useState<TarotArcana | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showTree, setShowTree] = useState(true);
  const [highlightPath, setHighlightPath] = useState<{ from: string; to: string } | null>(null);

  const handleCalculate = () => {
    if (!birthDate) {
      alert('Por favor, ingresa tu fecha de nacimiento');
      return;
    }

    const arcanaNumber = calculateLifeArcanaFromString(birthDate);
    
    if (arcanaNumber === null) {
      alert('Fecha inválida. Por favor, usa el formato DD/MM/YYYY o YYYY-MM-DD');
      return;
    }

    const arcana = getArcanaByNumber(arcanaNumber);
    
    if (arcana) {
      setLifeArcana(arcana);
      // Destacar el sendero en el árbol
      setHighlightPath({
        from: arcana.sefirot.from,
        to: arcana.sefirot.to
      });
      // Mostrar el árbol automáticamente
      setShowTree(true);
    } else {
      alert('Error al calcular el Arcano de Vida');
    }
  };

  const handleArcanaSelect = (arcana: TarotArcana) => {
    setLifeArcana(arcana);
    setHighlightPath({
      from: arcana.sefirot.from,
      to: arcana.sefirot.to
    });
  };

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
                  <h1 className="text-3xl font-bold text-gray-900">El Tarot del Alma</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Los 22 Senderos del Árbol de la Vida
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-300 rounded-lg hover:bg-purple-50 text-purple-700 transition-colors font-medium shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                Protocolo Clínico
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Calculadora */}
            <div className="space-y-6">
              {/* Calculadora de Sendero Personal */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  Calculadora de Sendero Personal
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Basado en tu fecha de nacimiento, calculamos tu Arcano de Vida (1-22)
                    </p>
                  </div>
                  
                  <button
                    onClick={handleCalculate}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Calcular Mi Sendero
                  </button>
                </div>
              </div>

              {/* Resultado del Arcano */}
              {lifeArcana && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-8 shadow-lg">
                  <div className="text-center mb-6">
                    {/* Imagen de la Carta del Tarot */}
                    <div className="mb-4 flex justify-center">
                      <img
                        src={`/tarot/${lifeArcana.number}-${getTarotImageName(lifeArcana.number)}.png`}
                        alt={lifeArcana.nameEs}
                        className="w-48 h-auto rounded-lg border-4 border-purple-300 shadow-xl"
                        onError={(e) => {
                          // Si la imagen no existe, ocultar pero mantener el espacio
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="inline-block p-4 bg-white rounded-full shadow-md mb-4">
                      <span className="text-4xl font-bold text-purple-600">
                        {lifeArcana.number}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {lifeArcana.nameEs}
                    </h3>
                    <p className="text-lg text-gray-600 mb-1">
                      {lifeArcana.name}
                    </p>
                    <div className="inline-block px-4 py-2 bg-purple-100 rounded-lg">
                      <span className="text-2xl font-serif" dir="rtl">
                        {lifeArcana.hebrewLetter}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Sendero en el Árbol:</h4>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{lifeArcana.sefirot.fromName}</span> →{' '}
                        <span className="font-medium">{lifeArcana.sefirot.toName}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lifeArcana.sefirot.from} → {lifeArcana.sefirot.to}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Significado:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {lifeArcana.meaning}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Mensaje Terapéutico:
                      </h4>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        {lifeArcana.therapeuticMessage}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Meditación:
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed italic">
                        {lifeArcana.meditation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Visualizador del Árbol */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    Árbol de la Vida Interactivo
                  </h2>
                  <button
                    onClick={() => setShowTree(!showTree)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {showTree ? 'Ocultar' : 'Mostrar'} Árbol
                  </button>
                </div>
                
                {showTree && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Instrucciones:</strong> Pasa el mouse sobre los senderos (líneas doradas/turquesas) para ver la carta del Tarot correspondiente. Haz clic para ver detalles completos.
                    </p>
                    {lifeArcana && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-900">
                          <strong>Tu Sendero Personal:</strong> {lifeArcana.nameEs} ({lifeArcana.number}) - 
                          Sendero destacado en el árbol
                        </p>
                      </div>
                    )}
                    <TreeOfLifeTarot 
                      onArcanaSelect={handleArcanaSelect}
                      highlightPath={highlightPath}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guía Educativa - Protocolo de Diagnóstico Cruzado */}
        <AnalysisGuide
          title="Protocolo de Diagnóstico: Tarot & Clínica"
          subtitle="Cómo interpretar la relación entre Arquetipo y Síntoma"
          content={TAROT_GUIDE_SECTIONS}
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
          accentColor="purple"
          maxWidth="2xl"
        />
      </div>
    </TherapistRoute>
  );
}

