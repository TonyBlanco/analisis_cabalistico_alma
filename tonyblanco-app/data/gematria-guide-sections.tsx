/**
 * Secciones estructuradas para la Guía de Gematria
 * Usa el formato GuideSection para mejor organización
 */
import React from 'react';
import { GuideSection } from '@/components/shared/AnalysisGuide';
import { Info, Sparkles, Lightbulb, Eye } from 'lucide-react';

export const GEMATRIA_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'ragil',
    title: 'Ragil (La Realidad)',
    subtitle: 'El Yo Consciente y la Manifestación Física',
    icon: <Info className="h-6 w-6 text-blue-600" />,
    color: 'blue',
    content: (
      <>
        <p className="leading-relaxed mb-3">
          <strong className="text-blue-900">Gematria Ragil</strong> representa el valor del <strong>"Yo Consciente"</strong> y la <strong>manifestación física</strong> de la palabra o nombre.
        </p>
        <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
          <p className="text-sm leading-relaxed mb-2">
            Este es el cálculo estándar donde cada letra hebrea tiene su valor tradicional:
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-700">
            <li>Aleph (א) = 1, Bet (ב) = 2, Yud (י) = 10</li>
            <li>Kaf (כ) = 20, Lamed (ל) = 30, Mem (מ) = 40</li>
            <li>Y así sucesivamente hasta Tav (ת) = 400</li>
          </ul>
        </div>
        <p className="text-sm leading-relaxed mt-3">
          <strong>Interpretación Terapéutica:</strong> El valor Ragil muestra cómo la persona se presenta al mundo, su identidad consciente y cómo materializa sus intenciones en el plano físico (Malchut).
        </p>
      </>
    ),
    examples: [
      {
        label: 'Palabra',
        value: 'אהבה (Ahavah - Amor)'
      },
      {
        label: 'Valor Ragil',
        value: '13'
      },
      {
        label: 'Significado',
        value: 'La manifestación consciente del amor en el mundo físico'
      }
    ]
  },
  {
    id: 'katan',
    title: 'Katan (La Esencia)',
    subtitle: 'La Vibración Raíz o Semilla del Alma',
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    color: 'purple',
    content: (
      <>
        <p className="leading-relaxed mb-3">
          <strong className="text-purple-900">Gematria Katan</strong> revela la <strong>vibración raíz</strong> o <strong>semilla del alma</strong>, reduciendo el valor total a un solo dígito (1-9), excepto los números maestros 11 y 22.
        </p>
        <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
          <p className="text-sm leading-relaxed mb-2">
            <strong>Proceso de Reducción:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-700">
            <li>Suma todos los valores de las letras (Ragil)</li>
            <li>Reduce a un solo dígito sumando los dígitos</li>
            <li>Si el resultado es 11 o 22, se mantiene (números maestros)</li>
            <li>Ejemplo: 358 → 3+5+8 = 16 → 1+6 = 7</li>
          </ul>
        </div>
        <p className="text-sm leading-relaxed mt-3">
          <strong>Interpretación Terapéutica:</strong> El Katan muestra la esencia espiritual, el propósito fundamental del alma y la lección kármica principal que debe aprender en esta encarnación. Es la "semilla" que contiene toda la información del árbol completo.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Valor Ragil',
        value: '358'
      },
      {
        label: 'Proceso',
        value: '3+5+8 = 16 → 1+6 = 7'
      },
      {
        label: 'Valor Katan',
        value: '7 (Esencia espiritual)'
      }
    ]
  },
  {
    id: 'gadol',
    title: 'Gadol (El Potencial)',
    subtitle: 'El Potencial Máximo del Tikún',
    icon: <Lightbulb className="h-6 w-6 text-amber-600" />,
    color: 'amber',
    content: (
      <>
        <p className="leading-relaxed mb-3">
          <strong className="text-amber-900">Gematria Gadol</strong> incluye las <strong>letras finales (Sofit)</strong> y muestra el <strong>potencial máximo del Tikún</strong> (corrección) que el alma puede alcanzar.
        </p>
        <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
          <p className="text-sm leading-relaxed mb-2">
            <strong>Letras Finales (Sofit):</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-700">
            <li>Kaf final (ך) = 500 (en lugar de 20)</li>
            <li>Mem final (ם) = 600 (en lugar de 40)</li>
            <li>Nun final (ן) = 600 (en lugar de 50)</li>
            <li>Pe final (ף) = 700 (en lugar de 80)</li>
            <li>Tzadi final (ץ) = 900 (en lugar de 90)</li>
          </ul>
        </div>
        <p className="text-sm leading-relaxed mt-3">
          <strong>Interpretación Terapéutica:</strong> El Gadol representa el potencial máximo de transformación y corrección espiritual. Muestra hacia dónde puede evolucionar el alma cuando completa su Tikún. Es la "versión completa" del nombre, incluyendo todas las posibilidades de manifestación.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Ejemplo',
        value: 'Palabra con Mem final'
      },
      {
        label: 'Ragil',
        value: '40 (Mem estándar)'
      },
      {
        label: 'Gadol',
        value: '600 (Mem final - Potencial máximo)'
      }
    ]
  },
  {
    id: 'atbash',
    title: 'Atbash (La Sombra)',
    subtitle: 'Lo Oculto y el Subconsciente',
    icon: <Eye className="h-6 w-6 text-indigo-600" />,
    color: 'indigo',
    content: (
      <>
        <p className="leading-relaxed mb-3">
          <strong className="text-indigo-900">Atbash</strong> es la transformación por <strong>inversión del alfabeto</strong> y revela lo <strong>oculto o subconsciente</strong>. Es especialmente útil para <strong>detectar bloqueos</strong> y patrones inconscientes.
        </p>
        <div className="bg-white/60 rounded-lg p-4 border border-indigo-200">
          <p className="text-sm leading-relaxed mb-2">
            <strong>Sistema de Inversión:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-700">
            <li>Aleph (א) ↔ Tav (ת)</li>
            <li>Bet (ב) ↔ Shin (ש)</li>
            <li>Gimel (ג) ↔ Reish (ר)</li>
            <li>Y así sucesivamente...</li>
          </ul>
          <p className="mt-3 text-sm italic text-gray-600">
            "Lo que está oculto se revela cuando invertimos el orden"
          </p>
        </div>
        <p className="text-sm leading-relaxed mt-3">
          <strong>Interpretación Terapéutica:</strong> El Atbash muestra la "sombra" del nombre, los aspectos ocultos, bloqueos subconscientes y patrones que la persona no reconoce conscientemente. Es una herramienta poderosa para identificar:
        </p>
        <ul className="mt-2 space-y-1 text-sm list-disc list-inside ml-4 text-gray-700">
          <li>Miedos y traumas no resueltos</li>
          <li>Patrones de autosabotaje</li>
          <li>Bloqueos energéticos en el subconsciente</li>
          <li>Aspectos de la personalidad que se ocultan</li>
        </ul>
      </>
    ),
    examples: [
      {
        label: 'Original',
        value: 'אהבה (Amor)'
      },
      {
        label: 'Atbash',
        value: 'תשהא (Inversión)'
      },
      {
        label: 'Revela',
        value: 'Aspectos ocultos del amor'
      }
    ]
  },
  {
    id: 'protocolo',
    title: 'Guía de Uso en Terapia',
    subtitle: 'Protocolo de Análisis Práctico',
    icon: <Lightbulb className="h-6 w-6 text-emerald-600" />,
    color: 'emerald',
    content: (
      <>
        <div className="bg-white/60 rounded-lg p-4 border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-3">Protocolo de Análisis:</h4>
          <ol className="space-y-2 text-sm list-decimal list-inside text-gray-700">
            <li>
              <strong>Ragil:</strong> Observa cómo se presenta la persona al mundo. ¿El valor es alto o bajo? ¿Qué dice sobre su capacidad de manifestación?
            </li>
            <li>
              <strong>Katan:</strong> Identifica la lección del alma. ¿Qué número maestro aparece? ¿Qué arquetipo representa?
            </li>
            <li>
              <strong>Gadol:</strong> Visualiza el potencial máximo. ¿Hacia dónde puede evolucionar? ¿Qué correcciones necesita hacer?
            </li>
            <li>
              <strong>Atbash:</strong> Explora la sombra. ¿Qué bloqueos revela? ¿Qué patrones inconscientes están operando?
            </li>
          </ol>
        </div>
        <p className="text-sm leading-relaxed italic text-emerald-800 mt-4">
          "La Gematria no predice el futuro, sino que revela las posibilidades y los bloqueos que impiden la realización del potencial del alma."
        </p>
      </>
    )
  }
];

