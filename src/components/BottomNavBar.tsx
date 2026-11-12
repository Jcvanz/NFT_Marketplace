import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Heart,
  ShoppingCart,
  User,
  Scan,
  X,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { LoginPage } from '../pages/LoginPage';

export const BottomNavBar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const searchObj = (location.search as Record<string, any>) || {};
  const isHomeActive = location.pathname === '/' && !location.hash;
  const isWishlistActive =
    location.pathname === '/profile' && searchObj.tab === 'wishlist';
  const isCartActive = location.pathname === '/cart';
  const isProfileActive =
    location.pathname === '/profile' && searchObj.tab !== 'wishlist';

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleFavoritesClick = () => {
    if (isAuthenticated) {
      navigate({
        to: '/profile',
        search: { tab: 'wishlist' } as any,
      });
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      if (location.pathname === '/profile' && searchObj.tab && searchObj.tab !== 'profile') {
        navigate({
          to: '/profile',
          search: { tab: 'profile' } as any,
        });
      } else if (location.pathname === '/profile') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate({ to: '/profile' });
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      {/* Barra de Navegação Estilo App Fixa Embaixo (Apenas Mobile) */}
      <nav
        aria-label="Navegação móvel"
        className="fixed bottom-3 left-0 right-0 z-40 flex md:hidden justify-center pointer-events-none px-4"
      >
        <div className="relative w-full max-w-[420px] h-[58px] pointer-events-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
          <svg
            viewBox="0 0 400 70"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="navGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3F2319" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#D28A4C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3F2319" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 26,0 L 146,0 C 164,0 174,40 200,40 C 226,40 236,0 254,0 L 374,0 Q 400,0 400,26 L 400,44 Q 400,70 374,70 L 26,70 Q 0,70 0,44 L 0,26 Q 0,0 26,0 Z"
              fill="#241612"
              stroke="#3F2319"
              strokeWidth="1.5"
            />
          </svg>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#D28A4C] text-[#F5F1EB] flex items-center justify-center border-3 border-[#140D0A] hover:bg-[#e09452] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            aria-label="Escanear QR Code ou NFT"
            title="Escanear"
          >
            <svg className='w-6 h-6 text-[#F5F1EB] transition-transform duration-300 group-hover:rotate-90' width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3819 12.8913C9.28498 12.8913 5.18803 12.8913 1.09108 12.8906C0.961448 12.8906 0.827342 12.8943 0.702176 12.8667C0.25441 12.7684 -0.0480741 12.337 0.00631347 11.893C0.060701 11.4482 0.439924 11.1114 0.913021 11.1092C1.98364 11.1032 3.055 11.1062 4.12561 11.1062C11.3234 11.1062 18.5212 11.107 25.719 11.1084C25.8575 11.1084 26.0013 11.1047 26.1347 11.136C26.5743 11.2396 26.8641 11.6553 26.8179 12.0919C26.7702 12.5389 26.3947 12.8868 25.9246 12.8891C24.7139 12.8965 23.504 12.8928 22.2933 12.8928C19.3228 12.8928 16.3524 12.8928 13.3827 12.8928C13.3819 12.8928 13.3819 12.8921 13.3819 12.8913Z" fill="#F5F1EB"/>
              <path d="M10.5553 24.0002C9.20453 23.7976 7.81951 23.7216 6.51123 23.3654C3.76503 22.6167 2.19524 20.7243 1.7445 17.9274C1.57761 16.8926 1.47479 15.8473 1.35559 14.8057C1.28332 14.1762 1.58357 13.7634 2.13191 13.6956C2.67653 13.6286 3.07587 13.9817 3.13622 14.5278C3.26586 15.708 3.35601 16.8978 3.57877 18.0615C3.98109 20.1633 5.70212 21.6288 7.83664 21.8165C8.84617 21.9052 9.8542 22.0177 10.8607 22.1339C11.5953 22.2188 11.9343 23.0347 11.4948 23.6314C11.3048 23.89 11.0805 23.9637 10.5553 24.0002Z" fill="#F5F1EB"/>
              <path d="M25.4463 9.39819C25.4307 9.53528 25.4321 9.67758 25.3949 9.8087C25.3077 10.1186 25.0015 10.3779 24.7422 10.3831C24.3004 10.3921 23.7998 10.0643 23.6977 9.65001C23.6247 9.35572 23.6225 9.0443 23.5822 8.74107C23.4571 7.78444 23.3967 6.81366 23.1881 5.87566C22.7604 3.95571 21.5326 2.73758 19.6142 2.32259C18.4743 2.07599 17.2971 1.99999 16.1363 1.84726C16.0075 1.83013 15.8756 1.82417 15.7504 1.79213C15.331 1.68559 15.0583 1.287 15.1112 0.870521C15.17 0.407854 15.5269 0.0539627 15.9732 0.0859992C17.5042 0.195519 19.0427 0.30653 20.5119 0.776646C22.8633 1.52988 24.3451 3.15778 24.9054 5.53965C25.2012 6.79876 25.3018 8.10332 25.4903 9.38701C25.4761 9.39148 25.4612 9.39446 25.4463 9.39819Z" fill="#F5F1EB"/>
              <path d="M25.4224 14.8807C25.2988 16.1673 25.2086 17.5807 24.8167 18.9441C24.0777 21.5145 21.8962 23.2891 19.2372 23.5491C18.1554 23.6549 17.0781 23.8106 15.9992 23.944C15.617 23.9917 15.2013 23.6229 15.1208 23.1647C15.0404 22.7058 15.3287 22.255 15.7832 22.1939C16.3263 22.1202 16.8776 22.106 17.4208 22.033C18.3223 21.913 19.2565 21.8803 20.1133 21.6083C21.97 21.0197 23.007 19.6638 23.279 17.7453C23.4235 16.7254 23.5308 15.7002 23.6336 14.675C23.6932 14.082 24.0799 13.6685 24.6007 13.6983C25.1043 13.7273 25.4515 14.1744 25.4224 14.8807Z" fill="#F5F1EB"/>
              <path d="M1.3295 9.27513C1.52768 7.95493 1.62081 6.60791 1.9449 5.319C2.60053 2.71063 4.34912 1.11849 6.95898 0.532893C8.1339 0.269151 9.34756 0.177512 10.5448 0.0173291C10.7266 -0.00725703 10.9226 -0.0087471 11.0984 0.0329749C11.5119 0.130574 11.7548 0.509797 11.7153 0.940427C11.6736 1.39117 11.3681 1.69068 10.9285 1.73985C9.84748 1.86055 8.7642 1.97081 7.68688 2.1228C5.4108 2.44316 3.83356 4.02338 3.52363 6.28456C3.37536 7.36933 3.2569 8.45857 3.1295 9.54632C3.07809 9.98441 2.70185 10.3122 2.24217 10.3063C1.79589 10.3003 1.41518 9.94492 1.39059 9.50833C1.38612 9.43457 1.38985 9.36007 1.38985 9.28556C1.36973 9.28184 1.34961 9.27886 1.3295 9.27513Z" fill="#F5F1EB"/>
            </svg>
          </button>

          <div className="absolute inset-0 flex items-center justify-between px-6">
            {/* Home e Favoritos (Coração) */}
            <div className="flex items-center gap-7 sm:gap-9">
              <button
                type="button"
                onClick={handleHomeClick}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer group ${
                  isHomeActive
                    ? 'text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                }`}
                aria-label="Página Inicial"
                title="Início"
              >
                <Home className="w-6 h-6 transition-transform group-hover:scale-110" />
              </button>

              <button
                type="button"
                onClick={handleFavoritesClick}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer group ${
                  isWishlistActive
                    ? 'text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                }`}
                aria-label="Favoritos"
                title="Favoritos"
              >
                <Heart className="w-6 h-6 transition-transform group-hover:scale-110" />
              </button>
            </div>

            <div className="w-12 h-12" aria-hidden="true" />

            {/* Carrinho e Perfil */}
            <div className="flex items-center gap-7 sm:gap-9">
              <Link
                to="/cart"
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer group ${
                  isCartActive
                    ? 'text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                }`}
                aria-label="Carrinho de Compras"
                title="Carrinho"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#D28A4C] text-[#140D0A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {totalCartCount}
                    </span>
                  )}
                </div>
              </Link>

              <button
                type="button"
                onClick={handleProfileClick}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer group ${
                  isProfileActive
                    ? 'text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                }`}
                aria-label="Perfil do Usuário"
                title="Perfil"
              >
                <User className="w-6 h-6 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Login (aberto quando usuário clica em Perfil/Favoritos sem autenticação) */}
      {isLoginModalOpen && (
        <LoginPage onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* Modal de Scan */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsScanModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[420px] bg-[#241612] border border-[#3F2319] rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#3F2319] pb-3">
              <div className="flex items-center gap-2 text-[#E89B55]">
                <Camera className="w-5 h-5 text-[#D28A4C]" />
                <span className="font-bold text-base text-[#F5F1EB]">
                  Escanear NFT
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="p-1 rounded-lg text-[#CFB28C] hover:text-[#D28A4C] hover:bg-[#180E0C] transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl bg-[#180E0C] border border-[#3F2319] flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-x-0 h-0.5 bg-[#D28A4C] shadow-[0_0_12px_#D28A4C] animate-bounce" />

              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#D28A4C] rounded-tl" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#D28A4C] rounded-tr" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#D28A4C] rounded-bl" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#D28A4C] rounded-br" />

              <div className="flex flex-col items-center gap-2 text-[#CFB28C]/60 p-4">
                <Scan className="w-12 h-12 text-[#D28A4C]/50 animate-pulse" />
                <span className="text-xs">Aponte para o QR Code</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed">
              Posicione o código de autenticação ou QR Code da obra digital dentro do enquadramento.
            </p>

            <button
              type="button"
              onClick={() => {
                setIsScanModalOpen(false);
                navigate({ to: '/nft/$id', params: { id: 'nft-1' } });
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#D28A4C] hover:bg-[#c0793b] text-[#140D0A] font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simular leitura de NFT</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavBar;
