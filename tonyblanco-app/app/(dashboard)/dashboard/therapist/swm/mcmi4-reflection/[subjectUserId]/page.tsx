"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getReflection,
  REFLECTION_QUESTIONS,
  type ReflectionWorkspace,
} from "@/lib/api/mcmi4-reflection-api";

// Helper to get signal test result for specific user
async function getSignalTestResultForUser(userId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('No auth token');
  
  // For therapist view, we need an endpoint to get patient's results
  // For now, using a query param approach
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/tests/results/?user_id=${userId}`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );
  
  if (!res.ok) throw new Error('Failed to fetch test results');
  
  const results = await res.json();
  const signalResults = results.filter((r: any) => 
    r.test_module?.code === 'mcmi4-signal' || r.test_id === 'mcmi4-signal'
  );
  
  return signalResults.length > 0 ? signalResults[0] : null;
}

// Helper to find workspace for user
async function findReflectionWorkspaceForUser(userId: string): Promise<ReflectionWorkspace | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/swm/mcmi4-reflection/by-user/${userId}`,
      {
        headers: { Authorization: `Token ${token}` },
      }
    );
    
    if (res.status === 404) {
      return null; // No reflection yet
    }
    
    if (!res.ok) {
      throw new Error('Failed to fetch reflection');
    }
    
    return res.json();
  } catch (err) {
    console.error('Error finding reflection:', err);
    return null;
  }
}

export default function TherapistReflectionViewPage() {
  const params = useParams();
  const router = useRouter();
  const subjectUserId = params?.subjectUserId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signalResult, setSignalResult] = useState<any>(null);
  const [workspace, setWorkspace] = useState<ReflectionWorkspace | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!subjectUserId) return;
    
    async function loadData() {
      try {
        setLoading(true);
        
        // Get signal result
        const signal = await getSignalTestResultForUser(subjectUserId);
        setSignalResult(signal);
        
        if (!signal) {
          setLoading(false);
          return;
        }
        
        // Try to find reflection workspace
        const ws = await findReflectionWorkspaceForUser(subjectUserId);
        
        if (ws) {
          setWorkspace(ws);
          setAnswers(ws.artifact?.content.answers || {});
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading reflection');
        setLoading(false);
      }
    }
    
    loadData();
  }, [subjectUserId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!signalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Reflexión MCMI-4
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Este consultante no ha completado la evaluación MCMI-4 SIGNAL aún.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Reflexión MCMI-4
          </h1>
          
          {/* Signal Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              Evaluación SIGNAL del Consultante
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Fecha:</span>
                <p className="font-medium text-gray-900">
                  {new Date(signalResult.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Items:</span>
                <p className="font-medium text-gray-900">
                  {signalResult.result_data?.total_items || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Media:</span>
                <p className="font-medium text-gray-900">
                  {signalResult.result_data?.mean?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Variabilidad:</span>
                <p className="font-medium text-gray-900">
                  {signalResult.result_data?.stdev?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              El consultante no ha completado su reflexión personal aún.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Puedes invitarle a completarla compartiendo el enlace:{' '}
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                /dashboard/patient/swm/mcmi4-reflection
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Reflexión MCMI-4 del Consultante
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Vista de solo lectura — Reflexión experiencial del consultante
        </p>
        
        {workspace.status === 'sealed' && (
          <div className="mt-4 inline-block bg-green-50 border border-green-200 rounded px-3 py-1">
            <span className="text-xs font-medium text-green-800">
              ✓ Finalizada el{' '}
              {workspace.sealed_at
                ? new Date(workspace.sealed_at).toLocaleDateString('es-ES')
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Signal Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          Evaluación SIGNAL
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Fecha:</span>
            <p className="font-medium text-gray-900">
              {new Date(signalResult.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Items:</span>
            <p className="font-medium text-gray-900">
              {signalResult.result_data?.total_items || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Media:</span>
            <p className="font-medium text-gray-900">
              {signalResult.result_data?.mean?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Variabilidad:</span>
            <p className="font-medium text-gray-900">
              {signalResult.result_data?.stdev?.toFixed(2) || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Reflection Answers (Read-only) */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">
          Respuestas del Consultante
        </h2>
        
        {REFLECTION_QUESTIONS.map((q, idx) => {
          const answer = answers[q.id];
          return (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {q.text}
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {answer || '(Sin respuesta)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {workspace.status === 'draft' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ℹ Esta reflexión aún está en borrador. El consultante puede seguir editándola.
          </p>
        </div>
      )}
    </div>
  );
}
