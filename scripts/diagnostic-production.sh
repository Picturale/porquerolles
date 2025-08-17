#!/bin/bash

# Diagnostic complet de l'application en production
echo "🔧 Diagnostic complet de l'application en production"
echo "=================================================="

FIREBASE_URL="https://vision-picturale-community.web.app"

echo "1. 📦 Test des assets critiques..."
echo "=================================="

# Test des assets JavaScript
echo "🧩 Test du fichier JavaScript principal:"
js_status=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL/assets/social-app-mgWZEJU4.js")
echo "   Status: $js_status"

# Test des assets CSS
echo "🎨 Test du fichier CSS principal:"
css_status=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL/assets/social-app-cCZMmozR.css")
echo "   Status: $css_status"

echo ""
echo "2. 🏠 Test des redirections..."
echo "============================="

# Test avec headers pour voir les redirections
echo "🔄 Test de redirection pour '/':"
curl -I "$FIREBASE_URL/" 2>/dev/null | grep -E "(HTTP|location|Location)" || echo "   Pas de redirection détectée"

echo ""
echo "3. 📄 Analyse du HTML servi..."
echo "=============================="

# Récupérer et analyser le HTML
html_content=$(curl -s "$FIREBASE_URL/")

echo "📋 Vérification des éléments critiques dans le HTML:"

if echo "$html_content" | grep -q 'id="root"'; then
    echo "   ✅ Élément root trouvé"
else
    echo "   ❌ Élément root manquant"
fi

if echo "$html_content" | grep -q 'social-app-.*\.js'; then
    echo "   ✅ Script JavaScript principal trouvé"
    js_src=$(echo "$html_content" | grep -o 'social-app-[^"]*\.js' | head -1)
    echo "      Script: $js_src"
else
    echo "   ❌ Script JavaScript principal manquant"
fi

if echo "$html_content" | grep -q 'social-app-.*\.css'; then
    echo "   ✅ Fichier CSS principal trouvé"
    css_src=$(echo "$html_content" | grep -o 'social-app-[^"]*\.css' | head -1)
    echo "      CSS: $css_src"
else
    echo "   ❌ Fichier CSS principal manquant"
fi

echo ""
echo "4. 🌐 Test de l'API Firebase..."
echo "==============================="

# Test simple de connectivité Firebase
echo "🔥 Test de l'authentification Firebase:"
auth_test=$(curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null | head -c 100)

if echo "$auth_test" | grep -q "INVALID_API_KEY\|API_KEY"; then
    echo "   ✅ API Firebase accessible"
else
    echo "   ⚠️  API Firebase : réponse inattendue"
fi

echo ""
echo "5. 📱 Test de rendu en mode navigation privée..."
echo "=============================================="

# Simulation d'un test de navigation privée
echo "🕵️ Test avec User-Agent mobile:"
mobile_content=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15" "$FIREBASE_URL/")

if echo "$mobile_content" | grep -q 'id="root"'; then
    echo "   ✅ Rendu mobile correct"
else
    echo "   ❌ Problème de rendu mobile"
fi

echo ""
echo "6. 🎯 Recommandations..."
echo "======================="

echo "🔍 Basé sur l'analyse:"
echo ""

if [ "$js_status" = "200" ] && [ "$css_status" = "200" ]; then
    echo "   ✅ Assets accessibles - pas de problème de build"
    echo "   🔄 Problème probable: configuration de routage côté client"
    echo ""
    echo "   📋 Actions recommandées:"
    echo "   1. Vérifier les logs de la console du navigateur"
    echo "   2. S'assurer que React Router fonctionne correctement"
    echo "   3. Vérifier la configuration de base_url dans index.jsx"
else
    echo "   ❌ Problème d'assets - rebuilding nécessaire"
    echo ""
    echo "   📋 Actions recommandées:"
    echo "   1. Rebuilder l'application (npm run build)"
    echo "   2. Redéployer sur Firebase (firebase deploy)"
fi

echo ""
echo "🌍 URL de test: $FIREBASE_URL"
echo "📊 Log complet disponible ci-dessus"
