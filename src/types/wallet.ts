export type BlockchainNetwork = 
  | 'ethereum' 
  | 'polygon' 
  | 'arbitrum' 
  | 'optimism';

export interface Wallet {
  id: string;
  address: string;
  network: BlockchainNetwork;
  isPrimary: boolean;
  label: string;
  balanceEth: string; 
  status: 'connected' | 'disconnected' | 'connecting';
  createdAt: string;
}

export interface ConnectWalletInput {
  address: string;
  network: BlockchainNetwork;
  label?: string;
  isPrimary?: boolean;
}

export interface UpdateWalletInput {
  label?: string;
  isPrimary?: boolean;
  network?: BlockchainNetwork;
}