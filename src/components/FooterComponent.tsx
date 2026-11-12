import React from 'react';
import { Link } from '@tanstack/react-router';
import { FeaturesNewsletterSection } from './FeaturesNewsletterSection';

export const FooterComponent: React.FC = () => {
  return (
    <footer className="w-full container mx-auto">
      <FeaturesNewsletterSection/>

      <div className="w-full bg-[#38220F] text-[#F5F1EB] border-t border-[#3F2319]">
        <div className="py-7 sm:px-20 px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm font-medium">
          <span className="font-extrabold tracking-[2px] text-lg text-[#F5F1EB]">
            KURIO
          </span>

          <span className="text-[#F5F1EB] leading-tight max-w-xs text-xs sm:text-sm">
            Feito para colecionadores,<br className="hidden sm:inline" /> criadores e cultura
          </span>

          <a
            href="mailto:contato@email.com"
            className="text-[#F5F1EB] hover:text-[#D28A4C] transition-colors text-xs sm:text-sm underline-offset-4 hover:underline"
          >
            contato@email.com
          </a>

          <a
            href="tel:+551140028922"
            className="text-[#F5F1EB] hover:text-[#D28A4C] transition-colors text-xs sm:text-sm"
          >
            +55 11 4002 8922
          </a>
        </div>
      </div>

      {/* 2. FOOTER PRINCIPAL (Fundo #241612 com 4 separações) */}
      <div className="w-full bg-[#241612] text-[#F5F1EB] border-t border-[#3F2319]">
        <div className="container mx-auto py-12 px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Primeira Separação: Meu perfil */}
            <div className="space-y-4 flex flex-col items-center text-center sm:items-start sm:text-left ">
              <h4 className="font-bold text-base text-[#F5F1EB] tracking-wide">
                Meu perfil
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-light text-[#F5F1EB]">
                <li>
                  <Link to="/profile" className="hover:text-[#D28A4C] transition-colors">
                    Meu perfil
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#D28A4C] transition-colors">
                    Minha coleção
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#D28A4C] transition-colors">
                    Atividade
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#D28A4C] transition-colors">
                    Estúdio do criador
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#D28A4C] transition-colors">
                    Lista de interesse
                  </Link>
                </li>
              </ul>
            </div>

            {/* Segunda Separação: Central de ajuda */}
            <div className="space-y-4 flex flex-col items-center text-center sm:items-start sm:text-left ">
              <h4 className="font-bold text-base text-[#F5F1EB] tracking-wide">
                Central de ajuda
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-light text-[#F5F1EB]">
                <li>
                  <a href="#ajuda" className="hover:text-[#D28A4C] transition-colors">
                    Central de ajuda
                  </a>
                </li>
                <li>
                  <a href="#como-comprar" className="hover:text-[#D28A4C] transition-colors">
                    Como comprar NFTs
                  </a>
                </li>
                <li>
                  <a href="#seguranca" className="hover:text-[#D28A4C] transition-colors">
                    Carteira e segurança
                  </a>
                </li>
                <li>
                  <a href="#politica" className="hover:text-[#D28A4C] transition-colors">
                    Política do mercado
                  </a>
                </li>
                <li>
                  <a href="#denunciar" className="hover:text-[#D28A4C] transition-colors">
                    Denunciar item
                  </a>
                </li>
              </ul>
            </div>

            {/* Terceira Separação: Coleções */}
            <div className="space-y-4 flex flex-col items-center text-center sm:items-start sm:text-left">
              <h4 className="font-bold text-base text-[#F5F1EB] tracking-wide">
                Coleções
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-light text-[#F5F1EB]">
                <li>
                  <Link
                    to="/"
                    search={{ category: 'arte digital' }}
                    className="hover:text-[#D28A4C] transition-colors"
                  >
                    Arte digital
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    search={{ category: 'fotografia' }}
                    className="hover:text-[#D28A4C] transition-colors"
                  >
                    Fotografia
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    search={{ category: 'musica' }}
                    className="hover:text-[#D28A4C] transition-colors"
                  >
                    Música
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    search={{ category: 'arte 3d' }}
                    className="hover:text-[#D28A4C] transition-colors"
                  >
                    Arte 3D
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    search={{ category: 'utildade' }}
                    className="hover:text-[#D28A4C] transition-colors"
                  >
                    Utilidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quarta Separação: Redes sociais e Carteiras compatíveis */}
            <div className="space-y-8 flex flex-col items-center text-center sm:items-start sm:text-left">
              {/* Bloco 1: Redes sociais */}
              <div className="space-y-3">
                <h4 className="font-bold text-base text-[#F5F1EB] tracking-wide">
                  Redes sociais
                </h4>
                <div className="flex items-center gap-3">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-lg border border-[#D28A4C] text-[#D28A4C] flex items-center justify-center hover:bg-[#D28A4C]/10 transition-colors"
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
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-lg border border-[#D28A4C] text-[#D28A4C] flex items-center justify-center hover:bg-[#D28A4C]/10 transition-colors"
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
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter"
                    className="w-10 h-10 rounded-lg border border-[#D28A4C] text-[#D28A4C] flex items-center justify-center hover:bg-[#D28A4C]/10 transition-colors"
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

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-10 h-10 rounded-lg border border-[#D28A4C] text-[#D28A4C] flex items-center justify-center hover:bg-[#D28A4C]/10 transition-colors"
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
                </div>
              </div>

              {/* Bloco 2: Carteiras compatíveis */}
              <div className="space-y-3 flex flex-col items-center sm:items-start">
                <h4 className="font-bold text-base text-[#F5F1EB] tracking-wide">
                  Carteiras compatíveis
                </h4>
                <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#E89B55] bg-[#55321F] text-[#E89B55] text-[10px] sm:text-xs font-bold tracking-wider shadow-md flex-wrap">
                  <span>METAMASK</span>
                  <span className="w-1 h-1 rounded-full bg-[#E89B55] shrink-0" />
                  <span>WALLETCONNECT</span>
                  <span className="w-1 h-1 rounded-full bg-[#E89B55] shrink-0" />
                  <span>COINBASE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TEXTO DE COPY (FORA do componente colorido #241612) */}
      <div className="w-full py-6 text-center">
        <p className="text-xs sm:text-sm text-[#F5F1EB] font-normal">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  );
};
