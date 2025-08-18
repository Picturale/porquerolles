#!/usr/bin/env node

/**
 * Script pour bootstraper l'utilisateur admin@test.com
 * Usage: node scripts/bootstrap-admin.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../config/service-account-key.json');

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://vision-picturale-community-default-rtdb.europe-west1.firebasedatabase.app'
  });
} catch (error) {
  console.log('Firebase Admin déjà initialisé ou erreur:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();

async function bootstrapAdmin() {
  try {
    console.log('🔍 Recherche de l\'utilisateur admin@test.com...');
    
    // Chercher l'utilisateur par email
    let user;
    try {
      user = await auth.getUserByEmail('admin@test.com');
      console.log('✅ Utilisateur trouvé:', user.uid);
    } catch (error) {
      console.log('❌ Utilisateur non trouvé, création...');
      user = await auth.createUser({
        email: 'admin@test.com',
        password: 'test123456',
        displayName: 'Admin Test',
        emailVerified: true
      });
      console.log('✅ Utilisateur créé:', user.uid);
    }

    // Vérifier les custom claims actuels
    const userRecord = await auth.getUser(user.uid);
    const currentClaims = userRecord.customClaims || {};
    console.log('📋 Custom claims actuels:', currentClaims);

    // Définir les rôles admin
    const newClaims = {
      ...currentClaims,
      roles: {
        admin: true,
        owner: true
      }
    };

    await auth.setCustomUserClaims(user.uid, newClaims);
    console.log('✅ Custom claims mis à jour:', newClaims);

    // Mettre à jour le document Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      username: 'admin',
      displayName: 'Admin Test',
  isAdmin: true,
      profilePicture: '',
      bio: 'Administrateur système',
      location: '',
      website: '',
      followers: [],
      following: [],
      createdAt: new Date(),
      isOnboardingComplete: true,
      roles: {
        admin: true,
        owner: true
      }
    };

    await db.collection('users').doc(user.uid).set(userDoc, { merge: true });
    console.log('✅ Document Firestore mis à jour');

    console.log('🎉 Bootstrap admin terminé avec succès!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Mot de passe: test123456');
    
  } catch (error) {
    console.error('❌ Erreur lors du bootstrap admin:', error);
  }
}

// Exécuter le script
if (require.main === module) {
  bootstrapAdmin().then(() => {
    console.log('Script terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { bootstrapAdmin };
