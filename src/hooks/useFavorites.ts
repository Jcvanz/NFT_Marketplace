import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api';
import { NFT } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery<{ favorites: NFT[]; favoriteIds: string[] }>({
    queryKey: queryKeys.favorites,
    queryFn: () => favoritesApi.getFavorites(),
  });

  // Update com rollback 
  const toggleMutation = useMutation({
    mutationFn: (nftId: string) => favoritesApi.toggleFavorite(nftId),
    onMutate: async (nftId: string) => {
      // cancela as requisições
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      await queryClient.cancelQueries({ queryKey: queryKeys.nfts.all });

      // Snapshot dos valores anteriores
      const previousFavorites = queryClient.getQueryData<{ favorites: NFT[]; favoriteIds: string[] }>(
        queryKeys.favorites
      );

      // atualiza o cache
      if (previousFavorites) {
        const isCurrentlyFavorited = previousFavorites.favoriteIds.includes(nftId);
        const updatedIds = isCurrentlyFavorited
          ? previousFavorites.favoriteIds.filter((id) => id !== nftId)
          : [...previousFavorites.favoriteIds, nftId];

        queryClient.setQueryData(queryKeys.favorites, {
          ...previousFavorites,
          favoriteIds: updatedIds,
        });
      }

      // também atualiza o cache do NFT se estiver no cache
      const previousDetail = queryClient.getQueryData<{ nft: NFT }>(queryKeys.nfts.detail(nftId));
      if (previousDetail) {
        queryClient.setQueryData(queryKeys.nfts.detail(nftId), {
          ...previousDetail,
          nft: {
            ...previousDetail.nft,
            isFavorited: !previousDetail.nft.isFavorited,
          },
        });
      }

      return { previousFavorites, previousDetail, nftId };
    },
    onError: (err, nftId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites, context.previousFavorites);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.nfts.detail(nftId), context.previousDetail);
      }
    },
    onSettled: (data, error, nftId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.detail(nftId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });
    },
  });

  return {
    favorites: query.data?.favorites || [],
    favoriteIds: query.data?.favoriteIds || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    toggleFavorite: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}