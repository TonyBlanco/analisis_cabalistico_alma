'use client';

import { useState } from 'react';
import type { GenealogyEvent, GenealogyEventPayload, GenealogyPerson } from '@/lib/api/genealogy-api';
import { createEvent, deleteEvent, updateEvent } from '@/lib/api/genealogy-api';

interface GenealogyEventPanelProps {
  patientId: number;
  events: GenealogyEvent[];
  people: GenealogyPerson[];
  onChanged: () => void;
}

const BLANK_FORM: GenealogyEventPayload = {
  title: '',
  year: null,
  description: '',
  linked_people: [],
};

export default function GenealogyEventPanel({
  patientId,
  events,
  people,
  onChanged,
}: GenealogyEventPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GenealogyEventPayload>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (event: GenealogyEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      year: event.year,
      description: event.description,
      linked_people: event.linked_people,
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(BLANK_FORM);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('El título del evento es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateEvent(editingId, form);
      } else {
        await createEvent(patientId, form);
      }
      closeForm();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await deleteEvent(eventId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar.');
    }
  };

  const toggleLinkedPerson = (personId: string) => {
    setForm((prev) => ({
      ...prev,
      linked_people: prev.linked_people.includes(personId)
        ? prev.linked_people.filter((id) => id !== personId)
        : [...prev.linked_people, personId],
    }));
  };

  const setField = <K extends keyof GenealogyEventPayload>(
    key: K,
    value: GenealogyEventPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const sortedEvents = [...events].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Eventos observados</h3>
          <p className="text-xs text-gray-500">
            Registro manual. Sin inferencia ni generación automática.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-1.5 hover:bg-gray-200"
          >
            + Añadir evento
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4 space-y-3"
        >
          <p className="text-sm font-semibold text-gray-700">
            {editingId ? 'Editar evento' : 'Nuevo evento'}
          </p>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="ej. Emigración familiar, Pérdida de negocio"
              className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Año</label>
            <input
              type="number"
              value={form.year ?? ''}
              onChange={(e) =>
                setField('year', e.target.value ? parseInt(e.target.value, 10) : null)
              }
              className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm resize-none"
            />
          </div>

          {people.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Personas vinculadas</label>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.linked_people.includes(p.id)}
                      onChange={() => toggleLinkedPerson(p.id)}
                      className="rounded"
                    />
                    <span>{p.name || p.relation}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {sortedEvents.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Sin eventos registrados. Observacional — solo el terapeuta registra.
        </div>
      ) : (
        <ol className="space-y-3">
          {sortedEvents.map((ev) => {
            const linkedNames = ev.linked_people
              .map((id) => people.find((p) => p.id === id))
              .filter(Boolean)
              .map((p) => p!.name || p!.relation)
              .join(', ');

            return (
              <li
                key={ev.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      {ev.year && (
                        <span className="text-xs font-mono text-gray-400 shrink-0">
                          {ev.year}
                        </span>
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                    </div>
                    {ev.description && (
                      <p className="text-xs text-gray-600 mt-1">{ev.description}</p>
                    )}
                    {linkedNames && (
                      <p className="text-xs text-gray-400 mt-1">↳ {linkedNames}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(ev)}
                      className="text-gray-400 hover:text-gray-700 px-1 text-sm"
                      aria-label="Editar"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev.id)}
                      className="text-gray-400 hover:text-red-600 px-1 text-sm"
                      aria-label="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
