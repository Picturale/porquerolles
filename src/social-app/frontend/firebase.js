import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Direct Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBeASZgEZe67kSNMYI1bqmNN0ETrdqjrNA',
  authDomain: 'porquerolles-16e8d.firebaseapp.com',
  projectId: 'porquerolles-16e8d',
  storageBucket: 'porquerolles-16e8d.firebasestorage.app',
  messagingSenderId: '265696641553',
  appId: '1:265696641553:web:2b7d6d25d109f678f3a7b0',
  measurementId: 'G-C5ZTKGG4GV'
};

const isDevEnvironment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

// Add CORS handling for Firebase requests in development mode
if (isDevEnvironment) {
  // Override fetch to add CORS headers for Firestore requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    // Only modify Firebase requests
    if (input && typeof input === 'string' && 
        (input.includes('firestore.googleapis.com') || 
         input.includes('porquerolles-16e8d'))) {
      init = init || {};
      init.credentials = 'include';
      init.mode = 'cors';
      init.headers = {
        ...(init.headers || {}),
        'Access-Control-Allow-Origin': '*',
      };
    }
    return originalFetch(input, init);
  };
  
  // CORS handling enabled for Firebase requests in development mode
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore (supports named database via env; default to (default))
const databaseId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_DATABASE_ID) || undefined;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Cloud Functions
export const functions = getFunctions(app);


// Connect to emulators in development environment
const USE_EMULATORS = isDevEnvironment && (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_USE_EMULATOR === 'true' || import.meta.env.VITE_USE_EMULATOR === '1'))
);

if (USE_EMULATORS) {
  try {
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch (error) {
    console.warn('⚠️ Failed to connect to emulators, using production:', error.message);
  }
}

export default app;
