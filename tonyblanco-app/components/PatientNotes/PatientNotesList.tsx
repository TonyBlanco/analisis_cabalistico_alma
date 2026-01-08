"use client";

import React from 'react';
import { listTherapistNotes } from '@/lib/therapist-notes-api';

export default function PatientNotesList() {
  const [notes, setNotes] = React.useState<Array<{id: number|string; content: string; created_at: string}>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // listTherapistNotes with no patientId will return notes for current (authenticated) user
    listTherapistNotes()
      .then((data) => {
        if (cancelled) return;
        setNotes(
          data.map((n) => ({ id: n.id, content: (n.content || '').toString(), created_at: (n.created_at || '') as string })),
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'No se pudieron cargar los mensajes');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-gray-600 text-sm">Cargando mensajes…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;

  if (notes.length === 0) return <p className="text-gray-600 text-sm">No hay mensajes nuevos en este momento.</p>;

  return (
    <div className="space-y-3">
      {notes.map((n) => (
        <div key={String(n.id)} className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="whitespace-pre-line">{n.content}</p>
          <p className="mt-2 text-xs text-gray-500">{new Date(n.created_at).toLocaleString('es-ES')}</p>
        </div>
      ))}
    </div>
  );
}
