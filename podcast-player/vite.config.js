import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { consoleCapture } from './vite-plugins/console-capture.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), consoleCapture()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001')
  }
})
