#!/bin/bash

echo "🔄 VÉRIFICATION SYNCHRONISATION SOURCE → iOS"
echo "============================================"
echo "📅 $(date)"
echo ""

# Répertoires
SOURCE_DIR="src"
IOS_DIR="ios/App/App/public"

echo "🔍 Étape 1: Vérification de l'intégrité des sources..."

# Vérifier que les fichiers sources existent
CRITICAL_FILES=(
    "src/index.html"
    "src/core-app/index.html"
    "src/core-app/assets/config.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "   ✅ $file présent"
    else
        echo "   ❌ $file MANQUANT!"
        exit 1
    fi
done

echo ""
echo "📊 Étape 2: Comparaison Source vs iOS..."

# Fonction pour comparer les fichiers
compare_files() {
    local source_file="$1"
    local ios_file="$2"
    local name="$3"
    
    if [[ ! -f "$source_file" ]]; then
        echo "   ❌ $name: Source manquant"
        return 1
    fi
    
    if [[ ! -f "$ios_file" ]]; then
        echo "   ⚠️ $name: iOS manquant (sync nécessaire)"
        return 1
    fi
    
    if cmp -s "$source_file" "$ios_file"; then
        echo "   ✅ $name: Synchronisé"
        return 0
    else
        echo "   ⚠️ $name: DÉSYNCHRONISÉ (sync nécessaire)"
        return 1
    fi
}

# Comparaisons critiques
SYNC_NEEDED=0

compare_files "src/index.html" "ios/App/App/public/index.html" "Page d'accueil" || SYNC_NEEDED=1
compare_files "src/core-app/index.html" "ios/App/App/public/core-app/index.html" "Calibrateur" || SYNC_NEEDED=1
compare_files "src/core-app/assets/config.js" "ios/App/App/public/core-app/assets/config.js" "Config ChartJS" || SYNC_NEEDED=1

echo ""
echo "🎯 Étape 3: Analyse des optimisations..."

# Vérifier les optimisations critiques dans le source
SOURCE_CHARTJS=$(grep -c "dragLastUpdate" "src/core-app/assets/config.js" 2>/dev/null || echo "0")
SOURCE_IPHONE=$(grep -c "isMobile" "src/core-app/index.html" 2>/dev/null || echo "0")
SOURCE_NAVIGATION=$(grep -c 'data-target="core-app/"' "src/index.html" 2>/dev/null || echo "0")

echo "   📊 Optimisations dans le SOURCE:"
echo "      🔧 ChartJS dragLastUpdate: $SOURCE_CHARTJS occurrences"
echo "      📱 Loupe iPhone: $SOURCE_IPHONE optimisations"
echo "      🚀 Navigation relative: $SOURCE_NAVIGATION liens"

# Validation des optimisations
if [[ $SOURCE_CHARTJS -gt 0 && $SOURCE_IPHONE -gt 0 && $SOURCE_NAVIGATION -gt 0 ]]; then
    echo "   ✅ Toutes les optimisations présentes dans le source"
else
    echo "   ❌ Optimisations manquantes dans le source!"
    SYNC_NEEDED=1
fi

echo ""
echo "🔧 Étape 4: Recommandations..."

if [[ $SYNC_NEEDED -eq 1 ]]; then
    echo "   ⚠️ SYNCHRONISATION NÉCESSAIRE"
    echo ""
    echo "   📋 Actions recommandées:"
    echo "   1. Vérifier que tous les changements sont dans src/"
    echo "   2. Exécuter: npx cap sync ios"
    echo "   3. Tester: npx cap open ios"
    echo ""
    echo "   ❌ NE JAMAIS modifier directement ios/App/App/public/"
else
    echo "   ✅ Source et iOS synchronisés"
    echo ""
    echo "   🎯 Prêt pour les tests:"
    echo "   npx cap open ios"
fi

echo ""
echo "📝 RÈGLES DE DÉVELOPPEMENT:"
echo "================================="
echo "✅ DO:"
echo "   • Modifier uniquement dans src/"
echo "   • Utiliser npx cap sync ios pour déployer"
echo "   • Tester sur iOS après chaque sync"
echo "   • Documenter les changements"
echo ""
echo "❌ DON'T:"
echo "   • Modifier directement ios/App/App/public/"
echo "   • Oublier de syncer après les changements"
echo "   • Faire des changements sans backup"
echo ""
if [[ $SYNC_NEEDED -eq 1 ]]; then
    echo "🔄 SYNCHRONISATION REQUISE!"
    exit 1
else
    echo "✅ TOUT EST SYNCHRONISÉ!"
    exit 0
fi
