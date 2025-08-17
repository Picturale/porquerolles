#!/bin/bash

echo "🧹 NETTOYAGE COMPLET - CORRECTION CHARTJS"
echo "========================================="

cd "/Users/admin/Pictures/dev/applstore project generation full"

echo ""
echo "1️⃣  NETTOYAGE CACHE iOS:"
echo "   🗑️  Suppression des derived data Xcode..."

# Nettoyer les derived data Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
rm -rf ios/App/App/public/

echo "   ✅ Cache iOS supprimé"

echo ""
echo "2️⃣  REBUILD COMPLET:"
echo "   🔨 Rebuild depuis zéro..."

# Rebuild complet
rm -rf dist/
npm run build

echo ""
echo "3️⃣  MISE À JOUR STRUCTURE ALTERNATIVE:"

# Recréer la structure alternative avec la version corrigée
rm -rf alternative-structure/calibrateur/app
rm -rf alternative-structure/communaute/app
rm -rf alternative-structure/assets

cp -r dist/src/core-app alternative-structure/calibrateur/app
cp -r dist/src/social-app alternative-structure/communaute/app
cp -r dist/assets alternative-structure/

echo "   ✅ Structure alternative mise à jour"

echo ""
echo "4️⃣  SYNCHRONISATION FORCÉE iOS:"

npx cap sync ios

echo ""
echo "5️⃣  REDÉMARRAGE XCODE RECOMMANDÉ:"
echo "   ⚠️  Fermez complètement Xcode"
echo "   ▶️  Relancez Xcode"
echo "   🧹 Product > Clean Build Folder"
echo "   🔨 Build et lancez l'app"

echo ""
echo "6️⃣  VÉRIFICATION DE LA CORRECTION:"
echo ""
echo "   Dans le Calibrateur, vérifiez:"
echo "   • Pas d'erreur '_lastUpdate' dans la console"
echo "   • Fonctionnalité de drag opérationnelle"
echo "   • Interface fluide et responsive"

echo ""
echo "✅ NETTOYAGE COMPLET TERMINÉ !"
echo ""
echo "💡 Si l'erreur persiste encore:"
echo "   1. Redémarrez le simulateur iOS"
echo "   2. Vérifiez dans Safari > Develop > Simulator"
echo "   3. Clear cache de l'app dans le simulateur"
echo ""

# Ouvrir Xcode
echo "🚀 Ouverture de Xcode..."
npx cap open ios &

echo ""
echo "⏳ Actions suivantes recommandées:"
echo "   1. Clean Build Folder dans Xcode"
echo "   2. Build et lancez sur simulateur"
echo "   3. Testez la navigation vers Calibrateur"
echo "   4. Vérifiez l'absence d'erreurs ChartJS"
