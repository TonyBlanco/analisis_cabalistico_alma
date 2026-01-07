"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTestResult, deleteTestResult } from "@/lib/test-api";
import { getUserRole } from "@/lib/getUserRole";
import type { TestResult } from "@/lib/test-types";
import ReadableResult from "@/components/test-results/ReadableResult";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const resultId = params?.id as string;
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getTestResult(resultId);
        if (mounted) setResult(r ?? null);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Error al cargar resultado");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    getUserRole()
      .then((role) => mounted && setUserRole(role))
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [resultId]);

  const handleDelete = async () => {
    if (!confirm("¿Deseas eliminar (archivar) este resultado?")) return;
    try {
      await deleteTestResult(resultId);
      router.back();
    } catch (err: any) {
      setError(err?.message ?? "Error al eliminar resultado");
    }
  };

  const created = result?.created_at ? new Date(result.created_at).toLocaleString("es-ES") : "—";
  const title = result?.test_module?.name || (result as any)?.test_module_name || "Resultado de test";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500 mt-1">{created}</p>
          </div>
          <div className="flex items-center gap-3">
            {userRole === "therapist" && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-600 border border-red-200 px-3 py-1 rounded-md hover:bg-red-50"
              >
                Eliminar resultado
              </button>
            )}
            <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 underline">
              Volver
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600">Cargando resultado…</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => router.back()} className="mt-3 text-sm text-red-700 underline">
            Volver
          </button>
        </div>
      ) : !result ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900">Resultado</h2>
          <p className="text-sm text-gray-600 mt-2">No se encontró el resultado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {result.notes?.trim() ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Notas del profesional</h2>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{result.notes}</p>
            </div>
          ) : null}

          {result.result_data ? (
            <ReadableResult 
              resultData={result.result_data} 
              executionMode={result.test_module?.execution_mode}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600">No hay datos de resultado para mostrar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
