#!/bin/bash

echo "🔥 Suppression en masse des utilisateurs Firebase..."

# Créer un script JavaScript temporaire pour supprimer tous les utilisateurs
cat > delete_users_temp.js << 'EOF'
const admin = require('firebase-admin');

// Initialiser Firebase Admin avec les credentials du projet
admin.initializeApp({
  projectId: 'vision-picturale-community'
});

async function deleteAllUsers() {
  try {
    let totalDeleted = 0;
    let nextPageToken;

    do {
      // Lister les utilisateurs par batch de 1000
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      if (listUsersResult.users.length === 0) {
        console.log('✅ Aucun utilisateur trouvé');
        break;
      }
      
      console.log(`📋 Traitement de ${listUsersResult.users.length} utilisateurs...`);
      
      // Extraire les UIDs
      const uids = listUsersResult.users.map(user => user.uid);
      
      try {
        // Supprimer par batch
        const deleteResult = await admin.auth().deleteUsers(uids);
        totalDeleted += deleteResult.successCount;
        
        console.log(`✅ Supprimé: ${deleteResult.successCount} utilisateurs`);
        
        if (deleteResult.failureCount > 0) {
          console.log(`❌ Échecs: ${deleteResult.failureCount} utilisateurs`);
        }
        
      } catch (batchError) {
        console.log('❌ Erreur batch, tentative suppression individuelle...');
        
        // Si le batch échoue, supprimer un par un
        for (const uid of uids) {
          try {
            await admin.auth().deleteUser(uid);
            totalDeleted++;
            console.log(`✅ Supprimé individuellement: ${uid}`);
          } catch (individualError) {
            console.log(`❌ Échec individuel: ${uid}`);
          }
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`🎉 Total supprimé: ${totalDeleted} utilisateurs`);
    
    // Vérification finale
    const finalCheck = await admin.auth().listUsers(1);
    console.log(`📊 Utilisateurs restants: ${finalCheck.users.length}`);
    
    if (finalCheck.users.length === 0) {
      console.log('✅ SUCCÈS: Tous les utilisateurs ont été supprimés!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

deleteAllUsers();
EOF

# Exécuter le script de suppression
GOOGLE_APPLICATION_CREDENTIALS="" node delete_users_temp.js

# Nettoyer les fichiers temporaires
rm -f delete_users_temp.js temp_users.json user_uids.txt

echo "🧹 Nettoyage terminé"
