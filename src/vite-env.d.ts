/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_MOCKS?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

