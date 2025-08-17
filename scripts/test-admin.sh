#!/bin/bash

echo "🧪 Test de la page Admin"
echo "======================="

echo "🌐 Ouverture de l'application en local..."
echo "URL: http://localhost:3001/admin"

# Vérifier si le serveur tourne
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Le serveur de développement ne semble pas fonctionner."
    echo "Démarrez-le avec: npm run dev:social"
    exit 1
fi

echo "✅ Serveur détecté sur le port 3001"
echo ""
echo "📋 Instructions de test:"
echo "1. Ouvrez http://localhost:3001/admin dans votre navigateur"
echo "2. Testez la connexion par email/mot de passe"
echo "3. Testez la connexion avec Google"
echo "4. Vérifiez que seuls les admins peuvent accéder au tableau de bord"
echo ""
echo "🔧 Pour créer un admin, utilisez:"
echo "   ./scripts/init-admin.sh"
