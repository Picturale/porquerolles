#!/bin/bash

# Script pour ajouter un utilisateur en tant qu'administrateur
echo "🔐 Ajout d'un utilisateur en tant qu'administrateur"
echo "====================================================="

# Vérifier les arguments
if [ -z "$1" ]; then
  echo "❌ Erreur: ID utilisateur manquant."
  echo "Usage: ./make-admin.sh <user-id>"
  echo "Exemple: ./make-admin.sh n8LrZ5zGRzcEXbI4pBx0Pn4QDnF3"
  exit 1
fi

USER_ID="$1"

# Exécuter la commande Firebase pour mettre à jour l'utilisateur
echo "🔄 Mise à jour de l'utilisateur $USER_ID en tant qu'administrateur..."

# Vérifier si nous sommes en environnement de développement ou production
if [[ "$2" == "--local" ]]; then
  echo "🧪 Utilisation de l'émulateur Firebase local"
  # Commande pour l'émulateur local
  npx firebase-tools --project demo-project functions:shell << EOF
    db.collection('users').doc('${USER_ID}').update({ isAdmin: true });
EOF
else
  echo "🔥 Utilisation de Firebase production"
  # Commande pour Firebase production
  firebase functions:call makeUserAdmin --data "{\"uid\":\"${USER_ID}\"}"
fi

# Vérifier le résultat
if [ $? -eq 0 ]; then
  echo "✅ L'utilisateur $USER_ID est maintenant administrateur."
  echo "📝 Accédez à /admin pour utiliser le tableau de bord d'administration."
else
  echo "❌ Erreur lors de la mise à jour de l'utilisateur."
  echo "Vérifiez que l'ID utilisateur est correct et que vous êtes bien connecté à Firebase."
fi
