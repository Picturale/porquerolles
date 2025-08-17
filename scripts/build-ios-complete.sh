#!/bin/bash

# Script pour build iOS complet
echo "📱 Build iOS complet - Vision Picturale"
echo "======================================"

# Set working directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Fonction pour afficher les erreurs
error_exit() {
    echo "❌ Erreur: $1" >&2
    exit 1
}

# Fonction pour afficher les succès
success_msg() {
    echo "✅ $1"
}

# Étape 1: Build web complet
echo "🌐 Build web complet..."
./scripts/build-complete.sh || error_exit "Erreur build web"
# S'assurer que le logo est bien copié
cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/social-app/assets/
success_msg "Build web terminé"

# Étape 2: Copy vers iOS
echo "📱 Copie vers iOS..."
npx cap copy ios || error_exit "Erreur copie iOS"
success_msg "Copie iOS terminée"

# Étape 3: Sync iOS
echo "🔄 Synchronisation iOS..."
npx cap sync ios || error_exit "Erreur sync iOS"
success_msg "Synchronisation iOS terminée"

# Étape 4: Ouvrir Xcode (optionnel)
echo "🔧 Ouvrir Xcode..."
npx cap open ios || error_exit "Erreur ouverture Xcode"
success_msg "Xcode ouvert"

echo ""
echo "🎉 Build iOS terminé avec succès!"
echo "📱 Le projet est prêt dans Xcode"
echo "🔗 Guide: iOS-BUILD-GUIDE.md"
