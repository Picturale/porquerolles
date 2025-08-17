#!/bin/bash

# 📚 Script de Migration de Documentation
# Consolide /project-documentation/ et /docs/ vers /documentation/

echo "🚀 Migration de la documentation vers /documentation/"

# Créer les dossiers de destination s'ils n'existent pas
mkdir -p documentation/{architecture,development,technical,features,api,migration,assets/{images,diagrams,screenshots}}

# Migration de project-documentation/ vers technical/
echo "📁 Migration de project-documentation/ vers documentation/technical/"
cp project-documentation/TECH-STACK.md documentation/technical/tech-stack.md
cp project-documentation/CONFIGURATION.md documentation/technical/configuration.md
cp project-documentation/FIREBASE-CONFIG.md documentation/technical/firebase.md

# Migration vers architecture/
echo "📁 Migration vers documentation/architecture/"
cp project-documentation/ARCHITECTURE.md documentation/architecture/overview.md
cp project-documentation/PROJECT-TREE.md documentation/architecture/modules.md

# Migration vers development/
echo "📁 Migration vers documentation/development/"
cp project-documentation/BUILD-SCRIPTS.md documentation/development/build-system.md
cp project-documentation/ROUTING.md documentation/development/routing.md

# Migration vers features/
echo "📁 Migration vers documentation/features/"
cp project-documentation/BUSINESS-FEATURES.md documentation/features/calibration.md

# Migration de docs/ vers migration/
echo "📁 Migration de docs/ vers documentation/migration/"
cp docs/REORGANIZATION-SUCCESS.md documentation/migration/reorganization.md
cp docs/DOCUMENTATION-UPDATE.md documentation/migration/changelog.md

# Créer les fichiers de base manquants
echo "📝 Création des fichiers de base..."

# Getting Started
cat > documentation/development/getting-started.md << 'EOF'
# 🚀 Guide de Démarrage - Vision Picturale Community

## 📋 Prérequis

- **Node.js** 18+ 
- **npm** 8+
- **Git**

## ⚡ Installation Rapide

```bash
# 1. Cloner le projet
git clone [url-du-repo]
cd vision-picturale-community

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir avec vos vraies clés Firebase

# 4. Lancer le serveur de développement
npm run dev
```

## 🌐 URLs d'Accès

- **Core App** : http://localhost:5173/core-app/
- **Social App** : http://localhost:5173/social-app/

## 📱 Développement Mobile

```bash
# Build + Sync iOS
npm run mobile:ios

# Build + Sync Android  
npm run mobile:android
```

## 🔗 Liens Utiles

- [Architecture](../architecture/overview.md)
- [Tech Stack](../technical/tech-stack.md)
- [Configuration](../technical/configuration.md)
EOF

# Environment Variables Guide
cat > documentation/technical/environment.md << 'EOF'
# 🌍 Variables d'Environnement

## 📁 Fichiers de Configuration

- `.env.development` - Variables de développement
- `.env.production` - Variables de production  
- `.env.example` - Template à copier
- `.env.local` - Variables locales (ignoré par Git)

## 🔑 Variables Requises

```bash
VITE_APP_NAME=Vision Picturale Community
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

## 📝 Utilisation dans le Code

```typescript
// Accès aux variables Vite
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};
```
EOF

# Testing Guide
cat > documentation/development/testing.md << 'EOF'
# 🧪 Guide des Tests

## 🎯 Stratégie de Test

- **Tests Unitaires** : Jest + Testing Library
- **Tests E2E** : Playwright
- **Tests Mobile** : Capacitor + Playwright

## 🚀 Commandes

```bash
# Tous les tests
npm run test:all

# Tests unitaires uniquement
npm run test:unit

# Tests E2E uniquement  
npm run test:e2e

# Mode interactif
npm run test:ui
```

## 📁 Structure

```
tests/
├── unit/           # Tests unitaires
├── e2e/            # Tests end-to-end
├── __mocks__/      # Mocks partagés
└── setup.ts        # Configuration Jest
```
EOF

echo "✅ Migration terminée !"
echo "📚 Documentation centralisée disponible dans /documentation/"
echo "🔗 Consultez documentation/README.md pour naviguer"
