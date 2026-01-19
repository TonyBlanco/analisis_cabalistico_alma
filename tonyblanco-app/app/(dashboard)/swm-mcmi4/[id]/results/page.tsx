/**
 * MCMI-4 Místico Workspace - Results View
 * 
 * View final synthesis and all artifacts for sealed/reviewed workspace
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { swmMcmi4Api, ResultsResponse } from '@/lib/api/swm-mcmi4-api';
import { ArtifactViewer } from '@/components/swm';

export default function WorkspaceResultsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, [workspaceId]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await swmMcmi4Api.getResults(workspaceId);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar resultados');
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando resultados...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Resultados no disponibles'}</p>
          <button
            onClick={() => router.push('/swm-mcmi4')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/swm-mcmi4')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Volver a lista
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MCMI-4 Místico - Resultados
            </h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>ID: {workspaceId.slice(0, 8)}</span>
              <span>Estado: <strong>{results.status}</strong></span>
            </div>
          </div>
          {results.sealed_at && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Sellado:</p>
              <p className="text-lg font-medium text-gray-900">
                {new Date(results.sealed_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Final Synthesis */}
      {results.final_synthesis && (
        <div className="bg-white border rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Síntesis Final</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Completa
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm">
              {JSON.stringify(results.final_synthesis, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* No synthesis warning */}
      {!results.final_synthesis && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            ⚠️ No hay síntesis final disponible para este workspace
          </p>
        </div>
      )}

      {/* Artifacts */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Artefactos Generados</h2>
        <ArtifactViewer artifacts={results.artifacts} />
      </div>

      {/* Export/Print Actions */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Acciones</h3>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Imprimir Reporte
          </button>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(results, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mcmi4-mystic-${workspaceId.slice(0, 8)}.json`;
              a.click();
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Exportar JSON
          </button>
          <button
            onClick={() => router.push(`/swm-mcmi4/${workspaceId}`)}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Ver Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
