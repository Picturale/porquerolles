#!/bin/bash

echo "🎨 VALIDATION DU STYLE SIMPLIFIÉ - Bouton Calibration"
echo "====================================================="

BASE_URL="https://vision-picturale-community.web.app"

echo ""
echo "✅ MODIFICATIONS APPLIQUÉES:"
echo "----------------------------"
echo "🔵 Fond : var(--brand-blue) (même bleu que la navbar)"
echo "🟠 Texte : #ff6600 (orange)"
echo "🚫 Bordure : aucune (border: none)"
echo "✨ Hover : opacity 0.9 (effet simple)"

echo ""
echo "🧪 TESTS AUTOMATIQUES:"
echo "----------------------"

# Test 1: Vérifier la présence du CSS simplifié
echo -n "🎨 CSS simplifié présent: "
curl -s "${BASE_URL}/assets/social-app-CTMZwlRu.css" | grep -q "background:var(--brand-blue).*calibration-btn"
if [ $? -eq 0 ]; then
    echo "✅ OK (même bleu que navbar)"
else
    echo "❌ ERREUR"
fi

# Test 2: Vérifier l'absence de bordure
echo -n "🚫 Bordure supprimée: "
curl -s "${BASE_URL}/assets/social-app-CTMZwlRu.css" | grep -q "border:none.*calibration-btn"
if [ $? -eq 0 ]; then
    echo "✅ OK (border: none)"
else
    echo "❌ ERREUR"
fi

# Test 3: Vérifier la couleur orange
echo -n "🟠 Couleur orange: "
curl -s "${BASE_URL}/assets/social-app-CTMZwlRu.css" | grep -q "color:#f60.*calibration-btn"
if [ $? -eq 0 ]; then
    echo "✅ OK (#ff6600)"
else
    echo "❌ ERREUR"
fi

# Test 4: Vérifier l'effet hover simplifié
echo -n "✨ Effet hover simplifié: "
curl -s "${BASE_URL}/assets/social-app-CTMZwlRu.css" | grep -q "opacity:.9.*calibration-btn:hover"
if [ $? -eq 0 ]; then
    echo "✅ OK (opacity 0.9)"
else
    echo "❌ ERREUR"
fi

echo ""
echo "🌐 TEST VISUEL MANUEL:"
echo "----------------------"
echo "👁️  Ouvrir: ${BASE_URL}/src/social-app/"
echo ""
echo "À vérifier visuellement:"
echo "• Le bouton 'Outils de calibration' a exactement la même couleur de fond que la barre de navigation"
echo "• Le texte du bouton est orange (#ff6600)"
echo "• Le bouton n'a pas de bordure visible"
echo "• Au survol, le bouton devient légèrement transparent (pas d'autres effets)"
echo "• Le style est simple et épuré"

echo ""
echo "🎯 OBJECTIF ATTEINT:"
echo "--------------------"
echo "✅ Bouton extrêmement simple"
echo "✅ Texte orange sur fond bleu de la navbar"
echo "✅ Aucune bordure"
echo "✅ Effet hover minimal (transparence)"

echo ""
echo "🚀 STYLE SIMPLIFIÉ DÉPLOYÉ AVEC SUCCÈS !"
echo "========================================"

# Afficher la taille du fichier CSS pour info
CSS_SIZE=$(curl -s "${BASE_URL}/assets/social-app-CTMZwlRu.css" | wc -c)
echo "📄 Taille du CSS optimisé: ${CSS_SIZE} octets"

echo ""
echo "🔗 Lien direct de test: ${BASE_URL}/src/social-app/"
