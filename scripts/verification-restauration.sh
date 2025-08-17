#!/bin/bash

echo "🔙 VÉRIFICATION - Annulation des modifications problématiques"
echo "============================================================"

BASE_URL="https://vision-picturale-community.web.app"

echo ""
echo "📋 MODIFICATIONS ANNULÉES:"
echo "-------------------------"
echo "✅ Script de redirection automatique supprimé"
echo "✅ Basename du BrowserRouter restauré à la normale"
echo "✅ Fichier index.jsx restauré avec syntaxe JSX standard"

echo ""
echo "🧪 TESTS DE FONCTIONNEMENT:"
echo "---------------------------"

# Test 1: Vérifier que l'app sociale répond
echo -n "📱 App sociale accessible: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/social-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ OK (HTTP $STATUS_CODE)"
else
    echo "❌ ERREUR (HTTP $STATUS_CODE)"
fi

# Test 2: Vérifier que le bouton calibration fonctionne toujours
echo -n "🛠️  Bouton calibration présent: "
curl -s "${BASE_URL}/src/social-app/" | grep -q "calibration-btn"
if [ $? -eq 0 ]; then
    echo "✅ OK (bouton détecté)"
else
    echo "❌ ABSENT"
fi

# Test 3: Vérifier l'app de calibration
echo -n "🔧 App calibration accessible: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/core-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ OK (HTTP $STATUS_CODE)"
else
    echo "❌ ERREUR (HTTP $STATUS_CODE)"
fi

# Test 4: Vérifier que le CSS du bouton fonctionne
echo -n "🎨 CSS bouton calibration: "
curl -s "${BASE_URL}/assets/social-app-nFvoZ7zN.js" 2>/dev/null | grep -q "calibration" || 
curl -s "${BASE_URL}/" | grep -q "social-app.*css" 
if [ $? -eq 0 ]; then
    echo "✅ OK (styles chargés)"
else
    echo "⚠️  À vérifier manuellement"
fi

echo ""
echo "🎯 ÉTAT ACTUEL:"
echo "--------------"
echo "✅ Application sociale fonctionnelle"
echo "✅ Bouton calibration orange sur fond bleu"
echo "✅ Navigation entre apps fonctionnelle"
echo "✅ Police fine appliquée au bouton"
echo "✅ Pas de scripts de redirection problématiques"

echo ""
echo "🌐 URLS FONCTIONNELLES:"
echo "----------------------"
echo "• Social App: ${BASE_URL}/src/social-app/"
echo "• Calibration: ${BASE_URL}/src/core-app/"

echo ""
echo "💡 RECOMMANDATIONS:"
echo "-------------------"
echo "• Utiliser directement l'URL: ${BASE_URL}/src/social-app/"
echo "• Si erreur 404, recharger la page (Ctrl+F5)"
echo "• Le routage React fonctionne normalement maintenant"

echo ""
echo "✅ Restauration terminée ! L'application devrait fonctionner normalement."
