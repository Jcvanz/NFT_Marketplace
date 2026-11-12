import { useEffect, useRef, useState } from 'react';
import { socket } from './socketClient';
import { NFTUpdatedEvent, OrderUpdatedEvent, CartItem } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { useAuth } from '../context/AuthContext';

export function useSocketReconciliation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Version tracking map (resourceId -> latestVersion) to discard obsolete or duplicate events
  const resourceVersions = useRef<Map<string, number>>(new Map());
  // Processed event IDs set to prevent duplicate event effects
  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('[Socket.IO] Conectado ao servidor de eventos em tempo real.');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('[Socket.IO] Desconectado. Tentando reconexão...');
    };

    // Reconcile active resources with REST API upon reconnection (as mandated by README)
    const handleReconnect = () => {
      setIsConnected(true);
      console.log('[Socket.IO] Reconectado! Reconciliando recursos ativos com REST API...');
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    // 1. Handle nft.updated event
    const handleNftUpdated = (event: NFTUpdatedEvent) => {
      // Deduplicate by eventId
      if (processedEventIds.current.has(event.eventId)) {
        return;
      }
      processedEventIds.current.add(event.eventId);

      // Check version monotonicity to avoid applying obsolete events
      const currentVersion = resourceVersions.current.get(event.data.nftId) || 0;
      if (event.version < currentVersion) {
        console.warn(`[Socket.IO] Evento obsoleto descartado para NFT ${event.data.nftId}: v${event.version} < v${currentVersion}`);
        return;
      }
      resourceVersions.current.set(event.data.nftId, event.version);

      const { nftId, editionId, newPriceEth, availableQuantity } = event.data;

      // A) Update NFT detail in query cache if present
      queryClient.setQueryData<{ nft: any }>(queryKeys.nfts.detail(nftId), (oldData) => {
        if (!oldData) return oldData;
        const updatedEditions = oldData.nft.editions.map((ed: any) =>
          ed.id === editionId
            ? { ...ed, priceEth: newPriceEth, availableQuantity }
            : ed
        );
        return {
          ...oldData,
          nft: {
            ...oldData.nft,
            priceEth: oldData.nft.currentEditionId === editionId ? newPriceEth : oldData.nft.priceEth,
            editions: updatedEditions,
            version: event.version,
          },
        };
      });

      // B) Invalidate catalog so lists reflect the update
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });

      // C) Inspect cart: if item is in the cart, reflect price/availability change & invalidate quote
      queryClient.setQueryData<{ items: CartItem[] }>(queryKeys.cart, (oldCart) => {
        if (!oldCart || !oldCart.items) return oldCart;

        let hasChanges = false;
        const updatedItems = oldCart.items.map((item) => {
          if (item.nftId === nftId && item.editionId === editionId) {
            hasChanges = true;
            const priceChanged = item.priceEth !== newPriceEth;
            const availabilityChanged = item.quantity > availableQuantity;

            return {
              ...item,
              currentPriceEth: newPriceEth,
              hasPriceChanged: priceChanged,
              hasAvailabilityChanged: availabilityChanged,
              edition: {
                ...item.edition,
                priceEth: newPriceEth,
                availableQuantity,
              },
            };
          }
          return item;
        });

        if (hasChanges) {
          // Invalidate quote to force user re-validation / prevent stale price checkout
          queryClient.invalidateQueries({ queryKey: ['quote'] });
        }

        return { items: updatedItems };
      });
    };

    // 2. Handle order.updated event
    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      // Discard duplicate events
      if (processedEventIds.current.has(event.eventId)) {
        return;
      }
      processedEventIds.current.add(event.eventId);

      // Prevent events from previous sessions or other users updating current user state
      if (user && event.data.userId !== user.id) {
        return;
      }

      const { orderId, status, rejectionReason, transactionHash, confirmedAt } = event.data;

      queryClient.setQueryData<{ order: any }>(queryKeys.orders.detail(orderId), (oldOrder) => {
        if (!oldOrder) return oldOrder;
        return {
          ...oldOrder,
          order: {
            ...oldOrder.order,
            status,
            rejectionReason,
            receipt:
              status === 'confirmed'
                ? {
                    ...oldOrder.order.receipt,
                    transactionHash,
                    confirmedAt,
                  }
                : undefined,
            version: event.version,
          },
        };
      });
    };

    // Attach listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.io.on('reconnect', handleReconnect);
    socket.on('nft.updated', handleNftUpdated);
    socket.on('order.updated', handleOrderUpdated);

    // Also support custom browser events for test/dev dispatch
    const handleBrowserNftUpdated = (e: CustomEvent) => handleNftUpdated(e.detail);
    const handleBrowserOrderUpdated = (e: CustomEvent) => handleOrderUpdated(e.detail);

    window.addEventListener('mock-socket-nft-updated' as any, handleBrowserNftUpdated);
    window.addEventListener('mock-socket-order-updated' as any, handleBrowserOrderUpdated);

    // Clean up listeners on unmount (mandated by README)
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect', handleReconnect);
      socket.off('nft.updated', handleNftUpdated);
      socket.off('order.updated', handleOrderUpdated);
      window.removeEventListener('mock-socket-nft-updated' as any, handleBrowserNftUpdated);
      window.removeEventListener('mock-socket-order-updated' as any, handleBrowserOrderUpdated);
    };
  }, [queryClient, user]);

  return { isConnected };
}

