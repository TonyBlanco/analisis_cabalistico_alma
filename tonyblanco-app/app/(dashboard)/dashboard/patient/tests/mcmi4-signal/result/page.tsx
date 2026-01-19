"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";

const API_URL = getApiBaseUrl();

type SignalResult = {
  id?: number;
  created_at?: string;
  input_data?: { responses?: Record<string, number> };
  result_data?: { processed?: boolean };
};

export default function Mcmi4SignalResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignalResult | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Sesión no válida.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/tests/results/?test_code=mcmi4-signal`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("No se pudo obtener el resultado.");
        }
        const data = await response.json();
        const items: SignalResult[] = data?.results || data || [];
        if (items.length === 0) {
          setResult(null);
        } else {
          setResult(items[0]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cargar el resultado.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  const answeredCount = useMemo(() => {
    return Object.keys(result?.input_data?.responses || {}).length;
  }, [result]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando señal…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900">SWM MCMI-4 SIGNAL</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay señales registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">SWM MCMI-4 SIGNAL — Resultado</h1>
        <p className="text-sm text-gray-600 mt-2">
          Señal mínima registrada. Este resultado habilita el flujo hacia el módulo Místico.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500">Respuestas registradas</p>
          <p className="text-3xl font-semibold text-gray-900">{answeredCount}</p>
        </div>
        <p className="text-xs text-gray-500">
          Fecha: {result.created_at ? new Date(result.created_at).toLocaleString() : "N/A"}
        </p>
      </div>
    </div>
  );
}
