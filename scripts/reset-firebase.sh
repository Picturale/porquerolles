#!/bin/bash

echo "🚀 SCRIPT DE RÉINITIALISATION FIREBASE - Vision Picturale Community"
echo "================================================================"

# Configuration du projet
PROJECT_ID="vision-picturale-community"
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)

echo ""
echo "📋 ÉTAPE 1: Sauvegarde des données existantes"
echo "============================================="

# Créer le dossier de sauvegarde
mkdir -p backups/$BACKUP_DATE

# Exporter les utilisateurs Firebase Auth
echo "💾 Sauvegarde des utilisateurs Firebase Auth..."
firebase auth:export backups/$BACKUP_DATE/users_backup.json --project $PROJECT_ID
if [ $? -eq 0 ]; then
    echo "✅ Utilisateurs sauvegardés avec succès"
else
    echo "⚠️  Erreur lors de la sauvegarde des utilisateurs"
fi

echo ""
echo "📋 ÉTAPE 2: Nettoyage de Firestore"
echo "=================================="

# Lister les collections principales à supprimer
COLLECTIONS=("users" "posts" "comments" "notifications" "conversations" "messages" "follows")

echo "🧹 Suppression des collections Firestore..."

for collection in "${COLLECTIONS[@]}"; do
    echo "🗑️  Suppression de la collection: $collection"
    firebase firestore:delete --project $PROJECT_ID --recursive "$collection" --non-interactive --force
    sleep 2
done

echo ""
echo "📋 ÉTAPE 3: Information sur Firebase Auth"
echo "=========================================="

echo "⚠️  IMPORTANT: Firebase Auth ne peut pas être vidé automatiquement via CLI"
echo "📱 Pour vider Firebase Auth, vous devez aller manuellement sur:"
echo "   👉 https://console.firebase.google.com/project/$PROJECT_ID/authentication/users"
echo "   👉 Sélectionner tous les utilisateurs et les supprimer"

echo ""
echo "📋 ÉTAPE 4: Vérification des règles Firestore"
echo "=============================================="

echo "🔍 Vérification des règles de sécurité Firestore..."
firebase firestore:rules get --project $PROJECT_ID

echo ""
echo "📋 ÉTAPE 5: Redéploiement des règles"
echo "===================================="

echo "🚀 Redéploiement des règles Firestore..."
firebase deploy --only firestore:rules --project $PROJECT_ID

echo ""
echo "✅ RÉINITIALISATION TERMINÉE !"
echo "=============================="
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo "1. Allez sur la console Firebase pour supprimer manuellement les utilisateurs Auth"
echo "2. Testez la création d'un nouveau compte"
echo "3. Les sauvegardes sont dans: backups/$BACKUP_DATE/"
echo ""
echo "🌐 Console Firebase: https://console.firebase.google.com/project/$PROJECT_ID"
