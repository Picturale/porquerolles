# 🎨 Vision Picturale Community

## 📖 Description

**Vision Picturale Community** est une application hybride moderne combinant :
- 🎯 **Application de Calibration** - Outils professionnels de calibration d'impression
- 🌐 **Plateforme Communautaire** - Partage et collaboration pour créateurs
- 📱 **Support Multi-plateforme** - Web, iOS, Android

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+
- **npm** 8+
- **Git**

### Installation
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

### URLs d'Accès
- **Core App** : http://localhost:5173/core-app/
- **Social App** : http://localhost:5173/social-app/

## 📁 Structure du Projet

```
vision-picturale-community/
├── 📁 src/                         # Code source
│   ├── 📁 core-app/                # Application de calibration (Vanilla JS)
│   ├── 📁 social-app/              # Application communautaire (React)
│   └── 📁 shared-ui/               # Design system partagé
├── 📁 dist/                        # Build généré par Vite
├── 📁 config/                      # Configuration centralisée
├── 📁 scripts/                     # Scripts utilitaires
├── 📁 documentation/               # Documentation complète
├── 📁 tests/                       # Tests unitaires et E2E
├── 📁 ios/                         # Configuration iOS (Capacitor)
├── 📁 android/                     # Configuration Android (Capacitor)
└── 📄 [fichiers de configuration]
```

## 🛠️ Scripts Disponibles

### Développement
```bash
npm run dev              # Serveur de développement
npm run dev:core         # Core app uniquement
npm run dev:social       # Social app uniquement
```

### Build et Tests
```bash
npm run build            # Build de production
npm run test:all         # Tous les tests
npm run test:unit        # Tests unitaires (Jest)
npm run test:e2e         # Tests E2E (Playwright)
```

### Quality et Maintenance
```bash
npm run lint             # Linting ESLint
npm run format           # Formatage Prettier
npm run typecheck        # Vérification TypeScript
npm run clean            # Nettoyage du projet
```

### Mobile
```bash
npm run mobile:build     # Build + sync mobile
npm run mobile:ios       # Ouvrir iOS dans Xcode
npm run mobile:android   # Ouvrir Android dans Android Studio
```

### Déploiement
```bash
npm run deploy           # Déploiement Firebase
npm run serve            # Preview du build
```

## 🏗️ Architecture

### Applications
- **Core App** (`src/core-app/`) - Calibration d'impression en Vanilla JavaScript
- **Social App** (`src/social-app/`) - Plateforme communautaire en React + TypeScript
- **Shared UI** (`src/shared-ui/`) - Design system et composants partagés

### Technologies
- **Frontend** : HTML5, CSS3, JavaScript ES2021, React 18, TypeScript
- **Build** : Vite 5.x avec configuration multi-entrée
- **Mobile** : Capacitor 7.x pour iOS et Android
- **Backend** : Firebase (Hosting, Firestore, Storage, Auth)
- **Tests** : Jest (unitaires) + Playwright (E2E)
- **Quality** : ESLint, Prettier, Husky, lint-staged

## 📚 Documentation

### Guides Essentiels
- **[Getting Started](documentation/development/getting-started.md)** - Guide de démarrage
- **[Architecture](documentation/architecture/overview.md)** - Vue d'ensemble technique
- **[Configuration](documentation/technical/configuration.md)** - Configuration des outils
- **[Testing](documentation/development/testing.md)** - Guide des tests

### Documentation Complète
Consultez le dossier **[`documentation/`](documentation/README.md)** pour :
- 🏗️ Architecture technique détaillée
- 👨‍💻 Guides de développement
- 🔧 Configuration des outils
- 📱 Configuration mobile
- 🚀 Guide de déploiement

## 🔧 Configuration

### Variables d'Environnement
Copiez `.env.example` vers `.env.local` et renseignez :
```bash
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### Firebase
Configuration dans `firebase.json` avec support multi-app :
- **Core App** : Route par défaut (`/`)
- **Social App** : Route `/social-app/`

## 🧪 Tests

### Tests Unitaires (Jest)
```bash
npm run test:unit
```
- Tests des composants React
- Tests des utilitaires JavaScript
- Mocking des APIs Canvas et Firebase

### Tests E2E (Playwright)
```bash
npm run test:e2e
```
- Tests multi-navigateurs (Chrome, Firefox, Safari)
- Tests mobile (iOS, Android)
- Tests d'intégration complets

## 📱 Développement Mobile

### iOS
```bash
npm run mobile:ios
# Ouvre Xcode avec le projet configuré
```

### Android
```bash
npm run mobile:android
# Ouvre Android Studio avec le projet configuré
```

## 🚀 Déploiement

### Firebase Hosting
```bash
npm run deploy
```
- Build automatique des deux applications
- Déploiement avec rewrites multi-app
- Configuration des headers de cache

### CI/CD
Pipeline GitHub Actions automatique :
- ✅ Linting et formatage
- ✅ Tests unitaires et E2E
- ✅ Build de production
- ✅ Déploiement automatique

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. **Pousser** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** et **Prettier** configurés avec hooks pre-commit
- **TypeScript** pour l'application sociale
- **Tests** requis pour toute nouvelle fonctionnalité
- **Documentation** mise à jour pour les changements d'API

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 🆘 Support

- **Documentation** : [`documentation/`](documentation/README.md)
- **Issues** : [GitHub Issues](../../issues)
- **Discussions** : [GitHub Discussions](../../discussions)

---

**🎨 Vision Picturale Community - Calibration d'Impression Professionnelle et Plateforme Communautaire**

*Projet maintenu avec ❤️ par l'équipe Vision Picturale*
