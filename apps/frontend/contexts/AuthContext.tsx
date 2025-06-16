"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthApi } from '@/hooks/useAuthApi';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const { 
    login: apiLogin, 
    logout: apiLogout, 
    isAuthenticated: checkAuth, 
    getCurrentUser 
  } = useAuthApi();

  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      
      if (typeof window !== 'undefined') {
        if (checkAuth()) {
          const userData = getCurrentUser();
          if (userData) {
            setUser(userData as User);
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await apiLogin(credentials);
      setUser(result.user as User);
      return true;
    } catch (error) {
      console.error("Falha no login do AuthContext:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Falha ao fazer logout no servidor, limpando o cliente de qualquer maneira.", error);
    }
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (checkAuth() && !user) {
      const userData = getCurrentUser();
      if (userData) {
        setUser(userData as User);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && checkAuth(),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'MANAGER' | 'AGENT';
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback = <div>Carregando...</div> 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !user) {
    return <div>Acesso negado. Faça login.</div>;
  }

  if (requiredRole) {
    const roleHierarchy = {
      'ADMIN': 3,
      'MANAGER': 2, 
      'AGENT': 1
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <div>Acesso negado. Permissão insuficiente.</div>;
    }
  }

  return <>{children}</>;
}; 