'use client';

import { useState, useEffect } from 'react';
import DisclaimerModal from './DisclaimerModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

interface CreatePatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Create Patient Modal with Mandatory Disclaimer
 * 
 * B) Create Patient Modal (Mandatory Flow)
 * STEP 1: Disclaimer Modal (must accept)
 * STEP 2: Patient Form (only after accepting disclaimer)
 */
export default function CreatePatientModal({
  open,
  onClose,
  onSuccess,
}: CreatePatientModalProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    birth_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open && !disclaimerAccepted) {
      setShowDisclaimer(true);
      setShowForm(false);
      setFormData({ first_name: '', last_name: '', email: '', birth_date: '' });
      setError(null);
      setFieldErrors({});
      setCreatedCredentials(null);
    }
  }, [open, disclaimerAccepted]);

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Los apellidos son requeridos';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.birth_date) {
      errors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        errors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        birth_date: formData.birth_date,
      };

      const response = await fetch(`${API_URL}/therapist/patients/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data) {
          const backendErrors: Record<string, string> = {};
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              backendErrors[key] = data[key][0];
            } else {
              backendErrors[key] = data[key];
            }
          });
          setFieldErrors(backendErrors);
          setError('Por favor, corrige los errores en el formulario');
          return;
        }
        throw new Error(data.error || data.message || 'Error al crear paciente');
      }

      // Success - show credentials
      if (data.credentials) {
        setCreatedCredentials(data.credentials);
        // Show credentials for a moment, then close and refresh
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el paciente';
      setError(errorMessage);
      console.error('Create patient error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setShowDisclaimer(true);
      setDisclaimerAccepted(false);
      setShowForm(false);
      setFormData({ first_name: '', last_name: '', email: '', birth_date: '' });
      setError(null);
      setFieldErrors({});
      setCreatedCredentials(null);
      onClose();
    }
  };

  // Reset disclaimer state when modal closes
  useEffect(() => {
    if (!open) {
      setShowDisclaimer(true);
      setDisclaimerAccepted(false);
      setShowForm(false);
      setCreatedCredentials(null);
    }
  }, [open]);

  if (!open) return null;

  // STEP 1: Disclaimer Modal
  if (showDisclaimer) {
    return (
      <DisclaimerModal
        open={true}
        type="patient_creation"
        onAccept={handleDisclaimerAccept}
        onCancel={handleClose}
        cancelable={true}
      />
    );
  }

  // STEP 2: Patient Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Paciente</h2>
              <p className="text-sm text-gray-600 mt-1">
                El sistema generará automáticamente el username y contraseña temporal
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message with Credentials */}
          {createdCredentials ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✓ Paciente creado exitosamente
                </p>
                <p className="text-sm text-green-700">
                  Las credenciales se han enviado por email al paciente.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Credenciales generadas:</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Usuario: </span>
                    <span className="font-mono text-gray-900">{createdCredentials.username}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contraseña temporal: </span>
                    <span className="font-mono text-gray-900">{createdCredentials.password}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Estas credenciales también se han enviado por email. El modal se cerrará automáticamente.
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                        fieldErrors.first_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                        fieldErrors.last_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.birth_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.birth_date && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.birth_date}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El sistema generará automáticamente un username único (formato: PAT-XXXX)
                    y una contraseña temporal segura. Las credenciales se enviarán al email del paciente.
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    {loading ? 'Creando paciente...' : 'Crear Paciente'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
