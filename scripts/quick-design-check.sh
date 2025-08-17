#!/bin/bash

# Script de vérification rapide de la charte graphique
echo "🎨 Vérification Rapide - Charte Graphique Vision Picturale"
echo "=========================================================="

cd "$(dirname "$0")/.."

# Comptage des couleurs hardcodées (excluant :root)
hardcoded_count=$(find src/social-app/frontend -name "*.css" -exec grep -v ":root" {} \; | grep -c "#[0-9a-fA-F]\{3,6\}" 2>/dev/null || echo "0")

echo ""
if [ "$hardcoded_count" -eq 0 ]; then
  echo "✅ SUCCÈS: Aucune couleur hardcodée détectée"
else
  echo "⚠️  ATTENTION: $hardcoded_count couleurs hardcodées trouvées"
  echo "Exécutez ./scripts/diagnose-css-advanced.sh pour plus de détails"
fi

# Vérification des variables principales
brand_primary_count=$(grep -r "var(--brand-primary)" src/social-app/frontend/styles/ | wc -l)
primary_blue_count=$(grep -r "var(--primary-blue)" src/social-app/frontend/styles/ | wc -l)

echo ""
echo "📊 Usage des variables principales :"
echo "   --brand-primary: $brand_primary_count utilisations"
echo "   --primary-blue: $primary_blue_count utilisations"

# Test de build rapide
echo ""
echo "🔧 Test de build..."
if npm run build:social > /dev/null 2>&1; then
  echo "✅ Build réussi"
else
  echo "❌ Problème de build"
fi

echo ""
echo "🎯 Statut: $([ "$hardcoded_count" -eq 0 ] && echo "Charte graphique cohérente ✅" || echo "Corrections nécessaires ⚠️")"
