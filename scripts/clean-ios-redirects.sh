#!/bin/bash

# Ce script supprime les fichiers de redirection qui peuvent causer des problèmes de navigation
# et vérifie que les fichiers de navigation directe sont en place

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Nettoyage des redirections iOS${NC}"
echo "===============================";

# Vérification du dossier iOS
IOS_PUBLIC_DIR="./ios/App/App/public"

if [ ! -d "$IOS_PUBLIC_DIR" ]; then
    echo -e "${RED}❌ ERREUR: Le dossier iOS n'existe pas: $IOS_PUBLIC_DIR${NC}"
    echo "Assurez-vous d'avoir synchronisé iOS avec 'npx cap sync ios'"
    exit 1
fi

# Suppression des redirections problématiques
CORE_APP_REDIRECT="$IOS_PUBLIC_DIR/core-app/index.html"
SOCIAL_APP_REDIRECT="$IOS_PUBLIC_DIR/social-app/index.html"

# Supprimer core-app/index.html s'il existe
if [ -f "$CORE_APP_REDIRECT" ]; then
    rm "$CORE_APP_REDIRECT"
    echo -e "${GREEN}✅ Suppression de core-app/index.html (redirection)${NC}"
else
    echo -e "${YELLOW}🔍 Aucun fichier de redirection trouvé pour core-app${NC}"
fi

# Supprimer social-app/index.html s'il existe
if [ -f "$SOCIAL_APP_REDIRECT" ]; then
    rm "$SOCIAL_APP_REDIRECT"
    echo -e "${GREEN}✅ Suppression de social-app/index.html (redirection)${NC}"
else
    echo -e "${YELLOW}🔍 Aucun fichier de redirection trouvé pour social-app${NC}"
fi

# Vérification finale
echo -e "\n${YELLOW}📋 Vérification des fichiers essentiels${NC}"
echo "===============================";

REQUIRED_FILES=(
    "$IOS_PUBLIC_DIR/index.html" 
    "$IOS_PUBLIC_DIR/src/core-app/index.html"
    "$IOS_PUBLIC_DIR/src/social-app/index.html"
)

ALL_OK=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        file_size=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}✅ $file existe ($file_size)${NC}"
    else
        echo -e "${RED}❌ ERREUR: $file est manquant${NC}"
        ALL_OK=false
    fi
done

if [ "$ALL_OK" = true ]; then
    echo -e "\n${GREEN}🚀 NETTOYAGE RÉUSSI!${NC}"
    echo -e "Navigation directe maintenant prête pour iOS."
    echo -e "Lancez le simulateur pour tester: ${YELLOW}npx cap open ios${NC}"
else
    echo -e "\n${RED}⚠️ ATTENTION: Certains fichiers essentiels sont manquants.${NC}"
    echo -e "Reconstruisez le projet: ${YELLOW}npm run build${NC}"
    echo -e "Puis resynchronisez iOS: ${YELLOW}npx cap sync ios${NC}"
fi
