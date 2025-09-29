import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
const PAYMENTS_API_BASE_URL = (import.meta as any).env?.VITE_PAYMENTS_API_BASE_URL || 'http://localhost:8001';

// Create axios instances
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paymentsApiClient: AxiosInstance = axios.create({
  baseURL: PAYMENTS_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log for login requests
    if (config.url?.includes('/auth/login')) {
      console.log('Login request config:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

paymentsApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
const handleResponseError = (error: AxiosError) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - clear auth data and trigger login modal
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        // Dispatch custom event to trigger login modal
        window.dispatchEvent(new CustomEvent('showLoginModal'));
        // Also dispatch event to update auth context
        window.dispatchEvent(new CustomEvent('authLogout'));
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        break;
      case 403:
        toast.error('No tienes permisos para realizar esta acción.');
        break;
      case 404:
        toast.error('Recurso no encontrado.');
        break;
      case 422:
        // Validation error
        if (data && typeof data === 'object' && 'detail' in data) {
          const details = data.detail;
          if (Array.isArray(details)) {
            details.forEach((detail: any) => {
              if (detail.loc && detail.msg) {
                toast.error(`${detail.loc.join('.')}: ${detail.msg}`);
              }
            });
          } else {
            toast.error(String(details));
          }
        } else {
          toast.error('Error de validación.');
        }
        break;
      case 500:
        toast.error('Error interno del servidor.');
        break;
      default:
        toast.error('Ha ocurrido un error inesperado.');
    }
  } else if (error.request) {
    // Network error
    toast.error('Error de conexión. Verifica tu conexión a internet.');
  } else {
    // Other error
    toast.error('Error inesperado.');
  }
  
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

paymentsApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Admin endpoints
  CREATE_ADMIN: '/auth/admin/create',
  DELETE_USER: (userId: string) => `/auth/admin/${userId}`,
  
  // Debtors
  DEBTORS: '/debtors',
  DEBTOR: (id: string) => `/debtors/${id}`,
  
  // Units
  UNITS: '/units',
  UNIT: (id: string) => `/units/${id}`,
  
  // Leases
  LEASES: '/leases',
  LEASE: (id: string) => `/leases/${id}`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT: (id: string) => `/payments/${id}`,
  PAYMENT_CONFIRM: (id: string) => `/payments/${id}/confirm`,
  PAYMENT_RECEIPT: (id: string) => `/payments/${id}/generate-receipt`,
  
  // Catalogs
  CURRENCIES: '/currencies',
  PROCESS_STATUS: '/process-status',
  BANKS: '/banks',
  
  // Reports
  REPORTS_PAYMENTS: '/reports/payments',
  
  // Health
  HEALTH: '/health',
} as const;

// Payments API endpoints
export const PAYMENTS_API_ENDPOINTS = {
  CHECKOUT: '/checkout',
  WEBHOOK: (provider: string) => `/webhook/${provider}`,
  HEALTH: '/health',
} as const;

// Export for compatibility
export const api = apiClient;

export default apiClient;
