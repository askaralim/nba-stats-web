import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy only for local development
  // In production, use VITE_API_URL environment variable
  server: {
    port: 5173,
    host: true, // Allow external connections
    hmr: {
      // Enable Hot Module Replacement
      overlay: true, // Show errors in browser overlay
    },
    watch: {
      // Watch for file changes
      usePolling: false, // Use native file system events (faster)
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
