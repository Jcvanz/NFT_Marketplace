import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '../types';
import { mockDb } from './db';

export const socketLink = ws.link(/^wss?:\/\/.*\/socket\.io\/.*/);

const activeClients = new Set<any>();

export const socketHandler = socketLink.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  activeClients.add(io.client);

  connection.client.addEventListener('close', () => {
    activeClients.delete(io.client);
  });

  io.client.on('ping', () => {
    io.client.emit('pong');
  });
});

export function emitNftUpdated(
  nftId: string,
  editionId: string,
  newPriceEth: string,
  availableQuantity: number
): void {
  const updatedNft = mockDb.updateNFTPriceOrAvailability(nftId, editionId, newPriceEth, availableQuantity);

  const event: NFTUpdatedEvent = {
    type: 'nft.updated',
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    version: updatedNft ? updatedNft.version : Date.now(),
    timestamp: new Date().toISOString(),
    data: {
      nftId,
      editionId,
      newPriceEth,
      availableQuantity,
      totalQuantity: updatedNft?.editions.find((e) => e.id === editionId)?.totalQuantity || 10,
      isAvailable: availableQuantity > 0,
    },
  };

  activeClients.forEach((client) => {
    try {
      client.emit('nft.updated', event);
    } catch (e) {
      console.warn('Failed to emit to client socket', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mock-socket-nft-updated', { detail: event }));
  }
}

export function emitOrderUpdated(
  orderId: string,
  userId: string,
  status: 'pending' | 'confirmed' | 'rejected',
  rejectionReason?: string
): void {
  mockDb.updateOrderStatus(orderId, status, rejectionReason);
  const order = mockDb.findOrderById(orderId);

  const event: OrderUpdatedEvent = {
    type: 'order.updated',
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    version: order ? order.version : 1,
    timestamp: new Date().toISOString(),
    data: {
      orderId,
      userId,
      status,
      rejectionReason,
      transactionHash: order?.receipt?.transactionHash,
      confirmedAt: order?.receipt?.confirmedAt,
    },
  };

  activeClients.forEach((client) => {
    try {
      client.emit('order.updated', event);
    } catch (e) {
      console.warn('Failed to emit to client socket', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mock-socket-order-updated', { detail: event }));
  }
}
