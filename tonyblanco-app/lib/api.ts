// API Configuration and Utilities
// Default to Render backend in production if env var is missing
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

// Exportar como API_BASE_URL para compatibilidad
export const API_BASE_URL = API_URL;

// Type definitions for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface UserProfile {
  user_type: 'personal' | 'therapist';
  full_name: string;
  phone: string;
  birth_date?: string;
  profession?: string;
  specialization?: string;
  license_number?: string;
  years_of_experience?: number;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  subscription_start_date?: string;
  subscription_end_date?: string;
  max_fichas_per_month: number;
  fichas_created_this_month: number;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginResponse {
  token: string;
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

// Error response type for network failures
export interface ApiErrorResponse {
  error: true;
  message: string;
  status?: number;
  networkError: boolean;
}

// Generic fetch wrapper with auth - NEVER throws on network errors
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | ApiErrorResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  console.log('API Request:', { url, method: options.method || 'GET' });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      // Try to parse error body, but handle empty/invalid JSON gracefully
      let error: any = {};
      
      try {
        // Read response as text first (can only read body once)
        const errorBodyText = await response.text();
        
        if (errorBodyText && errorBodyText.trim()) {
          try {
            // Try to parse as JSON
            error = JSON.parse(errorBodyText);
          } catch {
            // Not valid JSON, use text as message
            error = { message: errorBodyText };
          }
        } else {
          // Empty body - create meaningful error message
          error = { message: `Error ${response.status}: ${response.statusText || 'Respuesta vacía del servidor'}` };
        }
      } catch (readError) {
        // Fallback if reading response fails
        error = { message: `Error ${response.status}: No se pudo leer la respuesta del servidor` };
      }
      
      const errorMsg = error.message || error.error || error.detail || `Error ${response.status}: ${response.statusText || 'Error desconocido'}`;
      
      // Log full backend error for debugging (only if there's useful info beyond status)
      // Check if error object has meaningful content (not just empty object or default message)
      const errorKeys = Object.keys(error).filter(key => {
        const value = error[key];
        // Skip empty strings, null, undefined, or empty objects
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        // Skip default messages that don't add value
        if (key === 'message' && value === `Error ${response.status}: ${response.statusText || 'Respuesta vacía del servidor'}`) return false;
        return true;
      });
      
      const hasErrorInfo = errorKeys.length > 0;
      
      if (hasErrorInfo) {
        // Only log if we have meaningful error content
        const errorBodyToLog: Record<string, any> = {};
        errorKeys.forEach(key => {
          errorBodyToLog[key] = error[key];
        });
        
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorBody: errorBodyToLog,
        });
      } else {
        // Minimal log for empty responses to avoid "API Error Response: {}"
        console.warn(`API Error ${response.status} (${response.statusText || 'Unknown'}): ${url}`);
      }
      
      // Return error object with full backend error body for validation errors
      return {
        error: true,
        message: errorMsg,
        status: response.status,
        networkError: false,
        // Include full backend error body for validation errors (400, 422, etc.)
        // Only include if error has actual content (not just empty object or default message)
        ...(response.status >= 400 && response.status < 500 && hasErrorInfo ? error : {}),
      } as ApiErrorResponse & Record<string, any>;
    }

    return response.json();
  } catch (err: any) {
    // Network errors (CORS, timeout, etc.) - NEVER throw, return error object
    const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError' || !err.response;
    const errorMsg = isNetworkError
      ? `No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté activo.`
      : (err.message || 'Error desconocido');
    
    console.error('Network Error:', errorMsg);
    
    // Return error object instead of throwing
    return {
      error: true,
      message: errorMsg,
      networkError: true,
    } as ApiErrorResponse;
  }
}

// ========== AUTH API ==========

export const registerTherapist = async (data: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  years_of_experience: number;
  phone: string;
}): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>('/register/therapist/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registerPersonal = async (data: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
}): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>('/register/personal/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const getCurrentUser = async (): Promise<User | ApiErrorResponse> => {
  return apiRequest<User>('/me/');
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/password-reset/request/', {
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

// ========== PATIENT API ==========

export interface AssignedTest {
  id: number;
  code: string;
  name: string;
  description?: string;
  test_type?: string;
  available_for_personal?: boolean;
  [key: string]: any;
}

export const getAssignedTests = async (): Promise<AssignedTest[]> => {
  const response = await apiRequest<{ tests: AssignedTest[] } | AssignedTest[]>('/tests/assigned/');
  
  // Check if response is an error object
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    console.warn('getAssignedTests error:', (response as ApiErrorResponse).message);
    return []; // Return empty array on error (404, network failure, etc.)
  }
  
  // Handle both response formats: { tests: [...] } or [...]
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'tests' in response) {
    return (response as { tests: AssignedTest[] }).tests || [];
  }
  return [];
};

export interface AnalysisRecord {
  id: string; // UUID, not numeric ID
  test_module?: {
    id: number;
    code: string;
    name: string;
    description?: string;
    test_type?: string;
  };
  test_module_name?: string;
  created_at: string;
  result_data?: any;
  input_data?: any;
  notes?: string;
  visible_to_patient?: boolean;
  therapist_notes?: string;
  is_favorite?: boolean;
  [key: string]: any;
}

export const getMyResults = async (): Promise<AnalysisRecord[]> => {
  const response = await apiRequest<{ results: AnalysisRecord[] } | AnalysisRecord[]>('/analysis-records/my-results/');
  
  // Check if response is an error object
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    console.warn('getMyResults error:', (response as ApiErrorResponse).message);
    return []; // Return empty array on error (404, network failure, etc.)
  }
  
  // Handle both response formats: { results: [...] } or [...]
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'results' in response) {
    return (response as { results: AnalysisRecord[] }).results || [];
  }
  return [];
};

/**
 * Get a specific AnalysisRecord by UUID
 * Uses GET /api/analysis-records/<uuid>/
 */
export const getAnalysisRecord = async (uuid: string): Promise<AnalysisRecord | ApiErrorResponse> => {
  return apiRequest<AnalysisRecord>(`/analysis-records/${uuid}/`);
};

// ========== USER PROFILE API ==========

export interface UserProfileData {
  legal_full_name?: string;
  full_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  birth_latitude?: number | string | null;
  birth_longitude?: number | string | null;
  birth_timezone?: string;
  profile_version?: number;
  name_change_count?: number;
  consent_accepted_at?: string | null;
  user_type?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Get current user profile
 * Uses GET /api/profile/me/
 */
export const getProfile = async (): Promise<UserProfileData | ApiErrorResponse> => {
  return apiRequest<UserProfileData>('/profile/me/');
};

/**
 * Update current user profile
 * Uses PATCH /api/profile/me/
 */
export const updateProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData | ApiErrorResponse> => {
  const response = await apiRequest<UserProfileData>('/profile/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  
  // Enhanced logging for debugging
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    const errorResponse = response as ApiErrorResponse;
    console.error('Profile update error:', {
      status: errorResponse.status,
      message: errorResponse.message,
      networkError: errorResponse.networkError,
      fullResponse: response,
    });
  }
  
  return response;
};

/**
 * Accept therapeutic consent
 * Uses POST /api/profile/me/consent/
 */
export const acceptConsent = async (): Promise<UserProfileData | ApiErrorResponse> => {
  return apiRequest<UserProfileData>('/profile/me/consent/', {
    method: 'POST',
  });
};

/**
 * Get patient profile (therapist view)
 * Uses GET /api/therapist/patients/<id>/profile/
 */
export const getPatientProfile = async (patientId: number): Promise<UserProfileData | ApiErrorResponse> => {
  return apiRequest<UserProfileData>(`/therapist/patients/${patientId}/profile/`);
};

/**
 * Update patient profile (therapist view)
 * Uses PATCH /api/therapist/patients/<id>/profile/
 */
export const updatePatientProfile = async (
  patientId: number,
  data: Partial<UserProfileData> & { rewrite_coordinates?: boolean }
): Promise<UserProfileData | ApiErrorResponse> => {
  // Extract rewrite_coordinates flag and include it in payload if true
  const { rewrite_coordinates, ...profileData } = data;
  const payload = { ...profileData };
  
  // Only include coordinates if rewrite_coordinates is true
  if (rewrite_coordinates) {
    // Coordinates are already in profileData if rewrite_coordinates was true
  } else {
    // Remove coordinates from payload if rewrite flag is not set
    delete payload.birth_latitude;
    delete payload.birth_longitude;
  }
  
  const response = await apiRequest<UserProfileData>(`/therapist/patients/${patientId}/profile/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  
  // Enhanced logging for debugging
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    const errorResponse = response as ApiErrorResponse;
    console.error('Patient profile update error:', {
      status: errorResponse.status,
      message: errorResponse.message,
      networkError: errorResponse.networkError,
      fullResponse: response,
    });
  }
  
  return response;
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
