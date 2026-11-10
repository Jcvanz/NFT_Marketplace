import { NFT, NFTEdition } from './nft';

export interface CartItem {
  id: string;
  nftId: string;
  editionId: string;
  quantity: number;
  priceEth: string;
  currentPriceEth: string;
  hasPriceChanged?: boolean;
  hasAvailabilityChanged?: boolean;
  nft: NFT;
  edition: NFTEdition;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  discountEth?: string;
  expiresAt: string;
  isValid: boolean;
  description?: string;
}

export interface CartQuote {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  coupon?: Coupon | null;
  items: CartItem[];
  quotedAt: string;
  quoteId: string;
  isStale?: boolean;
}

export interface AddToCartInput {
  nftId: string;
  editionId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}