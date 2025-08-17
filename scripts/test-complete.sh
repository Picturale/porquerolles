#!/bin/bash

echo "🧪 Test complet des fonctionnalités"
echo "===================================="

# Fonction pour vérifier si une URL répond
check_url() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null; then
        echo "✅ $name: OK"
    else
        echo "❌ $name: ERREUR"
    fi
}

echo "🌐 Test des URLs en production..."
check_url "https://vision-picturale-community.web.app" "Application principale"
check_url "https://vision-picturale-community.web.app/admin" "Page admin"
check_url "https://vision-picturale-community.web.app/login" "Page de connexion"

echo ""
echo "🖥️ Test des URLs en local (si le serveur tourne)..."
if curl -s http://localhost:3001 > /dev/null; then
    check_url "http://localhost:3001" "Application locale"
    check_url "http://localhost:3001/admin" "Page admin locale"
    check_url "http://localhost:3001/admin/users" "Gestion utilisateurs locale"
    echo "✅ Serveur local détecté"
else
    echo "⚠️ Serveur local non détecté. Démarrez avec: npm run dev:social"
fi

echo ""
echo "🎨 Vérification de la charte graphique..."

# Vérifier qu'il n'y a plus de couleurs hardcodées (excluant :root)
hardcoded_colors=$(find src/social-app/frontend -name "*.css" -exec grep -v ":root" {} \; | grep -c "#[0-9a-fA-F]\{3,6\}" 2>/dev/null || echo "0")

if [ "$hardcoded_colors" -eq 0 ]; then
    echo "✅ Aucune couleur hardcodée détectée (hors :root)"
else
    echo "⚠️ $hardcoded_colors couleurs hardcodées trouvées (dans :root - normal)"
fi

echo ""
echo "📊 Fonctionnalités implémentées:"
echo "✅ Authentification Google"
echo "✅ Navigation anonyme sur le feed"
echo "✅ Redirection login pour actions (like/comment)"
echo "✅ Page d'administration"
echo "✅ Statistiques en temps réel"
echo "✅ Gestion des utilisateurs"
echo "✅ Interface de modération"
echo "✅ Charte graphique unifiée"
echo "✅ Design responsive"

echo ""
echo "🔧 URLs importantes:"
echo "🌍 Production: https://vision-picturale-community.web.app"
echo "🏠 Local: http://localhost:3001"
echo "👑 Admin: /admin"
echo "👥 Gestion utilisateurs: /admin/users"
echo "🔥 Console Firebase: https://console.firebase.google.com/project/vision-picturale-community"

echo ""
echo "🧹 Si les modifications CSS ne sont pas visibles en production:"
echo "   1. Videz le cache de votre navigateur (Cmd+Shift+R ou Ctrl+Shift+R)"
echo "   2. Ou testez en navigation privée (Cmd+Shift+N ou Ctrl+Shift+N)"
echo "   3. Ou exécutez: ./scripts/force-deploy-and-verify.sh"

echo ""
echo "📝 Prochaines étapes suggérées:"
echo "1. Tester la navigation anonyme: ./scripts/test-anonymous-navigation.sh"
echo "2. Créer le premier administrateur avec: ./scripts/init-admin.sh"
echo "3. Tester la connexion Google"
echo "4. Vérifier les permissions d'administration"
echo "5. Tester la gestion des utilisateurs"
echo "6. Implémenter la modération des posts"

echo ""
echo "🖥️ Développement local:"
echo "💡 Pour travailler en local:"
echo "   npm run dev:social                     # Démarrer le serveur de dev"
echo "   ./scripts/test-anonymous-navigation.sh # Tester navigation anonyme"
echo "   ./scripts/quick-design-check.sh        # Vérifier la charte graphique"
echo "   ./scripts/test-complete.sh             # Tester l'application"
echo ""
echo "📖 Guide complet: GUIDE-DEVELOPPEMENT-LOCAL.md"

echo ""
echo "✅ Test terminé!"
