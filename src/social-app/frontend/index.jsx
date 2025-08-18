import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './styles/index.css';
import { TrustProvider } from './trust/TrustProvider';
// Debug iOS safe area si en mode debug
import './ios-debug.js';

console.log('🚀 Starting React app...');

const root = ReactDOM.createRoot(document.getElementById('root'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.log('❌ [ErrorBoundary] error:', error?.message, 'stack:', error?.stack);
    console.log('❌ [ErrorBoundary] componentStack:', info?.componentStack);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { style: { padding: 16, fontFamily: 'monospace', color: '#b00020' } },
        React.createElement('h2', null, 'Erreur de rendu'),
        React.createElement('pre', null, this.state.error?.message || 'Unknown error'),
        this.state.info?.componentStack
          ? React.createElement('pre', null, this.state.info.componentStack)
          : null
      );
    }
    return this.props.children;
  }
}

// Remove the initial loading screen once React is ready
const removeInitialLoader = () => {
  console.log('📱 Removing initial loader...');
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
      console.log('✅ Initial loader removed');
    }, 300);
  }
};

// Déterminer le contexte d'exécution
const isLocalhost = window.location.hostname === 'localhost';
const isMainDomain = window.location.hostname === 'lepictorialist.com';
const isFirebaseHost =
  window.location.hostname.includes('web.app') ||
  window.location.hostname.includes('firebaseapp.com');

// Toujours utiliser HashRouter pour une compatibilité maximale (Capacitor/WebView)
const RouterComponent = HashRouter;
const basename = '';

console.log('🔧 Environment:', import.meta.env.DEV ? 'development' : 'production');
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Pathname:', window.location.pathname);
console.log('🔧 Is localhost:', isLocalhost);
console.log('🔧 Is main domain:', isMainDomain);
console.log('🔧 Is Firebase host:', isFirebaseHost);
console.log('🔧 Basename:', basename);

// iOS/Capacitor diagnostics
console.log('[ios] protocol:', window.location.protocol);
console.log('[ios] userAgent:', navigator.userAgent);
console.log('[ios] platform:', navigator.platform);
console.log('[ios] language:', navigator.language);
console.log('[ios] viewport:', {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: window.devicePixelRatio,
});
console.log('[ios] document.readyState:', document.readyState);
console.log('[ios] Capacitor present:', typeof window.Capacitor !== 'undefined');

// Marquer le body si la status bar iOS chevauche le WebView (pour nos CSS fallbacks)
try {
  if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
    // Capacitor 7 n'expose pas toujours l'état d'overlay via JS, on utilise un heuristique conservateur.
    // Forcer l'overlay disabled pour éviter que le top menu soit caché
    document.body.classList.add('capacitor-ios');
    // Toujours supposer que l'overlay est désactivé maintenant avec le plugin StatusBar
    document.body.classList.remove('statusbar-overlay');
    console.log('[ios] body classes:', document.body.className);

    // Initialiser StatusBar pour iOS - FORCER désactivation overlay et style sombre
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');

        // Debug: vérifier les infos de la status bar avant config
        try {
          const info = await StatusBar.getInfo();
          console.log('[ios] StatusBar info AVANT config:', info);
        } catch (e) {
          console.log('[ios] StatusBar getInfo() non disponible');
        }

        // Configuration forcée
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Dark });

        // Forcer les styles CSS pour s'assurer que l'interface est visible
        document.body.classList.remove('statusbar-overlay');
        document.body.classList.add('statusbar-no-overlay');

        // Vérifier après config
        try {
          const info = await StatusBar.getInfo();
          console.log('[ios] StatusBar info APRÈS config:', info);
        } catch (e) {
          console.log('[ios] StatusBar getInfo() non disponible après config');
        }

        console.log('[ios] StatusBar configuré avec succès: overlay=false, style=Dark');
      } catch (statusBarError) {
        console.log('[ios] ERREUR StatusBar plugin:', statusBarError.message);
        // Fallback: forcer le CSS à compenser
        document.body.style.setProperty('--status-bar-height', '44px');
        console.log('[ios] Fallback CSS appliqué: status bar height = 44px');
      }
    })();
  }
} catch (_) {}

window.addEventListener('hashchange', () => {
  console.log('[ios] hashchange:', window.location.hash, 'full URL:', window.location.href);
});

window.addEventListener('error', (e) => {
  try {
    console.log('❌ [global error]', e.message || e, e?.error?.stack || '');
    console.log('❌ [global error details]', {
      type: e.type,
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      errorName: e?.error?.name,
      errorMessage: e?.error?.message,
    });
  } catch (_) {}
});
window.addEventListener('unhandledrejection', (e) => {
  console.log('❌ [unhandledrejection]', e.reason?.message || e.reason || e);
});

// Legacy onerror for older WKWebView error propagation
window.onerror = function (message, source, lineno, colno, error) {
  try {
    console.log('❌ [window.onerror]', { message, source, lineno, colno, stack: error?.stack });
  } catch (_) {}
};

// Capture resource loading errors (scripts, css, images)
window.addEventListener(
  'error',
  function (e) {
    const target = e.target || e.srcElement;
    if (
      target &&
      (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')
    ) {
      const url = target.src || target.href || target.currentSrc || '';
      console.log('❌ [resource error]', target.tagName, url);
    }
  },
  true
);

const rootEl = document.getElementById('root');
console.log('[ios] #root exists:', !!rootEl);

// Force initial route to Welcome when using HashRouter (helps avoid blank screens)
if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
  window.location.hash = '#/welcome';
}

try {
  console.log('🎨 Rendering React app...');
  root.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(
          RouterComponent,
          { basename },
          React.createElement(
            AuthProvider,
            null,
            React.createElement(TrustProvider, null, React.createElement(App))
          )
        )
      )
    )
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  // Fallback: show error message
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Erreur de chargement</h2>
      <p>Erreur: ${error.message}</p>
      <p>Vérifiez la console pour plus de détails.</p>
    </div>
  `;
}

// Remove loader after React has rendered
setTimeout(removeInitialLoader, 100);
