'use client';

import { useState, useEffect } from 'react';
import { TESTS_DB } from '@/data/tests-questions';
import { ANGELS_SPANISH } from '@/data/angels-translations';
import { getAuthToken, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import TherapeuticConsentModal from '@/components/TherapeuticConsentModal';

interface GenericTestProps {
  testId: string;
}

interface TestResult {
  score: number;
  diagnosis: string;
  sefira: string;
  angel: string;
  angel_meditation_key: string;
  kabbalah: {
    test_name: string;
    organo_ref_id: string;
    concepto_clave_id: string;
    angel_remedio_idx: number;
    bio_desc: string;
  };
  test_result_id?: number;
}

export default function GenericTest({ testId }: GenericTestProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  
  // Verificar si el usuario está logueado
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    
    // Verificar si ya aceptó el consentimiento
    const consent = localStorage.getItem('therapeuticConsent');
    if (consent) {
      try {
        const consentData = JSON.parse(consent);
        // Verificar que el consentimiento no sea muy antiguo (30 días)
        const consentDate = new Date(consentData.timestamp);
        const daysSinceConsent = (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceConsent < 30) {
          setConsentAccepted(true);
        }
      } catch (e) {
        // Si hay error parseando, mostrar consentimiento
      }
    }
    
    // Si no hay consentimiento, mostrarlo cuando se monte el componente
    if (!consent && !result) {
      setShowConsent(true);
    }
  }, []);

  // Cargar configuración del test
  const testConfig = TESTS_DB[testId];

  // Validar que el test existe
  if (!testConfig) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Test no encontrado
          </h2>
          <p className="text-red-600">
            El test con ID "{testId}" no está disponible en la base de datos.
          </p>
        </div>
      </div>
    );
  }

  // Inicializar respuestas si no están inicializadas
  if (answers.length === 0 && testConfig.questions.length > 0) {
    setAnswers(new Array(testConfig.questions.length).fill(-1));
  }

  const handleAnswerChange = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todas las preguntas estén respondidas
    if (answers.some((answer) => answer === -1)) {
      setError('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Usar variable de entorno de producción o fallback a Render
      // La URL base puede incluir /api o no, manejamos ambos casos
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com';
      let API_URL = baseUrl;
      
      // Si la URL base no termina en /api, agregarlo
      if (!baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
        API_URL = `${baseUrl}/api`;
      }
      
      // Obtener token de autenticación si existe
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Agregar token de autenticación si el usuario está logueado
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(`${API_URL}/tests/submit/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          test_id: testId,
          answers: answers,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Error al procesar el test';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: TestResult = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet o que el servidor esté disponible.');
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al procesar el test');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si hay resultados, mostrar solo los resultados
  if (result) {
    // Buscar el ángel en las traducciones usando la clave de meditación
    const angelName = result.angel_meditation_key?.trim() || result.angel?.trim();
    const angelData = angelName 
      ? ANGELS_SPANISH[angelName] || ANGELS_SPANISH[angelName.charAt(0).toUpperCase() + angelName.slice(1)]
      : null;

    // Si el usuario no está logueado, mostrar versión simplificada para visitantes
    if (!isLoggedIn) {
      return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Mensaje de bienvenida para visitantes */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-2">✨ Tu Análisis del Alma</h2>
            <p className="text-purple-100">Has completado el test. Aquí está tu guía espiritual personalizada.</p>
          </div>

          {/* Tarjeta del Ángel - Versión simplificada y positiva */}
          <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-amber-50 border-2 border-purple-300 rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">Tu Ángel Guía</h2>
              <p className="text-4xl font-bold text-amber-700 mb-1">{result.angel}</p>
              {angelData?.name?.he && (
                <p className="text-xl text-purple-700 font-semibold">{angelData.name.he}</p>
              )}
            </div>

            {angelData && (
              <div className="space-y-6">
                {angelData.attribute?.es && (
                  <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2 text-lg">Atributo Divino</h3>
                    <p className="text-purple-700 text-lg italic">"{angelData.attribute.es}"</p>
                  </div>
                )}

                {angelData.meditation?.es && (
                  <div className="bg-white/70 rounded-lg p-6 border border-violet-200">
                    <h3 className="font-semibold text-violet-800 mb-4 flex items-center gap-2 text-xl">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Tu Meditación Personal
                    </h3>
                    <p className="text-violet-700 leading-relaxed whitespace-pre-line text-lg">
                      {angelData.meditation.es}
                    </p>
                  </div>
                )}

                {angelData.invocation?.es && (
                  <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">Invocación</h3>
                    <p className="text-amber-700 italic text-lg">"{angelData.invocation.es}"</p>
                  </div>
                )}
              </div>
            )}

            {!angelData && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-5 text-center">
                <p className="text-amber-800 leading-relaxed">
                  Tu ángel guía <strong>{result.angel}</strong> está aquí para ayudarte en tu camino.
                  Conecta con su energía a través de la meditación y la intención.
                </p>
              </div>
            )}
          </div>

          {/* CTA para registrarse */}
          <div className="bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] rounded-xl p-8 text-center shadow-2xl transform hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold text-black mb-3">🌟 Guarda tu Progreso</h3>
            <p className="text-black/80 mb-6 text-lg">
              Para guardar tus resultados, acceder a tu historial completo y hablar con un terapeuta profesional,
              <br />
              <strong>regístrate gratis ahora</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register/personal')}
                className="px-8 py-4 bg-black text-[#D4AF37] font-bold rounded-lg hover:bg-gray-900 transition-all shadow-lg text-lg"
              >
                Crear Cuenta Gratis
              </button>
              <button
                onClick={() => router.push('/register/therapist')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-black font-bold rounded-lg hover:bg-white/30 transition-all border-2 border-black/20 text-lg"
              >
                Soy Terapeuta
              </button>
            </div>
            <p className="text-black/70 mt-4 text-sm">
              ✓ Sin tarjeta de crédito • ✓ Acceso inmediato • ✓ Resultados ilimitados
            </p>
          </div>

          {/* Botón para volver a realizar el test */}
          <div className="text-center">
            <button
              onClick={() => {
                setResult(null);
                setAnswers(new Array(testConfig.questions.length).fill(-1));
                setError(null);
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Realizar Test Nuevamente
            </button>
          </div>
        </div>
      );
    }

    // Versión completa para usuarios logueados
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tarjeta Azul - Diagnóstico Clínico */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Diagnóstico Clínico</h2>
          </div>
            <div className="space-y-3">
            <div className="flex items-baseline gap-4">
              <span className="text-blue-700 font-semibold text-lg">Score Bruto:</span>
              <span className="text-3xl font-bold text-blue-900">{result.score}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-blue-700 font-semibold text-lg">Diagnóstico:</span>
              <span className="text-xl font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-lg">
                {result.diagnosis}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta Violeta/Dorada - Análisis del Alma */}
        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-amber-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-purple-900">Análisis del Alma</h2>
          </div>

          <div className="space-y-6">
            {/* Información de la Sefirá */}
            <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Sefirá Afectada</h3>
              <p className="text-lg font-bold text-purple-900 mb-2">
                {result.sefira}
              </p>
              <p className="text-purple-700 mb-2">
                <span className="font-semibold">Test:</span>{' '}
                {result.kabbalah.test_name}
              </p>
              <p className="text-purple-700 mb-2">
                <span className="font-semibold">Concepto Clave:</span>{' '}
                {result.kabbalah.concepto_clave_id}
              </p>
              <p className="text-purple-700 mb-2">
                <span className="font-semibold">Órgano Relacionado:</span>{' '}
                {result.kabbalah.organo_ref_id}
              </p>
              <p className="text-purple-700">
                <span className="font-semibold">Descripción Bioenergética:</span>{' '}
                {result.kabbalah.bio_desc}
              </p>
            </div>

            {/* Información del Ángel Remedio */}
            <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Ángel Remedio</h3>
              <p className="text-2xl font-bold text-amber-900 mb-1">
                {result.angel}
              </p>
              {angelData && (
                <>
                  {angelData.name?.he && (
                    <p className="text-amber-700 mb-2">
                      <span className="font-semibold">Nombre Hebreo:</span>{' '}
                      {angelData.name.he}
                    </p>
                  )}
                  {angelData.attribute?.es && (
                    <p className="text-amber-700">
                      <span className="font-semibold">Atributo:</span>{' '}
                      {angelData.attribute.es}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Meditación del Ángel */}
            {angelData && (
              <div className="bg-white/60 rounded-lg p-4 border border-violet-200">
                <h3 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Meditación del Ángel
                </h3>
                <p className="text-violet-700 leading-relaxed whitespace-pre-line">
                  {angelData.meditation.es}
                </p>
              </div>
            )}

            {!angelData && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Información del Ángel en Desarrollo
                    </h4>
                    <p className="text-amber-800 leading-relaxed">
                      La meditación para el ángel <strong>{result.angel}</strong> está siendo preparada. 
                      Mientras tanto, puedes trabajar con su energía y conectar a través de la Sefirá {result.sefira}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón para volver a realizar el test */}
        <div className="text-center">
          <button
            onClick={() => {
              setResult(null);
              setAnswers(new Array(testConfig.questions.length).fill(-1));
              setError(null);
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Realizar Test Nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Mostrar modal de consentimiento si no ha sido aceptado
  if (showConsent && !consentAccepted) {
    return (
      <TherapeuticConsentModal
        isOpen={showConsent}
        onAccept={() => {
          setConsentAccepted(true);
          setShowConsent(false);
        }}
        onClose={() => {
          router.push('/tests');
        }}
        type="test"
      />
    );
  }

  // Mostrar formulario de preguntas
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{testConfig.title}</h1>
        <p className="text-gray-600">{testConfig.description}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {testConfig.questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {index + 1}. {question.text}
            </h3>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[index] === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option.value}
                    checked={answers[index] === option.value}
                    onChange={() => handleAnswerChange(index, option.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || answers.some((answer) => answer === -1)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg"
          >
            {isSubmitting ? 'Procesando...' : 'Enviar Test'}
          </button>
        </div>
      </form>
    </div>
  );
}

