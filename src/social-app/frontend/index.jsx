import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './styles/index.css';
import { TrustProvider } from './trust/TrustProvider';

console.log('🚀 Starting React app...');

const root = ReactDOM.createRoot(document.getElementById('root'));

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

// Déterminer le basename selon l'environnement
// En développement (localhost) : pas de basename
// Sur lepictorialist.com : pas de basename (domaine principal)
// Sur Firebase hosting : pas de basename maintenant (app directement en racine)
const isLocalhost = window.location.hostname === 'localhost';
const isMainDomain = window.location.hostname === 'lepictorialist.com';
const isFirebaseHost = window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com');

// Vérifier si on est dans le sous-dossier /social-app/
const isInSocialAppPath = window.location.pathname.startsWith('/social-app');

// Utiliser basename seulement si on est explicitement dans /social-app/
const basename = isInSocialAppPath ? '/social-app' : '';

console.log('🔧 Environment:', import.meta.env.DEV ? 'development' : 'production');
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Pathname:', window.location.pathname);
console.log('🔧 Is localhost:', isLocalhost);
console.log('🔧 Is main domain:', isMainDomain);
console.log('🔧 Is Firebase host:', isFirebaseHost);
console.log('🔧 Is in social-app path:', isInSocialAppPath);
console.log('🔧 Basename:', basename);

try {
  console.log('🎨 Rendering React app...');
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(BrowserRouter, { basename },
        React.createElement(AuthProvider, null,
          React.createElement(TrustProvider, null,
            React.createElement(App)
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
