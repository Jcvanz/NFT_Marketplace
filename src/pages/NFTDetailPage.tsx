import React, { useState } from 'react';
import { useNavigate, Link, useParams } from '@tanstack/react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCart } from '../hooks/useCart';
import { useNFTDetail } from '../hooks/useNFTDetail';
import { useNFTs } from '../hooks/useNFTs';
import { formatEth } from '../lib/eth';
import {
  Search,
  Star,
  Heart,
  Mail,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  ShoppingCart,
  ChevronLeft,
} from 'lucide-react';
import { image1, image2, image3 } from '../assets';

const EDITION_OPTIONS = ['1/1', '1/10', '1/50', 'ABERTA'] as const;
type EditionOption = (typeof EDITION_OPTIONS)[number];

const FALLBACK_GALLERY = [
  image1,
  image2,
  image3,
];

const COLLECTOR_REVIEWS = [
  {
    id: 1,
    name: 'Lucas Ferreira',
    handle: '@lucas.eth',
    avatar: image1,
    rating: 5,
    date: '14 de outubro, 2026',
    comment:
      'Obra impressionante! A riqueza de detalhes e a exclusividade da coleção tornam este NFT uma das peças centrais da minha carteira.',
  },
  {
    id: 2,
    name: 'Mariana Costa',
    handle: '@maricosta',
    avatar: image2,
    rating: 5,
    date: '02 de outubro, 2026',
    comment:
      'Processo de cunhagem e transferência super rápido na Kurio. A verificação on-chain traz total segurança para colecionadores.',
  },
  {
    id: 3,
    name: 'Rafael Mendes',
    handle: '@rafamendes.sol',
    avatar: image3,
    rating: 5,
    date: '19 de setembro, 2026',
    comment:
      'Excelente curadoria artística. Já acompanho o trabalho do criador há meses e esta edição superou todas as expectativas.',
  },
];

export const NFTDetailPage: React.FC = () => {
  const { id } = useParams({ from: '/nft/$id' });
  const navigate = useNavigate();
  const { data, isLoading, isError } = useNFTDetail(id);
  const { addToCart, isAdding } = useCart();

  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0);
  const [selectedEditionOpt, setSelectedEditionOpt] = useState<EditionOption>('1/1');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Busca NFTs relacionados para "Mais desta coleção"
  const { data: relatedData } = useNFTs({ limit: 10 });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-[#241612] animate-shimmer" />
          <div className="space-y-6">
            <div className="h-8 w-2/3 rounded-lg bg-[#241612] animate-shimmer" />
            <div className="h-4 w-1/3 rounded-lg bg-[#241612] animate-shimmer" />
            <div className="h-24 rounded-lg bg-[#241612] animate-shimmer" />
            <div className="h-12 w-full rounded-lg bg-[#241612] animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.nft) {
    return (
      <div className="container mx-auto py-16 px-4 text-center max-w-md space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-[#F5F1EB]">NFT não encontrado</h1>
        <p className="text-[#CFB28C] text-sm">
          O identificador "{id}" não corresponde a nenhum item ativo em nosso catálogo.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D28A4C] text-[#140D0A] font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const nft = data.nft;

  // Monta exatamente 4 miniaturas para a galeria vertical
  const safeMainImg =
    nft.imageUrl && !nft.imageUrl.includes('unsplash') ? nft.imageUrl : image1;
  const rawGallery =
    nft.galleryUrls && nft.galleryUrls.length > 0
      ? nft.galleryUrls.map((url, i) => (url && !url.includes('unsplash') ? url : FALLBACK_GALLERY[i % 3]))
      : [safeMainImg];
  const gallery4 = [
    rawGallery[0] || safeMainImg,
    rawGallery[1] || FALLBACK_GALLERY[1],
    rawGallery[2] || FALLBACK_GALLERY[2],
    rawGallery[3] || FALLBACK_GALLERY[0],
  ];
  const displayImage = gallery4[selectedThumbIndex] || safeMainImg;

  // Mapeia a opção de edição selecionada para uma edição real do NFT
  const editionIndex = EDITION_OPTIONS.indexOf(selectedEditionOpt);
  const currentEdition = nft.editions[editionIndex] || nft.editions[0];
  const maxAvailable = Math.max(1, currentEdition?.availableQuantity || 10);
  const isSoldOut = currentEdition && currentEdition.availableQuantity <= 0;

  // Funções para alterar a quantidade
  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrement = () => {
    setQuantity((q) => Math.min(maxAvailable, q + 1));
  };

  const handleBuy = async () => {
    try {
      await addToCart({
        nftId: nft.id,
        editionId: currentEdition.id,
        quantity,
      });
      setActionSuccess('Item adicionado! Redirecionando...');
      setTimeout(() => {
        setActionSuccess(null);
        navigate({ to: '/cart' });
      }, 600);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar item ao carrinho');
    }
  };

  const handleAddToCartOnly = async () => {
    try {
      await addToCart({
        nftId: nft.id,
        editionId: currentEdition.id,
        quantity,
      });
      setActionSuccess('Adicionado ao carrinho!');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar ao carrinho');
    }
  };

  // Filtra NFTs relacionados (excluindo o atual)
  const relatedNfts = (relatedData?.items || []).filter((item) => item.id !== nft.id);

  const renderRelatedCard = (item: typeof nft) => (
    <div className="group relative rounded-[16px] flex flex-col justify-between transition-all hover:translate-y-[-2px] h-full">
      <div className="relative aspect-square w-full rounded-[16px] bg-[#241612] p-2.5 sm:p-3 border border-[#3F2319] overflow-hidden shadow-md flex items-center justify-center">
        <Link
          to="/nft/$id"
          params={{ id: item.id }}
          className="w-full h-full block rounded-[12px] sm:rounded-[14px] overflow-hidden"
        >
          <img
            src={
              item.imageUrl && !item.imageUrl.includes('unsplash')
                ? item.imageUrl
                : image1
            }
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="pt-2 sm:pt-3 px-1">
        <div className="min-w-0 pr-1">
          <Link
            to="/nft/$id"
            params={{ id: item.id }}
            className="text-xs sm:text-sm font-bold text-[#F5F1EB] hover:text-[#E89B55] transition-colors truncate block"
          >
            {item.title}
          </Link>
        </div>

        <div className="shrink-0">
          <span className="text-xs sm:text-sm font-extrabold text-[#E89B55]">
            {item.priceEth} {item.currency || 'ETH'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="container mx-auto py-6 md:py-12 px-4 space-y-12 pb-12">
        {/* ======================================================== */}
        {/* TOPO MOBILE: Botão de Voltar + Favoritar (fundo #2F1D15, ícone #B39463) */}
        {/* ======================================================== */}
        <div className="flex mb-4 pt-0 md:hidden items-center justify-between w-full">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-[#2F1D15] text-[#B39463] flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFavorited((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-[#2F1D15] text-[#B39463] flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            aria-label="Favoritar NFT"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-[#B39463]' : ''}`} />
          </button>
        </div>

      {/* ======================================================== */}
      {/* 1. BREADCRUMB (Desktop e Tablet) */}
      {/* ======================================================== */}
      <nav
        aria-label="Breadcrumb"
        className="hidden md:flex text-xs sm:text-sm font-medium text-[#CFB28C] items-center gap-2"
      >
        <Link to="/" className="hover:text-[#D28A4C] transition-colors">
          Início
        </Link>
        <span>/</span>
        <span className="text-[#F5F1EB]">Mercado</span>
      </nav>

      {/* ======================================================== */}
      {/* 2. GALERIA + INFORMAÇÕES DO PRODUTO */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LADO ESQUERDO: Thumb vertical (4 imagens) + Imagem Grande Selecionada */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-stretch">
          {/* Thumb em vertical exibindo 4 imagens do produto */}
          <div className="flex flex-row sm:flex-col gap-3 sm:w-26 lg:w-30 shrink-0">
            {gallery4.map((imgUrl, idx) => {
              const isSelected = selectedThumbIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedThumbIndex(idx)}
                  className={`flex-1 sm:flex-none aspect-square rounded-[14px] overflow-hidden border-2 bg-[#241612] p-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#D28A4C] shadow-md'
                      : 'border-[#3F2319] opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${nft.title} miniatura ${idx + 1}`}
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                </button>
              );
            })}
          </div>

          {/* Imagem Grande Selecionada com fundo #241612 e Lupa no canto superior direito */}
          <div className="flex-1 bg-[#241612] p-3 sm:p-4 rounded-[20px] border border-[#3F2319] shadow-2xl relative aspect-square overflow-hidden">
            <img
              src={displayImage}
              alt={nft.title}
              className="w-full h-full object-cover rounded-[16px]"
            />

            {/* Botão de lupa na parte superior direita para ampliar */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/55 backdrop-blur-md text-[#F5F1EB] border border-white/10 hover:bg-[#D28A4C] hover:text-[#140D0A] transition-all shadow-lg cursor-pointer"
              title="Ampliar imagem"
              aria-label="Ampliar imagem"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LADO DIREITO: Informações do NFT */}
        <div className="lg:col-span-6 space-y-6">
          {/* Nome do produto */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F1EB] tracking-tight">
            {nft.title}
          </h1>

          {/* Valor e avaliações na mesma linha */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-2xl sm:text-3xl font-black text-[#E89B55]">
              {formatEth(currentEdition?.priceEth || nft.priceEth)}
            </span>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-[#E89B55] text-[#E89B55]" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-[#CFB28C] font-medium">
                ({COLLECTOR_REVIEWS.length} avaliações)
              </span>
            </div>
          </div>

          {/* Borda fina na cor #D28A4C */}
          <div className="border-t border-[#D28A4C]" />

          {/* Texto descritivo */}
          <div className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-[#F5F1EB]">
              Sobre este NFT:
            </h2>
            <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed">
              {nft.description}
            </p>
          </div>

          {/* Opção de edição (1/1, 1/10, 1/50, ABERTA) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#CFB28C] block">
              Edição
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {EDITION_OPTIONS.map((opt) => {
                const isSelected = selectedEditionOpt === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedEditionOpt(opt)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E89B55] text-[#E89B55] bg-[#E89B55]/10 font-bold'
                        : 'border-[#241612] bg-[#241612] text-[#CFB28C] hover:border-[#E89B55]/40'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantidade + Comprar + Favoritar (Desktop) */}
          <div className="hidden md:flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Controle de quantidades: botões de - e + com height 50px e width 30px */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 1 || isSoldOut}
                onClick={handleDecrement}
                className="w-[30px] h-[50px] rounded-lg bg-[#D28A4C] text-[#000000] font-extrabold text-lg flex items-center justify-center hover:bg-[#c0793b] transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Diminuir quantidade"
              >
                -
              </button>

              <span className="w-8 text-center font-bold text-base text-[#F5F1EB]">
                {quantity}
              </span>

              <button
                type="button"
                disabled={quantity >= maxAvailable || isSoldOut}
                onClick={handleIncrement}
                className="w-[30px] h-[50px] rounded-lg bg-[#D28A4C] text-[#000000] font-extrabold text-lg flex items-center justify-center hover:bg-[#c0793b] transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            {/* Botões alinhados à direita: Comprar e Favoritar */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                disabled={isSoldOut || isAdding}
                onClick={handleBuy}
                className="h-[50px] px-6 sm:px-8 rounded-xl bg-[#D28A4C] text-[#000000] font-bold text-sm uppercase tracking-wider hover:bg-[#c0793b] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSoldOut ? 'Esgotado' : isAdding ? 'Processando...' : 'Comprar'}
              </button>

              <button
                type="button"
                onClick={() => setIsFavorited((prev) => !prev)}
                className={`h-[50px] px-4 rounded-xl border border-[#D28A4C] text-[#D28A4C] font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer ${
                  isFavorited ? 'bg-[#D28A4C]/15' : 'hover:bg-[#D28A4C]/10'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#D28A4C]' : ''}`} />
                <span>Favoritar</span>
              </button>
            </div>
          </div>

          {actionSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* 3 textos em coluna: ID do token, Coleção, Atributos */}
          <div className="flex flex-col space-y-1.5 pt-2 text-xs sm:text-sm font-light text-[#B39463]">
            <span>
              ID do token: #{nft.id.replace(/\D/g, '').padStart(4, '0') || '0042'}
            </span>
            <span>Coleção: {nft.collection?.name || 'Kurio Apes'}</span>
            <span>Atributos: Óculos, Esmeralda, Raro</span>
          </div>

          {/* Compartilhar este NFT */}
          <div className="flex items-center gap-4 pt-2 text-sm text-[#F5F1EB]">
            <span className="font-medium">Compartilhar este NFT:</span>
            <div className="flex items-center gap-3">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Compartilhar no LinkedIn"
                className="text-[#F5F1EB] hover:text-[#D28A4C] transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(nft.title)}&body=${encodeURIComponent(window.location.href)}`}
                aria-label="Compartilhar por E-mail"
                className="text-[#F5F1EB] hover:text-[#D28A4C] transition-colors"
              >
                <Mail className="h-[18px] w-[18px]" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira este NFT na Kurio: ${nft.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Compartilhar no Twitter"
                className="text-[#F5F1EB] hover:text-[#D28A4C] transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TABS: Detalhes do NFT e Avaliações de colecionadores */}
      {/* ======================================================== */}
      <section className="space-y-6 pt-4">
        {/* Navegação entre os Tabs com borda #D28A4C dividindo do texto */}
        <div className="flex items-center gap-8 border-b border-[#D28A4C]">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm sm:text-base font-bold transition-all cursor-pointer -mb-[1px] ${
              activeTab === 'details'
                ? 'text-[#E89B55] border-b-2 border-[#E89B55]'
                : 'text-[#F5F1EB] hover:text-[#E89B55]/80'
            }`}
          >
            Detalhes do NFT
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm sm:text-base font-bold transition-all cursor-pointer -mb-[1px] ${
              activeTab === 'reviews'
                ? 'text-[#E89B55] border-b-2 border-[#E89B55]'
                : 'text-[#F5F1EB] hover:text-[#E89B55]/80'
            }`}
          >
            Avaliações de colecionadores ({COLLECTOR_REVIEWS.length})
          </button>
        </div>

        {/* Conteúdo do Tab 1: Detalhes do NFT */}
        {activeTab === 'details' && (
          <div className="space-y-4 text-sm text-[#CFB28C] leading-relaxed">
            <p>
              Emerald Ape #042 é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
            </p>
            <p>
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
            </p>
            <div className="text-xs sm:text-sm">
              <div className='pb-3'>
                <span className="font-semibold text-[#F5F1EB] block">Rede:</span>
                <span>Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</span>
              </div>
              <div className='pb-3'>
                <span className="font-semibold text-[#F5F1EB] block">Contrato:</span>
                <span>Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</span>
              </div>
              <div className='pb-3'>
                <span className="text-[#F5F1EB] font-semibold block">Direitos autorais:</span>
                <span>0x7A42...19E8 • Contrato inteligente ERC-721 verificado.</span>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo do Tab 2: Avaliações de colecionadores */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLLECTOR_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-[#241612] rounded-[16px] border border-[#3F2319] p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#D28A4C]/50"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#F5F1EB]">{review.name}</h4>
                        <span className="text-xs text-[#B39463]">{review.handle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-[#E89B55] text-[#E89B55]" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                <span className="text-[11px] text-[#B39463] pt-2 border-t border-[#3F2319]/60">
                  {review.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. MAIS DESTA COLEÇÃO */}
      {/* ======================================================== */}
      {relatedNfts.length > 0 && (
        <section className="space-y-6 pt-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F1EB] pb-3 border-b border-[#E89B55] w-full">
            Mais desta coleção
          </h2>

          {/* Se tiver mais de 5 itens (ou no mobile), utiliza Swiper com paginação de bolinhas */}
          {relatedNfts.length > 5 ? (
            <div className="w-full overflow-hidden">
              <Swiper
                modules={[Pagination]}
                pagination={{
                  el: '.related-swiper-pagination',
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
                {relatedNfts.map((item) => (
                  <SwiperSlide key={item.id} className="!h-auto">
                    {renderRelatedCard(item)}
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Paginação renderizada explicitamente abaixo dos cards */}
              <div className="related-swiper-pagination" />
            </div>
          ) : (
            /* Caso tenha até 5 itens, grid no desktop e swiper no mobile */
            <>
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5">
                {relatedNfts.map((item) => (
                  <div key={item.id}>{renderRelatedCard(item)}</div>
                ))}
              </div>
              <div className="block md:hidden w-full">
                <Swiper
                  modules={[Pagination]}
                  pagination={{
                    el: '.related-swiper-pagination-mobile',
                    clickable: true,
                  }}
                  loop={false}
                  spaceBetween={14}
                  slidesPerView={1.4}
                  className="w-full !overflow-visible"
                >
                  {relatedNfts.map((item) => (
                    <SwiperSlide key={item.id} className="!h-auto">
                      {renderRelatedCard(item)}
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* Paginação renderizada explicitamente abaixo dos cards */}
                <div className="related-swiper-pagination-mobile" />
              </div>
            </>
          )}
        </section>
      )}
      </div>

      {/* ======================================================== */}
      {/* 5. BARRA FLUTUANTE FIXA EM BAIXO (APENAS MOBILE) */}
      {/* ======================================================== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-[#241612] border-t border-[#3F2319] rounded-t-[28px] p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] box-border">
        <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
          {/* Linha 1: Quantidade + Valor */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#CFB28C]">Qtd.</span>
              <button
                type="button"
                disabled={quantity <= 1 || isSoldOut}
                onClick={handleDecrement}
                className="w-7 h-8 rounded-lg bg-[#D28A4C] text-[#000000] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Diminuir quantidade"
              >
                -
              </button>
              <span className="w-5 text-center font-bold text-sm text-[#F5F1EB]">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxAvailable || isSoldOut}
                onClick={handleIncrement}
                className="w-7 h-8 rounded-lg bg-[#D28A4C] text-[#000000] font-extrabold text-sm flex items-center justify-center hover:bg-[#c0793b] disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <span className="text-base font-black text-[#E89B55]">
                {formatEth(currentEdition?.priceEth || nft.priceEth)}
              </span>
            </div>
          </div>

          {/* Linha 2: Botão "Comprar NFT" com flex-1 + Botão circular do carrinho */}
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              disabled={isSoldOut || isAdding}
              onClick={handleBuy}
              className="flex-1 max-w-48 h-12 rounded-4xl bg-[#D28A4C] text-[#000000] font-bold text-sm uppercase tracking-wider hover:bg-[#c0793b] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            >
              {isSoldOut ? 'Esgotado' : isAdding ? 'Processando...' : 'Comprar NFT'}
            </button>

            <button
              type="button"
              disabled={isSoldOut || isAdding}
              onClick={handleAddToCartOnly}
              className="w-12 h-12 shrink-0 rounded-full bg-[#2F1D15] text-[#B39463] flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50 cursor-pointer border border-[#3F2319] hover:border-[#D28A4C] transition-colors"
              aria-label="Adicionar ao carrinho"
              title="Adicionar ao carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Zoom (Lightbox) ao clicar na lupa */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#241612] p-3 rounded-[20px] border border-[#3F2319] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/60 text-[#F5F1EB] hover:bg-[#D28A4C] hover:text-[#140D0A] transition-colors z-10 cursor-pointer"
              aria-label="Fechar ampliação"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={displayImage}
              alt={nft.title}
              className="w-full h-auto max-h-[82vh] object-contain rounded-[16px]"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default NFTDetailPage;
