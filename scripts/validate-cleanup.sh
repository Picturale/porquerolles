#!/bin/bash

echo "🧹 VALIDATION POST-NETTOYAGE"
echo "=============================="

# Vérifier la structure
echo "📁 Vérification de la structure..."
if [ -d "src/" ] && [ -d "documentation/" ] && [ -d "scripts/" ] && [ -d "config/" ]; then
    echo "✅ Structure principale présente"
else
    echo "❌ Structure principale manquante"
    exit 1
fi

# Vérifier que les dossiers temporaires ont été supprimés
echo "🗑️ Vérification de l'absence de fichiers temporaires..."
if [ ! -d "project-documentation/" ] && [ ! -d "docs/" ] && [ ! -d "templates/" ]; then
    echo "✅ Dossiers temporaires supprimés"
else
    echo "❌ Des dossiers temporaires existent encore"
    exit 1
fi

# Vérifier que .vscode est préservé
echo "🔧 Vérification de la préservation de .vscode..."
if [ -d ".vscode/" ]; then
    echo "✅ Dossier .vscode préservé"
else
    echo "⚠️  Dossier .vscode absent (normal si pas configuré)"
fi

# Vérifier que le package.json est valide
echo "📦 Vérification du package.json..."
if node -e "require('./package.json')" 2>/dev/null; then
    echo "✅ package.json valide"
else
    echo "❌ package.json invalide"
    exit 1
fi

# Tester le build
echo "🏗️ Test du build..."
if npm run build >/dev/null 2>&1; then
    echo "✅ Build réussi"
else
    echo "❌ Build échoué"
    exit 1
fi

# Vérifier les scripts essentiels
echo "🧪 Vérification des scripts..."
for script in "scripts/generate-tokens.js" "scripts/post-build.js" "scripts/cleanup.sh"; do
    if [ -f "$script" ]; then
        echo "✅ $script présent"
    else
        echo "❌ $script manquant"
        exit 1
    fi
done

# Compter les fichiers à la racine
echo "📊 Comptage des fichiers à la racine..."
file_count=$(find . -maxdepth 1 -type f | wc -l | tr -d ' ')
if [ "$file_count" -le 20 ]; then
    echo "✅ Racine propre ($file_count fichiers)"
else
    echo "⚠️  Racine encombrée ($file_count fichiers)"
fi

echo ""
echo "🎉 NETTOYAGE VALIDÉ AVEC SUCCÈS !"
echo "Structure propre, build fonctionnel, scripts organisés."
echo ""
echo "📚 Prochaines étapes:"
echo "   • Consultez documentation/README.md pour naviguer"
echo "   • Lancez 'npm run dev' pour développer"
echo "   • Utilisez 'npm run test:all' pour tester"
echo ""
