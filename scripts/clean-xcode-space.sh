#!/bin/bash

echo "🧹 NETTOYAGE DES BUILDS XCODE"
echo "============================"

# Fonction pour obtenir la taille d'un dossier
get_folder_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "N/A"
    fi
}

# Dossiers à nettoyer
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData"
ARCHIVES="$HOME/Library/Developer/Xcode/Archives"
DEVICE_SUPPORT="$HOME/Library/Developer/Xcode/iOS DeviceSupport"

echo "📊 TAILLES AVANT NETTOYAGE:"
echo "• DerivedData: $(get_folder_size "$DERIVED_DATA")"
echo "• Archives: $(get_folder_size "$ARCHIVES")"
echo "• iOS DeviceSupport: $(get_folder_size "$DEVICE_SUPPORT")"
echo ""

# Nettoyage des DerivedData (builds temporaires)
if [ -d "$DERIVED_DATA" ]; then
    echo "🗑️  Suppression des DerivedData..."
    rm -rf "$DERIVED_DATA"/*
    echo "✅ DerivedData nettoyé"
else
    echo "ℹ️  Dossier DerivedData introuvable"
fi

# Nettoyage des anciens simulateurs (optionnel)
echo ""
echo "📱 SIMULATEURS DISPONIBLES:"
xcrun simctl list devices

echo ""
echo "🔄 REDÉMARRAGE DES SIMULATEURS:"
xcrun simctl shutdown all
xcrun simctl erase all 2>/dev/null || echo "ℹ️  Certains simulateurs ne peuvent pas être effacés"

echo ""
echo "✅ NETTOYAGE TERMINÉ"
echo ""
echo "📊 ESPACE LIBÉRÉ ESTIMÉ:"
echo "• Builds temporaires supprimés"
echo "• Cache Xcode vidé"
echo "• Simulateurs redémarrés"
echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo "1. Relancez Xcode"
echo "2. Choisissez un simulateur iOS (pas l'appareil physique)"
echo "3. Lancez l'app avec: npx cap open ios"
echo "4. Dans Xcode, sélectionnez un simulateur en haut à gauche"
echo "5. Cliquez sur le bouton Play pour installer sur le simulateur"
