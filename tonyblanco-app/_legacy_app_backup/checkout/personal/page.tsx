'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STRIPE_PLANS } from '@/lib/stripe-config';
import { PAYMENT_METHODS, PaymentMethod, BIZUM_CONFIG } from '@/lib/payment-methods';
import { createCheckoutSession } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

export default function PersonalCheckout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('bizum');
  const [showBizumInstructions, setShowBizumInstructions] = useState(false);

  const plan = STRIPE_PLANS.personal;

  const handleCheckout = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (selectedPayment === 'bizum') {
        // Mostrar instrucciones de Bizum
        setShowBizumInstructions(true);
        setLoading(false);
        return;
      }

      if (selectedPayment === 'paypal') {
        // Redirigir a PayPal (implementar después)
        setError('PayPal estará disponible próximamente');
        setLoading(false);
        return;
      }

      // Stripe checkout
      if (!plan.priceId) {
        throw new Error('Plan no configurado. Contacta soporte.');
      }

      const response = await createCheckoutSession({
        planType: 'personal',
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/checkout/cancel`
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4 text-[#A8DADC]">
            Tu Análisis Cabalístico Personal
          </h1>
          <p className="text-gray-300 body-font text-lg">
            Descubre tu camino a través del Árbol de la Vida
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Bizum Instructions Modal */}
        {showBizumInstructions && (
          <div className="mb-8 bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-[#A8DADC]">
            <h3 className="text-2xl title-font mb-6 text-[#A8DADC] text-center">
              Pagar con Bizum
            </h3>
            
            <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
              <p className="text-gray-300 body-font mb-4">
                Para completar tu pago de <strong className="text-[#A8DADC]">€{plan.price}</strong>:
              </p>
              
              <ol className="space-y-4 text-gray-300 body-font">
                <li className="flex items-start gap-3">
                  <span className="bg-[#A8DADC] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>Abre tu app bancaria y ve a Bizum</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#A8DADC] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>Selecciona "Enviar dinero"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#A8DADC] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <p>Envía a: <strong className="text-[#A8DADC]">{BIZUM_CONFIG.phone}</strong></p>
                    <p className="text-sm text-gray-400 mt-1">Concepto: "Análisis Personal - [tu email]"</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-[#A8DADC] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <span>Una vez enviado, recibirás confirmación por email en 24h</span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm body-font">
                ⚠️ <strong>Importante:</strong> Incluye tu email en el concepto para activar tu cuenta automáticamente.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowBizumInstructions(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all body-font"
              >
                Cambiar Método
              </button>
              <button
                onClick={() => {
                  // Enviar notificación al backend de intento de pago Bizum
                  router.push('/payment/pending');
                }}
                className="flex-1 px-6 py-3 bg-[#A8DADC] hover:bg-[#8ABDC0] text-slate-900 font-bold rounded-lg transition-all body-font"
              >
                Ya lo Envié
              </button>
            </div>
          </div>
        )}

        {/* Plan Card */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 mb-8">
          
          <div className="text-center mb-8">
            <div className="inline-block bg-[#A8DADC]/10 rounded-full px-4 py-2 mb-4">
              <span className="text-[#A8DADC] font-semibold body-font">Pago único</span>
            </div>
            <h3 className="text-3xl title-font mb-4 text-white">{plan.name}</h3>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-6xl font-bold text-[#A8DADC]">€{plan.price}</span>
            </div>
            <p className="text-gray-400 body-font">Acceso completo de por vida</p>
          </div>

          {/* Payment Method Selection */}
          {!showBizumInstructions && (
            <div className="border-t border-slate-700 pt-8 mb-8">
              <h4 className="text-xl font-semibold mb-4 text-center text-white title-font">
                Método de Pago:
              </h4>
              <div className="grid gap-4 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPayment === method.id
                        ? 'border-[#A8DADC] bg-[#A8DADC]/10'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{method.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-white body-font">{method.name}</h5>
                          {method.recommended && (
                            <span className="text-xs bg-[#A8DADC] text-black px-2 py-0.5 rounded-full font-bold">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 body-font">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 rounded-full bg-[#A8DADC] flex items-center justify-center">
                          <span className="text-black text-lg">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-700 pt-8 mb-8">
            <h4 className="text-xl font-semibold mb-6 text-center text-white title-font">
              Incluye:
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-300 body-font">
                  <span className="text-[#A8DADC] text-xl">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#A8DADC]/5 rounded-lg p-6 mb-8">
            <h4 className="font-semibold mb-3 text-white body-font">¿Qué obtendrás?</h4>
            <ul className="space-y-2 text-gray-300 body-font text-sm">
              <li>🌳 Árbol de la Vida personalizado con tus números</li>
              <li>📊 Análisis completo de tu personalidad y destino</li>
              <li>💡 Guía práctica para tu evolución espiritual</li>
              <li>🔮 Interpretaciones profundas basadas en Kabbalah</li>
              <li>📱 Acceso desde cualquier dispositivo</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
          >
            Volver
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`px-8 py-4 bg-gradient-to-r from-[#A8DADC] via-[#8ABDC0] to-[#6C9FA2] hover:from-[#8ABDC0] hover:to-[#A8DADC] text-slate-900 font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#A8DADC]/20 body-font ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Procesando...' : `Pagar €${plan.price} - Obtener Análisis`}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center text-gray-400 body-font text-sm">
          <p className="mb-4">🔒 Pago seguro procesado por Stripe</p>
          <p>✓ Satisfacción garantizada • ✓ Soporte incluido • ✓ Sin suscripciones</p>
        </div>
      </div>
    </div>
  );
}
