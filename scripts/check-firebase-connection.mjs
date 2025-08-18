import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, getDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBeASZgEZe67kSNMYI1bqmNN0ETrdqjrNA',
  authDomain: 'porquerolles-16e8d.firebaseapp.com',
  projectId: 'porquerolles-16e8d',
  storageBucket: 'porquerolles-16e8d.appspot.com',
  messagingSenderId: '265696641553'
};

async function main() {
  console.log('🔌 Checking Firestore connectivity to project: porquerolles-16e8d');
  const app = initializeApp(firebaseConfig);
  const databaseId = process.env.FIREBASE_DATABASE_ID;
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  console.log('📦 Using database ID:', databaseId || '(default)');

  const payload = {
    createdAt: serverTimestamp(),
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOSTNAME || 'local',
    check: 'connectivity_test'
  };

  const ref = await addDoc(collection(db, 'connectivity_tests'), payload);
  console.log('✅ Wrote test doc with ID:', ref.id);

  const snap = await getDoc(doc(db, 'connectivity_tests', ref.id));
  console.log('🔎 Read back doc exists:', snap.exists());
}

main().catch((err) => {
  console.error('❌ Firebase connectivity check failed:', err);
  process.exit(1);
});


