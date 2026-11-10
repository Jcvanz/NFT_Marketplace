import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../types';

const TOKEN_KEY = 'nft_auth_token';
const GUEST_KEY = 'nft_guest_session_id';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return 'guest-session';
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return guestId;
}

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor da requisição
// Anexa o token e o session id em todas as requisições feitas 
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const guestId = getGuestSessionId();
    if (guestId && config.headers) {
      config.headers['X-Guest-Session-Id'] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor da resposta
// Lida com erros e expiração de sessão
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Emite eventos customuzados para que o auth context ou o router possam redirecionar 
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

