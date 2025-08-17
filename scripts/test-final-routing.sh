#!/bin/bash

# Test final du routage - Social App
echo "🔍 Test final du routage pour la Social App"
echo "==========================================="

# Variables
FIREBASE_URL="https://vision-picturale-community.web.app"
ROUTES=(
    "/"
    "/home"
    "/login"
    "/social-app"
    "/social-app/"
    "/index.html"
    "/src/social-app"
    "/nonexistent-page"
)

echo "📡 Test des routes principales..."
echo ""

for route in "${ROUTES[@]}"; do
    echo "🌐 Test de: $FIREBASE_URL$route"
    
    # Test HTTP status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL$route")
    
    if [ "$status" = "200" ]; then
        echo "   ✅ Status: $status (OK)"
        
        # Vérifier le contenu pour s'assurer qu'il ne s'agit pas d'une erreur 404 servie en 200
        content=$(curl -s "$FIREBASE_URL$route")
        
        if echo "$content" | grep -q "React App"; then
            echo "   ✅ Contenu: Application React détectée"
        elif echo "$content" | grep -q "<!DOCTYPE html>"; then
            echo "   ⚠️  Contenu: HTML valide mais vérification nécessaire"
        else
            echo "   ❌ Contenu: Contenu inattendu"
        fi
        
        # Vérifier si c'est une vraie erreur 404
        if echo "$content" | grep -q -i "not found\|404\|page not found"; then
            echo "   ⚠️  Attention: Contenu indique une erreur 404 malgré le status 200"
        fi
        
    else
        echo "   ❌ Status: $status (Erreur)"
    fi
    
    echo ""
done

echo "🏠 Test spécifique de la page d'accueil..."
echo "========================================"

# Test plus approfondi de la page d'accueil
echo "📥 Récupération du contenu de la page d'accueil..."
home_content=$(curl -s "$FIREBASE_URL/")

echo "🔍 Analyse du contenu..."

if echo "$home_content" | grep -q "Vision Picturale"; then
    echo "✅ Titre de l'application trouvé"
else
    echo "❌ Titre de l'application manquant"
fi

if echo "$home_content" | grep -q "react"; then
    echo "✅ Références React détectées"
else
    echo "❌ Références React manquantes"
fi

if echo "$home_content" | grep -q "main.jsx\|index.jsx"; then
    echo "✅ Point d'entrée de l'application trouvé"
else
    echo "❌ Point d'entrée de l'application manquant"
fi

# Sauvegarder le contenu pour inspection
echo "$home_content" > /tmp/home-content.html
echo "📄 Contenu sauvegardé dans /tmp/home-content.html"

echo ""
echo "🎯 Résumé du test de routage"
echo "============================"
echo "Si tous les tests montrent des status 200 avec du contenu React valide,"
echo "alors le problème de routage est résolu."
echo ""
echo "🔗 URL de test principal: $FIREBASE_URL"
echo "📁 Fichier de log: /tmp/home-content.html"
