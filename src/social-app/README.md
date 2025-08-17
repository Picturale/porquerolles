# Vision Picturale - Application Sociale

Cette application est la partie communauté/réseau social de Vision Picturale, permettant aux utilisateurs de partager et d'interagir autour de leurs images et créations photographiques.

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Configuration](#configuration)
  - [Prérequis](#prérequis)
  - [Configuration Firebase](#configuration-firebase)
  - [Variables d'environnement](#variables-denvironnement)
- [Installation et développement](#installation-et-développement)
  - [Développement local](#développement-local)
  - [Utilisation des émulateurs Firebase](#utilisation-des-émulateurs-firebase)
  - [Déploiement sur Firebase](#déploiement-sur-firebase)
- [Architecture de l'application](#architecture-de-lapplication)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Base de données](#base-de-données)
- [Fonctionnalités](#fonctionnalités)
- [Maintenance et évolution](#maintenance-et-évolution)

## 🚀 Technologies utilisées

- **Frontend** : 
  - React.js pour l'interface utilisateur
  - React Router pour la navigation
  - Firebase SDK pour l'intégration avec les services Firebase
  - Styled Components pour le styling
  
- **Backend** : 
  - Firebase Cloud Functions (Node.js/Express.js)
  - Firebase Authentication pour l'authentification des utilisateurs
  - Cloud Firestore pour la base de données NoSQL
  - Cloud Storage pour le stockage des images

## 📁 Structure du projet

```
src/social-app/
├── frontend/                # Application React
│   ├── components/          # Composants réutilisables
│   ├── contexts/            # Contextes React (AuthContext)
│   ├── hooks/               # Hooks personnalisés
│   ├── pages/               # Pages principales
│   ├── public/              # Ressources statiques
│   │   ├── assets/          # Images et ressources
│   │   └── manifest.json    # Manifest pour PWA
│   └── styles/              # Fichiers CSS
├── backend/                 # Functions Firebase
│   ├── routes/              # API routes
│   └── firebase.js          # Configuration Firebase Admin
├── firebase.config.js       # Configuration Firebase Client
├── firebase.json            # Configuration pour déploiement Firebase
└── index.html               # Point d'entrée HTML
```

## ⚙️ Configuration

### Prérequis

- Node.js (v14+)
- npm ou yarn
- Compte Firebase
- Firebase CLI (`npm install -g firebase-tools`)

### Configuration Firebase

1. Créez un projet dans la [console Firebase](https://console.firebase.google.com/)
2. Activez les services suivants :
   - Authentication (email/password)
   - Firestore Database
   - Storage
   - Functions
3. Installer Firebase CLI et se connecter :
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
4. Initialiser le projet avec Firebase :
   ```bash
   firebase init
   ```
   Sélectionnez les services Firestore, Functions, Hosting et Storage.

### Variables d'environnement

1. Copiez le fichier `.env.example` en `.env` :
   ```bash
   cp src/social-app/.env.example src/social-app/.env
   ```
2. Mettez à jour les variables avec vos propres valeurs Firebase.

## 🔧 Installation et développement

### Développement local

```bash
# Installation des dépendances frontend
cd src/social-app/frontend
npm install

# Installation des dépendances backend
cd ../backend
npm install

# Retourner à la racine du projet
cd ../../..

# Lancement de l'application frontend
npm run dev:social
```

### Utilisation des émulateurs Firebase

Les émulateurs Firebase vous permettent de développer et tester localement sans affecter votre environnement de production.

#### Option 1 : Environnement complet (recommandé)

Utilisez le script combiné qui lance les émulateurs et le serveur frontend en même temps :

```bash
# Démarrer l'environnement de développement complet
./scripts/dev-social-app.sh
# ou
npm run dev:social:full
```

#### Option 2 : Séparément

```bash
# Démarrer les émulateurs Firebase
./scripts/start-social-emulators.sh
# ou
npm run emulators:social

# Dans un autre terminal, lancez l'application frontend
npm run dev:social
```

L'application détectera automatiquement les émulateurs lorsqu'ils sont en cours d'exécution et s'y connectera.

### Déploiement sur Firebase

```bash
npm run deploy:social
```

Cette commande va :
1. Construire l'application frontend
2. Préparer les fichiers pour le déploiement
3. Déployer les Cloud Functions
4. Déployer l'application sur Firebase Hosting

## 🏛 Architecture de l'application

### Frontend

L'application frontend est structurée selon les principes de React avec des composants réutilisables et une gestion d'état à l'aide de Context API :

- **Pages** : Composants de niveau supérieur qui représentent des routes
- **Composants** : Éléments d'UI réutilisables
- **Contextes** : Pour la gestion d'état global (authentification, thème, etc.)
- **Hooks** : Logique réutilisable entre les composants

### Backend

Le backend utilise Firebase Cloud Functions avec Express.js pour créer une API RESTful :

- **Routes** : Définition des endpoints API
- **Middlewares** : Gestion de l'authentification et validation
- **Services** : Logique métier et interactions avec la base de données

### Base de données

La structure de la base de données Firestore est organisée comme suit :

- **users** : Informations des utilisateurs
- **posts** : Publications des utilisateurs
- **comments** : Commentaires sur les publications
- **likes** : Interactions avec les publications

## ✨ Fonctionnalités

- **Authentification utilisateur**
  - Inscription/connexion par email/mot de passe
  - Profils personnalisables
  
- **Gestion de contenu**
  - Publication d'images avec légendes
  - Feed personnalisé
  - Likes et commentaires
  
- **Interactions sociales**
  - Suivre d'autres utilisateurs
  - Explorer le contenu populaire
  
- **Profils utilisateurs**
  - Affichage des publications
  - Statistiques d'engagement
  - Bio et informations personnelles

## 🔄 Maintenance et évolution

### Mises à jour planifiées

- Notifications en temps réel
- Messagerie privée
- Fonctionnalités de découverte avancée
- Filtres et édition d'images

### Contribution au projet

1. Fork du projet
2. Création d'une branche pour la fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des changements (`git commit -m 'Ajout de nouvelle-fonctionnalite'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Création d'une Pull Request
