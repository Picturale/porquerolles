#!/bin/bash

# Vérification du statut des index Firestore
echo "🔍 Vérification du statut des index Firestore..."

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé. Installation..."
    npm install -g firebase-tools
fi

# Se connecter au projet Firebase (si pas déjà connecté)
echo "📱 Connexion au projet Firebase..."

# Lister les index Firestore
echo "📊 Statut des index Firestore:"
firebase firestore:indexes --project=vision-picturale-community

echo ""
echo "📝 Légende des statuts:"
echo "  - READY: Index prêt à l'utilisation"
echo "  - BUILDING: Index en cours de construction"
echo "  - ERROR: Erreur dans la construction de l'index"
echo ""
echo "⏱️  Les index peuvent prendre plusieurs minutes à être construits."
echo "🔄 Les erreurs 'failed-precondition' disparaîtront une fois les index prêts."
