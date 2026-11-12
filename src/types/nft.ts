export type NFTCategory = 
  | 'all'
  | 'art'
  | 'photography'
  | 'music'
  | '3d'
  | 'collectibles'
  | 'generative'
  | 'gaming'
  | 'subscriptions'
  | 'utility'
  | string;

export type NFTSortBy = 
  | 'price_asc'
  | 'price_desc'
  | 'recently_listed'
  | 'most_viewed'
  | 'highest_edition';

export type NFTQuickFilter = 'all' | 'new' | 'releases' | 'trending';

export interface NFTEdition {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  priceEth: string; 
}

export interface NFT {
  id: string;
  title: string;
  description: string;
  category: NFTCategory;
  imageUrl: string;
  galleryUrls?: string[];
  creator: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
    verified?: boolean;
  };
  collection?: {
    id: string;
    name: string;
  };
  priceEth: string; 
  currency?: string;
  network?: 'ethereum' | 'polygon' | 'solana';
  isFeatured?: boolean;
  isNew?: boolean;
  isRelease?: boolean;
  isTrending?: boolean;
  editions: NFTEdition[];
  currentEditionId: string;
  viewsCount: number;
  likesCount: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface NFTQueryParams {
  search?: string;
  category?: string;
  network?: string;
  quickFilter?: NFTQuickFilter;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: NFTSortBy;
  page?: number;
  limit?: number;
}

export interface NFTListResponse {
  items: NFT[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categoryCounts?: Record<string, number>;
  networkCounts?: Record<string, number>;
}
