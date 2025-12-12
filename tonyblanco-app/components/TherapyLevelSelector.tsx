'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Heart, Star, CheckCircle, Sparkles, Scroll, ClipboardList, BookOpen } from 'lucide-react';

export type TherapyLevel = 'assiyah' | 'yetzirah' | 'beriah' | null;

interface TherapyLevelSelectorProps {
  selectedLevel: TherapyLevel;
  onLevelChange: (level: TherapyLevel) => void;
  patientId?: number;
}

export default function TherapyLevelSelector({ 
  selectedLevel, 
  onLevelChange,
  patientId 
}: TherapyLevelSelectorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSelect = async (level: TherapyLevel) => {
    onLevelChange(level);
    
    // Guardar en el backend (si hay patientId)
    if (patientId) {
      setSaving(true);
      try {
        const token = localStorage.getItem('auth_token');
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
        
        const response = await fetch(`${apiURL}/therapist/patients/${patientId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({ therapy_level: level })
        });

        if (!response.ok) {
          console.error('Error al guardar el nivel terapéutico');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const getSuggestions = (level: TherapyLevel) => {
    switch (level) {
      case 'assiyah':
        return {
          title: 'Recomendaciones para Nivel 1: Sanación',
          items: [
            { icon: ClipboardList, text: 'Realizar Test PHQ-9 (Depresión)', action: '/tests/phq-9' },
            { icon: ClipboardList, text: 'Realizar Test GAD-7 (Ansiedad)', action: '/tests/gad-7' },
            { icon: ClipboardList, text: 'Realizar Test BAI (Ansiedad Beck)', action: '/tests/bai' },
            { icon: Leaf, text: 'Enfocarse en estabilización clínica', action: null }
          ]
        };
      case 'yetzirah':
        return {
          title: 'Recomendaciones para Nivel 2: Equilibrio',
          items: [
            { icon: Sparkles, text: 'Realizar Mapa del Alma', action: '/dashboard/tools/soul-map' },
            { icon: BookOpen, text: 'Diagnóstico Cruzado Tarot', action: null }, // Se genera desde la ficha del paciente
            { icon: ClipboardList, text: 'Test PAI (Personalidad)', action: '/tests/pai' },
            { icon: Heart, text: 'Análisis de bloqueos emocionales', action: null },
            { icon: Sparkles, text: 'Carta Astral Cabalística', action: '/dashboard/tools/astrology' }
          ]
        };
      case 'beriah':
        return {
          title: 'Recomendaciones para Nivel 3: Propósito',
          items: [
            { icon: Scroll, text: 'Calcular Gematria del Nombre', action: '/dashboard/tools/gematria' },
            { icon: BookOpen, text: 'Diagnóstico Cruzado Tarot', action: null }, // Se genera desde la ficha del paciente
            { icon: Star, text: 'Análisis de Tikún del Alma', action: '/dashboard/tools/tikun' },
            { icon: Sparkles, text: 'Explorar Misión de Vida', action: null },
            { icon: Star, text: 'Conexión espiritual profunda', action: null }
          ]
        };
      default:
        return null;
    }
  };

  const suggestions = getSuggestions(selectedLevel);

  return (
    <div className="mb-6">
      {/* Selector de Niveles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Nivel de Terapia Cabalística</h2>
          <p className="text-sm text-gray-500">Selecciona el nivel en el que estás trabajando con este paciente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nivel 1: Sanación (Assiyah) */}
          <button
            onClick={() => handleSelect(selectedLevel === 'assiyah' ? null : 'assiyah')}
            className={`relative p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
              selectedLevel === 'assiyah'
                ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200'
                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            {selectedLevel === 'assiyah' && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                selectedLevel === 'assiyah'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-600'
              }`}>
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Nivel 1: Sanación</h3>
              <p className="text-xs text-gray-500 mb-2">Mundo de Acción</p>
              <p className="text-sm text-gray-600">Assiyah</p>
              <p className="text-xs text-gray-500 mt-3">Estabilización clínica y síntomas físicos</p>
            </div>
          </button>

          {/* Nivel 2: Equilibrio (Yetzirah) */}
          <button
            onClick={() => handleSelect(selectedLevel === 'yetzirah' ? null : 'yetzirah')}
            className={`relative p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
              selectedLevel === 'yetzirah'
                ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            {selectedLevel === 'yetzirah' && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            )}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                selectedLevel === 'yetzirah'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Nivel 2: Equilibrio</h3>
              <p className="text-xs text-gray-500 mb-2">Mundo de Formación</p>
              <p className="text-sm text-gray-600">Yetzirah</p>
              <p className="text-xs text-gray-500 mt-3">Mapa del Alma y gestión emocional</p>
            </div>
          </button>

          {/* Nivel 3: Propósito (Beriah) */}
          <button
            onClick={() => handleSelect(selectedLevel === 'beriah' ? null : 'beriah')}
            className={`relative p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
              selectedLevel === 'beriah'
                ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-200'
                : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            {selectedLevel === 'beriah' && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
            )}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                selectedLevel === 'beriah'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Nivel 3: Propósito</h3>
              <p className="text-xs text-gray-500 mb-2">Mundo de Creación</p>
              <p className="text-sm text-gray-600">Beriah</p>
              <p className="text-xs text-gray-500 mt-3">Tikún, Gematria y Misión de Vida</p>
            </div>
          </button>
        </div>

        {saving && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Guardando...</p>
          </div>
        )}
      </div>

      {/* Sugerencias según el nivel */}
      {suggestions && (
        <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
          selectedLevel === 'assiyah' ? 'border-green-200 bg-green-50/30' :
          selectedLevel === 'yetzirah' ? 'border-purple-200 bg-purple-50/30' :
          'border-amber-200 bg-amber-50/30'
        }`}>
          <h3 className={`font-semibold mb-4 ${
            selectedLevel === 'assiyah' ? 'text-green-900' :
            selectedLevel === 'yetzirah' ? 'text-purple-900' :
            'text-amber-900'
          }`}>
            {suggestions.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.items.map((item, index) => {
              const Icon = item.icon;
              const isClickable = item.action !== null;
              const Component = isClickable ? 'button' : 'div';
              return (
                <Component
                  key={index}
                  onClick={isClickable ? () => router.push(item.action!) : undefined}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedLevel === 'assiyah' ? 'bg-green-100/50 border border-green-200' :
                    selectedLevel === 'yetzirah' ? 'bg-purple-100/50 border border-purple-200' :
                    'bg-amber-100/50 border border-amber-200'
                  } ${
                    isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    selectedLevel === 'assiyah' ? 'text-green-600' :
                    selectedLevel === 'yetzirah' ? 'text-purple-600' :
                    'text-amber-600'
                  }`} />
                  <span className={`text-sm ${
                    selectedLevel === 'assiyah' ? 'text-green-800' :
                    selectedLevel === 'yetzirah' ? 'text-purple-800' :
                    'text-amber-800'
                  }`}>
                    {item.text}
                  </span>
                </Component>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

