import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { NFT, NFTSortBy, NFTQuickFilter } from '../types';
import { formatEth } from '../lib/eth';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { CatalogFilters } from './CatalogFilters';
import { image1, getAssetImage } from '../assets';

interface CatalogSectionProps {
  nfts: NFT[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  categoryCounts?: Record<string, number>;
  networkCounts?: Record<string, number>;
  selectedCategory: string;
  selectedNetwork: string;
  selectedQuickFilter: NFTQuickFilter;
  selectedSortBy: NFTSortBy;
  minPrice?: string;
  maxPrice?: string;
  onUpdateParams: (newParams: Record<string, any>, resetPage?: boolean) => void;
}

const SORT_OPTIONS: { label: string; value: NFTSortBy }[] = [
  { label: 'Mais recentes', value: 'recently_listed' },
  { label: 'Menor Preço', value: 'price_asc' },
  { label: 'Maior Preço', value: 'price_desc' },
  { label: 'Mais Vistos', value: 'most_viewed' },
  { label: 'Mais Edições', value: 'highest_edition' },
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  nfts,
  total,
  page,
  totalPages,
  isLoading,
  isError,
  categoryCounts = {},
  networkCounts = {},
  selectedCategory,
  selectedNetwork,
  selectedQuickFilter,
  selectedSortBy,
  minPrice = '0',
  maxPrice = '3',
  onUpdateParams,
}) => {
  // Sort dropdown / modalzinho state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Fecha o modal de ordenação ao clicar fora  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === selectedSortBy)?.label || 'Mais recentes';

  // Item de destaque (o primeiro da lista ou null)
  const featuredNft = nfts.length > 0 ? nfts[0] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

      {/* FILTROS + DESTAQUE */}
      <aside className="hidden lg:block w-[25%] max-w-[330px] shrink-0 space-y-6">
        <div className="w-full bg-[#241612] rounded-[16px] p-6 border border-[#3F2319] shadow-xl space-y-6">
          <CatalogFilters
            selectedCategory={selectedCategory}
            selectedNetwork={selectedNetwork}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categoryCounts={categoryCounts}
            networkCounts={networkCounts}
            onUpdateParams={onUpdateParams}
          />
        </div>

        {featuredNft && (
          <div className="w-full bg-[#241612] rounded-[16px] p-4 border border-[#3F2319] shadow-xl space-y-3">
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-wider text-[#E89B55] mb-5">
                NFT EM DESTAQUE
              </span>
              <span className="text-lg mb-1 text-center font-medium tracking-wider py-0.5 rounded-full text-[#F5F1EB]">
                OFERTA LIMITADA
              </span>
            </div>

            <Link
              to="/nft/$id"
              params={{ id: featuredNft.id }}
              className="block group relative w-full aspect-square rounded-[16px] overflow-hidden"
            >
              <img
                src={
                  featuredNft.imageUrl && !featuredNft.imageUrl.includes('unsplash')
                    ? featuredNft.imageUrl
                    : image1
                }
                alt={featuredNft.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-sm font-bold text-[#F5F1EB] line-clamp-1">
                  {featuredNft.title}
                </span>
                <span className="text-xs font-semibold text-[#E89B55]">
                  {formatEth(featuredNft.priceEth)}
                </span>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* GRID DE CARDS DOS NFTS (AO LADO DO FILTRO) */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-2 border-b border-[#3F2319]">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all' as const, label: 'Todos os NFTs' },
              { id: 'new' as const, label: 'Novos' },
              { id: 'releases' as const, label: 'Lançamentos' },
              { id: 'trending' as const, label: 'Em alta' },
            ].map((f) => {
              const isSelected = selectedQuickFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateParams({ quickFilter: f.id })}
                  className={`text-xs sm:text-sm font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E89B55]/15 text-[#E89B55] border border-[#E89B55]/40 font-bold'
                      : 'text-[#CFB28C] hover:text-[#F5F1EB]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Ordenar por: (com modalzinho / dropdown ao clicar) */}
          <div className="relative shrink-0" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#241612] border border-[#3F2319] text-xs font-medium text-[#F5F1EB] hover:border-[#D28A4C] transition-colors cursor-pointer"
            >
              <span className="text-[#CFB28C]">Ordenar por:</span>
              <span className="font-semibold text-[#E89B55]">{currentSortLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#CFB28C]" />
            </button>

            {/* Modalzinho / Menu suspenso de ordenação */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#241612] border border-[#3F2319] shadow-2xl p-2 z-30 space-y-1 animate-in fade-in slide-in-from-top-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onUpdateParams({ sortBy: opt.value });
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      selectedSortBy === opt.value
                        ? 'bg-[#D28A4C]/15 text-[#E89B55] font-bold'
                        : 'text-[#CFB28C] hover:bg-[#180E0C] hover:text-[#F5F1EB]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSortBy === opt.value && <Check className="h-3.5 w-3.5 text-[#E89B55]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOADING SKELETONS */}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[16px] bg-[#241612] p-3 border border-[#3F2319] space-y-3"
              >
                <div className="aspect-square rounded-[14px] bg-[#180E0C] animate-shimmer" />
                <div className="h-4 w-3/4 rounded bg-[#180E0C] animate-shimmer" />
                <div className="h-4 w-1/3 rounded bg-[#180E0C] animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="rounded-[16px] border border-destructive/50 bg-[#241612] p-8 text-center space-y-3">
            <h4 className="text-base font-bold text-destructive">Falha ao carregar catálogo</h4>
            <p className="text-xs text-[#CFB28C]">
              Não foi possível sincronizar os NFTs. Verifique a conexão com a rede simulada.
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !isError && nfts.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-[#3F2319] bg-[#241612]/50 p-12 text-center space-y-3">
            <h4 className="text-lg font-bold text-[#F5F1EB]">Nenhum NFT encontrado</h4>
            <p className="text-xs text-[#CFB28C] max-w-sm mx-auto">
              Não encontramos nenhum item para a combinação de filtros e faixa de preço selecionada.
            </p>
            <button
              type="button"
              onClick={() => onUpdateParams({ category: 'all', network: 'all', minPrice: '', maxPrice: '', quickFilter: 'all' })}
              className="px-4 py-2 rounded-xl bg-[#D28A4C] text-[#140D0A] font-bold text-xs cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* GRID DE CARDS DOS NFTS: 2 cards por linha no mobile em degraus */}
        {!isLoading && !isError && nfts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 sm:gap-y-[50px] sm:gap-x-[20px] gap-4 pb-0 items-start">
            {nfts.map((nft, index) => {
              // Efeito degrau no mobile: o segundo card fica um pouco para baixo
              const isStepDown = index % 2 === 1;

              return (
                <div
                  key={nft.id}
                  className={`group relative rounded-[16px] flex flex-col justify-between transition-all hover:translate-y-[-2px] ${
                    isStepDown ? 'translate-y-6 lg:translate-y-0' : ''
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-[16px] bg-[#241612] p-2.5 sm:p-3 border border-[#3F2319] overflow-hidden shadow-md flex items-center justify-center">
                    <Link
                      to="/nft/$id"
                      params={{ id: nft.id }}
                      className="w-full h-full block rounded-[12px] sm:rounded-[14px] overflow-hidden"
                    >
                      <img
                        src={
                          nft.imageUrl && !nft.imageUrl.includes('unsplash')
                            ? nft.imageUrl
                            : getAssetImage(index)
                        }
                        alt={nft.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  <div className="pt-2 sm:pt-3 px-1 flex flex-col justify-between sm:gap-1">
                    <div className="min-w-0">
                      <Link
                        to="/nft/$id"
                        params={{ id: nft.id }}
                        className="text-xs sm:text-lg font-medium text-[#F5F1EB] hover:text-[#E89B55] transition-colors truncate block"
                      >
                        {nft.title}
                      </Link>
                    </div>

                    <div className="shrink-0">
                      <span className="text-xs sm:text-lg font-semibold text-[#E89B55]">
                        {nft.priceEth} {nft.currency || 'ETH'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINAÇÃO: se não tiver páginas extras (totalPages <= 1), deixe sem */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 pt-2">
            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map((pageNum) => {
              const isSelected = page === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onUpdateParams({ page: pageNum }, false)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#D28A4C] text-[#140D0A] shadow-md'
                      : 'text-[#F5F1EB] hover:border-[#D28A4C]'
                  }`}
                  style={{
                    border: isSelected ? 'none' : '1px solid var(--color-border, #3F2319)',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Seta para próxima página: apenas se houver próxima página para ir (page < totalPages) */}
            {page < totalPages && (
              <button
                type="button"
                onClick={() => onUpdateParams({ page: page + 1 }, false)}
                className="h-9 w-9 rounded-lg text-xs font-bold text-[#F5F1EB] flex items-center justify-center hover:border-[#D28A4C] transition-all cursor-pointer"
                style={{
                  border: '1px solid var(--color-border, #3F2319)',
                }}
                title="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
