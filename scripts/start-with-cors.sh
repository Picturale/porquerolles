#!/bin/bash

# Create proxy configuration for Firebase
cat > ./src/social-app/firebase-proxy.js << EOL
// firebase-proxy.js - Setup CORS proxy for Firebase API calls

import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "vision-picturale-community.firebaseapp.com",
  projectId: "vision-picturale-community",
  storageBucket: "vision-picturale-community.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const initializeFirebase = () => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);
  const functions = getFunctions(app);

  // Check if running in development mode
  if (import.meta.env.DEV) {
    // Add CORS headers to Firestore requests
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      if (input && typeof input === 'string' && input.includes('firestore.googleapis.com')) {
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

    // Uncomment to use emulators if needed
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFunctionsEmulator(functions, 'localhost', 5001);
  }

  return { app, db, storage, auth, functions };
};
EOL

# Start the development server
echo "Starting development server with CORS handling..."
npm run dev
