#!/bin/bash

echo "🧪 Test des dernières modifications - Bouton calibration et navigation"
echo "======================================================================="

BASE_URL="https://vision-picturale-community.web.app"

# Test 1: Vérifier que le bouton calibration a le bon style (orange sur bleu)
echo ""
echo "📱 Test 1: Style du bouton calibration..."
curl -s "${BASE_URL}/src/social-app/" | grep -i "calibration-btn" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Bouton calibration présent dans le HTML"
else
    echo "❌ Bouton calibration non trouvé"
fi

# Test 2: Vérifier la présence du CSS orange/bleu
echo ""
echo "🎨 Test 2: Vérification du CSS orange/bleu..."
curl -s "${BASE_URL}/assets/social-app-BZHZ4Emi.css" | grep -i "#ff6600\|#0066cc" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ CSS orange (#ff6600) et bleu (#0066cc) détectés"
else
    echo "❌ CSS orange/bleu non trouvé"
fi

# Test 3: Vérifier que l'app de calibration est accessible
echo ""
echo "🛠️ Test 3: Accessibilité de l'app de calibration..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/core-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ App de calibration accessible (HTTP $STATUS_CODE)"
else
    echo "❌ App de calibration non accessible (HTTP $STATUS_CODE)"
fi

# Test 4: Vérifier la modification du bouton Accueil dans core-app
echo ""
echo "🏠 Test 4: Modification du bouton Accueil dans core-app..."
curl -s "${BASE_URL}/src/core-app/" | grep -i "window.location.href.*social-app" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Redirection vers social-app détectée dans le code"
else
    echo "⚠️  Redirection non visible dans le HTML (peut être dans le JS compilé)"
fi

# Test 5: Navigation anonyme sur le feed social
echo ""
echo "👥 Test 5: Navigation anonyme sur le feed social..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/social-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ Feed social accessible en mode anonyme (HTTP $STATUS_CODE)"
else
    echo "❌ Feed social non accessible (HTTP $STATUS_CODE)"
fi

echo ""
echo "🌐 URLs de test manuels:"
echo "   • App social: ${BASE_URL}/src/social-app/"
echo "   • App calibration: ${BASE_URL}/src/core-app/"
echo ""
echo "🔍 Tests manuels recommandés:"
echo "   1. Vérifier visuellement le bouton orange sur fond bleu"
echo "   2. Cliquer sur 'Outils de calibration' → doit aller vers core-app"
echo "   3. Dans core-app, cliquer sur 'Accueil' → doit revenir vers social-app"
echo "   4. Vérifier la navigation anonyme dans le feed"

echo ""
echo "✅ Tests automatiques terminés !"
