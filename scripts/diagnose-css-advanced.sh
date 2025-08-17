#!/bin/bash

# Script de diagnostic des conflits CSS
echo "🔍 Diagnostic approfondi CSS - Vision Picturale Community"
echo "=========================================================="

cd "$(dirname "$0")/.."

echo ""
echo "1️⃣ Analyse des variables CSS définies..."
echo "----------------------------------------"
echo "Variables trouvées dans index.css :"
grep -n "--" src/social-app/frontend/styles/index.css | head -20

echo ""
echo "2️⃣ Vérification des couleurs hardcodées..."
echo "-------------------------------------------"
echo "CSS files avec couleurs hardcodées (hors :root) :"
find src/social-app/frontend -name "*.css" -exec grep -l "#[0-9a-fA-F]" {} \; | while read file; do
  echo "📁 $file :"
  grep -n "#[0-9a-fA-F]\{3,6\}" "$file" | grep -v ":root" | head -3
done

echo ""
echo "3️⃣ Analyse des imports CSS dans les composants..."
echo "------------------------------------------------"
echo "Ordre d'import des CSS :"
find src/social-app/frontend -name "*.jsx" -exec grep -l "\.css" {} \; | while read file; do
  echo "📄 $file :"
  grep "import.*\.css" "$file"
done

echo ""
echo "4️⃣ Variables non utilisées dans index.css..."
echo "--------------------------------------------"
# Extract all variables from index.css
index_vars=$(grep -o -- '--[a-zA-Z-]*' src/social-app/frontend/styles/index.css | sort -u)

echo "Variables définies dans index.css :"
echo "$index_vars"

echo ""
echo "Variables potentiellement non utilisées :"
for var in $index_vars; do
  usage_count=$(find src/social-app/frontend -name "*.css" -exec grep -l "var($var)" {} \; | wc -l)
  if [ $usage_count -eq 0 ]; then
    echo "⚠️  $var (non utilisée)"
  fi
done

echo ""
echo "5️⃣ Variables manquantes (utilisées mais non définies)..."
echo "------------------------------------------------------"
find src/social-app/frontend -name "*.css" -exec grep -o "var(--[a-zA-Z-]*)" {} \; | sort -u | while read var_usage; do
  var_name=$(echo "$var_usage" | sed 's/var(\(.*\))/\1/')
  if ! grep -q "$var_name" src/social-app/frontend/styles/index.css; then
    echo "❌ $var_name (utilisée mais non définie)"
  fi
done

echo ""
echo "6️⃣ Analyse des spécificités CSS conflictuelles..."
echo "------------------------------------------------"
echo "Règles avec !important :"
find src/social-app/frontend -name "*.css" -exec grep -n "!important" {} \; || echo "✅ Aucune règle !important trouvée"

echo ""
echo "7️⃣ Vérification cohérence des couleurs brand..."
echo "----------------------------------------------"
echo "Usage de brand-primary :"
find src/social-app/frontend -name "*.css" -exec grep -n "brand-primary" {} \;

echo ""
echo "Usage de primary-blue :"
find src/social-app/frontend -name "*.css" -exec grep -n "primary-blue" {} \;

echo ""
echo "✅ Diagnostic terminé !"
