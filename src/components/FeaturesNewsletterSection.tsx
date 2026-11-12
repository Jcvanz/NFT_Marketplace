import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const FeaturesNewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <section className="w-full pt-4">
      <div className="w-full bg-[#241612] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* W - Segurança da carteira */}
          <div className="flex flex-col justify-between space-y-4 pr-4 pb-6 lg:pb-0 lg:pr-8 border-r border-b lg:border-b-0 border-[#D28A4C]">
            <div className="space-y-4">
              <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-[#D28A4C] flex items-center justify-center shrink-0 shadow-lg">
                <span className="font-extrabold text-2xl sm:text-3xl text-[#140D0A] tracking-wider">
                  W
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#F5F1EB] text-left leading-tight">
                Segurança da carteira
              </h3>

              <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed text-left">
                Proteja seus colecionáveis digitais com os mais altos padrões de custódia e criptografia.
              </p>
            </div>
          </div>

          {/* C - Criadores em destaque */}
          <div className="flex flex-col justify-between space-y-4 pl-4 pb-6 lg:pb-0 lg:px-8 border-b lg:border-b-0 lg:border-r border-[#D28A4C]">
            <div className="space-y-4">
              <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-[#D28A4C] flex items-center justify-center shrink-0 shadow-lg">
                <span className="font-extrabold text-2xl sm:text-3xl text-[#140D0A] tracking-wider">
                  C
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#F5F1EB] text-left leading-tight">
                Criadores em destaque
              </h3>

              <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed text-left">
                Acompanhe coleções originais e artistas emergentes selecionados pela nossa curadoria.
              </p>
            </div>
          </div>

          {/* D - Alertas de lançamentos */}
          <div className="flex flex-col justify-between space-y-4 pr-4 pt-6 lg:pt-0 lg:px-8 border-r border-[#D28A4C]">
            <div className="space-y-4">
              <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-[#D28A4C] flex items-center justify-center shrink-0 shadow-lg">
                <span className="font-extrabold text-2xl sm:text-3xl text-[#140D0A] tracking-wider">
                  D
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#F5F1EB] text-left leading-tight">
                Alertas de lançamentos
              </h3>

              <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed text-left">
                Receba notificações instantâneas sobre drops exclusivos e eventos de cunhagem prioritária.
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-between space-y-3 pl-4 pt-6 lg:pt-0 lg:pl-8">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#F5F1EB] text-left leading-tight">
                Antecipe-se ao próximo lançamento
              </h3>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex flex-col md:flex-row relative overflow-hidden md:rounded-xl gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="digite seu e-mail..."
                    className="w-full bg-[#38220F] text-[#F5F1EB] placeholder-[#CFB28C]/60 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D28A4C]/30 focus:outline-none focus:border-[#D28A4C] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 md:rounded-l-none rounded-xl md:absolute right-0 h-full py-2.5 bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] hover:text-white transition-all shadow-md active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Enviar</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isSubscribed && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-in fade-in">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Inscrição realizada com sucesso!</span>
                  </div>
                )}
              </form>

              {/* Texto informativo com fonte pequena na cor #CFB28C */}
              <p className="text-[11px] sm:text-xs text-[#CFB28C] leading-normal text-left">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
