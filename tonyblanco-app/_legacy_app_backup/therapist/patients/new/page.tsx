'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, Copy, X } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import TherapistRoute from '@/components/TherapistRoute';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Credentials {
  username: string;
  password: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    birth_city: '',
    birth_country: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado al portapapeles', 'success');
    }).catch(() => {
      showToast('Error al copiar', 'error');
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        showToast('No estás autenticado. Por favor, inicia sesión.', 'error');
        router.push('/login');
        return;
      }

      // Construir URL de API correctamente
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      // Preparar datos para enviar
      const payload: any = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birth_date: formData.birth_date
      };

      // Agregar campos opcionales si tienen valor
      if (formData.birth_time.trim()) {
        payload.birth_time = formData.birth_time.trim();
      }
      if (formData.birth_place.trim()) {
        payload.birth_place = formData.birth_place.trim();
      }
      // Agregar birth_city y birth_country si están disponibles
      if (formData.birth_city.trim()) {
        payload.birth_city = formData.birth_city.trim();
      }
      if (formData.birth_country.trim()) {
        payload.birth_country = formData.birth_country.trim();
      }

      const response = await fetch(`${apiURL}/therapist/patients/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON recibida:', text.substring(0, 200));
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al crear el paciente');
      }

      // Guardar credenciales y mostrar modal
      if (data.credentials) {
        setCredentials(data.credentials);
        setPatientId(data.patient?.id || data.patient_id);
        setShowCredentialsModal(true);
      } else {
        // Fallback si no vienen credenciales
        showToast('Paciente creado exitosamente', 'success');
        setTimeout(() => {
          router.push(`/therapist/patients/${data.patient_id || data.patient?.id}`);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Error creating patient:', error);
      let errorMessage = 'Error al crear el paciente. Por favor, intenta de nuevo.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor Django esté corriendo.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGoToPatient = () => {
    if (patientId) {
      router.push(`/therapist/patients/${patientId}`);
    } else {
      router.push('/dashboard/therapist');
    }
  };

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/therapist')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Nuevo Ingreso - Ficha Holística</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Registra un nuevo paciente y genera sus credenciales de acceso
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {/* Form Grid - 2 Columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda - Datos Contacto */}
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Datos de Contacto
                    </h2>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 ${
                          errors.first_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Juan"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 ${
                          errors.last_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Pérez García"
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="juan@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono <span className="text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha - Datos Energéticos */}
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Datos Energéticos
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Importantes para la Carta Astral Cabalística
                    </p>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="birth_date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.birth_date ? 'border-red-300' : 'border-gray-300'
                        }`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {errors.birth_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                    )}
                  </div>

                  {/* Hora de Nacimiento */}
                  <div>
                    <label htmlFor="birth_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Nacimiento <span className="text-purple-600 text-xs">(Importante para Carta Astral)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="birth_time"
                        name="birth_time"
                        value={formData.birth_time}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Si no conoces la hora exacta, puedes dejarlo en blanco
                    </p>
                  </div>

                  {/* Lugar de Nacimiento */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Lugar de Nacimiento
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          id="birth_city"
                          name="birth_city"
                          value={formData.birth_city}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                          placeholder="Ciudad (ej: Madrid)"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          id="birth_country"
                          name="birth_country"
                          value={formData.birth_country}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                          placeholder="País (ej: España)"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-amber-500">💡</span>
                      Ingresa la ciudad y las coordenadas se calcularán automáticamente. Puedes editarlas manualmente si lo necesitas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Se generarán automáticamente un nombre de usuario y una contraseña temporal 
                  para el paciente. Las credenciales se mostrarán después de crear la ficha.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/therapist')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Crear Ficha y Generar Credenciales
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Credenciales */}
        {showCredentialsModal && credentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Credenciales Generadas</h3>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-600">
                  Las credenciales del paciente han sido generadas. Compártelas de forma segura.
                </p>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={credentials.username}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.username)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copiar"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={credentials.password}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.password)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copiar"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleGoToPatient}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Ir a Ficha Clínica
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                toast.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes slide-in-from-bottom-4 {
            from {
              transform: translateY(16px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .animate-in.slide-in-from-bottom-4 {
            animation: slide-in-from-bottom-4 0.3s ease-out;
          }
        `}</style>
      </div>
    </TherapistRoute>
  );
}
