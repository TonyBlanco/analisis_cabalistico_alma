'use client';

import { useState } from 'react';

export default function PatientProfile() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  async function handleSave() {
    setStatus('saving');

    // Simulated save (v1 – no backend call)
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className={`px-4 py-2 rounded font-medium ${
              status === 'saving'
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : status === 'saved'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {status === 'saving' ? 'Guardando...' : status === 'saved' ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
