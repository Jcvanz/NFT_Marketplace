import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, walletsApi } from '../api';
import { User, Wallet, UpdateProfileInput, ChangePasswordInput, ConnectWalletInput, UpdateWalletInput } from '../types';
import { queryKeys } from '../lib/queryClient';

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery<{ user: User }>({
    queryKey: queryKeys.profile,
    queryFn: () => profileApi.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: UpdateProfileInput) => profileApi.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (input: ChangePasswordInput) => profileApi.changePassword(input),
  });

  return {
    user: profileQuery.data?.user,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    refetchProfile: profileQuery.refetch,
  };
}

export function useWallets() {
  const queryClient = useQueryClient();

  const walletsQuery = useQuery<{ wallets: Wallet[] }>({
    queryKey: queryKeys.wallets,
    queryFn: () => walletsApi.getWallets(),
  });

  const addWalletMutation = useMutation({
    mutationFn: (input: ConnectWalletInput) => walletsApi.addWallet(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: ({ walletId, updates }: { walletId: string; updates: UpdateWalletInput }) =>
      walletsApi.updateWallet(walletId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });

  return {
    wallets: walletsQuery.data?.wallets || [],
    isLoading: walletsQuery.isLoading,
    isError: walletsQuery.isError,
    addWallet: addWalletMutation.mutateAsync,
    isAddingWallet: addWalletMutation.isPending,
    updateWallet: updateWalletMutation.mutateAsync,
    isUpdatingWallet: updateWalletMutation.isPending,
    refetchWallets: walletsQuery.refetch,
  };
}