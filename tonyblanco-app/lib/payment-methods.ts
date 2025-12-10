export type PaymentMethod = 'stripe' | 'bizum' | 'paypal';

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  recommended?: boolean;
  regions: string[];
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'bizum',
    name: 'Bizum',
    description: 'Pago instantáneo (solo España)',
    icon: '💳',
    available: true,
    recommended: true,
    regions: ['ES']
  },
  {
    id: 'stripe',
    name: 'Tarjeta',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    available: true,
    regions: ['ALL']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pago seguro internacional',
    icon: '🅿️',
    available: true,
    regions: ['ALL']
  }
];

export const BIZUM_CONFIG = {
  phone: '+34123456789', // ACTUALIZAR con tu número real
  email: 'membresia@tonyblanco.es',
  merchantId: process.env.NEXT_PUBLIC_BIZUM_MERCHANT_ID || '',
};

export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
};
