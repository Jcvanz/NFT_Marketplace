import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import { ArrowRight } from 'lucide-react';
import { image1, image2, image3 } from '../assets';

const CAROUSEL_IMAGES = [
  {
    id: 1,
    url: image1,
    title: 'Cyber Samurai #042',
  },
  {
    id: 2,
    url: image2,
    title: 'Neon Horizon #108',
  },
  {
    id: 3,
    url: image3,
    title: 'Aether Mech Pilot #07',
  },
  {
    id: 4,
    url: image1,
    title: 'Spectral Solitude #19',
  },
  {
    id: 5,
    url: image2,
    title: 'Harmonic Convergence #03',
  },
];

export const HeroSection: React.FC = () => {
  const handleExploreClick = () => {
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="hidden md:grid md:grid-cols-2 md:items-center md:gap-12 lg:gap-16 w-full py-4">
        <div className="flex flex-col items-start text-left space-y-6">
          <span className="text-sm font-light text-white tracking-widest uppercase">
            Bem-vindo á Kurio
          </span>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight tracking-tight">
            <span className="block whitespace-nowrap">Seja Dono do futuro</span>
            <span className="block whitespace-nowrap">da arte digital</span>
          </h1>

          <p className="text-[#CFB28C] text-sm lg:text-base font-light leading-relaxed max-w-lg">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExploreClick}
              className="bg-[#D28A4C] tracking-[1px] text-[#140D0A] font-bold text-base px-5 py-3 rounded-xl hover:bg-[#c0793b] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              EXPLORAR
            </button>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <div className="w-full max-w-[480px] lg:max-w-[520px]">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              loop={true}
              className="home-swiper w-full aspect-square rounded-3xl shadow-2xl overflow-hidden border border-[#D28A4C]/30"
            >
              {CAROUSEL_IMAGES.map((img) => (
                <SwiperSlide key={img.id} className="w-full h-full">
                  <div className="relative w-full h-full aspect-square bg-black/40 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover select-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                    <span className="absolute bottom-6 left-6 text-xs text-white/90 font-semibold backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/10">
                      {img.title}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <div className="block md:hidden w-full">
        <div className="relative w-full bg-[#241612] rounded-3xl p-4 sm:p-5 overflow-hidden shadow-xl">
          {/* Círculo 3: bem grande para a direita com cor fraquinha */}
          <div
            className="absolute -right-16 sm:-right-8 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-72 sm:h-72 rounded-full pointer-events-none z-0 rotate-[120deg]"
            style={{
              background:
                'linear-gradient(140deg, #8f6629b0 0%, #d4954714 55%, #8c531b05 100%)',
            }}
            aria-hidden="true"
          />

          <div
            className="absolute -left-10 sm:-left-8 top-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64 rounded-full pointer-events-none z-[1] -rotate-[100deg]"
            style={{
              background:
                'linear-gradient(135deg, #a0640aff 0%, #a76310a6 50%, #5e32066e 100%)',
            }}
            aria-hidden="true"
          />

          <div
            className="absolute left-22 sm:left-32 top-[60%] -translate-y-1/2 w-54 h-54 sm:w-48 sm:h-48 rounded-full pointer-events-none z-[2] rotate-[6deg]"
            style={{
              background:
                'linear-gradient(155deg, #916429b3 0%, #a75a0394 55%, #bd59026b 100%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-row items-center justify-between gap-3">
            <div className="flex-1 flex flex-col items-start text-left min-w-0 space-y-1.5 sm:space-y-2">
              <span className="text-[9px] sm:text-[11px] font-light text-white tracking-widest uppercase">
                Bem-vindo á Kurio
              </span>

              <h1 className="text-xs min-[360px]:text-sm sm:text-lg font-extrabold text-white leading-tight tracking-tight">
                <span className="block whitespace-nowrap">Seja Dono do futuro</span>
                <span className="block whitespace-nowrap">da arte digital</span>
              </h1>

              <p className="text-[10px] font-light text-[#CFB28C] leading-tight line-clamp-3">
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleExploreClick}
                  className="text-[#CFB28C] flex items-center justify-center font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-[12px]">EXPLORAR</span>
                  <ArrowRight className="size-3 ml-1" />
                </button>
              </div>
            </div>

            <div className="w-[45%] max-w-[170px] sm:max-w-[200px] shrink-0">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                loop={true}
                className="home-swiper-mobile w-full aspect-square rounded-3xl overflow-hidden"
              >
                {CAROUSEL_IMAGES.map((img) => (
                  <SwiperSlide key={img.id} className="w-full h-full">
                    <div className="relative w-full h-full aspect-square bg-black/40 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover select-none"
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
