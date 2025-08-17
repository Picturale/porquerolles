#!/bin/bash
# 🧹 SCRIPT DE NETTOYAGE - FICHIERS INDEX
# Supprime les fichiers alternatifs pour éviter la confusion

echo "🧹 NETTOYAGE DES FICHIERS INDEX"
echo "=============================="
echo "📅 $(date)"
echo ""

echo "🔍 Étape 1: Analyse des fichiers index..."
if [ -f "src/index.html" ]; then
    echo "   ✅ src/index.html (ACTIF) - Présent"
else
    echo "   ❌ src/index.html (ACTIF) - MANQUANT!"
    exit 1
fi

if [ -f "src/index-capacitor.html" ]; then
    echo "   📝 src/index-capacitor.html (ALTERNATIF) - Présent"
    ALTERNATIVE_EXISTS=true
else
    echo "   ℹ️  src/index-capacitor.html (ALTERNATIF) - Absent"
    ALTERNATIVE_EXISTS=false
fi

echo ""
echo "🎯 Étape 2: Validation du fichier actif..."

# Vérifier que le fichier actif est bien synchronisé
if [ -f "ios/App/App/public/index.html" ]; then
    echo "   ✅ Fichier iOS synchronisé"
    
    # Comparer les fichiers
    if cmp -s "src/index.html" "ios/App/App/public/index.html"; then
        echo "   ✅ Source et iOS identiques"
    else
        echo "   ⚠️  Source et iOS différents - Synchronisation recommandée"
    fi
else
    echo "   ⚠️  Fichier iOS absent - Synchronisation requise"
fi

echo ""
if [ "$ALTERNATIVE_EXISTS" = true ]; then
    echo "🗑️  Étape 3: Suppression du fichier alternatif..."
    echo "   📝 Sauvegarde: src/index-capacitor.html → backup/"
    
    # Créer le dossier backup s'il n'existe pas
    mkdir -p backup/
    
    # Sauvegarder le fichier alternatif
    cp "src/index-capacitor.html" "backup/index-capacitor-$(date +%Y%m%d-%H%M%S).html"
    
    # Supprimer le fichier alternatif
    rm "src/index-capacitor.html"
    
    echo "   ✅ Fichier alternatif supprimé (sauvegardé)"
else
    echo "🎯 Étape 3: Pas de fichier alternatif à supprimer"
fi

echo ""
echo "📋 Étape 4: Résumé final..."
echo "   📂 Fichier actif: src/index.html"
echo "   🎯 Configuration: Zoom autorisé (5x max)"
echo "   ✅ Structure simplifiée"

echo ""
echo "🚀 Étape 5: Synchronisation recommandée..."
echo "   npx cap sync ios"

echo ""
echo "✅ NETTOYAGE TERMINÉ!"
echo "==================="
echo "📝 Un seul fichier index.html dans src/"
echo "🎯 Plus de confusion possible"
echo "✅ Structure claire et maintenable"
