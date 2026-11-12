import React, { useState } from 'react';
import { getActiveScenario, setActiveScenario, MockScenario } from '../mocks/scenarios';
import { emitNftUpdated, emitOrderUpdated } from '../mocks/socket';
import { mockDb } from '../mocks/db';
import { useQueryClient } from '@tanstack/react-query';
import { Wrench, ChevronUp, ChevronDown, RotateCcw, Radio, Sparkles } from 'lucide-react';

export const DevToolsPanel: React.FC<{ isSocketConnected: boolean }> = ({ isSocketConnected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scenario, setScenario] = useState<MockScenario>(getActiveScenario());
  const queryClient = useQueryClient();

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextScenario = e.target.value as MockScenario;
    setScenario(nextScenario);
    setActiveScenario(nextScenario);
  };

  const handleResetDb = () => {
    mockDb.reset();
    queryClient.invalidateQueries();
    alert('Banco de dados simulado restaurado para o estado inicial!');
  };

  const handleSimulateNftPriceRise = () => {
    // Simulates Socket.IO event updating NFT 1 price from 0.45 to 0.89 ETH
    emitNftUpdated('nft-1', 'ed-1-standard', '0.89', 5);
  };

  const handleSimulateSoldOut = () => {
    // Simulates Socket.IO event making NFT 1 sold out
    emitNftUpdated('nft-1', 'ed-1-standard', '0.45', 0);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur-md space-y-4 text-xs border-primary/20">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Wrench className="h-4 w-4 text-primary" />
              <span>Painel de Avaliação & Mocks</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-muted"
              title="Minimizar painel"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Socket.IO status */}
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Radio className="h-3.5 w-3.5" />
              <span>Status do Socket.IO:</span>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                isSocketConnected
                  ? 'bg-emerald-500/20 text-emerald-600'
                  : 'bg-amber-500/20 text-amber-600'
              }`}
            >
              {isSocketConnected ? 'Conectado' : 'Simulado/Ativo'}
            </span>
          </div>

          {/* Scenario Selector */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">
              Cenário de Rede / Falha (MSW):
            </label>
            <select
              value={scenario}
              onChange={handleScenarioChange}
              className="w-full p-2 rounded-lg border bg-background text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="default">Normal (Sucesso)</option>
              <option value="slow_network">Rede Lenta (1.5s delay)</option>
              <option value="network_error">Erro de Rede (HTTP 500)</option>
              <option value="session_expired">Sessão Expirada (HTTP 401)</option>
              <option value="validation_conflict">Conflito de Cadastro (HTTP 409)</option>
              <option value="invalid_coupon">Cupom Inválido / Expirado</option>
              <option value="price_changed">Preço Alterado no Checkout</option>
              <option value="sold_out">Edição Esgotada no Checkout</option>
              <option value="payment_rejected">Pagamento Recusado (Saldo Insuficiente)</option>
              <option value="idempotency_timeout">Timeout com Recuperação Idempotente</option>
              <option value="empty_catalog">Catálogo Vazio</option>
            </select>
          </div>

          {/* Real-time Socket Event Triggers */}
          <div className="space-y-2 border-t pt-3">
            <span className="font-semibold text-muted-foreground block flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Disparar Eventos Tempo Real (Socket.IO):</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleSimulateNftPriceRise}
                className="p-1.5 rounded-lg border bg-secondary hover:bg-secondary/80 font-medium text-[11px] text-center"
              >
                Subir preço NFT #1 (0.89 ETH)
              </button>
              <button
                onClick={handleSimulateSoldOut}
                className="p-1.5 rounded-lg border bg-secondary hover:bg-secondary/80 font-medium text-[11px] text-center"
              >
                Esgotar NFT #1 (Estoque 0)
              </button>
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="border-t pt-2">
            <button
              onClick={handleResetDb}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive font-semibold text-xs hover:bg-destructive/20 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar Banco de Dados</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden items-center gap-2 px-3.5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-lg hover:opacity-90 transition-all border"
        >
          <Wrench className="h-4 w-4" />
          <span>Controles de Teste & Mocks</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
