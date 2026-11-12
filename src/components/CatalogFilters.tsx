import React, { useState, useEffect } from 'react';

export const COLLECTIONS = [
  { id: 'arte digital', label: 'Arte digital' },
  { id: 'fotografia', label: 'Fotografia' },
  { id: 'musica', label: 'Música' },
  { id: 'arte 3d', label: 'Arte 3D' },
  { id: 'colecionaveis', label: 'Colecionáveis' },
  { id: 'generativa', label: 'Generativa' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'utildade', label: 'Utilidade' },
];

export const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'solana', label: 'Solana' },
];

export interface CatalogFiltersProps {
  selectedCategory: string;
  selectedNetwork: string;
  minPrice?: string;
  maxPrice?: string;
  categoryCounts?: Record<string, number>;
  networkCounts?: Record<string, number>;
  onUpdateParams: (newParams: Record<string, any>, resetPage?: boolean) => void;
  onFilterApplied?: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  selectedCategory,
  selectedNetwork,
  minPrice = '0',
  maxPrice = '3',
  categoryCounts = {},
  networkCounts = {},
  onUpdateParams,
  onFilterApplied,
}) => {
  const [sliderMin, setSliderMin] = useState(minPrice ? parseFloat(minPrice) : 0);
  const [sliderMax, setSliderMax] = useState(maxPrice ? parseFloat(maxPrice) : 3);

  useEffect(() => {
    if (minPrice !== undefined && minPrice !== '') {
      setSliderMin(parseFloat(minPrice) || 0);
    }
  }, [minPrice]);

  useEffect(() => {
    if (maxPrice !== undefined && maxPrice !== '') {
      setSliderMax(parseFloat(maxPrice) || 3);
    }
  }, [maxPrice]);

  const handleApplyPrice = () => {
    onUpdateParams({
      minPrice: sliderMin.toString(),
      maxPrice: sliderMax.toString(),
    });
    onFilterApplied?.();
  };

  const handleCategoryClick = (catId: string) => {
    const nextCat = selectedCategory === catId ? 'all' : catId;
    onUpdateParams({ category: nextCat });
    onFilterApplied?.();
  };

  const handleNetworkClick = (netId: string) => {
    const nextNet = selectedNetwork === netId ? 'all' : netId;
    onUpdateParams({ network: nextNet });
    onFilterApplied?.();
  };

  const minPercent = Math.min(100, Math.max(0, (sliderMin / 5) * 100));
  const maxPercent = Math.min(100, Math.max(0, (sliderMax / 5) * 100));

  return (
    <div className="w-full space-y-6">
      {/* 1. Primeiro Filtro: Coleção */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#F5F1EB] tracking-wide">Coleção</h3>
        <div className="flex flex-col space-y-2">
          {COLLECTIONS.map((col) => {
            const count = categoryCounts[col.id] || 0;
            const isSelected = selectedCategory.toLowerCase() === col.id.toLowerCase();
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleCategoryClick(col.id)}
                className="flex items-center justify-between py-1 text-sm text-left transition-colors group cursor-pointer"
              >
                <span
                  className={`font-medium transition-colors capitalize ${
                    isSelected
                      ? 'text-[#E89B55] font-bold'
                      : 'text-[#CFB28C] group-hover:text-[#E89B55]'
                  }`}
                >
                  {col.label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-[#E89B55]/20 text-[#E89B55] font-bold'
                      : 'bg-[#180E0C] text-[#CFB28C]/80'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#3F2319]" />

      {/* 2. Segundo Filtro: Faixa de Preço com 2 bolinhas (min e max) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#F5F1EB] tracking-wide">Faixa de preço</h3>

        <div className="space-y-3 pt-2">
          {/* Dual Range Slider com 2 bolinhas */}
          <div className="relative w-full h-5 flex items-center">
            {/* Trilho de fundo escuro */}
            <div className="absolute w-full h-1.5 bg-[#3F2319] rounded-lg" />

            {/* Trilho ativo entre min e max em #D28A4C */}
            <div
              className="absolute h-1.5 bg-[#D28A4C] rounded-lg"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`,
              }}
            />

            {/* Input da 1ª bolinha (Min) */}
            <input
              type="range"
              min="0"
              max="5"
              step="0.05"
              value={sliderMin}
              onChange={(e) => {
                const val = Math.min(parseFloat(e.target.value), sliderMax - 0.05);
                setSliderMin(Number(val.toFixed(2)));
              }}
              className="dual-range-input absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none z-10"
              aria-label="Preço mínimo"
            />

            {/* Input da 2ª bolinha (Max) */}
            <input
              type="range"
              min="0"
              max="5"
              step="0.05"
              value={sliderMax}
              onChange={(e) => {
                const val = Math.max(parseFloat(e.target.value), sliderMin + 0.05);
                setSliderMax(Number(val.toFixed(2)));
              }}
              className="dual-range-input absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none z-20"
              aria-label="Preço máximo"
            />
          </div>

          {/* Informação textual de preço */}
          <div className="flex items-center justify-between text-xs text-[#CFB28C] font-medium pt-1">
            <span>
              Preço: {sliderMin.toFixed(2)} - {sliderMax.toFixed(2)} ETH
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyPrice}
          className="mt-2 py-2 px-5 rounded-xl bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] hover:text-white transition-all shadow-md active:scale-98 cursor-pointer"
        >
          aplicar
        </button>
      </div>

      <div className="border-t border-[#3F2319]" />

      {/* 3. Terceiro Filtro: Rede */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#F5F1EB] tracking-wide">Rede</h3>
        <div className="flex flex-col space-y-2">
          {NETWORKS.map((net) => {
            const count = networkCounts[net.id] || 0;
            const isSelected = selectedNetwork.toLowerCase() === net.id.toLowerCase();
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => handleNetworkClick(net.id)}
                className="flex items-center justify-between py-1 text-sm text-left transition-colors group cursor-pointer"
              >
                <span
                  className={`font-medium transition-colors capitalize ${
                    isSelected
                      ? 'text-[#E89B55] font-bold'
                      : 'text-[#CFB28C] group-hover:text-[#E89B55]'
                  }`}
                >
                  {net.label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-[#E89B55]/20 text-[#E89B55] font-bold'
                      : 'bg-[#180E0C] text-[#CFB28C]/80'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

