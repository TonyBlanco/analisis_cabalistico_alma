import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { updatePatientProfile } from '@/lib/api';

interface PatientProfile {
  full_name?: string | null;
  legal_full_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
  birth_timezone?: string | null;
  biologicalSex?: 'male' | 'female' | 'intersex' | 'unknown' | 'not_recorded';
  genderIdentity?: 'woman' | 'man' | 'non_binary' | 'other' | 'prefer_not_to_say' | 'not_recorded';
  coordinates_valid?: boolean;
}

interface PatientProfileEditorProps {
  profile: PatientProfile | null;
  patientId: string;
  onSave: () => void;
  onClose: () => void;
  initialFocus?: string | null;
}

export default function PatientProfileEditor({ profile, patientId, onSave, onClose, initialFocus = null }: PatientProfileEditorProps) {
  const [mounted, setMounted] = useState(false);
  const initialName = useMemo(() => {
    const full = typeof profile?.full_name === 'string' ? profile?.full_name?.trim() : '';
    const legal = profile?.legal_full_name?.trim();
    // Therapist edits Patient.full_name primarily; legal_full_name is secondary (account).
    return full || legal || '';
  }, [profile?.legal_full_name, profile?.full_name]);

  const [formData, setFormData] = useState(() => ({
    full_name: initialName,
    birth_date: profile?.birth_date || '',
    birth_time: profile?.birth_time || '',
    birth_city: profile?.birth_city || '',
    birth_country: profile?.birth_country || '',
    biologicalSex: profile?.biologicalSex || 'not_recorded',
    genderIdentity: profile?.genderIdentity || 'not_recorded',
  }));
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const birthDateRef = useRef<HTMLInputElement | null>(null);
  const birthTimeRef = useRef<HTMLInputElement | null>(null);
  const birthCityRef = useRef<HTMLInputElement | null>(null);
  const birthCountryRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!initialFocus) return;
    setFocusedField(initialFocus);
    const map: Record<string, React.RefObject<HTMLInputElement | null>> = {
      full_name: nameRef,
      legal_full_name: nameRef,
      birth_date: birthDateRef,
      birth_time: birthTimeRef,
      birth_city: birthCityRef,
      birth_country: birthCountryRef,
    };
    const ref = map[initialFocus as string];
    if (ref && ref.current) {
      ref.current.focus();
      try { ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      // remove highlight after a short time
      const t = setTimeout(() => setFocusedField(null), 3000);
      return () => clearTimeout(t);
    }
  }, [initialFocus]);

  useEffect(() => {
    setFormData({
      full_name: initialName,
      birth_date: profile?.birth_date || '',
      birth_time: profile?.birth_time || '',
      birth_city: profile?.birth_city || '',
      birth_country: profile?.birth_country || '',
      biologicalSex: profile?.biologicalSex || 'not_recorded',
      genderIdentity: profile?.genderIdentity || 'not_recorded',
    });
  }, [patientId, initialName, profile?.birth_city, profile?.birth_country, profile?.birth_date, profile?.birth_time, profile?.biologicalSex, profile?.genderIdentity]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.full_name?.trim()) {
        setError('El nombre completo es obligatorio');
        return;
      }
      if (!formData.birth_date) {
        setError('La fecha de nacimiento es obligatoria');
        return;
      }

      const id = Number(patientId);
      if (!Number.isInteger(id) || id <= 0) {
        setError('Invalid patient id (expected numeric patient id).');
        return;
      }

      await updatePatientProfile(id, {
        full_name: formData.full_name.trim(),
        // Keep linked UserProfile consistent when patient has an account
        legal_full_name: formData.full_name.trim(),
        birth_date: formData.birth_date,
        birth_time: formData.birth_time || undefined,
        birth_city: formData.birth_city || undefined,
        birth_country: formData.birth_country || undefined,
        biologicalSex: formData.biologicalSex || undefined,
        genderIdentity: formData.genderIdentity || undefined,
      });

      onSave(); // Trigger refresh
      setFocusedField(null);
      onClose(); // Close modal
    } catch (err) {
      // Prefer Error.message, but try to extract structured API info when available
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === 'object') {
        const status = (err as any).status;
        const resp = (err as any).response || {};
        const msg = resp.message || resp.detail || resp.error || JSON.stringify(resp) || `Error ${status || ''}`;
        setError(msg);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[calc(100svh-2rem)] flex flex-col">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo biológico</label>
              <select
                value={formData.biologicalSex}
                onChange={(e) => handleChange('biologicalSex', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not_recorded">Sin registro</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="intersex">Intersexual</option>
                <option value="unknown">Desconocido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Identidad de género</label>
              <select
                value={formData.genderIdentity}
                onChange={(e) => handleChange('genderIdentity', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not_recorded">Sin registro</option>
                <option value="woman">Mujer</option>
                <option value="man">Hombre</option>
                <option value="non_binary">No binaria</option>
                <option value="other">Otra</option>
                <option value="prefer_not_to_say">Prefiere no decirlo</option>
              </select>
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
              <input
                ref={nameRef}
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'full_name' ? 'ring-2 ring-indigo-300' : ''}`}
                placeholder="Nombre y apellido"
              />
              {profile?.legal_full_name && profile.legal_full_name !== (profile?.full_name ?? '') && (
                <p className="mt-1 text-xs text-gray-500">
                  Nombre legal (cuenta): {profile.legal_full_name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input
                  ref={birthDateRef}
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_date' ? 'ring-2 ring-indigo-300' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de nacimiento</label>
                <input
                  ref={birthTimeRef}
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => handleChange('birth_time', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_time' ? 'ring-2 ring-indigo-300' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad de nacimiento</label>
                <input
                  ref={birthCityRef}
                  type="text"
                  value={formData.birth_city}
                  onChange={(e) => handleChange('birth_city', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_city' ? 'ring-2 ring-indigo-300' : ''}`}
                  placeholder="Ej: Madrid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">País de nacimiento</label>
                <input
                  ref={birthCountryRef}
                  type="text"
                  value={formData.birth_country}
                  onChange={(e) => handleChange('birth_country', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_country' ? 'ring-2 ring-indigo-300' : ''}`}
                  placeholder="Ej: España"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitud (auto)</label>
                <input
                  type="text"
                  value={profile?.birth_latitude ?? ''}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitud (auto)</label>
                <input
                  type="text"
                  value={profile?.birth_longitude ?? ''}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zona horaria (auto)</label>
                <input
                  type="text"
                  value={profile?.birth_timezone ?? ''}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Si cambias ciudad/país, el sistema recalcula coordenadas automáticamente.
            </p>
          </div>

          <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
    ,
    document.body
  );
}