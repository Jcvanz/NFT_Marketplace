import { useQuery } from '@tanstack/react-query';
import { nftsApi } from '../api';
import { NFTQueryParams, NFTListResponse } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useNFTs(params?: NFTQueryParams) {
  return useQuery<NFTListResponse>({
    queryKey: queryKeys.nfts.list(params),
    queryFn: () => nftsApi.getNFTs(params),
    placeholderData: (previousData) => previousData, 
  });
}