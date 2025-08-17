#!/bin/bash

# Script de démonstration rapide - Publication Store
# Teste toute la chaîne sans ouvrir les IDE

echo "🧪 TEST CHAÎNE PUBLICATION STORES"
echo "=================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de test
test_step() {
    local step_name="$1"
    local command="$2"
    local optional="$3"
    
    echo -e "${BLUE}[TEST]${NC} $step_name"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SUCCÈS${NC} - $step_name"
        return 0
    else
        if [ "$optional" = "optional" ]; then
            echo -e "${YELLOW}⚠️  IGNORÉ${NC} - $step_name (optionnel)"
            return 0
        else
            echo -e "${RED}❌ ÉCHEC${NC} - $step_name"
            return 1
        fi
    fi
}

# Compteurs
passed=0
failed=0
total=0

# Tests des prérequis
echo "🔍 PRÉREQUIS"
echo "------------"

total=$((total + 1))
if test_step "Node.js installé" "node --version"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "npm installé" "npm --version"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Capacitor CLI" "npx cap --version"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Xcode disponible" "xcodebuild -version" "optional"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Tests de structure
echo ""
echo "📁 STRUCTURE PROJET"
echo "-------------------"

total=$((total + 1))
if test_step "package.json présent" "test -f package.json"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "capacitor.config.json présent" "test -f capacitor.config.json"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Dossier iOS présent" "test -d ios"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Dossier Android présent" "test -d android"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Tests de build
echo ""
echo "🔨 PROCESSUS BUILD"
echo "------------------"

total=$((total + 1))
if test_step "Build web" "npm run build"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Dossier dist créé" "test -d dist"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Assets core-app" "test -d dist/core-app"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Assets social-app" "test -d dist/social-app"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Tests Capacitor
echo ""
echo "📱 SYNCHRONISATION MOBILE"
echo "-------------------------"

total=$((total + 1))
if test_step "Capacitor copy" "npx cap copy"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Capacitor sync" "npx cap sync"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Tests des scripts personnalisés
echo ""
echo "🛠️  SCRIPTS PERSONNALISÉS"
echo "-------------------------"

total=$((total + 1))
if test_step "Validation store" "npm run validate:store"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Préparation release" "npm run mobile:prepare-release"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Génération assets" "npm run assets:generate" "optional"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Vérification des fichiers générés
echo ""
echo "📄 FICHIERS GÉNÉRÉS"
echo "-------------------"

total=$((total + 1))
if test_step "Rapport mobile" "test -f MOBILE-RELEASE-REPORT.json"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

total=$((total + 1))
if test_step "Rapport build" "test -f BUILD-REPORT.md"; then
    passed=$((passed + 1))
else
    failed=$((failed + 1))
fi

# Résultats finaux
echo ""
echo "📊 RÉSULTATS FINAUX"
echo "==================="
echo ""

percentage=$((passed * 100 / total))

echo -e "✅ Tests réussis: ${GREEN}$passed${NC}/$total"
echo -e "❌ Tests échoués: ${RED}$failed${NC}/$total"
echo -e "📈 Score: ${BLUE}$percentage%${NC}"

echo ""

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT!${NC} Votre projet est prêt pour publication!"
    echo ""
    echo "🚀 Commandes de publication:"
    echo "   • npm run publish ios     - Publication iOS"
    echo "   • npm run publish android - Publication Android"  
    echo "   • npm run publish both    - Publication complète"
    echo ""
    echo "📚 Documentation: README-PUBLICATION-STORES.md"
    
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}⚠️  BIEN!${NC} Quelques optimisations recommandées."
    echo ""
    echo "🔧 Actions suggérées:"
    echo "   • Vérifiez les tests échoués ci-dessus"
    echo "   • Relancez: ./scripts/test-publication.sh"
    
else
    echo -e "${RED}❌ PROBLÈMES DÉTECTÉS${NC} Corrections nécessaires avant publication."
    echo ""
    echo "🆘 Actions requises:"
    echo "   • Corrigez les erreurs critiques"
    echo "   • Consultez: GUIDE-PUBLICATION-STORES.md"
    echo "   • Support: npm run validate:store"
fi

echo ""
echo "⏱️  Test terminé en $(date)"

# Code de sortie basé sur le score
if [ $percentage -ge 70 ]; then
    exit 0
else
    exit 1
fi
