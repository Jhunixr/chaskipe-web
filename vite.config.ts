import { fileURLToPath, URL } from 'node:url'

import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // HTTPS con certificado propio: los navegadores solo dan acceso a la camara
  // en contextos seguros, y "seguro" incluye localhost pero no una IP de la
  // red local. Sin esto el reconocimiento no funciona desde el telefono.
  plugins: [react(), basicSsl()],
  server: {
    // Escuchar en todas las interfaces para poder abrirlo desde el movil.
    host: true,
  },
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
