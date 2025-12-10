'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Sparkles, 
  FileText, 
  Brain,
  Dna,
  Heart,
  X
} from 'lucide-react';

interface TestSelectorProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

const AVAILABLE_TESTS = [
  {
    id: 'wellness',
    name: 'Test de Bienestar Integral',
    description: 'Evaluación de 38 indicadores en 6 sistemas corporales',
    icon: Activity,
    color: 'from-pink-500 to-rose-500',
    path: '/wellness',
    duration: '5-7 minutos',
    questions: 38,
  },
  {
    id: 'phq-9',
    name: 'PHQ-9 - Depresión',
    description: 'Cuestionario de Salud del Paciente para depresión',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    path: '/tests/phq-9',
    duration: '5 minutos',
    questions: 9,
  },
  {
    id: 'bai',
    name: 'BAI - Ansiedad',
    description: 'Inventario de Ansiedad de Beck',
    icon: Heart,
    color: 'from-purple-500 to-violet-500',
    path: '/tests/bai',
    duration: '5-10 minutos',
    questions: 21,
  },
  {
    id: 'bdi-ii',
    name: 'BDI-II - Depresión',
    description: 'Inventario de Depresión de Beck',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    path: '/tests/bdi-ii',
    duration: '5-10 minutos',
    questions: 21,
  },
  {
    id: 'kabbalah-soul',
    name: 'Análisis Cabalístico del Alma',
    description: 'Número del alma, misión de vida, y debilidades energéticas',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    path: '/tests/kabbalah',
    duration: '10-15 minutos',
    questions: 'Calculado',
  },
  {
    id: 'biomagnetism',
    name: 'Test de Biomagnetismo',
    description: 'Evaluación de desequilibrios energéticos y puntos magnéticos',
    icon: Dna,
    color: 'from-green-500 to-emerald-500',
    path: '/tests/biomagnetism',
    duration: '15-20 minutos',
    questions: 50,
  },
];

export default function TestSelector({ patientId, patientName, onClose }: TestSelectorProps) {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const handleStartTest = () => {
    if (!selectedTest) return;
    
    const test = AVAILABLE_TESTS.find(t => t.id === selectedTest);
    if (test) {
      if (test.id === 'wellness') {
        router.push(`/patients/${patientId}/wellness`);
      } else {
        // Para tests específicos, usar query param para pasar patientId
        router.push(`${test.path}?patientId=${patientId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Seleccionar Test</h2>
              <p className="text-gray-400">Paciente: {patientName}</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="border-slate-700 hover:bg-slate-800"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          {/* Tests Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {AVAILABLE_TESTS.map((test) => {
              const Icon = test.icon;
              const isSelected = selectedTest === test.id;
              
              return (
                <button
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${test.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{test.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{test.description}</p>
                      
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>⏱️ {test.duration}</span>
                        <span>❓ {test.questions} preguntas</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleStartTest}
              disabled={!selectedTest}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comenzar Test Seleccionado
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-700"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
