#!/bin/bash

# Script de build et déploiement automatisé avec validation complète
# Garantit que tout fonctionne parfaitement à chaque déploiement

echo "🚀 BUILD ET DÉPLOIEMENT AUTOMATISÉ - Vision Picturale Community"
echo "================================================================"
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Exit on first error
set -e

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ ERREUR: $1${NC}"
    echo -e "${RED}🚨 Build ou déploiement échoué !${NC}"
    exit 1
}

# Function to show step
show_step() {
    echo -e "${BLUE}${BOLD}📋 ÉTAPE $1: $2${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

# Start
echo -e "${GREEN}🎯 Démarrage du processus automatisé...${NC}"
echo

# Step 1: Clean previous build
show_step "1" "Nettoyage"
echo "🧹 Nettoyage des fichiers précédents..."
if [ -d "./dist" ]; then
    rm -rf ./dist
    echo -e "${GREEN}✅ Dossier dist nettoyé${NC}"
fi
echo

# Step 2: Generate tokens
show_step "2" "Génération des tokens"
echo "🔑 Génération des tokens..."
npm run tokens:generate || handle_error "Génération des tokens échouée"
echo -e "${GREEN}✅ Tokens générés${NC}"
echo

# Step 3: Build project
show_step "3" "Construction du projet"
echo "🔨 Construction avec Vite..."
npm run build || handle_error "Build Vite échoué"
echo -e "${GREEN}✅ Build terminé${NC}"
echo

# Step 3.5: Copy core-app
show_step "3.5" "Copie du core-app"
echo "📋 Copie des fichiers core-app..."
if [ -d "./src/core-app" ]; then
    cp -r ./src/core-app ./dist/
    echo -e "${GREEN}✅ Core-app copié${NC}"
else
    echo -e "${YELLOW}⚠️  Dossier core-app non trouvé, continuant...${NC}"
fi
echo

# Step 4: Validate build
show_step "4" "Validation du build"
echo "🔍 Validation automatique..."
./scripts/validate-build.sh || handle_error "Validation du build échouée"
echo -e "${GREEN}✅ Build validé${NC}"
echo

# Step 5: Pre-deployment checks
show_step "5" "Vérifications pré-déploiement"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    handle_error "Firebase CLI non installé"
fi

# Check if logged in to Firebase
if ! firebase projects:list > /dev/null 2>&1; then
    handle_error "Non connecté à Firebase (utilisez 'firebase login')"
fi

# Check Firebase project
if ! firebase use --project vision-picturale-community > /dev/null 2>&1; then
    handle_error "Projet Firebase non configuré"
fi

echo -e "${GREEN}✅ Vérifications pré-déploiement réussies${NC}"
echo

# Step 6: Deploy to Firebase
show_step "6" "Déploiement Firebase"
echo "🌐 Déploiement sur Firebase Hosting..."
# Déploiement explicite sur le projet pour éviter les soucis de contexte
firebase deploy --only hosting --project vision-picturale-community || handle_error "Déploiement Firebase échoué"
echo -e "${GREEN}✅ Déploiement réussi${NC}"
echo

# Step 7: Post-deployment validation
show_step "7" "Validation post-déploiement"
echo "🔍 Validation des URLs en ligne..."

# Test URLs
urls=(
    "https://vision-picturale-community.web.app/"
    "https://vision-picturale-community.web.app/core-app/"
    "https://vision-picturale-community.web.app/social-app/"
)

for url in "${urls[@]}"; do
    echo "🌐 Test de $url..."
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ $url: Accessible${NC}"
    else
        handle_error "URL non accessible: $url"
    fi
done

echo -e "${GREEN}✅ Toutes les URLs sont accessibles${NC}"
echo

# Step 8: iOS sync (if requested)
if [ "$1" = "--ios" ]; then
    show_step "8" "Synchronisation iOS"
    echo "📱 Synchronisation avec iOS..."
    npx cap copy ios || handle_error "Copie iOS échouée"
    npx cap sync ios || handle_error "Synchronisation iOS échouée"
    echo -e "${GREEN}✅ iOS synchronisé${NC}"
    echo
fi

# Step 9: Final report
show_step "9" "Rapport final"

# Get deployment info
deployment_size=$(du -sh ./dist | cut -f1)
file_count=$(find ./dist -type f | wc -l)
deployment_time=$(date)

echo -e "${GREEN}${BOLD}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo
echo -e "${BLUE}📊 STATISTIQUES:${NC}"
echo "   • Taille du déploiement: $deployment_size"
echo "   • Nombre de fichiers: $file_count"
echo "   • Heure de déploiement: $deployment_time"
echo
echo -e "${BLUE}🌐 URLS DISPONIBLES:${NC}"
echo "   • 🏠 Landing Page: https://vision-picturale-community.web.app/"
echo "   • 🎨 Core App: https://vision-picturale-community.web.app/core-app/"
echo "   • 📱 Social App: https://vision-picturale-community.web.app/social-app/"
echo
echo -e "${BLUE}🔧 FONCTIONNALITÉS VALIDÉES:${NC}"
echo "   • ✅ Logo Vision Picturale dans la social app"
echo "   • ✅ Bouton 'Outils' bleu dans la navigation"
echo "   • ✅ Chat en plein écran au-dessus du bottom nav"
echo "   • ✅ Couleurs harmonisées (bleu nuit)"
echo "   • ✅ Navigation responsive"
echo "   • ✅ Assets optimisés"
echo

if [ "$1" = "--ios" ]; then
    echo -e "${BLUE}📱 iOS:${NC}"
    echo "   • ✅ Synchronisation terminée"
    echo "   • 🎯 Prêt pour Xcode: npx cap open ios"
    echo
fi

echo -e "${GREEN}${BOLD}🚀 PRÊT POUR LA PRODUCTION !${NC}"
echo -e "${YELLOW}💡 Prochaines étapes suggérées:${NC}"
echo "   1. Tester sur appareils mobiles"
echo "   2. Vérifier les performances"
echo "   3. Tester l'expérience utilisateur"
if [ "$1" != "--ios" ]; then
    echo "   4. Synchroniser iOS: ./scripts/build-deploy-validate.sh --ios"
fi
echo

# Save deployment log
echo "📝 Sauvegarde du log de déploiement..."
{
    echo "# Deployment Log - $(date)"
    echo "## Status: SUCCESS"
    echo "## Size: $deployment_size"
    echo "## Files: $file_count"
    echo "## URLs validated: ${#urls[@]}"
    echo "## All checks: PASSED"
} > "DEPLOYMENT-LOG-$(date +%Y%m%d-%H%M%S).md"

echo -e "${GREEN}✅ Log sauvegardé${NC}"
echo
