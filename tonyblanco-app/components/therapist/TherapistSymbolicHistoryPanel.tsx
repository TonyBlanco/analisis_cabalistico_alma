"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/api-base";
import SymbolicReadingPanel from "@/components/tarot/SymbolicReadingPanel";
import dynamic from 'next/dynamic';
import React from 'react';
import { useToast } from '@/components/ui/toast';
import { isTherapist } from '@/lib/auth';

const BotaViewer = dynamic(() => import('@/components/tarot/bota/BotaSnapshotViewer').then((m) => (props: any) => m.default(props)), { ssr: false });

type SnapshotItem = any;

export default function TherapistSymbolicHistoryPanel({ patientId }: { patientId: string }) {
  const [items, setItems] = useState<SnapshotItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SnapshotItem | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SnapshotItem | null>(null);
  const toast = useToast();

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
          const system = (it.system_id || it.system || (it.payload && it.payload.system) || '').toString().toLowerCase();
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

  const open = async (it: SnapshotItem) => {
    const id = it?.id || it?.reading_id;
    setSelected(it);
    setSelectedLoading(true);
    setSelectedError(null);

    try {
      if (!id) throw new Error('Invalid id');

      const token = getAuthToken();
      const headers: HeadersInit = { "Content-Type": "application/json", ...(token ? { Authorization: `Token ${token}` } : {}) };
      const base = getApiBaseUrl();

      const res = await fetch(`${base}/swm-v3/symbolic-readings/?id=${encodeURIComponent(String(id))}`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'No se pudo cargar la lectura.');
      }
      const json = await res.json().catch(() => null);
      const full = json?.item || null;
      if (full) {
        if (full.content && Array.isArray(full.content.cards)) {
          full.content.cards = full.content.cards.map((c: any) => {
            if (c.symbols && typeof c.symbols === 'object') {
              c.symbols = { ...c.symbols, keywords: [], keywordsReversed: [] };
            }
            return c;
          });
        }
        setSelected(full);
      }
    } catch (e: any) {
      setSelectedError(e?.message || 'Error inesperado al cargar');
    } finally {
      setSelectedLoading(false);
    }
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
                  <button type="button" onClick={() => open(it)} className="text-xs text-sky-600 mr-3">Abrir lectura</button>
                  <button type="button" onClick={() => setDeleting(it)} className="text-xs text-red-600">Eliminar</button>
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
              {selectedLoading ? (
                <div className="text-sm text-slate-600">Cargando lectura...</div>
              ) : selectedError ? (
                <div className="text-sm text-red-600">{selectedError}</div>
              ) : null}
              {(((selected.payload && selected.payload.system && selected.payload.system.id) || selected.system || selected.system_id) || '').toString().toLowerCase() === 'bota' ? (
                <BotaViewer snapshot={selected.content || selected.payload || selected} />
              ) : (
                <SymbolicReadingPanel
                  systemLabel={(selected.system_label || selected.system || selected.system_id || (selected.payload && selected.payload.system) || 'Sistema simbólico')}
                  selectedCard={Array.isArray(selected.payload?.cards) ? selected.payload.cards[0] : null}
                  contextFocus={selected.payload?.context_focus || null}
                />
              )}
            </div>
            <div className="p-3 border-t text-right">
              {isTherapist() ? (
                <button
                  type="button"
                  onClick={() => setDeleting(selected)}
                  className="mr-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700"
                >
                  Eliminar lectura
                </button>
              ) : null}
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
      {deleting ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-lg w-full bg-white rounded shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Eliminar lectura simbólica</h3>
            <p className="text-sm text-slate-700 mb-4">Confirmación explícita: esta acción elimina definitivamente el registro.</p>
            <div className="text-right">
              <button onClick={() => setDeleting(null)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm mr-2">Cancelar</button>
              <button
                onClick={async () => {
                  const it = deleting;
                  if (!it) return;
                  try {
                    const token = getAuthToken();
                    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) };
                    const base = getApiBaseUrl();
                    const id = it.id || it.reading_id;
                    if (!id) throw new Error('Invalid id');
                    const res = await fetch(`${base}/swm-v3/symbolic-readings/${id}/`, { method: 'DELETE', headers });
                    if (!res.ok) {
                      let err = await res.json().catch(() => null);
                      toast.error('Error', err?.error || 'No se pudo eliminar la lectura.');
                      setDeleting(null);
                      return;
                    }
                    // remove from list
                    setItems((prev) => prev.filter((x) => (x.id || x.reading_id) !== id));
                    setDeleting(null);
                    // close viewer if deleting selected
                    if (selected && ((selected.id || selected.reading_id) === id)) setSelected(null);
                    toast.showToast({ type: 'success', message: 'Lectura simbólica eliminada' });
                  } catch (e: any) {
                    toast.error('Error', e?.message || 'Error inesperado al eliminar');
                    setDeleting(null);
                  }
                }}
                className="rounded-md bg-red-600 text-white px-3 py-2 text-sm"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
