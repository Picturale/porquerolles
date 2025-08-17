#!/bin/bash

# Script pour nettoyer Firebase - Effacer tous les utilisateurs et profils
# ATTENTION: Ce script va supprimer TOUTES les données utilisateurs!

echo "🔥 NETTOYAGE FIREBASE - SUPPRESSION DE TOUTES LES DONNÉES UTILISATEURS"
echo "⚠️  ATTENTION: Cette action est IRRÉVERSIBLE!"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (tapez 'OUI' pour confirmer): " confirm

if [ "$confirm" != "OUI" ]; then
    echo "❌ Opération annulée"
    exit 1
fi

echo ""
echo "🗑️  Suppression en cours..."

# Supprimer tous les documents de la collection 'users'
echo "📄 Suppression des profils utilisateurs..."
firebase firestore:delete --all-collections --force --project vision-picturale-community

# Supprimer tous les documents de la collection 'posts'
echo "📝 Suppression des posts..."
# La commande précédente supprime déjà toutes les collections

# Supprimer les utilisateurs de Firebase Auth
echo "👥 Pour supprimer les utilisateurs de Firebase Auth:"
echo "   1. Aller sur https://console.firebase.google.com/project/vision-picturale-community/authentication/users"
echo "   2. Sélectionner tous les utilisateurs"
echo "   3. Cliquer sur 'Supprimer les utilisateurs sélectionnés'"

echo ""
echo "✅ Nettoyage Firestore terminé!"
echo "⚠️  N'oubliez pas de supprimer manuellement les utilisateurs dans Firebase Auth"
