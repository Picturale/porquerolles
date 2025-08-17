#!/bin/bash

echo "🔧 Nettoyage du cache et vérification ChartJS - Dossier Source"
echo "=================================================================="

# Répertoire de travail
SOURCE_DIR="/Users/admin/Pictures/dev/applstore project generation full/src"
CONFIG_FILE="$SOURCE_DIR/core-app/assets/config.js"

echo "📂 Répertoire source: $SOURCE_DIR"
echo "📄 Fichier config: $CONFIG_FILE"

# Vérifier que le fichier existe
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "❌ Erreur: Le fichier config.js n'existe pas!"
    exit 1
fi

echo ""
echo "🔍 Vérification des corrections ChartJS..."

# Chercher dragLastUpdate
DRAG_COUNT=$(grep -c "dragLastUpdate" "$CONFIG_FILE")
echo "✅ Variable 'dragLastUpdate' trouvée: $DRAG_COUNT occurrences"

# Chercher _lastUpdate (ne devrait plus exister)
LASTUPDATE_COUNT=$(grep -c "_lastUpdate" "$CONFIG_FILE")
if [[ $LASTUPDATE_COUNT -eq 0 ]]; then
    echo "✅ Aucune occurrence de '_lastUpdate' - Correction appliquée!"
else
    echo "❌ PROBLÈME: $_lastUpdate_COUNT occurrences de '_lastUpdate' trouvées!"
    echo "📋 Occurrences:"
    grep -n "_lastUpdate" "$CONFIG_FILE"
fi

echo ""
echo "🔧 Ajout d'un timestamp pour forcer le rechargement..."

# Ajouter un commentaire avec timestamp pour forcer le rechargement
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
COMMENT="/* Cache-buster: $TIMESTAMP */"

# Vérifier si le commentaire existe déjà
if grep -q "Cache-buster" "$CONFIG_FILE"; then
    # Remplacer l'ancien commentaire
    sed -i.bak "s|/\* Cache-buster: .* \*/|$COMMENT|" "$CONFIG_FILE"
    echo "✅ Timestamp mis à jour: $TIMESTAMP"
else
    # Ajouter le commentaire au début
    sed -i.bak "1i\\
$COMMENT" "$CONFIG_FILE"
    echo "✅ Timestamp ajouté: $TIMESTAMP"
fi

echo ""
echo "📊 Statistiques du fichier:"
echo "   - Taille: $(wc -c < "$CONFIG_FILE") octets"
echo "   - Lignes: $(wc -l < "$CONFIG_FILE") lignes"
echo "   - Fonctions onDrag: $(grep -c "onDrag:" "$CONFIG_FILE") trouvées"

echo ""
echo "🎯 Instructions pour le test:"
echo "1. Rafraîchissez votre navigateur (Ctrl+F5 ou Cmd+Shift+R)"
echo "2. Ouvrez les DevTools et videz le cache (F12 → Network → Disable cache)"
echo "3. Testez le drag sur le graphique"
echo "4. Vérifiez que la courbe s'ajuste maintenant"

echo ""
echo "✅ Script terminé - Prêt pour le test!"
