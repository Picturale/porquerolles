#!/bin/bash

echo "🔄 Vérification du déploiement et vidage du cache"
echo "=============================================="

cd "$(dirname "$0")/.."

echo ""
echo "🏗️ Build et déploiement récent..."
npm run build:social
firebase deploy --only hosting --force

echo ""
echo "🌐 Test des URLs en production (post-déploiement)..."

# Fonction pour vérifier si une URL répond avec un timestamp pour éviter le cache
check_url_no_cache() {
    local url=$1
    local name=$2
    local timestamp=$(date +%s)
    
    if curl -s "${url}?v=${timestamp}" > /dev/null; then
        echo "✅ $name: OK"
    else
        echo "❌ $name: ERREUR"
    fi
}

check_url_no_cache "https://vision-picturale-community.web.app" "Application principale"
check_url_no_cache "https://vision-picturale-community.web.app/admin" "Page admin" 
check_url_no_cache "https://vision-picturale-community.web.app/login" "Page de connexion"

echo ""
echo "🎨 Vérification des assets CSS en production..."

# Vérifier que le nouveau CSS est déployé
css_url="https://vision-picturale-community.web.app/assets/main-Bi2J-cS0.css"
echo "📄 Vérification du fichier CSS: $css_url"

if curl -s "$css_url" | grep -q "brand-primary.*#ff6b35"; then
    echo "✅ Variables CSS de la charte graphique détectées en production"
else
    echo "⚠️ Variables CSS potentiellement non mises à jour en production"
fi

echo ""
echo "🧹 Instructions pour vider le cache du navigateur:"
echo "   Chrome/Safari: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (PC)"
echo "   Firefox: Cmd+F5 (Mac) ou Ctrl+F5 (PC)"
echo "   Ou: Ouvrir les DevTools → Clic droit sur rafraîchir → Vider le cache et recharger"

echo ""
echo "🔍 Pour tester avec un navigateur privé:"
echo "   Chrome: Cmd+Shift+N (Mac) ou Ctrl+Shift+N (PC)"
echo "   Firefox: Cmd+Shift+P (Mac) ou Ctrl+Shift+P (PC)"
echo "   Safari: Cmd+Shift+N (Mac)"

echo ""
echo "📱 URLs à tester:"
echo "   🌍 Production: https://vision-picturale-community.web.app"
echo "   🏠 Local: http://localhost:3001"

echo ""
echo "✅ Déploiement forcé terminé!"
echo "💡 Si les changements ne sont pas visibles, videz le cache de votre navigateur"
