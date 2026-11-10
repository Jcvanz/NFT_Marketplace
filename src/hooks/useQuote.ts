import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '../api';
import { CartItem, CartQuote } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useQuote(items: CartItem[], couponCode?: string) {
  const quoteItemsPayload = items.map((i) => ({
    nftId: i.nftId,
    editionId: i.editionId,
    quantity: i.quantity,
  }));

  const isEnabled = items.length > 0;

  return useQuery<CartQuote>({
    queryKey: queryKeys.quote(quoteItemsPayload, couponCode),
    queryFn: () => quoteApi.getQuote({ items: quoteItemsPayload, couponCode }),
    enabled: isEnabled,
  });
}