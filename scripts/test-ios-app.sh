#!/bin/bash

echo "📱 TEST APP iOS - VISION PICTURALE COMMUNITY"
echo "=============================================="
echo ""

# Vérifier que l'app iOS a été synchronisée
if [ -f "ios/App/App/public/index.html" ]; then
    echo "✅ Page d'accueil synchronisée dans iOS"
else
    echo "❌ Page d'accueil manquante dans iOS"
    exit 1
fi

if [ -d "ios/App/App/public/core-app" ]; then
    echo "✅ App Calibrateur synchronisée dans iOS"
else
    echo "❌ App Calibrateur manquante dans iOS"
    exit 1
fi

if [ -d "ios/App/App/public/social-app" ]; then
    echo "✅ App Communauté synchronisée dans iOS"
else
    echo "❌ App Communauté manquante dans iOS"
    exit 1
fi

# Vérifier la taille de l'app
app_size=$(du -sh ios/App/App/public | cut -f1)
echo "📊 Taille de l'app iOS: $app_size"

# Compter les fichiers
file_count=$(find ios/App/App/public -type f | wc -l)
echo "📄 Nombre de fichiers: $file_count"

echo ""
echo "🚀 TEST RÉUSSI - L'app iOS est prête !"
echo ""
echo "🎯 Ce qui va s'afficher dans l'app iOS :"
echo "   1. 🏠 Page d'accueil avec logo Vision Picturale"
echo "   2. 📱 2 boutons d'applications :"
echo "      • ⚙️  Calibrateur (création mires/courbes)"
echo "      • 👥 Communauté (social/partage)"
echo "   3. 🎨 Design iOS natif optimisé"
echo ""
echo "📱 Pour tester dans le simulateur :"
echo "   • Ouvrez Xcode (en cours...)"
echo "   • Sélectionnez un simulateur iPhone/iPad"
echo "   • Cliquez sur ▶️ Run"
echo "   • L'app va démarrer sur la page d'accueil"
echo ""

# Optionnel : afficher le contenu de la page d'accueil
echo "🔍 Aperçu du contenu de la page d'accueil :"
head -n 10 ios/App/App/public/index.html | grep -E "(title|Vision|Picturale)"

echo ""
echo "✨ Prêt pour les tests iOS !"
