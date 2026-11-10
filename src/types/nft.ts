export type NFTCategory = 'art' | 'collectibles' | 'gaming' | 'photography' | 'music';

export type NFTSortBy = 
  | 'price_asc'
  | 'price_desc'
  | 'recently_listed'
  | 'most_viewed'
  | 'highest_edition';

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
  category?: NFTCategory | 'all';
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
}