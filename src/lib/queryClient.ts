import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Do not retry 4xx errors (e.g. 401, 404, 409)
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query key factories for cache invalidation and consistency
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  profile: ['profile'] as const,
  wallets: ['wallets'] as const,
  nfts: {
    all: ['nfts'] as const,
    list: (params?: any) => ['nfts', 'list', params] as const,
    detail: (id: string) => ['nfts', 'detail', id] as const,
  },
  favorites: ['favorites'] as const,
  cart: ['cart'] as const,
  quote: (items: any, couponCode?: string) => ['quote', { items, couponCode }] as const,
  orders: {
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
};

