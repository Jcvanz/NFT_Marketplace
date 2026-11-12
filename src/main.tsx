import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { enableMocking } from './mocks';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// Create TanStack Router instance with empty context placeholder
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // injected dynamically by InnerApp
  },
  defaultPreload: 'intent',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

async function prepareApp() {
  await enableMocking();

  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WalletProvider>
              <InnerApp />
            </WalletProvider>
          </AuthProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
  }
}

prepareApp();
