#!/bin/bash

# Script de test pour la navigation par boutons sur iOS

echo "🧪 TEST DE NAVIGATION PAR BOUTONS iOS"
echo "====================================="

IOS_INDEX="./ios/App/App/public/index.html"

if [ ! -f "$IOS_INDEX" ]; then
    echo "❌ ERREUR: Fichier iOS index.html non trouvé"
    exit 1
fi

echo "✅ Fichier iOS index.html trouvé"

# Vérifications spécifiques à la navigation par boutons
echo ""
echo "🔍 VÉRIFICATIONS DE LA NAVIGATION PAR BOUTONS:"

# Vérifier la présence des boutons
if grep -q 'button.*class="app-card".*id="calibrateur-link"' "$IOS_INDEX"; then
    echo "✅ Bouton Calibrateur détecté"
else
    echo "❌ ERREUR: Bouton Calibrateur manquant"
fi

if grep -q 'button.*class="app-card".*id="communaute-link"' "$IOS_INDEX"; then
    echo "✅ Bouton Communauté détecté"
else
    echo "❌ ERREUR: Bouton Communauté manquant"
fi

# Vérifier les data-target
if grep -q 'data-target="/src/core-app/"' "$IOS_INDEX"; then
    echo "✅ Data-target Calibrateur correct"
else
    echo "❌ ERREUR: Data-target Calibrateur incorrect"
fi

if grep -q 'data-target="/src/social-app/"' "$IOS_INDEX"; then
    echo "✅ Data-target Communauté correct"
else
    echo "❌ ERREUR: Data-target Communauté incorrect"
fi

# Vérifier la présence des gestionnaires d'événements
if grep -q 'navigateToApp' "$IOS_INDEX"; then
    echo "✅ Fonction de navigation détectée"
else
    echo "❌ ERREUR: Fonction de navigation manquante"
fi

if grep -q 'addEventListener.*click' "$IOS_INDEX"; then
    echo "✅ Gestionnaires de clic détectés"
else
    echo "❌ ERREUR: Gestionnaires de clic manquants"
fi

if grep -q 'addEventListener.*touchend' "$IOS_INDEX"; then
    echo "✅ Gestionnaires tactiles détectés"
else
    echo "❌ ERREUR: Gestionnaires tactiles manquants"
fi

# Vérifier l'absence d'anciens liens <a href>
if grep -q '<a href="/src/' "$IOS_INDEX"; then
    echo "⚠️ ATTENTION: Anciens liens <a href> détectés - peuvent causer des problèmes"
else
    echo "✅ Pas d'anciens liens <a href> problématiques"
fi

echo ""
echo "📊 RÉSUMÉ:"
echo "=========="

# Compter les éléments
button_count=$(grep -c 'button.*class="app-card"' "$IOS_INDEX")
target_count=$(grep -c 'data-target="/src/' "$IOS_INDEX")
nav_functions=$(grep -c 'navigateToApp' "$IOS_INDEX")

echo "• Boutons d'application: $button_count/2"
echo "• Cibles de navigation: $target_count/2"
echo "• Fonctions de navigation: $nav_functions"

if [ "$button_count" -eq 2 ] && [ "$target_count" -eq 2 ] && [ "$nav_functions" -gt 0 ]; then
    echo ""
    echo "🚀 SUCCÈS: Navigation par boutons correctement configurée!"
    echo ""
    echo "🧪 PROCHAINES ÉTAPES DE TEST:"
    echo "1. Ouvrez l'app iOS: npx cap open ios"
    echo "2. Lancez l'app sur un simulateur"
    echo "3. Testez le clic sur 'Calibrateur'"
    echo "4. Vérifiez que l'app se charge sans rechargement de page"
    echo "5. Revenez en arrière et testez 'Communauté'"
else
    echo ""
    echo "❌ PROBLÈME: Configuration incomplète"
    echo "Exécutez: npm run fix:ios"
fi
