import { NFT, User, CartItem, Order, Coupon, Wallet } from '../types';
import { INITIAL_USERS, INITIAL_NFTS, INITIAL_COUPONS } from './fixtures';

const DB_STORAGE_KEY = 'nft_mock_db_state_v1';

export interface MockDatabaseState {
  users: User[];
  nfts: NFT[];
  coupons: Coupon[];
  favoritesByUser: Record<string, string[]>; // userId -> nftIds[]
  cartBySession: Record<string, CartItem[]>; // sessionId or userId -> CartItem[]
  orders: Order[];
  activeTokens: Record<string, { userId: string; expiresAt: string }>;
}

function getDefaultState(): MockDatabaseState {
  return {
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    nfts: JSON.parse(JSON.stringify(INITIAL_NFTS)),
    coupons: JSON.parse(JSON.stringify(INITIAL_COUPONS)),
    favoritesByUser: {
      'user-alice-1': ['nft-1', 'nft-3'],
      'user-bob-2': ['nft-2'],
    },
    cartBySession: {},
    orders: [],
    activeTokens: {
      'mock-token-alice': {
        userId: 'user-alice-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  };
}

class MockDatabase {
  private state: MockDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockDatabaseState {
    if (typeof window === 'undefined') return getDefaultState();
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load mock database from localStorage', e);
    }
    return getDefaultState();
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist mock database', e);
    }
  }

  public reset(): void {
    this.state = getDefaultState();
    this.persist();
  }

  // Pegar todos os usuários
  public getUsers(): User[] {
    return this.state.users;
  }

  // Pegar usuário pelo ID
  public findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  // Pegar usuário pelo email
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // Criar um novo usuário
  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'wallets'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      wallets: [
        {
          id: `wallet-${Date.now()}`,
          address: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
          network: 'ethereum',
          isPrimary: true,
          label: 'Carteira Principal',
          balanceEth: '2.5000',
          status: 'connected',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.persist();
    return newUser;
  }
 
  // Atualizar o usuário
  public updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.persist();
    return user;
  }

  // Criar uma sessão
  public createSession(userId: string): { token: string; expiresAt: string } {
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
    this.state.activeTokens[token] = { userId, expiresAt };
    this.persist();
    return { token, expiresAt };
  }

  // Pegar usuário pelo token
  public getUserByToken(token: string): User | null {
    const session = this.state.activeTokens[token];
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      delete this.state.activeTokens[token];
      this.persist();
      return null;
    }
    return this.findUserById(session.userId) || null;
  }

  // Revogar token
  public revokeToken(token: string): void {
    delete this.state.activeTokens[token];
    this.persist();
  }

  // Pegar carteiras do usuário
  public getWallets(userId: string): Wallet[] {
    const user = this.findUserById(userId);
    return user ? user.wallets : [];
  }

  // Adicionar carteira do usuário
  public addWallet(userId: string, walletData: Omit<Wallet, 'id' | 'createdAt'>): Wallet | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    if (walletData.isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false));
    }

    const newWallet: Wallet = {
      ...walletData,
      id: `wallet-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    user.wallets.push(newWallet);
    this.persist();
    return newWallet;
  }

  // Atualizar carteira do usuário
  public updateWallet(userId: string, walletId: string, updates: Partial<Wallet>): Wallet | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    const wallet = user.wallets.find((w) => w.id === walletId);
    if (!wallet) return null;

    if (updates.isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false));
    }

    Object.assign(wallet, updates);
    this.persist();
    return wallet;
  }

  // Pegar todas as NFTs
  public getNFTs(): NFT[] {
    return this.state.nfts;
  }

  // Pegar NFT pelo ID
  public findNFTById(id: string): NFT | undefined {
    return this.state.nfts.find((n) => n.id === id);
  }

  // Atualizar preço ou disponibilidade da NFT
  public updateNFTPriceOrAvailability(
    nftId: string,
    editionId: string,
    newPriceEth: string,
    availableQuantity: number
  ): NFT | undefined {
    const nft = this.findNFTById(nftId);
    if (!nft) return undefined;

    const edition = nft.editions.find((e) => e.id === editionId);
    if (edition) {
      edition.priceEth = newPriceEth;
      edition.availableQuantity = availableQuantity;
    }
    if (nft.currentEditionId === editionId) {
      nft.priceEth = newPriceEth;
    }
    nft.version += 1;
    nft.updatedAt = new Date().toISOString();
    this.persist();
    return nft;
  }

  // Pegar favoritos do usuário
  public getFavorites(userId: string): string[] {
    return this.state.favoritesByUser[userId] || [];
  }

  // Alternar favorito da NFT
  public toggleFavorite(userId: string, nftId: string): boolean {
    if (!this.state.favoritesByUser[userId]) {
      this.state.favoritesByUser[userId] = [];
    }
    const favs = this.state.favoritesByUser[userId];
    const index = favs.indexOf(nftId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(nftId);
      isFav = true;
    }
    this.persist();
    return isFav;
  }

  // Pegar carrinho do usuário
  public getCart(sessionIdOrUserId: string): CartItem[] {
    return this.state.cartBySession[sessionIdOrUserId] || [];
  }

  // Adicionar item ao carrinho
  public addToCart(sessionIdOrUserId: string, nftId: string, editionId: string, quantity: number): CartItem[] {
    const nft = this.findNFTById(nftId);
    if (!nft) throw new Error('NFT not found');
    const edition = nft.editions.find((e) => e.id === editionId);
    if (!edition) throw new Error('Edition not found');

    if (!this.state.cartBySession[sessionIdOrUserId]) {
      this.state.cartBySession[sessionIdOrUserId] = [];
    }
    const cart = this.state.cartBySession[sessionIdOrUserId];
    const existingIndex = cart.findIndex((item) => item.nftId === nftId && item.editionId === editionId);

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > edition.availableQuantity) {
        throw new Error(`Quantidade máxima disponível: ${edition.availableQuantity}`);
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (quantity > edition.availableQuantity) {
        throw new Error(`Quantidade máxima disponível: ${edition.availableQuantity}`);
      }
      cart.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nftId,
        editionId,
        quantity,
        priceEth: edition.priceEth,
        currentPriceEth: edition.priceEth,
        hasPriceChanged: false,
        hasAvailabilityChanged: false,
        nft,
        edition,
      });
    }

    this.persist();
    return cart;
  }

  // Atualizar item do carrinho
  public updateCartItem(sessionIdOrUserId: string, cartItemId: string, quantity: number): CartItem[] {
    const cart = this.state.cartBySession[sessionIdOrUserId] || [];
    const item = cart.find((i) => i.id === cartItemId);
    if (!item) throw new Error('Item do carrinho não encontrado');

    if (quantity <= 0) {
      return this.removeFromCart(sessionIdOrUserId, cartItemId);
    }

    const nft = this.findNFTById(item.nftId);
    const edition = nft?.editions.find((e) => e.id === item.editionId);
    if (edition && quantity > edition.availableQuantity) {
      throw new Error(`Quantidade máxima disponível: ${edition.availableQuantity}`);
    }

    item.quantity = quantity;
    this.persist();
    return cart;
  }

  // Remover item do carrinho
  public removeFromCart(sessionIdOrUserId: string, cartItemId: string): CartItem[] {
    if (!this.state.cartBySession[sessionIdOrUserId]) return [];
    this.state.cartBySession[sessionIdOrUserId] = this.state.cartBySession[sessionIdOrUserId].filter(
      (item) => item.id !== cartItemId
    );
    this.persist();
    return this.state.cartBySession[sessionIdOrUserId];
  }

  // Limpar carrinho
  public clearCart(sessionIdOrUserId: string): void {
    this.state.cartBySession[sessionIdOrUserId] = [];
    this.persist();
  }

  // Mesclar carrinhos
  public mergeCarts(guestSessionId: string, userId: string): CartItem[] {
    const guestCart = this.state.cartBySession[guestSessionId] || [];
    if (guestCart.length === 0) return this.getCart(userId);

    const userCart = this.state.cartBySession[userId] || [];
    guestCart.forEach((guestItem) => {
      const existing = userCart.find(
        (uItem) => uItem.nftId === guestItem.nftId && uItem.editionId === guestItem.editionId
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userCart.push(guestItem);
      }
    });

    this.state.cartBySession[userId] = userCart;
    delete this.state.cartBySession[guestSessionId];
    this.persist();
    return userCart;
  }

  // Pegar cupom
  public findCoupon(code: string): Coupon | undefined {
    return this.state.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
  }

  // Pegar pedido por ID
  public findOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o.id === id);
  }

  // Pegar pedido por chave de idempotência
  public findOrderByTokenOrKey(idempotencyKey: string): Order | undefined {
    return this.state.orders.find((o) => o.idempotencyKey === idempotencyKey);
  }

  // Criar pedido
  public createOrder(order: Order): Order {
    this.state.orders.push(order);
    this.persist();
    return order;
  }

  // Atualizar status do pedido
  public updateOrderStatus(orderId: string, status: Order['status'], rejectionReason?: string): Order | undefined {
    const order = this.findOrderById(orderId);
    if (!order) return undefined;
    order.status = status;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    order.version += 1;
    order.updatedAt = new Date().toISOString();
    this.persist();
    return order;
  }
}

export const mockDb = new MockDatabase();

