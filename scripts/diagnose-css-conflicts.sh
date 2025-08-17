#!/bin/bash

# Script de diagnostic des conflits CSS
# Identifie les problèmes potentiels de charte graphique

echo "🔍 Diagnostic des conflits CSS - Vision Picturale Community"
echo "=========================================================="

cd "$(dirname "$0")/.."

echo ""
echo "1️⃣ Vérification des couleurs hardcodées restantes..."
echo "---------------------------------------------------"
grep -r --include="*.css" --include="*.jsx" --include="*.js" "#[0-9a-fA-F]\{3,6\}" src/social-app/frontend/ | grep -v ":root" | grep -v "variables" || echo "✅ Aucune couleur hardcodée trouvée (hormis dans :root)"

echo ""
echo "2️⃣ Vérification des règles !important..."
echo "----------------------------------------"
grep -r --include="*.css" "!important" src/social-app/frontend/ || echo "✅ Aucune règle !important trouvée"

echo ""
echo "3️⃣ Vérification des styles inline..."
echo "-----------------------------------"
grep -r --include="*.jsx" --include="*.js" "style=" src/social-app/frontend/ | grep -v "progress" || echo "✅ Aucun style inline problématique trouvé"

echo ""
echo "4️⃣ Analyse de l'ordre de chargement des CSS..."
echo "----------------------------------------------"
echo "Ordre d'import dans index.jsx:"
grep -n "import.*css" src/social-app/frontend/index.jsx

echo ""
echo "Imports CSS dans les composants (ordre de chargement potentiellement problématique):"
find src/social-app/frontend -name "*.jsx" -exec grep -l "import.*css" {} \; | while read file; do
  echo "📄 $file:"
  grep -n "import.*css" "$file"
done

echo ""
echo "5️⃣ Vérification des sélecteurs à forte spécificité..."
echo "----------------------------------------------------"
grep -r --include="*.css" -E "\.[\w-]+\.[\w-]+|#[\w-]+\.[\w-]+|\.[\w-]+\.[\w-]+\.[\w-]+" src/social-app/frontend/styles/ || echo "✅ Pas de sélecteurs à forte spécificité problématiques"

echo ""
echo "6️⃣ Vérification des variables CSS utilisées..."
echo "---------------------------------------------"
echo "Variables définies dans :root:"
grep -E "^\s*--[\w-]+:" src/social-app/frontend/styles/index.css | wc -l | xargs echo "Nombre de variables définies:"

echo ""
echo "Utilisation des variables dans les autres fichiers CSS:"
find src/social-app/frontend/styles -name "*.css" ! -name "index.css" -exec grep -l "var(--" {} \; | wc -l | xargs echo "Fichiers utilisant les variables:"

echo ""
echo "7️⃣ Test de base des variables CSS principales..."
echo "-----------------------------------------------"
echo "Vérification de la présence des variables clés:"
for var in "--primary-blue" "--brand-primary" "--brand-dark" "--background" "--card-bg"; do
  if grep -q "$var" src/social-app/frontend/styles/index.css; then
    echo "✅ $var définie"
  else
    echo "❌ $var manquante"
  fi
done

echo ""
echo "8️⃣ Recherche de conflits potentiels..."
echo "-------------------------------------"
echo "Propriétés surchargées potentielles (même propriété définie plusieurs fois):"
grep -r --include="*.css" -E "(background-color|color|border|font-size):\s*var\(" src/social-app/frontend/styles/ | cut -d: -f1-2 | sort | uniq -c | sort -nr | head -10

echo ""
echo "✨ Diagnostic terminé!"
echo ""
echo "🔧 Actions recommandées:"
echo "- Réorganiser les imports CSS si nécessaire"
echo "- Vérifier la spécificité des sélecteurs"
echo "- S'assurer que index.css est chargé en premier"
echo "- Valider visuellement chaque page/composant"
