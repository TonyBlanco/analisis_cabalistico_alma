'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STRIPE_PLANS } from '@/lib/stripe-config';
import { PAYMENT_METHODS, PaymentMethod } from '@/lib/payment-methods';
import { createCheckoutSession } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

export default function TherapistCheckout() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'therapist_professional' | 'therapist_premium'>('therapist_professional');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const plan = STRIPE_PLANS[selectedPlan];
      
      if (!plan.priceId) {
        throw new Error('Plan no configurado. Contacta soporte.');
      }

      const response = await createCheckoutSession({
        planType: selectedPlan,
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

  const plans = [
    {
      id: 'therapist_professional' as const,
      ...STRIPE_PLANS.therapist_professional,
      recommended: true
    },
    {
      id: 'therapist_premium' as const,
      ...STRIPE_PLANS.therapist_premium,
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light title-font mb-4 text-[#D4AF37]">
            Elige tu Plan Profesional
          </h1>
          <p className="text-gray-300 body-font text-lg">
            Selecciona el plan que mejor se adapte a tu práctica terapéutica
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20'
                  : 'hover:bg-slate-800/70'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#D4AF37] text-black px-4 py-1 rounded-full text-sm font-bold">
                    Recomendado
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl title-font mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-[#D4AF37]">€{plan.price}</span>
                  <span className="text-gray-400 body-font">/mes</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300 body-font">
                    <span className="text-[#D4AF37] text-xl">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && (
                <div className="absolute inset-0 rounded-2xl border-2 border-[#D4AF37] pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Method Selection */}
        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-2xl title-font mb-4 text-center text-white">
            Método de Pago
          </h3>
          <div className="grid gap-4">
            {PAYMENT_METHODS.filter(m => m.id !== 'bizum').map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPayment === method.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{method.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white body-font">{method.name}</h5>
                    <p className="text-sm text-gray-400 body-font">{method.description}</p>
                  </div>
                  {selectedPayment === method.id && (
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <span className="text-black text-lg">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 body-font mt-4 text-center">
            💡 Suscripciones mensuales solo disponibles con tarjeta o PayPal
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 text-white font-semibold rounded-lg transition-all body-font"
          >
            Volver
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 body-font ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Procesando...' : 'Continuar al Pago'}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center text-gray-400 body-font text-sm">
          <p className="mb-4">🔒 Pago seguro procesado por Stripe</p>
          <p>Cancela en cualquier momento • Sin permanencia • Soporte incluido</p>
        </div>
      </div>
    </div>
  );
}
