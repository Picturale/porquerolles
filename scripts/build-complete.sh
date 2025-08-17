#!/bin/bash

# Script de build complet simple
echo "🚀 Build complet simple"
echo "======================"

# Set working directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf dist/

# Création structure
echo "📁 Création structure..."
mkdir -p dist/social-app

# Copie landing page
echo "📄 Copie landing page..."
cp src/index.html dist/index.html

# Copie core app
echo "⚙️ Copie core app..."
cp -r src/core-app dist/

# Copie assets
echo "🖼️ Copie assets..."
cp -r src/assets dist/
cp src/social-app/frontend/assets/logo2.png dist/assets/
cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/assets/

# Build social app
echo "🏗️ Build social app..."
cd src/social-app/frontend
npm run build

# Copie social app
echo "📱 Copie social app..."
cd "$PROJECT_ROOT"
cp -r src/social-app/frontend/dist/* dist/social-app/
# Copie du logo spécifiquement
cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/social-app/assets/

# Correction chemins social app
echo "🔧 Correction chemins..."
if [ -f "dist/social-app/index.html" ]; then
    sed -i '' 's|="/assets/|="/social-app/assets/|g' dist/social-app/index.html
    sed -i '' 's|href="/assets/|href="/social-app/assets/|g' dist/social-app/index.html
fi

echo "✅ Build terminé!"
echo "📂 Dossier dist/ prêt pour déploiement"
echo "🔗 Test: firebase serve"
echo "🚀 Déploiement: firebase deploy --only hosting"
