"use client";

import { useState } from "react";

type AxisState = {
  name: string;
  level: "bajo" | "medio" | "alto";
  comment: string;
};

type RiskState = {
  id: string;
  label: string;
  checked: boolean;
};

type ScdfDraft = {
  status: "draft" | "validated";
  clinicalSummary: string;
  hypotheses: string;
  recommendations: string;
  therapistNotes: string;
  axes: AxisState[];
  risks: {
    items: RiskState[];
    note: string;
  };
};

const mockSignals = [
  { name: "PHQ-9", date: "2025-12-15" },
  { name: "GAD-7", date: "2025-12-12" },
  { name: "ISI", date: "2025-12-10" },
  { name: "BDI-II", date: "2025-12-08" },
];

const initialDraft: ScdfDraft = {
  status: "draft",
  clinicalSummary: "",
  hypotheses: "",
  recommendations: "",
  therapistNotes: "",
  axes: [
    { name: "Estado de animo", level: "medio", comment: "" },
    { name: "Ansiedad / Estres", level: "medio", comment: "" },
    { name: "Sueno / Ritmos", level: "medio", comment: "" },
    { name: "Trauma", level: "bajo", comment: "" },
    { name: "Psicopatologia general", level: "bajo", comment: "" },
    { name: "Funcionamiento / Bienestar", level: "medio", comment: "" },
  ],
  risks: {
    items: [
      { id: "suicidio", label: "Ideacion suicida", checked: false },
      { id: "autolesion", label: "Riesgo de autolesion", checked: false },
      { id: "violencia", label: "Riesgo de violencia", checked: false },
      { id: "consumo", label: "Consumo problematico", checked: false },
    ],
    note: "",
  },
};

export default function ScdfPlaceholderPage() {
  const [draft, setDraft] = useState<ScdfDraft>(initialDraft);

  const handleAxisChange = (index: number, updates: Partial<AxisState>) => {
    setDraft((prev) => ({
      ...prev,
      axes: prev.axes.map((axis, idx) =>
        idx === index ? { ...axis, ...updates } : axis
      ),
    }));
  };

  const handleRiskToggle = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      risks: {
        ...prev.risks,
        items: prev.risks.items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      },
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Entrevista Clinica Integrativa (SCDF)
            </h1>
            <p className="text-sm text-gray-600 mt-2">Modulo clinico - en desarrollo</p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              draft.status === "validated"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {draft.status === "validated" ? "Validado" : "Borrador"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Modo simulado sin persistencia. Los cambios se mantienen solo en esta sesion.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--accent-color)" }}
            onClick={() => setDraft((prev) => ({ ...prev, status: "draft" }))}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 rounded-md border border-gray-200 hover:bg-gray-50"
            onClick={() => setDraft((prev) => ({ ...prev, status: "validated" }))}
          >
            Validar SCDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Senales (tests)</h2>
        {mockSignals.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos disponibles.</p>
        ) : (
          <div className="space-y-2">
            {mockSignals.map((signal) => (
              <div
                key={`${signal.name}-${signal.date}`}
                className="flex flex-col gap-1 rounded-md border border-gray-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-gray-900">{signal.name}</span>
                <span className="text-xs text-gray-500">
                  {signal.date} · Completado
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Sintesis clinica</h2>
        <textarea
          value={draft.clinicalSummary}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, clinicalSummary: event.target.value }))
          }
          rows={5}
          placeholder="Resumen integrativo del estado del paciente."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Ejes clinicos</h2>
        <div className="space-y-3">
          {draft.axes.map((axis, index) => (
            <div
              key={`${axis.name}-${index}`}
              className="border border-gray-200 rounded-md p-3 space-y-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-gray-900">{axis.name}</span>
                <select
                  value={axis.level}
                  onChange={(event) =>
                    handleAxisChange(index, {
                      level: event.target.value as AxisState["level"],
                    })
                  }
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm text-gray-900"
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <textarea
                value={axis.comment}
                onChange={(event) =>
                  handleAxisChange(index, { comment: event.target.value })
                }
                rows={3}
                placeholder="Comentario clinico por eje."
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Hipotesis</h2>
        <textarea
          value={draft.hypotheses}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, hypotheses: event.target.value }))
          }
          rows={4}
          placeholder="Hipotesis clinicas preliminares."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Riesgos</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {draft.risks.items.map((risk) => (
            <label
              key={risk.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={risk.checked}
                onChange={() => handleRiskToggle(risk.id)}
                className="h-4 w-4 border-gray-300 rounded"
              />
              {risk.label}
            </label>
          ))}
        </div>
        <textarea
          value={draft.risks.note}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              risks: { ...prev.risks, note: event.target.value },
            }))
          }
          rows={3}
          placeholder="Notas adicionales sobre riesgos."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recomendaciones</h2>
        <textarea
          value={draft.recommendations}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, recommendations: event.target.value }))
          }
          rows={4}
          placeholder="Proximos pasos sugeridos."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Notas del terapeuta</h2>
        <textarea
          value={draft.therapistNotes}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, therapistNotes: event.target.value }))
          }
          rows={4}
          placeholder="Espacio reservado para notas clinicas."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
