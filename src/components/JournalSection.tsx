import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ArrowRight } from 'lucide-react';
import { image1, image2, image3 } from '../assets';

interface Article {
  id: number;
  imageUrl: string;
  info: string;
  title: string;
  description: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    imageUrl: image1,
    info: '12 de setembro  |  Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais na blockchain.',
  },
  {
    id: 2,
    imageUrl: image2,
    info: '13 de setembro  |  Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 3,
    imageUrl: image3,
    info: '15 de setembro  |  Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 4,
    imageUrl: image1,
    info: '15 de setembro  |  Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
];

export const JournalSection: React.FC = () => {
  const renderCard = (article: Article) => (
    <article className="group h-full bg-[#241612] rounded-[16px] border border-[#3F2319] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#D28A4C]/50 hover:shadow-xl">
      {/* Imagem no topo */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-[#180E0C]">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Conteúdo textual */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          {/* Infos: data e tempo de leitura */}
          <span className="text-xs text-[#CFB28C] font-medium block">
            {article.info}
          </span>

          {/* Título */}
          <h3 className="text-base sm:text-lg font-bold text-[#F5F1EB] line-clamp-2 leading-snug group-hover:text-[#E89B55] transition-colors">
            {article.title}
          </h3>

          {/* Mini descrição */}
          <p className="text-xs sm:text-sm text-[#CFB28C] line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Botão de ler mais com uma flecha, sem fundo apenas na cor #E89B55 */}
        <div className="pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E89B55] hover:text-[#f3b074] transition-all bg-transparent p-0 cursor-pointer"
          >
            <span>Ler mais</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <section className="w-full pt-4 pb-14 space-y-8">
      {/* Cabeçalho centralizado */}
      <div className="text-center space-y-2 max-w-2xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F1EB] tracking-tight">
          Diário da Cunhagem
        </h2>
        <p className="text-xs sm:text-sm text-[#CFB28C] font-normal leading-relaxed">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>

      {/* Exibição Desktop: Grid com 4 cards lado a lado */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ARTICLES.map((article) => (
          <div key={article.id} className="h-full">
            {renderCard(article)}
          </div>
        ))}
      </div>

      {/* Exibição Mobile: Carrossel com 1.25 itens por linha usando Swiper */}
      <div className="block md:hidden w-full overflow-hidden px-1">
        <Swiper
          slidesPerView={1.25}
          spaceBetween={16}
          className="w-full !overflow-visible"
        >
          {ARTICLES.map((article) => (
            <SwiperSlide key={article.id} className="!h-auto flex">
              <div className="w-full h-full flex flex-col">
                {renderCard(article)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

