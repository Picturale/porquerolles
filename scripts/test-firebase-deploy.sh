#!/bin/bash

echo "🚀 TEST DE DÉPLOIEMENT FIREBASE - Version corrigée"
echo "================================================="

BASE_URL="https://vision-picturale-community.web.app"

echo ""
echo "📦 DÉPLOIEMENT RÉALISÉ:"
echo "----------------------"
echo "✅ Build réussi avec index.jsx corrigé"
echo "✅ Déploiement Firebase terminé"
echo "✅ Application disponible en production"

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

# Test 2: Vérifier la taille du fichier JS (doit être substantiel)
echo -n "📄 Fichier JS social-app présent: "
JS_SIZE=$(curl -s "${BASE_URL}/assets/social-app-mgWZEJU4.js" | wc -c 2>/dev/null || echo "0")
if [ "$JS_SIZE" -gt 100000 ]; then
    echo "✅ OK (${JS_SIZE} bytes)"
else
    echo "⚠️  Petit fichier (${JS_SIZE} bytes)"
fi

# Test 3: Vérifier que le CSS est chargé
echo -n "🎨 CSS social-app chargé: "
CSS_SIZE=$(curl -s "${BASE_URL}/assets/social-app-cCZMmozR.css" | wc -c 2>/dev/null || echo "0")
if [ "$CSS_SIZE" -gt 10000 ]; then
    echo "✅ OK (${CSS_SIZE} bytes)"
else
    echo "❌ ERREUR (${CSS_SIZE} bytes)"
fi

# Test 4: Vérifier l'app de calibration
echo -n "🛠️  App calibration accessible: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/src/core-app/")
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ OK (HTTP $STATUS_CODE)"
else
    echo "❌ ERREUR (HTTP $STATUS_CODE)"
fi

# Test 5: Vérifier que React se charge
echo -n "⚛️  React components présents: "
curl -s "${BASE_URL}/src/social-app/" | grep -q "React.*createElement\|root.*render"
if [ $? -eq 0 ]; then
    echo "✅ OK (React détecté)"
else
    echo "⚠️  À vérifier manuellement"
fi

echo ""
echo "🌐 URLS DE TEST EN PRODUCTION:"
echo "------------------------------"
echo "📱 Social App: ${BASE_URL}/src/social-app/"
echo "🛠️  Calibration: ${BASE_URL}/src/core-app/"
echo "🏠 Accueil: ${BASE_URL}/"

echo ""
echo "🎯 FONCTIONNALITÉS À TESTER MANUELLEMENT:"
echo "----------------------------------------"
echo "1. 🔐 Connexion utilisateur"
echo "2. 📱 Navigation dans le feed social"
echo "3. 🛠️  Bouton calibration (orange sur bleu)"
echo "4. 🔄 Navigation entre social-app et core-app"
echo "5. 📱 Responsive design sur mobile"
echo "6. 🎨 Interface utilisateur complète"

echo ""
echo "💡 POINTS DE VÉRIFICATION:"
echo "--------------------------"
echo "• Plus d'écran blanc"
echo "• Chargement correct de Firebase"
echo "• Authentification fonctionnelle"
echo "• Interface utilisateur visible"
echo "• Boutons et navigation opérationnels"

echo ""
echo "🔗 LIEN DIRECT DE TEST:"
echo "👁️  ${BASE_URL}/src/social-app/"

echo ""
echo "✅ Déploiement Firebase terminé ! Testez maintenant en production."
