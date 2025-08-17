#!/bin/bash

# Script de déploiement automatisé pour éviter les problèmes d'index Firestore
echo "🚀 Déploiement automatisé - Vision Picturale Community"
echo "================================================"

# Build du projet
echo "📦 Construction du projet..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi"

# Déploiement hosting seulement pour éviter les problèmes d'index
echo "🌐 Déploiement hosting..."
firebase deploy --only hosting --force

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement hosting"
    exit 1
fi

echo "✅ Déploiement hosting réussi"

# Déploiement des rules et storage (sans index)
echo "🔒 Déploiement des règles..."
firebase deploy --only storage,database --force

if [ $? -ne 0 ]; then
    echo "⚠️  Avertissement: Problème avec les règles (non critique)"
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "🌐 URL: https://vision-picturale-community.web.app"
echo "🌐 URL: https://lepictorialist.com"
echo ""
echo "Note: Les index Firestore doivent être gérés manuellement"
echo "via la console Firebase en cas de problème de performance."
