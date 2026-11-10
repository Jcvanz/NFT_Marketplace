import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterInput } from '../types';
import { authApi, cartApi, setStoredToken, getStoredToken } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const clearPrivateCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: queryKeys.favorites });
    queryClient.removeQueries({ queryKey: queryKeys.profile });
    queryClient.removeQueries({ queryKey: queryKeys.wallets });
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignora erros de rede no logout
    } finally {
      setUser(null);
      setToken(null);
      setStoredToken(null);
      clearPrivateCache();
    }
  }, [clearPrivateCache]);

  const refreshSession = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: sessionUser } = await authApi.getSession();
      setUser(sessionUser);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshSession();

    // Escuta eventos de 401 unauthorized interceptados em qualquer chamada de API
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [refreshSession, logout]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const session = await authApi.login(credentials);
      setToken(session.token);
      setStoredToken(session.token);
      setUser(session.user);

      try {
        const mergedCart = await cartApi.mergeGuestCart();
        queryClient.setQueryData(queryKeys.cart, mergedCart);
      } catch (e) {
        console.warn('Failed to merge guest cart', e);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const session = await authApi.register(data);
      setToken(session.token);
      setStoredToken(session.token);
      setUser(session.user);

      try {
        const mergedCart = await cartApi.mergeGuestCart();
        queryClient.setQueryData(queryKeys.cart, mergedCart);
      } catch (e) {
        console.warn('Failed to merge guest cart', e);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para utilizar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}

