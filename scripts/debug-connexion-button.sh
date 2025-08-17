#!/bin/bash

echo "🔍 Test rapide du bouton de connexion anonyme"
echo "============================================="

echo ""
echo "📡 Vérification du serveur..."
if curl -s http://localhost:8007 > /dev/null; then
    echo "✅ Serveur accessible sur localhost:8007"
else
    echo "❌ Serveur non accessible"
    exit 1
fi

echo ""
echo "🧪 Test direct de l'application:"
echo "1. Ouvrez votre navigateur sur: http://localhost:8007/src/social-app/"
echo "2. Ouvrez les outils développeur (F12)"
echo "3. Dans la console, cherchez les logs de la Navbar:"
echo "   - '🧭 Navbar rendered'"
echo "   - '👤 Current user in Navbar: null' (pour utilisateur anonyme)"
echo "   - '⏳ Loading state in Navbar: false' (loading doit être false)"
echo ""
echo "4. Si le bouton 'Connexion' n'apparaît pas, vérifiez:"
echo "   - Que loading = false"
echo "   - Que currentUser = null"
echo "   - Que la condition !loading && currentUser ? ... : ... fonctionne"
echo ""
echo "🎯 URL de test: http://localhost:8007/src/social-app/"
echo ""
echo "💡 Si le problème persiste:"
echo "   - Vérifiez la console pour les erreurs JavaScript"
echo "   - Rechargez la page avec Cmd+Shift+R (cache hard refresh)"
echo "   - Vérifiez que Firebase Auth n'est pas en mode 'persistance'"
