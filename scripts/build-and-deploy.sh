#!/bin/bash

# Script de build et déploiement complet
echo "🚀 Build et déploiement complet des applications"

# Configuration
PROJECT_ROOT=$(pwd)
SOCIAL_APP_DIR="$PROJECT_ROOT/src/social-app/frontend"
CORE_APP_DIR="$PROJECT_ROOT/src/core-app"
DIST_DIR="$PROJECT_ROOT/dist"

# Nettoyage du dossier dist
echo "🧹 Nettoyage du dossier dist..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Build de la Social App
echo "🏗️ Build de la Social App..."
cd "$SOCIAL_APP_DIR"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build de la Social App"
    exit 1
fi

# Copier les fichiers de la Social App dans dist
echo "📦 Copie des fichiers de la Social App..."
cp -r "$SOCIAL_APP_DIR/dist/"* "$DIST_DIR/"

# Copier la Core App
echo "📦 Copie de la Core App..."
mkdir -p "$DIST_DIR/core-app"
cp -r "$CORE_APP_DIR/"* "$DIST_DIR/core-app/"

# Créer un index.html de redirection à la racine si nécessaire
if [ ! -f "$DIST_DIR/index.html" ]; then
    echo "📄 Création d'un index.html de redirection..."
    cat > "$DIST_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vision Picturale - Applications</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .apps {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .app-card {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 1.5rem;
            text-decoration: none;
            color: white;
            transition: all 0.3s ease;
            min-width: 180px;
        }
        .app-card:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        .app-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .app-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .app-description {
            font-size: 0.9rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎨 Vision Picturale</div>
        <div class="subtitle">Choisissez votre application</div>
        <div class="apps">
            <a href="/social-app" class="app-card">
                <div class="app-icon">📱</div>
                <div class="app-name">Social App</div>
                <div class="app-description">Réseau social photographique</div>
            </a>
            <a href="/core-app" class="app-card">
                <div class="app-icon">🔧</div>
                <div class="app-name">Core App</div>
                <div class="app-description">Calibration d'impression</div>
            </a>
        </div>
    </div>
</body>
</html>
EOF
fi

echo "✅ Build terminé!"
echo "📁 Fichiers prêts dans: $DIST_DIR"
echo "🌐 Social App: $DIST_DIR/index.html"
echo "🔧 Core App: $DIST_DIR/core-app/index.html"

# Déploiement sur Firebase
echo "🚀 Déploiement sur Firebase..."
cd "$PROJECT_ROOT"

# Vérification de la connexion Firebase
if ! firebase projects:list > /dev/null 2>&1; then
    echo "❌ Erreur de connexion Firebase. Connectez-vous avec:"
    echo "firebase login"
    exit 1
fi

# Déploiement
firebase deploy
if [ $? -eq 0 ]; then
    echo "✅ Déploiement terminé avec succès!"
    echo "🌐 URL: https://$(firebase use --print).web.app"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
