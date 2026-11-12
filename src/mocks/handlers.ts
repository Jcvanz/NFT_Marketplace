import { http, HttpResponse, delay } from 'msw';
import { mockDb } from './db';
import { getActiveScenario } from './scenarios';
import { multiplyEth, addEth, subEth } from '../lib/eth';
import { CartItem, CartQuote, Order, OrderItemSnapshot, OrderReceipt } from '../types';
import { image1 } from '../assets';

// Helper para extrair Bearer token do request
function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return mockDb.getUserByToken(token);
}

// Helper para obter ou criar ID de sessão de convidado do header
function getSessionIdentifier(request: Request, user: any) {
  if (user) return user.id;
  const guestHeader = request.headers.get('X-Guest-Session-Id');
  return guestHeader || 'guest-default-session';
}

// Middleware simulation para aplicar cenários
async function applyScenarioMiddlewares() {
  const scenario = getActiveScenario();

  if (scenario === 'slow_network') {
    await delay(1500);
  } else {
    await delay(120);
  }

  if (scenario === 'network_error') {
    throw new HttpResponse(
      JSON.stringify({
        error: { code: 'NETWORK_ERROR', message: 'Falha de conexão com os serviços da rede.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// handlers do mock
export const handlers = [
  // Resetar banco de dados
  http.post('/api/dev/reset', async () => {
    mockDb.reset();
    return HttpResponse.json({ success: true, message: 'Database reset to initial state' });
  }),

  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await applyScenarioMiddlewares();
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'E-mail é obrigatório' } },
        { status: 400 }
      );
    }

    const user = mockDb.findUserByEmail(body.email);
    if (!user) {
      return HttpResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' } },
        { status: 401 }
      );
    }

    const session = mockDb.createSession(user.id);
    return HttpResponse.json({
      token: session.token,
      expiresAt: session.expiresAt,
      user,
    });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await applyScenarioMiddlewares();
    const scenario = getActiveScenario();
    if (scenario === 'validation_conflict') {
      return HttpResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Este endereço de e-mail já está em uso.',
          },
        },
        { status: 409 }
      );
    }

    const body = (await request.json()) as { name?: string; email?: string; handle?: string; password?: string };

    if (!body.name || !body.email || !body.handle) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Nome, e-mail e handle são obrigatórios' } },
        { status: 400 }
      );
    }

    const existing = mockDb.findUserByEmail(body.email);
    if (existing) {
      return HttpResponse.json(
        { error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Este e-mail já está cadastrado' } },
        { status: 409 }
      );
    }

    const newUser = mockDb.createUser({
      name: body.name,
      email: body.email,
      handle: body.handle.startsWith('@') ? body.handle : `@${body.handle}`,
      avatarUrl: image1,
    });

    const session = mockDb.createSession(newUser.id);
    return HttpResponse.json(
      {
        token: session.token,
        expiresAt: session.expiresAt,
        user: newUser,
      },
      { status: 201 }
    );
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await applyScenarioMiddlewares();
    const scenario = getActiveScenario();
    if (scenario === 'session_expired') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Sessão expirada. Faça login novamente.' } },
        { status: 401 }
      );
    }

    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ user });
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await applyScenarioMiddlewares();
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      mockDb.revokeToken(token);
    }
    return HttpResponse.json({ success: true });
  }),

  // Perfil e carteira
  http.get('/api/profile', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    return HttpResponse.json({ user });
  }),

  http.put('/api/profile', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const body = (await request.json()) as any;
    const updated = mockDb.updateUser(user.id, body);
    return HttpResponse.json({ user: updated });
  }),

  http.put('/api/profile/password', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const body = (await request.json()) as any;
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Senha atual e nova senha são obrigatórias' } },
        { status: 400 }
      );
    }
    return HttpResponse.json({ success: true, message: 'Senha atualizada com sucesso' });
  }),

  http.get('/api/wallets', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    return HttpResponse.json({ wallets: mockDb.getWallets(user.id) });
  }),

  http.post('/api/wallets', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const body = (await request.json()) as any;
    if (!body.address || !body.network) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Endereço e rede são obrigatórios' } },
        { status: 400 }
      );
    }
    const newWallet = mockDb.addWallet(user.id, {
      address: body.address,
      network: body.network,
      label: body.label || 'Nova Carteira',
      isPrimary: Boolean(body.isPrimary),
      balanceEth: '1.5000',
      status: 'connected',
    });
    return HttpResponse.json({ wallet: newWallet }, { status: 201 });
  }),

  http.put('/api/wallets/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const body = (await request.json()) as any;
    const updated = mockDb.updateWallet(user.id, params.id as string, body);
    if (!updated) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Carteira não encontrada' } }, { status: 404 });
    }
    return HttpResponse.json({ wallet: updated });
  }),

  // NFTs catalogos
  http.get('/api/nfts', async ({ request }) => {
    await applyScenarioMiddlewares();
    const scenario = getActiveScenario();
    if (scenario === 'empty_catalog') {
      return HttpResponse.json({ items: [], total: 0, page: 1, limit: 12, totalPages: 0 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const category = url.searchParams.get('category')?.toLowerCase();
    const network = url.searchParams.get('network')?.toLowerCase();
    const quickFilter = url.searchParams.get('quickFilter');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sortBy = url.searchParams.get('sortBy') || 'recently_listed';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '9', 10);

    const user = getAuthUser(request);
    const userFavs = user ? mockDb.getFavorites(user.id) : [];

    const allNfts = mockDb.getNFTs();

    // Compute live counts across the whole catalog
    const categoryCounts: Record<string, number> = {};
    const networkCounts: Record<string, number> = {
      ethereum: 0,
      polygon: 0,
      solana: 0,
    };

    allNfts.forEach((nft) => {
      const cat = (nft.category || '').toLowerCase();
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      const net = (nft.network || 'ethereum').toLowerCase();
      networkCounts[net] = (networkCounts[net] || 0) + 1;
    });

    let nfts = allNfts.map((nft) => ({
      ...nft,
      isFavorited: userFavs.includes(nft.id),
    }));

    // Filtros de busca
    if (search) {
      nfts = nfts.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.description.toLowerCase().includes(search) ||
          n.creator.name.toLowerCase().includes(search)
      );
    }

    // Filtro por categoria / coleção
    if (category && category !== 'all' && category !== 'todos') {
      nfts = nfts.filter((n) => (n.category || '').toLowerCase() === category);
    }

    // Filtro por rede blockchain
    if (network && network !== 'all') {
      nfts = nfts.filter((n) => (n.network || 'ethereum').toLowerCase() === network);
    }

    // Quick filter no topo (todos, novos, lançamentos, em alta)
    if (quickFilter) {
      if (quickFilter === 'new') {
        nfts = nfts.filter((n) => n.isNew);
      } else if (quickFilter === 'releases') {
        nfts = nfts.filter((n) => n.isRelease);
      } else if (quickFilter === 'trending') {
        nfts = nfts.filter((n) => n.isTrending);
      }
    }

    // Filtro por faixa de preço
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        nfts = nfts.filter((n) => parseFloat(n.priceEth) >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        nfts = nfts.filter((n) => parseFloat(n.priceEth) <= max);
      }
    }

    // Ordenação
    nfts.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return parseFloat(a.priceEth) - parseFloat(b.priceEth);
        case 'price_desc':
          return parseFloat(b.priceEth) - parseFloat(a.priceEth);
        case 'most_viewed':
          return b.viewsCount - a.viewsCount;
        case 'highest_edition':
          return b.editions.length - a.editions.length;
        case 'recently_listed':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const total = nfts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedItems = nfts.slice(startIdx, startIdx + limit);

    return HttpResponse.json({
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      categoryCounts,
      networkCounts,
    });
  }),

  http.get('/api/nfts/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const nft = mockDb.findNFTById(params.id as string);
    if (!nft) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'NFT não encontrado' } }, { status: 404 });
    }

    const user = getAuthUser(request);
    const userFavs = user ? mockDb.getFavorites(user.id) : [];

    return HttpResponse.json({
      nft: {
        ...nft,
        isFavorited: userFavs.includes(nft.id),
      },
    });
  }),

  // Favoritos
  http.get('/api/favorites', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const favoriteIds = mockDb.getFavorites(user.id);
    const nfts = mockDb.getNFTs().filter((n) => favoriteIds.includes(n.id));
    return HttpResponse.json({ favorites: nfts, favoriteIds });
  }),

  http.post('/api/favorites/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const isFavorited = mockDb.toggleFavorite(user.id, params.id as string);
    return HttpResponse.json({ isFavorited, nftId: params.id });
  }),

  http.delete('/api/favorites/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    mockDb.toggleFavorite(user.id, params.id as string);
    return HttpResponse.json({ isFavorited: false, nftId: params.id });
  }),

  // Carrinho
  http.get('/api/cart', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    const sessionId = getSessionIdentifier(request, user);
    const items = mockDb.getCart(sessionId);
    return HttpResponse.json({ items });
  }),

  http.post('/api/cart', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    const sessionId = getSessionIdentifier(request, user);
    const body = (await request.json()) as { nftId: string; editionId: string; quantity: number };

    try {
      const items = mockDb.addToCart(sessionId, body.nftId, body.editionId, body.quantity || 1);
      return HttpResponse.json({ items }, { status: 201 });
    } catch (err: any) {
      return HttpResponse.json(
        { error: { code: 'CART_ADD_ERROR', message: err.message || 'Erro ao adicionar item' } },
        { status: 400 }
      );
    }
  }),

  http.put('/api/cart/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    const sessionId = getSessionIdentifier(request, user);
    const body = (await request.json()) as { quantity: number };

    try {
      const items = mockDb.updateCartItem(sessionId, params.id as string, body.quantity);
      return HttpResponse.json({ items });
    } catch (err: any) {
      return HttpResponse.json(
        { error: { code: 'CART_UPDATE_ERROR', message: err.message || 'Erro ao atualizar item' } },
        { status: 400 }
      );
    }
  }),

  http.delete('/api/cart/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    const sessionId = getSessionIdentifier(request, user);
    const items = mockDb.removeFromCart(sessionId, params.id as string);
    return HttpResponse.json({ items });
  }),

  http.delete('/api/cart', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    const sessionId = getSessionIdentifier(request, user);
    mockDb.clearCart(sessionId);
    return HttpResponse.json({ items: [] });
  }),

  http.post('/api/cart/merge', async ({ request }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const body = (await request.json()) as { guestSessionId: string };
    const items = mockDb.mergeCarts(body.guestSessionId, user.id);
    return HttpResponse.json({ items });
  }),

  // Cotação
  http.post('/api/quote', async ({ request }) => {
    await applyScenarioMiddlewares();
    const scenario = getActiveScenario();
    const body = (await request.json()) as {
      items: { nftId: string; editionId: string; quantity: number }[];
      couponCode?: string;
    };

    if (scenario === 'sold_out') {
      return HttpResponse.json(
        {
          error: {
            code: 'EDITION_SOLD_OUT',
            message: 'A edição selecionada acabou de se esgotar no mercado.',
          },
        },
        { status: 409 }
      );
    }

    if (scenario === 'price_changed') {
      return HttpResponse.json(
        {
          error: {
            code: 'PRICE_CHANGED',
            message: 'O preço de um ou mais itens sofreu alteração. Por favor, revalide o carrinho.',
          },
        },
        { status: 409 }
      );
    }

    let subtotalEth = '0';
    const enrichedItems: CartItem[] = [];

    for (const item of body.items) {
      const nft = mockDb.findNFTById(item.nftId);
      if (!nft) {
        return HttpResponse.json(
          { error: { code: 'NFT_NOT_FOUND', message: `NFT ${item.nftId} não encontrado` } },
          { status: 404 }
        );
      }
      const edition = nft.editions.find((e) => e.id === item.editionId);
      if (!edition) {
        return HttpResponse.json(
          { error: { code: 'EDITION_NOT_FOUND', message: `Edição ${item.editionId} não encontrada` } },
          { status: 404 }
        );
      }

      const itemTotalEth = multiplyEth(edition.priceEth, item.quantity);
      subtotalEth = addEth(subtotalEth, itemTotalEth);

      enrichedItems.push({
        id: `quote-item-${item.nftId}`,
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        priceEth: edition.priceEth,
        currentPriceEth: edition.priceEth,
        nft,
        edition,
      });
    }

    // Cálculo do cupom
    let discountEth = '0';
    let appliedCoupon = null;

    if (body.couponCode) {
      if (scenario === 'invalid_coupon') {
        return HttpResponse.json(
          { error: { code: 'INVALID_COUPON', message: 'Cupom inválido ou expirado.' } },
          { status: 400 }
        );
      }

      const coupon = mockDb.findCoupon(body.couponCode);
      if (!coupon || !coupon.isValid || new Date(coupon.expiresAt) < new Date()) {
        return HttpResponse.json(
          { error: { code: 'INVALID_COUPON', message: 'Cupom inválido ou expirado.' } },
          { status: 400 }
        );
      }

      appliedCoupon = coupon;
      const fraction = (coupon.discountPercentage / 100).toString();
      discountEth = multiplyEth(subtotalEth, parseFloat(fraction));
    }

    const networkFeeEth = '0.0042';
    const discountedSubtotal = subEth(subtotalEth, discountEth);
    const totalEth = addEth(discountedSubtotal, networkFeeEth);

    const quote: CartQuote = {
      quoteId: `quote-${Date.now()}`,
      subtotalEth,
      discountEth,
      networkFeeEth,
      totalEth,
      coupon: appliedCoupon,
      items: enrichedItems,
      quotedAt: new Date().toISOString(),
      isStale: false,
    };

    return HttpResponse.json(quote);
  }),

  // Pedidos
  http.post('/api/orders', async ({ request }) => {
    await applyScenarioMiddlewares();
    const scenario = getActiveScenario();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }

    const idempotencyKey =
      request.headers.get('Idempotency-Key') ||
      ((await request.clone().json()) as any).idempotencyKey;

    if (!idempotencyKey) {
      return HttpResponse.json(
        { error: { code: 'MISSING_IDEMPOTENCY_KEY', message: 'Chave de idempotência obrigatória' } },
        { status: 400 }
      );
    }

    const existingOrder = mockDb.findOrderByTokenOrKey(idempotencyKey);
    if (existingOrder) {
      return HttpResponse.json(existingOrder);
    }

    if (scenario === 'idempotency_timeout') {
      const pendingOrder: Order = {
        id: `order-timeout-${Date.now()}`,
        idempotencyKey,
        userId: user.id,
        status: 'pending',
        items: [],
        subtotalEth: '0.45',
        discountEth: '0',
        networkFeeEth: '0.0042',
        totalEth: '0.4542',
        walletAddress: user.wallets[0]?.address || '0x...',
        network: 'ethereum',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      mockDb.createOrder(pendingOrder);
      throw new HttpResponse(
        JSON.stringify({ error: { code: 'TIMEOUT', message: 'Tempo limite de resposta excedido.' } }),
        { status: 504 }
      );
    }

    const body = (await request.json()) as any;
    const isPaymentRejected = scenario === 'payment_rejected';

    const orderId = `order-${Date.now()}`;
    const snapshots: OrderItemSnapshot[] = [];
    let subtotal = '0';

    for (const item of body.items || []) {
      const nft = mockDb.findNFTById(item.nftId);
      const edition = nft?.editions.find((e) => e.id === item.editionId);
      if (nft && edition) {
        const itemTotal = multiplyEth(edition.priceEth, item.quantity);
        subtotal = addEth(subtotal, itemTotal);
        snapshots.push({
          nftId: nft.id,
          nftTitle: nft.title,
          imageUrl: nft.imageUrl,
          editionId: edition.id,
          editionName: edition.name,
          quantity: item.quantity,
          unitPriceEth: edition.priceEth,
          totalPriceEth: itemTotal,
        });

        if (!isPaymentRejected) {
          mockDb.updateNFTPriceOrAvailability(
            nft.id,
            edition.id,
            edition.priceEth,
            Math.max(0, edition.availableQuantity - item.quantity)
          );
        }
      }
    }

    const networkFeeEth = '0.0042';
    const discountEth = body.discountEth || '0';
    const totalEth = addEth(subEth(subtotal, discountEth), networkFeeEth);

    const receipt: OrderReceipt = {
      transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: 19842104,
      network: body.network || 'ethereum',
      walletAddress: user.wallets.find((w) => w.id === body.walletId)?.address || user.wallets[0]?.address || '0x...',
      items: snapshots,
      subtotalEth: subtotal,
      discountEth,
      networkFeeEth,
      totalEth,
      confirmedAt: new Date().toISOString(),
      explorerUrl: `https://etherscan.io/tx/simulated`,
    };

    const newOrder: Order = {
      id: orderId,
      idempotencyKey,
      userId: user.id,
      status: isPaymentRejected ? 'rejected' : 'confirmed',
      rejectionReason: isPaymentRejected ? 'Saldo insuficiente na carteira para cobrir valor e gas.' : undefined,
      items: snapshots,
      subtotalEth: subtotal,
      discountEth,
      networkFeeEth,
      totalEth,
      walletAddress: receipt.walletAddress,
      network: body.network || 'ethereum',
      receipt: isPaymentRejected ? undefined : receipt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    mockDb.createOrder(newOrder);

    if (!isPaymentRejected) {
      mockDb.clearCart(user.id);
    }

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    await applyScenarioMiddlewares();
    const user = getAuthUser(request);
    if (!user) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }, { status: 401 });
    }
    const order = mockDb.findOrderById(params.id as string);
    if (!order) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Pedido não encontrado' } }, { status: 404 });
    }
    return HttpResponse.json({ order });
  }),
];

