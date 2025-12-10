'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Sparkles, 
  FileText, 
  Brain,
  Heart,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertCircle,
  Lock,
  Zap,
  Hash,
  DollarSign
} from 'lucide-react';
import { getPatientTests } from '@/lib/patient-storage';
import { getAvailableTests } from '@/lib/test-api';
import type { PatientInfo, PatientTestResult } from '@/types/patient';
import type { TestModule } from '@/lib/test-types';

interface PatientTestsSidebarProps {
  patient: PatientInfo;
  onTestSelect?: (testId: string) => void;
}

// Definición de tests con orden recomendado y relaciones
interface TestDefinition {
  id: string;
  code?: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  path: string;
  duration: string;
  category: 'foundational' | 'wellness' | 'psychological' | 'kabbalistic' | 'advanced';
  order: number; // Orden recomendado
  prerequisites?: string[]; // IDs de tests que se recomienda hacer antes
  related?: string[]; // IDs de tests relacionados
  available?: boolean;
}

const TEST_DEFINITIONS: TestDefinition[] = [
  {
    id: 'wellness',
    name: 'Test de Bienestar Integral',
    description: 'Evaluación base de 38 indicadores en 6 sistemas corporales',
    icon: Activity,
    color: 'from-pink-500 to-rose-500',
    path: '/wellness',
    duration: '5-7 min',
    category: 'foundational',
    order: 1, // Primero - evaluación base
    related: ['phq-9', 'bai', 'bdi-ii'],
  },
  {
    id: 'phq-9',
    code: 'phq-9',
    name: 'PHQ-9 - Depresión',
    description: 'Cuestionario de Salud del Paciente',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    path: '/tests/phq-9',
    duration: '5 min',
    category: 'psychological',
    order: 2,
    prerequisites: ['wellness'],
    related: ['bdi-ii', 'bai'],
  },
  {
    id: 'bai',
    code: 'bai',
    name: 'BAI - Ansiedad',
    description: 'Inventario de Ansiedad de Beck',
    icon: Heart,
    color: 'from-purple-500 to-violet-500',
    path: '/tests/bai',
    duration: '5-10 min',
    category: 'psychological',
    order: 3,
    prerequisites: ['wellness'],
    related: ['phq-9', 'bdi-ii'],
  },
  {
    id: 'bdi-ii',
    code: 'bdi-ii',
    name: 'BDI-II - Depresión',
    description: 'Inventario de Depresión de Beck',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    path: '/tests/bdi-ii',
    duration: '5-10 min',
    category: 'psychological',
    order: 4,
    prerequisites: ['wellness', 'phq-9'],
    related: ['phq-9', 'bai'],
  },
  {
    id: 'kabbalah-basic',
    code: 'basic-analysis',
    name: 'Análisis Cabalístico Básico',
    description: 'Número del alma, misión y debilidades energéticas',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    path: '/kabbalah',
    duration: '10-15 min',
    category: 'kabbalistic',
    order: 5,
    prerequisites: ['wellness'],
    related: ['wellness', 'complete-numerology'],
  },
  {
    id: 'complete-numerology',
    code: 'complete-numerology',
    name: 'Numerología Completa',
    description: 'Análisis profundo: destino, alma, personalidad, madurez, karmas',
    icon: Hash,
    color: 'from-yellow-500 to-amber-500',
    path: '/tests/complete-numerology',
    duration: '15-20 min',
    category: 'kabbalistic',
    order: 5.5,
    prerequisites: ['wellness'],
    related: ['kabbalah-basic'],
  },
  {
    id: 'financial-abundance',
    code: 'financial-abundance',
    name: 'Abundancia Financiera',
    description: 'Ciclos financieros y cómo atraer prosperidad',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    path: '/tests/financial-abundance',
    duration: '12-15 min',
    category: 'kabbalistic',
    order: 6,
    prerequisites: ['wellness', 'kabbalah-basic'],
    related: ['complete-numerology', 'cabalistic-astrology'],
  },
  {
    id: 'cabalistic-astrology',
    code: 'cabalistic-astrology',
    name: 'Astrología Cabalística',
    description: 'ADN Cósmico: 72 Ángeles y Reprogramación Estelar',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-500',
    path: '/tests/cabalistic-astrology',
    duration: '15-20 min',
    category: 'kabbalistic',
    order: 6.5,
    prerequisites: ['wellness', 'kabbalah-basic'],
    related: ['complete-numerology', 'financial-abundance'],
  },
  {
    id: 'stai',
    code: 'stai',
    name: 'STAI - Ansiedad Estado-Rasgo',
    description: 'Evaluación de ansiedad estado y rasgo',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    path: '/tests/stai',
    duration: '10-15 min',
    category: 'psychological',
    order: 6,
    prerequisites: ['bai'],
    related: ['bai', 'phq-9'],
  },
  {
    id: 'scl-90',
    code: 'scl-90',
    name: 'SCL-90-R',
    description: 'Lista de Síntomas Revisada',
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    path: '/tests/scl-90',
    duration: '15-20 min',
    category: 'psychological',
    order: 7,
    prerequisites: ['wellness', 'phq-9', 'bai'],
    related: ['phq-9', 'bai', 'bdi-ii'],
  },
  {
    id: 'mcmi-iv',
    code: 'mcmi-iv',
    name: 'MCMI-IV',
    description: 'Evaluación de Personalidad',
    icon: Brain,
    color: 'from-blue-600 to-indigo-600',
    path: '/tests/mcmi-iv',
    duration: '20-30 min',
    category: 'advanced',
    order: 8,
    prerequisites: ['wellness', 'phq-9', 'bai'],
    related: ['scl-90'],
  },
  {
    id: 'pai',
    code: 'professional-pai',
    name: 'PAI - Inventario de Personalidad',
    description: 'Evaluación profesional de personalidad',
    icon: Brain,
    color: 'from-purple-600 to-pink-600',
    path: '/tests/professional-pai',
    duration: '25-35 min',
    category: 'advanced',
    order: 9,
    prerequisites: ['wellness', 'phq-9'],
    related: ['mcmi-iv'],
  },
];

const CATEGORY_COLORS = {
  foundational: 'bg-blue-900/20 text-blue-400 border-blue-700',
  wellness: 'bg-pink-900/20 text-pink-400 border-pink-700',
  psychological: 'bg-purple-900/20 text-purple-400 border-purple-700',
  kabbalistic: 'bg-amber-900/20 text-amber-400 border-amber-700',
  advanced: 'bg-indigo-900/20 text-indigo-400 border-indigo-700',
};

export default function PatientTestsSidebar({ patient, onTestSelect }: PatientTestsSidebarProps) {
  const router = useRouter();
  const [tests, setTests] = useState<PatientTestResult[]>([]);
  const [availableTests, setAvailableTests] = useState<TestModule[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [highlightedTests, setHighlightedTests] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [patient.id]);

  const loadData = () => {
    const patientTests = getPatientTests(patient.id);
    setTests(patientTests);
    
    // Cargar tests disponibles del backend
    getAvailableTests().then(data => {
      setAvailableTests(data.tests || []);
    }).catch(err => {
      console.error('Error loading available tests:', err);
    });
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const hasTestBeenDone = (testId: string): boolean => {
    // Para wellness
    if (testId === 'wellness') {
      return tests.some(t => t.testType === 'wellness');
    }
    
    // Para financial-abundance, complete-numerology y cabalistic-astrology, verificar en tests guardados
    if (testId === 'financial-abundance' || testId === 'complete-numerology' || testId === 'cabalistic-astrology') {
      return tests.some(t => t.testType === testId);
    }
    
    // Para tests del backend, buscar por código
    const testDef = TEST_DEFINITIONS.find(t => t.id === testId);
    if (testDef?.code) {
      // Verificar si hay resultados del backend para este test
      // Por ahora, verificamos si el test está en availableTests y tiene resultados
      const backendTest = availableTests.find(t => t.code === testDef.code);
      // TODO: Implementar verificación completa con resultados del backend
      // Por ahora, retornamos false para permitir que se muestre
      return false;
    }
    
    // Para kabbalah básico
    if (testId === 'kabbalah-basic') {
      return !!patient.kabbalisticProfile;
    }
    
    return false;
  };

  const isTestAvailable = (testDef: TestDefinition): boolean => {
    // Verificar si el test está disponible según el backend
    if (testDef.code) {
      const backendTest = availableTests.find(t => t.code === testDef.code);
      return backendTest ? backendTest.is_available : false;
    }
    return true; // Tests locales siempre disponibles
  };

  const getRecommendedNextTests = (testId: string): string[] => {
    const testDef = TEST_DEFINITIONS.find(t => t.id === testId);
    if (!testDef) return [];
    
    // Tests relacionados que no se han hecho
    const related = (testDef.related || []).filter(id => !hasTestBeenDone(id));
    
    // Tests que tienen este como prerequisito y no se han hecho
    const nextInOrder = TEST_DEFINITIONS
      .filter(t => 
        t.prerequisites?.includes(testId) && 
        !hasTestBeenDone(t.id) &&
        t.order > testDef.order
      )
      .map(t => t.id);
    
    return [...new Set([...related, ...nextInOrder])];
  };

  const handleTestClick = (testId: string) => {
    setSelectedTest(testId);
    const recommended = getRecommendedNextTests(testId);
    setHighlightedTests(recommended);
    
    if (onTestSelect) {
      onTestSelect(testId);
    }
    
    const testDef = TEST_DEFINITIONS.find(t => t.id === testId);
    if (!testDef) return;
    
    // Navegar al test
    if (testId === 'wellness') {
      router.push(`/patients/${patient.id}/wellness`);
    } else if (testId === 'kabbalah-basic') {
      router.push(`/patients/${patient.id}/kabbalah`);
    } else {
      router.push(`${testDef.path}?patientId=${patient.id}`);
    }
  };

  const getTestStatus = (testId: string) => {
    const done = hasTestBeenDone(testId);
    const testDef = TEST_DEFINITIONS.find(t => t.id === testId);
    const available = testDef ? isTestAvailable(testDef) : true;
    const isHighlighted = highlightedTests.includes(testId);
    const isSelected = selectedTest === testId;
    
    return { done, available, isHighlighted, isSelected };
  };

  // Ordenar tests por orden recomendado
  const sortedTests = [...TEST_DEFINITIONS].sort((a, b) => a.order - b.order);

  return (
    <div className="w-72 bg-slate-900/50 border-r border-slate-700 h-screen sticky top-0 overflow-y-auto">
      {/* Patient Info Header - Compact */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {getInitials(patient.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{patient.name}</h2>
            {patient.birthDate && (
              <p className="text-gray-400 text-xs">
                {new Date(patient.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
        
        {/* Stats - Compact */}
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800/50 rounded px-2 py-1.5 text-center">
            <p className="text-gray-400 text-[10px] uppercase">Tests</p>
            <p className="text-white font-bold text-sm">{tests.length}</p>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded px-2 py-1.5 text-center">
            <p className="text-gray-400 text-[10px] uppercase">Hechos</p>
            <p className="text-white font-bold text-sm">
              {sortedTests.filter(t => hasTestBeenDone(t.id)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tests List - Compact Cards */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider">
            Tests
          </h3>
          <Badge variant="outline" className="bg-slate-800/50 text-gray-400 border-slate-700 text-[10px] px-1.5 py-0">
            {sortedTests.filter(t => isTestAvailable(t)).length}
          </Badge>
        </div>

        <div className="space-y-1.5">
          {sortedTests.map((testDef) => {
            const Icon = testDef.icon;
            const { done, available, isHighlighted, isSelected } = getTestStatus(testDef.id);
            const canDo = !done && available;
            
            return (
              <button
                key={testDef.id}
                onClick={() => canDo && handleTestClick(testDef.id)}
                disabled={!canDo}
                className={`w-full text-left p-2 rounded-md border transition-all relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : isHighlighted
                    ? 'border-amber-500 bg-amber-500/10'
                    : done
                    ? 'border-green-700/50 bg-green-900/10 opacity-70'
                    : available
                    ? 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                    : 'border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Status Icon - Small */}
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : canDo ? (
                      <Circle className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                  </div>

                  {/* Icon + Name - Compact */}
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${testDef.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>

                  {/* Test Name - Compact */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-xs truncate ${
                      done ? 'text-green-400' : 
                      isHighlighted ? 'text-amber-400' :
                      canDo ? 'text-white' : 'text-gray-500'
                    }`}>
                      {testDef.name}
                    </h4>
                  </div>

                  {/* Order number badge - Small */}
                  {!done && (
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isHighlighted
                        ? 'bg-amber-500 text-white'
                        : canDo
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}>
                      {testDef.order}
                    </div>
                  )}
                </div>

                {/* Description and meta - Only on hover/selected */}
                {(isSelected || isHighlighted) && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700">
                    <p className="text-gray-400 text-[10px] line-clamp-1 mb-1">
                      {testDef.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded ${CATEGORY_COLORS[testDef.category]}`}>
                        {testDef.category}
                      </span>
                      <span className="text-gray-500">⏱️ {testDef.duration}</span>
                      {isHighlighted && (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <ArrowRight className="w-2.5 h-2.5" />
                          Recomendado
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box - Compact */}
        {selectedTest && highlightedTests.length > 0 && (
          <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700/50 rounded-md">
            <div className="flex items-start gap-1.5">
              <Zap className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-amber-200">
                <p className="font-semibold mb-1">Siguiente:</p>
                <ul className="space-y-0.5">
                  {highlightedTests.slice(0, 3).map(id => {
                    const test = TEST_DEFINITIONS.find(t => t.id === id);
                    return test ? (
                      <li key={id} className="flex items-center gap-1">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span className="truncate">{test.name}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

