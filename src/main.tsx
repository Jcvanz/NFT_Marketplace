import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Root mount point
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold">NFT Marketplace</h1>
      </div>
    </React.StrictMode>
  );
}

