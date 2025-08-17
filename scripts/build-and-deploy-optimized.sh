#!/bin/bash

# Script optimisé pour build et déploiement
echo "🚀 Build et déploiement optimisé - Vision Picturale"
echo "=================================================="

# Set working directory to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
echo "Working directory: $PROJECT_ROOT"

# Fonction pour afficher les erreurs
error_exit() {
    echo "❌ Erreur: $1" >&2
    exit 1
}

# Fonction pour afficher les succès
success_msg() {
    echo "✅ $1"
}

# Étape 1: Nettoyage des anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist/
rm -rf src/social-app/frontend/dist/
success_msg "Nettoyage terminé"

# Étape 2: Build de la social app frontend
echo "🏗️ Build de la social app frontend..."
cd src/social-app/frontend
npm install --silent || error_exit "Erreur installation dépendances frontend"
npm run build || error_exit "Erreur build frontend"
success_msg "Frontend build terminé"

# Étape 3: Build principal avec Vite
echo "🏗️ Build principal avec Vite..."
cd "$PROJECT_ROOT"
npm run build:social || error_exit "Erreur build social"
success_msg "Build social terminé"

# Étape 4: Optimisation structure complète
echo "📦 Optimisation de la structure complète..."
mkdir -p dist/social-app

# Copie de la landing page
cp src/index.html dist/index.html

# Copie de l'app core
cp -r src/core-app dist/

# Copie des assets
cp -r src/assets dist/
cp src/social-app/frontend/assets/logo2.png dist/assets/
cp src/social-app/frontend/assets/logo-a63a4dfb.jpg dist/assets/

# Copie directe du build React (pas de redirection)
cp -r src/social-app/frontend/dist/* dist/social-app/
success_msg "Structure complète optimisée"

# Étape 5: Mise à jour des chemins et configuration
echo "🔧 Mise à jour des chemins..."
# Correction du base path dans index.html
sed -i '' 's|="/assets/|="/social-app/assets/|g' dist/social-app/index.html
sed -i '' 's|href="/assets/|href="/social-app/assets/|g' dist/social-app/index.html
success_msg "Chemins mis à jour"

# Étape 6: Mise à jour firebase.json pour une meilleure gestion
echo "🔥 Mise à jour configuration Firebase..."
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(css|js|html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          },
          {
            "key": "Pragma",
            "value": "no-cache"
          },
          {
            "key": "Expires",
            "value": "0"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|gif|ico|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=86400"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/",
        "destination": "/index.html"
      },
      {
        "source": "/core-app/**",
        "destination": "/core-app/index.html"
      },
      {
        "source": "/social-app/**",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/home",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/login",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/register",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/profile/**",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/create",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/chat",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/edit-profile",
        "destination": "/social-app/index.html"
      },
      {
        "source": "/admin/**",
        "destination": "/social-app/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "config/firestore.rules",
    "indexes": "config/firestore.indexes.json"
  }
}
EOF
success_msg "Configuration Firebase mise à jour"

# Étape 7: Déploiement Firebase
echo "🚀 Déploiement Firebase..."
firebase deploy --only hosting,firestore:rules || error_exit "Erreur déploiement"
success_msg "Déploiement terminé"

# Étape 8: Vérification
echo "🔍 Vérification du déploiement..."
echo "Landing page: https://vision-picturale-community.web.app/"
echo "Core app: https://vision-picturale-community.web.app/core-app/"
echo "Social app: https://vision-picturale-community.web.app/social-app/"
echo "Home direct: https://vision-picturale-community.web.app/home"

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "🎉 La structure est maintenant optimisée sans redirections"
echo "🎉 Les routes sont directes et rechargeables"
