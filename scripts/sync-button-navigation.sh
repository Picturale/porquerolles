#!/bin/bash

# Script pour appliquer la nouvelle approche de navigation avec boutons au fichier source

SOURCE_FILE="./src/index.html"
IOS_FILE="./ios/App/App/public/index.html"

echo "🔄 Mise à jour du fichier source avec la navigation par boutons"
echo "============================================================"

if [ ! -f "$IOS_FILE" ]; then
    echo "❌ ERREUR: Fichier iOS non trouvé"
    exit 1
fi

# Copier la version iOS vers le fichier source
cp "$IOS_FILE" "$SOURCE_FILE"

echo "✅ Fichier source mis à jour avec la navigation optimisée pour iOS"
echo "📄 $SOURCE_FILE maintenant synchronisé avec $IOS_FILE"

# Rebuild le projet pour appliquer les changements
echo ""
echo "🔨 Reconstruction du projet..."
npm run build

echo ""
echo "🚀 TERMINÉ"
echo "La navigation par boutons est maintenant appliquée partout"
echo "Testez avec: npm run build-ios"
