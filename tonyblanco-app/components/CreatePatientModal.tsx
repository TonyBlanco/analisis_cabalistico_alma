'use client';

import { useState, useEffect } from 'react';
import DisclaimerModal from './DisclaimerModal';

import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

const API_URL = getApiBaseUrl();

/** Canales de envío de credenciales aceptados por el backend en send_via. */
type CredentialChannel = 'email' | 'telegram' | 'whatsapp';

interface PatientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  telegram: string;
  birth_date: string;
  send_via: CredentialChannel[];
}

interface CreatePatientPayload {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  phone?: string;
  telegram?: string;
  send_via: CredentialChannel[];
}

interface CreatePatientCredentials {
  username: string;
  password: string;
}

interface CreatePatientResponse {
  patient?: { id: number };
  credentials?: CreatePatientCredentials;
  email_sent?: boolean;
  telegram_sent?: boolean;
  telegram_link?: string;
  whatsapp_sent?: boolean;
  welcome_url?: string;
  message?: string;
  error?: string;
}

interface CreatePatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM: PatientFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  telegram: '',
  birth_date: '',
  send_via: ['email'],
};

const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

const CREDENTIAL_CHANNEL_OPTIONS: Array<{
  id: CredentialChannel;
  label: string;
  disabled?: boolean;
  hint?: string;
}> = [
  { id: 'email', label: 'Email' },
  { id: 'telegram', label: 'Telegram' },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    disabled: true,
    hint: '(próximamente)',
  },
];

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
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = useState<CreatePatientCredentials | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [telegramSent, setTelegramSent] = useState<boolean | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState<boolean | null>(null);
  const [welcomeUrl, setWelcomeUrl] = useState<string | null>(null);

  const resetFormState = () => {
    setFormData(INITIAL_FORM);
    setError(null);
    setFieldErrors({});
    setCreatedCredentials(null);
    setEmailSent(null);
    setTelegramSent(null);
    setTelegramLink(null);
    setWhatsappSent(null);
    setWelcomeUrl(null);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore clipboard errors
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open && !disclaimerAccepted) {
      setShowDisclaimer(true);
      setShowForm(false);
      resetFormState();
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

  const toggleCredentialChannel = (channel: CredentialChannel, checked: boolean) => {
    if (channel === 'whatsapp') return;

    setFormData((prev) => {
      const current = prev.send_via;
      let next: CredentialChannel[];
      if (checked) {
        next = current.includes(channel) ? current : [...current, channel];
      } else {
        next = current.filter((item) => item !== channel);
        if (next.length === 0) {
          next = ['email'];
        }
      }
      return { ...prev, send_via: next };
    });
  };

  const normalizeTelegramHandle = (value: string): string => value.trim().replace(/^@+/, '');

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

    const phone = formData.phone.trim();
    if (phone && !PHONE_PATTERN.test(phone)) {
      errors.phone = 'El teléfono no es válido';
    }

    const telegram = normalizeTelegramHandle(formData.telegram);
    if (formData.send_via.includes('telegram') && !telegram) {
      errors.telegram = 'El usuario de Telegram es requerido si eliges envío por Telegram';
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

    if (formData.send_via.length === 0) {
      errors.send_via = 'Selecciona al menos un canal de envío';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (): CreatePatientPayload => {
    const payload: CreatePatientPayload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      birth_date: formData.birth_date,
      send_via: formData.send_via.filter((channel) => channel !== 'whatsapp'),
    };

    const phone = formData.phone.trim();
    if (phone) {
      payload.phone = phone;
    }

    const telegram = normalizeTelegramHandle(formData.telegram);
    if (telegram) {
      payload.telegram = telegram;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const payload = buildPayload();

      const response = await fetch(`${API_URL}/therapist/patients/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CreatePatientResponse;

      if (!response.ok) {
        if (response.status === 400 && data) {
          const backendErrors: Record<string, string> = {};
          Object.keys(data).forEach((key) => {
            const value = (data as Record<string, unknown>)[key];
            if (Array.isArray(value)) {
              backendErrors[key] = String(value[0]);
            } else if (typeof value === 'string') {
              backendErrors[key] = value;
            }
          });
          setFieldErrors(backendErrors);
          setError('Por favor, corrige los errores en el formulario');
          return;
        }
        const errText = (data.error || data.message || '').toString();
        if (
          response.status === 400 &&
          (errText.toLowerCase().includes('email') || errText.toLowerCase().includes('registrado'))
        ) {
          setError(
            'Este email ya tiene cuenta en la plataforma. Usa «Vincular cuenta existente» en la lista de consultantes.',
          );
          return;
        }
        throw new Error(data.error || data.message || 'Error al crear consultante');
      }

      if (data.credentials) {
        setCreatedCredentials(data.credentials);
        setEmailSent(typeof data.email_sent === 'boolean' ? data.email_sent : null);
        setTelegramSent(typeof data.telegram_sent === 'boolean' ? data.telegram_sent : null);
        setTelegramLink(typeof data.telegram_link === 'string' ? data.telegram_link : null);
        setWhatsappSent(typeof data.whatsapp_sent === 'boolean' ? data.whatsapp_sent : null);
        setWelcomeUrl(typeof data.welcome_url === 'string' ? data.welcome_url : null);
      } else {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el consultante';
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
      resetFormState();
      onClose();
    }
  };

  const handleCredentialsDone = () => {
    onSuccess();
    handleClose();
  };

  const successSummary = () => {
    const wantsEmail = formData.send_via.includes('email');
    const wantsTelegram = formData.send_via.includes('telegram');

    if (wantsTelegram && telegramSent === true) {
      return 'Notificación enviada por Telegram.';
    }
    if (wantsTelegram && telegramLink) {
      return 'Comparte el enlace de Telegram con el consultante para activar el acceso.';
    }
    if (wantsEmail && emailSent === true) {
      return 'Credenciales enviadas por email.';
    }
    if (wantsEmail && emailSent === false) {
      return 'No se pudo enviar el email. Comparte el enlace de Telegram o las credenciales manualmente.';
    }
    if (whatsappSent === true) {
      return 'Credenciales enviadas también por WhatsApp.';
    }
    return 'Comparte las credenciales o el enlace de acceso con el consultante.';
  };

  // Reset disclaimer state when modal closes
  useEffect(() => {
    if (!open) {
      setShowDisclaimer(true);
      setDisclaimerAccepted(false);
      setShowForm(false);
      setCreatedCredentials(null);
      setEmailSent(null);
      setTelegramSent(null);
      setTelegramLink(null);
      setWhatsappSent(null);
      setWelcomeUrl(null);
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
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Consultante</h2>
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
                  ✓ Consultante creado exitosamente
                </p>
                <p className="text-sm text-green-700">{successSummary()}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Credenciales generadas:</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-700">Usuario: </span>
                      <span className="font-mono text-gray-900">{createdCredentials.username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.username)}
                      className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Copiar
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-700">Contraseña temporal: </span>
                      <span className="font-mono text-gray-900">{createdCredentials.password}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.password)}
                      className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                {formData.send_via.includes('telegram') && telegramLink && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-xs text-blue-900 font-medium mb-1">Enlace Telegram (recomendado)</p>
                    <p className="text-xs text-blue-800 break-all">{telegramLink}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(telegramLink)}
                      className="mt-2 text-xs text-blue-700 hover:text-blue-900 underline"
                    >
                      Copiar enlace Telegram
                    </button>
                    <p className="text-xs text-blue-700 mt-2">
                      El consultante abre el enlace, pulsa Iniciar en el bot y recibe credenciales al instante.
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  También puede entrar en https://studios33.app/login
                </p>
                {welcomeUrl && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(welcomeUrl)}
                    className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    Copiar enlace web de acceso
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleCredentialsDone}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Listo
              </button>
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
                  <label htmlFor="telegram" className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram
                  </label>
                  <input
                    id="telegram"
                    name="telegram"
                    type="text"
                    autoComplete="off"
                    placeholder="@usuario"
                    value={formData.telegram}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.telegram ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.telegram ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.telegram}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Opcional salvo que marques envío por Telegram. Se guarda sin @.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors ${
                      fieldErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.phone ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Formato internacional recomendado. Se guarda en la ficha del consultante.
                    </p>
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

                <fieldset className="border border-gray-200 rounded-md p-4">
                  <legend className="text-sm font-medium text-gray-700 px-1">
                    Enviar credenciales por
                  </legend>
                  <div className="mt-2 space-y-2">
                    {CREDENTIAL_CHANNEL_OPTIONS.map((option) => {
                      const checked = formData.send_via.includes(option.id);
                      const inputId = `credential-channel-${option.id}`;

                      return (
                        <label
                          key={option.id}
                          htmlFor={inputId}
                          className={`flex items-center gap-2 text-sm ${
                            option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
                          }`}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={checked}
                            disabled={option.disabled || loading}
                            onChange={(event) => toggleCredentialChannel(option.id, event.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400 disabled:opacity-50"
                          />
                          <span>
                            {option.label}
                            {option.hint ? ` ${option.hint}` : ''}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.send_via && (
                    <p className="mt-2 text-xs text-red-600">{fieldErrors.send_via}</p>
                  )}
                </fieldset>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Se generan usuario y contraseña temporal automáticamente.
                    {formData.send_via.includes('email') && ' Se enviará email si el servidor lo tiene activo.'}
                    {formData.send_via.includes('telegram') &&
                      ' El envío por Telegram quedará registrado; comparte credenciales manualmente hasta activar el bot.'}
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
                    {loading ? 'Creando consultante...' : 'Crear Consultante'}
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