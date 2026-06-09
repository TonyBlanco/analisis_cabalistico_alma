// Configuración de planes de Stripe
export const STRIPE_PLANS = {
  // Planes para usuarios personales
  personal: {
    name: 'Análisis Personal',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL || '', // Configurar en deploy/env
    features: [
      'Árbol de la Vida completo',
      'Análisis de todos los números',
      'Interpretación detallada',
      'Guía de evolución personal',
      'Actualizaciones incluidas',
      'Acceso ilimitado'
    ],
    type: 'one_time'
  },

  // Planes para terapeutas
  therapist_professional: {
    name: 'Plan Profesional',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST_PRO || '',
    features: [
      'Hasta 30 pacientes activos',
      'Análisis ilimitados',
      'Historial completo de sesiones',
      'Exportación de reportes PDF',
      'Soporte prioritario'
    ],
    type: 'recurring',
    interval: 'month'
  },

  therapist_premium: {
    name: 'Plan Premium',
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST_PREMIUM || '',
    features: [
      'Pacientes ilimitados',
      'Análisis ilimitados',
      'Todas las funciones Pro',
      'API de integración',
      'Capacitación personalizada',
      'Soporte 24/7'
    ],
    type: 'recurring',
    interval: 'month'
  }
};

export type PlanType = keyof typeof STRIPE_PLANS;

export function getPlanDetails(planType: PlanType) {
  return STRIPE_PLANS[planType];
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
