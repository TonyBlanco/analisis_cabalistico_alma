'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest, ExecuteTestResponse } from '@/lib/test-types';

export default function ExecuteTestPage() {
  const router = useRouter();
  const params = useParams();
  const testCode = params.code as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [result, setResult] = useState<ExecuteTestResponse | null>(null);
  const [error, setError] = useState('');
  
  // Form data
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [profileNombre, setProfileNombre] = useState('');
  const [profileFechaNacimiento, setProfileFechaNacimiento] = useState('');
  const [persona2Nombre, setPersona2Nombre] = useState('');
  const [persona2Fecha, setPersona2Fecha] = useState('');
  const [clientName, setClientName] = useState('');
  const [saveResult, setSaveResult] = useState(true);
  const [isPersonalUser, setIsPersonalUser] = useState(false);
  
  // Cargar datos del usuario al montar
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/me/', {
            headers: {
              'Authorization': `Token ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            // Auto-completar con datos del perfil
              // Prefer birth_data if available (more complete)
              if (userData.birth_data && userData.birth_data.birth_date) {
                const nameFromProfile = userData.birth_data.full_name || userData.full_name || '';
                const birthFromProfile = userData.birth_data.birth_date || userData.birth_date || '';
                setNombre(nameFromProfile);
                setFechaNacimiento(birthFromProfile);
                setProfileNombre(nameFromProfile);
                setProfileFechaNacimiento(birthFromProfile);
                // If the user's birth data is locked, keep fields disabled
                if (userData.birth_data.is_locked) {
                  setIsPersonalUser(true);
                }
              } else {
                if (userData.full_name) {
                  setNombre(userData.full_name);
                  setProfileNombre(userData.full_name);
                }
                if (userData.birth_date) {
                  setFechaNacimiento(userData.birth_date);
                  setProfileFechaNacimiento(userData.birth_date);
                }
              }
            // Verificar si es usuario personal o si su birth_data está bloqueado
            setIsPersonalUser(
              (userData.user_type === 'personal') ||
                (!!userData.birth_data && !!userData.birth_data.is_locked)
            );
          }
        } catch (error) {
          console.error('Error cargando perfil:', error);
        }
      }
      setLoadingProfile(false);
    };
    
    loadUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const personalLocked = isPersonalUser && testCode === 'basic-analysis';

      const inputData: Record<string, any> = {
        nombre: personalLocked ? profileNombre : nombre,
        fecha_nacimiento: personalLocked ? profileFechaNacimiento : fechaNacimiento,
      };

      // Agregar datos adicionales según el tipo de test
      if (testCode === 'couple-compatibility') {
        inputData.persona1_nombre = nombre;
        inputData.persona1_fecha_nacimiento = fechaNacimiento;
        inputData.persona2_nombre = persona2Nombre;
        inputData.persona2_fecha_nacimiento = persona2Fecha;
      }

      const request: ExecuteTestRequest = {
        test_module_code: testCode,
        input_data: inputData,
        client_name: clientName || nombre,
        save_result: saveResult,
      };

      const response = await executeTest(request);
      setResult(response);
    } catch (err: any) {
      console.error('❌ Error ejecutando test:', err);
      console.error('Status:', err.status);
      console.error('Response:', err.response);
      
      // Mensaje de error más descriptivo
      let errorMessage = err.message || 'Error al ejecutar el test';
      
      if (err.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica que el servidor Django esté corriendo.';
      } else if (err.status === 401) {
        errorMessage = 'No autenticado. Por favor, inicia sesión nuevamente.';
      } else if (err.status === 403) {
        errorMessage = 'No tienes acceso a este test. Verifica tu suscripción.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    const personalLocked = isPersonalUser && testCode === 'basic-analysis';

    // Formulario para test de compatibilidad
    if (testCode === 'couple-compatibility') {
      return (
        <div className="space-y-6">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-400">👤 Persona 1</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="María García López"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-400">👤 Persona 2</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={persona2Nombre}
                  onChange={(e) => setPersona2Nombre(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Juan Pérez Martínez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={persona2Fecha}
                  onChange={(e) => setPersona2Fecha(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Formulario estándar para otros tests
    return (
      <div className="space-y-4">
        {personalLocked && nombre && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-300">
              ℹ️ <strong>Usuario Personal:</strong> Usarás tu nombre registrado: <strong>{nombre}</strong>
              <br />
              <span className="text-xs text-yellow-400 mt-1 block">
                Este nombre quedará guardado y se usará automáticamente en todos tus análisis
              </span>
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Nombre Completo</label>
          <input
            type="text"
            value={nombre}
                onChange={(e) => !personalLocked && setNombre(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none ${personalLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
            placeholder="Tu nombre completo"
                disabled={personalLocked}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
                {personalLocked 
                  ? 'Tu nombre está bloqueado como usuario personal' 
              : 'Usa tu nombre completo tal como aparece en tu documento oficial'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            value={fechaNacimiento}
                onChange={(e) => !personalLocked && setFechaNacimiento(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none ${personalLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={personalLocked}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
                {personalLocked && 'Tu fecha de nacimiento está guardada en tu perfil'}
          </p>
        </div>

        {!personalLocked && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del Cliente (opcional - para terapeutas)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Dejar vacío si es para ti"
            />
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!result || !result.result) return null;

    const data = result.result;

    return (
      <div className="space-y-6">
        {/* Encabezado de resultado */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✓</span>
            <h3 className="text-2xl font-bold text-green-400">Test Completado</h3>
          </div>
          <p className="text-gray-300">
            {data.nombre && `Análisis para: ${data.nombre}`}
          </p>
          {result.uses_remaining !== null && (
            <p className="text-sm text-gray-400 mt-2">
              Usos restantes este mes: {result.uses_remaining}
            </p>
          )}
        </div>

        {/* Números calculados */}
        {data.numeros && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4">📊 Números Calculados</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.numeros).map(([key, value]: [string, any]) => {
                if (typeof value === 'number') {
                  return (
                    <div key={key} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">{value}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {key.replace('_', ' ')}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Score de compatibilidad */}
        {data.compatibilidad && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4">💑 Compatibilidad</h4>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 rounded-full p-8">
                <p className="text-5xl font-bold">{data.compatibilidad.compatibilidad.score_total}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Interpretación con IA */}
        {data.interpretacion && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4">🔮 Interpretación Personalizada</h4>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.interpretacion}
              </div>
            </div>
          </div>
        )}

        {/* Orientación profesional */}
        {data.orientacion_profesional && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4">💼 Orientación Profesional</h4>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.orientacion_profesional}
              </div>
            </div>
          </div>
        )}

        {/* Camino espiritual */}
        {data.camino_espiritual && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4">🕉️ Camino Espiritual</h4>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.camino_espiritual}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/personal')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-lg font-semibold transition-colors"
          >
            ← Mi Dashboard
          </button>
          <button
            onClick={() => {
              setResult(null);
              if (!isPersonalUser) {
                setNombre('');
                setFechaNacimiento('');
              }
              setPersona2Nombre('');
              setPersona2Fecha('');
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Realizar Otro Test
          </button>
          <button
            onClick={() => router.push('/tests')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Ver Todos los Tests
          </button>
        </div>
      </div>
    );
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tu información...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ejecutar Test</h1>
          <p className="text-gray-400">Completa la información para generar tu análisis</p>
        </div>

        {/* Formulario o Resultado */}
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveResult"
                checked={saveResult}
                onChange={(e) => setSaveResult(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="saveResult" className="text-sm text-gray-400">
                Guardar resultado en mi historial
              </label>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Generando análisis con IA...
                </span>
              ) : (
                'Generar Análisis'
              )}
            </button>
          </form>
        ) : (
          renderResult()
        )}
      </div>
    </div>
  );
}
