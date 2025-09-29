import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '@/app/api';

// Types
export interface User {
  id: string;
  public_id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone?: string;
  role: string;
  created_by?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_image?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  profile_image?: string;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<User> };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData | FormData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          // Verify token with backend using apiClient
          try {
            const response = await apiClient.get('/auth/me');
            const user = response.data;
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } catch (error) {
            // Token is invalid or expired
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuth();

    // Listen for auth logout event from interceptor
    const handleAuthLogout = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };

    window.addEventListener('authLogout', handleAuthLogout);

    return () => {
      window.removeEventListener('authLogout', handleAuthLogout);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('Attempting login with credentials:', { email: credentials.email, password: '***' });
      
      // Call real backend API using apiClient
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Login response:', response.data);
      const { access_token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || 'Error de autenticación';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Call real backend API
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
          phone: credentials.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error de registro');
      }

      const data = await response.json();
      const { access_token, user } = data;
      
      // Store in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Error de registro' });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'AUTH_LOGOUT' });
    // Redirigir a la página principal en lugar de /login
    window.location.href = '/';
  };

  const updateProfile = async (data: UpdateProfileData | FormData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      let response;

      if (data instanceof FormData) {
        // Handle FormData (with files)
        response = await apiClient.put('/auth/profile', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Handle JSON data (text only)
        response = await apiClient.put('/auth/profile', data);
      }

      const updatedUser = response.data;
      
      // Update localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Error al actualizar perfil' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};