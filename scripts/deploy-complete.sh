#!/bin/bash

# Script de déploiement complet pour la social app et la core app
echo "🚀 Déploiement complet des applications sur Firebase"

# Configuration
PROJECT_ROOT=$(pwd)
SOCIAL_APP_DIR="$PROJECT_ROOT/src/social-app/frontend"
CORE_APP_DIR="$PROJECT_ROOT/src/core-app"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé. Installez-le avec:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Vérifier la connexion Firebase
echo "🔍 Vérification de la connexion Firebase..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Erreur de connexion Firebase. Connectez-vous avec:"
    echo "firebase login"
    exit 1
fi

# Vérifier le projet Firebase actuel
CURRENT_PROJECT=$(firebase use --print)
if [ -z "$CURRENT_PROJECT" ]; then
    echo "❌ Aucun projet Firebase sélectionné. Sélectionnez un projet avec:"
    echo "firebase use <project-id>"
    exit 1
fi

echo "✅ Projet Firebase actuel: $CURRENT_PROJECT"

# Étape 1: Build de la Social App
echo "🏗️ Construction de la Social App..."
cd "$SOCIAL_APP_DIR"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build de la social app
echo "🔨 Build de la Social App..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build de la Social App"
    exit 1
fi
echo "✅ Build de la Social App terminé"

# Étape 2: Préparation de la Core App
echo "🏗️ Préparation de la Core App..."
cd "$CORE_APP_DIR"

# Vérifier que index.html existe
if [ ! -f "index.html" ]; then
    echo "❌ index.html manquant dans la Core App"
    exit 1
fi

echo "✅ Core App prête"

# Étape 3: Déploiement sur Firebase
echo "🚀 Déploiement sur Firebase..."
cd "$PROJECT_ROOT"

# Déploiement des règles Firestore et Storage
echo "📝 Déploiement des règles Firestore et Storage..."
firebase deploy --only firestore:rules,storage:rules
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement des règles"
    exit 1
fi

# Déploiement des applications
echo "📱 Déploiement des applications..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement des applications"
    exit 1
fi

echo "✅ Déploiement terminé avec succès!"

# Affichage des URLs
echo ""
echo "🌐 URLs des applications déployées:"
echo "Social App: https://$CURRENT_PROJECT.web.app"
echo "Core App: https://$CURRENT_PROJECT.web.app/core-app"
echo ""
echo "🎉 Déploiement terminé!"
