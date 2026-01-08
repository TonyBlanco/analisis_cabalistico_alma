"use client";

import React from 'react';
import { createTherapistNote } from '@/lib/therapist-notes-api';

export default function SendPatientNoteBlock({ patientId }: { patientId?: string | number | null }) {
  const normalizedPatientId =
    patientId === undefined || patientId === null || patientId === '' ? null : String(patientId);

  const [text, setText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const disabled = !normalizedPatientId;

  const handleSend = async () => {
    const trimmed = (text || '').trim();
    if (!trimmed || !normalizedPatientId) return;
    setSending(true);
    setMessage(null);
    try {
      await createTherapistNote({ patientId: Number(normalizedPatientId), title: '', content: trimmed });
      setText('');
      setMessage('Nota enviada');
      window.setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err?.message || 'Error al enviar la nota');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Enviar nota al paciente</h3>
      <p className="text-xs text-gray-500">Nota directa del terapeuta al paciente. No es chat.</p>

      {disabled ? (
        <p className="text-xs text-gray-600">Selecciona un consultante para enviar una nota.</p>
      ) : null}

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          disabled={disabled || sending}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
          placeholder="Escribe la nota para el paciente."
        />
        <div>
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || sending || !text.trim()}
            className="px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            {sending ? 'Enviando…' : 'Enviar nota'}
          </button>
        </div>
        {message ? <p className="text-xs text-green-600">{message}</p> : null}
      </div>
    </div>
  );
}
