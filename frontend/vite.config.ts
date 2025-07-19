import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  // The proxy below is only used in development.
  // In production, your frontend should use the backend URL from environment variables (VITE_API_BASE_URL) in your axios instance.
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
