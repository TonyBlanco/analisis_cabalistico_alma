import React, { useState, useEffect, useRef } from 'react';
import { updatePatientProfile, UserProfileData } from '@/lib/api';

interface PatientProfile {
  legal_full_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  latitude?: number;
  longitude?: number;
}

interface PatientProfileEditorProps {
  profile: PatientProfile | null;
  patientId: string;
  onSave: () => void;
  onClose: () => void;
  initialFocus?: string | null;
}

export default function PatientProfileEditor({ profile, patientId, onSave, onClose, initialFocus = null }: PatientProfileEditorProps) {
  const [formData, setFormData] = useState({
    legal_full_name: profile?.legal_full_name || '',
    birth_date: profile?.birth_date || '',
    birth_time: profile?.birth_time || '',
    birth_city: profile?.birth_city || '',
    birth_country: profile?.birth_country || '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const birthDateRef = useRef<HTMLInputElement | null>(null);
  const birthTimeRef = useRef<HTMLInputElement | null>(null);
  const birthCityRef = useRef<HTMLInputElement | null>(null);
  const birthCountryRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!initialFocus) return;
    setFocusedField(initialFocus);
    const map: Record<string, React.RefObject<HTMLInputElement | null>> = {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.legal_full_name?.trim()) {
        setError('Legal full name is required');
        return;
      }
      if (!formData.birth_date) {
        setError('Birth date is required');
        return;
      }

      const id = Number(patientId);
      if (!Number.isInteger(id) || id <= 0) {
        setError('Invalid patient id (expected numeric patient id).');
        return;
      }

      await updatePatientProfile(id, {
        legal_full_name: formData.legal_full_name.trim(),
        birth_date: formData.birth_date,
        birth_time: formData.birth_time || undefined,
        birth_city: formData.birth_city || undefined,
        birth_country: formData.birth_country || undefined,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Patient Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Full Name</label>
            <input
              ref={nameRef}
              type="text"
              value={formData.legal_full_name}
              onChange={(e) => handleChange('legal_full_name', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'legal_full_name' ? 'ring-2 ring-indigo-300' : ''}`}
              placeholder="Enter legal full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input
              ref={birthDateRef}
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_date' ? 'ring-2 ring-indigo-300' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Time</label>
            <input
              ref={birthTimeRef}
              type="time"
              value={formData.birth_time}
              onChange={(e) => handleChange('birth_time', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_time' ? 'ring-2 ring-indigo-300' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birth City</label>
            <input
              ref={birthCityRef}
              type="text"
              value={formData.birth_city}
              onChange={(e) => handleChange('birth_city', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_city' ? 'ring-2 ring-indigo-300' : ''}`}
              placeholder="Enter birth city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Country</label>
            <input
              ref={birthCountryRef}
              type="text"
              value={formData.birth_country}
              onChange={(e) => handleChange('birth_country', e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${focusedField === 'birth_country' ? 'ring-2 ring-indigo-300' : ''}`}
              placeholder="Enter birth country"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}