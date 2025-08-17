#!/bin/bash

echo "🔍 Debug navigation anonyme"
echo "=========================="

# Vérifier si le serveur répond
echo "📡 Test serveur local..."
if curl -s http://localhost:8007/src/social-app/ > /dev/null; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible"
    exit 1
fi

# Vérifier la structure HTML de base
echo ""
echo "🔍 Contenu de la page..."
PAGE_CONTENT=$(curl -s http://localhost:8007/src/social-app/)

if echo "$PAGE_CONTENT" | grep -q "Vision Picturale"; then
    echo "✅ Titre de l'app trouvé"
else
    echo "❌ Titre de l'app non trouvé"
fi

if echo "$PAGE_CONTENT" | grep -q "root"; then
    echo "✅ Div root trouvé"
else
    echo "❌ Div root non trouvé"
fi

echo ""
echo "📊 Taille de la réponse: $(echo "$PAGE_CONTENT" | wc -c) bytes"

# Afficher un extrait du contenu
echo ""
echo "📄 Extrait du HTML:"
echo "$PAGE_CONTENT" | head -20

echo ""
echo "🌐 Pour tester manuellement:"
echo "   Ouvrir: http://localhost:8007/src/social-app/"
echo "   Ouvrir les outils développeur (F12)"
echo "   Vérifier la console pour les logs d'authentification"
