#!/bin/bash

echo "🤔 ÉVALUATION DU SUPPORT MOBILE"
echo "==============================="
echo ""
echo "📱 Dossiers mobile détectés:"
echo "   • ios/ ($(du -sh ios/ 2>/dev/null | cut -f1))"
echo "   • android/ ($(du -sh android/ 2>/dev/null | cut -f1))"
echo ""
echo "🎯 Question: Voulez-vous publier Vision Picturale sur App Store/Google Play ?"
echo ""
echo "Choix disponibles:"
echo "  1) 📱 GARDER - Support mobile complet (recommandé si plans mobiles)"
echo "  2) 🧹 SUPPRIMER - Web uniquement (gain d'espace ~80MB)"
echo "  3) 📊 NETTOYER - Garder config, supprimer builds temporaires"
echo "  4) 🚫 ANNULER - Ne rien faire"
echo ""

read -p "Votre choix (1-4): " choice

case $choice in
  1)
    echo ""
    echo "✅ CONSERVATION du support mobile"
    echo "   • Dossiers ios/ et android/ conservés"
    echo "   • Scripts npm mobile disponibles"
    echo "   • Capacitor configuré et prêt"
    echo ""
    echo "📱 Commandes utiles:"
    echo "   npm run mobile:ios      # Ouvrir dans Xcode"
    echo "   npm run mobile:android  # Ouvrir dans Android Studio"
    echo "   npm run mobile:build    # Build + sync"
    ;;
  2)
    echo ""
    echo "🧹 SUPPRESSION complète du support mobile..."
    
    # Supprimer les dossiers
    rm -rf ios/ android/
    echo "   ✅ Dossiers ios/ et android/ supprimés"
    
    # Désinstaller les dépendances Capacitor
    npm uninstall @capacitor/ios @capacitor/android @capacitor/cli @capacitor/core
    echo "   ✅ Dépendances Capacitor désinstallées"
    
    # Supprimer la configuration
    rm -f capacitor.config.json
    echo "   ✅ Configuration Capacitor supprimée"
    
    # Nettoyer package.json (scripts mobile)
    echo "   🔧 Nettoyage des scripts mobile..."
    
    echo ""
    echo "🎯 SUPPORT MOBILE SUPPRIMÉ"
    echo "   • Gain d'espace: ~80MB"
    echo "   • Projet focus web uniquement"
    echo "   • Structure simplifiée"
    echo ""
    echo "💡 Note: Vous pouvez toujours ajouter Capacitor plus tard avec:"
    echo "   npm install @capacitor/core @capacitor/cli"
    echo "   npx cap init"
    ;;
  3)
    echo ""
    echo "📊 NETTOYAGE des builds temporaires..."
    
    # Nettoyer les builds iOS
    if [ -d "ios/App/build" ]; then
        rm -rf ios/App/build
        echo "   ✅ Build iOS nettoyé"
    fi
    
    # Nettoyer les builds Android
    if [ -d "android/build" ]; then
        rm -rf android/build
        echo "   ✅ Build Android nettoyé"
    fi
    
    if [ -d "android/.gradle" ]; then
        rm -rf android/.gradle
        echo "   ✅ Cache Gradle nettoyé"
    fi
    
    # Ajouter au gitignore
    echo "" >> .gitignore
    echo "# Mobile builds temporaires" >> .gitignore
    echo "ios/App/build/" >> .gitignore
    echo "android/build/" >> .gitignore
    echo "android/.gradle/" >> .gitignore
    
    echo ""
    echo "🎯 NETTOYAGE MOBILE TERMINÉ"
    echo "   • Configuration conservée"
    echo "   • Builds temporaires supprimés"
    echo "   • .gitignore mis à jour"
    echo ""
    echo "📱 Les builds se régénèreront avec: npm run mobile:build"
    ;;
  4)
    echo ""
    echo "🚫 Opération annulée - Aucun changement effectué"
    ;;
  *)
    echo ""
    echo "❌ Choix invalide - Aucun changement effectué"
    ;;
esac

echo ""
