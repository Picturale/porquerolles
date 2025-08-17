import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Use automatic JSX runtime (modern approach)
    jsxRuntime: 'automatic'
  })],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          router: ['react-router-dom'],
          icons: ['react-icons/fa']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
});
