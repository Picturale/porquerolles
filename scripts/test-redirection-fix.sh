#!/bin/bash

echo "🔄 TEST DE REDIRECTION - Correction erreur 404 Social App"
echo "========================================================="

BASE_URL="https://vision-picturale-community.web.app"

echo ""
echo "📋 MODIFICATION APPLIQUÉE:"
echo "-------------------------"
echo "✅ Script de redirection automatique ajouté dans /src/social-app/index.html"
echo "✅ Basename configuré dans le BrowserRouter React"
echo "✅ Redirection automatique vers /home pour éviter les 404"

echo ""
echo "🧪 TESTS AUTOMATIQUES:"
echo "----------------------"

# Test 1: Vérifier que l'app sociale répond
echo -n "📱 App sociale accessible: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/social-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ OK (HTTP $STATUS_CODE)"
else
    echo "❌ ERREUR (HTTP $STATUS_CODE)"
fi

# Test 2: Vérifier que la page /home répond
echo -n "🏠 Page /home accessible: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/social-app/home")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ OK (HTTP $STATUS_CODE)"
else
    echo "❌ ERREUR (HTTP $STATUS_CODE)"
fi

# Test 3: Vérifier la présence du script de redirection
echo -n "🔄 Script de redirection présent: "
curl -s "${BASE_URL}/src/social-app/" | grep -q "autoRedirectToHome"
if [ $? -eq 0 ]; then
    echo "✅ OK (script détecté)"
else
    echo "❌ ABSENT"
fi

# Test 4: Vérifier que le basename est configuré
echo -n "⚙️  Basename React Router: "
curl -s "${BASE_URL}/src/social-app/" | grep -q "basename.*social-app"
if [ $? -eq 0 ]; then
    echo "✅ OK (basename configuré)"
else
    echo "❌ NON CONFIGURÉ"
fi

echo ""
echo "🌐 TESTS MANUELS RECOMMANDÉS:"
echo "-----------------------------"
echo "1. 🔗 Accéder directement à: ${BASE_URL}/src/social-app/"
echo "   → Doit automatiquement rediriger vers: ${BASE_URL}/src/social-app/home"
echo ""
echo "2. 🔗 Accéder à: ${BASE_URL}/src/social-app/index.html"
echo "   → Doit automatiquement rediriger vers: ${BASE_URL}/src/social-app/home"
echo ""
echo "3. 🔗 Tester la navigation dans l'app:"
echo "   → Bouton calibration doit fonctionner"
echo "   → Navigation entre les pages doit être fluide"
echo "   → Pas d'erreurs 404 lors du rechargement de page"

echo ""
echo "🎯 OBJECTIF:"
echo "------------"
echo "✅ Éliminer les erreurs 404 lors de l'accès à la social app"
echo "✅ Redirection automatique vers /home"
echo "✅ Navigation fluide sans erreurs"

echo ""
echo "🔗 LIENS DE TEST:"
echo "----------------"
echo "• Social App (doit rediriger): ${BASE_URL}/src/social-app/"
echo "• Page d'accueil directe: ${BASE_URL}/src/social-app/home"
echo "• App de calibration: ${BASE_URL}/src/core-app/"

echo ""
echo "✅ Tests de redirection terminés !"
echo ""
echo "💡 Si des erreurs 404 persistent, vérifiez:"
echo "   1. Le cache du navigateur (Ctrl+F5 pour forcer le rechargement)"
echo "   2. Que le script de redirection s'exécute correctement"
echo "   3. Que le basename React Router est bien configuré"
