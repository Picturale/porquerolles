import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

// Functions base URL is read from env (supports emulator URL)
// Example: http://127.0.0.1:5001/porquerolles-16e8d/europe-west1
function getFunctionsBase(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  return env.FUNCTIONS_BASE_URL || process.env.FUNCTIONS_BASE_URL || 'https://europe-west1-porquerolles-16e8d.cloudfunctions.net';
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: 'src/social-app',
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/social-app/index.html')
      }
    },
    emptyOutDir: true,
    outDir: '../../dist/social-app',
    target: 'es2020',
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 8000,
    host: true,
    open: '/src/social-app/',
    cors: true,
    proxy: {
      // Proxy Firestore requests
      '/firestore': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/firestore/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode);
          });
        },
      },

      '/api/products/search': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/productsSearch',
        secure: false,
      },
      '/api/products/validate': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/productsValidate',
        secure: false,
  },
      '/api/admin/bootstrap': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminBootstrap',
        secure: false,
      },
      '/api/admin/metrics/overview': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminMetricsOverview',
        secure: false,
      },
      '/api/admin/users/roles': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminUsersRoles',
        secure: false,
      },
      '/api/admin/users/ban': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminUsersBan',
        secure: false,
      },
      '/api/admin/moderation/decide': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminModerationDecide',
        secure: false,
      },
      '/api/admin/owner/grant': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/ownerGrant',
        secure: false,
      },
      '/api/admin/moderation/list': {
        target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminModerationList',
        secure: false,
  }
    }
  },
  publicDir: 'frontend/public',
  preview: {
    port: 8000,
    host: true
  },
  resolve: {
    alias: {
      '@social': resolve(__dirname, 'src/social-app'),
      '@shared': resolve(__dirname, 'src/shared-ui')
    }
  }
}));
