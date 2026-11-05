import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones que empiecen con /api hacia el backend
      '/api': {
        target: 'http://localhost:5000', // <-- Cámbialo si tu backend usa otro puerto (ej. 5000)
        changeOrigin: true,
        secure: false,
      }
    }
  }
})