import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
// For production, these credentials should be stored securely
// and loaded from environment variables
const serviceAccount = {
  // Your service account details will go here
  // Use environment variables or secure storage in production
  projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
};

// Initialize the Firebase app
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${serviceAccount.projectId}.appspot.com`,
});

// Initialize Firestore
export const db = getFirestore();

// Initialize Firebase Auth
export const auth = getAuth();

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;
