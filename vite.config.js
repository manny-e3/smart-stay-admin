import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/staff': {
        target: 'https://dev.rekovryltd.com',
        changeOrigin: true,
      },
      '/admin': {
        target: 'https://dev.rekovryltd.com',
        changeOrigin: true,
      },
      '/health': {
        target: 'https://dev.rekovryltd.com',
        changeOrigin: true,
      },
      '/integrations': {
        target: 'https://dev.rekovryltd.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://dev.rekovryltd.com',
        ws: true,
      },
    },
  },
})

