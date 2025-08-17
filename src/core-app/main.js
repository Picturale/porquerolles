// main.js pour core-app
// Fichier principal pour l'application de calibration d'impression

console.log('Core-app main.js chargé');

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé, initialisation core-app...');
  
  // Ici on peut ajouter la logique d'initialisation
  // Pour l'instant, on garde juste un placeholder
  if (window.initializeCoreApp) {
    window.initializeCoreApp();
  }
});

// Export pour compatibilité module
export default {
  name: 'core-app',
  initialized: true
};
