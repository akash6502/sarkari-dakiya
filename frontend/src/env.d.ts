/// <reference types="vite/client" />

// Custom typings for Vite environment variables used in this project
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other VITE_* variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
