import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api';
import { Order, CreateOrderInput } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useOrder(id?: string) {
  return useQuery<{ order: Order }>({
    queryKey: queryKeys.orders.detail(id || ''),
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.createOrder(input),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), { order });
      queryClient.setQueryData(queryKeys.cart, { items: [] });
    },
  });
}