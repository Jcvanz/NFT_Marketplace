import { BlockchainNetwork } from './wallet';

export type OrderStatus = 'pending' | 'confirmed' | 'rejected';

export interface OrderItemSnapshot {
  nftId: string;
  nftTitle: string;
  imageUrl: string;
  editionId: string;
  editionName: string;
  quantity: number;
  unitPriceEth: string;
  totalPriceEth: string;
}

export interface OrderReceipt {
  transactionHash: string;
  blockNumber: number;
  network: BlockchainNetwork;
  walletAddress: string;
  items: OrderItemSnapshot[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  confirmedAt: string;
  explorerUrl: string;
}

export interface Order {
  id: string;
  idempotencyKey: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  walletAddress: string;
  network: BlockchainNetwork;
  receipt?: OrderReceipt;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  walletId: string;
  network: BlockchainNetwork;
  quoteId: string;
  items: {
    nftId: string;
    editionId: string;
    quantity: number;
  }[];
  couponCode?: string;
}