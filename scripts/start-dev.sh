#!/bin/bash

echo "🚀 Démarrage Rapide - Vision Picturale Community"
echo "================================================"

cd "$(dirname "$0")/.."

echo ""
echo "🔍 Vérification de l'environnement..."

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier la configuration Firebase
if ! firebase projects:list > /dev/null 2>&1; then
    echo "⚠️  Firebase CLI non configuré. Configurez avec:"
    echo "   firebase login"
    echo "   firebase use vision-picturale-community"
fi

echo ""
echo "🎨 Vérification de la charte graphique..."
hardcoded_colors=$(find src/social-app/frontend -name "*.css" -exec grep -v ":root" {} \; | grep -c "#[0-9a-fA-F]\{3,6\}" 2>/dev/null || echo "0")

if [ "$hardcoded_colors" -eq 0 ]; then
    echo "✅ Charte graphique cohérente"
else
    echo "⚠️  $hardcoded_colors couleurs hardcodées (probablement dans :root - normal)"
fi

echo ""
echo "🖥️ Démarrage du serveur de développement..."
echo "📱 L'application sera disponible sur: http://localhost:3001"
echo ""
echo "💡 Commandes utiles pendant le développement:"
echo "   Ctrl+C                          # Arrêter le serveur"
echo "   ./scripts/quick-design-check.sh # Vérifier CSS"
echo "   ./scripts/test-complete.sh      # Tests complets"
echo "   npm run build:social           # Build de production"
echo ""
echo "🎯 Démarrage en cours..."

# Démarrer l'application
npm run dev:social
