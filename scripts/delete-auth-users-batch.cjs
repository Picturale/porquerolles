#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');

// Configuration Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'vision-picturale-community'
  });
}

async function deleteAllUsers() {
  try {
    console.log('🔥 Démarrage de la suppression des utilisateurs Firebase Auth...');
    
    let deleted = 0;
    let pageToken;
    
    do {
      try {
        // Lister les utilisateurs par batch
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);
        
        if (listUsersResult.users.length === 0) {
          console.log('✅ Aucun utilisateur trouvé');
          break;
        }
        
        console.log(`📋 Traitement de ${listUsersResult.users.length} utilisateurs...`);
        
        // Extraire les UIDs
        const uids = listUsersResult.users.map(user => user.uid);
        
        // Supprimer par batch de 1000 maximum
        const deleteResult = await admin.auth().deleteUsers(uids);
        
        deleted += deleteResult.successCount;
        
        console.log(`✅ Supprimé: ${deleteResult.successCount} utilisateurs`);
        
        if (deleteResult.failureCount > 0) {
          console.log(`❌ Échecs: ${deleteResult.failureCount} utilisateurs`);
          deleteResult.errors.forEach(error => {
            console.log(`  - UID ${error.index}: ${error.error.message}`);
          });
        }
        
        pageToken = listUsersResult.pageToken;
      } catch (error) {
        console.error('❌ Erreur lors de la suppression batch:', error);
        break;
      }
    } while (pageToken);
    
    console.log(`🎉 Suppression terminée. Total supprimé: ${deleted} utilisateurs`);
    
    // Vérification finale
    const finalCheck = await admin.auth().listUsers(1);
    console.log(`📊 Utilisateurs restants: ${finalCheck.users.length}`);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter la suppression
deleteAllUsers()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script échoué:', error);
    process.exit(1);
  });
