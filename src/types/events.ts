import { OrderStatus } from './order';

export interface BaseSocketEvent {
  eventId: string;
  version: number;
  timestamp: string;
}

export interface NFTUpdatedEventPayload {
  nftId: string;
  editionId: string;
  previousPriceEth?: string;
  newPriceEth: string;
  availableQuantity: number;
  totalQuantity: number;
  isAvailable: boolean;
}

export interface NFTUpdatedEvent extends BaseSocketEvent {
  type: 'nft.updated';
  data: NFTUpdatedEventPayload;
}

export interface OrderUpdatedEventPayload {
  orderId: string;
  userId: string;
  status: OrderStatus;
  rejectionReason?: string;
  transactionHash?: string;
  confirmedAt?: string;
}

export interface OrderUpdatedEvent extends BaseSocketEvent {
  type: 'order.updated';
  data: OrderUpdatedEventPayload;
}

export type SocketEventMap = {
  'nft.updated': (event: NFTUpdatedEvent) => void;
  'order.updated': (event: OrderUpdatedEvent) => void;
};