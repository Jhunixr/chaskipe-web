import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // El chunk del avatar (Three.js) se carga de forma diferida; ~530 KB es
    // esperado y no afecta a la carga inicial.
    chunkSizeWarningLimit: 700,
  },
})
