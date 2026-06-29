import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      host: 'localhost',
      clientPort: 80,
    },
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
