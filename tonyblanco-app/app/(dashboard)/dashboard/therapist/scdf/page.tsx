"use client";

import { useEffect, useState } from "react";
import { getActivePatientName } from "@/lib/active-patient";

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
  const [activePatientName, setActivePatientName] = useState<string | null>(null);

  useEffect(() => {
    const syncPatient = () => {
      const name = getActivePatientName();
      setActivePatientName(name || null);
    };
    syncPatient();
    window.addEventListener("activePatientChanged", syncPatient);
    window.addEventListener("storage", syncPatient);
    return () => {
      window.removeEventListener("activePatientChanged", syncPatient);
      window.removeEventListener("storage", syncPatient);
    };
  }, []);

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

  const progressItems = [
    draft.clinicalSummary,
    draft.hypotheses,
    draft.recommendations,
    draft.therapistNotes,
    draft.risks.note,
    ...draft.axes.map((axis) => axis.comment),
  ];
  const filledCount = progressItems.filter((value) => value.trim().length > 0).length;
  const progressTotal = progressItems.length;
  const progressPercent = progressTotal === 0 ? 0 : Math.round((filledCount / progressTotal) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">
                Entrevista Clinica Integrativa (SCDF)
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  draft.status === "validated"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {draft.status === "validated" ? "Validado" : "Borrador"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Modulo clinico - en desarrollo</p>
            <p className="text-sm text-gray-500 mt-1">
              Modo simulado sin persistencia. Los cambios se mantienen solo en esta sesion.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="text-xs uppercase text-gray-500">Paciente activo</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {activePatientName || "Sin paciente seleccionado"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contexto clinico priorizado para esta entrevista.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 lg:col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Progreso clinico (mock)</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${progressPercent}%`, backgroundColor: "var(--accent-color)" }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Senales
              </span>
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                Sintesis
              </span>
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Decision clinica
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-blue-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Senales (tests)</h2>
          <p className="text-sm text-gray-500">
            Resultados completados que sirven como base de la lectura clinica.
          </p>
        </div>
        {mockSignals.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos disponibles.</p>
        ) : (
          <div className="space-y-2">
            {mockSignals.map((signal) => (
              <div
                key={`${signal.name}-${signal.date}`}
                className="flex flex-col gap-1 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-gray-900">{signal.name}</span>
                <span className="text-xs text-gray-500">
                  {signal.date} - Completado
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-teal-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sintesis clinica integrativa</h2>
          <p className="text-sm text-gray-500">
            Sintesis narrativa del estado actual, basada en senales y observacion.
          </p>
        </div>
        <div className="max-w-3xl">
          <textarea
            value={draft.clinicalSummary}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, clinicalSummary: event.target.value }))
            }
            rows={5}
            placeholder="Resumen integrativo del estado del paciente."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-emerald-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ejes clinicos</h2>
          <p className="text-sm text-gray-500">
            Estado por eje con nivel de atencion y comentario clinico.
          </p>
        </div>
        <div className="space-y-4">
          {draft.axes.map((axis, index) => (
            <div
              key={`${axis.name}-${index}`}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
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
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm text-gray-900 bg-white"
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div className="max-w-3xl">
                <textarea
                  value={axis.comment}
                  onChange={(event) =>
                    handleAxisChange(index, { comment: event.target.value })
                  }
                  rows={3}
                  placeholder="Comentario clinico por eje."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-amber-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hipotesis clinicas</h2>
          <p className="text-sm text-gray-500">
            Hipotesis preliminares para orientar la exploracion clinica.
          </p>
        </div>
        <div className="max-w-3xl">
          <textarea
            value={draft.hypotheses}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, hypotheses: event.target.value }))
            }
            rows={4}
            placeholder="Hipotesis clinicas preliminares."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-rose-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Riesgos clinicos y alertas</h2>
          <p className="text-sm text-gray-500">
            Checklist de alertas clinicas con anotaciones de soporte.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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
        <div className="max-w-3xl">
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-lime-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recomendaciones</h2>
          <p className="text-sm text-gray-500">
            Proximos pasos sugeridos para el plan clinico inmediato.
          </p>
        </div>
        <div className="max-w-3xl">
          <textarea
            value={draft.recommendations}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, recommendations: event.target.value }))
            }
            rows={4}
            placeholder="Proximos pasos sugeridos."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-slate-400">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notas privadas del terapeuta</h2>
          <p className="text-sm text-gray-500">
            Observaciones clinicas internas no compartidas con el paciente.
          </p>
        </div>
        <div className="max-w-3xl">
          <textarea
            value={draft.therapistNotes}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, therapistNotes: event.target.value }))
            }
            rows={4}
            placeholder="Espacio reservado para notas clinicas."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-end gap-3">
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
    </div>
  );
}
