#!/usr/bin/env node

/**
 * Script pour supprimer tous les utilisateurs Firebase Auth et Firestore
 * Usage: node scripts/delete-all-users.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // You'll need to add your service account key or use application default credentials
  admin.initializeApp({
    projectId: 'vision-picturale-community'
  });
}

const auth = admin.auth();
const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteAllUsers() {
  console.log('🔥 SUPPRESSION DE TOUS LES UTILISATEURS FIREBASE');
  console.log('⚠️  Cette action est IRREVERSIBLE !');
  console.log('');

  const answer = await new Promise((resolve) => {
    rl.question('Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs ? (tapez "OUI" pour confirmer): ', resolve);
  });

  if (answer !== 'OUI') {
    console.log('❌ Opération annulée');
    rl.close();
    return;
  }

  try {
    console.log('📊 Récupération de la liste des utilisateurs...');
    
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`📋 Trouvé ${users.length} utilisateurs à supprimer`);

    if (users.length === 0) {
      console.log('✅ Aucun utilisateur à supprimer');
      rl.close();
      return;
    }

    // Delete users from Firebase Auth
    console.log('🗑️  Suppression des utilisateurs de Firebase Auth...');
    const uids = users.map(user => user.uid);
    
    // Delete in batches of 1000 (Firebase limit)
    const batchSize = 1000;
    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = uids.slice(i, i + batchSize);
      const deleteResult = await auth.deleteUsers(batch);
      
      console.log(`✅ Supprimé ${deleteResult.successCount} utilisateurs de Auth`);
      if (deleteResult.failureCount > 0) {
        console.log(`❌ Échec pour ${deleteResult.failureCount} utilisateurs`);
        deleteResult.errors.forEach(error => {
          console.log(`   - ${error.uid}: ${error.error.message}`);
        });
      }
    }

    // Delete user documents from Firestore
    console.log('🗑️  Suppression des documents utilisateurs de Firestore...');
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();
    
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Supprimé ${deletePromises.length} documents utilisateurs de Firestore`);

    // Optional: Delete posts from users
    console.log('🗑️  Suppression des posts des utilisateurs...');
    const postsCollection = db.collection('posts');
    const postsSnapshot = await postsCollection.get();
    
    const deletePostsPromises = [];
    postsSnapshot.forEach(doc => {
      deletePostsPromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePostsPromises);
    console.log(`✅ Supprimé ${deletePostsPromises.length} posts`);

    console.log('');
    console.log('🎉 SUPPRESSION TERMINÉE AVEC SUCCÈS !');
    console.log('📊 Résumé:');
    console.log(`   - ${users.length} utilisateurs supprimés de Auth`);
    console.log(`   - ${deletePromises.length} documents utilisateurs supprimés de Firestore`);
    console.log(`   - ${deletePostsPromises.length} posts supprimés`);
    console.log('');
    console.log('✨ Vous pouvez maintenant repartir à zéro !');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    rl.close();
  }
}

// Execute the script
deleteAllUsers();
