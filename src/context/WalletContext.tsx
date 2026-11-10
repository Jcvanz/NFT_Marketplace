import React, { createContext, useContext, useState, useEffect } from 'react';
import { Wallet, BlockchainNetwork } from '../types';
import { useWallets } from '../hooks/useProfile';

interface WalletContextType {
  selectedWallet: Wallet | null;
  selectedNetwork: BlockchainNetwork;
  isConnecting: boolean;
  connectionError: string | null;
  selectWallet: (walletId: string) => void;
  switchNetwork: (network: BlockchainNetwork) => void;
  connectWallet: (walletId: string, simulateFailure?: boolean) => Promise<boolean>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallets } = useWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('ethereum');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Seleção automática da carteira principal
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const primary = wallets.find((w) => w.isPrimary) || wallets[0];
      setSelectedWalletId(primary.id);
      setSelectedNetwork(primary.network);
    }
  }, [wallets, selectedWalletId]);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || null;

  const selectWallet = (walletId: string) => {
    const target = wallets.find((w) => w.id === walletId);
    if (target) {
      setSelectedWalletId(walletId);
      setSelectedNetwork(target.network);
      setConnectionError(null);
    }
  };

  const switchNetwork = (network: BlockchainNetwork) => {
    setSelectedNetwork(network);
  };

  // Simula a conexão com a carteira
  const connectWallet = async (walletId: string, simulateFailure: boolean = false): Promise<boolean> => {
    setIsConnecting(true);
    setConnectionError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsConnecting(false);
        if (simulateFailure) {
          setConnectionError('Rejeitado a conexão pelo usuário');
          resolve(false);
        } else {
          selectWallet(walletId);
          resolve(true);
        }
      }, 600);
    });
  };

  const disconnectWallet = () => {
    setSelectedWalletId(null);
    setConnectionError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        selectedWallet,
        selectedNetwork,
        isConnecting,
        connectionError,
        selectWallet,
        switchNetwork,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider');
  }
  return context;
}

