# Arquitetura Técnica — NFT Marketplace

Este documento descreve as decisões de arquitetura, contratos de dados, estratégias de estado assíncrono, persistência, tempo real e políticas de teste do projeto **NFT Marketplace**, conforme as especificações do desafio.

---

## 1. Visão Geral da Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Build & Bundler** | Vite 6 | Inicialização instantânea, HMR veloz, suporte nativo a ESM e integração perfeita com TanStack Router e Tailwind v4. |
| **Interface** | React 19 + TypeScript 5 | Tipagem estrita de ponta a ponta, semântica moderna e suporte a concorrência. |
| **Roteamento** | TanStack Router | Rotas tipadas por arquivo (`file-based routing`), code-splitting automático por rota e validação estrita de search params via Zod. |
| **Estado Remoto & Cache** | TanStack Query v5 | Cache inteligente, políticas de revalidação, suporte nativo a **atualização otimista com rollback** e fábrica de chaves (`queryKeys`). |
| **Cliente HTTP** | Axios | Instância única centralizada com interceptors para injeção de tokens Bearer, cabeçalho de sessão anônima (`X-Guest-Session-Id`) e captura global de 401. |
| **Tempo Real** | Socket.IO (`socket.io-client`) | Comunicação bidirecional orientada a eventos para atualização dinâmica de preços, estoque e status de transação. |
| **Mocking de Rede** | MSW 2 (Mock Service Worker) + `@mswjs/socket.io-binding` | Interceptação na camada de rede (Service Worker / WebSocket), garantindo que os componentes e o cliente HTTP consumam APIs REST reais sem bypass. |
| **Estilização** | Tailwind CSS v4 | Estilização utilitária performática com suporte a tokens semânticos e animação de shimmer para skeletons. |
| **Precisão Numérica** | BigNumber.js | Cálculos aritméticos em Ethereum sem perda de precisão de ponto flutuante, trafegando estritamente como strings decimais decimais. |
| **Testes E2E** | Playwright | Cobertura ponta a ponta dos fluxos críticos em navegadores Desktop e Mobile Chromium com relatórios HTML. |

---

## 2. Contratos REST

A camada de rede interceptada pelo MSW implementa os seguintes contratos REST padronizados sob `/api`:

### 2.1 Autenticação e Sessão
- `POST /api/auth/login`: Recebe `{ email, password }`. Retorna `{ token, expiresAt, user }`.
- `POST /api/auth/register`: Recebe `{ name, handle, email, password }`. Retorna `{ token, expiresAt, user }` (retorna `409 Conflict` se e-mail já estiver cadastrado).
- `GET /api/auth/session`: Revalida a sessão a partir do cabeçalho `Authorization: Bearer <token>`. Retorna `{ user }` ou `401 Unauthorized`.
- `POST /api/auth/logout`: Revoga a sessão ativa.

### 2.2 NFTs e Catálogo
- `GET /api/nfts`: Suporta query parameters: `search`, `category`, `minPrice`, `maxPrice`, `sortBy` (`recently_listed`, `price_asc`, `price_desc`, `most_viewed`, `highest_edition`), `page` e `limit`. Retorna `{ items, total, page, limit, totalPages }`.
- `GET /api/nfts/:id`: Retorna os detalhes do NFT com galeria e edições (`{ nft }`). Retorna `404 Not Found` caso inexistente.

### 2.3 Favoritos
- `GET /api/favorites`: Retorna `{ favorites, favoriteIds }` do usuário autenticado.
- `POST /api/favorites/:id`: Alterna o estado de favorito do NFT.
- `DELETE /api/favorites/:id`: Remove o NFT dos favoritos.

### 2.4 Carrinho de Compras
- `GET /api/cart`: Retorna `{ items }` do usuário autenticado ou visitante (`X-Guest-Session-Id`).
- `POST /api/cart`: Adiciona item com validação de estoque máximo disponível por edição.
- `PUT /api/cart/:id`: Altera a quantidade de um item.
- `DELETE /api/cart/:id`: Remove um item do carrinho.
- `DELETE /api/cart`: Esvazia o carrinho.
- `POST /api/cart/merge`: Mescla os itens do visitante com a conta do usuário recém-autenticado, preservando escolhas prévias.

### 2.5 Cotação e Cupons
- `POST /api/quote`: Recebe `{ items, couponCode }`. Retorna a cotação calculada em tempo real com precisão decimal:
  ```json
  {
    "quoteId": "quote-1741630000",
    "subtotalEth": "0.7300",
    "discountEth": "0.0730",
    "networkFeeEth": "0.0042",
    "totalEth": "0.6612",
    "coupon": { "code": "BEMVINDO10", "discountPercentage": 10 },
    "quotedAt": "2026-11-10T18:00:00.000Z"
  }
  ```

### 2.6 Pedidos e Idempotência
- `POST /api/orders`: Criação do pedido com chave de idempotência obrigatória (`Idempotency-Key` no cabeçalho ou payload).
  - Caso a chave já tenha sido processada, retorna exatamente o mesmo pedido persistido sem cobranças duplicadas.
  - Gera um snapshot imutável do recibo com transação simulada em blockchain.
- `GET /api/orders/:id`: Consulta do pedido e recibo.

---

## 3. Tempo Real & Socket.IO

A integração em tempo real utiliza a biblioteca oficial `socket.io-client` conectada ao interceptor WebSocket do MSW (`@mswjs/socket.io-binding`).

### Eventos Implementados
1. **`nft.updated`**:
   - Disparado sempre que o preço ou a disponibilidade de um NFT/edição é alterado no mercado.
   - **Formato**:
     ```json
     {
       "type": "nft.updated",
       "eventId": "evt-1741630000-abc12",
       "version": 2,
       "timestamp": "2026-11-10T18:00:00.000Z",
       "data": {
         "nftId": "nft-1",
         "editionId": "ed-1-standard",
         "newPriceEth": "0.89",
         "availableQuantity": 5,
         "totalQuantity": 50,
         "isAvailable": true
       }
     }
     ```
   - **Comportamento no cliente (`useSocketReconciliation`)**:
     - Verifica a versão contra o mapa monotônico de versões (`resourceVersions.get(nftId)`). Eventos antigos ou duplicatas são sumariamente descartados.
     - Atualiza o cache do catálogo (`queryKeys.nfts.all`) e o detalhe do NFT.
     - Se o item estiver presente no carrinho ativo do usuário: atualiza `currentPriceEth`, ativa o alerta visual `hasPriceChanged: true` e invalida o cache de cotação (`['quote']`). Isso impede que o checkout seja finalizado com uma cotação desatualizada.

2. **`order.updated`**:
   - Notifica a transição de estado de pedidos pendentes para confirmados ou recusados.
   - Valida estritamente o `userId` para impedir vazamento de eventos entre sessões distintas.

3. **Reconciliação pós-reconexão**:
   - Ao disparar o evento `reconnect` do socket, o cliente invalida as consultas ativas de catálogo, carrinho e pedidos, resincronizando o estado com as respostas REST mais recentes.
   - Todos os ouvintes são cancelados no desmonte do hook (`return () => socket.off(...)`).

---

## 4. Estratégia de Estado & Cache (TanStack Query)

### 4.1 Isolamento e Política de Revalidação
- `staleTime`: 30 segundos para consultas de catálogo e perfil.
- `retry`: Limitado a 1 tentativa para erros transitórios (5xx) e **desativado para erros 4xx** (401, 404, 409).
- `placeholderData`: Usado no catálogo para manter os itens anteriores visíveis durante transições de página ou filtro, eliminando layout shifts.

### 4.2 Atualização Otimista com Rollback
Implementada no hook `useFavorites`:
1. **`onMutate`**: Cancela consultas em andamento para a chave `queryKeys.favorites` e captura um snapshot do cache atual. Em seguida, atualiza imediatamente a UI (o coração preenche na hora).
2. **`onError`**: Caso a requisição à API falhe (ou o MSW simule erro de rede), o estado anterior é integralmente restaurado (`queryClient.setQueryData(queryKeys.favorites, context.previousFavorites)`).
3. **`onSettled`**: Invalida as consultas para garantir paridade com o servidor.

---

## 5. Precisão de Valores em Ethereum (ETH)

Conforme estipulado no enunciado:
> *"Valores em ETH devem trafegar como strings decimais e manter precisão nos cálculos e na apresentação. Quantidades são inteiras."*

Implementado em `src/lib/eth.ts`:
- Uso da biblioteca **BigNumber.js** configurada com 18 casas decimais e modo de arredondamento `ROUND_DOWN`.
- Nenhuma operação monetária utiliza tipos numéricos primitivos do JavaScript (`float`).
- Funções utilitárias: `addEth()`, `subEth()`, `multiplyEth()`, `formatEth()` e `hasSufficientBalance()`.

---

## 6. Persistência Local e Seletor de Cenários

O mock database (`src/mocks/db.ts`) persiste o estado das entidades no `localStorage` do navegador (`nft_mock_db_state_v1`). Desta forma:
- Um refresh na página (`F5`) preserva itens no carrinho, novo usuário cadastrado, carteiras conectadas e histórico de pedidos.
- O painel flutuante de testes (**DevToolsPanel**) permite restaurar o banco de dados para os dados iniciais com um clique no botão **Restaurar Banco de Dados**.
- O painel também permite alternar o cenário ativo do MSW:
  - `default`: Funcionamento normal de sucesso.
  - `slow_network`: Latência forçada de 1.5s para avaliar shimmer e skeletons.
  - `network_error`: Resposta HTTP 500 para avaliar telas de erro e recuperação.
  - `session_expired`: Retorna HTTP 401 para avaliar redirecionamento de login.
  - `validation_conflict`: Retorna HTTP 409 para simular e-mail já cadastrado.
  - `invalid_coupon`: Cupom inválido ou expirado.
  - `price_changed` / `sold_out`: Falhas de concorrência durante o checkout.
  - `payment_rejected`: Recusa de transação por saldo insuficiente.
  - `idempotency_timeout`: Simula timeout na resposta da ordem, demonstrando que reenviar a mesma chave recupera o mesmo pedido sem duplicá-lo.

