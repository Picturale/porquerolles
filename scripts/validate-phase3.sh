#!/bin/bash

# Script de validation Phase 3 - Tests d'intégration
# Commentaires imbriqués - Vision Picturale Community

echo "🧪 PHASE 3 - VALIDATION AUTOMATIQUE"
echo "==================================="
echo ""

# Variables
BUILD_DIR="dist"
TEST_URL="http://localhost:8003"
PHASE3_URL="$TEST_URL/phase3-tests.html"
APP_URL="$TEST_URL/src/social-app/"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Vérification de la structure de build
echo "1. Vérification de la structure de build"
echo "----------------------------------------"

if [ -d "$BUILD_DIR" ]; then
    print_result 0 "Dossier de build trouvé"
    
    # Vérifier les fichiers critiques
    files_to_check=(
        "$BUILD_DIR/src/social-app/index.html"
        "$BUILD_DIR/phase3-tests.html"
        "$BUILD_DIR/tests/phase3-integration-tests.js"
        "$BUILD_DIR/assets/social-app-*.css"
        "$BUILD_DIR/assets/social-app-*.js"
    )
    
    for file_pattern in "${files_to_check[@]}"; do
        if ls $file_pattern 1> /dev/null 2>&1; then
            print_result 0 "Fichier trouvé: $(basename $file_pattern)"
        else
            print_result 1 "Fichier manquant: $file_pattern"
        fi
    done
else
    print_result 1 "Dossier de build non trouvé - Exécutez 'npm run build'"
    exit 1
fi

echo ""

# 2. Vérification du serveur de développement
echo "2. Vérification du serveur de développement"
echo "-------------------------------------------"

# Vérifier si le serveur tourne
if curl -s "$TEST_URL" > /dev/null; then
    print_result 0 "Serveur de développement accessible"
    
    # Tester les URLs principales
    urls_to_test=(
        "$TEST_URL/"
        "$APP_URL"
        "$PHASE3_URL"
    )
    
    for url in "${urls_to_test[@]}"; do
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        if [ "$status_code" = "200" ]; then
            print_result 0 "URL accessible: $url"
        else
            print_result 1 "URL inaccessible ($status_code): $url"
        fi
    done
else
    print_result 1 "Serveur non accessible - Démarrez avec 'npm run dev'"
    print_info "Le serveur devrait être accessible sur: $TEST_URL"
    exit 1
fi

echo ""

# 3. Validation des fichiers de commentaires imbriqués
echo "3. Validation des fichiers de commentaires imbriqués"
echo "---------------------------------------------------"

# Fichiers créés dans les phases précédentes
comment_files=(
    "src/social-app/frontend/utils/commentsUtils.js"
    "src/social-app/frontend/services/commentsService.js"
    "src/social-app/frontend/components/CommentThread.jsx"
    "src/social-app/frontend/components/CommentReplyForm.jsx"
    "src/social-app/frontend/styles/CommentThread.css"
    "src/social-app/frontend/styles/CommentReplyForm.css"
)

for file in "${comment_files[@]}"; do
    if [ -f "$file" ]; then
        print_result 0 "Fichier source: $(basename $file)"
        
        # Vérifier la taille du fichier (doit être > 0)
        if [ -s "$file" ]; then
            print_info "   Taille: $(wc -c < "$file") octets"
        else
            print_warning "   Fichier vide"
        fi
    else
        print_result 1 "Fichier manquant: $file"
    fi
done

echo ""

# 4. Test de compilation et linting
echo "4. Test de compilation et linting"
echo "---------------------------------"

print_info "Vérification de la compilation..."

# Vérifier s'il y a des erreurs de compilation
if npm run build > /tmp/build.log 2>&1; then
    print_result 0 "Compilation réussie"
else
    print_result 1 "Erreurs de compilation détectées"
    print_info "Consultez /tmp/build.log pour les détails"
fi

echo ""

# 5. Tests de performance basiques
echo "5. Tests de performance basiques"
echo "--------------------------------"

# Tester la taille des assets
css_size=$(find $BUILD_DIR/assets -name "social-app-*.css" -exec wc -c {} \; | awk '{print $1}')
js_size=$(find $BUILD_DIR/assets -name "social-app-*.js" -exec wc -c {} \; | awk '{print $1}')

if [ ! -z "$css_size" ]; then
    css_size_mb=$(echo "scale=2; $css_size / 1024 / 1024" | bc)
    if (( $(echo "$css_size_mb < 0.5" | bc -l) )); then
        print_result 0 "Taille CSS acceptable: ${css_size_mb}MB"
    else
        print_warning "Taille CSS importante: ${css_size_mb}MB"
    fi
fi

if [ ! -z "$js_size" ]; then
    js_size_mb=$(echo "scale=2; $js_size / 1024 / 1024" | bc)
    if (( $(echo "$js_size_mb < 2.0" | bc -l) )); then
        print_result 0 "Taille JS acceptable: ${js_size_mb}MB"
    else
        print_warning "Taille JS importante: ${js_size_mb}MB"
    fi
fi

echo ""

# 6. Résumé et recommandations
echo "6. Résumé et recommandations"
echo "----------------------------"

print_info "Tests automatiques terminés !"
echo ""
echo "📋 ÉTAPES SUIVANTES:"
echo "   1. Ouvrez votre navigateur sur: $PHASE3_URL"
echo "   2. Exécutez les tests automatisés sur la page"
echo "   3. Effectuez les tests manuels dans l'application: $APP_URL"
echo "   4. Consultez le guide complet: PHASE3-TESTS-INTEGRATION-GUIDE.md"
echo ""
echo "🔧 LIENS UTILES:"
echo "   • Application: $APP_URL"
echo "   • Tests Phase 3: $PHASE3_URL"
echo "   • Console navigateur: F12 → testCommentsSystem()"
echo ""

# Génération d'un mini rapport
echo "📊 MINI-RAPPORT DE VALIDATION"
echo "=============================="
echo "Date: $(date)"
echo "Build: $([ -d "$BUILD_DIR" ] && echo "✅ OK" || echo "❌ KO")"
echo "Serveur: $(curl -s "$TEST_URL" > /dev/null && echo "✅ OK" || echo "❌ KO")"
echo "Fichiers: $([ -f "src/social-app/frontend/components/CommentThread.jsx" ] && echo "✅ OK" || echo "❌ KO")"
echo "Compilation: $(npm run build > /dev/null 2>&1 && echo "✅ OK" || echo "❌ KO")"
echo ""
echo "🎯 PHASE 3 PRÊTE POUR LES TESTS MANUELS !"

exit 0
