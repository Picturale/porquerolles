#!/bin/bash

echo "🧪 Test de la navigation anonyme - Vision Picturale"
echo "=================================================="

# Check if the dev server is running
echo "📡 Vérification du serveur de développement..."
if curl -s http://localhost:8007 > /dev/null; then
    echo "✅ Serveur accessible sur localhost:8007"
else
    echo "❌ Serveur non accessible. Démarrez 'npm run dev' d'abord."
    exit 1
fi

echo ""
echo "🔍 Tests à effectuer manuellement :"
echo ""
echo "1. Navigation anonyme :"
echo "   - Allez sur http://localhost:8007/src/social-app/"
echo "   - Vous devriez être redirigé vers /home"
echo "   - Le feed doit être visible SANS connexion"
echo "   - La navbar doit montrer 'Connexion' et 'S'inscrire'"
echo ""
echo "2. Test du bouton 'J'aime' :"
echo "   - Cliquez sur un cœur de publication"
echo "   - Vous devriez être redirigé vers /login"
echo "   - Un message doit apparaître : 'Connectez-vous pour aimer les publications'"
echo ""
echo "3. Test du bouton 'Commenter' :"
echo "   - Cliquez sur l'icône commentaire"
echo "   - Vous devriez être redirigé vers /login"
echo "   - Un message doit apparaître : 'Connectez-vous pour commenter les publications'"
echo ""
echo "4. Test après connexion :"
echo "   - Connectez-vous avec un compte"
echo "   - Retournez au feed"
echo "   - Les boutons J'aime et Commenter doivent fonctionner"
echo "   - La navbar doit montrer : Créer, Profil, Admin (si admin), Déconnexion"
echo ""
echo "5. Test des liens profil :"
echo "   - En mode anonyme, les noms d'utilisateur ne doivent PAS être cliquables"
echo "   - En mode connecté, les noms d'utilisateur doivent être des liens"
echo ""

# Check key files
echo "📁 Vérification des fichiers clés :"
echo ""

if [ -f "src/social-app/frontend/App.jsx" ]; then
    echo "✅ App.jsx existe"
    if grep -q 'path="/home" element={<Home />}' src/social-app/frontend/App.jsx; then
        echo "   ✅ Route /home non protégée"
    else
        echo "   ❌ Route /home pourrait être protégée"
    fi
else
    echo "❌ App.jsx manquant"
fi

if [ -f "src/social-app/frontend/components/PostCard.jsx" ]; then
    echo "✅ PostCard.jsx existe"
    if grep -q 'const handleComment' src/social-app/frontend/components/PostCard.jsx; then
        echo "   ✅ Gestion des commentaires implémentée"
    else
        echo "   ❌ Gestion des commentaires manquante"
    fi
    if grep -q 'navigate.*login.*state.*message' src/social-app/frontend/components/PostCard.jsx; then
        echo "   ✅ Redirection avec message implémentée"
    elif grep -q 'state.*message' src/social-app/frontend/components/PostCard.jsx; then
        echo "   ✅ Redirection avec message implémentée"
    else
        echo "   ❌ Redirection avec message manquante"
    fi
else
    echo "❌ PostCard.jsx manquant"
fi

if [ -f "src/social-app/frontend/components/Navbar.jsx" ]; then
    echo "✅ Navbar.jsx existe"
    if grep -q 'currentUser ?' src/social-app/frontend/components/Navbar.jsx; then
        echo "   ✅ Navigation conditionnelle implémentée"
    else
        echo "   ❌ Navigation conditionnelle manquante"
    fi
else
    echo "❌ Navbar.jsx manquant"
fi

echo ""
echo "🎯 URL de test principale : http://localhost:8007/src/social-app/"
echo ""
echo "📝 Instructions :"
echo "1. Ouvrez l'URL ci-dessus dans votre navigateur"
echo "2. Testez chaque scenario listé ci-dessus"
echo "3. Signalez tout comportement inattendu"
echo ""
echo "🚀 Bonne navigation anonyme !"
