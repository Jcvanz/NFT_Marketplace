import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCart } from '../hooks/useCart';
import { useQuote } from '../hooks/useQuote';
import { useNFTs } from '../hooks/useNFTs';
import { formatEth } from '../lib/eth';
import { NFT } from '../types';
import {
  Trash2,
  ShoppingBag,
  Tag,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Busca NFTs para a seção "Colecionadores também viram"
  const { data: nftsData } = useNFTs({ limit: 12 });
  const allNfts = nftsData?.items || [];
  const recommendedNfts = allNfts.filter(
    (nft) => !items.some((item) => item.nftId === nft.id)
  );
  const displayRecommended =
    recommendedNfts.length > 0 ? recommendedNfts : allNfts;

  const { data: quote, isError: isQuoteError, error: quoteError } = useQuote(
    items,
    appliedCoupon
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponInput('');
    setCouponError(null);
  };

  const renderRecommendedCard = (nft: NFT) => (
    <div className="group relative rounded-[16px] flex flex-col justify-between transition-all hover:translate-y-[-2px] h-full">
      <div className="relative aspect-square w-full rounded-[16px] bg-[#241612] p-2.5 sm:p-3 border border-[#3F2319] overflow-hidden shadow-md flex items-center justify-center">
        <Link
          to="/nft/$id"
          params={{ id: nft.id }}
          className="w-full h-full block rounded-[12px] sm:rounded-[14px] overflow-hidden"
        >
          <img
            src={nft.imageUrl}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="pt-2 sm:pt-3 px-1">
        <div className="min-w-0 pr-1">
          <Link
            to="/nft/$id"
            params={{ id: nft.id }}
            className="text-xs sm:text-sm font-bold text-[#F5F1EB] hover:text-[#E89B55] transition-colors truncate block"
          >
            {nft.title}
          </Link>
        </div>

        <div className="shrink-0">
          <span className="text-xs sm:text-sm font-extrabold text-[#E89B55]">
            {formatEth(nft.priceEth)}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-4">
        <div className="h-6 w-36 rounded-lg bg-[#241612] animate-shimmer" />
        <div className="h-64 rounded-2xl bg-[#241612] animate-shimmer" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`container mx-auto pt-2 md:py-12 px-4 space-y-8 ${
          items.length > 0 ? 'pb-10 lg:pb-20' : ''
        }`}
      >
        <div className="flex sm:hidden items-center justify-between relative w-full mb-5">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-[#2F1D15] text-[#B39463] flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-[#F5F1EB] absolute left-1/2 -translate-x-1/2">
            Carrinho de NFTs
          </h1>
          <div className="w-10" />
        </div>

        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex text-xs sm:text-sm font-medium text-[#F5F1EB] items-center gap-2"
        >
          <Link to="/" className="hover:text-[#D28A4C] transition-colors">
            Início
          </Link>
          <span>/</span>
          <span>Mercado</span> 
          <span>/</span>
          <span>Carrinho</span>
        </nav>

        {/* Se o carrinho estiver vazio */}
        {items.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
            <ShoppingBag className="mx-auto h-16 w-16 text-[#B39463] stroke-[1.5]" />
            <h1 className="text-2xl font-bold text-[#F5F1EB]">
              Seu carrinho está vazio
            </h1>
            <p className="text-[#CFB28C] text-xs sm:text-sm leading-relaxed">
              Navegue pelo catálogo e descubra obras de arte e colecionáveis digitais únicos.
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
        ) : (
          /* Lista de produtos e Resumo  */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="hidden border-b border-[#D28A4C] pb-2 md:flex items-center justify-between gap-4 text-sm font-bold tracking-wider text-[#CFB28C] pr-4 sm:pr-6">
                <div className="flex-1 min-w-0 pl-1">NFTs</div>
                <div className="flex items-center justify-end gap-4 sm:gap-6 shrink-0">
                  <div className="w-[80px] text-center">Preço</div>
                  <div className="w-[100px] text-center">Edições</div>
                  <div className="w-[90px] text-right">Total</div>
                  <div className="w-7 shrink-0" />
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const hasAlert = item.hasPriceChanged || item.hasAvailabilityChanged;
                  const tokenId =
                    item.nftId.replace(/\D/g, '').padStart(4, '0') || '0042';
                  const totalItemPrice = (
                    parseFloat(item.priceEth) * item.quantity
                  ).toFixed(4);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg bg-[#241612] border border-[#3F2319] shadow-md transition-all ${
                        hasAlert ? 'border-amber-500/50 bg-amber-500/5' : ''
                      }`}
                    >
                      <div className="flex sm:hidden items-center justify-between gap-3 pr-3">
                        <div className="w-24 h-24 aspect-square rounded-lg overflow-hidden bg-[#180E0C] shrink-0 border border-[#3F2319]">
                          <img
                            src={item.nft.imageUrl}
                            alt={item.nft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between py-2">
                          <div className="h-12 flex flex-col">
                            <Link
                              to="/nft/$id"
                              params={{ id: item.nftId }}
                              className="text-xs sm:text-sm font-bold text-[#F5F1EB] hover:text-[#E89B55] transition-colors truncate block"
                            >
                              {item.nft.title}
                            </Link>
                            <span className="text-[11px] text-[#CFB28C] block truncate">
                              {item.edition.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-[#E89B55] block pt-0.5">
                            {formatEth(item.priceEth)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem(item.id);
                              } else {
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                });
                              }
                            }}
                            className="w-5 h-7 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] transition-colors cursor-pointer"
                            aria-label="Diminuir quantidade"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-[#F5F1EB]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="w-5 h-7 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] transition-colors cursor-pointer"
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-between gap-4 pr-4 sm:pr-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-lg overflow-hidden bg-[#180E0C] shrink-0 border border-[#3F2319]">
                            <img
                              src={item.nft.imageUrl}
                              alt={item.nft.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <Link
                              to="/nft/$id"
                              params={{ id: item.nftId }}
                              className="text-sm sm:text-base font-bold text-[#F5F1EB] hover:text-[#E89B55] transition-colors truncate block"
                            >
                              {item.nft.title}
                            </Link>
                            <span className="text-xs text-[#B39463] font-medium block">
                              ID do token: #{tokenId}
                            </span>

                            {hasAlert && (
                              <div className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium pt-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Preço/estoque atualizado</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 sm:gap-6 shrink-0">
                          <div className="text-center sm:w-[80px] shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-[#CFB28C]">
                              {formatEth(item.priceEth)}
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-2 sm:w-[100px] shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                })
                              }
                              className="w-5 h-7 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] transition-colors cursor-pointer"
                              aria-label="Diminuir quantidade"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-sm text-[#F5F1EB]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="w-5 h-7 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] transition-colors cursor-pointer"
                              aria-label="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right sm:w-[90px] shrink-0">
                            <span className="text-xs sm:text-base font-extrabold text-[#E89B55]">
                              {formatEth(totalItemPrice)}
                            </span>
                          </div>

                          <div className="w-7 flex items-center justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[#B39463] hover:text-destructive transition-colors p-1.5 rounded-lg cursor-pointer"
                              title="Excluir item do carrinho"
                              aria-label="Excluir item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="text-xs font-medium text-[#B39463] hover:text-destructive transition-colors cursor-pointer"
                >
                  Limpar todo o carrinho
                </button>
              </div>
            </div>

            {/* Resumo da Compra (Apenas Desktop) */}
            <div className="hidden lg:block lg:col-span-4 pb-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#F7F3EC] tracking-wide">
                  Resumo da carteira
                </h2>
                <div className="w-full border-b border-[#D28A4C]" />
              </div>

              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-semibold text-[#CFB28C] block">
                  Código promocional
                </label>
                <div className="relative rounded-sm overflow-hidden flex items-center w-full">
                  <input
                    type="text"
                    placeholder="Digite o código promocional..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/50 text-xs sm:text-sm pl-3.5 pr-24 py-3 rounded-sm border border-[#D28A4C] focus:outline-none focus:ring-1 focus:ring-[#D28A4C] uppercase placeholder:lowercase"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 py-2 bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] transition-colors cursor-pointer shadow-sm"
                  >
                    Aplicar
                  </button>
                </div>

                {/* Feedback de cupom aplicado ou erro */}
                {quote?.coupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 mt-2">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Tag className="h-3.5 w-3.5" />
                      {quote.coupon.code} (-{quote.coupon.discountPercentage}%)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[#CFB28C] hover:text-white underline cursor-pointer text-[11px]"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {isQuoteError && (
                  <p className="text-xs text-destructive pt-1">
                    {(quoteError as any)?.response?.data?.error?.message ||
                      'Código promocional inválido ou expirado.'}
                  </p>
                )}
              </form>

              {/* Informações da compra, cada item em uma linha */}
              <div className="space-y-3.5 border-t border-[#3F2319] pt-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#CFB28C]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#F5F1EB]">
                    {formatEth(quote?.subtotalEth || '0')}
                  </span>
                </div>

                {/* Desconto do lançamento */}
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
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#F5F1EB] block">
                      {formatEth(quote?.networkFeeEth || '0.0042')}
                    </span>
                    <span className="text-[10px] text-[#CFB28C]/70 block font-normal">
                      taxa estimada
                    </span>
                  </div>
                </div>

                {/* Total no valor da moeda negociada */}
                <div className="flex justify-between items-center border-t border-[#3F2319] pt-4 font-bold text-base">
                  <span className="text-[#F7F3EC]">Total</span>
                  <span className="text-xl sm:text-lg font-black text-[#E89B55]">
                    {formatEth(quote?.totalEth || '0')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate({ to: '/checkout' })}
                  className="w-full h-12 rounded-sm bg-[#D28A4C] text-[#140D0A] font-extrabold text-[16px] hover:bg-[#c0793b] transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center"
                >
                  Conectar e finalizar
                </button>

                <Link
                  to="/"
                  className="w-full text-center py-2 text-sm font-semibold text-[#E89B55] hover:text-[#f3b074] transition-colors cursor-pointer block"
                >
                  Continuar explorando
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO: COLECIONADORES TAMBÉM VIRAM (SWIPER) */}
        {displayRecommended.length > 0 && (
          <section className="space-y-6 pt-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#E89B55] pb-3 border-b border-[#E89B55] w-full">
              Colecionadores também viram
            </h2>

            <div className="w-full">
              <Swiper
                modules={[Pagination]}
                pagination={{
                  el: '.cart-swiper-pagination',
                  clickable: true,
                }}
                loop={false}
                spaceBetween={16}
                slidesPerView={1.4}
                breakpoints={{
                  480: { slidesPerView: 2.2, spaceBetween: 16 },
                  768: { slidesPerView: 3, spaceBetween: 20 },
                  1024: { slidesPerView: 5, spaceBetween: 20 },
                }}
                className="w-full !overflow-visible"
              >
                {displayRecommended.map((nft) => (
                  <SwiperSlide key={nft.id} className="!h-auto">
                    {renderRecommendedCard(nft)}
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="cart-swiper-pagination" />
            </div>
          </section>
        )}
      </div>

      {/* CAMPO FLUTUANTE FIXO NO MOBILE */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#241612] border-t border-[#3F2319] rounded-4xl p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] lg:hidden space-y-3">
          <form onSubmit={handleApplyCoupon} className="relative w-full">
            <input
              type="text"
              placeholder="Digite o código promocional..."
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/50 text-xs pl-4 pr-24 py-2.5 rounded-4xl border border-[#D28A4C] focus:outline-none focus:ring-1 focus:ring-[#D28A4C] uppercase placeholder:lowercase"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-1 h-full px-4 bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider rounded-4xl hover:bg-[#c0793b] transition-colors cursor-pointer shadow-sm"
            >
              Aplicar
            </button>
          </form>

          {/* Feedback de cupom aplicado ou erro no mobile */}
          {quote?.coupon && (
            <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-4xl border border-emerald-500/20">
              <span className="flex items-center gap-1.5 font-bold text-[11px]">
                <Tag className="h-3 w-3" />
                {quote.coupon.code} (-{quote.coupon.discountPercentage}%)
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[#CFB28C] hover:text-white underline cursor-pointer text-[10px]"
              >
                Remover
              </button>
            </div>
          )}

          {/* Infos: subtotal, desconto do lançamento, taxa de rede e total */}
          <div className="space-y-1.5 text-xs text-[#CFB28C] pt-0.5">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-semibold text-[#F5F1EB]">
                {formatEth(quote?.subtotalEth || '0')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Desconto do lançamento</span>
              <span className="font-semibold text-[#E89B55]">
                (-) {quote?.discountEth && quote.discountEth !== '0'
                  ? `-${formatEth(quote.discountEth)}`
                  : '0.0000 ETH'}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span>Taxa de rede</span>
                <span className="text-[10px] text-[#CFB28C]/70 block leading-tight">
                  taxa estimada
                </span>
              </div>
              <span className="font-semibold text-[#F5F1EB]">
                {formatEth(quote?.networkFeeEth || '0.0042')}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-[#3F2319] pt-2 font-bold text-sm">
              <span className="text-[#F7F3EC]">Total</span>
              <span className="text-base font-black text-[#E89B55]">
                {formatEth(quote?.totalEth || '0')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: '/checkout' })}
            className="w-full h-11 rounded-4xl bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm hover:bg-[#c0793b] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center tracking-wide"
          >
            Conectar e finalizar
          </button>
        </div>
      )}
    </>
  );
};

export default CartPage;
