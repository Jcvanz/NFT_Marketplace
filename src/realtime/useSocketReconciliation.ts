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

  // Versão do recurso para descartar eventos obsoletos ou duplicados
  const resourceVersions = useRef<Map<string, number>>(new Map());
  // IDs de eventos processados para evitar efeitos de eventos duplicados
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

    // Reconciliação de recursos ativos com REST API após reconexão     
    const handleReconnect = () => {
      setIsConnected(true);
      console.log('[Socket.IO] Reconectado! Reconciliando recursos ativos com REST API...');
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    // Lida com o evento nft.updated
    const handleNftUpdated = (event: NFTUpdatedEvent) => {
      // Deduplica por eventId
      if (processedEventIds.current.has(event.eventId)) {
        return;
      }
      processedEventIds.current.add(event.eventId);

      // Verifica a monotonicidade da versão para evitar a aplicação de eventos obsoletos
      const currentVersion = resourceVersions.current.get(event.data.nftId) || 0;
      if (event.version < currentVersion) {
        console.warn(`[Socket.IO] Evento obsoleto descartado para NFT ${event.data.nftId}: v${event.version} < v${currentVersion}`);
        return;
      }
      resourceVersions.current.set(event.data.nftId, event.version);

      const { nftId, editionId, newPriceEth, availableQuantity } = event.data;

      // Atualiza o detalhe do NFT no cache de consulta se presente
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

      // Invalida o catálogo para que as listas reflitam a atualização
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });

      // Invalida o carrinho para que os itens reflitam a atualização
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
          // Invalida a cotação para forçar a revalidação pelo usuário / evitar checkout com preço obsoleto
          queryClient.invalidateQueries({ queryKey: ['quote'] });
        }

        return { items: updatedItems };
      });
    };

    // Handle order.updated event
    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      // Descarta eventos duplicados
      if (processedEventIds.current.has(event.eventId)) {
        return;
      }
      processedEventIds.current.add(event.eventId);

      // Impede que eventos de sessões anteriores ou de outros usuários atualizem o estado do usuário atual
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

    // Adiciona listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.io.on('reconnect', handleReconnect);
    socket.on('nft.updated', handleNftUpdated);
    socket.on('order.updated', handleOrderUpdated);

    // Suporta eventos personalizados do navegador para despacho de teste/dev
    const handleBrowserNftUpdated = (e: CustomEvent) => handleNftUpdated(e.detail);
    const handleBrowserOrderUpdated = (e: CustomEvent) => handleOrderUpdated(e.detail);

    window.addEventListener('mock-socket-nft-updated' as any, handleBrowserNftUpdated);
    window.addEventListener('mock-socket-order-updated' as any, handleBrowserOrderUpdated);

    // Limpa os listeners na desmontagem
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

