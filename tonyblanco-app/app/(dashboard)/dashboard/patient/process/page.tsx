'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export default function PatientProcessPage() {
  const [status, setStatus] = useState<string>('En acompañamiento terapéutico');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch process data from backend
    // Placeholder data
    setMilestones([
      {
        id: '1',
        title: 'Primera consulta completada',
        date: '2024-03-01',
        completed: true,
      },
      {
        id: '2',
        title: 'Análisis cabalístico inicial',
        date: '2024-03-10',
        completed: true,
      },
      {
        id: '3',
        title: 'Test de autoobservación',
        date: '2024-03-15',
        completed: false,
      },
      {
        id: '4',
        title: 'Revisión de avances',
        date: 'Próximamente',
        completed: false,
      },
    ]);
    setNextSteps([
      'Completar el test de autoobservación pendiente',
      'Revisar los resultados del análisis cabalístico',
      'Practicar las meditaciones recomendadas',
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Cargando proceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mi proceso</h1>
        <p className="text-gray-600">
          Seguimiento de tu camino personal de crecimiento y autoconocimiento
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">Estado actual</h2>
        </div>
        <p className="text-gray-700 text-lg">{status}</p>
      </div>

      {/* Historial de hitos */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de hitos</h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                {milestone.completed ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                {index < milestones.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <h3 className={`font-medium ${milestone.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {milestone.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos pasos sugeridos</h2>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Este espacio refleja el progreso de tu proceso personal. 
          No es una lectura holística ni médica, sino una guía de tu camino de crecimiento.
        </p>
      </div>
    </div>
  );
}
