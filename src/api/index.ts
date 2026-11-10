import { apiClient, getGuestSessionId } from './client';
import {
  User,
  Session,
  LoginCredentials,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
  Wallet,
  ConnectWalletInput,
  UpdateWalletInput,
  NFT,
  NFTQueryParams,
  NFTListResponse,
  CartItem,
  CartQuote,
  AddToCartInput,
  Order,
  CreateOrderInput,
} from '../types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<Session> {
    const res = await apiClient.post<Session>('/auth/login', credentials);
    return res.data;
  },

  async register(data: RegisterInput): Promise<Session> {
    const res = await apiClient.post<Session>('/auth/register', data);
    return res.data;
  },

  async getSession(): Promise<{ user: User }> {
    const res = await apiClient.get<{ user: User }>('/auth/session');
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};

export const profileApi = {
  async getProfile(): Promise<{ user: User }> {
    const res = await apiClient.get<{ user: User }>('/profile');
    return res.data;
  },

  async updateProfile(updates: UpdateProfileInput): Promise<{ user: User }> {
    const res = await apiClient.put<{ user: User }>('/profile', updates);
    return res.data;
  },

  async changePassword(input: ChangePasswordInput): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.put<{ success: boolean; message: string }>('/profile/password', input);
    return res.data;
  },
};

export const walletsApi = {
  async getWallets(): Promise<{ wallets: Wallet[] }> {
    const res = await apiClient.get<{ wallets: Wallet[] }>('/wallets');
    return res.data;
  },

  async addWallet(input: ConnectWalletInput): Promise<{ wallet: Wallet }> {
    const res = await apiClient.post<{ wallet: Wallet }>('/wallets', input);
    return res.data;
  },

  async updateWallet(walletId: string, updates: UpdateWalletInput): Promise<{ wallet: Wallet }> {
    const res = await apiClient.put<{ wallet: Wallet }>(`/wallets/${walletId}`, updates);
    return res.data;
  },
};

export const nftsApi = {
  async getNFTs(params?: NFTQueryParams): Promise<NFTListResponse> {
    const res = await apiClient.get<NFTListResponse>('/nfts', { params });
    return res.data;
  },

  async getNFTById(id: string): Promise<{ nft: NFT }> {
    const res = await apiClient.get<{ nft: NFT }>(`/nfts/${id}`);
    return res.data;
  },
};

export const favoritesApi = {
  async getFavorites(): Promise<{ favorites: NFT[]; favoriteIds: string[] }> {
    const res = await apiClient.get<{ favorites: NFT[]; favoriteIds: string[] }>('/favorites');
    return res.data;
  },

  async toggleFavorite(nftId: string): Promise<{ isFavorited: boolean; nftId: string }> {
    const res = await apiClient.post<{ isFavorited: boolean; nftId: string }>(`/favorites/${nftId}`);
    return res.data;
  },

  async removeFavorite(nftId: string): Promise<{ isFavorited: boolean; nftId: string }> {
    const res = await apiClient.delete<{ isFavorited: boolean; nftId: string }>(`/favorites/${nftId}`);
    return res.data;
  },
};

export const cartApi = {
  async getCart(): Promise<{ items: CartItem[] }> {
    const res = await apiClient.get<{ items: CartItem[] }>('/cart');
    return res.data;
  },

  async addToCart(input: AddToCartInput): Promise<{ items: CartItem[] }> {
    const res = await apiClient.post<{ items: CartItem[] }>('/cart', input);
    return res.data;
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<{ items: CartItem[] }> {
    const res = await apiClient.put<{ items: CartItem[] }>(`/cart/${cartItemId}`, { quantity });
    return res.data;
  },

  async removeFromCart(cartItemId: string): Promise<{ items: CartItem[] }> {
    const res = await apiClient.delete<{ items: CartItem[] }>(`/cart/${cartItemId}`);
    return res.data;
  },

  async clearCart(): Promise<{ items: CartItem[] }> {
    const res = await apiClient.delete<{ items: CartItem[] }>('/cart');
    return res.data;
  },

  async mergeGuestCart(): Promise<{ items: CartItem[] }> {
    const guestSessionId = getGuestSessionId();
    const res = await apiClient.post<{ items: CartItem[] }>('/cart/merge', { guestSessionId });
    return res.data;
  },
};

export const quoteApi = {
  async getQuote(data: {
    items: { nftId: string; editionId: string; quantity: number }[];
    couponCode?: string;
  }): Promise<CartQuote> {
    const res = await apiClient.post<CartQuote>('/quote', data);
    return res.data;
  },
};

export const ordersApi = {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const res = await apiClient.post<Order>('/orders', input, {
      headers: {
        'Idempotency-Key': input.idempotencyKey,
      },
    });
    return res.data;
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return res.data;
  },
};

export const devApi = {
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>('/dev/reset');
    return res.data;
  },
};

export * from './client';

