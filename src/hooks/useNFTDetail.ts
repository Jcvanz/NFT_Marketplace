import { useQuery } from '@tanstack/react-query';
import { nftsApi } from '../api';
import { NFT } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useNFTDetail(id: string) {
  return useQuery<{ nft: NFT }>({
    queryKey: queryKeys.nfts.detail(id),
    queryFn: () => nftsApi.getNFTById(id),
    enabled: Boolean(id),
  });
}

