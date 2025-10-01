/**
 * Configuración centralizada de URLs y constantes del frontend
 */

// URLs base para desarrollo local
export const LOCAL_URLS = {
  FRONTEND: 'http://localhost:3000',
  BACKEND: 'http://localhost:8000',
  SDK: 'http://localhost:5000',
} as const;

// URLs base para producción (AWS Lambda)
export const PRODUCTION_URLS = {
  FRONTEND: 'https://rentals-sdk-front-git-front-local-terry-tejadas-projects.vercel.app',
  BACKEND: 'https://r3k8sn86cl.execute-api.us-east-1.amazonaws.com/Prod',
  SDK: 'https://gxloif6egd.execute-api.us-east-1.amazonaws.com/Prod',
} as const;

// Detectar entorno
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URLs activas según el entorno
export const ACTIVE_URLS = isDevelopment ? LOCAL_URLS : PRODUCTION_URLS;

// Configuración de API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || ACTIVE_URLS.BACKEND,
  PAYMENTS_API_URL: import.meta.env.VITE_PAYMENTS_API_BASE_URL || ACTIVE_URLS.SDK,
  TIMEOUT: 10000,
} as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'HogarPeru Rentals',
  VERSION: '1.0.0',
  ENVIRONMENT: isDevelopment ? 'development' : 'production',
} as const;

// Exportar URLs individuales para compatibilidad
export const {
  FRONTEND: FRONTEND_URL,
  BACKEND: BACKEND_URL,
  SDK: SDK_URL,
} = ACTIVE_URLS;
