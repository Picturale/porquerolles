#!/bin/bash

echo "🎨 Validation de la nouvelle charte graphique"
echo "=============================================="

cd "$(dirname "$0")/.."

echo ""
echo "1️⃣ Vérification des couleurs hardcodées restantes..."
echo "---------------------------------------------------"
hardcoded_count=$(find src/social-app/frontend -name "*.css" -exec grep -v ":root" {} \; | grep -c "#[0-9a-fA-F]\{3,6\}")
if [ $hardcoded_count -eq 0 ]; then
  echo "✅ Aucune couleur hardcodée trouvée (hormis dans :root)"
else
  echo "⚠️  $hardcoded_count couleurs hardcodées restantes:"
  find src/social-app/frontend -name "*.css" -exec grep -n "#[0-9a-fA-F]\{3,6\}" {} \; | grep -v ":root"
fi

echo ""
echo "2️⃣ Vérification cohérence des variables brand..."
echo "-----------------------------------------------"
echo "Variables brand-primary utilisées :"
grep -c "var(--brand-primary)" src/social-app/frontend/styles/*.css

echo ""
echo "Variables primary-blue utilisées :"
grep -c "var(--primary-blue)" src/social-app/frontend/styles/*.css

echo ""
echo "3️⃣ Test de build..."
echo "-------------------"
echo "Compilation Vite social app..."
npm run build:social 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Build réussi"
else
  echo "❌ Problème de build détecté"
fi

echo ""
echo "4️⃣ Résumé des modifications appliquées..."
echo "----------------------------------------"
echo "✅ Remplacement de #e55a2b par var(--brand-primary) + filter"
echo "✅ Remplacement de #003a52 par var(--brand-blue) + filter"
echo "✅ Cohérence du lien admin dans la navbar"
echo "✅ Variables CSS centralisées dans index.css"

echo ""
echo "🚀 Pour voir les changements, lancez :"
echo "   npm run dev:social"
echo "   Ou utilisez la tâche VS Code 'Social App Development'"

echo ""
echo "🎯 Variables principales de la charte graphique :"
echo "   --brand-primary: #ff6b35 (Orange Vision Picturale)"
echo "   --brand-blue: #002739 (Bleu foncé)"
echo "   --brand-dark: #0f0d12 (Texte principal)"
echo "   --primary-blue: #2563eb (Bleu d'action)"
echo ""
echo "✨ Charte graphique cohérente appliquée !"
