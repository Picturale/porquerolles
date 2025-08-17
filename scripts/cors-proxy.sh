#!/bin/bash

# Script pour lancer un proxy CORS local
echo "🚀 Lancement du proxy CORS pour le développement..."

# Installer cors-anywhere si nécessaire
if ! command -v cors-anywhere &> /dev/null; then
    echo "📦 Installation de cors-anywhere..."
    npm install -g cors-anywhere
fi

# Lancer le proxy sur le port 8080
echo "🌐 Proxy CORS disponible sur http://localhost:8080"
echo "📺 Utilisation: http://localhost:8080/[URL_FIREBASE]"

cors-anywhere --port 8080
