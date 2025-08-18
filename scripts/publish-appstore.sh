#!/bin/bash

# Script de publication automatique sur l'App Store
echo "🚀 Publication automatique sur l'App Store - Noeme"
echo "================================================="

# Set working directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Fonction pour afficher les erreurs
error_exit() {
    echo "❌ Erreur: $1" >&2
    exit 1
}

# Fonction pour afficher les succès
success_msg() {
    echo "✅ $1"
}

# Variables de configuration
APP_NAME="Noeme"
BUNDLE_ID="noeme"
SCHEME="App"
WORKSPACE_PATH="ios/App/App.xcworkspace"
PROJECT_PATH="ios/App/App.xcodeproj"
ARCHIVE_PATH="build/Noeme.xcarchive"
IPA_PATH="build/Noeme.ipa"

# Créer le dossier build s'il n'existe pas
mkdir -p build

echo "📱 Configuration:"
echo "   - App: $APP_NAME"
echo "   - Bundle ID: $BUNDLE_ID"
echo "   - Archive: $ARCHIVE_PATH"
echo "   - IPA: $IPA_PATH"
echo ""

# Étape 1: Build web et sync Capacitor
echo "🌐 Build web et synchronisation Capacitor..."
npm run build || error_exit "Erreur lors du build web"
npx cap sync ios || error_exit "Erreur lors de la synchronisation Capacitor"
success_msg "Build web et sync terminés"

# Étape 2: Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf build/
mkdir -p build
cd ios/App
xcodebuild clean -project App.xcodeproj -scheme App || error_exit "Erreur lors du nettoyage"
success_msg "Nettoyage terminé"

# Étape 3: Archiver le projet
echo "📦 Création de l'archive..."
xcodebuild archive \
    -project App.xcodeproj \
    -scheme App \
    -configuration Release \
    -archivePath "../../$ARCHIVE_PATH" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM="" \
    || error_exit "Erreur lors de l'archivage"
success_msg "Archive créée: $ARCHIVE_PATH"

# Revenir au dossier racine
cd "$PROJECT_ROOT"

# Étape 4: Exporter l'IPA
echo "📱 Export de l'IPA pour l'App Store..."
cat > build/ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "build/" \
    -exportOptionsPlist "build/ExportOptions.plist" \
    -allowProvisioningUpdates \
    || error_exit "Erreur lors de l'export IPA"
success_msg "IPA exporté: build/"

# Étape 5: Uploader vers l'App Store
echo "☁️ Upload vers l'App Store Connect..."
IPA_FILE=$(find build -name "*.ipa" | head -n 1)
if [ -z "$IPA_FILE" ]; then
    error_exit "Fichier IPA non trouvé"
fi

echo "📤 Upload du fichier: $IPA_FILE"

# Utiliser xcrun altool (méthode moderne)
read -p "🔑 App Store Connect API Key ID (ou appuyez sur Entrée pour utiliser les identifiants): " API_KEY_ID
read -p "🔑 Issuer ID (ou appuyez sur Entrée pour utiliser les identifiants): " ISSUER_ID

if [ -n "$API_KEY_ID" ] && [ -n "$ISSUER_ID" ]; then
    # Upload avec API Key
    read -p "📁 Chemin vers le fichier .p8 de l'API Key: " API_KEY_PATH
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --apiKey "$API_KEY_ID" \
        --apiIssuer "$ISSUER_ID" \
        --apiKeyFile "$API_KEY_PATH" \
        || error_exit "Erreur lors de l'upload avec API Key"
else
    # Upload avec identifiants Apple ID
    read -p "📧 Apple ID: " APPLE_ID
    read -s -p "🔐 Mot de passe d'app (App-Specific Password): " APP_PASSWORD
    echo ""
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "$APPLE_ID" \
        --password "$APP_PASSWORD" \
        || error_exit "Erreur lors de l'upload avec Apple ID"
fi

success_msg "Upload terminé avec succès!"

echo ""
echo "🎉 Publication terminée avec succès!"
echo "📱 L'app '$APP_NAME' a été uploadée sur l'App Store Connect"
echo "🌐 Connectez-vous à https://appstoreconnect.apple.com pour finaliser la soumission"
echo "⏱️  Il peut falloir quelques minutes pour que l'app apparaisse dans App Store Connect"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Aller sur App Store Connect"
echo "   2. Sélectionner votre app '$APP_NAME'"
echo "   3. Ajouter les métadonnées (description, captures d'écran, etc.)"
echo "   4. Soumettre pour review"
