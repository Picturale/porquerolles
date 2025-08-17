#!/bin/bash

echo "🔥 Suppression de tous les utilisateurs Firebase Authentication..."

# Variables pour suivre le progrès
total_deleted=0
batch_size=10

echo "📊 Vérification du nombre d'utilisateurs..."
firebase auth:export check_users.json > /dev/null 2>&1
user_count=$(cat check_users.json | jq '.users | length')
echo "📋 Utilisateurs à supprimer: $user_count"

if [ "$user_count" -eq 0 ]; then
    echo "✅ Aucun utilisateur à supprimer"
    rm -f check_users.json
    exit 0
fi

# Supprimer par petits lots
echo "🗑️ Début de la suppression..."
while [ $total_deleted -lt $user_count ]; do
    # Obtenir les UIDs des prochains utilisateurs à supprimer
    firebase auth:export current_batch.json > /dev/null 2>&1
    current_count=$(cat current_batch.json | jq '.users | length')
    
    if [ "$current_count" -eq 0 ]; then
        echo "✅ Plus d'utilisateurs à supprimer"
        break
    fi
    
    echo "📋 Suppression du prochain batch ($current_count utilisateurs)..."
    
    # Extraire les UIDs du batch actuel (limité à batch_size)
    cat current_batch.json | jq -r ".users[:$batch_size][].localId" > batch_uids.txt
    
    # Supprimer chaque utilisateur du batch
    while IFS= read -r uid; do
        if [ ! -z "$uid" ]; then
            # Essayer de supprimer l'utilisateur avec force
            result=$(firebase functions:shell --non-interactive << EOF 2>/dev/null || echo "failed"
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();
admin.auth().deleteUser('$uid').then(() => console.log('success')).catch(() => console.log('failed'));
EOF
)
            
            # Méthode alternative avec curl direct à l'API Firebase
            if [[ "$result" == *"failed"* ]] || [[ "$result" == *"error"* ]]; then
                echo "⚠️ Tentative alternative pour: $uid"
                # Ici on pourrait ajouter d'autres méthodes de suppression
            else
                echo "✅ Supprimé: $uid"
                ((total_deleted++))
            fi
        fi
    done < batch_uids.txt
    
    # Pause courte entre les batches
    sleep 1
    
    echo "📊 Progrès: $total_deleted/$user_count utilisateurs supprimés"
done

# Nettoyage
rm -f check_users.json current_batch.json batch_uids.txt

# Vérification finale
echo "🔍 Vérification finale..."
firebase auth:export final_verification.json > /dev/null 2>&1
final_count=$(cat final_verification.json | jq '.users | length')
rm -f final_verification.json

echo "📊 Utilisateurs restants: $final_count"

if [ "$final_count" -eq 0 ]; then
    echo "🎉 SUCCÈS! Tous les utilisateurs Firebase Auth ont été supprimés!"
    echo "✅ Vous pouvez maintenant tester l'inscription sans erreurs."
else
    echo "⚠️ Il reste $final_count utilisateurs. La suppression manuelle via la console reste nécessaire."
    echo "🌐 Console: https://console.firebase.google.com/project/vision-picturale-community/authentication/users"
fi
