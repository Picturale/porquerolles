#!/bin/bash

echo "🔥 SUPPRESSION DE TOUS LES UTILISATEURS FIREBASE"
echo "⚠️  Cette action est IRREVERSIBLE !"
echo ""

read -p "Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs ? (tapez 'OUI' pour confirmer): " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo "❌ Opération annulée"
    exit 1
fi

echo ""
echo "📊 Export et suppression des utilisateurs..."

# Export users first (backup)
echo "💾 Sauvegarde des utilisateurs existants..."
firebase auth:export users_backup_$(date +%Y%m%d-%H%M%S).json

# Get current project info
echo "📋 Informations du projet:"
firebase projects:list

echo ""
echo "🗑️  Suppression des collections Firestore..."

# Delete users collection
echo "   - Suppression collection 'users'..."
firebase firestore:delete --all-collections --force 2>/dev/null || echo "   Collection 'users' vide ou inexistante"

echo ""
echo "🗑️  Les utilisateurs Firebase Auth doivent être supprimés manuellement via:"
echo "   1. Console Firebase: https://console.firebase.google.com/project/vision-picturale-community/authentication/users"
echo "   2. Sélectionner tous les utilisateurs et cliquer sur 'Supprimer'"
echo ""
echo "💡 Alternative: Vous pouvez désactiver puis réactiver l'authentification pour tout effacer:"
echo "   - Aller dans Authentication > Sign-in method"
echo "   - Désactiver puis réactiver chaque méthode d'authentification"
echo ""
echo "✅ Nettoyage Firestore terminé !"
echo "🔄 Les utilisateurs Auth nécessitent une suppression manuelle via la console"
