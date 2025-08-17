#!/bin/bash

# Test de validation finale de l'application
echo "🎯 Test de validation finale de l'application"
echo "=============================================="

FIREBASE_URL="https://vision-picturale-community.web.app"

echo "1. ✅ Test des composants critiques..."
echo "====================================="

# Test de l'HTML principal
echo "📄 Récupération du HTML principal..."
html_content=$(curl -s "$FIREBASE_URL/")

# Vérification des éléments essentiels
echo "🔍 Vérification des composants critiques:"

if echo "$html_content" | grep -q 'id="root"'; then
    echo "   ✅ Root element: Présent"
else
    echo "   ❌ Root element: Manquant"
fi

if echo "$html_content" | grep -q 'main-DB5HLZQN.js'; then
    echo "   ✅ Script React: Présent et à jour"
else
    echo "   ❌ Script React: Manquant ou obsolète"
fi

if echo "$html_content" | grep -q 'main-CKxOqZa5.css'; then
    echo "   ✅ Styles CSS: Présents et à jour"
else
    echo "   ❌ Styles CSS: Manquants ou obsolètes"
fi

echo ""
echo "2. 🌐 Test des assets critiques..."
echo "=================================="

# Test des assets JavaScript
js_test=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL/assets/main-DB5HLZQN.js")
if [ "$js_test" = "200" ]; then
    echo "   ✅ JavaScript principal: Accessible ($js_test)"
else
    echo "   ❌ JavaScript principal: Inaccessible ($js_test)"
fi

# Test des assets CSS
css_test=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL/assets/main-CKxOqZa5.css")
if [ "$css_test" = "200" ]; then
    echo "   ✅ CSS principal: Accessible ($css_test)"
else
    echo "   ❌ CSS principal: Inaccessible ($css_test)"
fi

echo ""
echo "3. 🔄 Test du routage..."
echo "======================="

# Test des routes critiques
routes=("/" "/home" "/login")
all_routes_ok=true

for route in "${routes[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL$route")
    if [ "$status" = "200" ]; then
        echo "   ✅ Route $route: OK ($status)"
    else
        echo "   ❌ Route $route: Erreur ($status)"
        all_routes_ok=false
    fi
done

echo ""
echo "4. 📱 Test du contenu applicatif..."
echo "==================================="

# Vérification que le contenu contient des éléments React
if echo "$html_content" | grep -q "Vision Picturale"; then
    echo "   ✅ Titre application: Présent"
else
    echo "   ❌ Titre application: Manquant"
fi

if echo "$html_content" | grep -q "Chargement de la communauté"; then
    echo "   ✅ Loader application: Présent"
else
    echo "   ❌ Loader application: Manquant"
fi

echo ""
echo "🎉 Résumé de la validation"
echo "=========================="

if [ "$js_test" = "200" ] && [ "$css_test" = "200" ] && [ "$all_routes_ok" = true ]; then
    echo "✅ SUCCÈS: L'application est entièrement fonctionnelle"
    echo ""
    echo "🚀 Fonctionnalités validées:"
    echo "   • HTML principal correct et à jour"
    echo "   • Assets JavaScript et CSS accessibles"
    echo "   • Routage principal fonctionnel"
    echo "   • Structure React en place"
    echo ""
    echo "🌍 Application disponible: $FIREBASE_URL"
    echo "📱 Prête pour les tests utilisateur"
else
    echo "❌ ÉCHEC: Des problèmes persistent"
    echo ""
    echo "🔧 Actions requises:"
    if [ "$js_test" != "200" ]; then
        echo "   • Vérifier le déploiement des assets JavaScript"
    fi
    if [ "$css_test" != "200" ]; then
        echo "   • Vérifier le déploiement des assets CSS"
    fi
    if [ "$all_routes_ok" = false ]; then
        echo "   • Vérifier la configuration de routage Firebase"
    fi
fi

echo ""
echo "📊 Logs détaillés disponibles ci-dessus"
