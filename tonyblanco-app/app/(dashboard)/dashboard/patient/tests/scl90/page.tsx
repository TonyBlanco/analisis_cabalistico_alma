"use client";

import Link from "next/link";
import { scl90Definition } from "./scl90.config";

export default function Scl90Page() {
  return (
    <section className="mx-auto my-8 max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Evaluación wellness
        </p>
        <h1 className="text-3xl font-semibold">{scl90Definition.name}</h1>
        <p className="text-base text-slate-600">{scl90Definition.purpose}</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-lg font-medium text-slate-700">
          {scl90Definition.name} aún no está activo en esta versión. Estamos trabajando en la ejecución wellness del test. Por ahora puedes reservarlo y consultarlo con tu terapeuta.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          {scl90Definition.disclaimer}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-700">
        <p>Escala oficial</p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(scl90Definition.scale.labels).map(([value, label]) => (
            <li key={value} className="rounded-lg bg-white px-3 py-2 shadow-sm">
              <span className="font-semibold">{value}</span>: {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="rounded-2xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800"
          disabled
        >
          Próximamente disponible
        </button>
        <Link
          href="/dashboard/patient/tests"
          className="text-sm text-slate-500 underline"
        >
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}
