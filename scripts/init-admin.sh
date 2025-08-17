#!/bin/bash

# Script pour initialiser le premier administrateur
echo "🔧 Initialisation du premier administrateur"
echo "============================================"

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé."
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Demander l'email de l'utilisateur à promouvoir
echo "📧 Entrez l'email de l'utilisateur à promouvoir en tant qu'administrateur:"
read -r USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Email requis. Arrêt du script."
    exit 1
fi

echo "🔍 Recherche de l'utilisateur avec l'email: $USER_EMAIL"

# Créer un script temporaire pour Firebase Functions Shell
cat > temp_admin_script.js << EOF
// Script temporaire pour créer un administrateur
const admin = require('firebase-admin');

// Initialiser Firebase Admin si ce n'est pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function makeUserAdmin() {
  try {
    // Chercher l'utilisateur par email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', '$USER_EMAIL')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé avec cet email.');
      console.log('L\\'utilisateur doit d\\'abord s\\'inscrire sur l\\'application.');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    // Mettre à jour l'utilisateur pour en faire un admin
    await db.collection('users').doc(userId).update({
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Utilisateur promu administrateur avec succès!');
    console.log('🆔 ID utilisateur:', userId);
    console.log('📧 Email:', '$USER_EMAIL');
    console.log('🔗 Accédez à https://vision-picturale-community.web.app/admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

makeUserAdmin().then(() => process.exit(0));
EOF

echo "🚀 Exécution du script d'administration..."

# Exécuter le script avec Node.js
node temp_admin_script.js

# Nettoyer le fichier temporaire
rm temp_admin_script.js

echo "✅ Script terminé."
echo ""
echo "📝 Instructions:"
echo "1. L'utilisateur doit d'abord s'inscrire sur l'application"
echo "2. Une fois connecté, il peut accéder à /admin"
echo "3. Le lien Admin apparaîtra dans la navigation"
