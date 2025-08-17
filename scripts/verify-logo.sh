#!/bin/bash

# Script de vérification du logo social app
echo "🔍 Vérification du logo social app"
echo "=================================="

# Vérifier le fichier source
if [ -f "src/social-app/frontend/assets/logo-a63a4dfb.jpg" ]; then
    echo "✅ Logo source trouvé : src/social-app/frontend/assets/logo-a63a4dfb.jpg"
else
    echo "❌ Logo source manquant : src/social-app/frontend/assets/logo-a63a4dfb.jpg"
fi

# Vérifier le fichier dans dist
if [ -f "dist/social-app/assets/logo-a63a4dfb.jpg" ]; then
    echo "✅ Logo dist trouvé : dist/social-app/assets/logo-a63a4dfb.jpg"
else
    echo "❌ Logo dist manquant : dist/social-app/assets/logo-a63a4dfb.jpg"
    echo "🔧 Copie du logo..."
    mkdir -p dist/social-app/assets/
    cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/social-app/assets/
    echo "✅ Logo copié"
fi

# Vérifier le chemin dans le code
echo "🔍 Vérification du chemin dans TopMenu.jsx..."
if grep -q "/social-app/assets/logo-a63a4dfb.jpg" src/social-app/frontend/components/TopMenu.jsx; then
    echo "✅ Chemin correct dans TopMenu.jsx"
else
    echo "❌ Chemin incorrect dans TopMenu.jsx"
    echo "💡 Le chemin devrait être : /social-app/assets/logo-a63a4dfb.jpg"
fi

echo ""
echo "🎯 URLs à tester :"
echo "📱 Social app : https://vision-picturale-community.web.app/social-app/"
echo "🖼️ Logo direct : https://vision-picturale-community.web.app/social-app/assets/logo-a63a4dfb.jpg"
