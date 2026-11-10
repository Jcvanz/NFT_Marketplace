import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api';
import { CartItem, AddToCartInput } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useCart() {
  const queryClient = useQueryClient();

  const query = useQuery<{ items: CartItem[] }>({
    queryKey: queryKeys.cart,
    queryFn: () => cartApi.getCart(),
  });

  const addToCartMutation = useMutation({
    mutationFn: (input: AddToCartInput) => cartApi.addToCart(input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateCartItem(id, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => cartApi.removeFromCart(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.cart, { items: [] });
    },
  });

  const mergeCartMutation = useMutation({
    mutationFn: () => cartApi.mergeGuestCart(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });

  return {
    items: query.data?.items || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addToCart: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdating: updateQuantityMutation.isPending,
    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
    clearCart: clearCartMutation.mutateAsync,
    mergeCart: mergeCartMutation.mutateAsync,
    refetch: query.refetch,
  };
}

