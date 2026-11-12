import { test, expect } from '@playwright/test';

test.describe('NFT Marketplace - E2E Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database to ensure clean, isolated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test('1. Catálogo: busca, filtros de categoria, ordenação e estado persistido na URL', async ({ page }) => {
    await page.goto('/');

    // Verify initial load
    await expect(page.locator('h1')).toContainText('Explorar NFTs');
    await expect(page.locator('text=Cyber Samurai #042')).toBeVisible();

    // Search for a specific NFT
    const searchInput = page.locator('input[placeholder*="Buscar por título"]');
    await searchInput.fill('Samurai');
    await expect(page).toHaveURL(/search=Samurai/);
    await expect(page.locator('text=Cyber Samurai #042')).toBeVisible();
    await expect(page.locator('text=Neon Horizon #108')).not.toBeVisible();

    // Filter by Category
    await page.locator('button:text("Gaming")').click();
    await expect(page).toHaveURL(/category=gaming/);

    // Refresh and check that URL state survived
    await page.reload();
    await expect(page).toHaveURL(/category=gaming/);
    await expect(page.locator('text=Aether Mech Pilot #07')).toBeVisible();
  });

  test('2. Detalhe do NFT e tratamento de 404 (recurso inexistente)', async ({ page }) => {
    // Direct access to existing NFT
    await page.goto('/nft/nft-1');
    await expect(page.locator('h1')).toContainText('Cyber Samurai #042');
    await expect(page.locator('text=Standard Edition')).toBeVisible();

    // Direct access to non-existent NFT
    await page.goto('/nft/nft-inexistente-999');
    await expect(page.locator('text=NFT não encontrado')).toBeVisible();
    await expect(page.locator('text=Voltar ao Catálogo')).toBeVisible();
  });

  test('3. Autenticação: Login, Sessão persistida após refresh e Logout', async ({ page }) => {
    await page.goto('/login');

    // Fill credentials (default Alice)
    await page.locator('input[type="email"]').fill('alice@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:text("Entrar")').click();

    // Redirect to home and verify authenticated header icons
    await expect(page).toHaveURL('/');
    await expect(page.locator('a[title="Perfil"]')).toBeVisible();
    await expect(page.locator('a[title="Carteiras"]')).toBeVisible();

    // Refresh and verify session is restored
    await page.reload();
    await expect(page.locator('a[title="Perfil"]')).toBeVisible();

    // Logout
    await page.locator('button[title="Sair"]').click();
    await expect(page.locator('text=Entrar')).toBeVisible();
  });

  test('4. Favoritos: Atualização otimista e persistência para usuário autenticado', async ({ page }) => {
    // Authenticate first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('alice@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:text("Entrar")').click();
    await expect(page).toHaveURL('/');

    // Click favorite on first NFT
    const favButton = page.locator('button[aria-label="Adicionar aos favoritos"]').first();
    await favButton.click();

    // Optimistic update: state toggled immediately
    await expect(page.locator('button[aria-label="Remover dos favoritos"]').first()).toBeVisible();
  });

  test('5. Carrinho: Inclusão, quantidade, aplicação de cupom e resumo de cotação', async ({ page }) => {
    await page.goto('/nft/nft-1');

    // Add to cart
    await page.locator('button:text("Adicionar ao Carrinho")').click();
    await expect(page.locator('text=Item adicionado ao carrinho!')).toBeVisible();

    // Navigate to Cart
    await page.goto('/cart');
    await expect(page.locator('text=Cyber Samurai #042')).toBeVisible();

    // Increase quantity
    await page.locator('button:text("+")').click();
    await expect(page.locator('text=2')).toBeVisible();

    // Apply Coupon
    await page.locator('input[placeholder*="Ex: BEMVINDO10"]').fill('BEMVINDO10');
    await page.locator('button:text("Aplicar")').click();

    // Verify discount is applied in quote breakdown
    await expect(page.locator('text=Desconto')).toBeVisible();
    await expect(page.locator('text=BEMVINDO10 (-10%)')).toBeVisible();
  });

  test('6. Fluxo completo de compra: do carrinho à confirmação com recibo e hash blockchain', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('alice@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:text("Entrar")').click();

    // 2. Add NFT to Cart
    await page.goto('/nft/nft-2');
    await page.locator('button:text("Comprar Agora")').click();

    // 3. Checkout Page (Protected route reached)
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('text=Identificação do Colecionador')).toBeVisible();
    await expect(page.locator('text=Alice Silva')).toBeVisible();

    // 4. Confirm Order
    await page.locator('button:text("Confirmar e Pagar")').click();

    // 5. Order Confirmation receipt
    await expect(page).toHaveURL(/\/order\/.*\/confirmation/);
    await expect(page.locator('text=Compra Confirmada!')).toBeVisible();
    await expect(page.locator('text=Hash da Transação (Blockchain)')).toBeVisible();
    await expect(page.locator('text=Itens Adquiridos')).toBeVisible();
  });

  test('7. Tempo Real: Evento Socket.IO nft.updated reflete alterações de preço no catálogo e carrinho', async ({ page }) => {
    await page.goto('/nft/nft-1');
    await page.locator('button:text("Adicionar ao Carrinho")').click();
    await page.goto('/cart');

    // Initial price
    await expect(page.locator('text=0.45 ETH cada')).toBeVisible();

    // Open DevTools and trigger Socket.IO price rise
    await page.locator('button:text("Controles de Teste & Mocks")').click();
    await page.locator('button:text("Subir preço NFT #1")').click();

    // Verify real-time warning and price update on cart without page refresh
    await expect(page.locator('text=0.89 ETH cada')).toBeVisible();
    await expect(page.locator('text=Preço ou estoque atualizado via rede em tempo real')).toBeVisible();
  });
});

