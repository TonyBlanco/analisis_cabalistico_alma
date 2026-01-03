"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getAuthToken } from "@/lib/api";

export default function TherapistSymbolicHistory() {
  const [items, setItems] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(null);
      try {
        const token = getAuthToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) };
        const res = await fetch(`${API_BASE_URL}/swm-v3/symbolic-readings/`, { headers });
        if (!res.ok) {
          setError('No se pudo cargar el historial');
          return;
        }
        const json = await res.json();
        if (!cancelled) setItems(json.items || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error inesperado');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold">Historial de lecturas simbólicas</div>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? <li className="text-xs text-slate-600">No hay lecturas guardadas.</li> : null}
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-3 rounded border p-2">
            <div>
              <div className="text-sm font-medium">{it.system_id}</div>
              <div className="text-xs text-slate-600">{it.summary || ''}</div>
              <div className="text-xs text-slate-500">{new Date(it.created_at).toLocaleString()}</div>
            </div>
            <div>
              <a href={`#`} className="text-xs text-sky-600">Ver lectura</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
