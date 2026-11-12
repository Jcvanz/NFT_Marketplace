import React from 'react';
import { ArrowRight } from 'lucide-react';
import { image1, image2 } from '../assets';

interface InfoCardData {
  title: string;
  description: string;
  imageUrl: string;
  actionUrl?: string;
}

const CARDS_DATA: InfoCardData[] = [
  {
    title: 'Lançamentos gênesis de edição limitada',
    description: 
      'Colecione edições escassa diretamente dos criadores antes da revelação pública.',
    imageUrl: image1,
  },
  {
    title: 'Arte digital selecionada e muito mais',
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    imageUrl: image2,
  },
];

export const InfoCardsSection: React.FC = () => {
  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full pt-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS_DATA.map((card, idx) => (
          <div
            key={idx}
            className="bg-[#241612] rounded-[16px] border border-[#3F2319] shadow-xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-64 transition-all duration-300 hover:border-[#D28A4C]/50 hover:shadow-2xl"
          >
            {/* Bloco 1: Imagem ocupando 100% da altura */}
            <div className="w-full sm:w-1/2 h-52 sm:h-full shrink-0 relative overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Bloco 2: Textos e botão alinhados à direita */}
            <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between items-end text-right">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#F5F1EB] tracking-wide">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToCatalog}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-sm bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] hover:text-white transition-all shadow-md group cursor-pointer active:scale-95"
              >
                <span>explorar</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

