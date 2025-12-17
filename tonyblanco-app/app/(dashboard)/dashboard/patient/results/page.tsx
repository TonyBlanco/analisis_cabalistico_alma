'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface Result {
  id: string;
  name: string;
  date: string;
  status: 'new' | 'viewed';
  type: string;
}

export default function PatientResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch results from backend
    // Placeholder data
    setResults([
      {
        id: '1',
        name: 'Análisis Cabalístico Completo',
        date: '2024-03-15',
        status: 'new',
        type: 'kabbalah',
      },
      {
        id: '2',
        name: 'Test de Autoobservación',
        date: '2024-03-10',
        status: 'viewed',
        type: 'clinical',
      },
      {
        id: '3',
        name: 'Mapa del Alma',
        date: '2024-03-05',
        status: 'viewed',
        type: 'kabbalah',
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mis resultados</h1>
        <p className="text-gray-600">
          Consulta los resultados de tus tests y análisis
        </p>
      </div>

      {/* Lista de resultados */}
      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-violet-600" />
                    <h3 className="font-medium text-gray-900">{result.name}</h3>
                    {result.status === 'new' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(result.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/patient/results/${result.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Ver resultado
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No hay resultados disponibles
          </h3>
          <p className="text-gray-500 text-sm">
            Los resultados aparecerán aquí cuando completes tus tests asignados
          </p>
        </div>
      )}
    </div>
  );
}
