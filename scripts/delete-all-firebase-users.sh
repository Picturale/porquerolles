#!/bin/bash

echo "🔥 Suppression de tous les utilisateurs Firebase Authentication..."

# Exporter les utilisateurs pour obtenir leurs UIDs
echo "📋 Export des utilisateurs..."
firebase auth:export temp_users.json

# Vérifier si des utilisateurs existent
if [ ! -f "temp_users.json" ] || [ ! -s "temp_users.json" ]; then
    echo "✅ Aucun utilisateur à supprimer"
    exit 0
fi

# Compter les utilisateurs
user_count=$(cat temp_users.json | jq '.users | length')
echo "📊 Utilisateurs trouvés: $user_count"

if [ "$user_count" -eq 0 ]; then
    echo "✅ Aucun utilisateur à supprimer"
    rm temp_users.json
    exit 0
fi

# Extraire tous les UIDs et les supprimer un par un
echo "🗑️ Suppression en cours..."
cat temp_users.json | jq -r '.users[].localId' | while read uid; do
    if [ ! -z "$uid" ]; then
        firebase auth:delete "$uid" --yes 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Supprimé: $uid"
        else
            echo "❌ Erreur: $uid"
        fi
    fi
done

# Nettoyage
rm temp_users.json

# Vérification finale
echo "🔍 Vérification finale..."
firebase auth:export final_check.json
final_count=$(cat final_check.json | jq '.users | length')
rm final_check.json

echo "📊 Utilisateurs restants: $final_count"

if [ "$final_count" -eq 0 ]; then
    echo "🎉 Suppression terminée avec succès! Tous les utilisateurs ont été supprimés."
else
    echo "⚠️ Il reste encore $final_count utilisateurs. Vous pouvez relancer le script."
fi
