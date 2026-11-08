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
        target: 'https://smart-stay-api.onrender.com',
        changeOrigin: true,
      },
      '/admin': {
        target: 'https://smart-stay-api.onrender.com',
        changeOrigin: true,
      },
      '/health': {
        target: 'https://smart-stay-api.onrender.com',
        changeOrigin: true,
      },
      '/integrations': {
        target: 'https://smart-stay-api.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://smart-stay-api.onrender.com',
        ws: true,
      },
    },
  },
})

