# Scripts de Build et Déploiement

## Vue d'ensemble

Le projet utilise un système de scripts NPM modernes avec Vite comme bundler pour automatiser les tâches de développement, build et déploiement multi-entrée (core-app et social-app).

## Scripts NPM Disponibles

### 🚀 Scripts de Développement

#### Serveur de Développement
```bash
npm run dev
# Commande: vite --port 5173
# Description: Lance le serveur de développement Vite
# URL: http://localhost:5173
# Fonctionnalités: Hot reload, multi-entrée (core-app + social-app)
```

#### Build de Production
```bash
npm run build
# Commande: vite build
# Description: Build de production pour core-app et social-app
# Sortie: dist/core-app/ et dist/social-app/
# Optimisations: Minification, tree-shaking, code-splitting
```

#### Preview du Build
```bash
npm run serve
# Commande: vite preview --port 4173
# Description: Serveur de preview du build de production
# URL: http://localhost:4173
# Usage: Test du build avant déploiement
```

#### Nettoyage
```bash
npm run clean
# Commande: ./scripts/cleanup.sh
# Description: Nettoie les dossiers temporaires et builds
# Actions: Supprime dist/, node_modules/.vite/, etc.
```

### 📱 Scripts Mobile iOS

#### Build Mobile
```bash
npm run mobile:build
# Commande: npm run build && npx cap sync
# Description: Build + synchronisation pour iOS et Android
# Actions: Build Vite → Copie vers Capacitor → Sync plugins
```

#### Copie des Assets
```bash
npm run copy-ios
# Commande: npx cap copy ios
# Description: Copie les fichiers web vers le projet iOS
# Dossier source: dist/
# Dossier cible: ios/App/App/public/
```

#### Synchronisation
```bash
npm run sync-ios
# Commande: npx cap sync ios
# Description: Synchronise le projet Capacitor iOS
# Actions: Copy + mise à jour des plugins + permissions
```

#### Ouverture Xcode
```bash
npm run open-ios
# Commande: npx cap open ios
# Description: Ouvre le projet iOS dans Xcode
# Prérequis: Xcode installé sur macOS
```

#### Build Complet iOS
```bash
npm run build-ios
# Commande: npx cap copy ios && npx cap sync ios && npx cap open ios
# Description: Processus complet de build iOS
# Étapes: 1. Copy → 2. Sync → 3. Open Xcode
```

#### Mode Développement iOS
```bash
npm run ios:dev
# Commande: npx cap run ios --live-reload --host 192.168.3.226 --port 8000
# Description: Mode développement avec live-reload
# Features: Rechargement automatique, debug
```

#### Synchronisation Rapide
```bash
npm run cap:sync
# Commande: npx cap sync ios
# Description: Alias pour sync-ios
```

### 🔥 Scripts Firebase

#### Déploiement Principal
```bash
npm run deploy
# Commande: firebase deploy
# Description: Déploie l'application sur Firebase Hosting
# Source: dist/
# Cible: Firebase Hosting
```

#### Serveur Firebase Local
```bash
npm run serve:firebase
# Commande: firebase serve
# Description: Test local avec l'environnement Firebase
# URL: http://localhost:5000
```

#### Émulateurs Firebase
```bash
npm run emulators
# Commande: firebase emulators:start
# Description: Lance tous les émulateurs Firebase
# Services: Auth, Firestore, Storage, Hosting
```

### 🧪 Scripts de Test

#### Tests Playwright
```bash
npm run test
# Commande: playwright test
# Description: Lance tous les tests end-to-end
```

```bash
npm run test:headed
# Commande: playwright test --headed
# Description: Tests avec interface graphique
```

```bash
npm run test:ui
# Commande: playwright test --ui
# Description: Interface de test interactive
```

```bash
npm run test:debug
# Commande: playwright test --debug
# Description: Mode debug pour les tests
```

```bash
npm run test:report
# Commande: playwright show-report
# Description: Affiche le rapport de tests
```

### 🛠️ Scripts de Qualité Code

#### Formatage
```bash
npm run format
# Commande: prettier --write public/public/js/curves-lib.js
# Description: Formate le code avec Prettier
# Cible: Fichiers JavaScript spécifiques
```

#### Linting
```bash
npm run lint
# Commande: eslint --fix public/public/js/curves-lib.js
# Description: Analyse et corrige le code avec ESLint
```

#### Refactoring avec JSCodeshift
```bash
npm run codemod
# Commande: jscodeshift -t codemods/splitSections.js public/public/js/curves-lib.js
# Description: Transformations automatiques de code
```

```bash
npm run refactor
# Commande: npm run codemod && npm run format && npm run lint
# Description: Pipeline complet de refactoring
```

### 🔧 Scripts Avancés

#### Optimisation iOS
```bash
npm run format:index
# Formatage spécifique iOS

npm run lint:index
# Linting iOS

npm run codemod:index
# Transformations iOS

npm run refactor:index
# Refactoring complet iOS

npm run full-optimize:index
# Optimisation complète iOS
```

## Scripts d'Automation Personnalisés

### 🚀 Script de Démarrage
```bash
./start.sh
# Description: Menu interactif de démarrage
# Options: dev server, iOS sync, Firebase deploy, vérifications
```

### 🧹 Script de Nettoyage
```bash
./clean-and-restore.sh
# Description: Nettoyage et restauration du projet
# Actions: Supprime temporaires, restaure backup
```

### 🔍 Script de Vérification
```bash
./verify-clean-project.sh
# Description: Vérification complète du projet
# Contrôles: Structure, configs, dépendances
```

## Pipelines CI/CD

### Structure Recommandée

#### GitHub Actions (`.github/workflows/`)
```yaml
# ci.yml - Intégration Continue
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

```yaml
# deploy.yml - Déploiement
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run deploy
```

### Pipeline Mobile

#### iOS Build
```yaml
# ios-build.yml
name: iOS Build
on: [push]
jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run sync-ios
      - run: xcodebuild -workspace ios/App/App.xcworkspace -scheme App
```

## Commandes de Déploiement

### Développement
```bash
# 1. Développement local
npm run dev

# 2. Test avec Firebase local
npm run serve:firebase

# 3. Test avec émulateurs
npm run emulators
```

### Staging
```bash
# 1. Build et test
npm run build
npm run test

# 2. Déploiement staging
firebase deploy --only hosting:staging
```

### Production
```bash
# 1. Vérifications finales
npm run lint
npm run test

# 2. Build mobile
npm run build-ios

# 3. Déploiement production
npm run deploy
```

## Configuration des Environnements

### Variables d'Environnement
```bash
# .env.development
NODE_ENV=development
FIREBASE_PROJECT=vision-picturale-dev
HOST=localhost
PORT=8000

# .env.production
NODE_ENV=production
FIREBASE_PROJECT=vision-picturale-prod
```

### Configuration Firebase par Environnement
```json
{
  "projects": {
    "default": "vision-picturale-prod",
    "staging": "vision-picturale-staging",
    "development": "vision-picturale-dev"
  }
}
```

## Monitoring et Logs

### Scripts de Monitoring
```bash
# Logs Firebase
firebase functions:log

# Status des services
firebase status

# Analytics
firebase analytics:events
```

### Debugging
```bash
# Debug iOS
npm run ios:dev

# Debug tests
npm run test:debug

# Debug Firebase
firebase emulators:start --inspect-functions
```

---

*Scripts documentés le 2 juillet 2025*
