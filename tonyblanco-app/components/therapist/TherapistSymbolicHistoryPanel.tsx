"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/api-base";
import SymbolicReadingPanel from "@/components/tarot/SymbolicReadingPanel";

type SnapshotItem = any;

export default function TherapistSymbolicHistoryPanel({ patientId }: { patientId: string }) {
  const [items, setItems] = useState<SnapshotItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SnapshotItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(null);
      try {
        const token = getAuthToken();
        const headers: HeadersInit = { "Content-Type": "application/json", ...(token ? { Authorization: `Token ${token}` } : {}) };
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/swm-v3/symbolic-readings/?patient_id=${encodeURIComponent(patientId)}`, { headers });
        if (!res.ok) {
          setError("No se pudo cargar el historial simbólico.");
          return;
        }
        const json = await res.json().catch(() => null);
        let list: SnapshotItem[] = [];
        if (Array.isArray(json)) list = json;
        if (json && Array.isArray(json.items)) list = json.items;

        // Filter strictly for persisted symbolic snapshots from B.O.T.A.
        const filtered = list.filter((it: any) => {
          const system = (it.system || it.system_id || (it.payload && it.payload.system) || '').toString().toLowerCase();
          const typ = (it.type || it.reading_type || (it.payload && it.payload.type) || '').toString().toLowerCase();
          return (system === 'tarot_bota' || system === 'bota' || system === 'tarot-bota') && (typ === 'symbolic' || typ === 'symbol' || typ === 'educational' || it.snapshot === true || it.is_snapshot === true);
        });

        if (!cancelled) setItems(filtered);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error inesperado');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [patientId]);

  const open = (it: SnapshotItem) => {
    // Ensure no keywords / interactive fields are passed to child
    const clone = JSON.parse(JSON.stringify(it));
    if (clone.payload && Array.isArray(clone.payload.cards)) {
      clone.payload.cards = clone.payload.cards.map((c: any) => {
        if (c.symbols && typeof c.symbols === 'object') {
          c.symbols = { ...c.symbols, keywords: [], keywordsReversed: [] };
        }
        if (c.card && typeof c.card === 'object') {
          c.card = { ...c.card, keywords: [] };
        }
        return c;
      });
    }
    setSelected(clone);
  };

  const close = () => setSelected(null);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">LECTURAS SIMBÓLICAS (NO CLÍNICAS)</h2>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <ul className="space-y-2">
        {items.length === 0 ? <li className="text-sm text-slate-600">No hay lecturas simbólicas guardadas.</li> : null}
        {items.map((it) => {
          const date = it.created_at || it.updated_at || (it.payload && it.payload.created_at) || it.timestamp || null;
          const parsedDate = date ? new Date(date).toLocaleDateString() : '';
          const label = (it.system_label || it.system || it.system_id || (it.payload && it.payload.system) || 'Tarot B.O.T.A.').toString();
          return (
            <li key={it.id || it.reading_id || JSON.stringify(it)} className="flex items-center justify-between gap-3 rounded border p-3">
              <div>
                <div className="text-sm font-medium">{label} — {parsedDate}</div>
                <div className="text-xs text-slate-600">{it.summary || (it.payload && it.payload.summary) || ''}</div>
              </div>
              <div>
                <button type="button" onClick={() => open(it)} className="text-xs text-sky-600">Abrir lectura</button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-8">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative max-w-4xl w-full rounded-lg bg-white shadow-lg overflow-auto" style={{maxHeight: '90vh'}}>
            <div className="p-4 border-b">
              <div className="text-sm font-semibold">Lectura simbólica observacional. No diagnóstica. No predictiva. No clínica.</div>
            </div>
            <div className="p-4 therapist-readonly">
              <SymbolicReadingPanel
                systemLabel={(selected.system_label || selected.system || selected.system_id || (selected.payload && selected.payload.system) || 'B.O.T.A. Tarot')}
                selectedCard={Array.isArray(selected.payload?.cards) ? selected.payload.cards[0] : null}
                contextFocus={selected.payload?.context_focus || null}
              />
            </div>
            <div className="p-3 border-t text-right">
              <button type="button" onClick={close} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">Cerrar</button>
            </div>
          </div>

          <style jsx>{`
            :global(.therapist-readonly) button, :global(.therapist-readonly a) { display: none !important; }
            :global(.therapist-readonly) .rounded-full { display: none !important; }
            :global(.therapist-readonly) .inline-flex { display: none !important; }
          `}</style>
        </div>
      ) : null}
    </section>
  );
}
