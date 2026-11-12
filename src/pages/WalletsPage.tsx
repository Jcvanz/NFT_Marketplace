import React, { useState } from 'react';
import { useWallets } from '../hooks/useProfile';
import { formatEth } from '../lib/eth';
import { BlockchainNetwork } from '../types';
import { Wallet as WalletIcon, Plus, Shield } from 'lucide-react';

export const WalletsPage: React.FC = () => {
  const { wallets, addWallet, updateWallet, isAddingWallet } = useWallets();

  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [network, setNetwork] = useState<BlockchainNetwork>('ethereum');
  const [isPrimary, setIsPrimary] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    try {
      await addWallet({ address, label: label || 'Nova Carteira', network, isPrimary });
      setAddress('');
      setLabel('');
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar carteira.');
    }
  };

  const handleSetPrimary = async (walletId: string) => {
    try {
      await updateWallet({ walletId, updates: { isPrimary: true } });
    } catch (err: any) {
      alert(err.message || 'Erro ao definir carteira principal.');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Carteiras Conectadas</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D28A4C] text-[#140D0A] text-xs font-bold hover:bg-[#c0793b] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Carteira</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddWallet} className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm text-sm">
          <h2 className="font-bold text-base">Cadastrar Nova Carteira</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Endereço (0x...)</label>
              <input
                type="text"
                placeholder="0x71C...3a9F"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Identificador / Label</label>
              <input
                type="text"
                placeholder="Ex: Minha Ledger"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Rede Padrão</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum One</option>
                <option value="optimism">Optimism</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isPrimary" className="text-xs font-semibold cursor-pointer">
                Definir como carteira principal
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAddingWallet}
              className="px-4 py-2 rounded-lg bg-[#D28A4C] text-[#140D0A] text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {isAddingWallet ? 'Salvando...' : 'Salvar Carteira'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {wallets.map((w) => (
          <div
            key={w.id}
            className={`p-5 rounded-2xl border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
              w.isPrimary ? 'border-[#D28A4C] ring-1 ring-[#D28A4C]/20 bg-[#D28A4C]/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent text-[#D28A4C]">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{w.label}</h3>
                  {w.isPrimary && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D28A4C] text-[#140D0A]">
                      <Shield className="h-3 w-3" />
                      Principal
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-muted-foreground block mt-0.5">
                  {w.address}
                </span>
                <span className="text-xs text-muted-foreground uppercase font-semibold mt-1 block">
                  Rede: {w.network}
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
              <div className="text-left sm:text-right">
                <span className="text-xs text-muted-foreground block">Saldo</span>
                <span className="font-bold text-base text-[#E89B55]">{formatEth(w.balanceEth)}</span>
              </div>

              {!w.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(w.id)}
                  className="text-xs font-semibold text-[#E89B55] hover:underline cursor-pointer"
                >
                  Tornar Principal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletsPage;
