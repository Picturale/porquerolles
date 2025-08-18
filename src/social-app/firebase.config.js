/**
 * Firebase Configuration for Vision Picturale Social App
 * 
 * This configuration will:
 * 1. Try to load configuration from environment variables
 * 2. Fall back to default values if environment variables are not available
 * 3. Support automatic detection of emulator environment
 * 
 * You can set up your Firebase project in two ways:
 * 1. Create a .env file with your Firebase configuration
 * 2. Use the Firebase quick setup script: ./scripts/firebase-quick-setup.sh
 * 
 * You can find your Firebase configuration values in the Firebase console:
 * https://console.firebase.google.com/project/_/settings/general/
 */

// Firebase configuration with actual values
const prodConfig = {
  apiKey: 'AIzaSyBeASZgEZe67kSNMYI1bqmNN0ETrdqjrNA',
  authDomain: 'porquerolles-16e8d.firebaseapp.com',
  databaseURL: 'https://porquerolles-16e8d-default-rtdb.firebaseio.com',
  projectId: 'porquerolles-16e8d',
  storageBucket: 'porquerolles-16e8d.appspot.com',
  messagingSenderId: '265696641553'
};

// Emulator configuration for local development
const emulatorConfig = {
  ...prodConfig,
  // These will be used when running Firebase emulators locally
  emulator: {
    authUrl: 'http://localhost:9099',
    firestoreUrl: 'http://localhost:8080',
    functionsUrl: 'http://localhost:5001',
    storageUrl: 'http://localhost:9199'
  }
};

// Determine if we're running in development mode
const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';

// Pour l'instant, utilisons la production même en développement
// car les émulateurs ne sont pas configurés
const USE_EMULATORS = false; // Changez à true quand les émulateurs sont prêts

// Export the appropriate configuration
export const firebaseConfig = (isDev && USE_EMULATORS) ? emulatorConfig : prodConfig;

// Export development status for debugging
export const isDevEnvironment = isDev;
