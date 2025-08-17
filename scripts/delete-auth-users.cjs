const admin = require('firebase-admin');

// Initialize Firebase Admin using Application Default Credentials
admin.initializeApp({
  projectId: 'vision-picturale-community'
});

const auth = admin.auth();

async function deleteAllUsers() {
  try {
    console.log('🔍 Récupération des utilisateurs...');
    
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`📋 Trouvé ${users.length} utilisateurs`);
    
    if (users.length === 0) {
      console.log('✅ Aucun utilisateur à supprimer');
      process.exit(0);
    }
    
    const uids = users.map(user => user.uid);
    
    console.log('🗑️  Suppression en cours...');
    const deleteResult = await auth.deleteUsers(uids);
    
    console.log(`✅ ${deleteResult.successCount} utilisateurs supprimés avec succès`);
    
    if (deleteResult.failureCount > 0) {
      console.log(`❌ ${deleteResult.failureCount} échecs:`);
      deleteResult.errors.forEach(error => {
        console.log(`   - ${error.uid}: ${error.error.message}`);
      });
    }
    
    console.log('🎉 Suppression terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deleteAllUsers();
