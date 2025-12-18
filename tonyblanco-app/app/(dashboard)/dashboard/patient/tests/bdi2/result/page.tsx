"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://analisis-cabalistico-alma.onrender.com/api";

type BDI2Result = {
  id?: number;
  result_data?: {
    total_score?: number;
    severity_label?: string;
    flags?: { suicidal_ideation?: boolean };
  };
  score?: number;
  clinical_diagnosis?: string;
};

export default function Bdi2PatientResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BDI2Result | null>(null);

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
        const response = await fetch(`${API_URL}/tests/results/?test_code=bdi-ii`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("No se pudo obtener el resultado.");
        }
        const data = await response.json();
        const items: BDI2Result[] = data?.results || data || [];
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

  const totalScore = useMemo(() => {
    return result?.result_data?.total_score ?? result?.score ?? null;
  }, [result]);

  const severity = useMemo(() => {
    return result?.result_data?.severity_label ?? result?.clinical_diagnosis ?? null;
  }, [result]);

  const suicidalFlag = result?.result_data?.flags?.suicidal_ideation === true;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600">Cargando resultado BDI-II…</p>
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
          <h1 className="text-xl font-semibold text-gray-900">BDI-II</h1>
          <p className="text-sm text-gray-600 mt-2">Aún no hay resultados registrados.</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    totalScore !== null && totalScore !== undefined ? Math.min(Math.round((totalScore / 63) * 100), 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">BDI-II — Resultado</h1>
        <p className="text-sm text-gray-600 mt-2">
          Inventario de depresión de Beck II. Este resultado no es un diagnóstico.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Puntaje total</p>
            <p className="text-3xl font-semibold text-gray-900">{totalScore ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Severidad</p>
            <p className="text-lg font-medium text-gray-900">{severity ?? "N/A"}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progreso del puntaje (0–63)</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: "var(--accent-color)" }}
            />
          </div>
        </div>

        {suicidalFlag && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Respuestas positivas en ítems de ideación suicida. Si necesitas apoyo, contacta con tu profesional de salud.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Este resultado no es un diagnóstico.
        </p>
      </div>
    </div>
  );
}
