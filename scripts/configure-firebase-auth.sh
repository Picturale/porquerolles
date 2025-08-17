#!/bin/bash
# Script pour configurer Firebase Auth pour le développement local

echo "🔧 Configuration Firebase Auth pour le développement local"
echo "=============================================="

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "Installez avec: npm install -g firebase-tools"
    exit 1
fi

# Se connecter à Firebase
echo "🔑 Connexion à Firebase..."
firebase login

# Sélectionner le projet
echo "📋 Sélection du projet..."
firebase use vision-picturale-community

# Informations sur la configuration manuelle
echo ""
echo "📝 Configuration manuelle requise:"
echo "1. Allez sur https://console.firebase.google.com/project/vision-picturale-community/authentication/settings"
echo "2. Dans 'Domaines autorisés', ajoutez:"
echo "   - localhost"
echo "   - 127.0.0.1"
echo "3. Activez les méthodes de connexion nécessaires dans l'onglet 'Sign-in method'"
echo ""
echo "🌐 URL de configuration directe:"
echo "https://console.firebase.google.com/project/vision-picturale-community/authentication/settings"
echo ""
echo "✅ Une fois configuré, rechargez votre application locale"
