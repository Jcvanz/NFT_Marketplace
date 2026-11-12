import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useCart } from '../hooks/useCart';
import { useQuote } from '../hooks/useQuote';
import { useCreateOrder } from '../hooks/useOrders';
import { formatEth } from '../lib/eth';
import { BlockchainNetwork } from '../types';
import { Tag, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { OrderConfirmationModal } from '../components/OrderConfirmationModal';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedWallet, selectedNetwork, switchNetwork } = useWallet();
  const { items } = useCart();
  const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder();

  const [idempotencyKey] = useState(
    () => `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do formulário "Perfil do colecionador"
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.handle || '');
  const [network, setNetwork] = useState<BlockchainNetwork>(selectedNetwork || 'ethereum');
  const [profileName, setProfileName] = useState('');
  const [walletAddress, setWalletAddress] = useState(
    selectedWallet?.address || user?.wallets?.[0]?.address || '0x71C...49A'
  );
  const [secondaryAddress, setSecondaryAddress] = useState('');
  const [walletType, setWalletType] = useState('metamask');
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [ensName, setEnsName] = useState('');
  const [useOtherWallet, setUseOtherWallet] = useState(false);
  const [collectorNotes, setCollectorNotes] = useState('');

  // Cupom promocional
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);

  // Seleção de carteira no bloco direito
  const [selectedWalletType, setSelectedWalletType] = useState('multi');

  const { data: quote, isLoading: isQuoteLoading } = useQuote(items, appliedCoupon);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setAppliedCoupon(promoInput.trim().toUpperCase());
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      setOrderError('Seu carrinho está vazio.');
      return;
    }

    if (!displayName.trim() || !username.trim() || !walletAddress.trim() || !email.trim()) {
      setOrderError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setOrderError(null);

    try {
      const order = await createOrder({
        idempotencyKey,
        walletId: selectedWallet?.id || user?.wallets?.[0]?.id || 'wallet-1',
        network,
        quoteId: quote?.quoteId || `quote-${Date.now()}`,
        items: items.map((i) => ({
          nftId: i.nftId,
          editionId: i.editionId,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon || quote?.coupon?.code,
      });

      if (order.status === 'rejected') {
        setOrderError(
          order.rejectionReason || 'A transação foi recusada pela simulação de rede.'
        );
      } else {
        setConfirmedOrder(order);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setOrderError(
        err.response?.data?.error?.message || err.message || 'Erro ao processar pedido.'
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-6">
        <nav
          aria-label="Breadcrumb"
          className="text-xs sm:text-sm font-medium text-[#CFB28C] flex items-center gap-2"
        >
          <Link to="/" className="hover:text-[#D28A4C] transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link to="/" hash="catalogo" className="hover:text-[#D28A4C] transition-colors">
            Mercado
          </Link>
          <span>/</span>
          <span className="text-[#F5F1EB]">Pagamento</span>
        </nav>

        <div className="bg-[#241612] rounded-[20px] border border-[#3F2319] p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
          <ShoppingBag className="mx-auto h-16 w-16 text-[#B39463] stroke-[1.5]" />
          <h1 className="text-2xl font-bold text-[#F5F1EB]">Nenhum item para pagamento</h1>
          <p className="text-[#CFB28C] text-xs sm:text-sm leading-relaxed">
            Seu carrinho está vazio. Adicione NFTs ao carrinho antes de prosseguir com o pagamento.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D28A4C] text-[#140D0A] font-bold text-sm hover:bg-[#c0793b] transition-all shadow-md"
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="text-xs sm:text-sm font-medium text-[#CFB28C] flex items-center gap-2"
      >
        <Link to="/" className="hover:text-[#D28A4C] transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link to="/" hash="catalogo" className="hover:text-[#D28A4C] transition-colors">
          Mercado
        </Link>
        <span>/</span>
        <span className="text-[#F5F1EB]">Pagamento</span>
      </nav>

      {/* Mensagem de Erro Geral */}
      {orderError && (
        <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form "Perfil do colecionador" */}
        <div className="lg:col-span-8 lg:pr-4 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F1EB] pb-3 border-b border-[#3F2319]">
            Perfil do colecionador  
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome de exibição */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Nome de exibição <span className="text-[#F0805F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nome de exibição..."
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>

              {/* Nome de usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Nome de usuário <span className="text-[#F0805F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@usuario..."
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>

              {/* Rede */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Rede <span className="text-[#F0805F]">*</span>
                </label>
                <select
                  value={network}
                  onChange={(e) => {
                    const net = e.target.value as BlockchainNetwork;
                    setNetwork(net);
                    switchNetwork(net);
                  }}
                  className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                >
                  <option value="ethereum">Ethereum Mainnet</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum One</option>
                  <option value="optimism">Optimism</option>
                </select>
              </div>

              {/* Nome do perfil */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Nome do perfil
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nome do perfil..."
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>
            </div>

            {/* Endereço da carteira e ao lado ENS ou carteira secundária */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Endereço da carteira <span className="text-[#F0805F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  ENS ou carteira secundária (opcional)
                </label>
                <input
                  type="text"
                  value={secondaryAddress}
                  onChange={(e) => setSecondaryAddress(e.target.value)}
                  placeholder="ex: colecionador.eth"
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tipo de carteira */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Tipo de carteira <span className="text-[#F0805F]">*</span>
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                >
                  <option value="metamask">MetaMask</option>
                  <option value="coinbase">Coinbase Wallet</option>
                  <option value="walletconnect">WalletConnect</option>
                  <option value="phantom">Phantom</option>
                </select>
              </div>

              {/* Código de indicação */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Código de indicação
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Código de indicação..."
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  E-mail <span className="text-[#F0805F]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                />
              </div>

              {/* Nome ENS */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Nome ENS
                </label>
                <select
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C]"
                >
                  <option value="">Selecione um domínio ENS (opcional)</option>
                  <option value="colecionador.eth">colecionador.eth</option>
                  <option value="kurio.eth">kurio.eth</option>
                  <option value="ape.eth">ape.eth</option>
                </select>
              </div>
            </div>

            {/* Usar outra carteira? */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="useOtherWallet"
                checked={useOtherWallet}
                onChange={(e) => setUseOtherWallet(e.target.checked)}
                className="w-4 h-4 rounded border-[#3F2319] accent-[#D28A4C] cursor-pointer"
              />
              <label
                htmlFor="useOtherWallet"
                className="text-xs sm:text-sm font-medium text-[#F5F1EB] cursor-pointer"
              >
                Usar outra carteira?
              </label>
            </div>

            {/* Observação do colecionador */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#CFB28C] block">
                Observação do colecionador (opcional)
              </label>
              <textarea
                rows={3}
                value={collectorNotes}
                onChange={(e) => setCollectorNotes(e.target.value)}
                placeholder="Instruções ou notas do colecionador..."
                className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Seus NFTs + Resumo + Carteiras */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F1EB]">
              Seus NFTs
            </h2>
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#CFB28C] pb-2 border-b border-[#D28A4C]">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>
          </div>

          {/* Cards dos NFTs comprados / do carrinho */}
          <div className="space-y-3">
            {items.map((item) => {
              const tokenId = item.nftId.replace(/\D/g, '').padStart(4, '0') || '0042';
              const totalItemPrice = (parseFloat(item.priceEth) * item.quantity).toFixed(4);

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-[#241612] border border-[#3F2319] pr-4 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-lg overflow-hidden bg-[#180E0C] shrink-0 border border-[#3F2319]">
                    <img
                      src={item.nft.imageUrl}
                      alt={item.nft.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-[#F5F1EB] truncate block">
                      {item.nft.title}
                    </span>
                    <span className="text-[11px] text-[#B39463] font-medium block">
                      ID do token: #{tokenId}
                    </span>
                  </div>

                  <div className="shrink-0 text-xs sm:text-sm font-semibold text-[#CFB28C]">
                    (x {item.quantity})
                  </div>

                  <div className="shrink-0 text-xs font-extrabold text-[#E89B55] text-right min-w-[70px]">
                    {formatEth(totalItemPrice)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPromoInput((prev) => !prev)}
                className="text-xs sm:text-sm font-semibold text-[#F5F1EB] hover:text-[#E89B55] transition-colors underline cursor-pointer"
              >
                Tem um código promocional? Aplique aqui
              </button>
            </div>

            {showPromoInput && (
              <form onSubmit={handleApplyCoupon} className="relative rounded-sm overflow-hidden flex items-center w-full">
                <input
                  type="text"
                  placeholder="Digite o código promocional..."
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/50 text-xs pl-3.5 pr-20 py-2.5 rounded-sm border border-[#D28A4C] uppercase placeholder:lowercase focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase cursor-pointer"
                >
                  Aplicar
                </button>
              </form>
            )}

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1.5 font-bold text-[11px]">
                  <Tag className="h-3 w-3" />
                  Cupom {appliedCoupon}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(undefined);
                    setPromoInput('');
                  }}
                  className="text-[#CFB28C] hover:text-white underline cursor-pointer text-[10px]"
                >
                  Remover
                </button>
              </div>
            )}

            <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-[#CFB28C]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#F5F1EB]">
                  {formatEth(quote?.subtotalEth || '0')}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#CFB28C]">
                <span>Desconto do lançamento</span>
                <span className="font-semibold text-[#E89B55]">
                  (-) {quote?.discountEth && quote.discountEth !== '0'
                    ? `-${formatEth(quote.discountEth)}`
                    : '0.0000 ETH'}
                </span>
              </div>

              <div className="flex justify-between items-start text-[#CFB28C]">
                <div>
                  <span>Taxa de rede</span>
                  <span className="text-[10px] text-[#CFB28C]/70 block font-normal leading-tight">
                    taxa estimada
                  </span>
                </div>
                <span className="font-semibold text-[#F5F1EB]">
                  {formatEth(quote?.networkFeeEth || '0.0042')}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-[#3F2319] pt-3 font-bold text-base">
                <span className="text-[#F5F1EB]">Total</span>
                <span className="text-sm sm:text-base font-black text-[#E89B55]">
                  {formatEth(quote?.totalEth || '0')}
                </span>
              </div>
            </div>
          </div>

          {/* CARTEIRAS E REDE */}
          <div className="space-y-3 pt-4 border-t border-[#3F2319]">
            <h3 className="text-center font-bold text-sm sm:text-base text-[#F5F1EB]">
              Carteira e rede
            </h3>

            <div className="space-y-2.5">
              {[
                { id: 'multi', label: 'METAMASK  •  WALLETCONNECT  •  COINBASE' },
                { id: 'metamask', label: 'MetaMask' },
                { id: 'coinbase', label: 'Coinbase Wallet' },
              ].map((w) => {
                const isSelected = selectedWalletType === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWalletType(w.id)}
                    className={`p-3 sm:p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#D28A4C] bg-[#241612]'
                        : 'border-[#3F2319] bg-[#241612]/60 hover:border-[#D28A4C]/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-[#D28A4C] bg-[#D28A4C]'
                          : 'border-[#CFB28C]/40 bg-[#180E0C]'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#140D0A]" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-wide truncate ${
                        isSelected ? 'text-[#F5F1EB]' : 'text-[#CFB28C]'
                      }`}
                    >
                      {w.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || isQuoteLoading || items.length === 0}
            onClick={handleConfirmOrder}
            className="w-full h-12 rounded-xl bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm sm:text-base tracking-wide hover:bg-[#c0793b] active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Confirmando compra...</span>
              </div>
            ) : (
              <span>Confirmar compra</span>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Pedido */}
      <OrderConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate({ to: '/' });
        }}
        order={confirmedOrder}
        walletLabel={
          selectedWalletType === 'metamask'
            ? 'MetaMask'
            : selectedWalletType === 'coinbase'
            ? 'Coinbase Wallet'
            : 'MetaMask • WalletConnect'
        }
      />
    </div>
  );
};

export default CheckoutPage;
