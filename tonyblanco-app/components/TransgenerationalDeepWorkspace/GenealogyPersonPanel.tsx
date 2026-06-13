'use client';

import { useState } from 'react';
import type { GenealogyPerson, GenealogyPersonPayload } from '@/lib/api/genealogy-api';
import { createPerson, deletePerson, updatePerson } from '@/lib/api/genealogy-api';

interface GenealogyPersonPanelProps {
  patientId: number;
  people: GenealogyPerson[];
  onChanged: () => void;
}

const BLANK_FORM: GenealogyPersonPayload = {
  generation: -1,
  relation: '',
  name: '',
  birth_year: null,
  death_year: null,
  notes: '',
  birth_order_number: null,
  is_deceased: false,
  is_abortion: false,
  side: null,
};

export default function GenealogyPersonPanel({
  patientId,
  people,
  onChanged,
}: GenealogyPersonPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GenealogyPersonPayload>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (person: GenealogyPerson) => {
    setEditingId(person.id);
    setForm({
      generation: person.generation,
      relation: person.relation,
      name: person.name,
      birth_year: person.birth_year,
      death_year: person.death_year,
      notes: person.notes,
      birth_order_number: person.birth_order_number,
      is_deceased: person.is_deceased,
      is_abortion: person.is_abortion,
      side: person.side,
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
    if (!form.relation.trim()) {
      setError('El campo Relación es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updatePerson(editingId, form);
      } else {
        await createPerson(patientId, form);
      }
      closeForm();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (personId: string) => {
    if (!confirm('¿Eliminar esta persona del árbol?')) return;
    try {
      await deletePerson(personId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar.');
    }
  };

  const setField = <K extends keyof GenealogyPersonPayload>(
    key: K,
    value: GenealogyPersonPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Personas del árbol</h3>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="text-xs font-medium text-gray-700 bg-gray-100 rounded-md px-2 py-1 hover:bg-gray-200"
          >
            + Añadir
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2"
        >
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {editingId ? 'Editar persona' : 'Nueva persona'}
          </p>

          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Relación *</label>
            <input
              type="text"
              value={form.relation}
              onChange={(e) => setField('relation', e.target.value)}
              placeholder="ej. madre, padre, abuelo paterno"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Generación</label>
              <input
                type="number"
                value={form.generation}
                onChange={(e) => setField('generation', parseInt(e.target.value, 10))}
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Rama</label>
              <select
                value={form.side ?? ''}
                onChange={(e) =>
                  setField('side', (e.target.value as 'paterno' | 'materno') || null)
                }
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="">—</option>
                <option value="paterno">Paterna</option>
                <option value="materno">Materna</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Año nac.</label>
              <input
                type="number"
                value={form.birth_year ?? ''}
                onChange={(e) =>
                  setField('birth_year', e.target.value ? parseInt(e.target.value, 10) : null)
                }
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Año fall.</label>
              <input
                type="number"
                value={form.death_year ?? ''}
                onChange={(e) =>
                  setField('death_year', e.target.value ? parseInt(e.target.value, 10) : null)
                }
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              Nº orden nacimiento (Armoni)
            </label>
            <input
              type="number"
              min={1}
              value={form.birth_order_number ?? ''}
              onChange={(e) =>
                setField(
                  'birth_order_number',
                  e.target.value ? parseInt(e.target.value, 10) : null,
                )
              }
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
            />
          </div>

          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_deceased}
                onChange={(e) => setField('is_deceased', e.target.checked)}
                className="rounded"
              />
              <span>Fallecida/o</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_abortion}
                onChange={(e) => setField('is_abortion', e.target.checked)}
                className="rounded"
              />
              <span>Aborto / bebé fallecido</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {people.length === 0 && !showForm ? (
        <p className="text-xs text-gray-500 py-2">
          Sin personas registradas. Añade la primera con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {p.name || '(Sin nombre)'}{' '}
                    <span className="text-gray-400 font-normal">· {p.relation}</span>
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    {p.generation === 0
                      ? 'Consultante'
                      : p.generation === -1
                      ? 'Padres'
                      : p.generation === -2
                      ? 'Abuelos'
                      : `Gen ${p.generation}`}
                    {p.side ? ` · ${p.side}` : ''}
                    {p.birth_order_number ? ` · #${p.birth_order_number}` : ''}
                  </p>
                  <div className="flex gap-2 mt-0.5">
                    {p.is_deceased && (
                      <span className="text-gray-400">fallecida/o</span>
                    )}
                    {p.is_abortion && (
                      <span className="text-gray-400">aborto/bebé</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-gray-400 hover:text-gray-700 px-1"
                    aria-label="Editar"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="text-gray-400 hover:text-red-600 px-1"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
