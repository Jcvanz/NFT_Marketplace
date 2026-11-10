import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { socketHandler } from './socket';

export const worker = setupWorker(...handlers, socketHandler);

export async function enableMocking(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const isMockDisabled = import.meta.env.VITE_DISABLE_MOCKS === 'true';
  if (isMockDisabled) {
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[MSW] Iniciou o Mock Service Worker');
  } catch (error) {
    console.error('[MSW] Falhou ao iniciar o Mock Service Worker:', error);
  }
}

