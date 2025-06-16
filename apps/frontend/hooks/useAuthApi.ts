"use client";

import { useState } from 'react';
import Cookies from 'js-cookie';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT';
}

export interface ResetPasswordRequest {
  email: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
  };
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAuthApi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall('/api/v1/auth/login', 'POST', loginData);
      
      if (result.access_token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        Cookies.set('auth-token', result.access_token, { expires: 7, path: '/' });
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Falha no login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterRequest): Promise<any> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall('/api/v1/auth/register', 'POST', registerData);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Falha no registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetData: ResetPasswordRequest): Promise<any> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall('/api/v1/auth/reset-password', 'POST', resetData);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao solicitar reset de senha';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (token) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err: any) {
      // Mesmo se o logout da API falhar, o cliente deve ser limpo
      console.error("Falha no logout da API:", err.message);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        Cookies.remove('auth-token', { path: '/' });
      }
      setIsLoading(false);
    }
  };

  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token') || !!Cookies.get('auth-token');
  };

  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  };

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  };

  return {
    isLoading,
    error,
    login,
    register,
    resetPassword,
    logout,
    isAuthenticated,
    getCurrentUser,
    getAuthToken,
  };
};