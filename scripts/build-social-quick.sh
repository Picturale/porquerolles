#!/bin/bash

# Script de build rapide pour la social app
echo "🚀 Build rapide social app"
echo "=========================="

# Set working directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Build de la social app frontend
echo "🏗️ Build frontend..."
cd src/social-app/frontend
npm run build

# Build avec Vite
echo "🏗️ Build avec Vite..."
cd "$PROJECT_ROOT"
npm run build:social

# Correction des chemins
echo "🔧 Correction des chemins..."
# Copie du logo spécifiquement
cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/social-app/assets/
if [ -f "dist/social-app/index.html" ]; then
    sed -i '' 's|="/assets/|="/social-app/assets/|g' dist/social-app/index.html
    sed -i '' 's|href="/assets/|href="/social-app/assets/|g' dist/social-app/index.html
fi

echo "✅ Build terminé!"
echo "📁 Dossier: dist/social-app/"
echo "🔗 Test local: firebase serve"
echo "🚀 Déploiement: firebase deploy --only hosting"
