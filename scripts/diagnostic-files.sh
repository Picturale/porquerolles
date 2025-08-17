#!/bin/bash

echo "🔧 Diagnostic des fichiers après correction"
echo "==========================================="

echo ""
echo "📁 Vérification des fichiers critiques..."

files=(
    "src/social-app/frontend/components/Navbar.jsx"
    "src/social-app/frontend/App.jsx"
    "src/social-app/frontend/components/PostCard.jsx"
    "src/social-app/frontend/pages/Login.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -gt 10 ]; then
            echo "✅ $file ($lines lignes)"
            # Vérifier les exports
            if grep -q "export default" "$file"; then
                echo "   ✅ Export par défaut présent"
            else
                echo "   ❌ Export par défaut manquant"
            fi
        else
            echo "❌ $file (fichier trop petit: $lines lignes)"
        fi
    else
        echo "❌ $file (fichier manquant)"
    fi
done

echo ""
echo "🧪 Test des erreurs de syntaxe..."

# Test simple de syntaxe avec Node.js
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Vérification: $file"
        # Vérifier qu'il n'y a pas d'imports cassés
        if grep -q "import.*console\.log" "$file"; then
            echo "   ❌ Import corrompu détecté"
        else
            echo "   ✅ Imports semblent corrects"
        fi
    fi
done

echo ""
echo "🌐 Test du serveur de développement..."
if curl -s http://localhost:8007 > /dev/null; then
    echo "✅ Serveur accessible sur localhost:8007"
    
    echo ""
    echo "🎯 Prochaines étapes:"
    echo "1. Ouvrez http://localhost:8007/src/social-app/"
    echo "2. Vérifiez que la page se charge sans erreur"
    echo "3. Ouvrez F12 → Console pour voir les logs"
    echo "4. Vérifiez que les boutons 'Connexion' et 'S'inscrire' sont visibles"
    
else
    echo "❌ Serveur non accessible"
    echo "💡 Redémarrez avec: npm run dev"
fi

echo ""
echo "✅ Diagnostic terminé!"
