import { Wallet } from './wallet';

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  bio?: string;
  avatarUrl: string;
  wallets: Wallet[];
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  handle: string;
  password?: string;
}

export interface UpdateProfileInput {
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}