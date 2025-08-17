import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

// Functions base URL is read from env (supports emulator URL)
// Example: http://127.0.0.1:5001/vision-picturale-community/us-central1
function getFunctionsBase(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  return env.FUNCTIONS_BASE_URL || process.env.FUNCTIONS_BASE_URL || 'https://us-central1-vision-picturale-community.cloudfunctions.net';
}

// Dev-only middleware to mock affiliate endpoints when Functions are not available
function devAffiliateApiMock(): Plugin {
  const enabled = !process.env.FUNCTIONS_BASE_URL && process.env.AFFILIATES_DEV_MOCK !== 'false';
  // Simple mock dataset
  const MOCK = [
    { id: 'amazon', kind: 'merchant', name: 'Amazon', domain: 'amazon.fr', logoUrl: 'https://logo.clearbit.com/amazon.com' },
    { id: 'etsy', kind: 'merchant', name: 'Etsy', domain: 'etsy.com', logoUrl: 'https://logo.clearbit.com/etsy.com' },
    { id: 'adobe', kind: 'merchant', name: 'Adobe', domain: 'adobe.com', logoUrl: 'https://logo.clearbit.com/adobe.com' },
    { id: 'figma', kind: 'merchant', name: 'Figma', domain: 'figma.com', logoUrl: 'https://logo.clearbit.com/figma.com' },
    { id: 'canon-eos-r', kind: 'product', name: 'Canon EOS R', domain: 'canon.fr', logoUrl: 'https://logo.clearbit.com/canon.fr' },
    { id: 'sony-a7-iv', kind: 'product', name: 'Sony A7 IV', domain: 'sony.com', logoUrl: 'https://logo.clearbit.com/sony.com' },
  ];
  return {
  name: 'dev-affiliate-api-mock',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) return;
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/affiliates/search')) {
          const qMatch = /[?&]q=([^&]+)/.exec(url);
          const q = qMatch ? decodeURIComponent(qMatch[1]) : '';
          const ql = q.toLowerCase();
          const out = ql
            ? MOCK.filter((s) => s.name.toLowerCase().includes(ql) || (s.domain && s.domain.toLowerCase().includes(ql))).slice(0, 10)
            : [];
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(out));
          return;
        }
        if (url.startsWith('/api/affiliates/validate')) {
          // Collect body
          const chunks: Buffer[] = [];
          req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf-8');
              const json = raw ? JSON.parse(raw) : {};
              const items = Array.isArray(json.items) ? json.items : [];
              const allowed = new Map(MOCK.map((s) => [`${s.kind}:${s.id}`, s]));
              const validated = items
                .map((i: any) => ({
                  source: 'skimlinks',
                  kind: i.kind === 'product' ? 'product' : 'merchant',
                  id: String(i.id || '').toLowerCase(),
                  name: String(i.name || '').trim(),
                  domain: i.domain ? String(i.domain).toLowerCase() : undefined,
                  logoUrl: i.logoUrl || undefined,
                  deeplinkTemplate: i.deeplinkTemplate || undefined,
                }))
                .filter((i: any) => i.id && i.name)
                .map((i: any) => {
                  const key = `${i.kind}:${i.id}`;
                  if (allowed.has(key)) {
                    const base: any = allowed.get(key);
                    return {
                      ...i,
                      linkUrl: i.deeplinkTemplate ? i.deeplinkTemplate.replace(/\{\{product_id\}\}/g, i.id) : (i.domain ? `https://${i.domain}` : undefined),
                      domain: i.domain || base.domain,
                      logoUrl: i.logoUrl || base.logoUrl,
                    };
                  }
                  return { ...i, linkUrl: i.domain ? `https://${i.domain}` : undefined };
                }).slice(0, 20);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(validated));
            } catch (e) {
              res.statusCode = 400;
              res.end('[]');
            }
          });
          return;
        }
        if (url.startsWith('/api/invites/redeem')) {
          const chunks: Buffer[] = [];
          req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf-8');
              const json = raw ? JSON.parse(raw) : {};
              const code = String(json.code || '').trim();
              const ok = /^[A-Z0-9]{4,10}(-[A-Z0-9]{2,6})?$/.test(code) || ['BETA-2025','FRIEND-01','ALPHA-TEST'].includes(code.toUpperCase());
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ ok }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: 'bad_request' }));
            }
          });
          return;
        }
        if (url.startsWith('/api/admin/metrics/overview')) {
          // Minimal mock: return zeros
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, data: { users: 0, posts: 0, masked: 0, provisional: 0, stable: 0 } }));
          return;
        }
        if (url.startsWith('/api/admin/moderation/list')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, items: [] }));
          return;
        }
        if (url.startsWith('/api/admin/invites/user')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, user: { uid: 'mock', username: 'mock', email: 'mock@example.com', badge: 'Seedling', invites: { balance: 0, issuedThisMonth: 0, redeemedThisMonth: 0 }, trust: { T: null } } }));
          return;
        }
        if (url.startsWith('/api/admin/invites/credit')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        if (url.startsWith('/api/admin/invites/recent')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, items: [] }));
          return;
        }
        if (url.startsWith('/api/admin/bootstrap')) {
          const chunks: Buffer[] = [];
          req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, uid: 'mock-admin-uid' }));
          });
          return;
        }
        if (url.startsWith('/api/admin/users/roles') || url.startsWith('/api/admin/users/ban') || url.startsWith('/api/admin/moderation/decide')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devAffiliateApiMock()],
  root: 'src/social-app',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/social-app/index.html')
      }
    },
    emptyOutDir: true,
    outDir: '../../dist',
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
      // Proxy affiliate API endpoints to Functions (emulator or remote)
      '/api/affiliates/search': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/affiliatesSearch',
        secure: false,
      },
      '/api/affiliates/validate': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/affiliatesValidate',
        secure: false,
      }
      ,
      '/api/invites/redeem': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/invitesRedeem',
        secure: false,
      }
      ,
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
      ,
      '/api/admin/invites/user': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminInvitesUser',
        secure: false,
      },
      '/api/admin/invites/credit': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminInvitesCredit',
        secure: false,
      },
      '/api/admin/invites/recent': {
  target: getFunctionsBase(mode),
        changeOrigin: true,
        rewrite: () => '/adminInvitesRecent',
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
      '@core': resolve(__dirname, 'src/core-app'),
      '@social': resolve(__dirname, 'src/social-app'),
      '@shared': resolve(__dirname, 'src/shared-ui')
    }
  }
}));
