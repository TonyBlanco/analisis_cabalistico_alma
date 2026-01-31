'use client';

/**
 * CyclesTimeline.tsx - P2.2 Tikun Cycles Timeline
 * 
 * Visualiza los ciclos de tikún (corrección) cabalísticos.
 * Este componente es OBSERVACIONAL - muestra datos, no predice.
 * 
 * Muestra ciclos:
 * - Anual (9 años)
 * - Lunar (28 días)
 * - Semanal (7 días)
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, RefreshCw, AlertTriangle, Download, Save, BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-base';

// Diccionario completo de interpretaciones simbólicas por Sefirá
const SEFIRA_INTERPRETATIONS: Record<string, {
  hebrew: string;
  translation: string;
  pillar: string;
  element: string;
  planet: string;
  color: string;
  body_part: string;
  archetype: string;
  virtue: string;
  challenge: string;
  cycle_meaning: string;
  reflection_questions: string[];
}> = {
  'keter': {
    hebrew: 'כתר',
    translation: 'Corona',
    pillar: 'Central (Equilibrio)',
    element: 'Éter / Fuego Primordial',
    planet: 'Neptuno / Primer Motor',
    color: 'Blanco brillante',
    body_part: 'Corona de la cabeza',
    archetype: 'La Voluntad Divina',
    virtue: 'Unión con lo trascendente',
    challenge: 'Evitar la desconexión de lo mundano',
    cycle_meaning: 'Período de conexión espiritual profunda. Momento de recibir inspiración superior y alinear la voluntad personal con propósitos más elevados.',
    reflection_questions: [
      '¿Cuál es mi propósito más elevado en este momento?',
      '¿Qué me conecta con lo trascendente?',
      '¿Cómo puedo alinear mi voluntad con un bien mayor?'
    ]
  },
  'chokmah': {
    hebrew: 'חכמה',
    translation: 'Sabiduría',
    pillar: 'Derecho (Masculino/Expansión)',
    element: 'Fuego',
    planet: 'Urano / Zodíaco',
    color: 'Gris iridiscente',
    body_part: 'Hemisferio cerebral derecho',
    archetype: 'El Padre Celestial',
    virtue: 'Visión, intuición, chispa creativa',
    challenge: 'Evitar la dispersión de energía',
    cycle_meaning: 'Período de inspiración y nuevas ideas. La energía creativa fluye con facilidad. Momento propicio para iniciar proyectos.',
    reflection_questions: [
      '¿Qué nueva visión está emergiendo en mi vida?',
      '¿Dónde necesito aplicar sabiduría intuitiva?',
      '¿Qué semillas quiero plantar ahora?'
    ]
  },
  'binah': {
    hebrew: 'בינה',
    translation: 'Entendimiento',
    pillar: 'Izquierdo (Femenino/Forma)',
    element: 'Agua Primordial',
    planet: 'Saturno',
    color: 'Negro / Azul oscuro',
    body_part: 'Hemisferio cerebral izquierdo',
    archetype: 'La Madre Celestial',
    virtue: 'Comprensión profunda, forma, estructura',
    challenge: 'Evitar la rigidez excesiva',
    cycle_meaning: 'Período de profundización y comprensión. Momento para dar forma a las ideas, estructurar planes y desarrollar entendimiento.',
    reflection_questions: [
      '¿Qué necesito comprender más profundamente?',
      '¿Cómo puedo dar forma concreta a mis aspiraciones?',
      '¿Qué estructuras necesitan revisión en mi vida?'
    ]
  },
  'chesed': {
    hebrew: 'חסד',
    translation: 'Misericordia',
    pillar: 'Derecho (Masculino/Expansión)',
    element: 'Agua',
    planet: 'Júpiter',
    color: 'Azul',
    body_part: 'Brazo derecho',
    archetype: 'El Rey Bondadoso',
    virtue: 'Generosidad, amor incondicional, abundancia',
    challenge: 'Evitar el exceso de generosidad sin límites',
    cycle_meaning: 'Período de expansión y abundancia. Momento propicio para dar y recibir amor, practicar la generosidad y experimentar crecimiento.',
    reflection_questions: [
      '¿Cómo puedo ser más generoso conmigo mismo y con otros?',
      '¿Qué bendiciones estoy recibiendo que debo reconocer?',
      '¿Dónde necesito expandir mis horizontes?'
    ]
  },
  'gevurah': {
    hebrew: 'גבורה',
    translation: 'Rigor',
    pillar: 'Izquierdo (Femenino/Forma)',
    element: 'Fuego',
    planet: 'Marte',
    color: 'Rojo',
    body_part: 'Brazo izquierdo',
    archetype: 'El Guerrero Justo',
    virtue: 'Fuerza, disciplina, discernimiento',
    challenge: 'Evitar la severidad excesiva',
    cycle_meaning: 'Período de fortaleza y discernimiento. Momento para establecer límites saludables, practicar disciplina y hacer elecciones firmes.',
    reflection_questions: [
      '¿Qué límites necesito establecer o mantener?',
      '¿Dónde debo aplicar más disciplina?',
      '¿Qué necesita ser eliminado o recortado de mi vida?'
    ]
  },
  'tiferet': {
    hebrew: 'תפארת',
    translation: 'Belleza',
    pillar: 'Central (Equilibrio)',
    element: 'Aire / Sol',
    planet: 'Sol',
    color: 'Amarillo dorado',
    body_part: 'Corazón',
    archetype: 'El Hijo / El Mediador',
    virtue: 'Armonía, belleza, compasión equilibrada',
    challenge: 'Evitar sacrificarse en exceso por otros',
    cycle_meaning: 'Período de equilibrio y armonía. Momento para integrar opuestos, encontrar el centro y expresar la belleza interior.',
    reflection_questions: [
      '¿Cómo puedo encontrar mayor equilibrio en mi vida?',
      '¿Qué aspectos de mi mismo necesito armonizar?',
      '¿Dónde puedo expresar más belleza y compasión?'
    ]
  },
  'netzach': {
    hebrew: 'נצח',
    translation: 'Victoria',
    pillar: 'Derecho (Masculino/Expansión)',
    element: 'Fuego/Agua',
    planet: 'Venus',
    color: 'Verde esmeralda',
    body_part: 'Pierna derecha',
    archetype: 'El Artista / El Amante',
    virtue: 'Perseverancia, pasión, creatividad emocional',
    challenge: 'Evitar la impulsividad emocional',
    cycle_meaning: 'Período de pasión y persistencia. Momento para perseguir deseos del corazón con determinación y expresar creatividad emocional.',
    reflection_questions: [
      '¿Qué pasiones necesito honrar y expresar?',
      '¿Dónde debo perseverar a pesar de los obstáculos?',
      '¿Cómo puedo ser más auténtico emocionalmente?'
    ]
  },
  'hod': {
    hebrew: 'הוד',
    translation: 'Gloria',
    pillar: 'Izquierdo (Femenino/Forma)',
    element: 'Agua/Aire',
    planet: 'Mercurio',
    color: 'Naranja',
    body_part: 'Pierna izquierda',
    archetype: 'El Mago / El Comunicador',
    virtue: 'Intelecto, comunicación, adaptabilidad',
    challenge: 'Evitar el exceso de análisis',
    cycle_meaning: 'Período de comunicación y aprendizaje. Momento propicio para estudiar, comunicar ideas y desarrollar habilidades mentales.',
    reflection_questions: [
      '¿Qué necesito aprender o estudiar?',
      '¿Cómo puedo comunicar mejor mis ideas?',
      '¿Dónde estoy sobre-analizando en lugar de actuar?'
    ]
  },
  'yesod': {
    hebrew: 'יסוד',
    translation: 'Fundamento',
    pillar: 'Central (Equilibrio)',
    element: 'Aire/Éter',
    planet: 'Luna',
    color: 'Violeta',
    body_part: 'Órganos reproductivos',
    archetype: 'El Conectador / El Puente',
    virtue: 'Conexión, imaginación, fundamento',
    challenge: 'Evitar la ilusión y el autoengaño',
    cycle_meaning: 'Período de conexión y cimentación. Momento para construir bases sólidas, trabajar con la imaginación y conectar lo espiritual con lo material.',
    reflection_questions: [
      '¿Qué bases necesito fortalecer en mi vida?',
      '¿Cómo puedo conectar mejor mis ideales con la realidad?',
      '¿Qué ilusiones necesito disolver?'
    ]
  },
  'malkuth': {
    hebrew: 'מלכות',
    translation: 'Reino',
    pillar: 'Central (Equilibrio)',
    element: 'Tierra',
    planet: 'Tierra',
    color: 'Cítrico / Marrón / Negro',
    body_part: 'Pies',
    archetype: 'La Novia / El Templo',
    virtue: 'Manifestación, presencia, arraigo',
    challenge: 'Evitar el materialismo excesivo',
    cycle_meaning: 'Período de manifestación y arraigo. Momento para concretar proyectos, estar presente en el cuerpo y celebrar los logros materiales.',
    reflection_questions: [
      '¿Qué necesito manifestar concretamente?',
      '¿Cómo puedo estar más presente y arraigado?',
      '¿Qué logros debo celebrar y agradecer?'
    ]
  }
};

interface CycleInfo {
  cycle_type: string;
  current_sefira: string;
  current_sefira_info: {
    name: string;
    meaning: string;
    quality: string;
  };
  next_sefira: string;
  next_sefira_info: {
    name: string;
    meaning: string;
    quality: string;
  };
  days_until_transition: number;
  progress_percent?: number;
  // Yearly specific
  current_age?: number;
  cycle_year?: number;
  transition_date?: string;
  // Monthly specific
  lunar_day?: number;
  sefira_day?: number;
  // Weekly specific
  weekday?: number;
  weekday_name?: string;
  tomorrow_name?: string;
}

interface CycleReport {
  meta: {
    birth_date: string;
    analysis_date: string;
    generated_at: string;
  };
  cycles: {
    yearly: CycleInfo;
    monthly: CycleInfo;
    weekly: CycleInfo;
  };
  synchronicities: Array<{
    type: string;
    sefira: string;
    description: string;
    significance: string;
  }>;
  summary: {
    dominant_sefira: string | null;
    total_synchronicities: number;
    yearly_progress: number;
    monthly_progress: number;
  };
  disclaimer: string;
}

interface CyclesTimelineProps {
  consultanteId: number | null;
  birthDate: string | null;
  consultanteName?: string;
  consultanteUuid?: string; // Legacy support
  onSave?: (report: CycleReport) => void;
  onExportPDF?: (report: CycleReport) => void;
}

/**
 * Panel de Interpretación Simbólica de la Sefirá
 */
function SefirahInterpretationPanel({ 
  sefirahName, 
  cycleType 
}: { 
  sefirahName: string; 
  cycleType: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Normalizar nombre de sefirá para búsqueda
  const normalizedName = sefirahName.toLowerCase().replace(/[áéíóú]/g, (match) => {
    const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
    return map[match] || match;
  });
  
  const interpretation = SEFIRA_INTERPRETATIONS[normalizedName];
  
  if (!interpretation) {
    return null;
  }

  const cycleContext: Record<string, string> = {
    'yearly': 'Este ciclo de 9 años representa el trabajo del alma a largo plazo.',
    'monthly': 'Este ciclo lunar de 28 días refleja ritmos emocionales y mentales.',
    'weekly': 'Este ciclo semanal de 7 días marca el ritmo de la acción cotidiana.'
  };

  return (
    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Interpretación Simbólica
        </span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-3 text-xs animate-in fade-in duration-200">
          {/* Encabezado con hebreo */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-serif">{interpretation.hebrew}</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {sefirahName} – {interpretation.translation}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Pilar {interpretation.pillar}
                </div>
              </div>
            </div>
          </div>

          {/* Correspondencias */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 dark:text-gray-400">Planeta</div>
              <div className="font-medium text-gray-900 dark:text-white">{interpretation.planet}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 dark:text-gray-400">Color</div>
              <div className="font-medium text-gray-900 dark:text-white">{interpretation.color}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 dark:text-gray-400">Elemento</div>
              <div className="font-medium text-gray-900 dark:text-white">{interpretation.element}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 dark:text-gray-400">Cuerpo</div>
              <div className="font-medium text-gray-900 dark:text-white">{interpretation.body_part}</div>
            </div>
          </div>

          {/* Arquetipo y virtud */}
          <div className="space-y-2">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Arquetipo:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">{interpretation.archetype}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Virtud:</span>
              <span className="ml-1 font-medium text-green-700 dark:text-green-400">{interpretation.virtue}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Desafío:</span>
              <span className="ml-1 font-medium text-amber-700 dark:text-amber-400">{interpretation.challenge}</span>
            </div>
          </div>

          {/* Significado del ciclo */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
            <div className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
              Significado en este Ciclo
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {interpretation.cycle_meaning}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2 italic text-[10px]">
              {cycleContext[cycleType] || ''}
            </p>
          </div>

          {/* Preguntas de reflexión */}
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Preguntas para la Reflexión:
            </div>
            <ul className="space-y-1">
              {interpretation.reflection_questions.map((question, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-indigo-500">•</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer formativo */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 text-[10px] text-amber-800 dark:text-amber-300">
            <strong>⚠️ Nota:</strong> Esta interpretación tiene propósito formativo y de autoexploración simbólica. 
            No constituye diagnóstico ni recomendación terapéutica.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Cycle Card Component
 */
function CycleCard({
  title,
  icon: Icon,
  cycle,
  color,
}: {
  title: string;
  icon: React.ElementType<any>;
  cycle: CycleInfo;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'bg-blue-500',
      icon: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      accent: 'bg-purple-500',
      icon: 'text-purple-600',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      accent: 'bg-green-500',
      icon: 'text-green-600',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`p-4 rounded-lg border ${classes.bg} ${classes.border}`}>
        <div className="flex items-center gap-2 mb-3">
        {React.createElement(Icon as any, { className: `h-4 w-4 ${classes.icon}` })}
        <h4 className={`text-sm font-semibold ${classes.text}`}>{title}</h4>
      </div>

      <div className="space-y-3">
        {/* Sefirá actual */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sefirá Actual</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {cycle.current_sefira_info?.name || cycle.current_sefira}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {cycle.current_sefira_info?.meaning}
          </div>
        </div>

        {/* Información específica del ciclo */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {cycle.cycle_year && (
            <div>
              <span className="text-gray-500">Año del ciclo:</span>
              <span className="ml-1 font-medium">{cycle.cycle_year}/9</span>
            </div>
          )}
          {cycle.lunar_day && (
            <div>
              <span className="text-gray-500">Día lunar:</span>
              <span className="ml-1 font-medium">{cycle.lunar_day}/28</span>
            </div>
          )}
          {cycle.weekday_name && (
            <div>
              <span className="text-gray-500">Día:</span>
              <span className="ml-1 font-medium">{cycle.weekday_name}</span>
            </div>
          )}
          {cycle.current_age !== undefined && (
            <div>
              <span className="text-gray-500">Edad:</span>
              <span className="ml-1 font-medium">{cycle.current_age} años</span>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        {cycle.progress_percent !== undefined && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{cycle.progress_percent}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${classes.accent} transition-all`}
                style={{ width: `${cycle.progress_percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Próxima transición */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Próxima Transición</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {cycle.next_sefira_info?.name || cycle.next_sefira}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            En {cycle.days_until_transition} día{cycle.days_until_transition !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Panel de Interpretación Simbólica Expandible */}
        <SefirahInterpretationPanel 
          sefirahName={cycle.current_sefira_info?.name || cycle.current_sefira || ''} 
          cycleType={cycle.cycle_type}
        />
      </div>
    </div>
  );
}

// Generate default cycles from birth date
function generateDefaultCycles(birthDateStr: string): CycleReport {
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear();
  
  // Yearly cycle: 9-year cycle based on age
  const yearCyclePosition = (age % 9) + 1;
  
  // Monthly cycle: based on birth day within 28-day lunar cycle
  const dayOfMonth = now.getDate();
  const monthCyclePosition = ((dayOfMonth - 1) % 7) + 1;
  
  // Weekly cycle: current day of week (Sunday = 1, Saturday = 7)
  const dayOfWeek = now.getDay() || 7;
  
  const sefirotInfo: { [key: number]: { name: string; meaning: string; quality: string } } = {
    1: { name: 'Keter', meaning: 'Corona', quality: 'Voluntad' },
    2: { name: 'Chokmah', meaning: 'Sabiduría', quality: 'Inspiración' },
    3: { name: 'Binah', meaning: 'Entendimiento', quality: 'Comprensión' },
    4: { name: 'Chesed', meaning: 'Misericordia', quality: 'Bondad' },
    5: { name: 'Gevurah', meaning: 'Rigor', quality: 'Fuerza' },
    6: { name: 'Tiferet', meaning: 'Belleza', quality: 'Armonía' },
    7: { name: 'Netzach', meaning: 'Victoria', quality: 'Persistencia' },
    8: { name: 'Hod', meaning: 'Gloria', quality: 'Receptividad' },
    9: { name: 'Yesod', meaning: 'Fundamento', quality: 'Conexión' },
  };
  
  const weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const yearlyCurrent = sefirotInfo[yearCyclePosition] || sefirotInfo[1];
  const yearlyNext = sefirotInfo[(yearCyclePosition % 9) + 1] || sefirotInfo[1];
  const monthlyCurrent = sefirotInfo[monthCyclePosition] || sefirotInfo[1];
  const monthlyNext = sefirotInfo[(monthCyclePosition % 7) + 1] || sefirotInfo[1];
  const weeklyCurrent = sefirotInfo[dayOfWeek] || sefirotInfo[1];
  const weeklyNext = sefirotInfo[(dayOfWeek % 7) + 1] || sefirotInfo[1];
  
  return {
    meta: {
      birth_date: birthDateStr,
      analysis_date: now.toISOString().split('T')[0],
      generated_at: now.toISOString(),
    },
    cycles: {
      yearly: {
        cycle_type: 'yearly',
        current_sefira: yearlyCurrent.name.toLowerCase(),
        current_sefira_info: yearlyCurrent,
        next_sefira: yearlyNext.name.toLowerCase(),
        next_sefira_info: yearlyNext,
        days_until_transition: Math.floor((365 - (Math.floor((now.getTime() - new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()).getTime()) / (1000 * 60 * 60 * 24)) % 365))),
        current_age: age,
        cycle_year: yearCyclePosition,
        progress_percent: (yearCyclePosition / 9) * 100,
      },
      monthly: {
        cycle_type: 'monthly',
        current_sefira: monthlyCurrent.name.toLowerCase(),
        current_sefira_info: monthlyCurrent,
        next_sefira: monthlyNext.name.toLowerCase(),
        next_sefira_info: monthlyNext,
        days_until_transition: 7 - ((dayOfMonth - 1) % 7),
        lunar_day: dayOfMonth,
        sefira_day: ((dayOfMonth - 1) % 7) + 1,
        progress_percent: (monthCyclePosition / 7) * 100,
      },
      weekly: {
        cycle_type: 'weekly',
        current_sefira: weeklyCurrent.name.toLowerCase(),
        current_sefira_info: weeklyCurrent,
        next_sefira: weeklyNext.name.toLowerCase(),
        next_sefira_info: weeklyNext,
        days_until_transition: 1,
        weekday: dayOfWeek,
        weekday_name: weekdayNames[now.getDay()],
        tomorrow_name: weekdayNames[(now.getDay() + 1) % 7],
        progress_percent: (dayOfWeek / 7) * 100,
      },
    },
    synchronicities: [],
    summary: {
      dominant_sefira: yearlyCurrent.name.toLowerCase(),
      total_synchronicities: 0,
      yearly_progress: (yearCyclePosition / 9) * 100,
      monthly_progress: (monthCyclePosition / 7) * 100,
    },
    disclaimer: 'Los ciclos son observacionales y simbólicos. No constituyen predicción ni diagnóstico.',
  };
}

export default function CyclesTimeline({
  consultanteId,
  birthDate,
  consultanteName,
  consultanteUuid,
  onSave,
  onExportPDF,
}: CyclesTimelineProps) {
  const [report, setReport] = useState<CycleReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCycles = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const apiBase = getApiBaseUrl();
      // Try with consultante_id first, then UUID
      const endpoint = consultanteId 
        ? `${apiBase}/api/swm/cabala/cycles/?consultante_id=${consultanteId}`
        : `${apiBase}/api/consultantes/${consultanteUuid}/cabala-cycles/`;

      const response = await fetch(endpoint, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404 && birthDate) {
          // Fallback: generate from birth date
          setReport(generateDefaultCycles(birthDate));
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      // Fallback: generate from available data
      if (birthDate) {
        setReport(generateDefaultCycles(birthDate));
      } else {
        setError(err.message || 'Error cargando ciclos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultanteId || consultanteUuid) {
      fetchCycles();
    } else if (birthDate) {
      // Generate locally if we have birth date but no ID
      setReport(generateDefaultCycles(birthDate));
    }
  }, [consultanteId, consultanteUuid, birthDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
        <span className="ml-2 text-sm text-gray-600">Calculando ciclos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        <button
          onClick={fetchCycles}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
        {birthDate && (
          <button
            onClick={() => setReport(generateDefaultCycles(birthDate))}
            className="mt-2 ml-4 text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            Generar desde fecha de nacimiento
          </button>
        )}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona un consultante para ver sus ciclos
        </div>
      </div>
    );
  }

  return (
    <div className="cycles-timeline space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ciclos Tikún</h3>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
            <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Línea Temporal de Corrección</p>
              <p>• Ciclos de 9 años (anual), 28 días (lunar), 7 días (semanal)</p>
              <p>• Cada ciclo muestra Sefirá dominante actual</p>
              <p>• Preguntas reflexivas para autoindagación</p>
              <p>• NO predice eventos, solo muestra influencias</p>
              <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {report.disclaimer}
          </p>
        </div>
      </div>

      {/* Sincronicidades */}
      {report.synchronicities && report.synchronicities.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
          <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
            ✨ Sincronicidades Detectadas
          </h4>
          <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
            {report.synchronicities.map((sync, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <span className="font-medium">{sync.description}</span>
                  <span className="text-purple-500 dark:text-purple-500 block">
                    {sync.significance}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cards de ciclos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CycleCard
          title="Ciclo Anual (9 años)"
          icon={Sun}
          cycle={report.cycles.yearly}
          color="blue"
        />
        <CycleCard
          title="Ciclo Lunar (28 días)"
          icon={Moon}
          cycle={report.cycles.monthly}
          color="purple"
        />
        <CycleCard
          title="Ciclo Semanal (7 días)"
          icon={Calendar}
          cycle={report.cycles.weekly}
          color="green"
        />
      </div>

      {/* Resumen */}
      {report.summary && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Resumen
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {report.summary.dominant_sefira && (
              <div>
                <div className="text-xs text-gray-500">Sefirá Dominante</div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">
                  {report.summary.dominant_sefira}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500">Sincronicidades</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {report.summary.total_synchronicities}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Progreso Anual</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {report.summary.yearly_progress}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Progreso Lunar</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {report.summary.monthly_progress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <span>Fecha de análisis: {new Date(report.meta.analysis_date).toLocaleDateString('es-ES')}</span>
        {consultanteName && <span className="ml-4">Consultante: {consultanteName}</span>}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 pt-2">
        {onSave && (
          <button
            onClick={() => onSave(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700"
          >
            <Save className="h-3.5 w-3.5" />
            Guardar Análisis
          </button>
        )}
        {onExportPDF && (
          <button
            onClick={() => onExportPDF(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar PDF
          </button>
        )}
        <button
          onClick={fetchCycles}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>
    </div>
  );
}

export type { CycleReport, CycleInfo };
