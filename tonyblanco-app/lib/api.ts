// API Configuration and Utilities
import { getApiBaseUrl } from './api-base';

export { apiUrl, getApiBaseUrl } from './api-base';

const API_URL = getApiBaseUrl();

// Exportar como API_BASE_URL para compatibilidad
export const API_BASE_URL = API_URL;

// Type definitions for API responses
export interface UserProfile {
  id?: number;
  full_name?: string;
  username?: string;
  email?: string;
  birth_date?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'therapist' | 'personal' | 'patient' | 'visitor';
}

export interface Service {
  id: number;
  slug: string;
  name: string;
  category: number;
  category_name: string;
  service_type: string;
  short_description: string;
  full_description: string;
  benefits: string[];
  includes: string[];
  price_usd: number;
  price_eur: number;
  has_discount: boolean;
  discount_price_usd?: number;
  discount_price_eur?: number;
  discount_label?: string;
  duration_value: number;
  duration_type: string;
  duration_display: string;
  is_active: boolean;
  requires_booking: boolean;
  max_participants?: number;
  platform: string;
  is_featured: boolean;
  is_bestseller: boolean;
  price_display: {
    usd: {
      original: number;
      current: number;
      has_discount: boolean;
      discount_label?: string;
    };
    eur: {
      original: number;
      current: number;
      has_discount: boolean;
      discount_label?: string;
    };
  };
}

export interface ServiceCategory {
  id: number;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  order: number;
  is_active: boolean;
  services_count: number;
}

export interface Booking {
  id: number;
  service?: number;
  package?: number;
  service_name: string;
  scheduled_date?: string;
  timezone: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_notes: string;
  currency: 'USD' | 'EUR';
  amount_paid: number;
  payment_method: 'stripe' | 'paypal' | 'bizum' | 'transfer';
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'rescheduled';
  meeting_link?: string;
  created_at: string;
}

export interface Test {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  target_user_type: string;
  estimated_time: number;
  instructions: string;
  is_free: boolean;
  is_popular: boolean;
  is_active: boolean;
  benefits?: string[];
  has_access?: boolean;
  requires_personal_data?: boolean;
}

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

/** Canonical DRF TokenAuthentication headers for manual fetch calls. */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Token ${token}` } : {};
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// Generic fetch wrapper with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  console.log('🌐 API Request:', { url, method: options.method || 'GET', hasToken: !!token });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('✅ API Response:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const responseClone = response.clone();
      let rawText: string | null = null;
      // Intentar parsear JSON; si falla, recuperar texto crudo
      let error: any = {};
      try {
        error = await response.json();
      } catch (jsonErr) {
        const text = await responseClone.text().catch(() => null);
        rawText = text;
        if (text) {
          try {
            error = JSON.parse(text);
          } catch (_) {
            error = { raw: text };
          }
        } else {
          error = {};
        }
      }

      // Log para debugging incluyendo URL y status text
      console.error('❌ API Error:', {
        url,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        error,
        raw: rawText ? rawText.slice(0, 500) : null,
      });

      // Construir mensaje útil con varios fallback
      const fallbackStatus = response.statusText ? `${response.statusText}` : 'Request failed';
      const errorMsg =
        error?.message ||
        error?.detail ||
        error?.error ||
        (typeof error === 'string' ? error : null) ||
        (Object.keys(error || {}).length ? JSON.stringify(error) : null) ||
        (rawText ? rawText : null) ||
        `HTTP ${response.status}: ${fallbackStatus}`;
      const errorWithResponse = new Error(errorMsg);
      (errorWithResponse as any).status = response.status;
      (errorWithResponse as any).response = { ...error, raw: rawText };
      throw errorWithResponse;
    }

    return response.json();
  } catch (err: any) {
    // Already handled errors
    if (err.status) {
      throw err;
    }
    
    // Network errors (CORS, timeout, etc.)
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      const errorMsg = `No se pudo conectar con el servidor. Verifica tu conexión.`;
      console.error('🔌 Network Error:', errorMsg);
      const networkError = new Error(errorMsg);
      (networkError as any).status = 0;
      throw networkError;
    }
    throw err;
  }
}

// ========== AUTH API ==========

export const registerTherapist = async (
  data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    profession: string;
    specialization?: string;
    license_number?: string;
    years_of_experience: number;
    phone: string;
  },
  turnstileToken?: string | null
): Promise<RegisterResponse> => {
  const body = { ...data } as Record<string, unknown>;
  if (turnstileToken) body.turnstile_token = turnstileToken;
  return apiRequest<RegisterResponse>('/register/therapist/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const registerPersonal = async (
  data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    birth_date?: string;
  },
  turnstileToken?: string | null
): Promise<RegisterResponse> => {
  const body = { ...data } as Record<string, unknown>;
  if (turnstileToken) body.turnstile_token = turnstileToken;
  return apiRequest<RegisterResponse>('/register/personal/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const login = async (
  username: string,
  password: string,
  turnstileToken?: string | null
): Promise<LoginResponse> => {
  const body: Record<string, string> = { username, password };
  if (turnstileToken) {
    body.turnstile_token = turnstileToken;
  }
  return apiRequest<LoginResponse>('/login/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export interface GoogleLoginResponse extends LoginResponse {
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    full_name?: string;
    user_type?: string;
    is_admin?: boolean;
  };
  created?: boolean;
  message?: string;
}

export const loginWithGoogle = async (
  googleIdToken: string,
  registrationIntent?: 'personal' | 'therapist'
): Promise<GoogleLoginResponse> => {
  const body: { token: string; registration_intent?: string } = { token: googleIdToken };
  if (registrationIntent) {
    body.registration_intent = registrationIntent;
  }
  return apiRequest<GoogleLoginResponse>('/login/google/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>('/me/');
};

// Nota: el backend aún no expone un endpoint público documentado para
// recuperación de contraseña. Este helper asume un posible endpoint
// `/password-reset/` y permite que el frontend compile; si el backend no lo
// implementa devolverá un error manejable en la UI.
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// ========== SERVICES API ==========

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  return apiRequest<ServiceCategory[]>('/services/categories/');
};

export const getServices = async (params?: {
  category?: string;
  type?: string;
  featured?: boolean;
}): Promise<Service[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.featured) queryParams.append('featured', 'true');
  
  const query = queryParams.toString();
  return apiRequest<Service[]>(`/services/${query ? `?${query}` : ''}`);
};

export const getService = async (slug: string): Promise<Service> => {
  return apiRequest<Service>(`/services/${slug}/`);
};

export const getTests = async (): Promise<Test[]> => {
  const response = await apiRequest<{ tests: Test[] }>('/tests/');
  return response.tests;
};

// ========== BOOKINGS API ==========

export const createBooking = async (data: {
  service?: number;
  package?: number;
  scheduled_date?: string;
  timezone: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_notes?: string;
  currency: 'USD' | 'EUR';
  payment_method: 'stripe' | 'paypal' | 'bizum' | 'transfer';
}): Promise<Booking> => {
  return apiRequest<Booking>('/bookings/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getUserBookings = async (): Promise<Booking[]> => {
  return apiRequest<Booking[]>('/bookings/');
};

export const getBooking = async (id: number): Promise<Booking> => {
  return apiRequest<Booking>(`/bookings/${id}/`);
};

// ========== AVAILABLE SLOTS API ==========

export const getAvailableSlots = async (params?: {
  day?: number;
  service?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.day !== undefined) queryParams.append('day', params.day.toString());
  if (params?.service) queryParams.append('service', params.service.toString());
  
  const query = queryParams.toString();
  return apiRequest(`/availability/slots/${query ? `?${query}` : ''}`);
};

export const getBlockedDates = async (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  
  const query = queryParams.toString();
  return apiRequest(`/availability/blocked/${query ? `?${query}` : ''}`);
};

export default {
  // Auth
  registerTherapist,
  registerPersonal,
  login,
  getCurrentUser,
  // Services
  getServiceCategories,
  getServices,
  getService,
  // Tests
  getTests,
  // Bookings
  createBooking,
  getUserBookings,
  getBooking,
  // Availability
  getAvailableSlots,
  getBlockedDates,
};

// Función para calcular análisis cabalístico
export async function calcularAnalisisCabalistico(data: {
  nombre: string;
  dia: string;
  mes: string;
  anio: string;
}) {
  return apiRequest<any>('/fichas/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ========== PAYMENTS & STRIPE ==========

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (data: {
  planType: 'personal' | 'therapist_professional' | 'therapist_premium';
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSessionResponse> => {
  return apiRequest<CheckoutSessionResponse>('/payments/create-checkout/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getSubscriptionStatus = async (): Promise<{
  subscription_status: string;
  subscription_plan: string;
  membership_active: boolean;
  membership_expires: string | null;
}> => {
  return apiRequest('/payments/subscription-status/');
};

export const cancelSubscription = async (): Promise<{ message: string }> => {
  return apiRequest('/payments/cancel-subscription/', {
    method: 'POST',
  });
};

// ========================================
// USER PROFILE ENDPOINTS
// ========================================

export interface UserProfileData {
  // Therapist update endpoint expects `full_name` for Patient.
  // Patient self-service endpoints use `legal_full_name`.
  full_name?: string;
  legal_full_name: string;
  birth_date: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
  birth_timezone?: string;
  name_change_count?: number;
  profile_version?: number;
  consent_accepted_at?: string | null;
  email?: string;
  phone?: string;
  biologicalSex?: 'male' | 'female' | 'intersex' | 'unknown' | 'not_recorded';
  genderIdentity?: 'woman' | 'man' | 'non_binary' | 'other' | 'prefer_not_to_say' | 'not_recorded';
  profile_updated_by_therapist?: boolean;
  last_therapist_update?: string | null;
  // Para forzar re-geocodificación de coordenadas
  force_geocode?: boolean;
}

export interface ProfileValidationStatus {
  is_complete: boolean;
  missing_fields: string[];
  warnings: string[];
  profile_updated_by_therapist: boolean;
  last_therapist_update?: string | null;
}

export const getUserProfile = async (): Promise<UserProfileData> => {
  return apiRequest<UserProfileData>('/profile/me/');
};

export const updateUserProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
  return apiRequest<UserProfileData>('/profile/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const acceptConsent = async (): Promise<{ message: string; consent_accepted_at: string }> => {
  return apiRequest<{ message: string; consent_accepted_at: string }>('/profile/me/consent/', {
    method: 'POST',
  });
};

export const acknowledgeProfileUpdate = async (): Promise<{ message: string; profile_updated_by_therapist: boolean }> => {
  return apiRequest<{ message: string; profile_updated_by_therapist: boolean }>('/profile/me/acknowledge-update/', {
    method: 'POST',
  });
};

// ========================================
// PATIENT PROFILE MANAGEMENT (Therapist)
// ========================================

export const updatePatientProfile = async (
  patientId: number,
  data: Partial<UserProfileData>
): Promise<{
  message: string;
  profile_complete: boolean;
  missing_fields: string[];
  profile_updated_by_therapist: boolean;
  last_therapist_update: string | null;
  coordinates?: { latitude: number | null; longitude: number | null; timezone: string | null };
}> => {
  return apiRequest(`/therapist/patients/${patientId}/profile/update/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const getPatientProfileValidation = async (
  patientId: number
): Promise<ProfileValidationStatus> => {
  return apiRequest<ProfileValidationStatus>(`/therapist/patients/${patientId}/profile/validation/`);
};
