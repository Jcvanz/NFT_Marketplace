import React, { useEffect } from 'react';
import { useNavigate, useSearch, useLocation } from '@tanstack/react-router';
import { useNFTs } from '../hooks/useNFTs';
import { NFTSortBy, NFTQuickFilter } from '../types';
import { HeroSection } from '../components/HeroSection';
import { CatalogSection } from '../components/CatalogSection';
import { InfoCardsSection } from '../components/InfoCardsSection';
import { JournalSection } from '../components/JournalSection';
import { BottomNavBar } from '../components/BottomNavBar';

export const HomePage: React.FC = () => {
  const searchParams = useSearch({ from: '/' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const rawHash = location.hash || (typeof window !== 'undefined' ? window.location.hash : '');
    const targetId = rawHash.replace(/^#/, '');
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const { data, isLoading, isError } = useNFTs({
    search: searchParams.search,
    category: searchParams.category,
    network: searchParams.network,
    quickFilter: searchParams.quickFilter,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    sortBy: searchParams.sortBy,
    page: searchParams.page,
    limit: 9, // 3 linhas x 3 cards = 9
  });

  const updateSearch = (newParams: Record<string, any>, resetPage = true) => {
    navigate({
      to: '/',
      search: (prev: any) => ({
        ...prev,
        ...newParams,
        page: resetPage ? 1 : newParams.page || prev.page,
      }),
    });
  };

  const currentPage = searchParams.page || 1;

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 space-y-14 pb-28 md:pb-10">
      <HeroSection />

      <section id="catalogo" className="scroll-mt-20">
        <CatalogSection
          nfts={data?.items || []}
          total={data?.total || 0}
          page={currentPage}
          totalPages={data?.totalPages || 1}
          isLoading={isLoading}
          isError={isError}
          categoryCounts={data?.categoryCounts}
          networkCounts={data?.networkCounts}
          selectedCategory={searchParams.category || 'all'}
          selectedNetwork={searchParams.network || 'all'}
          selectedQuickFilter={(searchParams.quickFilter as NFTQuickFilter) || 'all'}
          selectedSortBy={(searchParams.sortBy as NFTSortBy) || 'recently_listed'}
          minPrice={searchParams.minPrice}
          maxPrice={searchParams.maxPrice}
          onUpdateParams={updateSearch}
        />
      </section>

      <section id="criadores" className="scroll-mt-20">
        <InfoCardsSection />
      </section>

      <section id="aprenda" className="scroll-mt-20">
        <JournalSection />
      </section>

      <BottomNavBar />
    </div>
  );
};

export default HomePage;
