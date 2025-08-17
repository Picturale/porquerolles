# Architecture du Projet Vision Picturale Community

## Vue d'ensemble

**Vision Picturale Community** est une application hybride moderne combinant une interface web de calibration d'impression et des fonctionnalités communautaires. Le projet utilise une architecture modulaire avec séparation claire entre le code source (`src/`) et les builds (`dist/`), Vite comme bundler, et Capacitor pour la compilation mobile.

## Philosophie Architecturale

### Séparation Source ↔ Build

Le projet suit une approche moderne de développement avec une séparation stricte :

- **`/src/`** - Tout le code source éditable (core-app, social-app, shared-ui)
- **`/dist/`** - Uniquement les builds générés par Vite (jamais édité manuellement)
- **`/config/`** - Fichiers de configuration centralisés (Firebase, Firestore, Storage)
- **`/scripts/`** - Scripts utilitaires et de build
- **`/docs/`** - Documentation de migration et rapports

### Modules Principaux

1. **Core Application** (`src/core-app/`) - Application de calibration d'impression
   - Technologies : Vanilla JavaScript, HTML5 Canvas, CSS3
   - Point d'entrée : `src/core-app/index.html`
   - Build vers : `dist/core-app/`
   - Interface de manipulation de canvas
   - Algorithmes de dithering et traitement d'image
   - Outils de mesure et calibration

2. **Social Application** (`src/social-app/`) - Application communautaire
   - Technologies : React 18, TypeScript, JSX
   - Point d'entrée : `src/social-app/index.html`
   - Build vers : `dist/social-app/`
   - Plateforme sociale pour créateurs
   - Partage de créations et interactions

3. **Shared UI** (`src/shared-ui/`) - Design system partagé
   - Design tokens CSS auto-générés (`design-tokens.css`)
   - Design tokens TypeScript (`design-tokens.ts`)
   - Composants UI réutilisables (`components.css`)
   - Système de couleurs et typographie unifié

4. **Infrastructure Mobile** (`ios/`, `android/`) - Compilation native
   - Intégration Capacitor pour iOS et Android
   - Configuration native spécifique aux plateformes
   - Point d'entrée sur `dist/` via webDir

5. **Backend Services** (configuration dans `/config/`) - Services cloud
   - Hébergement web avec rewrites multi-app
   - Base de données Firestore (règles dans `/config/firestore.rules`)
   - Stockage de fichiers (règles dans `/config/storage.rules`)
   - Index Firestore (`/config/firestore.indexes.json`)

## Architecture des Données

### Flux de Données Principal

```
Image Upload → Canvas Processing → Calibration → Results → Storage
     ↓              ↓                ↓           ↓         ↓
   File API → HTML5 Canvas → Algorithms → UI Display → Firebase
```

### Gestion d'État

- **Local State** : Variables JavaScript locales pour les interactions immédiates
- **Canvas State** : État du canvas HTML5 pour le rendu graphique
- **Persistent State** : Firebase Firestore pour les données utilisateur

## Stack Technique

### Frontend - Core App
- **HTML5** : Structure et sémantique
- **CSS3** : Styles avec responsive design
- **JavaScript ES6+** : Logique métier et interactions
- **Canvas API** : Rendu graphique et manipulation d'images

### Frontend - Social App
- **React 18** : Framework JavaScript moderne
- **TypeScript** : Typage statique et DX améliorée
- **JSX** : Syntax extension pour React
- **Vite** : Build tool rapide et moderne

### Build System
- **Vite 5.x** : Bundler moderne avec HMR
- **Multi-entry configuration** : Build séparé pour chaque app
- **ES Modules** : Support natif des modules JavaScript
- **Terser** : Minification des bundles
- **Source Maps** : Debug en développement

### Mobile
- **Capacitor 7.x** : Framework hybride
- **iOS Native** : Swift + UIKit
- **Android Native** : Kotlin + Android SDK

### Backend
- **Firebase Hosting** : Hébergement web avec rewrites
- **Firestore** : Base de données NoSQL
- **Firebase Storage** : Stockage de fichiers
- **Firebase Auth** : Authentification

### Outils de Développement
- **ESLint** : Linting JavaScript/TypeScript
- **Prettier** : Formatage de code
- **TypeScript** : Compilation et vérification de types
- **Playwright** : Tests end-to-end

## Points d'Entrée

### Application Web - Mode Développement
- **Core App** : `src/core-app/index.html` → http://localhost:8001/src/core-app/
- **Social App** : `src/social-app/index.html` → http://localhost:8001/src/social-app/
- **Accueil** : `build-index.html` → http://localhost:8001/

### Application Web - Mode Production
- **Core App** : `dist/src/core-app/index.html`
- **Social App** : `dist/src/social-app/index.html`
- **Accueil** : `dist/index.html` (redirection automatique)

### Application Mobile
- **iOS** : `ios/App/App/AppDelegate.swift`
- **Android** : `android/app/src/main/`
- **WebDir** : `dist/` (configuré dans capacitor.config.json)

## Modules Fonctionnels

### Core Canvas Engine
```javascript
// Localisation : dist/main.js
- Initialisation du canvas
- Gestion des événements utilisateur
- Algorithmes de traitement d'image
- Export et sauvegarde
```

### UI Components
```javascript
// Localisation : dist/info-tooltips-data.js
- Système de tooltips
- Interfaces utilisateur réactives
- Feedback visuel
```

### Configuration System
```javascript
// Localisation : dist/assets/config.js
- Paramètres de l'application
- Configuration des algorithmes
- Préférences utilisateur
```

## Système de Build & Déploiement

### Développement Local
```bash
npm run dev          # Serveur de développement Vite (port 8001)
npm run dev:core     # Focus sur core-app
npm run dev:social   # Focus sur social-app
```

### Build de Production
```bash
npm run tokens:generate  # Génération des design tokens CSS
npm run build           # Build complet (core + social + tokens + rapport)
npm run serve           # Preview du build de production
```

### Build Mobile
```bash
npm run mobile:build    # Build + copy vers Capacitor
npm run mobile:ios      # Build + ouverture Xcode
npm run mobile:android  # Build + ouverture Android Studio
```

### Déploiement Web
```bash
npm run deploy          # Déploiement Firebase complet
npm run deploy:web      # Firebase hosting seulement
npm run serve:firebase  # Test local Firebase
```

### Pipeline de Qualité
```bash
npm run format          # Formatage Prettier
npm run lint           # Linting ESLint
npm run typecheck      # Vérification TypeScript
npm run test           # Tests Playwright
```

## Gestion des Versions

### Versioning
- **Application** : 1.0.0 (package.json)
- **iOS** : CFBundleVersion dans Info.plist
- **Android** : versionCode/versionName dans build.gradle

### Branches de Développement
- **main** : Version stable de production
- **develop** : Intégration continue
- **feature/** : Nouvelles fonctionnalités

## Sécurité & Performance

### Sécurité
- Règles Firestore pour l'accès aux données
- Règles Storage pour les fichiers
- Validation côté client et serveur

### Performance
- Cache HTTP avec max-age
- Optimisation des assets
- Lazy loading des composants

### Monitoring
- Firebase Analytics (à configurer)
- Error reporting (à implémenter)
- Performance monitoring (à activer)

---

*Documentation générée automatiquement le 2 juillet 2025*
