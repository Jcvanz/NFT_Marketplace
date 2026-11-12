import { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import {
  Search,
  ShoppingCart,
  LogIn,
  X,
  User as UserIcon,
  Wallet as WalletIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useNFTs } from '../hooks/useNFTs';
import { CatalogFilters } from './CatalogFilters';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sincronização de contagens e busca de NFTs para os filtros
  const { data: nftData } = useNFTs();
  const searchObj = (location.search as Record<string, any>) || {};
  const selectedCategory = searchObj.category || 'all';
  const selectedNetwork = searchObj.network || 'all';
  const minPrice = searchObj.minPrice || '';
  const maxPrice = searchObj.maxPrice || '';

  const handleUpdateFilter = (newParams: Record<string, any>) => {
    navigate({
      to: '/',
      search: (prev: any) => ({
        ...prev,
        ...newParams,
        page: 1,
      }),
    });
  };

  const isHomePage = location.pathname === '/';
  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: '/',
        search: (prev: any) => ({
          ...prev,
          search: searchQuery.trim(),
          page: 1,
        }),
      });
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Início', to: '/' as const, hash: undefined },
    { label: 'Mercado', to: '/' as const, hash: 'catalogo' },
    { label: 'Criadores', to: '/' as const, hash: 'criadores' },
    { label: 'Aprenda', to: '/' as const, hash: 'aprenda' },
  ];

  const currentHash = (location.hash || '').replace(/^#/, '');

  const handleNavClick = (hash?: string) => {
    if (hash) {
      if (location.pathname === '/') {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container border-b border-b-[#D28A4C] mx-auto hidden md:flex h-16 items-center justify-between">
        <div className="flex items-center gap-8 h-full w-full">
          <Link to="/" className="flex items-center font-bold tracking-[1px] text-xl text-white hover:text-[#D28A4C] shrink-0">
            <span>KURIO</span>
          </Link>

          <nav className="justify-center w-full h-full flex items-center gap-12 text-lg font-medium">
            {navLinks.map((item) => {
              const isMercadoRoute =
                location.pathname.startsWith('/nft') ||
                location.pathname === '/cart' ||
                location.pathname === '/checkout';

              const isMercadoActive =
                item.label === 'Mercado' && (currentHash === 'catalogo' || isMercadoRoute);
              const isCriadoresActive =
                item.label === 'Criadores' && location.pathname === '/' && currentHash === 'criadores';
              const isAprendaActive =
                item.label === 'Aprenda' && location.pathname === '/' && currentHash === 'aprenda';
              const isInicioActive =
                item.label === 'Início' && location.pathname === '/' && !currentHash && !isMercadoRoute;

              const isActive =
                isMercadoActive || isCriadoresActive || isAprendaActive || isInicioActive;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  hash={item.hash}
                  onClick={() => handleNavClick(item.hash)}
                  className={`h-full flex items-center px-1 transition-all ${
                    isActive
                      ? 'text-[#D28A4C] border-b-2 border-[#D28A4C]'
                      : 'text-white hover:text-[#D28A4C] border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`rounded-lg transition-colors ${
              isSearchOpen ? 'text-[#D28A4C] bg-[#D28A4C]/10' : 'text-white hover:text-[#D28A4C]'
            }`}
            aria-label="Pesquisar"
            title="Pesquisar"
          >
            <Search className="h-[22px] w-[22px]" />
          </button>

          <Link
            to="/cart"
            className="relative rounded-lg text-white hover:text-[#D28A4C] transition-colors"
            aria-label="Carrinho de compras"
            title="Carrinho"
          >
            <ShoppingCart className="h-[22px] w-[22px]" />
            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#D28A4C] text-[12px] font-bold text-[#140D0A]">
              {totalCartCount}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 text-[#F5F1EB]">
              <Link
                to="/profile"
                search={{ tab: 'wallets' } as any}
                className="p-2 rounded-lg text-white hover:text-[#D28A4C] transition-colors"
                title="Carteiras"
              >
                <WalletIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className="p-2 rounded-lg text-white hover:text-[#D28A4C] transition-colors"
                title="Perfil"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-[#F5F1EB] hover:text-[#D28A4C]" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-2 py-2 rounded-lg text-[#140D0A] bg-[#D28A4C] tracking-[.5px] font-semibold text-[17px] transition-all hover:bg-[#c0793b]"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="hidden absolute top-0 left-0 right-0 md:block w-full border-b border-[#D28A4C]/30 bg-[#241612]/95 backdrop-blur-md py-3 px-4 shadow-xl transition-all">
          <div className="container mx-auto max-w-4xl flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D28A4C]" />
              <input
                type="text"
                placeholder="Explorar coleções"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 pl-10 pr-28 py-2.5 rounded-xl border border-[#D28A4C]/40 focus:outline-none focus:border-[#D28A4C] text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#D28A4C] text-white text-xs font-bold rounded-lg hover:bg-[#c0793b] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Buscar</span>
              </button>
            </form>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-[#D28A4C] hover:text-white transition-colors rounded-lg hover:bg-[#180E0C]"
              title="Fechar busca"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Mobile: Barra de busca com fundo #241612 e texto #D28A4C + Botão menu #D28A4C */}
      <div className="flex md:hidden items-center gap-2 w-full h-16 px-4">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D28A4C]" />
          <input
            type="text"
            placeholder="Explorar coleções"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-[#241612] text-[#D28A4C] placeholder-[#D28A4C]/60 pl-9 pr-14 rounded-lg text-sm focus:outline-none focus:border-[#D28A4C]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D28A4C] hover:text-white px-2 py-1 rounded transition-colors"
          >
            Buscar
          </button>
        </form>

        {isHomePage && (
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="h-9 w-9 rounded-lg bg-[#D28A4C] text-white flex items-center justify-center shrink-0 shadow-md hover:opacity-90 transition-opacity"
            aria-label="Abrir menu de navegação e filtros"
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.215 16.3925H4.28186" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
              <path d="M13.9379 16.3934C13.9379 18.2651 14.562 18.8884 16.4328 18.8884C18.3037 18.8884 18.9278 18.2651 18.9278 16.3934C18.9278 14.5218 18.3037 13.8984 16.4328 13.8984C14.562 13.8984 13.9379 14.5218 13.9379 16.3934Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
              <path d="M12.9952 6.77776H18.9275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
              <path d="M9.27232 6.77671C9.27232 4.90589 8.64817 4.28174 6.77735 4.28174C4.90571 4.28174 4.28156 4.90589 4.28156 6.77671C4.28156 8.64835 4.90571 9.27169 6.77735 9.27169C8.64817 9.27169 9.27232 8.64835 9.27232 6.77671Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
            </svg>
          </button>
        )}
      </div>

      {/* Drawer Mobile com efeito slide vindo da direita para o centro contendo Menu e Filtros */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        {/* Backdrop escuro */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Painel lateral deslizante com navegação e filtros */}
        <div
          className={`absolute top-0 right-0 h-screen w-[310px] sm:w-[350px] max-w-[88vw] bg-[#241612] border-l border-[#3F2319] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out z-10 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Topo do drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3F2319]">
              <span className="font-bold tracking-[1px] text-lg text-white">KURIO</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#D28A4C] hover:text-white hover:bg-[#180E0C] transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navegação Mobile */}
            <div className="flex flex-col gap-1 pb-4 border-b border-[#3F2319]">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#E89B55] mb-2">
                Navegação
              </span>
              {navLinks.map((item) => {
                const isMercadoRoute =
                  location.pathname.startsWith('/nft') ||
                  location.pathname === '/cart' ||
                  location.pathname === '/checkout';

                const isMercadoActive =
                  item.label === 'Mercado' && (currentHash === 'catalogo' || isMercadoRoute);
                const isCriadoresActive =
                  item.label === 'Criadores' && location.pathname === '/' && currentHash === 'criadores';
                const isAprendaActive =
                  item.label === 'Aprenda' && location.pathname === '/' && currentHash === 'aprenda';
                const isInicioActive =
                  item.label === 'Início' && location.pathname === '/' && !currentHash && !isMercadoRoute;

                const isActive =
                  isMercadoActive || isCriadoresActive || isAprendaActive || isInicioActive;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    hash={item.hash}
                    onClick={() => {
                      handleNavClick(item.hash);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[#D28A4C] bg-[#180E0C] font-semibold border-l-2 border-[#D28A4C]'
                        : 'text-[#F5F1EB] hover:text-[#D28A4C] hover:bg-[#180E0C]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#E89B55]">
                  Filtros de Catálogo
                </span>
              </div>
              <CatalogFilters
                selectedCategory={selectedCategory}
                selectedNetwork={selectedNetwork}
                minPrice={minPrice}
                maxPrice={maxPrice}
                categoryCounts={nftData?.categoryCounts}
                networkCounts={nftData?.networkCounts}
                onUpdateParams={handleUpdateFilter}
                onFilterApplied={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
